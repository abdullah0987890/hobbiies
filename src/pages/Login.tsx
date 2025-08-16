// src/pages/Login.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/firebase';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'customer' | 'provider' | ''>('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const {
    login,
    googleLogin,
    facebookLogin,
    isLoading
  } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ 
        title: 'Missing fields', 
        description: 'Please enter both email and password.', 
        variant: 'destructive' 
      });
      return;
    }
    
    try {
      const success = await login(email, password);
      if (success) {
        toast({ 
          title: 'Success!', 
          description: 'Welcome back!' 
        });
      } else {
        toast({ 
          title: 'Login failed', 
          description: 'Please check your credentials and try again.', 
          variant: 'destructive' 
        });
      }
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'An unexpected error occurred.', 
        variant: 'destructive' 
      });
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast({ 
        title: 'Email required', 
        description: 'Please enter your email address.', 
        variant: 'destructive' 
      });
      return;
    }

    setIsResettingPassword(true);
    
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      toast({ 
        title: 'Password reset email sent!', 
        description: 'Check your email for password reset instructions.' 
      });
      setShowForgotPassword(false);
      setResetEmail('');
    } catch (error: any) {
      let errorMessage = 'An error occurred while sending reset email.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later.';
      }
      
      toast({ 
        title: 'Reset failed', 
        description: errorMessage, 
        variant: 'destructive' 
      });
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!role) {
      toast({ 
        title: 'Select Role', 
        description: 'Please select your role before signing in.', 
        variant: 'destructive' 
      });
      return;
    }
    
    try {
      const success = await googleLogin(role);
      if (success) {
        toast({ 
          title: 'Success!', 
          description: 'Successfully logged in with Google!' 
        });
      } else {
        toast({ 
          title: 'Google login failed', 
          description: 'Please try again.', 
          variant: 'destructive' 
        });
      }
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Google login error occurred.', 
        variant: 'destructive' 
      });
    }
  };

  const handleFacebookLogin = async () => {
    if (!role) {
      toast({ 
        title: 'Select Role', 
        description: 'Please select your role before signing in.', 
        variant: 'destructive' 
      });
      return;
    }
    
    try {
      const success = await facebookLogin(role);
      if (success) {
        toast({ 
          title: "Welcome!", 
          description: "Successfully logged in with Facebook." 
        });
      } else {
        toast({ 
          title: "Facebook login failed", 
          description: "Please try again.", 
          variant: "destructive" 
        });
      }
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "An error occurred during Facebook login.", 
        variant: "destructive" 
      });
    }
  };

  // Forgot Password Modal/Card
  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
            <p className="text-gray-600">Enter your email to receive reset instructions</p>
          </div>

          <Card className="shadow-xl border-0">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl text-gray-900">Forgot Password</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label htmlFor="resetEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input 
                      id="resetEmail" 
                      type="email" 
                      value={resetEmail} 
                      onChange={(e) => setResetEmail(e.target.value)} 
                      className="pl-10 h-12" 
                      placeholder="Enter your email address"
                      required 
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-[#ff00c8] hover:bg-pink-600 h-12 text-lg" 
                  disabled={isResettingPassword}
                >
                  {isResettingPassword ? 'Sending...' : 'Send Reset Email'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Button 
                  variant="ghost" 
                  onClick={() => setShowForgotPassword(false)}
                  className="text-gray-600 hover:text-gray-700"
                >
                  ← Back to Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Log in to your account to continue</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl text-gray-900">Login</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Select Role (for social login)
              </label>
              <select 
                id="role" 
                value={role} 
                onChange={(e) => setRole(e.target.value as 'customer' | 'provider')} 
                className="w-full h-12 border border-gray-300 rounded-md px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff00c8] focus:border-transparent"
              >
                <option value="">-- Select Role --</option>
                <option value="customer">Customer</option>
                <option value="provider">Provider</option>
              </select>
            </div>

            <div className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full h-12 text-lg gap-2" 
                onClick={handleGoogleLogin} 
                disabled={isLoading}
              >
                <FcGoogle /> Continue with Google
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full h-12 text-lg gap-2" 
                onClick={handleFacebookLogin} 
                disabled={isLoading}
              >
                <FaFacebook className="text-blue-600" /> Continue with Facebook
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input 
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    className="pl-10 h-12" 
                    placeholder="Enter your email"
                    required 
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input 
                    id="password" 
                    type={showPassword ? 'text' : 'password'} 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className="pl-10 pr-10 h-12" 
                    placeholder="Enter your password"
                    required 
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="absolute right-2 top-2 h-8 w-8 p-0" 
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-gray-600 hover:text-[#ff00c8] p-0 h-auto"
                >
                  Forgot password?
                </Button>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-[#ff00c8] hover:bg-pink-600 h-12 text-lg" 
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link to="/signup" className="text-red-600 hover:text-red-700 font-medium">
                  Sign up here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;