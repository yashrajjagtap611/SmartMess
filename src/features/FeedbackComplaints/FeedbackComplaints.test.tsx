import { render, screen, fireEvent } from '@testing-library/react';
import { useToast } from '@/hooks/use-toast';
import FeedbackComplaints from './FeedbackComplaints';
import { useFeedbackComplaints } from './FeedbackComplaints.hooks';

// Mock the hooks and components
jest.mock('./FeedbackComplaints.hooks');
jest.mock('@/hooks/use-toast');

// Mock child components
jest.mock('./Components/ComplaintForm', () => {
  return function MockComplaintForm({ onSubmit, onCancel }: any) {
    return (
      <div data-testid="complaint-form">
        <button onClick={() => onSubmit({})}>Submit Complaint</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    );
  };
});

jest.mock('./Components/ComplaintList', () => {
  return function MockComplaintList() {
    return <div data-testid="complaint-list">Complaint List</div>;
  };
});

jest.mock('./Components/ComplaintStats', () => {
  return function MockComplaintStats() {
    return <div data-testid="complaint-stats">Complaint Stats</div>;
  };
});

jest.mock('./Components/ComplaintFilters', () => {
  return function MockComplaintFilters() {
    return <div data-testid="complaint-filters">Complaint Filters</div>;
  };
});

describe('FeedbackComplaints', () => {
  const mockUseFeedbackComplaints = {
    complaints: [],
    loading: false,
    error: null,
    stats: null,
    fetchFeedback: jest.fn(),
    fetchStats: jest.fn(),
    createComplaint: jest.fn(),
    respondToComplaint: jest.fn(),
    resolveComplaint: jest.fn()
  };

  const mockToast = {
    toast: jest.fn()
  };

  beforeEach(() => {
    (useFeedbackComplaints as jest.Mock).mockReturnValue(mockUseFeedbackComplaints);
    (useToast as jest.Mock).mockReturnValue(mockToast);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the component correctly', () => {
    render(<FeedbackComplaints />);
    
    expect(screen.getByText('Feedback & Complaints')).toBeInTheDocument();
    expect(screen.getByText('Manage your feedback and complaints')).toBeInTheDocument();
    expect(screen.getByText('New Complaint')).toBeInTheDocument();
  });

  it('shows the complaint form when "New Complaint" button is clicked', () => {
    render(<FeedbackComplaints />);
    
    fireEvent.click(screen.getByText('New Complaint'));
    
    expect(screen.getByTestId('complaint-form')).toBeInTheDocument();
  });

  it('shows the complaint list when not in form mode', () => {
    render(<FeedbackComplaints />);
    
    expect(screen.getByTestId('complaint-list')).toBeInTheDocument();
    expect(screen.getByTestId('complaint-stats')).toBeInTheDocument();
    expect(screen.getByTestId('complaint-filters')).toBeInTheDocument();
  });

  it('calls fetchFeedback and fetchStats on mount', () => {
    render(<FeedbackComplaints />);
    
    expect(mockUseFeedbackComplaints.fetchFeedback).toHaveBeenCalledTimes(1);
    expect(mockUseFeedbackComplaints.fetchStats).toHaveBeenCalledTimes(1);
  });

  it('shows loading state when loading is true', () => {
    (useFeedbackComplaints as jest.Mock).mockReturnValue({
      ...mockUseFeedbackComplaints,
      loading: true
    });
    
    render(<FeedbackComplaints />);
    
    // Check for loading indicator in the actual component
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows error message when error exists', () => {
    const errorMessage = 'Failed to fetch complaints';
    (useFeedbackComplaints as jest.Mock).mockReturnValue({
      ...mockUseFeedbackComplaints,
      error: errorMessage
    });
    
    render(<FeedbackComplaints />);
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });
});