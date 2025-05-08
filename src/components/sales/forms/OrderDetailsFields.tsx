
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useCustomers } from '@/hooks/useCustomers';
import { useEmployees } from '@/hooks/useEmployees';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
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
import { UseFormReturn } from 'react-hook-form';
import { FormValues } from './types';

interface OrderDetailsFieldsProps {
  form: UseFormReturn<FormValues>;
  hideTransactionId?: boolean;
}

export default function OrderDetailsFields({ form, hideTransactionId = false }: OrderDetailsFieldsProps) {
  const { customers, loading: loadingCustomers } = useCustomers();
  const { employees, loading: loadingEmployees } = useEmployees();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Transaction ID (read-only) - Only show if not hidden */}
      {!hideTransactionId && (
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
      )}
      
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
  );
}
