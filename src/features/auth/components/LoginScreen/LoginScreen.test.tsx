import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import LoginScreen from './index';

// Mock dependencies
const mockAuthService = {
  login: jest.fn(),
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

const renderComponent = (props = {}) => {
  return render(
    <BrowserRouter>
      <LoginScreen {...props} />
    </BrowserRouter>
  );
};

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders inputs and buttons', () => {
    renderComponent();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in|login/i })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    renderComponent();
    const submitButton = screen.getByRole('button', { name: /sign in|login/i });
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  it('calls authService.login on valid submit', async () => {
    mockAuthService.login.mockResolvedValueOnce({ data: { user: { role: 'user' } } });
    const onSubmit = jest.fn();

    renderComponent({ onSubmit });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'Passw0rd!' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in|login/i }));

    await waitFor(() => {
      expect(mockAuthService.login).toHaveBeenCalled();
      expect(onSubmit).toHaveBeenCalledWith('test@example.com', 'Passw0rd!');
    });
  });
});

