
import { TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Sale } from '@/hooks/types/sales';
import { format } from 'date-fns';
import { Eye, Pencil, Trash2 } from 'lucide-react';

interface SalesTableListProps {
  sales: Sale[];
  loading: boolean;
  onViewDetails: (transno: string) => void;
  onEditSale: (transno: string) => void;
  onDeleteSale: (transno: string) => void;
  canEdit: boolean;
  canDelete: boolean;
}

const SalesTableList = ({
  sales,
  loading,
  onViewDetails,
  onEditSale,
  onDeleteSale,
  canEdit,
  canDelete
}: SalesTableListProps) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      console.error('Invalid date format:', dateString, e);
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={5} className="text-center py-8">
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
          <TableCell colSpan={5} className="text-center py-8">
            No sales found
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
          <TableCell>{sale.customer?.custname || 'Unknown'}</TableCell>
          <TableCell>
            {sale.employee ? 
              `${sale.employee.firstname || ''} ${sale.employee.lastname || ''}`.trim() || 'Unknown' 
              : 'Unknown'}
          </TableCell>
          <TableCell className="text-right space-x-2">
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewDetails(sale.transno)}
                title="View Details"
              >
                <Eye className="h-4 w-4" />
              </Button>

              {canEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditSale(sale.transno)}
                  title="Edit Sale"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}

              {canDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-500 hover:bg-red-50"
                  onClick={() => onDeleteSale(sale.transno)}
                  title="Delete Sale"
                >
                  <Trash2 className="h-4 w-4" />
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
