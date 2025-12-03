import { Timestamp } from 'firebase/firestore';

export type StaffRole = 'admin' | 'manager' | 'kitchen' | 'waiter';

export interface Staff {
  id: string;
  restaurantId: string;
  email: string;
  name: string;
  phone?: string;
  role: StaffRole;
  avatar?: string;
  isActive: boolean;
  isApproved: boolean;
  approvedBy?: string;
  approvedAt?: Timestamp;
  lastLoginAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface StaffInvite {
  id: string;
  restaurantId: string;
  email: string;
  name: string;
  role: StaffRole;
  invitedBy: string;
  invitedAt: Timestamp;
  expiresAt: Timestamp;
  acceptedAt?: Timestamp;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
}

// Role permissions
export interface RolePermissions {
  canManageMenu: boolean;
  canManageOrders: boolean;
  canManageTables: boolean;
  canManageStaff: boolean;
  canViewReports: boolean;
  canManageSettings: boolean;
  canUpdateOrderStatus: boolean;
  canVerifyPayments: boolean;
}

export const ROLE_PERMISSIONS: Record<StaffRole, RolePermissions> = {
  admin: {
    canManageMenu: true,
    canManageOrders: true,
    canManageTables: true,
    canManageStaff: true,
    canViewReports: true,
    canManageSettings: true,
    canUpdateOrderStatus: true,
    canVerifyPayments: true,
  },
  manager: {
    canManageMenu: true,
    canManageOrders: true,
    canManageTables: true,
    canManageStaff: false,
    canViewReports: true,
    canManageSettings: false,
    canUpdateOrderStatus: true,
    canVerifyPayments: true,
  },
  kitchen: {
    canManageMenu: false,
    canManageOrders: true,
    canManageTables: false,
    canManageStaff: false,
    canViewReports: false,
    canManageSettings: false,
    canUpdateOrderStatus: true,
    canVerifyPayments: false,
  },
  waiter: {
    canManageMenu: false,
    canManageOrders: true,
    canManageTables: true,
    canManageStaff: false,
    canViewReports: false,
    canManageSettings: false,
    canUpdateOrderStatus: true,
    canVerifyPayments: true,
  },
};

// Helper functions
export const hasPermission = (
  role: StaffRole,
  permission: keyof RolePermissions
): boolean => {
  return ROLE_PERMISSIONS[role][permission];
};

export const getRoleDisplayName = (role: StaffRole): string => {
  const names: Record<StaffRole, string> = {
    admin: 'Administrator',
    manager: 'Manager',
    kitchen: 'Kitchen Staff',
    waiter: 'Waiter',
  };
  return names[role];
};

export const getRoleColor = (role: StaffRole): string => {
  const colors: Record<StaffRole, string> = {
    admin: 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary',
    manager: 'bg-info/10 text-info dark:bg-info/20 dark:text-info',
    kitchen: 'bg-warning/10 text-warning dark:bg-warning/20 dark:text-warning',
    waiter: 'bg-success/10 text-success dark:bg-success/20 dark:text-success',
  };
  return colors[role];
};
