
import { useState, useEffect } from 'react';
import { useLatestPrice } from '@/hooks/useLatestPrice';
import { useSalesDetails } from '@/hooks/useSalesDetails';
import { useSalesOperations } from '@/hooks/useSalesOperations';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Import our new components
import FormHeader from './forms/FormHeader';
import OrderDetailsFields from './forms/OrderDetailsFields';
import ProductDetailsList from './forms/ProductDetailsList';
import FormFooter from './forms/FormFooter';
import { formSchema, FormValues } from './forms/types';

interface SaleEditFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  transactionId: string | null;
  onSaveSuccess: () => void;
}

export default function SaleEditForm({
  isOpen,
  onOpenChange,
  transactionId,
  onSaveSuccess
}: SaleEditFormProps) {
  const [selectedProductCode, setSelectedProductCode] = useState<string | null>(null);
  const { price: latestPrice } = useLatestPrice(selectedProductCode);
  const { updateFullSale, loading: savingData } = useSalesOperations();
  const { salesDetails, loading: loadingSalesDetails } = useSalesDetails(transactionId || '');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      transno: transactionId || '',
      salesdate: new Date(),
      custno: '',
      empno: '',
      details: [{ prodcode: '', quantity: 1, unitprice: 0 }]
    }
  });

  const details = form.watch('details');

  // Initialize form with existing data
  useEffect(() => {
    if (isOpen && salesDetails.length > 0 && transactionId) {
      const firstItem = salesDetails[0];
      
      // Get customer number
      const custno = firstItem.customer_name?.split(' ')[0] || '';
      
      // Format the form data
      const formData = {
        transno: transactionId,
        salesdate: firstItem.salesdate ? new Date(firstItem.salesdate) : new Date(),
        custno: custno,
        empno: firstItem.employee_name?.split(' ')[0] || '',
        details: salesDetails.map(detail => ({
          prodcode: detail.prodcode,
          quantity: detail.quantity || 1,
          unitprice: detail.unit_price || 0
        }))
      };
      
      form.reset(formData);
    }
  }, [isOpen, salesDetails, form, transactionId]);

  // Update unit price when product changes
  useEffect(() => {
    if (selectedProductCode && latestPrice !== null) {
      const currentIndex = details.findIndex(detail => detail.prodcode === selectedProductCode);
      if (currentIndex !== -1) {
        const updatedDetails = [...details];
        updatedDetails[currentIndex].unitprice = latestPrice;
        form.setValue('details', updatedDetails);
      }
    }
  }, [selectedProductCode, latestPrice, details, form]);

  const addProductDetail = () => {
    const currentDetails = form.getValues('details');
    form.setValue('details', [
      ...currentDetails,
      { prodcode: '', quantity: 1, unitprice: 0 }
    ]);
  };

  const removeProductDetail = (index: number) => {
    const currentDetails = form.getValues('details');
    if (currentDetails.length > 1) {
      form.setValue('details', currentDetails.filter((_, i) => i !== index));
    }
  };

  const handleProductChange = (prodcode: string, index: number) => {
    setSelectedProductCode(prodcode);
    const currentDetails = [...form.getValues('details')];
    currentDetails[index].prodcode = prodcode;
    form.setValue('details', currentDetails);
  };

  const onSubmit = async (data: FormValues) => {
    if (transactionId) {
      const { transno, ...saleData } = data;
      
      // Ensure all required fields are present in the details array
      const formattedDetails = data.details.map(detail => ({
        prodcode: detail.prodcode,
        quantity: detail.quantity
      }));
      
      const success = await updateFullSale(
        transactionId, 
        {
          salesdate: saleData.salesdate.toISOString(),
          custno: saleData.custno,
          empno: saleData.empno
        }, 
        formattedDetails
      );
      
      if (success) {
        onOpenChange(false);
        onSaveSuccess();
      }
    }
  };

  // Show loading state while fetching sales details
  if (loadingSalesDetails && isOpen) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <FormHeader transactionId={transactionId} />
          <div className="flex justify-center items-center p-10">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            <p className="ml-2">Loading sale details...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <FormHeader transactionId={transactionId} />
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <OrderDetailsFields form={form} />
            
            <ProductDetailsList 
              form={form} 
              onAddProduct={addProductDetail}
              onRemoveProduct={removeProductDetail}
              onProductChange={handleProductChange}
            />
            
            <FormFooter 
              onCancel={() => onOpenChange(false)} 
              isLoading={savingData} 
            />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
