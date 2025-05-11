
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

export function useUserCount() {
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        setLoading(true);
        
        // Custom function approach
        try {
          // Using the edge function to get the user count
          const { data, error } = await supabase.functions.invoke('get-user-count');
          
          if (!error && data && typeof data.count === 'number') {
            setCount(data.count);
            return;
          } else {
            console.error("Edge function error:", error || "No count returned");
          }
        } catch (fnError) {
          console.error("Function invocation error:", fnError);
        }
        
        // Fallback: Check current session and use a default value
        console.log("Falling back to session check");
        
        // Check if the current user is authenticated
        const { data: { session } } = await supabase.auth.getSession();
        
        // If we have a session, use a default minimum count
        if (session) {
          setCount(1);  // At least one user exists (the current user)
          toast.info("Using fallback user count. Actual count may be higher.");
        } else {
          setCount(0);
        }
      } catch (error: any) {
        console.error("Error fetching user count:", error.message);
        toast.error(`Error fetching user count: ${error.message}`);
        
        // Fallback to at least counting the current user
        const { data: { session } } = await supabase.auth.getSession();
        setCount(session ? 1 : 0);
      } finally {
        setLoading(false);
      }
    };

    fetchUserCount();
  }, []);

  return { count, loading };
}

export function useUserProfiles() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        setProfiles(data || []);
      } catch (error: any) {
        console.error('Error fetching user profiles:', error);
        toast.error(`Error fetching user profiles: ${error.message}`);
        setProfiles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  return { profiles, loading };
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
      
      toast.success(`User role updated successfully to ${role}`);
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
