
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SortColumn, SortDirection } from "@/hooks/useSales";
import { ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SalesTableHeaderProps {
  sortColumn: SortColumn;
  sortDirection: SortDirection;
  onSort: (column: SortColumn) => void;
}

const SalesTableHeader = ({
  sortColumn,
  sortDirection,
  onSort
}: SalesTableHeaderProps) => {
  const renderSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="ml-2 h-4 w-4 opacity-30" />;
    }
    
    return (
      <ArrowUpDown 
        className={cn(
          "ml-2 h-4 w-4",
          sortDirection === 'asc' ? "text-sales-primary" : "text-sales-primary rotate-180"
        )} 
      />
    );
  };

  const renderSortableHeader = (label: string, column: SortColumn) => (
    <div 
      className="flex items-center cursor-pointer hover:text-sales-primary"
      onClick={() => onSort(column)}
    >
      {label}
      {renderSortIcon(column)}
    </div>
  );

  return (
    <TableHeader>
      <TableRow>
        <TableHead>{renderSortableHeader("Order ID", "transno")}</TableHead>
        <TableHead>{renderSortableHeader("Date", "salesdate")}</TableHead>
        <TableHead>{renderSortableHeader("Customer Name", "custno")}</TableHead>
        <TableHead>{renderSortableHeader("Employee Name", "empno")}</TableHead>
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default SalesTableHeader;
