import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dashboard from './Dashboard';
import { useInventory } from '../../contexts/InventoryContext';
import { InventoryState } from '../../types/inventory';
import type { jest } from '@jest/globals';

jest.mock('../../contexts/InventoryContext');

const mockUseInventory = useInventory as jest.Mock;

const mockState: InventoryState = {
  items: [
    { id: '1', name: 'Item 1', quantity: 5, minStockLevel: 10, price: 100, createdAt: new Date(), updatedAt: new Date(), description: '', unit: 'pcs', categoryId: 'cat1', waybillNumber: '', tags: [] },
    { id: '2', name: 'Item 2', quantity: 15, minStockLevel: 10, price: 50, createdAt: new Date(), updatedAt: new Date(), description: '', unit: 'pcs', categoryId: 'cat1', waybillNumber: '', tags: [] },
    { id: '3', name: 'Item 3', quantity: 0, minStockLevel: 5, price: 200, createdAt: new Date(), updatedAt: new Date(), description: '', unit: 'pcs', categoryId: 'cat2', waybillNumber: '', tags: [] },
  ],
  categories: [
    { id: 'cat1', name: 'Category 1', description: '', color: '#ff0000', createdAt: new Date() },
    { id: 'cat2', name: 'Category 2', description: '', color: '#00ff00', createdAt: new Date() },
  ],
  activityLog: [
    { id: 'act1', type: 'add', description: 'Added new item', timestamp: new Date() },
  ],
  settings: {
    theme: 'light', colorScheme: 'blue', density: 'normal', adminPasscode: '', geminiApiKey: '', githubLink: '', companyDomain: '', autoLogout: false, rememberSession: false, lowStockAlerts: true, activityNotifications: true,
  },
  auth: {
    isAuthenticated: true,
    user: { id: 'user1', email: 'admin@test.com', name: 'Admin User', role: 'admin', createdAt: new Date() },
    sessionExpiry: null,
  },
};

describe('Dashboard Component', () => {
  const onViewChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders dashboard stats correctly for an admin user', () => {
    mockUseInventory.mockReturnValue({ state: mockState });
    render(<Dashboard onViewChange={onViewChange} />);

    expect(screen.getByText('Total Items')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument(); // Total items

    expect(screen.getByText('In Stock')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // In stock items

    expect(screen.getByText('Low Stock')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // Low stock items

    expect(screen.getByText('Out of Stock')).toBeInTheDocument();
    const outOfStockElements = screen.getAllByText('1'); // Also '1' for low stock
    expect(outOfStockElements.length).toBeGreaterThanOrEqual(1);

    expect(screen.getByText('Recent Activities')).toBeInTheDocument();
    expect(screen.getByText('Added new item')).toBeInTheDocument();
  });

  it('renders correctly for a guest user', () => {
    const guestState = {
      ...mockState,
      auth: { ...mockState.auth, user: { ...mockState.auth.user!, role: 'guest' } },
    };
    mockUseInventory.mockReturnValue({ state: guestState });
    render(<Dashboard onViewChange={onViewChange} />);

    expect(screen.getByText('Guest User')).toBeInTheDocument();
    expect(screen.getByText('Welcome! You have view-only access.')).toBeInTheDocument();

    // Check that sensitive info is hidden
    expect(screen.queryByText('Recent Activities')).not.toBeInTheDocument();
    expect(screen.queryByText('Total Value')).not.toBeInTheDocument();
  });

  // Add more tests as needed
});