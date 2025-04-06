
import { useState } from 'react';
import { SalesDetail, useSalesDetails } from '@/hooks/useSalesDetails';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import SearchInput from '../SearchInput';
import { format } from 'date-fns';

interface SalesDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  transactionId: string | null;
}

const SalesDetailsDialog = ({ isOpen, onOpenChange, transactionId }: SalesDetailsDialogProps) => {
  const [detailsSearchQuery, setDetailsSearchQuery] = useState('');
  const { salesDetails, loading } = useSalesDetails(transactionId || '', detailsSearchQuery);

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Details for Order #{transactionId}</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <div className="mb-4">
            <SearchInput 
              placeholder="Search by product code or description" 
              value={detailsSearchQuery} 
              onChange={setDetailsSearchQuery} 
            />
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-sales-background text-sales-text">
                <TableRow>
                  <TableHead className="px-4 py-2">Product Code</TableHead>
                  <TableHead className="px-4 py-2">Description</TableHead>
                  <TableHead className="px-4 py-2">Unit</TableHead>
                  <TableHead className="px-4 py-2">Quantity</TableHead>
                  <TableHead className="px-4 py-2">Unit Price</TableHead>
                  <TableHead className="px-4 py-2">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">Loading details...</TableCell>
                  </TableRow>
                ) : salesDetails.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">No details found for this order</TableCell>
                  </TableRow>
                ) : (
                  <>
                    {salesDetails.map((detail, index) => {
                      const total = (detail.quantity || 0) * (detail.unit_price || 0);
                      
                      return (
                        <TableRow key={`${detail.transno}-${detail.prodcode}-${index}`} className="border-b">
                          <TableCell className="px-4 py-2">{detail.prodcode}</TableCell>
                          <TableCell className="px-4 py-2">{detail.product_description || '-'}</TableCell>
                          <TableCell className="px-4 py-2">{detail.product_unit || '-'}</TableCell>
                          <TableCell className="px-4 py-2">{detail.quantity || 0}</TableCell>
                          <TableCell className="px-4 py-2">{formatCurrency(detail.unit_price)}</TableCell>
                          <TableCell className="px-4 py-2">{formatCurrency(total)}</TableCell>
                        </TableRow>
                      );
                    })}
                    {salesDetails.length > 0 && (
                      <TableRow className="bg-gray-100 font-medium">
                        <TableCell colSpan={5} className="px-4 py-2 text-right">Order Total:</TableCell>
                        <TableCell className="px-4 py-2">
                          {formatCurrency(
                            salesDetails.reduce(
                              (sum, detail) => sum + ((detail.quantity || 0) * (detail.unit_price || 0)), 
                              0
                            )
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                    {/* Customer and Employee Info Section */}
                    {salesDetails.length > 0 && salesDetails[0].customer_name && (
                      <TableRow className="bg-sales-background bg-opacity-10">
                        <TableCell colSpan={3} className="px-4 py-2 font-medium">Customer:</TableCell>
                        <TableCell colSpan={3} className="px-4 py-2">{salesDetails[0].customer_name}</TableCell>
                      </TableRow>
                    )}
                    {salesDetails.length > 0 && salesDetails[0].employee_name && (
                      <TableRow className="bg-sales-background bg-opacity-10">
                        <TableCell colSpan={3} className="px-4 py-2 font-medium">Handled by:</TableCell>
                        <TableCell colSpan={3} className="px-4 py-2">{salesDetails[0].employee_name}</TableCell>
                      </TableRow>
                    )}
                  </>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SalesDetailsDialog;
