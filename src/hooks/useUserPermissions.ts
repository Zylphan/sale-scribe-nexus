
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface UserPermissions {
  id: string;
  user_id: string;
  can_create_sales: boolean;
  can_edit_sales: boolean;
  can_delete_sales: boolean;
  updated_at: string;
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
        
        // Check if permissions exist for this user
        const { data, error } = await supabase
          .from('user_permissions')
          .select('*')
          .eq('user_id', userId)
          .single();
        
        if (error) {
          // If no permissions found, create default permissions
          if (error.code === 'PGRST116') {
            const defaultPermissions = {
              user_id: userId,
              can_create_sales: true,
              can_edit_sales: true,
              can_delete_sales: true,
            };
            
            const { data: newData, error: insertError } = await supabase
              .from('user_permissions')
              .insert(defaultPermissions)
              .select()
              .single();
              
            if (insertError) {
              console.error('Error creating default permissions:', insertError);
              toast.error('Failed to set up user permissions');
            } else {
              setPermissions(newData);
            }
          } else {
            console.error('Error fetching permissions:', error);
            toast.error('Failed to load user permissions');
          }
        } else {
          setPermissions(data);
        }
      } catch (error: any) {
        console.error('Error in useUserPermissions:', error);
        toast.error(`Error: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [userId]);

  const updatePermissions = async (userId: string, updatedPermissions: Partial<UserPermissions>) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('user_permissions')
        .update(updatedPermissions)
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating permissions:', error);
        toast.error('Failed to update user permissions');
        return false;
      }
      
      setPermissions(data);
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
        
        // Fetch permissions for the current user
        const { data, error } = await supabase
          .from('user_permissions')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
        
        if (error) {
          // If permissions don't exist, return default permissions (all enabled)
          if (error.code === 'PGRST116') {
            const defaultPermissions = {
              id: 'default',
              user_id: session.user.id,
              can_create_sales: true,
              can_edit_sales: true, 
              can_delete_sales: true,
              updated_at: new Date().toISOString()
            };
            setPermissions(defaultPermissions);
          } else {
            console.error('Error fetching current user permissions:', error);
          }
        } else {
          setPermissions(data);
        }
      } catch (error) {
        console.error('Error in useCurrentUserPermissions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUserPermissions();
  }, []);

  return { permissions, loading };
};
