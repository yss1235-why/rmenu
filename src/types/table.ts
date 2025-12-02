import { Timestamp } from 'firebase/firestore';

export interface Table {
  id: string;
  restaurantId: string;
  tableNumber: string;
  displayName?: string;
  capacity: number;
  status: TableStatus;
  currentOrderId?: string;
  section?: string;
  notes?: string;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type TableStatus = 'available' | 'occupied' | 'reserved' | 'cleaning';

export interface TableLink {
  tableId: string;
  tableNumber: string;
  displayName?: string;
  menuUrl: string;
  shortUrl?: string;
}

export interface TableSession {
  id: string;
  tableId: string;
  tableNumber: string;
  restaurantId: string;
  startedAt: Timestamp;
  endedAt?: Timestamp;
  orderIds: string[];
  totalSpent: number;
  isActive: boolean;
}

// Generate menu URL for a table
export const generateTableMenuUrl = (
  restaurantSlug: string,
  tableNumber: string,
  baseUrl: string = window.location.origin
): string => {
  return `${baseUrl}/r/${restaurantSlug}/table/${tableNumber}`;
};

// Generate a simple shareable link
export const generateTableLink = (
  table: Table,
  restaurantSlug: string,
  baseUrl?: string
): TableLink => {
  return {
    tableId: table.id,
    tableNumber: table.tableNumber,
    displayName: table.displayName,
    menuUrl: generateTableMenuUrl(restaurantSlug, table.tableNumber, baseUrl),
  };
};
