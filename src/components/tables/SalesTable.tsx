
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

  const handleViewDetails = (transno: string) => {
    setSelectedSale(transno === selectedSale ? null : transno);
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
                <TableHead className="px-4 py-2">Customer</TableHead>
                <TableHead className="px-4 py-2">Date</TableHead>
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
                    <TableCell className="px-4 py-2">{sale.custno || '-'}</TableCell>
                    <TableCell className="px-4 py-2">{formatDate(sale.salesdate)}</TableCell>
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
                placeholder="Search by product code" 
                value={detailsSearchQuery} 
                onChange={setDetailsSearchQuery} 
              />
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-sales-background text-sales-text">
                  <TableRow>
                    <TableHead className="px-4 py-2">Product Code</TableHead>
                    <TableHead className="px-4 py-2">Quantity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detailsLoading ? (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center py-4">Loading details...</TableCell>
                    </TableRow>
                  ) : salesDetails.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center py-4">No details found for this order</TableCell>
                    </TableRow>
                  ) : (
                    salesDetails.map((detail, index) => (
                      <TableRow key={`${detail.transno}-${detail.prodcode}-${index}`} className="border-b">
                        <TableCell className="px-4 py-2">{detail.prodcode}</TableCell>
                        <TableCell className="px-4 py-2">{detail.quantity || 0}</TableCell>
                      </TableRow>
                    ))
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
