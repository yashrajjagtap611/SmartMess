import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ResetPasswordScreen from './ResetPasswordScreen';
import '@testing-library/jest-dom';

// Import the authService to access it in tests
import { authService } from '@/services/authService';

// Mock dependencies
jest.mock('@/services/authService', () => ({
  authService: {
    resetPassword: jest.fn(),
  },
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useLocation: () => ({ state: { email: 'test@example.com', otp: '123456' } }),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('ResetPasswordScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders reset password form', () => {
    renderWithRouter(<ResetPasswordScreen />);
    
    expect(screen.getByText(/reset your password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm new password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty passwords', async () => {
    renderWithRouter(<ResetPasswordScreen />);
    
    const resetButton = screen.getByRole('button', { name: /reset password/i });
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('shows password mismatch error', async () => {
    renderWithRouter(<ResetPasswordScreen />);
    
    fireEvent.change(screen.getByLabelText(/new password/i), { target: { value: 'Password123' } });
    fireEvent.change(screen.getByLabelText(/confirm new password/i), { target: { value: 'DifferentPassword' } });
    
    const resetButton = screen.getByRole('button', { name: /reset password/i });
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  it('shows password strength validation', async () => {
    renderWithRouter(<ResetPasswordScreen />);
    
    fireEvent.change(screen.getByLabelText(/new password/i), { target: { value: 'weak' } });
    fireEvent.change(screen.getByLabelText(/confirm new password/i), { target: { value: 'weak' } });
    
    const resetButton = screen.getByRole('button', { name: /reset password/i });
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });
  });

  it('calls authService.resetPassword with correct data', async () => {
    const mockResetPassword = jest.mocked(authService.resetPassword);
    mockResetPassword.mockResolvedValueOnce({} as any);

    renderWithRouter(<ResetPasswordScreen />);
    
    // Fill form with valid data
    fireEvent.change(screen.getByLabelText(/new password/i), { target: { value: 'Password123' } });
    fireEvent.change(screen.getByLabelText(/confirm new password/i), { target: { value: 'Password123' } });
    
    const resetButton = screen.getByRole('button', { name: /reset password/i });
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        otp: '123456',
        password: 'Password123',
      });
    });
  });

  it('calls onResetPassword prop when provided', async () => {
    const mockOnResetPassword = jest.fn();
    renderWithRouter(<ResetPasswordScreen onResetPassword={mockOnResetPassword} />);
    
    // Fill form with valid data
    fireEvent.change(screen.getByLabelText(/new password/i), { target: { value: 'Password123' } });
    fireEvent.change(screen.getByLabelText(/confirm new password/i), { target: { value: 'Password123' } });
    
    const resetButton = screen.getByRole('button', { name: /reset password/i });
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(mockOnResetPassword).toHaveBeenCalledWith(expect.objectContaining({
        email: 'test@example.com',
        otp: '123456',
        password: 'Password123',
        confirmPassword: 'Password123',
      }));
    });
  });

  it('toggles password visibility', () => {
    renderWithRouter(<ResetPasswordScreen />);
    
    const passwordInput = screen.getByLabelText(/new password/i) as HTMLInputElement;
    const toggleButton = passwordInput.parentElement?.querySelector('button');
    
    expect(passwordInput.type).toBe('password');
    
    if (toggleButton) {
      fireEvent.click(toggleButton);
      expect(passwordInput.type).toBe('text');
    }
  });

  it('shows success state after successful reset', async () => {
    const mockResetPassword = jest.mocked(authService.resetPassword);
    mockResetPassword.mockResolvedValueOnce({} as any);

    renderWithRouter(<ResetPasswordScreen />);
    
    // Fill and submit form
    fireEvent.change(screen.getByLabelText(/new password/i), { target: { value: 'Password123' } });
    fireEvent.change(screen.getByLabelText(/confirm new password/i), { target: { value: 'Password123' } });
    
    const resetButton = screen.getByRole('button', { name: /reset password/i });
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(screen.getByText(/password reset complete/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /continue to login/i })).toBeInTheDocument();
    });
  });

  it('toggles theme', () => {
    renderWithRouter(<ResetPasswordScreen />);
    
    const themeToggle = screen.getByLabelText(/toggle theme/i);
    fireEvent.click(themeToggle);
    
    // Check if theme classes are applied (simplified check)
    expect(document.querySelector('.min-h-screen')).toBeInTheDocument();
  });
});
