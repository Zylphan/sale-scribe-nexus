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

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      console.log("Fetching user profiles...");
      
      // Call the new Edge Function to get auth users
      const { data: authUsersData, error: authError } = await supabase.functions.invoke('list-auth-users');
      
      if (authError) {
        console.error("Error fetching auth users:", authError);
        throw authError;
      }
      
      if (!authUsersData || !Array.isArray(authUsersData.users)) {
        console.error("Invalid data from list-auth-users function:", authUsersData);
        // Fallback to just fetching profiles if auth users data is bad
        console.log("Falling back to profiles table only due to bad auth users data");
         const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id, email, full_name, role, created_at, last_sign_in')
            .order('created_at', { ascending: false });

          if (profilesError) {
             console.error("Error fetching profiles in fallback:", profilesError);
             toast.error(`Error fetching profiles fallback: ${profilesError.message}`);
             throw profilesError;
           }
           setProfiles(profilesData || []);
           return;
      }

      console.log("Fetched auth users:", authUsersData.users.length);
      
      // Now get profiles from the profiles table
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, created_at, last_sign_in');
        
      if (profilesError) {
        console.error("Error fetching profiles after auth users fetch:", profilesError);
        toast.error(`Error fetching profiles: ${profilesError.message}`);
        throw profilesError;
      }

      // Build a map of profiles by user ID for quick lookup
      const profileMap = new Map();
      (profilesData || []).forEach(profile => {
        profileMap.set(profile.id, profile);
      });
      
      // Combine the data, using profile data when available
      const combinedProfiles = authUsersData.users.map(user => {
        const profile = profileMap.get(user.id);
        return {
          id: user.id,
          email: user.email,
          full_name: profile?.full_name || user.user_metadata?.full_name || null,
          // Explicitly take role from profile data, fallback to auth user metadata, then default
          role: profile?.role || (user.user_metadata as any)?.role || 'user',
          created_at: profile?.created_at || user.created_at || new Date().toISOString(),
          last_sign_in: profile?.last_sign_in || user.last_sign_in || null
        };
      });
      
      setProfiles(combinedProfiles);
      
    } catch (error: any) {
      console.error('Error fetching user profiles (overall):', error);
      toast.error(`Error fetching user profiles: ${error.message}`);
      setProfiles([]); // Clear profiles on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  return { profiles, loading, refresh: fetchProfiles };
}

export function useUpdateUserRole() {
  const [updating, setUpdating] = useState(false);
  
  const updateRole = async (userId: string, role: UserRole) => {
    if (!userId || !role) {
      console.error('Invalid parameters:', { userId, role });
      toast.error('Invalid user or role');
      return false;
    }

    try {
      setUpdating(true);
      console.log('Updating role for user:', userId, 'to role:', role);
      
      // Call the edge function to update the role
      const { data, error } = await supabase.functions.invoke('update-user-role', {
        body: { userId, role }
      });
      
      console.log('Edge function response:', { data, error });
      
      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }
      
      if (!data?.success) {
        console.error('Edge function returned unsuccessful response:', data);
        throw new Error('Failed to update user role');
      }
      
      // Refresh the user's session to get updated metadata
      const { error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        console.error('Error refreshing session:', refreshError);
        // Don't fail the operation if refresh fails
      }
      
      // Force a reload of the user profiles in the UI
      window.location.reload();
      
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