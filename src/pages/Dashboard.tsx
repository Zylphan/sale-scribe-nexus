
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useSales } from "@/hooks/useSales";
import { useUserCount } from "@/hooks/useUsers";
import { useState, useEffect } from "react";
import SalesTable from "@/components/tables/SalesTable";
import TableSearch from "@/components/TableSearch";

const Dashboard = () => {
  const { signOut, user } = useAuth();
  const { activeCustomersCount, loading: salesLoading } = useSales();
  const { count: userCount, loading: userCountLoading } = useUserCount();
  const [pendingOrders] = useState(0); // Placeholder, implement actual logic if needed

  useEffect(() => {
    console.log("Dashboard rendered, user:", user?.id);
    console.log("Active customers count:", activeCustomersCount);
    console.log("User count:", userCount);
  }, [user, activeCustomersCount, userCount]);

  return (
    <div className="min-h-screen bg-sales-background">
      <header className="bg-sales-primary text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Sales Management System</h1>
          <Button 
            variant="outline" 
            onClick={signOut}
            className="text-white border-white hover:bg-white hover:text-sales-primary"
          >
            Logout
          </Button>
        </div>
      </header>
      
      <main className="container mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-sales-text mb-4">Welcome to your Dashboard</h2>
          <p className="text-gray-600 mb-4">
            Manage your sales data and track performance from this centralized dashboard.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-sales-background rounded-lg p-4 border border-gray-200">
              <h3 className="font-bold text-sales-primary">Total Sales</h3>
              <p className="text-3xl font-bold">
                {salesLoading ? 'Loading...' : 100}
              </p>
            </div>
            <div className="bg-sales-background rounded-lg p-4 border border-gray-200">
              <h3 className="font-bold text-sales-primary">Active Customers</h3>
              <p className="text-3xl font-bold">
                {salesLoading ? 'Loading...' : activeCustomersCount}
              </p>
            </div>
            <div className="bg-sales-background rounded-lg p-4 border border-gray-200">
              <h3 className="font-bold text-sales-primary">System Users</h3>
              <p className="text-3xl font-bold">
                {userCountLoading ? 'Loading...' : userCount}
              </p>
            </div>
          </div>
        </div>
        
        <TableSearch />
        
        <SalesTable />
      </main>
    </div>
  );
};

export default Dashboard;
