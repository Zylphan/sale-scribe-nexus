
import { useState } from 'react';
import { useSales } from '@/hooks/useSales';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, FileText } from 'lucide-react';
import SalesReportDialog from './SalesReportDialog';
import { format } from 'date-fns';

export default function ReportsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const { sales, loading } = useSales(searchQuery);
  
  const [selectedSale, setSelectedSale] = useState<string | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
  };
  
  const handleGenerateReport = (transno: string) => {
    setSelectedSale(transno);
    setIsReportOpen(true);
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'PP');
    } catch (e) {
      return dateString;
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Sales Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2 mb-6">
            <Input
              placeholder="Search by transaction number..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
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
                    <TableCell colSpan={5} className="text-center py-8">Loading...</TableCell>
                  </TableRow>
                ) : sales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      {searchQuery ? "No results found" : "No transactions available"}
                    </TableCell>
                  </TableRow>
                ) : (
                  sales.map(sale => (
                    <TableRow key={sale.transno}>
                      <TableCell className="font-medium">{sale.transno}</TableCell>
                      <TableCell>{formatDate(sale.salesdate)}</TableCell>
                      <TableCell>{sale.custno || 'N/A'}</TableCell>
                      <TableCell>{sale.empno || 'N/A'}</TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleGenerateReport(sale.transno)}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Generate Report
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
      
      <SalesReportDialog
        isOpen={isReportOpen}
        onOpenChange={setIsReportOpen}
        transactionId={selectedSale}
      />
    </div>
  );
}
