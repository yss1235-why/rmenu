import { useState, useEffect, useCallback } from 'react';
import { tableService } from '@/services/tableService';
import { Table, TableStatus, TableLink, generateTableLink } from '@/types/table';

interface UseTablesOptions {
  restaurantId: string;
  restaurantSlug?: string;
  realtime?: boolean;
}

export const useTables = ({ 
  restaurantId, 
  restaurantSlug = 'restaurant',
  realtime = true 
}: UseTablesOptions) => {
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

  // Create a single table
  const createTable = useCallback(
    async (data: {
      tableNumber: string;
      displayName?: string;
      capacity: number;
      section?: string;
    }) => {
      return tableService.createTable({
        restaurantId,
        tableNumber: data.tableNumber,
        displayName: data.displayName || `Table ${data.tableNumber}`,
        capacity: data.capacity,
        status: 'available',
        section: data.section,
        isActive: true,
      });
    },
    [restaurantId]
  );

  // Update table details
  const updateTable = useCallback(
    async (tableId: string, data: Partial<Table>) => {
      return tableService.updateTable(tableId, data);
    },
    []
  );

  // Update table status
  const updateStatus = useCallback(
    async (tableId: string, status: TableStatus) => {
      return tableService.updateTableStatus(tableId, status);
    },
    []
  );

  // Delete table
  const deleteTable = useCallback(
    async (tableId: string) => {
      return tableService.deleteTable(tableId);
    },
    []
  );

  // Bulk create tables
  const bulkCreateTables = useCallback(
    async (startNumber: number, endNumber: number, capacity: number, section?: string) => {
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
