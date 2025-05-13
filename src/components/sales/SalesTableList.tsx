
import { TableBody, TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Eye, Pen, Trash } from 'lucide-react';
import { Sale } from '@/hooks/types/sales';

interface SalesTableListProps {
  sales: Sale[];
  loading: boolean;
  onViewDetails: (transno: string) => void;
  onEditSale: (transno: string) => void;
  onDeleteSale: (transno: string) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

const SalesTableList = ({
  sales,
  loading,
  onViewDetails,
  onEditSale,
  onDeleteSale,
  canEdit = true,
  canDelete = true
}: SalesTableListProps) => {
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No date';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  if (loading) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={5} className="text-center py-10">
            Loading sales data...
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }
  
  if (sales.length === 0) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={5} className="text-center py-10">
            No sales found. Try adjusting your search criteria.
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }
  
  return (
    <TableBody>
      {sales.map((sale) => (
        <TableRow key={sale.transno}>
          <TableCell className="font-medium">{sale.transno}</TableCell>
          <TableCell>{formatDate(sale.salesdate)}</TableCell>
          <TableCell>{sale.custno || 'No customer'}</TableCell>
          <TableCell>{sale.empno || 'No employee'}</TableCell>
          <TableCell>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewDetails(sale.transno)}
              >
                <Eye className="h-4 w-4" />
                <span className="sr-only">View</span>
              </Button>
              
              {canEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditSale(sale.transno)}
                >
                  <Pen className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
              )}
              
              {canDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-500 hover:bg-red-50"
                  onClick={() => onDeleteSale(sale.transno)}
                >
                  <Trash className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              )}
            </div>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  );
};

export default SalesTableList;
