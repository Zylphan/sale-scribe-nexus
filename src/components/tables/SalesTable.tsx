
import { useState } from 'react';
import { useSales, SortColumn, SortDirection } from '@/hooks/useSales';
import { Table } from '@/components/ui/table';
import SalesTableHeader from '../sales/SalesTableHeader';
import SalesTableList from '../sales/SalesTableList';
import SalesDetailsDialog from '../sales/SalesDetailsDialog';

const SalesTable = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<SortColumn>('salesdate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  const { sales, loading } = useSales(searchQuery, sortColumn, sortDirection);
  const [selectedSale, setSelectedSale] = useState<string | null>(null);
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

  const handleViewDetails = (transno: string) => {
    setSelectedSale(transno);
    setIsDetailsOpen(true);
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
            />
          </Table>
        </div>

        <SalesDetailsDialog 
          isOpen={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
          transactionId={selectedSale}
        />
      </div>
    </div>
  );
};

export default SalesTable;
