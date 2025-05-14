import { useState } from 'react';
import { useSales } from '@/hooks/useSales';
import { Link } from 'react-router-dom';
import SearchInput from '@/components/SearchInput';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { SalesDetail, useSalesDetails } from '@/hooks/useSalesDetails';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useRef } from 'react';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { useAuth } from "@/contexts/AuthContext";
import AppHeader from '@/components/AppHeader';

const Reports = () => {
  const { signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [inputValue, setInputValue] = useState('');
  const { sales, loading } = useSales(searchQuery);
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);
  const { salesDetails } = useSalesDetails(selectedTransaction || '');
  const reportRef = useRef<HTMLDivElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(inputValue);
  };

  const handleViewReport = (transno: string) => {
    setSelectedTransaction(transno);
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const calculateTotal = (details: SalesDetail[]) => {
    return details.reduce(
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
      const imgHeight = canvas.height * imgWidth / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`sale-report-${selectedTransaction}.pdf`);
    }
  };

  return (
    <div className="min-h-screen bg-sales-background">
      <AppHeader />
      <main className="container mx-auto p-6">
        {!selectedTransaction ? (
          <Card>
            <CardHeader>
              <CardTitle>Sales Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="mb-6 flex gap-2">
                <SearchInput
                  placeholder="Search by transaction number..."
                  value={inputValue}
                  onChange={setInputValue}
                />
                <Button type="submit" className="bg-sales-secondary hover:bg-sales-primary text-white border border-white">Search</Button>
              </form>
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction #</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Employee</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">Loading...</TableCell>
                      </TableRow>
                    ) : sales.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          {searchQuery ? "No results found" : "No sales data available"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      sales.map((sale) => (
                        <TableRow key={sale.transno}>
                          <TableCell>{sale.transno}</TableCell>
                          <TableCell>{sale.salesdate ? format(new Date(sale.salesdate), 'PP') : 'N/A'}</TableCell>
                          <TableCell>{sale.custno || 'N/A'}</TableCell>
                          <TableCell>{sale.empno || 'N/A'}</TableCell>
                          <TableCell>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewReport(sale.transno)}
                              className="text-sales-primary border-sales-primary hover:bg-sales-primary hover:text-white"
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              View Report
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Sales Report - #{selectedTransaction}</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedTransaction(null)}
                    className="text-sales-primary border-sales-primary hover:bg-sales-primary hover:text-white"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to List
                  </Button>
                  <Button 
                    onClick={handleDownloadPDF}
                    disabled={salesDetails.length === 0}
                    className="bg-sales-secondary hover:bg-sales-primary text-white border border-white"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div ref={reportRef} className="p-4 bg-white">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-center">Sales Report</h2>
                  <p className="text-center text-gray-600">Transaction #{selectedTransaction}</p>
                  
                  {salesDetails.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <p className="font-semibold">Date:</p>
                        <p>{salesDetails[0].salesdate ? format(new Date(salesDetails[0].salesdate), 'PP') : 'N/A'}</p>
                      </div>
                      <div>
                        <p className="font-semibold">Customer:</p>
                        <p>{salesDetails[0].customer_name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="font-semibold">Handled by:</p>
                        <p>{salesDetails[0].employee_name || 'N/A'}</p>
                      </div>
                    </div>
                  )}
                </div>

                {salesDetails.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No details found for this transaction
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product Code</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {salesDetails.map((detail, index) => {
                        const total = (detail.quantity || 0) * (detail.unit_price || 0);
                        
                        return (
                          <TableRow key={`${detail.transno}-${detail.prodcode}-${index}`}>
                            <TableCell>{detail.prodcode}</TableCell>
                            <TableCell>{detail.product_description || '-'}</TableCell>
                            <TableCell>{detail.product_unit || '-'}</TableCell>
                            <TableCell>{detail.quantity || 0}</TableCell>
                            <TableCell>{formatCurrency(detail.unit_price)}</TableCell>
                            <TableCell>{formatCurrency(total)}</TableCell>
                          </TableRow>
                        );
                      })}
                      <TableRow className="bg-gray-100 font-medium">
                        <TableCell colSpan={5} className="text-right">Total:</TableCell>
                        <TableCell>{formatCurrency(calculateTotal(salesDetails))}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                )}
                
                <div className="mt-6 text-center text-sm text-gray-500">
                  <p>Report generated on {format(new Date(), 'PPP')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Reports;
