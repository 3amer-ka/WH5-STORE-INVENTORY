/**
 * InventoryContext provides state management for the inventory application
 */
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { InventoryState, InventoryAction } from '../types/inventory';

const initialState: InventoryState = {
  items: [],
  categories: [
    {
      id: 'default',
      name: 'General',
      description: 'Default category for uncategorized items',
      color: '#3B82F6',
      createdAt: new Date()
    }
  ],
  activityLog: [],
  settings: {
    theme: 'light',
    colorScheme: 'blue',
    density: 'normal',
    adminPasscode: 'admin123',
    geminiApiKey: '',
    githubLink: 'https://github.com/wh5-construction/inventory-pro',
    companyDomain: 'wh5construction.com',
    autoLogout: false,
    rememberSession: true,
    lowStockAlerts: true,
    activityNotifications: false
  },
  auth: {
    isAuthenticated: false,
    user: null,
    sessionExpiry: null
  }
};

function inventoryReducer(state: InventoryState, action: InventoryAction): InventoryState {
  switch (action.type) {
    case 'ADD_ITEM':
      return {
        ...state,
        items: [...state.items, action.payload]
      };

    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id ? action.payload : item
        )
      };

    case 'DELETE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };

    case 'SET_ITEMS':
      return {
        ...state,
        items: action.payload
      };

    case 'ADD_CATEGORY':
      return {
        ...state,
        categories: [...state.categories, action.payload]
      };

    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map(category =>
          category.id === action.payload.id ? action.payload : category
        )
      };

    case 'DELETE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter(category => category.id !== action.payload)
      };

    case 'SET_CATEGORIES':
      return {
        ...state,
        categories: action.payload
      };

    case 'ADD_ACTIVITY':
      return {
        ...state,
        activityLog: [action.payload, ...state.activityLog]
      };

    case 'SET_ACTIVITY_LOG':
      return {
        ...state,
        activityLog: action.payload
      };

    case 'UPDATE_SETTINGS':
      const newSettings = { ...state.settings, ...action.payload };
      
      // Apply theme changes to document
      if (action.payload.theme) {
        if (action.payload.theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
      
      return {
        ...state,
        settings: newSettings
      };

    case 'LOGIN':
      const sessionExpiry = new Date();
      sessionExpiry.setHours(sessionExpiry.getHours() + 8); // 8 hour session
      
      return {
        ...state,
        auth: {
          isAuthenticated: true,
          user: action.payload,
          sessionExpiry
        }
      };

    case 'LOGOUT':
      return {
        ...state,
        auth: {
          isAuthenticated: false,
          user: null,
          sessionExpiry: null
        }
      };

    case 'REFRESH_SESSION':
      if (state.auth.isAuthenticated) {
        const newExpiry = new Date();
        newExpiry.setHours(newExpiry.getHours() + 8);
        
        return {
          ...state,
          auth: {
            ...state.auth,
            sessionExpiry: newExpiry
          }
        };
      }
      return state;

    default:
      return state;
  }
}

const InventoryContext = createContext<{
  state: InventoryState;
  dispatch: React.Dispatch<InventoryAction>;
} | null>(null);

export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(inventoryReducer, initialState);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('wh5-inventory-data');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        
        // Ensure all required properties exist
        if (parsedData.items) {
          dispatch({ type: 'SET_ITEMS', payload: parsedData.items });
        }
        
        if (parsedData.categories) {
          dispatch({ type: 'SET_CATEGORIES', payload: parsedData.categories });
        }
        
        if (parsedData.settings) {
          dispatch({ type: 'UPDATE_SETTINGS', payload: parsedData.settings });
        }
        
        if (parsedData.activityLog) {
          // Ensure activityLog is an array
          const activityLog = Array.isArray(parsedData.activityLog) ? parsedData.activityLog : [];
          dispatch({ type: 'SET_ACTIVITY_LOG', payload: activityLog });
        }

        // Check for saved authentication
        if (parsedData.auth && parsedData.auth.isAuthenticated) {
          const sessionExpiry = new Date(parsedData.auth.sessionExpiry);
          if (sessionExpiry > new Date()) {
            dispatch({ type: 'LOGIN', payload: parsedData.auth.user });
          }
        }
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    const dataToSave = {
      items: state.items,
      categories: state.categories,
      activityLog: state.activityLog,
      settings: state.settings,
      auth: state.settings.rememberSession ? state.auth : { isAuthenticated: false, user: null, sessionExpiry: null }
    };
    
    localStorage.setItem('wh5-inventory-data', JSON.stringify(dataToSave));
  }, [state]);

  // Apply theme on mount and when it changes
  useEffect(() => {
    if (state.settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.settings.theme]);

  // Auto-logout functionality
  useEffect(() => {
    if (state.auth.isAuthenticated && state.auth.sessionExpiry) {
      const checkSession = () => {
        const now = new Date();
        if (now > new Date(state.auth.sessionExpiry!)) {
          dispatch({ type: 'LOGOUT' });
        }
      };

      const interval = setInterval(checkSession, 60000); // Check every minute
      return () => clearInterval(interval);
    }
  }, [state.auth.isAuthenticated, state.auth.sessionExpiry]);

  return (
    <InventoryContext.Provider value={{ state, dispatch }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
