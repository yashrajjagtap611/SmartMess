import { render, screen } from '@testing-library/react';
import Dashboard from './Dashboard';
import { useDashboard } from './Dashboard.hooks';

// Mock the custom hook
jest.mock('./Dashboard.hooks');

describe('Dashboard', () => {
  beforeEach(() => {
    (useDashboard as jest.Mock).mockReturnValue({
      stats: {
        totalUsers: 100,
        totalRevenue: 50000,
        activeSubscriptions: 75
      },
      loading: false,
      error: null
    });
  });

  it('renders the dashboard title', () => {
    render(<Dashboard />);
    expect(screen.getByText('Mess Owner Dashboard')).toBeInTheDocument();
  });

  it('displays loading state', () => {
    (useDashboard as jest.Mock).mockReturnValue({
      stats: null,
      loading: true,
      error: null
    });
    render(<Dashboard />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('displays error state', () => {
    (useDashboard as jest.Mock).mockReturnValue({
      stats: null,
      loading: false,
      error: new Error('Failed to load')
    });
    render(<Dashboard />);
    expect(screen.getByText('Error loading dashboard')).toBeInTheDocument();
  });

  it('displays dashboard stats', () => {
    render(<Dashboard />);
    expect(screen.getByText('100')).toBeInTheDocument(); // Total Users
    expect(screen.getByText('₹50,000')).toBeInTheDocument(); // Total Revenue
    expect(screen.getByText('75')).toBeInTheDocument(); // Active Subscriptions
  });
});
