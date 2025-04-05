
import { useState } from 'react';
import { Sale, useSales, SortColumn, SortDirection } from '@/hooks/useSales';
import { SalesDetail, useSalesDetails } from '@/hooks/useSalesDetails';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { format } from 'date-fns';
import { Button } from '../ui/button';
import SearchInput from '../SearchInput';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { ArrowUp, ArrowDown } from "lucide-react";

const SalesTable = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<SortColumn>('salesdate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  const { sales, loading } = useSales(searchQuery, sortColumn, sortDirection);
  const [selectedSale, setSelectedSale] = useState<string | null>(null);
  const [detailsSearchQuery, setDetailsSearchQuery] = useState('');
  const { salesDetails, loading: detailsLoading } = useSalesDetails(selectedSale || '', detailsSearchQuery);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

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

  // Helper function to render the sort icon
  const renderSortIcon = (column: SortColumn) => {
    if (column === sortColumn) {
      return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
    }
    return null;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleViewDetails = (transno: string) => {
    setSelectedSale(transno);
    setDetailsSearchQuery(''); // Reset search when toggling details
    setIsDetailsOpen(true);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-sales-text">Recent Sales</h2>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-sales-background text-sales-text">
              <TableRow>
                <TableHead 
                  onClick={() => handleSort('transno')} 
                  className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center gap-1">
                    Order ID {renderSortIcon('transno')}
                  </div>
                </TableHead>
                <TableHead 
                  onClick={() => handleSort('salesdate')} 
                  className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center gap-1">
                    Date {renderSortIcon('salesdate')}
                  </div>
                </TableHead>
                <TableHead 
                  onClick={() => handleSort('custno')} 
                  className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center gap-1">
                    Customer {renderSortIcon('custno')}
                  </div>
                </TableHead>
                <TableHead 
                  onClick={() => handleSort('empno')} 
                  className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center gap-1">
                    Employee {renderSortIcon('empno')}
                  </div>
                </TableHead>
                <TableHead className="px-4 py-2">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">Loading sales data...</TableCell>
                </TableRow>
              ) : sales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">No sales data available</TableCell>
                </TableRow>
              ) : (
                sales.map((sale) => (
                  <TableRow key={sale.transno} className="border-b">
                    <TableCell className="px-4 py-2">{sale.transno}</TableCell>
                    <TableCell className="px-4 py-2">{formatDate(sale.salesdate)}</TableCell>
                    <TableCell className="px-4 py-2">{sale.custno || '-'}</TableCell>
                    <TableCell className="px-4 py-2">{sale.empno || '-'}</TableCell>
                    <TableCell className="px-4 py-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleViewDetails(sale.transno)}
                        className="text-sales-secondary border-sales-secondary hover:bg-sales-secondary hover:text-white"
                      >
                        Show Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Details for Order #{selectedSale}</DialogTitle>
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
                    {detailsLoading ? (
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
      </div>
    </div>
  );
};

export default SalesTable;
