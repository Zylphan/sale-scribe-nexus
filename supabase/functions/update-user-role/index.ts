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


    // Check if profile exists in profiles table
    const { data: existingProfile, error: fetchProfileError } = await supabase
      .from('profiles')
      .select('id, email, full_name') // Select minimal fields needed for potential insert
      .eq('id', userId)
      .single();

    if (fetchProfileError && fetchProfileError.code !== 'PGRST116') { // PGRST116 means no row found
         console.error('Error fetching existing profile:', fetchProfileError);
         throw fetchProfileError; // Re-throw if it's an actual error, not just "not found"
     }

    let updateOrInsertError = null;

    if (existingProfile) {
      // Profile exists, update the role
      console.log('Profile found, updating role...');
      const { error } = await supabase
        .from('profiles')
        .update({ role: role, last_sign_in: new Date().toISOString() }) // Also update last_sign_in on role change? Optional.
        .eq('id', userId);
      updateOrInsertError = error;

    } else {
      // Profile does not exist, create a new one
      console.log('Profile not found, creating new profile...');
      // You might need to fetch email/full_name from authUser if you store them in profiles
      const { error } = await supabase
        .from('profiles')
        .insert([
          {
            id: userId,
            email: authUser.user.email, // Assuming you store email in profiles
            full_name: authUser.user.user_metadata?.full_name || null, // Assuming full_name is in user_metadata
            role: role,
            created_at: new Date().toISOString(), // Set creation time
            last_sign_in: new Date().toISOString(), // Set sign-in time
          }
        ]);
        updateOrInsertError = error;
    }

    if (updateOrInsertError) {
        console.error('Database update/insert error:', updateOrInsertError);
        return new Response(
            JSON.stringify({ success: false, error: updateOrInsertError.message }),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        );
    }

    console.log('Role update successful.');
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('Edge function execution error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'An unexpected error occurred' }),
      { status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}); 