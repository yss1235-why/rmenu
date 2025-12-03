import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UtensilsCrossed, AlertCircle, Clock, ShieldX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const StaffLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    signInWithGoogle, 
    signOut,
    loading, 
    status, 
    error, 
    user,
    staff,
    isAuthenticated 
  } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      toast({
        title: 'Welcome back!',
        description: `Signed in as ${staff?.name || user?.displayName}`,
      });
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate, toast, staff?.name, user?.displayName]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      // Navigation will happen via useEffect when isAuthenticated becomes true
    } catch (err: any) {
      // Don't show error for popup closed by user
      if (err?.code !== 'auth/popup-closed-by-user') {
        toast({
          variant: 'destructive',
          title: 'Sign-in failed',
          description: err?.message || 'Unable to sign in with Google. Please try again.',
        });
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: 'Signed out',
        description: 'You have been signed out.',
      });
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const handleContactAdmin = () => {
    toast({
      title: 'Contact Administrator',
      description: 'Please contact your restaurant administrator to request access.',
    });
  };

  // Show different UI based on auth status
  const renderContent = () => {
    // Not a staff member
    if (status === 'not_staff' && user) {
      return (
        <>
          <Alert variant="destructive" className="mb-6">
            <ShieldX className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
              The email <strong>{user.email}</strong> is not registered as a staff member.
              Please contact your administrator for access.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full h-12 text-base"
              onClick={handleSignOut}
            >
              Sign in with a different account
            </Button>

            <Button
              variant="ghost"
              className="w-full"
              onClick={handleContactAdmin}
            >
              Request access
            </Button>
          </div>
        </>
      );
    }

    // Pending approval
    if (status === 'pending_approval' && user) {
      return (
        <>
          <Alert className="mb-6 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
            <Clock className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800 dark:text-amber-400">Pending Approval</AlertTitle>
            <AlertDescription className="text-amber-700 dark:text-amber-500">
              Your account <strong>{user.email}</strong> is awaiting administrator approval.
              You'll be notified once your access is granted.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full h-12 text-base"
              onClick={handleSignOut}
            >
              Sign in with a different account
            </Button>
          </div>
        </>
      );
    }

    // Error state
    if (error) {
      return (
        <>
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>

          <GoogleSignInButton 
            onClick={handleGoogleSignIn} 
            disabled={loading} 
            isLoading={loading}
          />
        </>
      );
    }

    // Default: Show Google Sign-In
    return (
      <>
        <GoogleSignInButton 
          onClick={handleGoogleSignIn} 
          disabled={loading || status === 'checking_staff'} 
          isLoading={loading || status === 'checking_staff'}
        />

        {/* Help text */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>
            Don't have access?{' '}
            <button 
              onClick={handleContactAdmin}
              className="text-primary hover:underline font-medium"
            >
              Contact your administrator
            </button>
          </p>
        </div>

        {/* Info notice */}
        <div className="mt-4 rounded-lg bg-muted/30 dark:bg-muted/10 border border-border p-3 text-center">
          <p className="text-xs text-muted-foreground">
            Only pre-approved staff members can access the dashboard.
            Sign in with your authorized Google account.
          </p>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-accent to-primary/10 dark:from-background dark:via-accent/5 dark:to-background p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 dark:bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/40 dark:bg-accent/20 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md relative shadow-2xl shadow-primary/10 border-primary/10 dark:border-primary/20">
        <CardHeader className="text-center pb-2">
          {/* Logo */}
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-primary to-accent-foreground rounded-2xl flex items-center justify-center shadow-lg shadow-primary/25">
            <UtensilsCrossed className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="font-serif text-2xl">Staff Portal</CardTitle>
          <CardDescription>
            Sign in to access the restaurant dashboard
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
};

// Google Sign-In Button Component
interface GoogleSignInButtonProps {
  onClick: () => void;
  disabled: boolean;
  isLoading: boolean;
}

const GoogleSignInButton = ({ onClick, disabled, isLoading }: GoogleSignInButtonProps) => (
  <Button
    variant="outline"
    className="w-full h-12 text-base border-2 hover:bg-muted/50 dark:hover:bg-muted/20 transition-all"
    onClick={onClick}
    disabled={disabled}
  >
    {isLoading ? (
      <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
    ) : (
      <>
        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continue with Google
      </>
    )}
  </Button>
);

export default StaffLogin;
