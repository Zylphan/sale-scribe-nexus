
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SearchInput from './SearchInput';
import { useCustomers, Customer } from '@/hooks/useCustomers';
import { useProducts, Product } from '@/hooks/useProducts';
import { usePriceHistory, PriceHistory } from '@/hooks/usePriceHistory'; 
import { useEmployees, Employee } from '@/hooks/useEmployees';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { format } from 'date-fns';

const TableSearch = () => {
  const [activeTab, setActiveTab] = useState('customers');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { customers, loading: customersLoading } = useCustomers(searchQuery);
  const { products, loading: productsLoading } = useProducts(searchQuery);
  const { priceHistory, loading: priceHistoryLoading } = usePriceHistory(searchQuery);
  const { employees, loading: employeesLoading } = useEmployees(searchQuery);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold text-sales-text mb-4">Database Search</h2>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <SearchInput 
          placeholder={`Search ${activeTab}...`} 
          value={searchQuery} 
          onChange={handleSearch}
        />
      </div>
      
      <div className="overflow-x-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="priceHistory">Price History</TabsTrigger>
            <TabsTrigger value="employees">Employees</TabsTrigger>
          </TabsList>
          
          <TabsContent value="customers">
            <Table>
              <TableHeader className="bg-sales-background text-sales-text">
                <TableRow>
                  <TableHead>Customer No.</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Payment Term</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customersLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">Loading customers...</TableCell>
                  </TableRow>
                ) : customers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">No customers found</TableCell>
                  </TableRow>
                ) : (
                  customers.map((customer: Customer) => (
                    <TableRow key={customer.custno} className="border-b">
                      <TableCell>{customer.custno}</TableCell>
                      <TableCell>{customer.custname || '-'}</TableCell>
                      <TableCell>{customer.address || '-'}</TableCell>
                      <TableCell>{customer.payterm || '-'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TabsContent>
          
          <TabsContent value="products">
            <Table>
              <TableHeader className="bg-sales-background text-sales-text">
                <TableRow>
                  <TableHead>Product Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Unit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productsLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4">Loading products...</TableCell>
                  </TableRow>
                ) : products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4">No products found</TableCell>
                  </TableRow>
                ) : (
                  products.map((product: Product) => (
                    <TableRow key={product.prodcode} className="border-b">
                      <TableCell>{product.prodcode}</TableCell>
                      <TableCell>{product.description || '-'}</TableCell>
                      <TableCell>{product.unit || '-'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TabsContent>
          
          <TabsContent value="priceHistory">
            <Table>
              <TableHeader className="bg-sales-background text-sales-text">
                <TableRow>
                  <TableHead>Product Code</TableHead>
                  <TableHead>Effective Date</TableHead>
                  <TableHead>Unit Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {priceHistoryLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4">Loading price history...</TableCell>
                  </TableRow>
                ) : priceHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4">No price history found</TableCell>
                  </TableRow>
                ) : (
                  priceHistory.map((price: PriceHistory, index) => (
                    <TableRow key={`${price.prodcode}-${price.effdate}-${index}`} className="border-b">
                      <TableCell>{price.prodcode}</TableCell>
                      <TableCell>{formatDate(price.effdate)}</TableCell>
                      <TableCell>{price.unitprice || '-'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TabsContent>
          
          <TabsContent value="employees">
            <Table>
              <TableHeader className="bg-sales-background text-sales-text">
                <TableRow>
                  <TableHead>Employee No.</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Birth Date</TableHead>
                  <TableHead>Hire Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employeesLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">Loading employees...</TableCell>
                  </TableRow>
                ) : employees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">No employees found</TableCell>
                  </TableRow>
                ) : (
                  employees.map((employee: Employee) => (
                    <TableRow key={employee.empno} className="border-b">
                      <TableCell>{employee.empno}</TableCell>
                      <TableCell>{`${employee.firstname || ''} ${employee.lastname || ''}`}</TableCell>
                      <TableCell>{employee.gender || '-'}</TableCell>
                      <TableCell>{formatDate(employee.birthdate)}</TableCell>
                      <TableCell>{formatDate(employee.hiredate)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TableSearch;
