import { useState, useEffect, useCallback } from 'react';
import { tableService } from '@/services/tableService';
import { Table, TableStatus, generateTableLink, TableLink } from '@/types/table';

interface UseTablesOptions {
  restaurantId: string;
  restaurantSlug?: string;
  realtime?: boolean;
}

export const useTables = ({ restaurantId, restaurantSlug, realtime = true }: UseTablesOptions) => {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const fetchTables = async () => {
      try {
        setLoading(true);
        setError(null);

        if (realtime) {
          unsubscribe = tableService.subscribeToTables(restaurantId, (data) => {
            setTables(data);
            setLoading(false);
          });
        } else {
          const data = await tableService.getTables(restaurantId);
          setTables(data);
          setLoading(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch tables'));
        setLoading(false);
      }
    };

    if (restaurantId) {
      fetchTables();
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [restaurantId, realtime]);

  // Create table
  const createTable = useCallback(
    async (data: Omit<Table, 'id' | 'createdAt' | 'updatedAt' | 'restaurantId'>) => {
      return tableService.createTable({
        ...data,
        restaurantId,
      });
    },
    [restaurantId]
  );

  // Update table
  const updateTable = useCallback(async (tableId: string, data: Partial<Table>) => {
    return tableService.updateTable(tableId, data);
  }, []);

  // Update status
  const updateStatus = useCallback(async (tableId: string, status: TableStatus) => {
    return tableService.updateTableStatus(tableId, status);
  }, []);

  // Delete table
  const deleteTable = useCallback(async (tableId: string) => {
    return tableService.deleteTable(tableId);
  }, []);

  // Bulk create tables
  const bulkCreateTables = useCallback(
    async (startNumber: number, endNumber: number, capacity?: number, section?: string) => {
      return tableService.bulkCreateTables(restaurantId, startNumber, endNumber, capacity, section);
    },
    [restaurantId]
  );

  // Generate table links
  const generateTableLinks = useCallback((): TableLink[] => {
    if (!restaurantSlug) return [];
    return tables.map((table) => generateTableLink(table, restaurantSlug));
  }, [tables, restaurantSlug]);

  // Get table by number
  const getTableByNumber = useCallback(
    (tableNumber: string): Table | undefined => {
      return tables.find((t) => t.tableNumber === tableNumber);
    },
    [tables]
  );

  // Filter helpers
  const availableTables = tables.filter((t) => t.status === 'available');
  const occupiedTables = tables.filter((t) => t.status === 'occupied');
  const reservedTables = tables.filter((t) => t.status === 'reserved');

  // Get tables by section
  const getTablesBySection = useCallback(
    (section: string): Table[] => {
      return tables.filter((t) => t.section === section);
    },
    [tables]
  );

  // Get unique sections
  const sections = [...new Set(tables.filter((t) => t.section).map((t) => t.section!))];

  return {
    tables,
    loading,
    error,
    createTable,
    updateTable,
    updateStatus,
    deleteTable,
    bulkCreateTables,
    generateTableLinks,
    getTableByNumber,
    getTablesBySection,
    availableTables,
    occupiedTables,
    reservedTables,
    sections,
  };
};

// Demo tables for development
export const useDemoTables = (restaurantSlug: string = 'demo'): {
  tables: Table[];
  generateTableLinks: () => TableLink[];
} => {
  const tables: Table[] = Array.from({ length: 12 }, (_, i) => ({
    id: `table-${i + 1}`,
    restaurantId: 'demo',
    tableNumber: (i + 1).toString(),
    displayName: `Table ${i + 1}`,
    capacity: i < 6 ? 2 : i < 10 ? 4 : 6,
    status: ['available', 'occupied', 'available', 'reserved'][i % 4] as TableStatus,
    section: i < 6 ? 'Main Hall' : 'Patio',
    isActive: true,
    createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
    updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
  }));

  const generateTableLinks = (): TableLink[] => {
    return tables.map((table) => generateTableLink(table, restaurantSlug));
  };

  return { tables, generateTableLinks };
};
