
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Sale } from './types/sales';

export type { Sale } from './types/sales';

export function useSales(searchQuery: string = '') {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCustomersCount, setActiveCustomersCount] = useState<number>(0);
  const [totalSales, setTotalSales] = useState<number>(0);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        setLoading(true);
        
        // First, get total count of sales regardless of search query
        const { count: totalCount, error: countError } = await supabase
          .from('sales')
          .select('*', { count: 'exact', head: true });
        
        if (countError) {
          console.error("Error counting sales:", countError);
        } else {
          setTotalSales(totalCount || 0);
        }
        
        // Then perform the search query
        let query = supabase.from('sales').select('*');
        
        if (searchQuery) {
          query = query.or(`
            transno.ilike.%${searchQuery}%,
            custno.ilike.%${searchQuery}%,
            empno.ilike.%${searchQuery}%,
            salesdate::text.ilike.%${searchQuery}%
          `);
        }
        
        const { data, error } = await query.order('salesdate', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        setSales(data || []);
      } catch (error: any) {
        toast.error(`Error fetching sales: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    // Track presence information
    const trackPresence = async () => {
      try {
        // Set up a realtime presence channel to track active users
        const channel = supabase.channel('online-users');
        
        // Generate a unique ID for this session
        const sessionId = Math.random().toString(36).substring(2, 15);
        
        await channel.subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            // Track this user's presence
            await channel.track({
              user_session: sessionId,
              online_at: new Date().toISOString(),
            });
          }
        });
        
        // Listen for presence changes
        channel.on('presence', { event: 'sync' }, () => {
          // Get the current state which includes all online users
          const state = channel.presenceState();
          // Count the number of unique sessions
          const userCount = Object.keys(state).length;
          setActiveCustomersCount(userCount);
        });
        
        // Return a cleanup function
        return () => {
          // Need to use a Promise here
          return channel.untrack().then(() => {
            supabase.removeChannel(channel);
          });
        };
      } catch (error) {
        console.error("Error setting up presence:", error);
        return () => {}; // Return empty cleanup function in case of error
      }
    };

    fetchSales();
    
    // Execute the trackPresence function and store its return value
    const cleanupPromise = trackPresence();
    
    return () => {
      // Handle the cleanup promise properly
      if (cleanupPromise) {
        cleanupPromise.then(cleanup => {
          if (cleanup) cleanup();
        }).catch(err => {
          console.error("Error during presence cleanup:", err);
        });
      }
    };
  }, [searchQuery]);

  return { sales, loading, activeCustomersCount, totalSales };
}
