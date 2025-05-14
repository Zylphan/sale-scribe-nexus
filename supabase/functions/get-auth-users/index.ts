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
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get the request body
    const { userId, role } = await req.json();
    
    if (!userId || !role) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: userId and role' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Update the user's metadata in auth.users
    const { error: authError } = await supabase.auth.admin.updateUserById(
      userId,
      { user_metadata: { role } }
    );
    
    if (authError) {
      console.error('Error updating user auth metadata:', authError);
      return new Response(
        JSON.stringify({ error: authError.message }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Update the role in the profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId);
    
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
    
    return new Response(
      JSON.stringify({ success: true }),
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