
import { useState } from 'react';
import { Sale, useSales, useSalesDetails } from '@/hooks/useSales';
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

const SalesTable = () => {
  const { sales, loading, activeCustomersCount } = useSales();
  const [selectedSale, setSelectedSale] = useState<string | null>(null);
  const [detailsSearchQuery, setDetailsSearchQuery] = useState('');
  const { salesDetails, loading: detailsLoading } = useSalesDetails(selectedSale || '', detailsSearchQuery);

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
    setSelectedSale(transno === selectedSale ? null : transno);
    setDetailsSearchQuery(''); // Reset search when toggling details
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-sales-text">Recent Sales</h2>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-sales-background text-sales-text">
              <TableRow>
                <TableHead className="px-4 py-2">Order ID</TableHead>
                <TableHead className="px-4 py-2">Date</TableHead>
                <TableHead className="px-4 py-2">Customer</TableHead>
                <TableHead className="px-4 py-2">Employee</TableHead>
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
                        {selectedSale === sale.transno ? 'Hide Details' : 'View Details'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {selectedSale && (
          <div className="p-4 bg-gray-50 border-t">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Details for Order #{selectedSale}</h3>
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
        )}
      </div>
    </div>
  );
};

export default SalesTable;
