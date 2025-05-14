import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserPermissions, UserPermissions } from '@/hooks/useUserPermissions';
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
  const { profile: currentUserProfile } = useAuth();
  const [canCreate, setCanCreate] = useState<boolean>(true);
  const [canEdit, setCanEdit] = useState<boolean>(true);
  const [canDelete, setCanDelete] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Update local state when permissions load
  useEffect(() => {
    if (permissions) {
      setCanCreate(permissions.can_create_sales);
      setCanEdit(permissions.can_edit_sales);
      setCanDelete(permissions.can_delete_sales);
    }
  }, [permissions]);

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

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>User Permissions</CardTitle>
        <CardDescription>Configure what {userName} can do in the system</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="can-edit" className="flex-1">Edit Sales</Label>
              <Switch 
                id="can-edit" 
                checked={canEdit}
                onCheckedChange={setCanEdit}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="can-delete" className="flex-1">Delete Sales</Label>
              <Switch 
                id="can-delete" 
                checked={canDelete}
                onCheckedChange={setCanDelete}
              />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="w-full"
        >
          {isSaving ? 'Saving...' : 'Save Permissions'}
        </Button>
      </CardFooter>
    </Card>
  );
}