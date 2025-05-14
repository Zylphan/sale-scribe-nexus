import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.29.0"; // Use the version compatible with your project

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the admin key to access auth and profiles tables
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing environment variables for Supabase client');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Get the request body
    const { userId, role } = await req.json();
    console.log('Received role update request:', { userId, role });

    if (!userId || !role) {
      console.error('Missing required fields:', { userId, role });
      return new Response(
        JSON.stringify({ error: 'Missing required fields: userId and role' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate role value
    const validRoles = ['admin', 'user', 'blocked']; // Ensure this matches your UserRole type
    if (!validRoles.includes(role)) {
      console.error('Invalid role value:', role);
      return new Response(
        JSON.stringify({ error: `Invalid role value. Must be one of: ${validRoles.join(', ')}` }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Check if the user exists in auth.users
    const { data: authUser, error: authUserError } = await supabase.auth.admin.getUserById(userId);

    if (authUserError || !authUser?.user) {
         console.error('Auth user not found:', authUserError);
         return new Response(
             JSON.stringify({ success: false, error: 'Auth user not found' }),
             {
                 status: 404,
                 headers: { ...corsHeaders, 'Content-Type': 'application/json' }
             }
         );
     }

    // // Check if profile exists in profiles table - Commenting out as per new strategy
    // const { data: existingProfile, error: fetchProfileError } = await supabase
    //   .from('profiles')
    //   .select('id, email, full_name') // Select minimal fields needed for potential insert
    //   .eq('id', userId)
    //   .single();

    // if (fetchProfileError && fetchProfileError.code !== 'PGRST116') { // PGRST116 means no row found
    //      console.error('Error fetching existing profile:', fetchProfileError);
    //      throw fetchProfileError; // Re-throw if it's an actual error, not just "not found"
    //  }

    // let updateOrInsertError = null;

    // if (existingProfile) {
    //   // Profile exists, update the role
    //   console.log('Profile found, attempting to update role...');
    //   try {
    //     const { error } = await supabase
    //       .from('profiles')
    //       .update({ role: role, last_sign_in: new Date().toISOString() }) // Also update last_sign_in on role change? Optional.
    //       .eq('id', userId);
    //     updateOrInsertError = error;
    //   } catch (error: any) {
    //     console.error('Exception during profile update:', error);
    //     updateOrInsertError = error; // Assign the caught exception as the error
    //   }

    // } else {
    //   // Profile does not exist, create a new one
    //   console.log('Profile not found, attempting to create new profile...');
    //   try {
    //     const { error } = await supabase
    //       .from('profiles')
    //       .insert([
    //         {
    //           id: userId,
    //           email: authUser.user.email, // Assuming you store email in profiles
    //           full_name: authUser.user.user_metadata?.full_name || null, // Assuming full_name is in user_metadata
    //           role: role,
    //           created_at: new Date().toISOString(), // Set creation time
    //           last_sign_in: new Date().toISOString(), // Set sign-in time
    //         }
    //       ]);
    //     updateOrInsertError = error;
    //   } catch (error: any) {
    //     console.error('Exception during profile insert:', error);
    //     updateOrInsertError = error; // Assign the caught exception as the error
    //   }
    // }

    // if (updateOrInsertError) {
    //     console.error('Database update/insert error:', updateOrInsertError);
    //     // Log error but continue to attempt auth user update
    // }

    // // Log success after profile update/insert - This log might be reached even if updateOrInsertError is true now.
    // if (!updateOrInsertError) {
    //     console.log('Profile table update/insert successful.');
    // }

    let bannedUsersError = null;

    if (role === 'blocked') {
      console.log(`Attempting to ban user ${userId} in banned_users table.`);
      // Insert or update banned_until date in banned_users table
      const { error } = await supabase
        .from('banned_users')
        .upsert(
          {
            user_id: userId,
            // Set banned_until to a future date (e.g., end of 2099) to indicate a ban
            banned_until: '2099-12-31T23:59:59Z', 
            // banned_at defaults to now()
          },
          { onConflict: 'user_id' } // Upsert based on user_id
        );
      bannedUsersError = error;
      if (bannedUsersError) {
        console.error('Error banning user in banned_users table:', bannedUsersError);
      } else {
        console.log(`User ${userId} banned successfully in banned_users table.`);
      }
    } else {
      console.log(`Attempting to unban user ${userId} from banned_users table.`);
      // Remove user from banned_users table
      const { error } = await supabase
        .from('banned_users')
        .delete()
        .eq('user_id', userId);
      bannedUsersError = error;
       if (bannedUsersError) {
        console.error('Error unbanning user from banned_users table:', bannedUsersError);
      } else {
        console.log(`User ${userId} unbanned successfully from banned_users table.`);
      }
    }

    // We still need to update the role in the profiles table for consistency
    let profileUpdateError = null;
    console.log(`Attempting to update role for user ${userId} in profiles table to ${role}`);
    const { error: updateProfileError } = await supabase
      .from('profiles')
      .update({ role: role })
      .eq('id', userId);
    profileUpdateError = updateProfileError;

    if (profileUpdateError) {
        console.error('Error updating role in profiles table:', profileUpdateError);
    } else {
        console.log('Role updated successfully in profiles table.');
    }

    // Determine overall success based on banned_users operation and profile update
    if (!bannedUsersError && !profileUpdateError) {
        console.log('Overall role and ban status update successful.');
        return new Response(
            JSON.stringify({ success: true }),
            { status: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        );
    } else {
        // If either update failed, return a failure response including both errors if they exist.
        let errorMessage = '';
        if (bannedUsersError) {
            errorMessage += `Banned users table update/delete failed: ${bannedUsersError.message}. `;
        }
        if (profileUpdateError) {
            errorMessage += `Profiles table role update failed: ${profileUpdateError.message}.`;
        }
        console.error('Overall update failed:', errorMessage);
        return new Response(
            JSON.stringify({ success: false, error: errorMessage.trim() }),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        );
    }

  } catch (error: any) {
    console.error('General Edge function execution error:', error);
    // Safely access error message
    const errorMessage = (error instanceof Error) ? error.message : (typeof error === 'object' && error !== null && 'message' in error) ? (error as any).message : 'An unexpected error occurred';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}); 