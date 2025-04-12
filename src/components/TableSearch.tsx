
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SearchInput from './SearchInput';
import { useSales, SortColumn, SortDirection } from '@/hooks/useSales';
import { Table } from '@/components/ui/table';
import SalesTableHeader from './sales/SalesTableHeader';
import SalesTableList from './sales/SalesTableList';
import SalesDetailsDialog from './sales/SalesDetailsDialog';
import AddSaleDialog from './sales/AddSaleDialog';

const TableSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<SortColumn>('salesdate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  const { sales, loading } = useSales(searchQuery, sortColumn, sortDirection);
  const [selectedSale, setSelectedSale] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

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
        
        <AddSaleDialog onSaleAdded={handleRefreshSales} />
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
                sales={sales} 
                loading={loading} 
                onViewDetails={handleViewDetails} 
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
    </div>
  );
};

export default TableSearch;
