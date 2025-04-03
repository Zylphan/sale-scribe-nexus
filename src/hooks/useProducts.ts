
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Product {
  prodcode: string;
  description: string;
  unit: string;
}

export function useProducts(searchQuery: string = '') {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        let query = supabase.from('product').select('*');
        
        if (searchQuery) {
          query = query.or(`prodcode.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,unit.ilike.%${searchQuery}%`);
        }
        
        const { data, error } = await query;
        
        if (error) {
          throw error;
        }
        
        setProducts(data || []);
      } catch (error: any) {
        toast.error(`Error fetching products: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchQuery]);

  return { products, loading };
}
