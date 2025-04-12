
import { X } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { FormValues } from './types';

interface ProductDetailRowProps {
  index: number;
  form: UseFormReturn<FormValues>;
  onRemove: (index: number) => void;
  onProductChange: (prodcode: string, index: number) => void;
}

export default function ProductDetailRow({ 
  index, 
  form, 
  onRemove, 
  onProductChange 
}: ProductDetailRowProps) {
  const { products, loading: loadingProducts } = useProducts();
  const details = form.getValues('details');

  return (
    <div className="grid grid-cols-12 gap-3 items-end border p-3 rounded-md">
      {/* Product */}
      <div className="col-span-5">
        <FormField
          control={form.control}
          name={`details.${index}.prodcode`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product</FormLabel>
              <Select
                onValueChange={(value) => onProductChange(value, index)}
                value={field.value}
                disabled={loadingProducts}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {products.map(product => (
                    <SelectItem key={product.prodcode} value={product.prodcode}>
                      {product.description || product.prodcode}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      {/* Quantity */}
      <div className="col-span-3">
        <FormField
          control={form.control}
          name={`details.${index}.quantity`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  {...field}
                  onChange={e => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      {/* Unit Price (display only) */}
      <div className="col-span-3">
        <FormField
          control={form.control}
          name={`details.${index}.unitprice`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unit Price</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  readOnly
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      {/* Remove button */}
      <div className="col-span-1">
        <Button
          type="button"
          variant="destructive"
          size="icon"
          onClick={() => onRemove(index)}
          disabled={details.length <= 1}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
