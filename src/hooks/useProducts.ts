
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
        console.log("Fetching products with search query:", searchQuery);
        
        let query = supabase.from('product').select('*');
        
        // Always use case-insensitive search with ilike
        if (searchQuery && searchQuery.trim() !== '') {
          // Use ilike for case-insensitive search across all relevant fields
          query = query.or(`prodcode.ilike.%${searchQuery.trim()}%,description.ilike.%${searchQuery.trim()}%,unit.ilike.%${searchQuery.trim()}%`);
        }
        
        const { data, error } = await query.limit(100);  // Increased limit for better search results
        
        if (error) {
          throw error;
        }
        
        console.log("Products fetched:", data ? data.length : 0);
        
        // Always ensure products is a valid array
        setProducts(data && Array.isArray(data) ? data : []);
      } catch (error: any) {
        console.error('Error fetching products:', error);
        toast.error(`Error fetching products: ${error.message}`);
        // Reset to empty array on error
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    // Add a slight delay to prevent too many requests while typing
    const timeoutId = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Always return a valid array, even if products is somehow undefined
  return { products: products || [], loading };
}
