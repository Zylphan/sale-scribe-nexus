
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
        
        if (searchQuery && searchQuery.trim() !== '') {
          query = query.or(`prodcode.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,unit.ilike.%${searchQuery}%`);
        }
        
        const { data, error } = await query.limit(50); // Add a limit to prevent large data fetches
        
        if (error) {
          throw error;
        }
        
        // Ensure products is always an array, even if data is null
        setProducts(Array.isArray(data) ? data : []);
      } catch (error: any) {
        console.error('Error fetching products:', error);
        toast.error(`Error fetching products: ${error.message}`);
        setProducts([]); // Ensure we always have an empty array, not undefined
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchQuery]);

  return { products, loading };
}
