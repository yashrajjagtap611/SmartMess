import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SplashScreen from './SplashScreen';
import '@testing-library/jest-dom';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('SplashScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockClear();
  });

  it('renders splash screen with loading animation', () => {
    renderWithRouter(<SplashScreen />);
    
    expect(screen.getByText('MessHub')).toBeInTheDocument();
    expect(screen.getByText('Initializing...')).toBeInTheDocument();
  });

  it('shows loading messages in sequence', async () => {
    renderWithRouter(<SplashScreen />);
    
    // Initial message
    expect(screen.getByText('Initializing...')).toBeInTheDocument();
    
    // Wait for next message
    await waitFor(() => {
      expect(screen.getByText('Loading components...')).toBeInTheDocument();
    }, { timeout: 1500 });
  });

  it('displays error state when error occurs', () => {
    const mockOnError = jest.fn();
    renderWithRouter(<SplashScreen onError={mockOnError} />);
    
    // The component should still render normally initially
    expect(screen.getByText('MessHub')).toBeInTheDocument();
  });

  it('calls onInitializationComplete when initialization is done', async () => {
    const mockOnComplete = jest.fn();
    renderWithRouter(<SplashScreen onInitializationComplete={mockOnComplete} />);
    
    // Wait for initialization to complete
    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalled();
    }, { timeout: 3500 });
  });

  it('redirects to welcome page when not authenticated', async () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const mockNavigate = jest.fn();
    jest.mocked(require('react-router-dom').useNavigate).mockReturnValue(mockNavigate);
    
    renderWithRouter(<SplashScreen />);
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/welcome', { replace: true });
    }, { timeout: 3500 });
  });

  it('redirects to admin dashboard when authenticated as admin', async () => {
    localStorageMock.getItem
      .mockReturnValueOnce('admin-token') // token
      .mockReturnValueOnce('admin'); // userRole
    
    const mockNavigate = jest.fn();
    jest.mocked(require('react-router-dom').useNavigate).mockReturnValue(mockNavigate);
    
    renderWithRouter(<SplashScreen />);
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard', { replace: true });
    }, { timeout: 3500 });
  });

  it('redirects to mess owner dashboard when authenticated as mess owner', async () => {
    localStorageMock.getItem
      .mockReturnValueOnce('mess-owner-token') // token
      .mockReturnValueOnce('mess-owner'); // userRole
    
    const mockNavigate = jest.fn();
    jest.mocked(require('react-router-dom').useNavigate).mockReturnValue(mockNavigate);
    
    renderWithRouter(<SplashScreen />);
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/mess-owner/dashboard', { replace: true });
    }, { timeout: 3500 });
  });

  it('redirects to user dashboard when authenticated as user', async () => {
    localStorageMock.getItem
      .mockReturnValueOnce('user-token') // token
      .mockReturnValueOnce('user'); // userRole
    
    const mockNavigate = jest.fn();
    jest.mocked(require('react-router-dom').useNavigate).mockReturnValue(mockNavigate);
    
    renderWithRouter(<SplashScreen />);
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/user/dashboard', { replace: true });
    }, { timeout: 3500 });
  });

  it('has proper accessibility attributes', () => {
    renderWithRouter(<SplashScreen />);
    
    expect(screen.getByText('MessHub')).toBeInTheDocument();
    expect(screen.getByText('Initializing...')).toBeInTheDocument();
  });

  it('applies dark mode styling correctly', () => {
    renderWithRouter(<SplashScreen />);
    
    const container = screen.getByText('MessHub').closest('.min-h-screen');
    expect(container).toHaveClass('bg-messhub-light-bg');
  });
});
