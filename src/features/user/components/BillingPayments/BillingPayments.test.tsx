import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import BillingPayments from './BillingPayments';
import { useBillingPayments } from './BillingPayments.hooks';

// Mock the hooks
jest.mock('./BillingPayments.hooks', () => ({
  useBillingPayments: jest.fn(),
  useBillingFilters: jest.fn(),
  usePaymentProcessing: jest.fn(),
  useBillingStats: jest.fn(),
}));

// Mock the billing service
jest.mock('@/services/api/billingService', () => ({
  billingService: {
    getUserBillingData: jest.fn(),
    processPayment: jest.fn(),
  },
}));

const mockBillingData = {
  userId: 'user123',
  summary: {
    totalBills: 5,
    paidBills: 3,
    pendingBills: 1,
    overdueBills: 1,
    totalAmount: 5000,
    paidAmount: 3000,
    pendingAmount: 1000,
    overdueAmount: 1000,
    thisMonthBills: 2,
    thisMonthAmount: 2000,
    lastPaymentDate: '2024-01-15',
    nextPaymentDate: '2024-02-15',
  },
  memberships: [
    {
      messId: 'mess1',
      messName: 'Test Mess 1',
      membershipId: 'membership1',
      planName: 'Basic Plan',
      status: 'active',
      paymentStatus: 'paid',
      amount: 1500,
      dueDate: '2024-02-15',
      lastPaymentDate: '2024-01-15',
      nextPaymentDate: '2024-02-15',
      autoRenewal: true,
    },
  ],
  bills: [
    {
      id: 'bill1',
      messId: 'mess1',
      messName: 'Test Mess 1',
      membershipId: 'membership1',
      planName: 'Basic Plan',
      billingPeriod: {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        period: 'monthly' as const,
      },
      subscription: {
        planId: 'plan1',
        planName: 'Basic Plan',
        baseAmount: 1500,
        discountAmount: 0,
        taxAmount: 0,
        totalAmount: 1500,
      },
      payment: {
        status: 'paid' as const,
        method: 'upi' as const,
        dueDate: '2024-01-31',
        paidDate: '2024-01-15',
        transactionId: 'txn123',
      },
      adjustments: [],
      leaveCredits: [],
      metadata: {
        generatedBy: 'system' as const,
        notes: 'Test bill',
        tags: [],
      },
      createdAt: '2024-01-01',
      updatedAt: '2024-01-15',
    },
  ],
  transactions: [
    {
      id: 'txn1',
      transactionId: 'txn123',
      messName: 'Test Mess 1',
      amount: 1500,
      status: 'completed' as const,
      method: 'upi' as const,
      description: 'Monthly payment',
      paymentDate: '2024-01-15',
      createdAt: '2024-01-15',
    },
  ],
  subscriptions: [],
  invoices: [],
  receipts: [],
};

describe('BillingPayments', () => {
  beforeEach(() => {
    (useBillingPayments as jest.Mock).mockReturnValue({
      billingData: mockBillingData,
      loading: false,
      error: null,
      refreshing: false,
      refreshData: jest.fn(),
      fetchBillingData: jest.fn(),
    });
  });

  it('renders billing overview by default', () => {
    render(<BillingPayments />);
    
    expect(screen.getByText('Billing & Payments')).toBeInTheDocument();
    expect(screen.getByText('Overview')).toBeInTheDocument();
  });

  it('displays billing summary cards', () => {
    render(<BillingPayments />);
    
    expect(screen.getByText('This Month\'s Activity')).toBeInTheDocument();
    expect(screen.getByText('Active Memberships')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    (useBillingPayments as jest.Mock).mockReturnValue({
      billingData: null,
      loading: true,
      error: null,
      refreshing: false,
      refreshData: jest.fn(),
      fetchBillingData: jest.fn(),
    });

    render(<BillingPayments />);
    
    expect(screen.getByText('Loading billing information...')).toBeInTheDocument();
  });

  it('shows error state', () => {
    (useBillingPayments as jest.Mock).mockReturnValue({
      billingData: null,
      loading: false,
      error: 'Failed to fetch billing data',
      refreshing: false,
      refreshData: jest.fn(),
      fetchBillingData: jest.fn(),
    });

    render(<BillingPayments />);
    
    expect(screen.getByText('Error Loading Billing Data')).toBeInTheDocument();
    expect(screen.getByText('Failed to fetch billing data')).toBeInTheDocument();
  });

  it('shows no data state when billing data is null', () => {
    (useBillingPayments as jest.Mock).mockReturnValue({
      billingData: null,
      loading: false,
      error: null,
      refreshing: false,
      refreshData: jest.fn(),
      fetchBillingData: jest.fn(),
    });

    render(<BillingPayments />);
    
    expect(screen.getByText('No Billing Data')).toBeInTheDocument();
  });

  it('switches between tabs', () => {
    render(<BillingPayments />);
    
    // Click on Bills tab
    fireEvent.click(screen.getByText('Bills'));
    expect(screen.getByText('Bills')).toHaveAttribute('data-state', 'active');
    
    // Click on Payments tab
    fireEvent.click(screen.getByText('Payments'));
    expect(screen.getByText('Payments')).toHaveAttribute('data-state', 'active');
  });

  it('toggles filters visibility', () => {
    render(<BillingPayments />);
    
    const filtersButton = screen.getByText('Filters');
    fireEvent.click(filtersButton);
    
    // Filters should be visible
    expect(screen.getByPlaceholderText('Search bills...')).toBeInTheDocument();
  });

  it('calls refresh when refresh button is clicked', () => {
    const mockRefreshData = jest.fn();
    (useBillingPayments as jest.Mock).mockReturnValue({
      billingData: mockBillingData,
      loading: false,
      error: null,
      refreshing: false,
      refreshData: mockRefreshData,
      fetchBillingData: jest.fn(),
    });

    render(<BillingPayments />);
    
    const refreshButton = screen.getByText('Refresh');
    fireEvent.click(refreshButton);
    
    expect(mockRefreshData).toHaveBeenCalled();
  });

  it('displays bills in the bills tab', () => {
    render(<BillingPayments />);
    
    // Switch to bills tab
    fireEvent.click(screen.getByText('Bills'));
    
    expect(screen.getByText('Test Mess 1')).toBeInTheDocument();
    expect(screen.getByText('Basic Plan')).toBeInTheDocument();
  });

  it('displays transactions in the payments tab', () => {
    render(<BillingPayments />);
    
    // Switch to payments tab
    fireEvent.click(screen.getByText('Payments'));
    
    expect(screen.getByText('txn123')).toBeInTheDocument();
    expect(screen.getByText('Monthly payment')).toBeInTheDocument();
  });
});

describe('BillingPayments Integration', () => {
  it('handles payment processing', async () => {
    const mockProcessPayment = jest.fn().mockResolvedValue({
      success: true,
      transactionId: 'new-txn-123',
      message: 'Payment successful',
    });

    // Mock the payment processing hook
    const { usePaymentProcessing } = require('./BillingPayments.hooks');
    usePaymentProcessing.mockReturnValue({
      processing: false,
      paymentError: null,
      processPayment: mockProcessPayment,
    });

    render(<BillingPayments />);
    
    // The component should render without errors
    expect(screen.getByText('Billing & Payments')).toBeInTheDocument();
  });

});
