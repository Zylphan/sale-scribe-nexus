
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
        
        // Show all products when the search field is empty
        if (searchQuery && searchQuery.trim() !== '') {
          const trimmedQuery = searchQuery.trim();
          
          // Enhanced search pattern to prioritize matching at start of words
          // This improves autosuggest functionality and makes description (product name) searches more effective
          query = query.or(
            `description.ilike.${trimmedQuery}%,` +   // Description starts with query (highest priority)
            `prodcode.ilike.${trimmedQuery}%,` +      // Product code starts with query
            `description.ilike.% ${trimmedQuery}%,` + // Description has word starting with query
            `description.ilike.%${trimmedQuery}%,` +  // Description contains query anywhere
            `prodcode.ilike.%${trimmedQuery}%,` +     // Product code contains query anywhere
            `unit.ilike.%${trimmedQuery}%`            // Unit contains query
          );
        }
        
        const { data, error } = await query.limit(150);  // Increased limit for better search results
        
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

    // Add a shorter delay to make the autosuggest feel more responsive
    const timeoutId = setTimeout(() => {
      fetchProducts();
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Always return a valid array, even if products is somehow undefined
  return { products: products || [], loading };
}
