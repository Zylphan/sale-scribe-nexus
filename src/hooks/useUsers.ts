
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
        
        // Try to get actual user count from the auth.users table using admin APIs
        const { count: userCount, error } = await supabase
          .from('auth.users')
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          // If cannot access the admin API, fallback to a public function or endpoint
          // For now, show a console error and fallback to current user
          console.error("Error fetching auth users count:", error.message);
          
          // Check if the current user is authenticated
          const { data: session } = await supabase.auth.getSession();
          setCount(session?.session ? 1 : 0);
          return;
        }
        
        setCount(userCount || 0);
      } catch (error: any) {
        console.error("Error fetching user count:", error.message);
        toast.error(`Error fetching user count: ${error.message}`);
        
        // Fallback to at least counting the current user
        const { data: session } = await supabase.auth.getSession();
        setCount(session?.session ? 1 : 0);
      } finally {
        setLoading(false);
      }
    };

    fetchUserCount();
  }, []);

  return { count, loading };
}
