
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Loader2, X, Save, Plus } from 'lucide-react';
import { useCustomers } from '@/hooks/useCustomers';
import { useEmployees } from '@/hooks/useEmployees';
import { useProducts } from '@/hooks/useProducts';
import { useLatestPrice } from '@/hooks/useLatestPrice';
import { useSalesDetails } from '@/hooks/useSalesDetails';
import { useSalesOperations } from '@/hooks/useSalesOperations';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverTrigger,
  PopoverContent
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

interface SaleEditFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  transactionId: string | null;
  initialData?: any[];
  onSaveSuccess: () => void;
}

const formSchema = z.object({
  transno: z.string(),
  salesdate: z.date(),
  custno: z.string().min(1, { message: "Customer is required" }),
  empno: z.string().min(1, { message: "Employee is required" }),
  details: z.array(z.object({
    prodcode: z.string().min(1, { message: "Product is required" }),
    quantity: z.number().min(1, { message: "Quantity must be at least 1" }),
    unitprice: z.number().optional(),
  })).min(1, { message: "At least one product is required" })
});

type FormValues = z.infer<typeof formSchema>;

export default function SaleEditForm({
  isOpen,
  onOpenChange,
  transactionId,
  onSaveSuccess
}: SaleEditFormProps) {
  const { customers, loading: loadingCustomers } = useCustomers();
  const { employees, loading: loadingEmployees } = useEmployees();
  const { products, loading: loadingProducts } = useProducts();
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

  const details = form.watch('details');

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
          <DialogHeader>
            <DialogTitle>Edit Sale #{transactionId}</DialogTitle>
          </DialogHeader>
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
        <DialogHeader>
          <DialogTitle>Edit Sale #{transactionId}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Transaction ID (read-only) */}
              <FormField
                control={form.control}
                name="transno"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order ID</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly className="bg-gray-100" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Sales Date */}
              <FormField
                control={form.control}
                name="salesdate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Customer */}
              <FormField
                control={form.control}
                name="custno"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={loadingCustomers}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a customer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {customers.map(customer => (
                          <SelectItem key={customer.custno} value={customer.custno}>
                            {customer.custname || customer.custno}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Employee */}
              <FormField
                control={form.control}
                name="empno"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={loadingEmployees}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an employee" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {employees.map(employee => (
                          <SelectItem key={employee.empno} value={employee.empno}>
                            {`${employee.firstname || ''} ${employee.lastname || ''}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Products</h3>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={addProductDetail}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </Button>
              </div>
              
              {form.getValues('details').map((detail, index) => (
                <div key={index} className="grid grid-cols-12 gap-3 items-end border p-3 rounded-md">
                  {/* Product */}
                  <div className="col-span-5">
                    <FormField
                      control={form.control}
                      name={`details.${index}.prodcode`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product</FormLabel>
                          <Select
                            onValueChange={(value) => handleProductChange(value, index)}
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
                      onClick={() => removeProductDetail(index)}
                      disabled={form.getValues('details').length <= 1}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={savingData}>
                {savingData && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
