/**
 * Main App component with routing, authentication, and context providers
 */
import React from 'react';
import { HashRouter, Route, Routes } from 'react-router';
import { InventoryProvider, useInventory } from './contexts/InventoryContext';
import Home from './pages/Home';
import Login from './components/Auth/Login';

/**
 * App wrapper component that handles authentication state
 */
const AppContent: React.FC = () => {
  const { state } = useInventory();

  // Show login screen if not authenticated
  if (!state.auth.isAuthenticated) {
    return <Login />;
  }

  // Show main app if authenticated
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </HashRouter>
  );
};

/**
 * Main App component with context provider
 */
export default function App() {
  return (
    <InventoryProvider>
      <AppContent />
    </InventoryProvider>
  );
}
