
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
}

export function useSales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCustomersCount, setActiveCustomersCount] = useState<number>(0);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase.from('sales').select('*').order('salesdate', { ascending: false });
        
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
  }, []);

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
        
        let query = supabase.from('salesdetail').select('*').eq('transno', transno);
        
        if (searchQuery) {
          query = query.or(`prodcode.ilike.%${searchQuery}%`);
        }
        
        const { data, error } = await query;
        
        if (error) {
          throw error;
        }
        
        setSalesDetails(data || []);
      } catch (error: any) {
        toast.error(`Error fetching sales details: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchSalesDetails();
  }, [transno, searchQuery]);

  return { salesDetails, loading };
}
