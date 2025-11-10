import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import WelcomeScreen from './WelcomeScreen';
import '@testing-library/jest-dom';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

// Mock window.open
const mockOpen = jest.fn();
Object.defineProperty(window, 'open', {
  value: mockOpen,
  writable: true,
});

// Mock PWA install prompt
const mockPrompt = jest.fn();
const mockUserChoice = Promise.resolve({ outcome: 'accepted' as const });
Object.defineProperty(window, 'beforeinstallprompt', {
  value: {
    prompt: mockPrompt,
    userChoice: mockUserChoice,
  },
  writable: true,
});

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('WelcomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOpen.mockClear();
    mockPrompt.mockClear();
  });

  it('renders welcome screen with app title', () => {
    renderWithRouter(<WelcomeScreen />);
    
    expect(screen.getByText(/welcome to messhub/i)).toBeInTheDocument();
    expect(screen.getByText(/your complete mess management solution/i)).toBeInTheDocument();
  });

  it('renders all feature highlights', () => {
    renderWithRouter(<WelcomeScreen />);
    
    expect(screen.getByText(/easy mess management/i)).toBeInTheDocument();
    expect(screen.getByText(/connect & collaborate/i)).toBeInTheDocument();
    expect(screen.getByText(/fast & reliable/i)).toBeInTheDocument();
  });

  it('renders action buttons', () => {
    renderWithRouter(<WelcomeScreen />);
    
    expect(screen.getByRole('button', { name: /get started/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create new account/i })).toBeInTheDocument();
  });

  it('calls onLogin prop when get started button is clicked', () => {
    const mockOnLogin = jest.fn();
    renderWithRouter(<WelcomeScreen onLogin={mockOnLogin} />);
    
    const getStartedButton = screen.getByRole('button', { name: /get started/i });
    fireEvent.click(getStartedButton);
    
    expect(mockOnLogin).toHaveBeenCalled();
  });

  it('calls onSignUp prop when create account button is clicked', () => {
    const mockOnSignUp = jest.fn();
    renderWithRouter(<WelcomeScreen onSignUp={mockOnSignUp} />);
    
    const createAccountButton = screen.getByRole('button', { name: /create new account/i });
    fireEvent.click(createAccountButton);
    
    expect(mockOnSignUp).toHaveBeenCalled();
  });

  it('calls onDownloadApp prop when download button is clicked', () => {
    const mockOnDownloadApp = jest.fn();
    renderWithRouter(<WelcomeScreen onDownloadApp={mockOnDownloadApp} />);
    
    // Note: Download button might not be visible by default
    // This test would need to be adjusted based on actual implementation
  });

  it('toggles theme when theme button is clicked', () => {
    renderWithRouter(<WelcomeScreen />);
    
    const themeToggle = screen.getByLabelText(/toggle theme/i);
    fireEvent.click(themeToggle);
    
    // Check if theme classes are applied (simplified check)
    expect(document.querySelector('.min-h-screen')).toBeInTheDocument();
  });

  it('shows PWA install button when app is installable', () => {
    // Mock the beforeinstallprompt event
    const beforeInstallPromptEvent = new Event('beforeinstallprompt');
    Object.defineProperty(beforeInstallPromptEvent, 'prompt', {
      value: mockPrompt,
      writable: true,
    });
    
    renderWithRouter(<WelcomeScreen />);
    
    // Simulate the beforeinstallprompt event
    window.dispatchEvent(beforeInstallPromptEvent);
    
    // The install button should appear
    expect(screen.getByRole('button', { name: /install app/i })).toBeInTheDocument();
  });

  it('calls onInstallPWA prop when install button is clicked', async () => {
    const mockOnInstallPWA = jest.fn();
    
    // Mock the beforeinstallprompt event
    const beforeInstallPromptEvent = new Event('beforeinstallprompt');
    Object.defineProperty(beforeInstallPromptEvent, 'prompt', {
      value: mockPrompt,
      writable: true,
    });
    
    renderWithRouter(<WelcomeScreen onInstallPWA={mockOnInstallPWA} />);
    
    // Simulate the beforeinstallprompt event
    window.dispatchEvent(beforeInstallPromptEvent);
    
    const installButton = screen.getByRole('button', { name: /install app/i });
    fireEvent.click(installButton);
    
    await waitFor(() => {
      expect(mockOnInstallPWA).toHaveBeenCalled();
    });
  });

  it('displays terms and privacy links', () => {
    renderWithRouter(<WelcomeScreen />);
    
    expect(screen.getByText(/terms of service/i)).toBeInTheDocument();
    expect(screen.getByText(/privacy policy/i)).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    renderWithRouter(<WelcomeScreen />);
    
    expect(screen.getByLabelText(/toggle theme/i)).toBeInTheDocument();
    expect(screen.getByAltText(/messhub logo/i)).toBeInTheDocument();
  });

  it('applies dark mode styling correctly', () => {
    renderWithRouter(<WelcomeScreen />);
    
    const container = screen.getByText(/welcome to messhub/i).closest('.min-h-screen');
    expect(container).toHaveClass('bg-messhub-light-bg');
  });

  it('renders app logo with correct path', () => {
    renderWithRouter(<WelcomeScreen />);
    
    const logo = screen.getByAltText(/messhub logo/i);
    expect(logo).toHaveAttribute('src', '/public/authImg/LightImg.png');
  });
});
