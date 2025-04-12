
import { useState } from 'react';
import { useSales, SortColumn, SortDirection } from '@/hooks/useSales';
import { useSalesOperations } from '@/hooks/useSalesOperations';
import { Table } from '@/components/ui/table';
import SalesTableHeader from '../sales/SalesTableHeader';
import SalesTableList from '../sales/SalesTableList';
import SalesDetailsDialog from '../sales/SalesDetailsDialog';
import SaleEditForm from '../sales/SaleEditForm';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const SalesTable = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<SortColumn>('salesdate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  const { sales, loading } = useSales(searchQuery, sortColumn, sortDirection);
  const [selectedSale, setSelectedSale] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const { deleteSale } = useSalesOperations();

  const handleSort = (column: SortColumn) => {
    if (column === sortColumn) {
      // Toggle the sort direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set the new sort column and default to ascending
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleViewDetails = (transno: string) => {
    setSelectedSale(transno);
    setIsDetailsOpen(true);
  };

  const handleEditSale = (transno: string) => {
    setSelectedSale(transno);
    setIsEditOpen(true);
  };

  const handleDeleteSale = (transno: string) => {
    setSelectedSale(transno);
    setIsDeleteAlertOpen(true);
  };

  const confirmDeleteSale = async () => {
    if (selectedSale) {
      const success = await deleteSale(selectedSale);
      if (success) {
        toast.success(`Sale ${selectedSale} deleted successfully`);
        handleRefreshSales();
      }
    }
    setIsDeleteAlertOpen(false);
  };

  const handleRefreshSales = () => {
    // Reloading the data will be handled by useSales hook automatically
    // Just need to trigger a re-render
    setSortColumn(sortColumn);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-sales-text">Recent Sales</h2>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <SalesTableHeader 
              sortColumn={sortColumn} 
              sortDirection={sortDirection} 
              onSort={handleSort} 
            />
            <SalesTableList 
              sales={sales} 
              loading={loading} 
              onViewDetails={handleViewDetails}
              onEditSale={handleEditSale}
              onDeleteSale={handleDeleteSale}
            />
          </Table>
        </div>

        <SalesDetailsDialog 
          isOpen={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
          transactionId={selectedSale}
          onRefresh={handleRefreshSales}
        />

        {selectedSale && (
          <SaleEditForm
            isOpen={isEditOpen}
            onOpenChange={setIsEditOpen}
            transactionId={selectedSale}
            onSaveSuccess={handleRefreshSales}
          />
        )}

        <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Sale</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete sale #{selectedSale}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteSale} className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default SalesTable;
