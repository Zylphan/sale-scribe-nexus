
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
        
        // Create a more complex query with joins to get related information
        const query = `
          salesdetail(
            transno, prodcode, quantity,
            product:product(description, unit),
            pricehist:pricehist(unitprice)
          ),
          sales:sales(
            customer:customer(custname),
            employee:employee(firstname, lastname)
          )
        `;
        
        const { data: salesData, error: salesError } = await supabase
          .from('sales')
          .select(query)
          .eq('transno', transno)
          .single();
        
        if (salesError) {
          throw salesError;
        }
        
        // Process the nested data to create a flat structure for the UI
        const salesdetails = salesData?.salesdetail || [];
        const processedDetails: SalesDetail[] = salesdetails.map((detail: any) => {
          let detailWithRelated: SalesDetail = {
            transno: detail.transno,
            prodcode: detail.prodcode,
            quantity: detail.quantity,
            product_description: detail.product?.description || null,
            product_unit: detail.product?.unit || null,
            unit_price: detail.pricehist?.[0]?.unitprice || null,
          };
          
          // Add customer and employee information
          if (salesData?.sales) {
            detailWithRelated.customer_name = salesData.sales.customer?.custname || null;
            
            const firstName = salesData.sales.employee?.firstname || '';
            const lastName = salesData.sales.employee?.lastname || '';
            detailWithRelated.employee_name = firstName || lastName ? `${firstName} ${lastName}`.trim() : null;
          }
          
          return detailWithRelated;
        });
        
        // Filter by search query if provided
        let filteredDetails = processedDetails;
        if (searchQuery) {
          filteredDetails = processedDetails.filter(detail => 
            detail.prodcode.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (detail.product_description && 
             detail.product_description.toLowerCase().includes(searchQuery.toLowerCase()))
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
