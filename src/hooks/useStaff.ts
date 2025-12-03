import { useState, useEffect, useCallback } from 'react';
import { staffService } from '@/services/staffService';
import { Staff, StaffRole, RolePermissions, hasPermission } from '@/types/staff';

interface UseStaffOptions {
  restaurantId: string;
  realtime?: boolean;
}

export const useStaff = ({ restaurantId, realtime = true }: UseStaffOptions) => {
  const [staffMembers, setStaffMembers] = useState<Staff[]>([]);
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
            setStaffMembers(data);
            setLoading(false);
          });
        } else {
          const data = await staffService.getRestaurantStaff(restaurantId);
          setStaffMembers(data);
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

  // Add staff member
  const addStaff = useCallback(
    async (data: { name: string; email: string; role: StaffRole }) => {
      return staffService.createStaff({
        restaurantId,
        name: data.name,
        email: data.email,
        role: data.role,
        isActive: true,
        isApproved: true, // Auto-approve when added by admin
      });
    },
    [restaurantId]
  );

  // Update staff role
  const updateStaffRole = useCallback(
    async (staffId: string, role: StaffRole) => {
      return staffService.updateStaff(staffId, { role });
    },
    []
  );

  // Approve staff member
  const approveStaff = useCallback(
    async (staffId: string) => {
      return staffService.approveStaff(staffId);
    },
    []
  );

  // Deactivate staff member
  const deactivateStaff = useCallback(
    async (staffId: string) => {
      return staffService.updateStaff(staffId, { isActive: false });
    },
    []
  );

  // Delete staff member
  const deleteStaff = useCallback(
    async (staffId: string) => {
      return staffService.deleteStaff(staffId);
    },
    []
  );

  // Get staff by role
  const getStaffByRole = useCallback(
    (role: StaffRole): Staff[] => {
      return staffMembers.filter((s) => s.role === role && s.isActive && s.isApproved);
    },
    [staffMembers]
  );

  // Filter helpers
  const activeStaff = staffMembers.filter((s) => s.isActive && s.isApproved);
  const pendingStaff = staffMembers.filter((s) => s.isActive && !s.isApproved);

  return {
    staffMembers,
    activeStaff,
    pendingStaff,
    loading,
    error,
    addStaff,
    updateStaffRole,
    approveStaff,
    deactivateStaff,
    deleteStaff,
    getStaffByRole,
  };
};

// Hook for checking staff permissions
export const useStaffPermissions = (role: StaffRole | null) => {
  const checkPermission = useCallback(
    (permission: keyof RolePermissions): boolean => {
      if (!role) return false;
      return hasPermission(role, permission);
    },
    [role]
  );

  const permissions: RolePermissions | null = role
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
