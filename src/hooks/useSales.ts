
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Sale } from './types/sales';

export type { Sale } from './types/sales';

export function useSales(searchQuery: string = '') {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCustomersCount, setActiveCustomersCount] = useState<number>(0);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        setLoading(true);
        
        let query = supabase.from('sales').select('*');
        
        if (searchQuery) {
          query = query.or(`transno.ilike.%${searchQuery}%,custno.ilike.%${searchQuery}%,empno.ilike.%${searchQuery}%`);
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

    const fetchActiveCustomers = async () => {
      try {
        const { data, error } = await supabase
          .from('sales')
          .select('custno', { count: 'exact', head: true })
          .not('custno', 'is', null);
        
        if (error) {
          throw error;
        }
        
        setActiveCustomersCount(data?.length || 0);
      } catch (error: any) {
        console.error("Error fetching active customers count:", error.message);
      }
    };

    fetchSales();
    fetchActiveCustomers();
  }, [searchQuery]);

  return { sales, loading, activeCustomersCount };
}
