export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  categoryId: string;
  available: boolean;
  isSpecial: boolean;
}

export interface Category {
  id: string;
  name: string;
  order: number;
  active: boolean;
}

export interface CartItem extends MenuItem {
  quantity: number;
  notes?: string;
}

export interface Order {
  id: string;
  tableNumber: string;
  items: CartItem[];
  status: 'pending' | 'preparing' | 'ready' | 'completed';
  createdAt: Date;
  total: number;
}
