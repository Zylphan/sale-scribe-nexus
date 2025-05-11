
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  FileBarChart,
  Users,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  isActive: boolean;
}

const SidebarItem = ({ href, icon, title, isActive }: SidebarItemProps) => {
  return (
    <Link to={href}>
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start gap-2 font-normal",
          isActive && "bg-muted font-medium"
        )}
      >
        {icon}
        <span>{title}</span>
      </Button>
    </Link>
  );
};

export function Sidebar() {
  const location = useLocation();
  const { signOut, isAdmin } = useAuth();

  return (
    <aside className="hidden md:flex h-screen w-64 flex-col border-r bg-background px-4 py-4">
      <div className="flex h-14 items-center px-2 font-semibold text-lg">
        Stark Industries
      </div>
      <Separator className="my-2" />
      <nav className="flex-1 space-y-1 pt-4">
        <SidebarItem
          href="/dashboard"
          icon={<LayoutDashboard className="h-4 w-4" />}
          title="Dashboard"
          isActive={location.pathname === "/dashboard"}
        />
        <SidebarItem
          href="/reports"
          icon={<FileBarChart className="h-4 w-4" />}
          title="Reports"
          isActive={location.pathname === "/reports"}
        />
        
        {isAdmin() && (
          <SidebarItem
            href="/users"
            icon={<Users className="h-4 w-4" />}
            title="User Management"
            isActive={location.pathname === "/users"}
          />
        )}
      </nav>
      <div className="pt-2">
        <Separator className="my-2" />
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground hover:bg-muted"
          onClick={signOut}
        >
          <LogOut className="h-4 w-4" />
          <span>Log out</span>
        </Button>
      </div>
    </aside>
  );
}
