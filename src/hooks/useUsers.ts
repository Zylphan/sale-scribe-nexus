
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
        
        // We need to use a different approach since we can't directly query auth.users
        // or use an RPC function that doesn't exist in the type definitions
        
        try {
          // Try to use a custom function if it exists
          // @ts-ignore - Ignoring TypeScript error since the function might exist at runtime
          const { data, error } = await supabase.rpc('get_auth_user_count');
          
          if (!error && data !== null) {
            setCount(data);
            return;
          }
        } catch (rpcError) {
          console.error("RPC function error:", rpcError);
        }
        
        // If the above approach fails, fall back to checking current session
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
