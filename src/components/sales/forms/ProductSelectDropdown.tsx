
import { useState, useEffect } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FormControl } from '@/components/ui/form';

interface ProductSelectDropdownProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function ProductSelectDropdown({ value, onChange, disabled = false }: ProductSelectDropdownProps) {
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
      // Close the dropdown
      setOpen(false);
      // Reset search query
      setSearchQuery('');
    }
  };

  // Show all products when opening the dropdown and no search query exists
  useEffect(() => {
    if (open && !searchQuery && !disabled) {
      setSearchQuery(' '); // This triggers a search with all results
    }
  }, [open, searchQuery, disabled]);

  // Format display text for product items
  const getProductDisplayText = (product: any) => {
    if (!product) return '';
    return product.description ? `${product.description} (${product.prodcode})` : product.prodcode;
  };
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
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
            onClick={(e) => {
              e.preventDefault();
              if (!disabled) setOpen(!open);
            }}
          >
            <span className="truncate">
              {value && selectedProductName ? selectedProductName : "Select a product..."}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </FormControl>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[350px] p-2" align="start">
        <div className="flex items-center border rounded-md mb-2 p-1">
          <Search className="h-4 w-4 mx-2 text-gray-500" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            autoFocus
          />
        </div>
        
        <DropdownMenuGroup className="max-h-[300px] overflow-y-auto">
          {loading ? (
            <div className="text-center p-2 text-sm text-gray-500">Loading products...</div>
          ) : safeProducts.length === 0 ? (
            <div className="text-center p-2 text-sm text-gray-500">No products found</div>
          ) : (
            safeProducts.map((product) => (
              <DropdownMenuItem
                key={product.prodcode}
                onSelect={() => handleSelect(product.prodcode)}
                className="cursor-pointer"
              >
                <div className="flex items-center w-full">
                  <Check className={cn(
                    "mr-2 h-4 w-4",
                    value === product.prodcode ? "opacity-100" : "opacity-0"
                  )}/>
                  <div className="flex flex-col truncate">
                    <span className="font-medium">{product.description || 'Unnamed Product'}</span>
                    <span className="text-xs text-gray-500">Code: {product.prodcode}</span>
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
