import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type UserRole = 'admin' | 'user' | 'blocked';

interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: UserRole;
  created_at: string;
  last_sign_in: string | null;
}

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: () => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  console.log("AuthProvider - Current route:", location.pathname);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log("Fetching profile for user:", userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error("Error fetching user profile:", error);
        return;
      }
      
      console.log("Profile fetched:", data);
      
      // If user is blocked, sign them out immediately
      if (data.role === 'blocked') {
        toast.error("Your account has been blocked. Please contact an administrator.");
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
        setProfile(null);
        navigate('/login');
        return;
      }
      
      setProfile(data);
      
      // Update last_sign_in time
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ last_sign_in: new Date().toISOString() })
        .eq('id', userId);
        
      if (updateError) {
        console.error("Error updating last sign in time:", updateError);
      }
    } catch (error) {
      console.error("Error in fetchUserProfile:", error);
    }
  };

  useEffect(() => {
    console.log("AuthProvider - Setting up auth state listener");
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("AuthProvider - Auth state changed:", event);
        setSession(session);
        setUser(session?.user ?? null);
        
        // Only fetch profile on sign in or session refresh
        if (session?.user) {
          // Use setTimeout to avoid potential deadlocks with Supabase auth
          setTimeout(async () => {
            await fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
        
        if (event === 'SIGNED_IN') {
          toast.success("Signed in successfully");
          
          // Use setTimeout to avoid potential deadlocks with Supabase auth
          setTimeout(() => {
            // Check if we were redirected from somewhere
            const from = location.state?.from?.pathname || '/dashboard';
            console.log("AuthProvider - Redirecting after sign in to:", from);
            navigate(from, { replace: true });
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          toast.info("Signed out");
          setTimeout(() => {
            console.log("AuthProvider - Redirecting after sign out to: /login");
            navigate('/login');
          }, 0);
        }
      }
    );

    // THEN check for existing session
    console.log("AuthProvider - Checking for existing session");
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log("AuthProvider - Session check result:", { hasSession: !!session });
      setSession(session);
      setUser(session?.user ?? null);
      
      // Fetch profile if user is logged in
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      }
      
      setLoading(false);
    });

    return () => {
      console.log("AuthProvider - Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        throw error;
      }
      
      // Let the onAuthStateChange handle the navigation
    } catch (error: any) {
      toast("Error", {
        description: error.message || 'Failed to sign in'
      });
      throw error;
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      // Clear any previous error toasts
      
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });
      
      if (error) {
        console.error("Signup error details:", error);
        throw error;
      }
      
      // On successful signup
      return;
    } catch (error: any) {
      console.error("Signup error in AuthContext:", error);
      
      // Provide more specific error messages for common issues
      if (error.message?.includes('email')) {
        toast("Error", {
          description: 'Invalid email address or email already in use'
        });
      } else if (error.message?.includes('password')) {
        toast("Error", {
          description: 'Password is too weak. Use at least 6 characters'
        });
      } else {
        toast("Error", {
          description: error.message || 'Failed to create account'
        });
      }
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error: any) {
      toast("Error", {
        description: error.message || 'Failed to sign out'
      });
    }
  };

  const isAdmin = () => {
    return profile?.role === 'admin';
  };

  return (
    <AuthContext.Provider value={{ session, user, profile, loading, signIn, signUp, signOut, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
