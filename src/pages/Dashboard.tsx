import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useSales } from "@/hooks/useSales";
import { useState, useEffect } from "react";
import TableSearch from "@/components/TableSearch";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Link } from "react-router-dom";
import { Users } from "lucide-react";
import AppHeader from '@/components/AppHeader';

const Dashboard = () => {
  const { signOut, user, isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const { activeCustomersCount, totalSales, loading: salesLoading } = useSales();

  useEffect(() => {
    console.log("Dashboard rendered, user:", user?.id);
    console.log("Active customers count:", activeCustomersCount);
    console.log("Total sales:", totalSales);
  }, [user, activeCustomersCount, totalSales]);

  return (
    <div className="min-h-screen bg-sales-background">
      <AppHeader />
      <main className="container mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-sales-text mb-4">Welcome to your Dashboard</h2>
          <p className="text-gray-600 mb-4">
            Manage your sales data and track performance from this centralized dashboard.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-sales-background rounded-lg p-4 border border-gray-200">
              <h3 className="font-bold text-sales-primary">Active Users</h3>
              <p className="text-3xl font-bold">
                {salesLoading ? 'Loading...' : activeCustomersCount}
              </p>
              <p className="text-sm text-gray-500">Users currently online</p>
            </div>
            <div className="bg-sales-background rounded-lg p-4 border border-gray-200">
              <h3 className="font-bold text-sales-primary">Total Sales</h3>
              <p className="text-3xl font-bold">
                {salesLoading ? 'Loading...' : totalSales}
              </p>
              <p className="text-sm text-gray-500">Number of sales orders</p>
            </div>
          </div>
          
          {isAdmin() && (
            <div className="mt-6">
              <Link to="/users">
                <Button className="bg-sales-primary hover:bg-sales-secondary text-white flex items-center gap-2">
                  <Users size={18} />
                  Manage Users
                </Button>
              </Link>
            </div>
          )}
        </div>
        
        <TableSearch />
      </main>
    </div>
  );
};

export default Dashboard;
