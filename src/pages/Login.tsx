
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import AuthLayout from '@/components/auth/AuthLayout';
import { useAuth } from '@/contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  console.log("Login - Component rendered", { isAuthenticated: !!user, authLoading: loading });
  
  // Check if user is already logged in and redirect
  useEffect(() => {
    if (!loading && user) {
      const from = location.state?.from?.pathname || '/dashboard';
      console.log("Login - User already authenticated, redirecting to:", from);
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, location]);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      return;
    }
    
    console.log("Login - Attempting login with email:", email);
    setIsLoading(true);
    
    try {
      await signIn(email, password);
      // AuthContext's onAuthStateChange will handle navigation
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Don't render the login form if we're checking auth or if the user is already authenticated
  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  const footer = (
    <div className="text-center w-full">
      <p>Don't have an account? <Link to="/signup" className="text-sales-secondary hover:underline">Sign up</Link></p>
    </div>
  );
  
  return (
    <AuthLayout 
      title="Welcome to Stark Industries by Avengers"
      description="Sign in to your account to continue"
      footer={footer}
    >
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="text-sm text-sales-secondary hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-500" />
              ) : (
                <Eye className="h-4 w-4 text-gray-500" />
              )}
            </Button>
          </div>
        </div>
        
        <Button
          type="submit"
          className="w-full bg-sales-primary hover:bg-sales-text"
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default Login;
