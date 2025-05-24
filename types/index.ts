export type OrderType = 'food' | 'drink';

export type ItemStatus = 'pending' | 'served';

export type OrderStatus = 'pending' | 'served' | 'paid';

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  type: OrderType;
  notes?: string;
  status: ItemStatus;
}

export interface Order {
  id: string;
  tableId: string;
  tableNumber: number;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  foodStatus: OrderStatus;
  drinkStatus: OrderStatus;
  createdAt: string;
  updatedAt: string;
  paymentMethod?: 'cash' | 'card';
}

export type TableStatus = 'available' | 'occupied' | 'reserved' | 'readyToPay';

export interface Table {
  id: string;
  number: number;
  seats: number;
  status: TableStatus;
  orderId?: string;
  reservationName?: string;
  reservationTime?: string;
}

export interface Category {
  id: string;
  name: string;
  type: OrderType;
  order: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  type: OrderType;
  available: boolean;
  image?: string;
}

export interface User {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'manager' | 'waiter' | 'kitchen' | 'bar' | 'cashier';
  email?: string;
  phone?: string;
  avatar?: string;
  active: boolean;
  lastLogin?: string;
}

export interface DailyRevenue {
  date: string;
  revenue: number;
  orders: number;
}

export interface DailyStats {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  topSellingItems: {
    id: string;
    name: string;
    quantity: number;
    revenue: number;
  }[];
  paymentMethods: {
    cash: number;
    card: number;
  };
}

export interface MonthlyStats {
  month: string;
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  comparisonWithPreviousMonth: {
    revenue: number;
    orders: number;
  };
}

export interface YearlyStats {
  year: number;
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  revenueByMonth: {
    month: string;
    revenue: number;
  }[];
}

export interface AppSettings {
  restaurantName: string;
  address: string;
  phone: string;
  email: string;
  vatNumber: string;
  currency: string;
  language: string;
  theme: 'light' | 'dark' | 'system';
  tableLayout: {
    rows: number;
    columns: number;
  };
  printers: {
    kitchen: string[];
    bar: string[];
    cashier: string[];
  };
}

export interface Printer {
  id: string;
  name: string;
  ipAddress: string;
  port: number;
  type: 'kitchen' | 'bar' | 'cashier';
  active: boolean;
}