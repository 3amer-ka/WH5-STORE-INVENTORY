import { createContext, useContext, ReactNode, useState } from 'react';

type InventoryItem = {
  id: string;
  name: string;
  quantity: number;
  category: string;
  lastUpdated: Date;
  minStockLevel?: number;
  unitType?: string;
  price?: number;
};

type InventoryContextType = {
  inventory: InventoryItem[];
  addItem: (item: Omit<InventoryItem, 'id' | 'lastUpdated'>) => void;
  updateItem: (id: string, updates: Partial<InventoryItem>) => void;
  deleteItem: (id: string) => void;
  getItem: (id: string) => InventoryItem | undefined;
};

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  const addItem = (item: Omit<InventoryItem, 'id' | 'lastUpdated'>) => {
    setInventory(prev => [
      ...prev,
      {
        ...item,
        id: crypto.randomUUID(),
        lastUpdated: new Date()
      }
    ]);
  };

  const updateItem = (id: string, updates: Partial<InventoryItem>) => {
    setInventory(prev =>
      prev.map(item =>
        item.id === id ? { ...item, ...updates, lastUpdated: new Date() } : item
      )
    );
  };

  const deleteItem = (id: string) => {
    setInventory(prev => prev.filter(item => item.id !== id));
  };

  const getItem = (id: string) => {
    return inventory.find(item => item.id === id);
  };

  return (
    <InventoryContext.Provider
      value={{ inventory, addItem, updateItem, deleteItem, getItem }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
}
