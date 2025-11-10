import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme/theme-provider';
import UserManagement from './UserManagement';

// Mock the messService
jest.mock('@/services/api/messService', () => ({
  getMembers: jest.fn()
}));

// Mock the logout utility
jest.mock('@/utils/logout', () => ({
  handleLogout: jest.fn()
}));

// Mock the theme provider
jest.mock('@/components/theme/theme-provider', () => ({
  useTheme: () => ({
    isDarkTheme: false,
    toggleTheme: jest.fn()
  }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

// Mock the navigation components
jest.mock('@/components/common/Navbar/CommonNavbar', () => ({
  SideNavigation: ({ children }: { children: React.ReactNode }) => <div data-testid="side-navigation">{children}</div>,
  BottomNavigation: ({ children }: { children: React.ReactNode }) => <div data-testid="bottom-navigation">{children}</div>
}));

// Mock the header component
jest.mock('@/components/common/Header/CommonHeader', () => ({
  CommonHeader: ({ title, subtitle }: { title: string; subtitle: string }) => (
    <div data-testid="common-header">
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  )
}));

const mockUsers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://example.com/avatar1.jpg',
    plan: 'Premium' as const,
    meals: 10,
    paymentStatus: 'Paid' as const,
    paymentAmount: 0,
    isActive: true
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    avatar: 'https://example.com/avatar2.jpg',
    plan: 'Basic' as const,
    meals: 5,
    paymentStatus: 'Pending' as const,
    paymentAmount: 50,
    isActive: true
  }
];

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <ThemeProvider>
        {component}
      </ThemeProvider>
    </BrowserRouter>
  );
};

describe('UserManagement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    const mockMessService = require('@/services/api/messService');
    mockMessService.getMembers.mockResolvedValue({
      success: true,
      data: mockUsers
    });

    renderWithProviders(<UserManagement />);
    
    expect(screen.getByText('Loading users...')).toBeInTheDocument();
  });

  it('renders users after successful API call', async () => {
    const mockMessService = require('@/services/api/messService');
    mockMessService.getMembers.mockResolvedValue({
      success: true,
      data: mockUsers
    });

    renderWithProviders(<UserManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('renders error state when API call fails', async () => {
    const mockMessService = require('@/services/api/messService');
    mockMessService.getMembers.mockRejectedValue(new Error('Failed to fetch users'));

    renderWithProviders(<UserManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('Error loading users')).toBeInTheDocument();
      expect(screen.getByText('Failed to fetch users')).toBeInTheDocument();
    });
  });

  it('displays user management header', async () => {
    const mockMessService = require('@/services/api/messService');
    mockMessService.getMembers.mockResolvedValue({
      success: true,
      data: mockUsers
    });

    renderWithProviders(<UserManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('User Management')).toBeInTheDocument();
      expect(screen.getByText('Manage users, plans, and payments')).toBeInTheDocument();
    });
  });

  it('shows navigation components', async () => {
    const mockMessService = require('@/services/api/messService');
    mockMessService.getMembers.mockResolvedValue({
      success: true,
      data: mockUsers
    });

    renderWithProviders(<UserManagement />);
    
    await waitFor(() => {
      expect(screen.getByTestId('side-navigation')).toBeInTheDocument();
      expect(screen.getByTestId('bottom-navigation')).toBeInTheDocument();
    });
  });

  it('displays user cards with correct information', async () => {
    const mockMessService = require('@/services/api/messService');
    mockMessService.getMembers.mockResolvedValue({
      success: true,
      data: mockUsers
    });

    renderWithProviders(<UserManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
      expect(screen.getByText('Premium')).toBeInTheDocument();
      expect(screen.getByText('Basic')).toBeInTheDocument();
    });
  });

  it('shows payment status badges', async () => {
    const mockMessService = require('@/services/api/messService');
    mockMessService.getMembers.mockResolvedValue({
      success: true,
      data: mockUsers
    });

    renderWithProviders(<UserManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('Paid')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });
  });

  it('displays meals information', async () => {
    const mockMessService = require('@/services/api/messService');
    mockMessService.getMembers.mockResolvedValue({
      success: true,
      data: mockUsers
    });

    renderWithProviders(<UserManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('10 meals left')).toBeInTheDocument();
      expect(screen.getByText('5 meals left')).toBeInTheDocument();
    });
  });

  it('shows payment amounts when due', async () => {
    const mockMessService = require('@/services/api/messService');
    mockMessService.getMembers.mockResolvedValue({
      success: true,
      data: mockUsers
    });

    renderWithProviders(<UserManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('$50')).toBeInTheDocument();
    });
  });
});
