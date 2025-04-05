
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useUserCount() {
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        setLoading(true);
        
        // We can't directly query auth.users with the client
        // Instead, use the admin API or fetch the count through the auth API
        
        // Get count of authenticated users through admin API URL
        const { count: adminCount, error: adminError } = await supabase.rpc('get_auth_user_count');
        
        if (!adminError && adminCount !== null) {
          setCount(adminCount);
          return;
        }
        
        // If that fails, fall back to checking current session
        console.error("Could not get user count:", adminError?.message);
        console.log("Falling back to session check");
        
        // Check if the current user is authenticated
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // If we have a session, at least count the current user
          setCount(1);
        } else {
          setCount(0);
        }
      } catch (error: any) {
        console.error("Error fetching user count:", error.message);
        toast.error(`Error fetching user count: ${error.message}`);
        
        // Fallback to at least counting the current user
        const { data: { session } } = await supabase.auth.getSession();
        setCount(session ? 1 : 0);
      } finally {
        setLoading(false);
      }
    };

    fetchUserCount();
  }, []);

  return { count, loading };
}
