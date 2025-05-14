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
        
        const defaultPermissions: UserPermissions = {
          user_id: userId,
          can_create_sales: true,
          can_edit_sales: true,
          can_delete_sales: true
        };
        
        const { data, error } = await supabase
          .from('user_permissions')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();
        
        if (error) {
          console.error('Error fetching permissions:', error);
          setPermissions(defaultPermissions);
        } else if (data) {
          setPermissions(data as UserPermissions);
        } else {
          setPermissions(defaultPermissions);
        }
      } catch (error: any) {
        console.error('Error in useUserPermissions:', error);
        setPermissions({
          user_id: userId,
          can_create_sales: true,
          can_edit_sales: true,
          can_delete_sales: true
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [userId]);

  const updatePermissions = async (userId: string, updatedPermissions: Partial<UserPermissions>) => {
    try {
      setLoading(true);
      
      const { data: existingData, error: checkError } = await supabase
        .from('user_permissions')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (checkError) {
        console.error('Error checking permissions:', checkError);
        toast.error('Failed to update permissions');
        return false;
      }
      
      let success = false;
      
      if (existingData) {
        const { error: updateError } = await supabase
          .from('user_permissions')
          .update(updatedPermissions)
          .eq('user_id', userId);
          
        if (updateError) {
          console.error('Error updating permissions:', updateError);
          toast.error('Failed to update permissions');
          return false;
        }
        success = true;
      } else {
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
          toast.error('Failed to create permissions');
          return false;
        }
        success = true;
      }
      
      if (success) {
        setPermissions({
          ...permissions!,
          ...updatedPermissions,
        } as UserPermissions);
        toast.success('User permissions updated successfully');
      }
      
      return success;
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