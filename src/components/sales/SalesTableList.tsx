
import { format } from 'date-fns';
import { Sale } from '@/hooks/useSales';
import { 
  TableBody, 
  TableCell, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';

interface SalesTableListProps {
  sales: Sale[];
  loading: boolean;
  onViewDetails: (transno: string) => void;
}

const SalesTableList = ({ sales, loading, onViewDetails }: SalesTableListProps) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  if (loading) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={5} className="text-center py-4">Loading sales data...</TableCell>
        </TableRow>
      </TableBody>
    );
  }

  if (sales.length === 0) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={5} className="text-center py-4">No sales data available</TableCell>
        </TableRow>
      </TableBody>
    );
  }

  return (
    <TableBody>
      {sales.map((sale) => (
        <TableRow key={sale.transno} className="border-b">
          <TableCell className="px-4 py-2">{sale.transno}</TableCell>
          <TableCell className="px-4 py-2">{formatDate(sale.salesdate)}</TableCell>
          <TableCell className="px-4 py-2">{sale.custno || '-'}</TableCell>
          <TableCell className="px-4 py-2">{sale.empno || '-'}</TableCell>
          <TableCell className="px-4 py-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onViewDetails(sale.transno)}
              className="text-sales-secondary border-sales-secondary hover:bg-sales-secondary hover:text-white"
            >
              Show Details
            </Button>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  );
};

export default SalesTableList;
