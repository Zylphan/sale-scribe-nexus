
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useUserCount() {
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase.auth.admin.listUsers();
        
        if (error) {
          console.error("Error fetching user count:", error.message);
          return;
        }
        
        // If we can't access admin functions, let's use a fallback count (1 for the current user)
        setCount(data?.users?.length || 1);
      } catch (error) {
        // Fallback to at least counting the current user
        setCount(1);
      } finally {
        setLoading(false);
      }
    };

    fetchUserCount();
  }, []);

  return { count, loading };
}
