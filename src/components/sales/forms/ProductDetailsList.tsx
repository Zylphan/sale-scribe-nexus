
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UseFormReturn } from 'react-hook-form';
import { FormValues } from './types';
import ProductDetailRow from './ProductDetailRow';

interface ProductDetailsListProps {
  form: UseFormReturn<FormValues>;
  onAddProduct: () => void;
  onRemoveProduct: (index: number) => void;
  onProductChange: (prodcode: string, index: number) => void;
}

export default function ProductDetailsList({ 
  form, 
  onAddProduct, 
  onRemoveProduct,
  onProductChange
}: ProductDetailsListProps) {
  const details = form.getValues('details');

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Products</h3>
        <Button 
          type="button" 
          variant="outline" 
          onClick={onAddProduct}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>
      
      {details.map((_, index) => (
        <ProductDetailRow
          key={index}
          index={index}
          form={form}
          onRemove={onRemoveProduct}
          onProductChange={onProductChange}
        />
      ))}
    </div>
  );
}
