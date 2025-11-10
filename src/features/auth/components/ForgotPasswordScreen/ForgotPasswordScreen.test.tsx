import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import ForgotPasswordScreen from './ForgotPasswordScreen';

// Mock dependencies
const mockAuthService = {
  forgotPassword: jest.fn(),
};

jest.mock('@/services/authService', () => ({
  authService: mockAuthService,
}));

const mockUseToast = {
  toast: jest.fn(),
};

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => mockUseToast,
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('ForgotPasswordScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render successfully', () => {
    renderWithRouter(<ForgotPasswordScreen onSubmit={jest.fn()} onBack={jest.fn()} />);
    
    expect(screen.getByText('Forgot Password?')).toBeInTheDocument();
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send verification code/i })).toBeInTheDocument();
  });

  it('should display error for empty email', async () => {
    renderWithRouter(<ForgotPasswordScreen onSubmit={jest.fn()} onBack={jest.fn()} />);
    
    const submitButton = screen.getByRole('button', { name: /send verification code/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });
  });

  it('should display error for invalid email', async () => {
    renderWithRouter(<ForgotPasswordScreen onSubmit={jest.fn()} onBack={jest.fn()} />);
    
    const emailInput = screen.getByLabelText('Email Address');
    const submitButton = screen.getByRole('button', { name: /send verification code/i });

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });
  });

  it('should call authService.forgotPassword with valid email', async () => {
    mockAuthService.forgotPassword.mockResolvedValueOnce(undefined);

    renderWithRouter(<ForgotPasswordScreen onSubmit={jest.fn()} onBack={jest.fn()} />);
    
    const emailInput = screen.getByLabelText('Email Address');
    const submitButton = screen.getByRole('button', { name: /send verification code/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockAuthService.forgotPassword).toHaveBeenCalledWith('test@example.com');
    });
  });

  it('should call onSubmit prop when provided', async () => {
    const mockOnSubmit = jest.fn();
    mockAuthService.forgotPassword.mockResolvedValueOnce(undefined);

    renderWithRouter(<ForgotPasswordScreen onSubmit={mockOnSubmit} />);
    
    const emailInput = screen.getByLabelText('Email Address');
    const submitButton = screen.getByRole('button', { name: /send verification code/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith('test@example.com');
    });
  });

  it('should toggle theme when theme button is clicked', () => {
    renderWithRouter(<ForgotPasswordScreen onSubmit={jest.fn()} onBack={jest.fn()} />);
    
    const themeButton = screen.getByLabelText('Toggle theme');
    const container = screen.getByText('Forgot Password?').closest('div');

    expect(container).toHaveClass('bg-messhub-light-bg');
    
    fireEvent.click(themeButton);
    
    expect(container).toHaveClass('bg-messhub-dark-bg');
  });

  it('should navigate back when back button is clicked', () => {
    const mockOnBack = jest.fn();
    renderWithRouter(<ForgotPasswordScreen onBack={mockOnBack} />);
    
    const backButton = screen.getByLabelText('Go back');
    fireEvent.click(backButton);

    expect(mockOnBack).toHaveBeenCalled();
  });

  it('should clear error when email input changes', async () => {
    renderWithRouter(<ForgotPasswordScreen onSubmit={jest.fn()} onBack={jest.fn()} />);
    
    const emailInput = screen.getByLabelText('Email Address');
    const submitButton = screen.getByRole('button', { name: /send verification code/i });

    // First, trigger an error
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });

    // Then, change the email input
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    // Error should be cleared
    await waitFor(() => {
      expect(screen.queryByText('Email is required')).not.toBeInTheDocument();
    });
  });
});
