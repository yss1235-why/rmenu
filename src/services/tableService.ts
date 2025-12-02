import { firestoreService, COLLECTIONS, where, orderBy, Timestamp } from '@/lib/firebase';
import { Table, TableStatus, TableSession } from '@/types/table';

export const tableService = {
  // Get all tables for a restaurant
  async getTables(restaurantId: string): Promise<Table[]> {
    return firestoreService.getCollection<Table>(COLLECTIONS.TABLES, [
      where('restaurantId', '==', restaurantId),
      where('isActive', '==', true),
      orderBy('tableNumber'),
    ]);
  },

  // Get a single table
  async getTable(tableId: string): Promise<Table | null> {
    return firestoreService.getDocument<Table>(COLLECTIONS.TABLES, tableId);
  },

  // Get table by number
  async getTableByNumber(restaurantId: string, tableNumber: string): Promise<Table | null> {
    const tables = await firestoreService.getCollection<Table>(COLLECTIONS.TABLES, [
      where('restaurantId', '==', restaurantId),
      where('tableNumber', '==', tableNumber),
      where('isActive', '==', true),
    ]);
    return tables[0] || null;
  },

  // Create a new table
  async createTable(data: Omit<Table, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return firestoreService.addDocument(COLLECTIONS.TABLES, data);
  },

  // Update table
  async updateTable(tableId: string, data: Partial<Table>): Promise<void> {
    return firestoreService.updateDocument(COLLECTIONS.TABLES, tableId, data);
  },

  // Update table status
  async updateTableStatus(tableId: string, status: TableStatus): Promise<void> {
    return firestoreService.updateDocument(COLLECTIONS.TABLES, tableId, { status });
  },

  // Assign order to table
  async assignOrderToTable(tableId: string, orderId: string): Promise<void> {
    return firestoreService.updateDocument(COLLECTIONS.TABLES, tableId, {
      currentOrderId: orderId,
      status: 'occupied' as TableStatus,
    });
  },

  // Clear table (when order is completed)
  async clearTable(tableId: string): Promise<void> {
    return firestoreService.updateDocument(COLLECTIONS.TABLES, tableId, {
      currentOrderId: null,
      status: 'cleaning' as TableStatus,
    });
  },

  // Set table as available
  async setTableAvailable(tableId: string): Promise<void> {
    return firestoreService.updateDocument(COLLECTIONS.TABLES, tableId, {
      currentOrderId: null,
      status: 'available' as TableStatus,
    });
  },

  // Delete table (soft delete)
  async deleteTable(tableId: string): Promise<void> {
    return firestoreService.updateDocument(COLLECTIONS.TABLES, tableId, { isActive: false });
  },

  // Bulk create tables
  async bulkCreateTables(
    restaurantId: string,
    startNumber: number,
    endNumber: number,
    capacity: number = 4,
    section?: string
  ): Promise<string[]> {
    const tableIds: string[] = [];

    for (let i = startNumber; i <= endNumber; i++) {
      const tableData: Omit<Table, 'id' | 'createdAt' | 'updatedAt'> = {
        restaurantId,
        tableNumber: i.toString(),
        displayName: `Table ${i}`,
        capacity,
        status: 'available',
        section,
        isActive: true,
      };

      const id = await this.createTable(tableData);
      tableIds.push(id);
    }

    return tableIds;
  },

  // Subscribe to tables (real-time)
  subscribeToTables(
    restaurantId: string,
    callback: (tables: Table[]) => void
  ): () => void {
    return firestoreService.subscribeToCollection<Table>(
      COLLECTIONS.TABLES,
      callback,
      [
        where('restaurantId', '==', restaurantId),
        where('isActive', '==', true),
        orderBy('tableNumber'),
      ]
    );
  },

  // Get tables by status
  async getTablesByStatus(restaurantId: string, status: TableStatus): Promise<Table[]> {
    return firestoreService.getCollection<Table>(COLLECTIONS.TABLES, [
      where('restaurantId', '==', restaurantId),
      where('status', '==', status),
      where('isActive', '==', true),
    ]);
  },

  // Get occupied tables with orders
  async getOccupiedTables(restaurantId: string): Promise<Table[]> {
    return this.getTablesByStatus(restaurantId, 'occupied');
  },

  // Table session management
  async startTableSession(tableId: string, restaurantId: string, tableNumber: string): Promise<string> {
    const sessionData: Omit<TableSession, 'id'> = {
      tableId,
      tableNumber,
      restaurantId,
      startedAt: Timestamp.now(),
      orderIds: [],
      totalSpent: 0,
      isActive: true,
    };

    return firestoreService.addDocument('tableSessions', sessionData);
  },

  async endTableSession(sessionId: string, totalSpent: number): Promise<void> {
    return firestoreService.updateDocument('tableSessions', sessionId, {
      endedAt: Timestamp.now(),
      totalSpent,
      isActive: false,
    });
  },

  async addOrderToSession(sessionId: string, orderId: string): Promise<void> {
    const session = await firestoreService.getDocument<TableSession>('tableSessions', sessionId);
    if (session) {
      await firestoreService.updateDocument('tableSessions', sessionId, {
        orderIds: [...session.orderIds, orderId],
      });
    }
  },
};
