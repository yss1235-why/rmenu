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
    admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    manager: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    kitchen: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    waiter: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  };
  return colors[role];
};
