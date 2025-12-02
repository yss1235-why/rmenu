import { useState, useEffect, useCallback } from 'react';
import { staffService } from '@/services/staffService';
import { Staff, StaffRole, hasPermission, RolePermissions } from '@/types/staff';

interface UseStaffOptions {
  restaurantId: string;
  realtime?: boolean;
}

export const useStaff = ({ restaurantId, realtime = true }: UseStaffOptions) => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const fetchStaff = async () => {
      try {
        setLoading(true);
        setError(null);

        if (realtime) {
          unsubscribe = staffService.subscribeToStaff(restaurantId, (data) => {
            setStaff(data);
            setLoading(false);
          });
        } else {
          const data = await staffService.getStaff(restaurantId);
          setStaff(data);
          setLoading(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch staff'));
        setLoading(false);
      }
    };

    if (restaurantId) {
      fetchStaff();
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [restaurantId, realtime]);

  // Create staff member
  const createStaff = useCallback(
    async (data: Omit<Staff, 'id' | 'createdAt' | 'updatedAt' | 'restaurantId'>) => {
      return staffService.createStaff({
        ...data,
        restaurantId,
      });
    },
    [restaurantId]
  );

  // Update staff
  const updateStaff = useCallback(async (staffId: string, data: Partial<Staff>) => {
    return staffService.updateStaff(staffId, data);
  }, []);

  // Approve staff
  const approveStaff = useCallback(async (staffId: string, approvedBy: string) => {
    return staffService.approveStaff(staffId, approvedBy);
  }, []);

  // Deactivate staff
  const deactivateStaff = useCallback(async (staffId: string) => {
    return staffService.deactivateStaff(staffId);
  }, []);

  // Change role
  const changeRole = useCallback(async (staffId: string, newRole: StaffRole) => {
    return staffService.changeStaffRole(staffId, newRole);
  }, []);

  // Filter helpers
  const approvedStaff = staff.filter((s) => s.isApproved);
  const pendingStaff = staff.filter((s) => !s.isApproved);
  const admins = staff.filter((s) => s.role === 'admin' && s.isApproved);
  const managers = staff.filter((s) => s.role === 'manager' && s.isApproved);
  const kitchenStaff = staff.filter((s) => s.role === 'kitchen' && s.isApproved);
  const waiters = staff.filter((s) => s.role === 'waiter' && s.isApproved);

  // Get staff by role
  const getStaffByRole = useCallback(
    (role: StaffRole): Staff[] => {
      return staff.filter((s) => s.role === role && s.isApproved);
    },
    [staff]
  );

  return {
    staff,
    loading,
    error,
    createStaff,
    updateStaff,
    approveStaff,
    deactivateStaff,
    changeRole,
    getStaffByRole,
    approvedStaff,
    pendingStaff,
    admins,
    managers,
    kitchenStaff,
    waiters,
  };
};

// Hook for current user's permissions
export const usePermissions = (role: StaffRole | null) => {
  const checkPermission = useCallback(
    (permission: keyof RolePermissions): boolean => {
      if (!role) return false;
      return hasPermission(role, permission);
    },
    [role]
  );

  const permissions = role
    ? {
        canManageMenu: hasPermission(role, 'canManageMenu'),
        canManageOrders: hasPermission(role, 'canManageOrders'),
        canManageTables: hasPermission(role, 'canManageTables'),
        canManageStaff: hasPermission(role, 'canManageStaff'),
        canViewReports: hasPermission(role, 'canViewReports'),
        canManageSettings: hasPermission(role, 'canManageSettings'),
        canUpdateOrderStatus: hasPermission(role, 'canUpdateOrderStatus'),
        canVerifyPayments: hasPermission(role, 'canVerifyPayments'),
      }
    : null;

  return { checkPermission, permissions };
};

// Demo staff for development
export const useDemoStaff = (): Staff[] => {
  return [
    {
      id: 'staff-1',
      restaurantId: 'demo',
      email: 'admin@restaurant.com',
      name: 'John Admin',
      role: 'admin',
      isActive: true,
      isApproved: true,
      createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
      updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
    },
    {
      id: 'staff-2',
      restaurantId: 'demo',
      email: 'manager@restaurant.com',
      name: 'Sarah Manager',
      role: 'manager',
      isActive: true,
      isApproved: true,
      createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
      updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
    },
    {
      id: 'staff-3',
      restaurantId: 'demo',
      email: 'chef@restaurant.com',
      name: 'Mike Chef',
      role: 'kitchen',
      isActive: true,
      isApproved: true,
      createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
      updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
    },
    {
      id: 'staff-4',
      restaurantId: 'demo',
      email: 'waiter@restaurant.com',
      name: 'Emma Waiter',
      role: 'waiter',
      isActive: true,
      isApproved: true,
      createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
      updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
    },
    {
      id: 'staff-5',
      restaurantId: 'demo',
      email: 'pending@restaurant.com',
      name: 'New Staff',
      role: 'waiter',
      isActive: true,
      isApproved: false,
      createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
      updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
    },
  ];
};
