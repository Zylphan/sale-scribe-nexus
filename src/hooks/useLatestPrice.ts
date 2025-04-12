
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useLatestPrice(prodcode: string | null) {
  const [price, setPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLatestPrice = async () => {
      if (!prodcode) {
        setPrice(null);
        return;
      }
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('pricehist')
          .select('unitprice')
          .eq('prodcode', prodcode)
          .order('effdate', { ascending: false })
          .limit(1);
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          setPrice(data[0].unitprice);
        } else {
          setPrice(null);
        }
      } catch (error) {
        console.error('Error fetching latest price:', error);
        setPrice(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestPrice();
  }, [prodcode]);

  return { price, loading };
}
