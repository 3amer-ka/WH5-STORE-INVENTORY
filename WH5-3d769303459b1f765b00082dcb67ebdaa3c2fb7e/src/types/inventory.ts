/**
 * Type definitions for the inventory management system
 */

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unit: string;
  categoryId: string;
  waybillNumber: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  price?: number;
  minStockLevel?: number;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  createdAt: Date;
}

export interface ActivityLog {
  id: string;
  type: 'add' | 'update' | 'delete' | 'scan' | 'search';
  description: string;
  itemId?: string;
  timestamp: Date;
  userId?: string;
  details?: Record<string, any>;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'team' | 'guest';
  createdAt: Date;
  lastLogin?: Date;
}

export interface Settings {
  theme: 'light' | 'dark';
  colorScheme: 'blue' | 'green' | 'purple' | 'orange';
  density: 'compact' | 'normal' | 'spacious';
  adminPasscode: string;
  geminiApiKey: string;
  githubLink: string;
  companyDomain: string;
  autoLogout: boolean;
  rememberSession: boolean;
  lowStockAlerts: boolean;
  activityNotifications: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  sessionExpiry: Date | null;
}

export interface InventoryState {
  items: InventoryItem[];
  categories: Category[];
  activityLog: ActivityLog[];
  settings: Settings;
  auth: AuthState;
}

export type InventoryAction = 
  | { type: 'ADD_ITEM'; payload: InventoryItem }
  | { type: 'UPDATE_ITEM'; payload: InventoryItem }
  | { type: 'DELETE_ITEM'; payload: string }
  | { type: 'SET_ITEMS'; payload: InventoryItem[] }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'UPDATE_CATEGORY'; payload: Category }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'SET_CATEGORIES'; payload: Category[] }
  | { type: 'ADD_ACTIVITY'; payload: ActivityLog }
  | { type: 'SET_ACTIVITY_LOG'; payload: ActivityLog[] }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<Settings> }
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'REFRESH_SESSION' };
