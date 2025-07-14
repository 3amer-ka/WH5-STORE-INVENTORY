/**
 * Settings component for managing application preferences and configuration
 */
import React, { useState } from 'react';
import { useInventory } from '../../contexts/InventoryContext';
import { Button, buttonVariants } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import type { VariantProps } from 'class-variance-authority';

type ButtonVariantProps = VariantProps<typeof buttonVariants>;
type ExtendedButtonProps = React.ComponentProps<'button'> & ButtonVariantProps & {
  asChild?: boolean;
  size?: 'default' | 'sm' | 'lg' | 'icon';
};
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge, badgeVariants } from '../ui/badge';

type BadgeVariantProps = VariantProps<typeof badgeVariants>;
type ExtendedBadgeProps = React.ComponentProps<'span'> & BadgeVariantProps & {
  asChild?: boolean;
};
import { Separator } from '../ui/separator';
import { 
  Settings as SettingsIcon, 
  Shield, 
  Palette, 
  Download, 
  Upload, 
  Trash2,
  Key,
  Bell,
  Database,
  Info,
  AlertTriangle,
  Check,
  Eye,
  EyeOff,
  Github,
  Lock,
  ExternalLink,
  UserX,
  RefreshCw
} from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

const Settings: React.FC = () => {
  const { state, dispatch } = useInventory();
  const [showPasscode, setShowPasscode] = useState(false);
  const [tempPasscode, setTempPasscode] = useState(state.settings.adminPasscode);
  const [newPasscode, setNewPasscode] = useState('');
  const [tempApiKey, setTempApiKey] = useState(state.settings.geminiApiKey || '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [advancedAccess, setAdvancedAccess] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [showNewPasscode, setShowNewPasscode] = useState(false);

  const handleSaveSettings = () => {
    setSaveStatus('saving');
    try {
      dispatch({
        type: 'UPDATE_SETTINGS',
        payload: {
          adminPasscode: tempPasscode,
          geminiApiKey: tempApiKey
        }
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error("Failed to save settings:", error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  const handleAdvancedAccess = () => {
    if (accessCode === state.settings.adminPasscode) {
      setAdvancedAccess(true);
      setAccessCode('');
      dispatch({
        type: 'ADD_ACTIVITY',
        payload: {
          id: Date.now().toString(),
          type: 'update',
          description: 'Advanced settings accessed',
          timestamp: new Date(),
          userId: state.auth.user?.id
        }
      });
    } else {
      alert('Invalid access code');
    }
  };

  const handleChangePasscode = () => {
    if (newPasscode && newPasscode.length >= 4) {
      dispatch({
        type: 'UPDATE_SETTINGS',
        payload: {
          adminPasscode: newPasscode
        }
      });
      setTempPasscode(newPasscode);
      setNewPasscode('');
      alert('Admin passcode updated successfully');
      
      dispatch({
        type: 'ADD_ACTIVITY',
        payload: {
          id: Date.now().toString(),
          type: 'update',
          description: 'Admin passcode changed',
          timestamp: new Date(),
          userId: state.auth.user?.id
        }
      });
    } else {
      alert('Passcode must be at least 4 characters long');
    }
  };

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const handleExportData = () => {
    const dataToExport = {
      items: state.items,
      categories: state.categories,
      settings: state.settings,
      activityLog: state.activityLog,
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };
    
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `wh5-inventory-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target?.result as string);
          if (importedData.items) dispatch({ type: 'SET_ITEMS', payload: importedData.items });
          if (importedData.categories) dispatch({ type: 'SET_CATEGORIES', payload: importedData.categories });
          if (importedData.settings) dispatch({ type: 'UPDATE_SETTINGS', payload: importedData.settings });
          alert('Data imported successfully!');
        } catch (error) {
          alert('Error importing data. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      if (window.confirm('This will permanently delete all items, categories, and activity logs. Type "DELETE" to confirm.')) {
        const confirmation = window.prompt('Type DELETE to confirm:');
        if (confirmation === 'DELETE') {
          dispatch({ type: 'SET_ITEMS', payload: [] });
          dispatch({ type: 'SET_CATEGORIES', payload: [
            {
              id: 'default',
              name: 'General',
              description: 'Default category for uncategorized items',
              color: '#3B82F6',
              createdAt: new Date()
            }
          ] });
          localStorage.removeItem('wh5-inventory-data');
          alert('All data has been cleared.');
        }
      }
    }
  };

  const colorSchemes = [
    { value: 'blue', label: 'Blue', color: 'bg-blue-500' },
    { value: 'green', label: 'Green', color: 'bg-green-500' },
    { value: 'purple', label: 'Purple', color: 'bg-purple-500' },
    { value: 'orange', label: 'Orange', color: 'bg-orange-500' }
  ];

  const densityOptions = [
    { value: 'compact', label: 'Compact' },
    { value: 'normal', label: 'Normal' },
    { value: 'spacious', label: 'Spacious' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <SettingsIcon className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
            <p className="text-gray-500 dark:text-gray-400">Manage your application preferences and configuration</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">
            {state.auth.user?.role === 'admin' ? 'Administrator' : 
             state.auth.user?.role === 'team' ? 'Team Member' : 'Guest'}
          </Badge>
          <Button variant="secondary" size="sm" onClick={handleLogout}>
            <UserX className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="w-5 h-5" />
                <span>Appearance</span>
              </CardTitle>
              <CardDescription>Customize the look and feel of your application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="theme">Theme</Label>
                <Select
                  value={state.settings.theme}
                  onValueChange={(value: 'light' | 'dark') => 
                    dispatch({ type: 'UPDATE_SETTINGS', payload: { theme: value } })
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="color-scheme">Color Scheme</Label>
                <Select
                  value={state.settings.colorScheme}
                  onValueChange={(value: 'blue' | 'green' | 'purple' | 'orange') => 
                    dispatch({ type: 'UPDATE_SETTINGS', payload: { colorScheme: value } })
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {colorSchemes.map((scheme) => (
                      <SelectItem key={scheme.value} value={scheme.value}>
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${scheme.color}`} />
                          <span>{scheme.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>Notifications</span>
              </CardTitle>
              <CardDescription>Configure your notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Low stock alerts</span>
                <Switch 
                  checked={state.settings.lowStockAlerts}
                  onCheckedChange={(checked: boolean) => 
                    dispatch({ type: 'UPDATE_SETTINGS', payload: { lowStockAlerts: checked } })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Activity notifications</span>
                <Switch 
                  checked={state.settings.activityNotifications}
                  onCheckedChange={(checked: boolean) => 
                    dispatch({ type: 'UPDATE_SETTINGS', payload: { activityNotifications: checked } })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          {!advancedAccess && state.auth.user?.role !== 'admin' ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lock className="w-5 h-5" />
                  <span>Advanced Settings Access</span>
                </CardTitle>
                <CardDescription>Administrator access required</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="access-code">Enter Admin Access Code</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="access-code"
                      type="password"
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value)}
                      placeholder="Enter access code"
                      onKeyPress={(e) => e.key === 'Enter' && handleAdvancedAccess()}
                    />
                    <Button onClick={handleAdvancedAccess} disabled={!accessCode}>
                      <Shield className="w-4 h-4 mr-2" />
                      Access
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="w-5 h-5" />
                    <span>Security Settings</span>
                  </CardTitle>
                  <CardDescription>Manage access control and authentication</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-passcode">Admin Passcode</Label>
                    <div className="flex space-x-2">
                      <div className="relative flex-1">
                        <Input
                          id="admin-passcode"
                          type={showPasscode ? 'text' : 'password'}
                          value={tempPasscode}
                          onChange={(e) => setTempPasscode(e.target.value)}
                          placeholder="Enter admin passcode"
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2"
                          onClick={() => setShowPasscode(!showPasscode)}
                        >
                          {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">Used to access admin features and sensitive operations</p>
                  </div>

                  {state.auth.user?.role === 'admin' && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <Label htmlFor="new-passcode">Change Admin Passcode</Label>
                        <div className="flex space-x-2">
                          <div className="relative flex-1">
                            <Input
                              id="new-passcode"
                              type={showNewPasscode ? 'text' : 'password'}
                              value={newPasscode}
                              onChange={(e) => setNewPasscode(e.target.value)}
                              placeholder="Enter new passcode"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-2 top-1/2 transform -translate-y-1/2"
                              onClick={() => setShowNewPasscode(!showNewPasscode)}
                            >
                              {showNewPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                          </div>
                          <Button onClick={handleChangePasscode} disabled={!newPasscode}>
                            <Key className="w-4 h-4 mr-2" />
                            Change
                          </Button>
                        </div>
                      </div>
                    </>
                  )}

                  <Separator />

                  <div className="space-y-2">
                    <Label>Session Management</Label>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Auto-logout after inactivity</span>
                      <Switch 
                  checked={state.settings.autoLogout}
                  onCheckedChange={(checked: boolean) => 
                          dispatch({ type: 'UPDATE_SETTINGS', payload: { autoLogout: checked } })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Remember login session</span>
                      <Switch 
                  checked={state.settings.rememberSession}
                  onCheckedChange={(checked: boolean) => 
                          dispatch({ type: 'UPDATE_SETTINGS', payload: { rememberSession: checked } })
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Key className="w-5 h-5" />
                    <span>API Configuration</span>
                  </CardTitle>
                  <CardDescription>Configure external API integrations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="gemini-api">Google Gemini API Key</Label>
                    <div className="flex space-x-2">
                      <div className="relative flex-1">
                        <Input
                          id="gemini-api"
                          type={showApiKey ? 'text' : 'password'}
                          value={tempApiKey}
                          onChange={(e) => setTempApiKey(e.target.value)}
                          placeholder="Enter your Gemini API key"
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2"
                          onClick={() => setShowApiKey(!showApiKey)}
                        >
                          {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">Required for AI assistant features</p>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <Label htmlFor="density">UI Density</Label>
                    <Select
                      value={state.settings.density}
                      onValueChange={(value: 'compact' | 'normal' | 'spacious') => 
                        dispatch({ type: 'UPDATE_SETTINGS', payload: { density: value } })
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {densityOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Database className="w-5 h-5" />
                    <span>Data Management</span>
                  </CardTitle>
                  <CardDescription>Backup, restore, and manage your inventory data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Export Data</Label>
                      <Button onClick={handleExportData} className="w-full">
                        <Download className="w-4 h-4 mr-2" />
                        Export Backup
                      </Button>
                      <p className="text-sm text-gray-500">Download all your data as a JSON file</p>
                    </div>

                    <div className="space-y-2">
                      <Label>Import Data</Label>
                      <div className="relative">
                        <Input
                          type="file"
                          accept=".json"
                          onChange={handleImportData}
                          className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                      </div>
                      <p className="text-sm text-gray-500">Restore data from a backup file</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label className="text-red-600">Danger Zone</Label>
                    <Alert>
                      <AlertTriangle className="w-4 h-4" />
                      <AlertDescription>
                        This action will permanently delete all your inventory data and cannot be undone.
                      </AlertDescription>
                    </Alert>
                    <Button variant="destructive" onClick={handleClearAllData} className="w-full">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear All Data
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {state.auth.user?.role === 'admin' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="w-5 h-5" />
                      <span>Admin Management</span>
                    </CardTitle>
                    <CardDescription>Administrative tools and system management</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button 
                        variant="outline" 
                        onClick={() => window.open(state.settings.githubLink, '_blank')}
                        className="w-full"
                      >
                        <Github className="w-4 h-4 mr-2" />
                        GitHub Repository
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        onClick={() => dispatch({ type: 'REFRESH_SESSION' })}
                        className="w-full"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh Session
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-end space-x-2">
                <Button
                  onClick={handleSaveSettings}
                  disabled={saveStatus === 'saving'}
                  className="min-w-24"
                >
                  {saveStatus === 'saving' && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />}
                  {saveStatus === 'saved' && <Check className="w-4 h-4 mr-2" />}
                  {saveStatus === 'error' && <AlertTriangle className="w-4 h-4 mr-2" />}
                  {saveStatus === 'saving' ? 'Saving...' : 
                   saveStatus === 'saved' ? 'Saved!' : 
                   saveStatus === 'error' ? 'Error!' : 
                   'Save Settings'}
                </Button>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="about" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Info className="w-5 h-5" />
                <span>About WH5 Inventory Pro</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Application Info</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Version:</span>
                      <Badge variant="secondary">1.0.0</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Build:</span>
                      <span className="text-gray-500">Production</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Update:</span>
                      <span className="text-gray-500">2024-01-15</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">System Stats</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Items:</span>
                      <Badge variant="secondary">{state.items.length}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Categories:</span>
                      <Badge variant="secondary">{state.categories.length}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Storage Used:</span>
                      <span className="text-gray-500">
                        {(new Blob([localStorage.getItem('wh5-inventory-data') || '']).size / 1024).toFixed(2)} KB
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-2">Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Full CRUD Operations</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Category Management</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Advanced Search & Filter</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>QR Code Scanning</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Role-based Access</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Dark/Light Theme</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>AI Assistant</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Data Export/Import</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
