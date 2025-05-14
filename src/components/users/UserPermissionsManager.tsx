import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserPermissions, UserPermissions } from '@/hooks/useUserPermissions';
import { useUpdateUserRole } from '@/hooks/useUsers';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, ShieldAlert, ShieldCheck } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface UserPermissionsManagerProps {
  userId: string;
  userName: string;
  userRole: UserRole;
  onPermissionsUpdate?: () => void;
}

export default function UserPermissionsManager({ 
  userId, 
  userName, 
  userRole,
  onPermissionsUpdate 
}: UserPermissionsManagerProps) {
  const { permissions, loading, updatePermissions } = useUserPermissions(userId);
  const { updateRole, updating } = useUpdateUserRole();
  const { profile: currentUserProfile } = useAuth();
  const [canCreate, setCanCreate] = useState<boolean>(true);
  const [canEdit, setCanEdit] = useState<boolean>(true);
  const [canDelete, setCanDelete] = useState<boolean>(true);
  const [isBlocked, setIsBlocked] = useState<boolean>(userRole === 'blocked');
  const [isSaving, setIsSaving] = useState(false);
  
  // Update local state when permissions load
  useEffect(() => {
    if (permissions) {
      setCanCreate(permissions.can_create_sales);
      setCanEdit(permissions.can_edit_sales);
      setCanDelete(permissions.can_delete_sales);
    }
  }, [permissions]);

  const handleBlockToggle = async () => {
    if (currentUserProfile?.role !== 'admin') {
      toast.error('Only administrators can block or unblock users');
      return;
    }

    if (userRole === 'admin') {
      toast.error('Cannot block other administrators');
      return;
    }

    const newRole: UserRole = isBlocked ? 'user' : 'blocked';
    const success = await updateRole(userId, newRole);
    
    if (success) {
      setIsBlocked(!isBlocked);
      toast.success(`User ${newRole === 'blocked' ? 'blocked' : 'unblocked'} successfully`);
      onPermissionsUpdate?.();
    }
  };
  
  const handleSave = async () => {
    setIsSaving(true);
    
    const updatedPermissions: Partial<UserPermissions> = {
      can_create_sales: canCreate,
      can_edit_sales: canEdit,
      can_delete_sales: canDelete,
    };
    
    const success = await updatePermissions(userId, updatedPermissions);
    
    if (success) {
      toast.success('Permissions updated successfully');
      onPermissionsUpdate?.();
    }
    
    setIsSaving(false);
  };
  
  if (loading) {
    return <div className="p-4 text-center">Loading permissions...</div>;
  }

  const isAdmin = currentUserProfile?.role === 'admin';
  const isTargetAdmin = userRole === 'admin';
  
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>User Permissions</CardTitle>
        <CardDescription>Configure what {userName} can do in the system</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Access Control Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="is-blocked" className="text-base font-semibold">
                Access Control
              </Label>
              <p className="text-sm text-muted-foreground">
                {isBlocked ? 'User is currently blocked from accessing the system' : 'User has normal access to the system'}
              </p>
            </div>
            {isAdmin && !isTargetAdmin && (
              <Button
                variant={isBlocked ? "default" : "destructive"}
                size="lg"
                onClick={handleBlockToggle}
                disabled={updating}
                className="min-w-[120px]"
              >
                {isBlocked ? (
                  <>
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    Unblock
                  </>
                ) : (
                  <>
                    <ShieldAlert className="h-4 w-4 mr-2" />
                    Block
                  </>
                )}
              </Button>
            )}
          </div>

          {isBlocked && (
            <Alert variant="destructive" className="mt-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This user is currently blocked and cannot access the system. All permissions are disabled.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <Separator />

        {/* Feature Permissions Section */}
        <div className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-base font-semibold">Feature Permissions</h3>
            <p className="text-sm text-muted-foreground">
              Control what features this user can access
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="can-create" className="flex-1">Create New Sale</Label>
              <Switch 
                id="can-create" 
                checked={canCreate}
                onCheckedChange={setCanCreate}
                disabled={isBlocked}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="can-edit" className="flex-1">Edit Sales</Label>
              <Switch 
                id="can-edit" 
                checked={canEdit}
                onCheckedChange={setCanEdit}
                disabled={isBlocked}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="can-delete" className="flex-1">Delete Sales</Label>
              <Switch 
                id="can-delete" 
                checked={canDelete}
                onCheckedChange={setCanDelete}
                disabled={isBlocked}
              />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSave} 
          disabled={isSaving || isBlocked}
          className="w-full"
        >
          {isSaving ? 'Saving...' : 'Save Permissions'}
        </Button>
      </CardFooter>
    </Card>
  );
}