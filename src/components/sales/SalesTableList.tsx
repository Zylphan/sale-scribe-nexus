
import { format } from 'date-fns';
import { Sale } from '@/hooks/useSales';
import { 
  TableBody, 
  TableCell, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';

interface SalesTableListProps {
  sales: Sale[];
  loading: boolean;
  onViewDetails: (transno: string) => void;
  onEditSale?: (transno: string) => void;
  onDeleteSale?: (transno: string) => void;
}

const SalesTableList = ({ 
  sales, 
  loading, 
  onViewDetails,
  onEditSale,
  onDeleteSale
}: SalesTableListProps) => {
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
          <TableCell className="px-4 py-2 flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onViewDetails(sale.transno)}
              className="text-sales-secondary border-sales-secondary hover:bg-sales-secondary hover:text-white"
            >
              Show Details
            </Button>
            {onEditSale && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onEditSale(sale.transno)}
                className="text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white"
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            )}
            {onDeleteSale && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onDeleteSale(sale.transno)}
                className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            )}
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  );
};

export default SalesTableList;
