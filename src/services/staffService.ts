import { firestoreService, COLLECTIONS, where, orderBy, Timestamp } from '@/lib/firebase';
import { Staff, StaffRole, StaffInvite } from '@/types/staff';

export const staffService = {
  // Get all staff for a restaurant
  async getStaff(restaurantId: string): Promise<Staff[]> {
    return firestoreService.getCollection<Staff>(COLLECTIONS.USERS, [
      where('restaurantId', '==', restaurantId),
      where('isActive', '==', true),
      orderBy('name'),
    ]);
  },

  // Get approved staff only
  async getApprovedStaff(restaurantId: string): Promise<Staff[]> {
    return firestoreService.getCollection<Staff>(COLLECTIONS.USERS, [
      where('restaurantId', '==', restaurantId),
      where('isActive', '==', true),
      where('isApproved', '==', true),
    ]);
  },

  // Get pending approval staff
  async getPendingStaff(restaurantId: string): Promise<Staff[]> {
    return firestoreService.getCollection<Staff>(COLLECTIONS.USERS, [
      where('restaurantId', '==', restaurantId),
      where('isActive', '==', true),
      where('isApproved', '==', false),
    ]);
  },

  // Get staff by email
  async getStaffByEmail(email: string): Promise<Staff | null> {
    const staff = await firestoreService.getCollection<Staff>(COLLECTIONS.USERS, [
      where('email', '==', email),
      where('isActive', '==', true),
    ]);
    return staff[0] || null;
  },

  // Get staff by ID
  async getStaffById(staffId: string): Promise<Staff | null> {
    return firestoreService.getDocument<Staff>(COLLECTIONS.USERS, staffId);
  },

  // Get staff by role
  async getStaffByRole(restaurantId: string, role: StaffRole): Promise<Staff[]> {
    return firestoreService.getCollection<Staff>(COLLECTIONS.USERS, [
      where('restaurantId', '==', restaurantId),
      where('role', '==', role),
      where('isActive', '==', true),
      where('isApproved', '==', true),
    ]);
  },

  // Create new staff member
  async createStaff(data: Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return firestoreService.addDocument(COLLECTIONS.USERS, data);
  },

  // Update staff
  async updateStaff(staffId: string, data: Partial<Staff>): Promise<void> {
    return firestoreService.updateDocument(COLLECTIONS.USERS, staffId, data);
  },

  // Approve staff member
  async approveStaff(staffId: string, approvedBy: string): Promise<void> {
    return firestoreService.updateDocument(COLLECTIONS.USERS, staffId, {
      isApproved: true,
      approvedBy,
      approvedAt: Timestamp.now(),
    });
  },

  // Reject/deactivate staff member
  async deactivateStaff(staffId: string): Promise<void> {
    return firestoreService.updateDocument(COLLECTIONS.USERS, staffId, {
      isActive: false,
    });
  },

  // Change staff role (admin only)
  async changeStaffRole(staffId: string, newRole: StaffRole): Promise<void> {
    return firestoreService.updateDocument(COLLECTIONS.USERS, staffId, {
      role: newRole,
    });
  },

  // Update last login
  async updateLastLogin(staffId: string): Promise<void> {
    return firestoreService.updateDocument(COLLECTIONS.USERS, staffId, {
      lastLoginAt: Timestamp.now(),
    });
  },

  // Subscribe to staff changes
  subscribeToStaff(
    restaurantId: string,
    callback: (staff: Staff[]) => void
  ): () => void {
    return firestoreService.subscribeToCollection<Staff>(
      COLLECTIONS.USERS,
      callback,
      [
        where('restaurantId', '==', restaurantId),
        where('isActive', '==', true),
      ]
    );
  },

  // Staff invites
  async createInvite(data: Omit<StaffInvite, 'id'>): Promise<string> {
    return firestoreService.addDocument('staffInvites', data);
  },

  async getInvite(inviteId: string): Promise<StaffInvite | null> {
    return firestoreService.getDocument<StaffInvite>('staffInvites', inviteId);
  },

  async getPendingInvites(restaurantId: string): Promise<StaffInvite[]> {
    return firestoreService.getCollection<StaffInvite>('staffInvites', [
      where('restaurantId', '==', restaurantId),
      where('status', '==', 'pending'),
    ]);
  },

  async acceptInvite(inviteId: string): Promise<void> {
    return firestoreService.updateDocument('staffInvites', inviteId, {
      status: 'accepted',
      acceptedAt: Timestamp.now(),
    });
  },

  async cancelInvite(inviteId: string): Promise<void> {
    return firestoreService.updateDocument('staffInvites', inviteId, {
      status: 'cancelled',
    });
  },

  // Register staff after Google OAuth
  async registerStaffFromOAuth(
    restaurantId: string,
    email: string,
    name: string,
    role: StaffRole = 'waiter'
  ): Promise<string> {
    // Check if staff already exists
    const existing = await this.getStaffByEmail(email);
    if (existing) {
      throw new Error('Staff member with this email already exists');
    }

    const staffData: Omit<Staff, 'id' | 'createdAt' | 'updatedAt'> = {
      restaurantId,
      email,
      name,
      role,
      isActive: true,
      isApproved: false, // Requires admin approval
    };

    return this.createStaff(staffData);
  },
};
