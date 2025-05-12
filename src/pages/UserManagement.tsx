
import { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCaption, TableCell,
  TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { UserRole } from '@/contexts/AuthContext';
import { useUserProfiles, useUpdateUserRole } from '@/hooks/useUsers';

const UserManagement = () => {
  const { profiles, loading } = useUserProfiles();
  const { updateRole, updating } = useUpdateUserRole();

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-green-500 hover:bg-green-600';
      case 'user':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'blocked':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    try {
      return format(new Date(dateString), 'MMM d, yyyy HH:mm');
    } catch (e) {
      return 'Invalid date';
    }
  };

  const handleRoleChange = async (userId: string, role: UserRole) => {
    const success = await updateRole(userId, role);
    if (success) {
      // The profiles state will be updated by the useUserProfiles hook automatically
      toast.success(`User role updated successfully to ${role}`);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-medium">All Users</h2>
          <Button onClick={() => window.location.reload()} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">Loading user data...</div>
        ) : (
          <Table>
            <TableCaption>A list of all users in the system.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Sign In</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                profiles.map(user => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.full_name || 'No name'}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(user.created_at)}</TableCell>
                    <TableCell>{formatDate(user.last_sign_in)}</TableCell>
                    <TableCell>
                      <Select
                        defaultValue={user.role}
                        onValueChange={(value) => handleRoleChange(user.id, value as UserRole)}
                        disabled={updating}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Change role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="blocked">Blocked</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
