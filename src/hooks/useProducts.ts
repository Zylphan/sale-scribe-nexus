
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
        
        // Show all products when the search field is empty or has just a space
        if (searchQuery && searchQuery.trim() !== '') {
          const trimmedQuery = searchQuery.trim();
          
          // Enhanced search pattern that prioritizes description (product name) matches
          query = query.or(
            `description.ilike.${trimmedQuery}%,` +      // Description starts with query (highest priority)
            `description.ilike.% ${trimmedQuery}%,` +    // Description has word starting with query
            `prodcode.ilike.${trimmedQuery}%,` +         // Product code starts with query
            `description.ilike.%${trimmedQuery}%,` +     // Description contains query anywhere
            `prodcode.ilike.%${trimmedQuery}%`           // Product code contains query anywhere
          );
        }
        
        const { data, error } = await query.limit(200);  // Increased limit for better search results
        
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

    // Use a shorter delay to make the autosuggest feel more responsive
    const timeoutId = setTimeout(() => {
      fetchProducts();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Always return a valid array, even if products is somehow undefined
  return { products: products || [], loading };
}
