import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { Link, useLocation } from 'react-router-dom';
import { Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/reports', label: 'Reports' },
  { to: '/users', label: 'User Management', admin: true, icon: <Users size={16} /> },
];

const AppHeader = () => {
  const { signOut, isAdmin } = useAuth();
  const location = useLocation();

  return (
    <header className="bg-sales-primary text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">Sales Management System</h1>
        <div className="flex items-center space-x-4">
          <NavigationMenu>
            <NavigationMenuList>
              {navLinks.map((link) => {
                if (link.admin && !isAdmin()) return null;
                const isActive = location.pathname === link.to;
                return (
                  <NavigationMenuItem key={link.to}>
                    <Link to={link.to}>
                      <NavigationMenuLink
                        className={
                          navigationMenuTriggerStyle() +
                          ` ${isActive ? 'bg-sales-secondary text-white' : 'bg-transparent text-white hover:bg-white hover:text-sales-primary'} border border-white flex items-center gap-1`
                        }
                        style={isActive ? { fontWeight: 'bold', boxShadow: '0 0 0 2px #fff' } : {}}
                      >
                        {link.icon}
                        {link.label}
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                );
              })}
            </NavigationMenuList>
          </NavigationMenu>
          <Button
            variant="outline"
            onClick={signOut}
            className="text-white border-white hover:bg-white hover:text-sales-primary bg-transparent"
          >
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};

export default AppHeader; 