
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SearchInput from './SearchInput';
import { useSales } from '@/hooks/useSales';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { format } from 'date-fns';

const TableSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { sales, loading: salesLoading } = useSales(searchQuery);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'MMM dd, yyyy');
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">Loading sales...</TableCell>
                  </TableRow>
                ) : sales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">No sales found</TableCell>
                  </TableRow>
                ) : (
                  sales.map((sale) => (
                    <TableRow key={sale.transno} className="border-b">
                      <TableCell>{sale.transno}</TableCell>
                      <TableCell>{formatDate(sale.salesdate)}</TableCell>
                      <TableCell>{sale.custno || '-'}</TableCell>
                      <TableCell>{sale.empno || '-'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TableSearch;
