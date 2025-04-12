
import { useState } from 'react';
import { useSalesOperations } from '@/hooks/useSalesOperations';
import SaleDetailForm from './SaleDetailForm';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

interface AddSaleDialogProps {
  onSaleAdded: () => void;
}

export default function AddSaleDialog({ onSaleAdded }: AddSaleDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { addSale, loading } = useSalesOperations();

  const handleSubmit = async (data: any) => {
    const { salesdate, custno, empno, details } = data;
    
    // Format date to ISO string if it's a Date object
    const formattedDate = salesdate instanceof Date 
      ? salesdate.toISOString() 
      : salesdate;
    
    const saleData = {
      salesdate: formattedDate,
      custno,
      empno
    };
    
    const result = await addSale(saleData, details);
    
    if (result) {
      setIsOpen(false);
      onSaleAdded();
      toast.success('Sale created successfully!');
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        <Plus className="mr-1 h-4 w-4" />
        New Sale
      </Button>
      
      <SaleDetailForm
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        onSubmit={handleSubmit}
        loading={loading}
      />
    </>
  );
}
