/**
 * Login component for user authentication
 */
import React, { useState } from 'react';
import { useInventory } from '../../contexts/InventoryContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Shield, 
  Users, 
  UserCheck, 
  Eye, 
  EyeOff, 
  Building,
  Lock,
  Mail,
  User
} from 'lucide-react';

const Login: React.FC = () => {
  const { state, dispatch } = useInventory();
  const [adminCode, setAdminCode] = useState('');
  const [teamEmail, setTeamEmail] = useState('');
  const [showAdminCode, setShowAdminCode] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGuestLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      const guestUser = {
        id: 'guest-' + Date.now(),
        email: 'guest@local',
        name: 'Guest User',
        role: 'guest' as const,
        createdAt: new Date(),
        lastLogin: new Date()
      };

      dispatch({ type: 'LOGIN', payload: guestUser });
      dispatch({
        type: 'ADD_ACTIVITY',
        payload: {
          id: Date.now().toString(),
          type: 'scan',
          description: 'Guest user logged in',
          timestamp: new Date(),
          userId: guestUser.id
        }
      });
      setIsLoading(false);
    }, 500);
  };

  const handleAdminLogin = () => {
    setError('');
    setIsLoading(true);
    
    setTimeout(() => {
      if (adminCode === state.settings.adminPasscode) {
        const adminUser = {
          id: 'admin-001',
          email: 'admin@wh5construction.com',
          name: 'System Administrator',
          role: 'admin' as const,
          createdAt: new Date(),
          lastLogin: new Date()
        };

        dispatch({ type: 'LOGIN', payload: adminUser });
        dispatch({
          type: 'ADD_ACTIVITY',
          payload: {
            id: Date.now().toString(),
            type: 'scan',
            description: 'Admin user logged in',
            timestamp: new Date(),
            userId: adminUser.id
          }
        });
        setAdminCode('');
      } else {
        setError('Invalid admin access code');
      }
      setIsLoading(false);
    }, 800);
  };

  const handleTeamLogin = () => {
    setError('');
    setIsLoading(true);
    
    setTimeout(() => {
      const domain = state.settings.companyDomain || 'wh5construction.com';
      
      if (teamEmail && teamEmail.includes('@') && teamEmail.toLowerCase().endsWith(`@${domain}`)) {
        const teamUser = {
          id: 'team-' + Date.now(),
          email: teamEmail,
          name: teamEmail.split('@')[0].replace(/[.-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          role: 'team' as const,
          createdAt: new Date(),
          lastLogin: new Date()
        };

        dispatch({ type: 'LOGIN', payload: teamUser });
        dispatch({
          type: 'ADD_ACTIVITY',
          payload: {
            id: Date.now().toString(),
            type: 'scan',
            description: `Team member ${teamUser.name} logged in`,
            timestamp: new Date(),
            userId: teamUser.id
          }
        });
        setTeamEmail('');
      } else {
        setError(`Please use a valid ${domain} email address`);
      }
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo Section */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <img 
              src="https://pub-cdn.sider.ai/u/U0L5HA06Y61/web-coder/686ea315eca24d79d7558b3f/resource/9e825b05-2c57-49e5-be03-f072248d4eb7.JPG" 
              alt="WH5 Construction Store"
              className="h-20 w-auto"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Inventory Pro
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Professional Inventory Management System
            </p>
          </div>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-center space-x-2">
              <Lock className="w-5 h-5" />
              <span>Access System</span>
            </CardTitle>
            <CardDescription className="text-center">
              Choose your access method to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="guest" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="guest" className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>Guest</span>
                </TabsTrigger>
                <TabsTrigger value="admin" className="flex items-center space-x-1">
                  <Shield className="w-4 h-4" />
                  <span>Admin</span>
                </TabsTrigger>
                <TabsTrigger value="team" className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>Team</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="guest" className="space-y-4">
                <div className="text-center space-y-3">
                  <UserCheck className="w-12 h-12 text-green-600 mx-auto" />
                  <div>
                    <h3 className="font-semibold">Guest Access</h3>
                    <p className="text-sm text-gray-500">
                      View-only access to inventory data
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={handleGuestLogin}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Connecting...</span>
                    </div>
                  ) : (
                    'Enter as Guest'
                  )}
                </Button>
              </TabsContent>

              <TabsContent value="admin" className="space-y-4">
                <div className="text-center space-y-3">
                  <Shield className="w-12 h-12 text-blue-600 mx-auto" />
                  <div>
                    <h3 className="font-semibold">Administrator Access</h3>
                    <p className="text-sm text-gray-500">
                      Full system access and management
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-code">Admin Access Code</Label>
                  <div className="relative">
                    <Input
                      id="admin-code"
                      type={showAdminCode ? 'text' : 'password'}
                      value={adminCode}
                      onChange={(e) => setAdminCode(e.target.value)}
                      placeholder="Enter admin access code"
                      onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowAdminCode(!showAdminCode)}
                    >
                      {showAdminCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <Button 
                  onClick={handleAdminLogin}
                  disabled={isLoading || !adminCode}
                  className="w-full"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Authenticating...</span>
                    </div>
                  ) : (
                    'Login as Admin'
                  )}
                </Button>
              </TabsContent>

              <TabsContent value="team" className="space-y-4">
                <div className="text-center space-y-3">
                  <Building className="w-12 h-12 text-purple-600 mx-auto" />
                  <div>
                    <h3 className="font-semibold">Team Member Access</h3>
                    <p className="text-sm text-gray-500">
                      Standard access for team members
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="team-email">Company Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="team-email"
                      type="email"
                      value={teamEmail}
                      onChange={(e) => setTeamEmail(e.target.value)}
                      placeholder="name@wh5construction.com"
                      className="pl-10"
                      onKeyPress={(e) => e.key === 'Enter' && handleTeamLogin()}
                    />
                  </div>
                </div>
                <Button 
                  onClick={handleTeamLogin}
                  disabled={isLoading || !teamEmail}
                  className="w-full"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Verifying...</span>
                    </div>
                  ) : (
                    'Login as Team Member'
                  )}
                </Button>
              </TabsContent>
            </Tabs>

            {error && (
              <Alert className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>© 2024 WH5 Construction Store. All rights reserved.</p>
          <p className="mt-1">Inventory Pro v1.0.0</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
