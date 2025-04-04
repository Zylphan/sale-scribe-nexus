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
        
        const { data: salesDetailsData, error: detailsError } = await supabase
          .from('salesdetail')
          .select('*')
          .eq('transno', transno);
        
        if (detailsError) {
          throw detailsError;
        }
        
        const { data: saleData, error: saleError } = await supabase
          .from('sales')
          .select('*')
          .eq('transno', transno)
          .single();
          
        if (saleError) {
          console.error("Error fetching sale:", saleError);
        }
        
        let customerData = null;
        if (saleData?.custno) {
          const { data: customer, error: customerError } = await supabase
            .from('customer')
            .select('*')
            .eq('custno', saleData.custno)
            .single();
            
          if (customerError) {
            console.error("Error fetching customer:", customerError);
          } else {
            customerData = customer;
          }
        }
        
        let employeeData = null;
        if (saleData?.empno) {
          const { data: employee, error: employeeError } = await supabase
            .from('employee')
            .select('*')
            .eq('empno', saleData.empno)
            .single();
            
          if (employeeError) {
            console.error("Error fetching employee:", employeeError);
          } else {
            employeeData = employee;
          }
        }
        
        const productDetails = new Map();
        const priceDetails = new Map();
        
        for (const detail of salesDetailsData) {
          if (!productDetails.has(detail.prodcode)) {
            const { data: product, error: productError } = await supabase
              .from('product')
              .select('*')
              .eq('prodcode', detail.prodcode)
              .single();
              
            if (productError) {
              console.error(`Error fetching product ${detail.prodcode}:`, productError);
            } else if (product) {
              productDetails.set(detail.prodcode, product);
            }
          }
          
          if (!priceDetails.has(detail.prodcode)) {
            const { data: prices, error: priceError } = await supabase
              .from('pricehist')
              .select('*')
              .eq('prodcode', detail.prodcode)
              .order('effdate', { ascending: false })
              .limit(1);
              
            if (priceError) {
              console.error(`Error fetching price for ${detail.prodcode}:`, priceError);
            } else if (prices && prices.length > 0) {
              priceDetails.set(detail.prodcode, prices[0]);
            }
          }
        }
        
        const processedDetails: SalesDetail[] = salesDetailsData.map((detail: any) => {
          const product = productDetails.get(detail.prodcode);
          const price = priceDetails.get(detail.prodcode);
          
          return {
            transno: detail.transno,
            prodcode: detail.prodcode,
            quantity: detail.quantity,
            product_description: product?.description || detail.prodcode,
            product_unit: product?.unit || null,
            unit_price: price?.unitprice || null,
            customer_name: customerData?.custname || saleData?.custno || null,
            employee_name: employeeData ? 
              `${employeeData.firstname || ''} ${employeeData.lastname || ''}`.trim() || 
              saleData?.empno || null
          }; // Added semicolon here to properly close the return statement
        });
        
        let filteredDetails = processedDetails;
        if (searchQuery) {
          filteredDetails = processedDetails.filter(detail => 
            detail.prodcode.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (detail.product_description && detail.product_description.toLowerCase().includes(searchQuery.toLowerCase()))
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
