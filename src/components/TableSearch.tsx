
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SearchInput from './SearchInput';
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
import { Button } from './ui/button';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

const TableSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { sales, loading: salesLoading } = useSales(searchQuery);
  const [selectedSale, setSelectedSale] = useState<string | null>(null);
  const [detailsSearchQuery, setDetailsSearchQuery] = useState('');
  const { salesDetails, loading: detailsLoading } = useSalesDetails(selectedSale || '', detailsSearchQuery);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
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
    setDetailsSearchQuery(''); // Reset search when selecting a new sale
    setIsDetailsOpen(true);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold text-sales-text mb-4">Database Search</h2>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <SearchInput 
          placeholder="Search sales..." 
          value={searchQuery} 
          onChange={handleSearch}
        />
      </div>
      
      <div className="overflow-x-auto">
        <Tabs defaultValue="sales" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="sales">Sales</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sales">
            <Table>
              <TableHeader className="bg-sales-background text-sales-text">
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">Loading sales...</TableCell>
                  </TableRow>
                ) : sales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">No sales found</TableCell>
                  </TableRow>
                ) : (
                  sales.map((sale) => (
                    <TableRow key={sale.transno} className="border-b">
                      <TableCell>{sale.transno}</TableCell>
                      <TableCell>{formatDate(sale.salesdate)}</TableCell>
                      <TableCell>{sale.custno || '-'}</TableCell>
                      <TableCell>{sale.empno || '-'}</TableCell>
                      <TableCell>
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
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Details for Order #{selectedSale}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <div className="mb-4">
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
                    <TableHead>Product Code</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Total</TableHead>
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
                            <TableCell>{detail.prodcode}</TableCell>
                            <TableCell>{detail.product_description || '-'}</TableCell>
                            <TableCell>{detail.product_unit || '-'}</TableCell>
                            <TableCell>{detail.quantity || 0}</TableCell>
                            <TableCell>{formatCurrency(detail.unit_price)}</TableCell>
                            <TableCell>{formatCurrency(total)}</TableCell>
                          </TableRow>
                        );
                      })}
                      {salesDetails.length > 0 && (
                        <TableRow className="bg-gray-100 font-medium">
                          <TableCell colSpan={5} className="text-right">Order Total:</TableCell>
                          <TableCell>
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
                          <TableCell colSpan={3} className="font-medium">Customer:</TableCell>
                          <TableCell colSpan={3}>{salesDetails[0].customer_name}</TableCell>
                        </TableRow>
                      )}
                      {salesDetails.length > 0 && salesDetails[0].employee_name && (
                        <TableRow className="bg-sales-background bg-opacity-10">
                          <TableCell colSpan={3} className="font-medium">Handled by:</TableCell>
                          <TableCell colSpan={3}>{salesDetails[0].employee_name}</TableCell>
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
  );
};

export default TableSearch;
