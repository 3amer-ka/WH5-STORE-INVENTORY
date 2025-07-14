/**
 * Dashboard component - Main overview of inventory system
 */
import React from 'react';
import { useInventory } from '../../contexts/InventoryContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  Package, 
  Plus, 
  AlertTriangle, 
  TrendingUp, 
  Search,
  BarChart3,
  Clock,
  Users,
  ShoppingCart,
  DollarSign
} from 'lucide-react';

interface DashboardProps {
  onViewChange: (view: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onViewChange }) => {
  const { state } = useInventory();
  const userRole = state.auth.user?.role;

  // Calculate statistics
  const totalItems = state.items.length;
  const inStockItems = state.items.filter(item => item.quantity > 0).length;
  const outOfStockItems = state.items.filter(item => item.quantity === 0).length;
  const lowStockItems = state.items.filter(item => 
    item.minStockLevel && item.quantity > 0 && item.quantity <= item.minStockLevel
  ).length;
  
  const recentActivities = state.activityLog?.slice(0, 5) || [];
  const totalValue = state.items.reduce((sum, item) => sum + (item.quantity * (item.price || 0)), 0);

  const stats = [
    {
      title: 'Total Items',
      value: totalItems,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: '+2.5%',
      trend: 'up'
    },
    {
      title: 'In Stock',
      value: inStockItems,
      icon: ShoppingCart,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: '+1.2%',
      trend: 'up'
    },
    {
      title: 'Low Stock',
      value: lowStockItems,
      icon: AlertTriangle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      change: userRole === 'guest' ? 'Hidden' : '-0.8%',
      trend: 'down'
    },
    {
      title: 'Out of Stock',
      value: outOfStockItems,
      icon: Package,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      change: userRole === 'guest' ? 'Hidden' : '-1.5%',
      trend: 'down'
    }
  ];

  const quickActions = [
    {
      title: 'Search Items',
      description: 'Find and view inventory items',
      icon: Search,
      action: () => onViewChange('search'),
      color: 'bg-blue-600 hover:bg-blue-700',
      available: ['guest', 'team', 'admin']
    },
    {
      title: 'Add New Item',
      description: 'Add a new item to inventory',
      icon: Plus,
      action: () => onViewChange('add-item'),
      color: 'bg-green-600 hover:bg-green-700',
      available: ['team', 'admin']
    },
    {
      title: 'View Reports',
      description: 'Generate and view activity reports',
      icon: BarChart3,
      action: () => onViewChange('activity-log'),
      color: 'bg-purple-600 hover:bg-purple-700',
      available: ['team', 'admin']
    },
    {
      title: 'Scan QR Code',
      description: 'Scan items using QR codes',
      icon: Package,
      action: () => onViewChange('qr-scanner'),
      color: 'bg-orange-600 hover:bg-orange-700',
      available: ['team', 'admin']
    }
  ];

  const availableActions = quickActions.filter(action => 
    action.available.includes(userRole || 'guest')
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {userRole === 'guest' ? 'Welcome! You have view-only access.' : 'Welcome to your inventory management system'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={userRole === 'admin' ? 'default' : userRole === 'team' ? 'secondary' : 'outline'}>
            {userRole === 'admin' ? 'Administrator' : 
             userRole === 'team' ? 'Team Member' : 'Guest User'}
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const showValue = userRole !== 'guest' || !stat.change.includes('Hidden');
          
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {showValue ? stat.value : '••'}
                    </p>
                    {showValue && (
                      <p className={`text-xs ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.change}
                      </p>
                    )}
                  </div>
                  <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            {userRole === 'guest' ? 'Available actions with your current access level' : 'Manage your inventory efficiently'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {availableActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center space-y-2 hover:shadow-md transition-shadow"
                  onClick={action.action}
                >
                  <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium">{action.title}</p>
                    <p className="text-xs text-gray-500">{action.description}</p>
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        {userRole !== 'guest' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Recent Activities</span>
              </CardTitle>
              <CardDescription>Latest system activities</CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivities.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No recent activities</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div key={activity.id || index} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* System Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>System Overview</span>
            </CardTitle>
            <CardDescription>Current system status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Categories</span>
                <span className="text-sm text-gray-500">{state.categories.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Active Users</span>
                <span className="text-sm text-gray-500">
                  {state.auth.user ? 1 : 0}
                </span>
              </div>
              {userRole !== 'guest' && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Value</span>
                    <span className="text-sm text-gray-500">
                      ${totalValue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Storage Usage</span>
                    <span className="text-sm text-gray-500">
                      {(new Blob([localStorage.getItem('wh5-inventory-data') || '']).size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {userRole !== 'guest' && lowStockItems > 0 && (
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-yellow-800 dark:text-yellow-200">
              <AlertTriangle className="w-5 h-5" />
              <span>Low Stock Alert</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-700 dark:text-yellow-300 mb-4">
              {lowStockItems} item(s) are running low on stock and need attention.
            </p>
            <Button
              variant="outline"
              className="border-yellow-300 text-yellow-800 hover:bg-yellow-100"
              onClick={() => onViewChange('search')}
            >
              View Low Stock Items
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
