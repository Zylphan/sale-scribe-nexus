
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PriceHistory {
  prodcode: string;
  effdate: string;
  unitprice: number;
}

export function usePriceHistory(searchQuery: string = '') {
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPriceHistory = async () => {
      try {
        setLoading(true);
        
        let query = supabase.from('pricehist').select('*');
        
        if (searchQuery) {
          query = query.or(`prodcode.ilike.%${searchQuery}%`);
        }
        
        const { data, error } = await query;
        
        if (error) {
          throw error;
        }
        
        setPriceHistory(data || []);
      } catch (error: any) {
        toast.error(`Error fetching price history: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchPriceHistory();
  }, [searchQuery]);

  return { priceHistory, loading };
}
