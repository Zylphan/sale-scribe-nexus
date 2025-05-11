
import { useState, useEffect } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { supabase } from '@/integrations/supabase/client';
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
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
  const { products, loading } = useProducts(searchQuery);
  const [selectedProductName, setSelectedProductName] = useState('');
  
  // Always ensure products is a valid array
  const safeProducts = Array.isArray(products) ? products : [];
  
  // Update the selected product name when value changes or when products are loaded
  useEffect(() => {
    if (value && safeProducts.length > 0) {
      const product = safeProducts.find(p => p.prodcode === value);
      if (product) {
        setSelectedProductName(product.description || product.prodcode);
      }
    } else if (!value) {
      setSelectedProductName('');
    }
  }, [value, safeProducts]);

  // When we first load and have a value but no selectedProductName,
  // fetch the product details to display the name
  useEffect(() => {
    const fetchInitialProduct = async () => {
      if (value && !selectedProductName && !loading) {
        try {
          const { data, error } = await supabase
            .from('product')
            .select('*')
            .eq('prodcode', value)
            .single();

          if (!error && data) {
            setSelectedProductName(data.description || data.prodcode);
          }
        } catch (error) {
          console.error('Error fetching initial product:', error);
        }
      }
    };

    fetchInitialProduct();
  }, [value, selectedProductName, loading]);

  const handleSelect = (currentValue: string) => {
    // Guard against empty value
    if (!currentValue) return;
    
    // Find the product in the products array
    const product = safeProducts.find(p => p.prodcode === currentValue);
    
    if (product) {
      // Update the form value via onChange callback
      onChange(currentValue);
      // Update the display name
      setSelectedProductName(product.description || product.prodcode);
      // Close the popover
      setOpen(false);
    }
  };

  // Open the popover automatically when starting to type
  useEffect(() => {
    if (searchQuery && !open && !disabled) {
      setOpen(true);
    }
  }, [searchQuery, open, disabled]);

  return (
    <Popover 
      open={open} 
      onOpenChange={(isOpen) => {
        if (!disabled) {
          setOpen(isOpen);
          // When opening the popover manually, show all products
          if (isOpen && !searchQuery) {
            setSearchQuery(' '); // This triggers a search with all results
          }
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
            type="button"
            onClick={(e) => {
              e.preventDefault();
              if (!disabled) setOpen(!open);
            }}
          >
            {value && selectedProductName ? selectedProductName : "Search products..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </FormControl>
      </PopoverTrigger>
      {open && (
        <PopoverContent className="p-0 w-[300px]" align="start">
          <Command>
            <CommandInput 
              placeholder="Search products by name or code..." 
              value={searchQuery}
              onValueChange={(value) => {
                console.log("Search query changed:", value);
                setSearchQuery(value);
              }}
              autoFocus
            />
            <CommandList>
              {loading ? (
                <div className="p-2 text-center text-sm">Loading...</div>
              ) : (
                <>
                  {safeProducts.length === 0 ? (
                    <CommandEmpty>No products found.</CommandEmpty>
                  ) : (
                    <CommandGroup>
                      {safeProducts.map((product) => (
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
                          <span className="flex-1">
                            <span className="font-medium">{product.description || 'Unnamed Product'}</span>
                            <span className="ml-2 text-xs text-gray-500">({product.prodcode})</span>
                          </span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      )}
    </Popover>
  );
}
