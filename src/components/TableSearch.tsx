import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SearchInput from './SearchInput';
import { useSales, SortColumn, SortDirection } from '@/hooks/useSales';
import { useSalesOperations } from '@/hooks/useSalesOperations';
import { Table } from '@/components/ui/table';
import { toast } from 'sonner';
import SalesTableHeader from './sales/SalesTableHeader';
import SalesTableList from './sales/SalesTableList';
import SalesDetailsDialog from './sales/SalesDetailsDialog';
import SaleEditForm from './sales/SaleEditForm'; 
import AddSaleDialog from './sales/AddSaleDialog';
import { useCurrentUserPermissions } from '@/hooks/useUserPermissions';
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

const TableSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<SortColumn>('salesdate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  const { sales, loading } = useSales(searchQuery, sortColumn, sortDirection);
  const [selectedSale, setSelectedSale] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const { deleteSale } = useSalesOperations();
  const { permissions, loading: loadingPermissions } = useCurrentUserPermissions();

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

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
    // Check if user has edit permission
    if (permissions?.can_edit_sales) {
      setSelectedSale(transno);
      setIsEditOpen(true);
    } else {
      toast.error("You don't have permission to edit sales");
    }
  };

  const handleDeleteSale = (transno: string) => {
    // Check if user has delete permission
    if (permissions?.can_delete_sales) {
      setSelectedSale(transno);
      setIsDeleteAlertOpen(true);
    } else {
      toast.error("You don't have permission to delete sales");
    }
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
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold text-sales-text mb-4">Sales Search</h2>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <SearchInput 
          placeholder="Search by order ID, date, customer or employee..." 
          value={searchQuery} 
          onChange={handleSearch}
        />
        
        {/* Only show Add Sale button if user has create permission */}
        {permissions?.can_create_sales && (
          <AddSaleDialog onSaleAdded={handleRefreshSales} />
        )}
      </div>
      
      <div className="overflow-x-auto">
        <Tabs defaultValue="sales" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="sales">Sales</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sales">
            <Table>
              <SalesTableHeader 
                sortColumn={sortColumn} 
                sortDirection={sortDirection} 
                onSort={handleSort} 
              />
              <SalesTableList 
                sales={sales || []} 
                loading={loading} 
                onViewDetails={handleViewDetails}
                onEditSale={handleEditSale}
                onDeleteSale={handleDeleteSale}
                canEdit={permissions?.can_edit_sales || false}
                canDelete={permissions?.can_delete_sales || false}
              />
            </Table>
          </TabsContent>
        </Tabs>
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
  );
};

export default TableSearch;
