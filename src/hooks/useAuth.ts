import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { authService } from '@/lib/firebase';
import { staffService } from '@/services/staffService';
import { Staff, StaffRole, hasPermission, RolePermissions } from '@/types/staff';

interface AuthContextValue {
  user: User | null;
  staff: Staff | null;
  loading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<void>;
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
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = authService.onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser?.email) {
        try {
          const staffData = await staffService.getStaffByEmail(firebaseUser.email);
          setStaff(staffData);

          if (staffData) {
            await staffService.updateLastLogin(staffData.id);
          }
        } catch (err) {
          console.error('Error fetching staff data:', err);
          setStaff(null);
        }
      } else {
        setStaff(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      await authService.signIn(email, password);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Sign in failed'));
      throw err;
    }
  };

  const signOut = async () => {
    try {
      await authService.signOut();
      setStaff(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Sign out failed'));
      throw err;
    }
  };

  const checkPermission = (permission: keyof RolePermissions): boolean => {
    if (!staff?.role) return false;
    return hasPermission(staff.role, permission);
  };

  const value: AuthContextValue = {
    user,
    staff,
    loading,
    error,
    signIn,
    signOut,
    isAuthenticated: !!user && !!staff,
    isApproved: !!staff?.isApproved,
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

// Demo auth hook for development without Firebase
export const useDemoAuth = () => {
  const [currentStaff, setCurrentStaff] = useState<Staff | null>({
    id: 'demo-admin',
    restaurantId: 'demo',
    email: 'admin@demo.com',
    name: 'Demo Admin',
    role: 'admin',
    isActive: true,
    isApproved: true,
    createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
    updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
  });

  const switchRole = (role: StaffRole) => {
    setCurrentStaff((prev) =>
      prev
        ? {
            ...prev,
            role,
            name: `Demo ${role.charAt(0).toUpperCase() + role.slice(1)}`,
          }
        : null
    );
  };

  const checkPermission = (permission: keyof RolePermissions): boolean => {
    if (!currentStaff?.role) return false;
    return hasPermission(currentStaff.role, permission);
  };

  return {
    user: null,
    staff: currentStaff,
    loading: false,
    error: null,
    isAuthenticated: true,
    isApproved: true,
    role: currentStaff?.role || null,
    checkPermission,
    switchRole, // Demo only
    signIn: async () => {},
    signOut: async () => {
      setCurrentStaff(null);
    },
  };
};
