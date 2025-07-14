/**
 * Sidebar navigation component for the WH5 Inventory Management System
 */
import React from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useInventory } from '../../contexts/InventoryContext';
import { 
  LayoutDashboard, 
  Plus, 
  Search, 
  FolderOpen, 
  Activity, 
  QrCode, 
  Bot, 
  Settings,
  Sun,
  Moon,
  Lock
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const { state, dispatch } = useInventory();
  const userRole = state.auth.user?.role;

  const allMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['guest', 'team', 'admin'] },
    { id: 'search', label: 'Search & Filter', icon: Search, roles: ['guest', 'team', 'admin'] },
    { id: 'add-item', label: 'Add Item', icon: Plus, roles: ['team', 'admin'] },
    { id: 'categories', label: 'Categories', icon: FolderOpen, roles: ['team', 'admin'] },
    { id: 'activity-log', label: 'Activity Log', icon: Activity, roles: ['team', 'admin'] },
    { id: 'qr-scanner', label: 'QR Scanner', icon: QrCode, roles: ['team', 'admin'] },
    { id: 'ai-assistant', label: 'AI Assistant', icon: Bot, roles: ['team', 'admin'] },
    { id: 'settings', label: 'Settings', icon: Settings, roles: ['team', 'admin'] },
  ];

  // Filter menu items based on user role
  const menuItems = allMenuItems.filter(item => 
    item.roles.includes(userRole || 'guest')
  );

  const toggleTheme = () => {
    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: {
        theme: state.settings.theme === 'dark' ? 'light' : 'dark'
      }
    });
  };

  const lowStockCount = state.items.filter(item => 
    item.minStockLevel && item.quantity <= item.minStockLevel
  ).length;

  return (
    <div className="w-64 bg-white dark:bg-gray-800 shadow-lg h-screen overflow-y-auto">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center mb-2">
          <img 
            src="https://pub-cdn.sider.ai/u/U0L5HA06Y61/web-coder/686ea315eca24d79d7558b3f/resource/ca013780-7452-427b-95c7-73505a2ff2b7.jpeg" 
            alt="WH5 Construction Store Logo" 
            className="w-32 h-auto"
          />
        </div>
        <h1 className="text-lg font-bold text-center text-gray-900 dark:text-white">
          Inventory Pro
        </h1>
        <p className="text-sm text-center text-gray-500 dark:text-gray-400 mt-1">
          Construction Management
        </p>
      </div>

      {/* User Role Badge */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center space-x-2">
          <Badge variant={userRole === 'admin' ? 'default' : userRole === 'team' ? 'secondary' : 'outline'}>
            {userRole === 'admin' ? '👑 Administrator' : 
             userRole === 'team' ? '👥 Team Member' : '👤 Guest'}
          </Badge>
        </div>
        {userRole === 'guest' && (
          <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
            View-only access
          </p>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          const showBadge = item.id === 'activity-log' && lowStockCount > 0;
          const isRestricted = !item.roles.includes(userRole || 'guest');

          return (
            <Button
              key={item.id}
              variant={isActive ? 'default' : 'ghost'}
              className={`w-full justify-start ${
                isActive 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : isRestricted
                  ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              onClick={() => onViewChange(item.id)}
              disabled={isRestricted}
            >
              <Icon className="w-4 h-4 mr-3" />
              <span className="flex-1 text-left">{item.label}</span>
              {isRestricted && <Lock className="w-3 h-3 ml-2" />}
              {showBadge && !isRestricted && (
                <Badge variant="destructive" className="ml-2">
                  {lowStockCount}
                </Badge>
              )}
            </Button>
          );
        })}
      </nav>

      {/* Theme Toggle */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={toggleTheme}
        >
          {state.settings.theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 mr-3" />
              Light Mode
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 mr-3" />
              Dark Mode
            </>
          )}
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Total Items:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {state.items.length}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Categories:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {state.categories.length}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">In Stock:</span>
            <span className="font-medium text-green-600 dark:text-green-400">
              {state.items.filter(item => item.quantity > 0).length}
            </span>
          </div>
          {userRole !== 'guest' && (
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Low Stock:</span>
              <span className="font-medium text-yellow-600 dark:text-yellow-400">
                {lowStockCount}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
