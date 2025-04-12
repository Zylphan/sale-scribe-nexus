
import { useState, useRef } from 'react';
import { useSalesDetails } from '@/hooks/useSalesDetails';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import SearchInput from '@/components/SearchInput';
import { Download } from 'lucide-react';
import { format } from 'date-fns';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface SalesReportDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  transactionId: string | null;
}

export default function SalesReportDialog({
  isOpen,
  onOpenChange,
  transactionId
}: SalesReportDialogProps) {
  const [detailsSearchQuery, setDetailsSearchQuery] = useState('');
  const { salesDetails, loading } = useSalesDetails(transactionId || '', detailsSearchQuery);
  const reportRef = useRef<HTMLDivElement>(null);

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const calculateTotal = () => {
    return salesDetails.reduce(
      (sum, detail) => sum + ((detail.quantity || 0) * (detail.unit_price || 0)), 
      0
    );
  };

  const handleDownloadPDF = async () => {
    if (reportRef.current) {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Calculate the width and height of the PDF
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = canvas.height * imgWidth / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`sale-report-${transactionId}.pdf`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Sale Report - #{transactionId}</DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <div className="mb-4">
            <SearchInput 
              placeholder="Search by product code or description" 
              value={detailsSearchQuery} 
              onChange={setDetailsSearchQuery} 
            />
          </div>

          <div ref={reportRef} className="p-6 bg-white">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-center">Sale Report</h2>
              <p className="text-center text-gray-500">Transaction #{transactionId}</p>
              {salesDetails.length > 0 && salesDetails[0].customer_name && (
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold">Customer:</p>
                    <p>{salesDetails[0].customer_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Handled by:</p>
                    <p>{salesDetails[0].employee_name || 'N/A'}</p>
                  </div>
                </div>
              )}
            </div>

            {loading ? (
              <div className="text-center py-4">Loading details...</div>
            ) : salesDetails.length === 0 ? (
              <div className="text-center py-4">No details found for this transaction</div>
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-left border">Product Code</th>
                    <th className="px-4 py-2 text-left border">Description</th>
                    <th className="px-4 py-2 text-left border">Unit</th>
                    <th className="px-4 py-2 text-right border">Quantity</th>
                    <th className="px-4 py-2 text-right border">Unit Price</th>
                    <th className="px-4 py-2 text-right border">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {salesDetails.map((detail, index) => {
                    const total = (detail.quantity || 0) * (detail.unit_price || 0);
                    
                    return (
                      <tr key={`${detail.transno}-${detail.prodcode}-${index}`}>
                        <td className="px-4 py-2 border">{detail.prodcode}</td>
                        <td className="px-4 py-2 border">{detail.product_description || '-'}</td>
                        <td className="px-4 py-2 border">{detail.product_unit || '-'}</td>
                        <td className="px-4 py-2 text-right border">{detail.quantity || 0}</td>
                        <td className="px-4 py-2 text-right border">{formatCurrency(detail.unit_price)}</td>
                        <td className="px-4 py-2 text-right border">{formatCurrency(total)}</td>
                      </tr>
                    );
                  })}
                  <tr className="bg-gray-100 font-medium">
                    <td colSpan={5} className="px-4 py-2 text-right border">Total:</td>
                    <td className="px-4 py-2 text-right border">{formatCurrency(calculateTotal())}</td>
                  </tr>
                </tbody>
              </table>
            )}

            <div className="mt-6 text-center text-sm text-gray-500">
              <p>Report generated on {format(new Date(), 'PPP')}</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline">Close</Button>
          <Button onClick={handleDownloadPDF} disabled={loading || salesDetails.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
