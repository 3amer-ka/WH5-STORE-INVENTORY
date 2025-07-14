/**
 * Home page component - Main entry point for the WH5 Inventory Management System
 */
import React, { useState } from 'react';
import { useInventory } from '../contexts/InventoryContext';
import Sidebar from '../components/Layout/Sidebar';
import Dashboard from '../components/Dashboard/Dashboard';
import AddItem from '../components/AddItem/AddItem';
import SearchFilter from '../components/SearchFilter/SearchFilter';
import Categories from '../components/Categories/Categories';
import ActivityLog from '../components/ActivityLog/ActivityLog';
import QRScanner from '../components/QRScanner/QRScanner';
import AIAssistant from '../components/AIAssistant/AIAssistant';
import Settings from '../components/Settings/Settings';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Shield } from 'lucide-react';

const Home: React.FC = () => {
  const { state } = useInventory();
  const [currentView, setCurrentView] = useState('dashboard');
  const userRole = state.auth.user?.role;

  const handleViewChange = (view: string) => {
    // Role-based access control
    if (userRole === 'guest') {
      // Guest can only access dashboard and search
      if (['dashboard', 'search'].includes(view)) {
        setCurrentView(view);
      } else {
        // Show access denied for restricted views
        setCurrentView('access-denied');
      }
    } else {
      setCurrentView(view);
    }
  };

  const renderAccessDenied = () => (
    <div className="flex items-center justify-center h-96">
      <div className="text-center space-y-4">
        <Shield className="w-16 h-16 text-red-500 mx-auto" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Access Denied</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md">
          You don't have permission to access this feature. Please contact an administrator 
          for elevated access or log in with appropriate credentials.
        </p>
        <Alert className="max-w-md mx-auto">
          <AlertDescription>
            <strong>Current Access Level:</strong> {userRole === 'guest' ? 'Guest (View Only)' : 
                                                   userRole === 'team' ? 'Team Member' : 'Administrator'}
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onViewChange={handleViewChange} />;
      case 'search':
        return <SearchFilter onViewChange={handleViewChange} />;
      case 'access-denied':
        return renderAccessDenied();
      case 'add-item':
        return userRole === 'guest' ? renderAccessDenied() : <AddItem onViewChange={handleViewChange} />;
      case 'categories':
        return userRole === 'guest' ? renderAccessDenied() : <Categories onViewChange={handleViewChange} />;
      case 'activity-log':
        return userRole === 'guest' ? renderAccessDenied() : <ActivityLog onViewChange={handleViewChange} />;
      case 'qr-scanner':
        return userRole === 'guest' ? renderAccessDenied() : <QRScanner onViewChange={handleViewChange} />;
      case 'ai-assistant':
        return userRole === 'guest' ? renderAccessDenied() : <AIAssistant onViewChange={handleViewChange} />;
      case 'settings':
        return userRole === 'guest' ? renderAccessDenied() : <Settings onViewChange={handleViewChange} />;
      default:
        return <Dashboard onViewChange={handleViewChange} />;
    }
  };

  return (
    <div className={`min-h-screen ${state.settings.theme === 'dark' ? 'dark' : ''}`}>
      <div className="flex bg-gray-50 dark:bg-gray-900">
        <Sidebar currentView={currentView} onViewChange={handleViewChange} />
        <div className="flex-1 p-6 overflow-auto">
          {renderCurrentView()}
        </div>
      </div>
    </div>
  );
};

export default Home;
