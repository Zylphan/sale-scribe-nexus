
import { SortColumn, SortDirection } from '@/hooks/useSales';
import { 
  TableHead, 
  TableHeader,
  TableRow 
} from '@/components/ui/table';
import { ArrowUp, ArrowDown } from "lucide-react";

interface SalesTableHeaderProps {
  sortColumn: SortColumn;
  sortDirection: SortDirection;
  onSort: (column: SortColumn) => void;
}

const SalesTableHeader = ({ sortColumn, sortDirection, onSort }: SalesTableHeaderProps) => {
  // Helper function to render the sort icon
  const renderSortIcon = (column: SortColumn) => {
    if (column === sortColumn) {
      return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
    }
    return null;
  };

  return (
    <TableHeader className="bg-sales-background text-sales-text">
      <TableRow>
        <TableHead 
          onClick={() => onSort('transno')} 
          className="px-4 py-2 cursor-pointer hover:bg-gray-100"
        >
          <div className="flex items-center gap-1">
            Order ID {renderSortIcon('transno')}
          </div>
        </TableHead>
        <TableHead 
          onClick={() => onSort('salesdate')} 
          className="px-4 py-2 cursor-pointer hover:bg-gray-100"
        >
          <div className="flex items-center gap-1">
            Date {renderSortIcon('salesdate')}
          </div>
        </TableHead>
        <TableHead 
          onClick={() => onSort('custno')} 
          className="px-4 py-2 cursor-pointer hover:bg-gray-100"
        >
          <div className="flex items-center gap-1">
            Customer {renderSortIcon('custno')}
          </div>
        </TableHead>
        <TableHead 
          onClick={() => onSort('empno')} 
          className="px-4 py-2 cursor-pointer hover:bg-gray-100"
        >
          <div className="flex items-center gap-1">
            Employee {renderSortIcon('empno')}
          </div>
        </TableHead>
        <TableHead className="px-4 py-2">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default SalesTableHeader;
