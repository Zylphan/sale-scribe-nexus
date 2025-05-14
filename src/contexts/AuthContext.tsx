import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Session, User } from '@supabase/supabase-js';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from: string })?.from || '/';

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }

      console.log('Profile fetched:', data);

      // If user is blocked, sign them out immediately
      if (data.role === 'blocked') {
        toast.error('Your account has been blocked. Please contact an administrator.');
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
        console.error('Error updating last sign in time:', updateError);
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthProvider - Auth state changed:', event);
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
          toast.success('Signed in successfully');

          // Use setTimeout to avoid potential deadlocks with Supabase auth
          setTimeout(() => {
            navigate(from, { replace: true });
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          toast.info('Signed out');
          setTimeout(() => {
            console.log('AuthProvider - Redirecting after sign out to: /login');
            navigate('/login');
          });
        }
      }
    );

    // THEN check for existing session
    console.log('AuthProvider - Checking for existing session');
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('AuthProvider - Session check result:', { hasSession: !!session });
      setSession(session);
      setUser(session?.user ?? null);

      // Fetch profile if user is logged in
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      }

      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, user, profile }}>
      {children}
    </AuthContext.Provider>
  );
};