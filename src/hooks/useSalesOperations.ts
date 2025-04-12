
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Sale } from './types/sales';

interface SalesDetailItem {
  transno: string;
  prodcode: string;
  quantity: number;
}

export function useSalesOperations() {
  const [loading, setLoading] = useState(false);

  const addSale = async (sale: Omit<Sale, 'transno'>, details: Omit<SalesDetailItem, 'transno'>[]) => {
    try {
      setLoading(true);
      
      // Generate a transaction number based on current timestamp
      const timestamp = new Date().getTime();
      const transno = `TR${timestamp.toString().slice(-8)}`;
      
      // Insert the sale
      const { error: saleError } = await supabase
        .from('sales')
        .insert({
          transno,
          salesdate: sale.salesdate || new Date().toISOString(),
          custno: sale.custno,
          empno: sale.empno
        });
        
      if (saleError) throw saleError;
      
      // Insert all sale details
      const detailsWithTransno = details.map(detail => ({
        ...detail,
        transno
      }));
      
      const { error: detailsError } = await supabase
        .from('salesdetail')
        .insert(detailsWithTransno);
        
      if (detailsError) throw detailsError;
      
      toast.success('Sale created successfully');
      return transno;
    } catch (error: any) {
      toast.error(`Error creating sale: ${error.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateSaleDetail = async (detail: SalesDetailItem) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('salesdetail')
        .update({ quantity: detail.quantity })
        .eq('transno', detail.transno)
        .eq('prodcode', detail.prodcode);
      
      if (error) throw error;
      
      toast.success('Sale detail updated successfully');
      return true;
    } catch (error: any) {
      toast.error(`Error updating sale detail: ${error.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteSaleDetail = async (transno: string, prodcode: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('salesdetail')
        .delete()
        .eq('transno', transno)
        .eq('prodcode', prodcode);
      
      if (error) throw error;
      
      toast.success('Sale detail deleted successfully');
      return true;
    } catch (error: any) {
      toast.error(`Error deleting sale detail: ${error.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    addSale,
    updateSaleDetail,
    deleteSaleDetail
  };
}
