
import { useState, useEffect } from 'react';
import { useLatestPrice } from '@/hooks/useLatestPrice';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Import our form components
import CreateSaleFormHeader from './CreateSaleFormHeader';
import OrderDetailsFields from './OrderDetailsFields';
import ProductDetailsList from './ProductDetailsList';
import FormFooter from './FormFooter';
import { formSchema, FormValues } from './types';

interface CreateSaleFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: FormValues) => void;
  loading: boolean;
}

export default function CreateSaleForm({
  isOpen,
  onOpenChange,
  onSubmit,
  loading
}: CreateSaleFormProps) {
  const [selectedProductCode, setSelectedProductCode] = useState<string | null>(null);
  const { price: latestPrice } = useLatestPrice(selectedProductCode);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      salesdate: new Date(),
      custno: '',
      empno: '',
      details: [
        { prodcode: '', quantity: 1 }
      ]
    }
  });

  const details = form.watch('details');

  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      form.reset();
    }
  }, [isOpen, form]);

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
      { prodcode: '', quantity: 1 }
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

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <CreateSaleFormHeader />
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <OrderDetailsFields form={form} hideTransactionId />
            
            <ProductDetailsList 
              form={form} 
              onAddProduct={addProductDetail}
              onRemoveProduct={removeProductDetail}
              onProductChange={handleProductChange}
            />
            
            <FormFooter 
              onCancel={() => onOpenChange(false)} 
              isLoading={loading} 
            />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
