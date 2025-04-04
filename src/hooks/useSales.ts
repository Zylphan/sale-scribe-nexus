
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Sale {
  transno: string;
  salesdate: string | null;
  custno: string | null;
  empno: string | null;
}

export interface SalesDetail {
  transno: string;
  prodcode: string;
  quantity: number | null;
  // Extended properties from joins
  product_description?: string | null;
  product_unit?: string | null;
  unit_price?: number | null;
  customer_name?: string | null;
  employee_name?: string | null;
}

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

export function useSalesDetails(transno: string, searchQuery: string = '') {
  const [salesDetails, setSalesDetails] = useState<SalesDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!transno) return;

    const fetchSalesDetails = async () => {
      try {
        setLoading(true);
        
        // Modified query to fetch just the sales details without joins to removed tables
        const { data: salesDetailsData, error: detailsError } = await supabase
          .from('salesdetail')
          .select('*')
          .eq('transno', transno);
        
        if (detailsError) {
          throw detailsError;
        }
        
        // Also fetch the sale record to get customer and employee info
        const { data: saleData, error: saleError } = await supabase
          .from('sales')
          .select('*')
          .eq('transno', transno)
          .single();
          
        if (saleError) {
          console.error("Error fetching sale:", saleError);
          // Continue even if we can't get sale data
        }
        
        // Process the data to create a structure similar to before
        const processedDetails: SalesDetail[] = salesDetailsData.map((detail: any) => {
          return {
            transno: detail.transno,
            prodcode: detail.prodcode,
            quantity: detail.quantity,
            // For these fields which came from the now-removed tables,
            // we'll just use the IDs from the sales table
            product_description: detail.prodcode, // Using product code as description
            product_unit: null,
            unit_price: null,
            customer_name: saleData?.custno || null,
            employee_name: saleData?.empno || null
          };
        });
        
        // Filter by search query if provided
        let filteredDetails = processedDetails;
        if (searchQuery) {
          filteredDetails = processedDetails.filter(detail => 
            detail.prodcode.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        
        setSalesDetails(filteredDetails);
      } catch (error: any) {
        toast.error(`Error fetching sales details: ${error.message}`);
        console.error("Error fetching sales details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSalesDetails();
  }, [transno, searchQuery]);

  return { salesDetails, loading };
}
