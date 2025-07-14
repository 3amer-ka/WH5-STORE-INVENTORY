/**
 * ActivityLog component for viewing system activity and audit trail
 */
import React, { useState, useMemo } from 'react';
import { useInventory } from '../../contexts/InventoryContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  Activity, 
  Clock, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  Download,
  FileText,
  Calendar,
  Printer
} from 'lucide-react';

interface ActivityLogProps {
  onViewChange: (view: string) => void;
}

const ActivityLog: React.FC<ActivityLogProps> = ({ onViewChange }) => {
  const { state } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  const activityTypes = [
    { value: 'create', label: 'Create', icon: Plus, color: 'bg-green-100 text-green-800' },
    { value: 'update', label: 'Update', icon: Edit, color: 'bg-blue-100 text-blue-800' },
    { value: 'delete', label: 'Delete', icon: Trash2, color: 'bg-red-100 text-red-800' },
    { value: 'scan', label: 'Scan', icon: Activity, color: 'bg-purple-100 text-purple-800' }
  ];

  const dateFilters = [
    { value: 'all', label: 'All time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This week' },
    { value: 'month', label: 'This month' }
  ];

  const filteredActivities = useMemo(() => {
    if (!state.activityLog || !Array.isArray(state.activityLog)) {
      return [];
    }

    return state.activityLog.filter(activity => {
      // Ensure activity has required properties
      if (!activity || !activity.description || !activity.timestamp) {
        return false;
      }

      // Search filter
      const matchesSearch = !searchTerm || 
        activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (activity.type && activity.type.toLowerCase().includes(searchTerm.toLowerCase()));

      // Type filter
      const matchesType = selectedType === 'all' || activity.type === selectedType;

      // Date filter
      let matchesDate = true;
      if (dateFilter !== 'all') {
        try {
          const activityDate = new Date(activity.timestamp);
          const now = new Date();
          
          switch (dateFilter) {
            case 'today':
              matchesDate = activityDate.toDateString() === now.toDateString();
              break;
            case 'week':
              const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
              matchesDate = activityDate >= weekAgo;
              break;
            case 'month':
              const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
              matchesDate = activityDate >= monthAgo;
              break;
          }
        } catch (error) {
          console.warn('Invalid date in activity log:', activity.timestamp);
          matchesDate = false;
        }
      }

      return matchesSearch && matchesType && matchesDate;
    });
  }, [state.activityLog, searchTerm, selectedType, dateFilter]);

  const getActivityIcon = (type: string) => {
    const activityType = activityTypes.find(t => t.value === type);
    return activityType ? activityType.icon : Activity;
  };

  const getActivityColor = (type: string) => {
    const activityType = activityTypes.find(t => t.value === type);
    return activityType ? activityType.color : 'bg-gray-100 text-gray-800';
  };

  const exportLog = () => {
    try {
      const dataStr = JSON.stringify(filteredActivities, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `activity-log-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (error) {
      console.error('Error exporting activity log:', error);
    }
  };

  const printDailyReport = () => {
    const today = new Date();
    const todayActivities = state.activityLog?.filter(activity => {
      const activityDate = new Date(activity.timestamp);
      return activityDate.toDateString() === today.toDateString();
    }) || [];

    const stats = {
      total: todayActivities.length,
      create: todayActivities.filter(a => a.type === 'create').length,
      update: todayActivities.filter(a => a.type === 'update').length,
      delete: todayActivities.filter(a => a.type === 'delete').length,
      scan: todayActivities.filter(a => a.type === 'scan').length
    };

    const printContent = `
      <html>
        <head>
          <title>WH5 Construction Store - Daily Activity Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #059669; }
            .subtitle { color: #666; margin-top: 10px; }
            .stats { display: flex; justify-content: space-around; margin: 20px 0; }
            .stat-item { text-align: center; padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
            .stat-value { font-size: 24px; font-weight: bold; color: #059669; }
            .stat-label { font-size: 12px; color: #666; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .activity-create { color: #059669; }
            .activity-update { color: #3B82F6; }
            .activity-delete { color: #EF4444; }
            .activity-scan { color: #8B5CF6; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">WH5 CONSTRUCTION STORE</div>
            <div class="subtitle">Daily Activity Report</div>
            <div class="subtitle">Generated: ${today.toLocaleDateString()} ${today.toLocaleTimeString()}</div>
          </div>
          
          <div class="stats">
            <div class="stat-item">
              <div class="stat-value">${stats.total}</div>
              <div class="stat-label">Total Activities</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${stats.create}</div>
              <div class="stat-label">Items Created</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${stats.update}</div>
              <div class="stat-label">Items Updated</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${stats.delete}</div>
              <div class="stat-label">Items Deleted</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${stats.scan}</div>
              <div class="stat-label">Scans/Logins</div>
            </div>
          </div>

          ${todayActivities.length > 0 ? `
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>User</th>
                </tr>
              </thead>
              <tbody>
                ${todayActivities.map(activity => `
                  <tr>
                    <td>${new Date(activity.timestamp).toLocaleTimeString()}</td>
                    <td class="activity-${activity.type}">${activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}</td>
                    <td>${activity.description}</td>
                    <td>${state.auth.user?.name || 'System'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : '<p style="text-align: center; margin-top: 50px;">No activities recorded for today.</p>'}

          <div class="footer">
            <p>WH5 Construction Store - Inventory Management System</p>
            <p>Report generated on ${today.toLocaleDateString()}</p>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  const formatTimestamp = (timestamp: Date | string) => {
    try {
      const date = new Date(timestamp);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Activity className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Activity Log</h1>
            <p className="text-gray-500 dark:text-gray-400">
              View system activity and audit trail ({filteredActivities.length} activities)
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={printDailyReport}
          >
            <Printer className="w-4 h-4 mr-2" />
            Daily Report
          </Button>
          <Button variant="outline" onClick={exportLog}>
            <Download className="w-4 h-4 mr-2" />
            Export Log
          </Button>
          <Button variant="outline" onClick={() => onViewChange('dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Activity Type</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {activityTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center space-x-2">
                        <type.icon className="w-4 h-4" />
                        <span>{type.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date Range</Label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  {dateFilters.map(filter => (
                    <SelectItem key={filter.value} value={filter.value}>
                      {filter.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity List */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
          <CardDescription>
            Recent system activities and changes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredActivities.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No activities found
              </h3>
              <p className="text-gray-500">
                {state.activityLog?.length === 0 
                  ? 'No activities recorded yet. Start using the app to see activities here.' 
                  : 'No activities match your current filters.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredActivities.map((activity, index) => {
                const Icon = getActivityIcon(activity.type);
                const colorClass = getActivityColor(activity.type);
                
                return (
                  <div key={activity.id || index} className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full ${colorClass} flex items-center justify-center`}>
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {activity.type ? activity.type.charAt(0).toUpperCase() + activity.type.slice(1) : 'Activity'}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {activity.description}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span>{formatTimestamp(activity.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {activityTypes.map(type => {
          const count = state.activityLog?.filter(activity => activity.type === type.value).length || 0;
          const Icon = type.icon;
          
          return (
            <Card key={type.value}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {type.label} Actions
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {count}
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg ${type.color} flex items-center justify-center`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ActivityLog;
