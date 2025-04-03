
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  // This will be replaced with Supabase auth
  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-sales-background">
      <header className="bg-sales-primary text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Sales Management System</h1>
          <Button 
            variant="outline" 
            onClick={handleLogout}
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
            This is a placeholder for the Sales Management Dashboard. 
            Once connected to Supabase, we'll implement the full sales table and details functionality.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-sales-background rounded-lg p-4 border border-gray-200">
              <h3 className="font-bold text-sales-primary">Total Sales</h3>
              <p className="text-3xl font-bold">$0</p>
            </div>
            <div className="bg-sales-background rounded-lg p-4 border border-gray-200">
              <h3 className="font-bold text-sales-primary">Active Customers</h3>
              <p className="text-3xl font-bold">0</p>
            </div>
            <div className="bg-sales-background rounded-lg p-4 border border-gray-200">
              <h3 className="font-bold text-sales-primary">Pending Orders</h3>
              <p className="text-3xl font-bold">0</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-sales-text mb-4">Recent Sales</h2>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-sales-background text-sales-text">
                <tr>
                  <th className="px-4 py-2 text-left">Order ID</th>
                  <th className="px-4 py-2 text-left">Customer</th>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Amount</th>
                  <th className="px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="px-4 py-2" colSpan={5}>
                    No sales data available yet. Connect to Supabase to start managing your sales.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
