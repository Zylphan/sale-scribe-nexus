
import { useState } from 'react';
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
import { format } from 'date-fns';
import { UserRole } from '@/contexts/AuthContext';
import { useUserProfiles, useUpdateUserRole } from '@/hooks/useUsers';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import UserPermissionsManager from '@/components/users/UserPermissionsManager';
import { Settings, Users, RefreshCw } from 'lucide-react';

const UserManagement = () => {
  const { profiles, loading } = useUserProfiles();
  const { updateRole, updating } = useUpdateUserRole();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>('');
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false);

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
      toast.success(`User role updated successfully to ${role}`);
    }
  };
  
  const openPermissionsDialog = (userId: string, userName: string) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName || 'User');
    setIsPermissionsDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-10">
      {/* New Admin Header */}
      <div className="mb-8 border-b pb-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Users className="h-8 w-8 mr-2 text-sales-primary" />
            <h1 className="text-3xl font-bold text-sales-text">User Management</h1>
          </div>
          <div className="text-sm text-gray-500">
            Admin Control Panel
          </div>
        </div>
        <p className="text-gray-600 max-w-3xl">
          Manage user accounts, assign roles, and configure user permissions. 
          Use this dashboard to control who can access different features within the sales system.
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-medium">All Users</h2>
          <Button onClick={() => window.location.reload()} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
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
                <TableHead>Role Actions</TableHead>
                <TableHead>Permissions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
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
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openPermissionsDialog(user.id, user.full_name || '')}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Permissions
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>
      
      <Dialog open={isPermissionsDialogOpen} onOpenChange={setIsPermissionsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>User Permissions for {selectedUserName}</DialogTitle>
          </DialogHeader>
          {selectedUserId && (
            <UserPermissionsManager 
              userId={selectedUserId} 
              userName={selectedUserName} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
