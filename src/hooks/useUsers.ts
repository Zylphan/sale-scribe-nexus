import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserRole } from '@/contexts/AuthContext';

export interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: UserRole;
  created_at: string;
  last_sign_in: string | null;
}

export function useUpdateUserRole() {
  const [updating, setUpdating] = useState(false);
  
  const updateRole = async (userId: string, role: UserRole) => {
    try {
      setUpdating(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId);
      
      if (error) {
        throw error;
      }
      
      return true;
    } catch (error: any) {
      console.error('Error updating user role:', error);
      toast.error(`Failed to update user role: ${error.message}`);
      return false;
    } finally {
      setUpdating(false);
    }
  };
  
  return { updateRole, updating };
}