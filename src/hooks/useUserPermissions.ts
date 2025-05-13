
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface UserPermissions {
  id?: string;
  user_id: string;
  can_create_sales: boolean;
  can_edit_sales: boolean;
  can_delete_sales: boolean;
  updated_at?: string;
}

export const useUserPermissions = (userId?: string) => {
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Check if the user_permissions table exists
        const { error: tableCheckError } = await supabase
          .from('user_permissions')
          .select('count')
          .limit(1)
          .single();
          
        if (tableCheckError && tableCheckError.code === '42P01') {
          console.error('Table user_permissions does not exist');
          // Set default permissions if table doesn't exist
          const defaultPermissions: UserPermissions = {
            user_id: userId,
            can_create_sales: true,
            can_edit_sales: true,
            can_delete_sales: true
          };
          setPermissions(defaultPermissions);
          setLoading(false);
          return;
        }
        
        // If table exists, check if permissions exist for this user
        const { data, error } = await supabase
          .rpc('get_user_permissions', { user_id: userId });
        
        if (error) {
          // If RPC doesn't exist or other error, use direct query
          const { data: directData, error: directError } = await supabase
            .from('user_permissions')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();
            
          if (directError || !directData) {
            // If no permissions found or error, create default permissions
            const defaultPermissions: UserPermissions = {
              user_id: userId,
              can_create_sales: true,
              can_edit_sales: true,
              can_delete_sales: true
            };
            
            setPermissions(defaultPermissions);
          } else {
            setPermissions(directData as UserPermissions);
          }
        } else {
          setPermissions(data as UserPermissions);
        }
      } catch (error: any) {
        console.error('Error in useUserPermissions:', error);
        // Set default permissions on error
        const defaultPermissions: UserPermissions = {
          user_id: userId,
          can_create_sales: true,
          can_edit_sales: true,
          can_delete_sales: true
        };
        setPermissions(defaultPermissions);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [userId]);

  const updatePermissions = async (userId: string, updatedPermissions: Partial<UserPermissions>) => {
    try {
      setLoading(true);
      
      // Check if the user_permissions table exists
      const { error: tableCheckError } = await supabase
        .from('user_permissions')
        .select('count')
        .limit(1)
        .single();
        
      if (tableCheckError && tableCheckError.code === '42P01') {
        console.error('Table user_permissions does not exist');
        // Just update local state since table doesn't exist
        const newPermissions: UserPermissions = {
          user_id: userId,
          can_create_sales: updatedPermissions.can_create_sales ?? true,
          can_edit_sales: updatedPermissions.can_edit_sales ?? true,
          can_delete_sales: updatedPermissions.can_delete_sales ?? true
        };
        setPermissions(newPermissions);
        toast.success('User permissions updated successfully (local only)');
        return true;
      }
      
      // Try to update existing permissions
      const { data, error } = await supabase
        .rpc('update_user_permissions', { 
          p_user_id: userId,
          p_can_create_sales: updatedPermissions.can_create_sales,
          p_can_edit_sales: updatedPermissions.can_edit_sales,
          p_can_delete_sales: updatedPermissions.can_delete_sales
        });
        
      if (error && error.code === '42883') {
        // If RPC doesn't exist, use direct update
        const { data: existingData } = await supabase
          .from('user_permissions')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();
          
        if (existingData) {
          // Update existing record
          const { error: updateError } = await supabase
            .from('user_permissions')
            .update(updatedPermissions)
            .eq('user_id', userId);
            
          if (updateError) {
            console.error('Error updating permissions:', updateError);
            toast.error('Failed to update user permissions');
            return false;
          }
        } else {
          // Insert new record
          const newPermissions: UserPermissions = {
            user_id: userId,
            can_create_sales: updatedPermissions.can_create_sales ?? true,
            can_edit_sales: updatedPermissions.can_edit_sales ?? true,
            can_delete_sales: updatedPermissions.can_delete_sales ?? true
          };
          
          const { error: insertError } = await supabase
            .from('user_permissions')
            .insert(newPermissions);
            
          if (insertError) {
            console.error('Error creating permissions:', insertError);
            toast.error('Failed to create user permissions');
            return false;
          }
        }
      } else if (error) {
        console.error('Error updating permissions:', error);
        toast.error('Failed to update user permissions');
        return false;
      }
      
      // Update local state
      const newPermissions = {
        ...permissions,
        ...updatedPermissions,
      } as UserPermissions;
      
      setPermissions(newPermissions);
      toast.success('User permissions updated successfully');
      return true;
    } catch (error: any) {
      console.error('Error updating permissions:', error);
      toast.error(`Error: ${error.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { permissions, loading, updatePermissions };
};

export const useCurrentUserPermissions = () => {
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUserPermissions = async () => {
      try {
        setLoading(true);
        
        // Get the current user
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          setLoading(false);
          return;
        }
        
        // Check if the user_permissions table exists
        const { error: tableCheckError } = await supabase
          .from('user_permissions')
          .select('count')
          .limit(1)
          .single();
          
        if (tableCheckError && tableCheckError.code === '42P01') {
          console.error('Table user_permissions does not exist');
          // Set default permissions if table doesn't exist
          const defaultPermissions: UserPermissions = {
            id: 'default',
            user_id: session.user.id,
            can_create_sales: true,
            can_edit_sales: true, 
            can_delete_sales: true,
            updated_at: new Date().toISOString()
          };
          setPermissions(defaultPermissions);
          setLoading(false);
          return;
        }
        
        // Fetch permissions for the current user
        const { data, error } = await supabase
          .from('user_permissions')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle();
        
        if (error) {
          // If permissions don't exist, return default permissions (all enabled)
          const defaultPermissions: UserPermissions = {
            id: 'default',
            user_id: session.user.id,
            can_create_sales: true,
            can_edit_sales: true, 
            can_delete_sales: true,
            updated_at: new Date().toISOString()
          };
          setPermissions(defaultPermissions);
        } else {
          setPermissions(data as UserPermissions || {
            id: 'default',
            user_id: session.user.id,
            can_create_sales: true,
            can_edit_sales: true, 
            can_delete_sales: true,
            updated_at: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('Error in useCurrentUserPermissions:', error);
        // Set default permissions on error
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const defaultPermissions: UserPermissions = {
            id: 'default',
            user_id: session.user.id,
            can_create_sales: true,
            can_edit_sales: true, 
            can_delete_sales: true,
            updated_at: new Date().toISOString()
          };
          setPermissions(defaultPermissions);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUserPermissions();
  }, []);

  return { permissions, loading };
};
