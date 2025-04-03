
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Customer {
  custno: string;
  custname: string;
  address: string;
  payterm: string;
}

export function useCustomers(searchQuery: string = '') {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        
        let query = supabase.from('customer').select('*');
        
        if (searchQuery) {
          query = query.or(`custno.ilike.%${searchQuery}%,custname.ilike.%${searchQuery}%,address.ilike.%${searchQuery}%`);
        }
        
        const { data, error } = await query;
        
        if (error) {
          throw error;
        }
        
        setCustomers(data || []);
      } catch (error: any) {
        toast.error(`Error fetching customers: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [searchQuery]);

  return { customers, loading };
}
