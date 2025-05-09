
import { useState, useEffect } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FormControl } from '@/components/ui/form';

interface ProductSearchSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function ProductSearchSelect({ value, onChange, disabled = false }: ProductSearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { products = [], loading } = useProducts(searchQuery); // Provide default empty array
  const [selectedProductName, setSelectedProductName] = useState('');

  // Update the selected product name when value or products change
  useEffect(() => {
    if (value && products && products.length > 0) {
      const product = products.find(p => p.prodcode === value);
      if (product) {
        setSelectedProductName(product.description || product.prodcode);
      }
    }
  }, [value, products]);

  const handleSelect = (productCode: string) => {
    if (!productCode) return; // Guard against empty value
    
    // Find the product in the products array
    const product = products.find(p => p.prodcode === productCode);
    
    if (product) {
      // Update the form value via onChange callback
      onChange(productCode);
      // Update the display name
      setSelectedProductName(product.description || product.prodcode);
      // Close the popover
      setOpen(false);
    }
  };

  return (
    <Popover 
      open={open} 
      onOpenChange={(isOpen) => {
        if (!disabled) {
          setOpen(isOpen);
        }
      }}
    >
      <PopoverTrigger asChild>
        <FormControl>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between",
              !value && "text-muted-foreground"
            )}
            disabled={disabled}
            type="button" // Prevent form submission
            onClick={() => !disabled && setOpen(!open)}
          >
            {value && selectedProductName ? selectedProductName : "Search products..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[300px]" align="start">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Search products..." 
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandEmpty>No products found.</CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-y-auto">
            {loading ? (
              <div className="p-2 text-center text-sm">Loading...</div>
            ) : (
              // Make sure products is always treated as an array
              products && products.map((product) => (
                <CommandItem
                  key={product.prodcode}
                  value={product.prodcode}
                  onSelect={handleSelect}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === product.prodcode ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {product.description || product.prodcode}
                  <span className="ml-2 text-xs text-gray-500">({product.prodcode})</span>
                </CommandItem>
              ))
            )}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
