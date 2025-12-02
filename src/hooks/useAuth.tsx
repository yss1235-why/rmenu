import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { authService } from '@/lib/firebase';
import { staffService } from '@/services/staffService';
import { Staff, StaffRole, hasPermission, RolePermissions } from '@/types/staff';

// Auth status types for better state management
type AuthStatus = 
  | 'loading'           // Initial loading state
  | 'unauthenticated'   // No Firebase user
  | 'checking_staff'    // Firebase user exists, checking staff record
  | 'not_staff'         // Firebase user exists but no staff record
  | 'pending_approval'  // Staff record exists but not approved
  | 'authenticated';    // Fully authenticated and approved

interface AuthContextValue {
  user: User | null;
  staff: Staff | null;
  loading: boolean;
  status: AuthStatus;
  error: Error | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  isApproved: boolean;
  role: StaffRole | null;
  checkPermission: (permission: keyof RolePermissions) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [staff, setStaff] = useState<Staff | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [error, setError] = useState<Error | null>(null);

  // Check for redirect result on mount (for mobile Google Sign-In)
  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        const redirectUser = await authService.getGoogleRedirectResult();
        if (redirectUser) {
          // User will be handled by onAuthChange
          console.log('Redirect sign-in successful');
        }
      } catch (err) {
        console.error('Error checking redirect result:', err);
      }
    };

    checkRedirectResult();
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = authService.onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);
      setError(null);

      if (firebaseUser?.email) {
        setStatus('checking_staff');
        
        try {
          // Check if this email exists in staff collection
          const staffData = await staffService.getStaffByEmail(firebaseUser.email);
          
          if (staffData) {
            setStaff(staffData);
            
            if (staffData.isApproved) {
              // Update last login timestamp
              await staffService.updateLastLogin(staffData.id);
              setStatus('authenticated');
            } else {
              setStatus('pending_approval');
            }
          } else {
            // User authenticated with Google but not in staff collection
            setStaff(null);
            setStatus('not_staff');
          }
        } catch (err) {
          console.error('Error fetching staff data:', err);
          setStaff(null);
          setStatus('not_staff');
          setError(err instanceof Error ? err : new Error('Failed to verify staff access'));
        }
      } else {
        // No Firebase user
        setStaff(null);
        setStatus('unauthenticated');
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Google Sign-In
  const signInWithGoogle = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      
      // Try popup first (works on desktop)
      // On mobile, this might fail and we'll need to use redirect
      try {
        await authService.signInWithGoogle();
      } catch (popupError: any) {
        // If popup blocked or failed, try redirect method
        if (popupError?.code === 'auth/popup-blocked' || 
            popupError?.code === 'auth/popup-closed-by-user') {
          console.log('Popup blocked/closed, trying redirect...');
          await authService.signInWithGoogleRedirect();
        } else {
          throw popupError;
        }
      }
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err : new Error('Google sign-in failed'));
      throw err;
    }
  }, []);

  // Sign Out
  const signOut = useCallback(async () => {
    try {
      await authService.signOut();
      setStaff(null);
      setStatus('unauthenticated');
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Sign out failed'));
      throw err;
    }
  }, []);

  // Check permission
  const checkPermission = useCallback((permission: keyof RolePermissions): boolean => {
    if (!staff?.role) return false;
    return hasPermission(staff.role, permission);
  }, [staff?.role]);

  const value: AuthContextValue = {
    user,
    staff,
    loading,
    status,
    error,
    signInWithGoogle,
    signOut,
    isAuthenticated: status === 'authenticated',
    isApproved: staff?.isApproved ?? false,
    role: staff?.role || null,
    checkPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Protected Route component
interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermission?: keyof RolePermissions;
  fallback?: ReactNode;
}

export const ProtectedRoute = ({ 
  children, 
  requiredPermission,
  fallback 
}: ProtectedRouteProps) => {
  const { isAuthenticated, loading, checkPermission } = useAuth();

  if (loading) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will be handled by route navigation
  }

  if (requiredPermission && !checkPermission(requiredPermission)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Access Denied
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
