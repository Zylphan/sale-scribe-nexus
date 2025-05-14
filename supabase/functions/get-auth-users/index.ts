import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.29.0";

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
    // Create a Supabase client with the admin key to access auth tables
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
    const validRoles = ['admin', 'user', 'blocked'];
    if (!validRoles.includes(role)) {
      console.error('Invalid role value:', role);
      return new Response(
        JSON.stringify({ error: Invalid role value. Must be one of: ${validRoles.join(', ')} }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // First update the profiles table
    console.log('Updating user profile...');
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId)
      .select()
      .single();
    
    if (profileError) {
      console.error('Error updating user profile:', profileError);
      return new Response(
        JSON.stringify({ error: profileError.message }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    console.log('Profile updated successfully:', profileData);

    // Then update the user's metadata in auth.users
    console.log('Updating user auth metadata...');
    const { data: authData, error: authError } = await supabase.auth.admin.updateUserById(
      userId,
      { 
        user_metadata: { role },
        app_metadata: { role } // Also update app_metadata for consistency
      }
    );
    
    if (authError) {
      // If auth update fails, try to revert the profile update
      console.error('Error updating user auth metadata:', authError);
      await supabase
        .from('profiles')
        .update({ role: profileData.role }) // Revert to previous role
        .eq('id', userId);
        
      return new Response(
        JSON.stringify({ error: authError.message }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    console.log('Auth metadata updated successfully:', authData);
    
    return new Response(
      JSON.stringify({ 
        success: true,
        data: {
          auth: authData,
          profile: profileData
        }
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (err) {
    console.error('Unexpected error:', err);
    return new Response(
      JSON.stringify({ error: 'Unexpected error occurred', details: err.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});