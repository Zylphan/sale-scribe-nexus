
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
      
      // Generate a shorter transaction number to fit the 8-character limit
      const randomId = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
      const transno = `TR${randomId}`;
      
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
        transno,
        prodcode: detail.prodcode,
        quantity: detail.quantity
        // Remove unitprice field as it doesn't exist in salesdetail table
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

  const updateSale = async (transno: string, saleData: Partial<Sale>) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('sales')
        .update(saleData)
        .eq('transno', transno);
      
      if (error) throw error;
      
      toast.success('Sale updated successfully');
      return true;
    } catch (error: any) {
      toast.error(`Error updating sale: ${error.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateFullSale = async (
    transno: string, 
    saleData: Partial<Sale>, 
    details: Omit<SalesDetailItem, 'transno'>[]
  ) => {
    try {
      setLoading(true);
      
      // First update the sale header
      const { error: saleError } = await supabase
        .from('sales')
        .update(saleData)
        .eq('transno', transno);
      
      if (saleError) throw saleError;
      
      // Delete existing sale details
      const { error: deleteError } = await supabase
        .from('salesdetail')
        .delete()
        .eq('transno', transno);
      
      if (deleteError) throw deleteError;
      
      // Insert new sale details
      const detailsWithTransno = details.map(detail => ({
        transno,
        prodcode: detail.prodcode,
        quantity: detail.quantity
        // Remove unitprice field as it doesn't exist in salesdetail table
      }));
      
      const { error: detailsError } = await supabase
        .from('salesdetail')
        .insert(detailsWithTransno);
        
      if (detailsError) throw detailsError;
      
      toast.success('Sale updated successfully');
      return true;
    } catch (error: any) {
      toast.error(`Error updating sale: ${error.message}`);
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

  const deleteSale = async (transno: string) => {
    try {
      setLoading(true);
      
      // First delete all sale details
      const { error: detailsError } = await supabase
        .from('salesdetail')
        .delete()
        .eq('transno', transno);
      
      if (detailsError) throw detailsError;
      
      // Then delete the sale
      const { error: saleError } = await supabase
        .from('sales')
        .delete()
        .eq('transno', transno);
      
      if (saleError) throw saleError;
      
      toast.success('Sale deleted successfully');
      return true;
    } catch (error: any) {
      toast.error(`Error deleting sale: ${error.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    addSale,
    updateSale,
    updateSaleDetail,
    deleteSaleDetail,
    deleteSale,
    updateFullSale
  };
}
