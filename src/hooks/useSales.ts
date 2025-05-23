
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Sale } from './types/sales';

export type { Sale } from './types/sales';

export type SortDirection = 'asc' | 'desc';

export type SortColumn = 'transno' | 'salesdate' | 'custno' | 'empno';

export function useSales(searchQuery: string = '', sortColumn: SortColumn = 'salesdate', sortDirection: SortDirection = 'desc') {
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
          // Fixed search logic: use separate filter conditions instead of a complex OR statement
          query = query.or(
            `transno.ilike.%${searchQuery}%,custno.ilike.%${searchQuery}%,empno.ilike.%${searchQuery}%`
          );
          
          // The problem was here - we need a separate filter for dates
          if (searchQuery.match(/^\d{4}-\d{2}-\d{2}$/)) {
            // If searchQuery looks like a date in YYYY-MM-DD format
            query = query.or(`salesdate::text.eq.${searchQuery}`);
          } else if (searchQuery.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
            // If searchQuery looks like a date in MM/DD/YYYY format, we would need to convert
            // This is a simplified approach - you might need more robust date parsing
            query = query.or(`salesdate::text.ilike.%${searchQuery}%`);
          }
        }
        
        // Add sorting
        query = query.order(sortColumn, { ascending: sortDirection === 'asc' });
        
        const { data, error } = await query;
        
        if (error) {
          throw error;
        }
        
        setSales(data || []);
      } catch (error: any) {
        toast.error(`Error fetching sales: ${error.message}`);
        setSales([]); // Ensure sales is always an array even on error
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
          const presenceStates = Object.keys(state || {});
          setActiveCustomersCount(presenceStates.length);
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
        setActiveCustomersCount(0); // Ensure we always have a valid number here
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
  }, [searchQuery, sortColumn, sortDirection]);

  return { sales, loading, activeCustomersCount, totalSales };
}
