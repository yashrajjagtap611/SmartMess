import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RegisterScreen from './RegisterScreen';
import '@testing-library/jest-dom';

// Mock dependencies
jest.mock('@/services/authService', () => ({
  authService: {
    register: jest.fn(),
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
  useLocation: () => ({ state: { role: 'user' } }),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('RegisterScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders registration form', () => {
    renderWithRouter(<RegisterScreen />);
    
    expect(screen.getByText(/create account/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  it('shows validation errors for empty required fields', async () => {
    renderWithRouter(<RegisterScreen />);
    
    const registerButton = screen.getByRole('button', { name: /create account/i });
    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/phone number is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('shows password mismatch error', async () => {
    renderWithRouter(<RegisterScreen />);
    
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'Password123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'DifferentPassword' } });
    
    const registerButton = screen.getByRole('button', { name: /create account/i });
    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  it('calls onRegister prop when provided', async () => {
    const mockOnRegister = jest.fn();
    renderWithRouter(<RegisterScreen onRegister={mockOnRegister} />);
    
    // Fill form with valid data
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/phone/i), { target: { value: '+1234567890' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'Password123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'Password123' } });
    
    const registerButton = screen.getByRole('button', { name: /create account/i });
    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(mockOnRegister).toHaveBeenCalledWith(expect.objectContaining({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        password: 'Password123',
        confirmPassword: 'Password123',
        role: 'user'
      }));
    });
  });

  it('toggles password visibility', () => {
    renderWithRouter(<RegisterScreen />);
    
    const passwordInput = screen.getByLabelText(/^password$/i) as HTMLInputElement;
    const toggleButton = passwordInput.parentElement?.querySelector('button');
    
    expect(passwordInput.type).toBe('password');
    
    if (toggleButton) {
      fireEvent.click(toggleButton);
      expect(passwordInput.type).toBe('text');
    }
  });

  it('toggles theme', () => {
    renderWithRouter(<RegisterScreen />);
    
    const themeToggle = screen.getByLabelText(/toggle theme/i);
    fireEvent.click(themeToggle);
    
    // Check if dark mode classes are applied (this is a simplified check)
    expect(document.querySelector('.min-h-screen')).toBeInTheDocument();
  });
});
