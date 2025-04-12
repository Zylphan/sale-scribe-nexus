
import { useState } from 'react';
import { useSales } from '@/hooks/useSales';
import { useSalesOperations } from '@/hooks/useSalesOperations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, FileText, Edit, Trash2 } from 'lucide-react';
import SalesReportDialog from './SalesReportDialog';
import SaleEditForm from '../sales/SaleEditForm';
import { format } from 'date-fns';
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

export default function ReportsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const { sales, loading } = useSales(searchQuery);
  
  const [selectedSale, setSelectedSale] = useState<string | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const { deleteSale } = useSalesOperations();
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
  };
  
  const handleGenerateReport = (transno: string) => {
    setSelectedSale(transno);
    setIsReportOpen(true);
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
        // Refresh by re-applying the search
        setSearchQuery(searchInput);
      }
    }
    setIsDeleteAlertOpen(false);
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'PP');
    } catch (e) {
      return dateString;
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Sales Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2 mb-6">
            <Input
              placeholder="Search by transaction number..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </form>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">Loading...</TableCell>
                  </TableRow>
                ) : sales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      {searchQuery ? "No results found" : "No transactions available"}
                    </TableCell>
                  </TableRow>
                ) : (
                  sales.map(sale => (
                    <TableRow key={sale.transno}>
                      <TableCell className="font-medium">{sale.transno}</TableCell>
                      <TableCell>{formatDate(sale.salesdate)}</TableCell>
                      <TableCell>{sale.custno || 'N/A'}</TableCell>
                      <TableCell>{sale.empno || 'N/A'}</TableCell>
                      <TableCell className="space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleGenerateReport(sale.transno)}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Report
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditSale(sale.transno)}
                          className="text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteSale(sale.transno)}
                          className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <SalesReportDialog
        isOpen={isReportOpen}
        onOpenChange={setIsReportOpen}
        transactionId={selectedSale}
      />
      
      {selectedSale && (
        <SaleEditForm
          isOpen={isEditOpen}
          onOpenChange={setIsEditOpen}
          transactionId={selectedSale}
          onSaveSuccess={() => setSearchQuery(searchInput)}
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
}
