import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserRole } from '@/contexts/AuthContext';

// Define a type for the expected user_metadata structure
interface AuthUserMetadata {
  full_name?: string;
  role?: string; // Role is stored as a string in metadata
}

// Helper function to check if a value is a valid UserRole
function isValidUserRole(role: any): role is UserRole {
  return role !== null && typeof role === 'string' && (role === 'admin' || role === 'user' || role === 'blocked');
}

export interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: UserRole;
  created_at: string;
  last_sign_in: string | null;
  is_banned: boolean;
}

// Define a simple type for the banned_users data we expect
interface BannedUserRow {
  user_id: string;
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
      console.log("Fetching user profiles and banned status...");
      
      // Call the Edge Function to get auth users
      const { data: authUsersData, error: authError } = await supabase.functions.invoke('list-auth-users');
      
      if (authError) {
        console.error("Error fetching auth users:", authError);
        throw authError;
      }
      
      if (!authUsersData || !Array.isArray(authUsersData.users)) {
        console.error("Invalid data from list-auth-users function:", authUsersData);
        // If auth users data is bad, set profiles to empty and stop.
        setProfiles([]);
        setLoading(false);
        return;
      }

      console.log("Fetched auth users data (raw):", authUsersData); // Log raw data
      console.log("Fetched auth users count:", authUsersData.users.length);

      // Fetch data from the new banned_users table, casting 'from' to 'any' to bypass strict type checking
      const { data: bannedUsersData, error: bannedUsersError } = await (supabase.from as any)('banned_users')
        .select('user_id');

      if (bannedUsersError) {
        console.error("Error fetching banned users:", bannedUsersError);
        // Continue with profiles even if fetching banned users fails
      }

      // Create a Set of banned user IDs for quick lookup, using the custom interface
      const bannedUserIds = new Set(bannedUsersData?.map((b: BannedUserRow) => b.user_id) || []);
      console.log('Fetched banned user IDs:', Array.from(bannedUserIds));
      
      // Directly use the auth users data to build the profiles list
      const combinedProfiles: UserProfile[] = authUsersData.users.map(user => {
        // Get user_metadata with the defined type
        const userMetadata = user.user_metadata as AuthUserMetadata | null;

        // Safely access and validate the role from user_metadata
        const metadataRole = userMetadata?.role;
        const role: UserRole = isValidUserRole(metadataRole)
          ? metadataRole
          : 'user'; // Default to 'user' if metadata role is invalid or missing

        // Determine banned status based on the banned_users table
        const is_banned = bannedUserIds.has(user.id);

        return {
          id: user.id,
          email: user.email,
          full_name: userMetadata?.full_name || null, // Get full_name from validated metadata
          role: role,
          created_at: user.created_at, // Use created_at from auth user
          last_sign_in: user.last_sign_in_at || null, // Use last_sign_in_at from auth user
          is_banned: is_banned // Use banned status from banned_users table
        } as UserProfile; // Explicitly cast to UserProfile
      });

      console.log("Combined profiles data (processed):", combinedProfiles); // Log processed data

      // Update the profiles state after data is processed
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
        throw new Error(data?.error || 'Failed to update user role');
      }
      
      // Refresh the user's session to get updated metadata
      const { error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        console.error('Error refreshing session:', refreshError);
        // Don't fail the operation if refresh fails
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