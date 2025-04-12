
import { useState } from 'react';
import { SalesDetail, useSalesDetails } from '@/hooks/useSalesDetails';
import { useSalesOperations } from '@/hooks/useSalesOperations';
import { useLatestPrice } from '@/hooks/useLatestPrice';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import SearchInput from '../SearchInput';
import { FileText, Trash2, Save, Plus, Edit, Download } from 'lucide-react';
import SalesReportDialog from '../reports/SalesReportDialog';

interface SalesDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  transactionId: string | null;
  onRefresh?: () => void;
}

const SalesDetailsDialog = ({ 
  isOpen, 
  onOpenChange, 
  transactionId,
  onRefresh 
}: SalesDetailsDialogProps) => {
  const [detailsSearchQuery, setDetailsSearchQuery] = useState('');
  const { salesDetails, loading } = useSalesDetails(transactionId || '', detailsSearchQuery);
  const { updateSaleDetail, deleteSaleDetail, loading: operationLoading } = useSalesOperations();
  
  const [editingDetail, setEditingDetail] = useState<{ index: number, quantity: number } | null>(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleEditClick = (index: number, quantity: number) => {
    setEditingDetail({ index, quantity });
  };

  const handleSaveEdit = async (detail: SalesDetail, index: number) => {
    if (editingDetail && detail.transno) {
      const success = await updateSaleDetail({
        transno: detail.transno,
        prodcode: detail.prodcode,
        quantity: editingDetail.quantity
      });
      
      if (success && onRefresh) {
        onRefresh();
      }
      setEditingDetail(null);
    }
  };

  const handleDelete = async (detail: SalesDetail) => {
    if (detail.transno && window.confirm(`Are you sure you want to delete ${detail.product_description || detail.prodcode}?`)) {
      const success = await deleteSaleDetail(detail.transno, detail.prodcode);
      if (success && onRefresh) {
        onRefresh();
      }
    }
  };

  const handleOpenReport = () => {
    setReportDialogOpen(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Details for Order #{transactionId}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <div className="flex justify-between items-center mb-4">
              <SearchInput 
                placeholder="Search by product code or description" 
                value={detailsSearchQuery} 
                onChange={setDetailsSearchQuery} 
              />
              
              <Button variant="outline" onClick={handleOpenReport}>
                <FileText className="mr-2 h-4 w-4" />
                Generate Report
              </Button>
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
                    <TableHead className="px-4 py-2">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">Loading details...</TableCell>
                    </TableRow>
                  ) : salesDetails.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">No details found for this order</TableCell>
                    </TableRow>
                  ) : (
                    <>
                      {salesDetails.map((detail, index) => {
                        const total = (detail.quantity || 0) * (detail.unit_price || 0);
                        const isEditing = editingDetail?.index === index;
                        
                        return (
                          <TableRow key={`${detail.transno}-${detail.prodcode}-${index}`} className="border-b">
                            <TableCell className="px-4 py-2">{detail.prodcode}</TableCell>
                            <TableCell className="px-4 py-2">{detail.product_description || '-'}</TableCell>
                            <TableCell className="px-4 py-2">{detail.product_unit || '-'}</TableCell>
                            <TableCell className="px-4 py-2">
                              {isEditing ? (
                                <Input 
                                  type="number"
                                  min="1"
                                  className="w-20"
                                  value={editingDetail.quantity}
                                  onChange={(e) => setEditingDetail({
                                    ...editingDetail,
                                    quantity: parseInt(e.target.value) || 0
                                  })}
                                />
                              ) : (
                                detail.quantity || 0
                              )}
                            </TableCell>
                            <TableCell className="px-4 py-2">{formatCurrency(detail.unit_price)}</TableCell>
                            <TableCell className="px-4 py-2">{formatCurrency(total)}</TableCell>
                            <TableCell className="px-4 py-2">
                              <div className="flex space-x-2">
                                {isEditing ? (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleSaveEdit(detail, index)}
                                    disabled={operationLoading}
                                  >
                                    <Save className="h-4 w-4" />
                                  </Button>
                                ) : (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleEditClick(index, detail.quantity || 0)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => handleDelete(detail)}
                                  disabled={operationLoading}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
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
                          <TableCell></TableCell>
                        </TableRow>
                      )}
                      {salesDetails.length > 0 && salesDetails[0].customer_name && (
                        <TableRow className="bg-sales-background bg-opacity-10">
                          <TableCell colSpan={3} className="px-4 py-2 font-medium">Customer:</TableCell>
                          <TableCell colSpan={4} className="px-4 py-2">{salesDetails[0].customer_name}</TableCell>
                        </TableRow>
                      )}
                      {salesDetails.length > 0 && salesDetails[0].employee_name && (
                        <TableRow className="bg-sales-background bg-opacity-10">
                          <TableCell colSpan={3} className="px-4 py-2 font-medium">Handled by:</TableCell>
                          <TableCell colSpan={4} className="px-4 py-2">{salesDetails[0].employee_name}</TableCell>
                        </TableRow>
                      )}
                    </>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SalesReportDialog
        isOpen={reportDialogOpen}
        onOpenChange={setReportDialogOpen}
        transactionId={transactionId}
      />
    </>
  );
};

export default SalesDetailsDialog;
