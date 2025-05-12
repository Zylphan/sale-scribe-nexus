
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
        console.log("Fetching user profiles...");
        
        // First try to get users from the auth API via edge function
        try {
          const { data: authUsersData, error: authError } = await supabase.functions.invoke('get-auth-users');
          
          if (authError) {
            console.error("Error fetching auth users:", authError);
            throw authError;
          }
          
          if (authUsersData && Array.isArray(authUsersData.users)) {
            console.log("Fetched auth users:", authUsersData.users.length);
            
            // Now get profiles from the profiles table
            const { data: profilesData, error: profilesError } = await supabase
              .from('profiles')
              .select('*');
              
            if (profilesError) {
              console.error("Error fetching profiles:", profilesError);
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
                role: profile?.role || 'user',
                created_at: user.created_at || new Date().toISOString(),
                last_sign_in: profile?.last_sign_in || null
              };
            });
            
            setProfiles(combinedProfiles);
            return;
          }
        } catch (fnError) {
          console.error("Edge function error:", fnError);
        }
        
        // Fallback: Just get from profiles table
        console.log("Falling back to profiles table only");
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        console.log("Fetched profiles:", data);
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
