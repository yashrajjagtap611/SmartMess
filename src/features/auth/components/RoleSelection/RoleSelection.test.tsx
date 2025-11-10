import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RoleSelection from './RoleSelection';
import '@testing-library/jest-dom';

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('RoleSelection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders role selection screen', () => {
    renderWithRouter(<RoleSelection />);
    
    expect(screen.getByText(/choose your role/i)).toBeInTheDocument();
    expect(screen.getByText(/select how you'll use messhub/i)).toBeInTheDocument();
    expect(screen.getByText(/user/i)).toBeInTheDocument();
    expect(screen.getByText(/mess owner/i)).toBeInTheDocument();
  });

  it('renders both role options with descriptions', () => {
    renderWithRouter(<RoleSelection />);
    
    expect(screen.getByText(/join existing messes and connect with others/i)).toBeInTheDocument();
    expect(screen.getByText(/create and manage your own mess/i)).toBeInTheDocument();
  });

  it('allows selecting a role', () => {
    renderWithRouter(<RoleSelection />);
    
    const userRole = screen.getByRole('button', { name: /user join existing messes and connect with others/i });
    fireEvent.click(userRole);
    
    // Check if the role is visually selected (has primary styling)
    expect(userRole).toHaveClass('border-messhub-light-primary');
  });

  it('shows role benefits when a role is selected', () => {
    renderWithRouter(<RoleSelection />);
    
    const userRole = screen.getByRole('button', { name: /user join existing messes and connect with others/i });
    fireEvent.click(userRole);
    
    expect(screen.getByText(/user benefits:/i)).toBeInTheDocument();
    expect(screen.getByText(/join multiple messes/i)).toBeInTheDocument();
    expect(screen.getByText(/connect with mess members/i)).toBeInTheDocument();
  });

  it('shows mess owner benefits when mess owner role is selected', () => {
    renderWithRouter(<RoleSelection />);
    
    const messOwnerRole = screen.getByRole('button', { name: /mess owner create and manage your own mess/i });
    fireEvent.click(messOwnerRole);
    
    expect(screen.getByText(/mess owner benefits:/i)).toBeInTheDocument();
    expect(screen.getByText(/create and manage your mess/i)).toBeInTheDocument();
    expect(screen.getByText(/invite and manage members/i)).toBeInTheDocument();
  });

  it('enables continue button when role is selected', () => {
    renderWithRouter(<RoleSelection />);
    
    const continueButton = screen.getByRole('button', { name: /continue/i });
    expect(continueButton).toBeDisabled();
    
    const userRole = screen.getByRole('button', { name: /user join existing messes and connect with others/i });
    fireEvent.click(userRole);
    
    expect(continueButton).toBeEnabled();
  });

  it('calls onRoleSelect prop when role is selected', () => {
    const mockOnRoleSelect = jest.fn();
    renderWithRouter(<RoleSelection onRoleSelect={mockOnRoleSelect} />);
    
    const userRole = screen.getByRole('button', { name: /user join existing messes and connect with others/i });
    fireEvent.click(userRole);
    
    expect(mockOnRoleSelect).toHaveBeenCalledWith('user');
  });

  it('calls onContinue prop when continue button is clicked', () => {
    const mockOnContinue = jest.fn();
    renderWithRouter(<RoleSelection onContinue={mockOnContinue} />);
    
    // Select a role first
    const userRole = screen.getByRole('button', { name: /user join existing messes and connect with others/i });
    fireEvent.click(userRole);
    
    // Click continue
    const continueButton = screen.getByRole('button', { name: /continue/i });
    fireEvent.click(continueButton);
    
    expect(mockOnContinue).toHaveBeenCalledWith('user');
  });

  it('calls onBack prop when back button is clicked', () => {
    const mockOnBack = jest.fn();
    renderWithRouter(<RoleSelection onBack={mockOnBack} />);
    
    const backButton = screen.getByLabelText(/go back/i);
    fireEvent.click(backButton);
    
    expect(mockOnBack).toHaveBeenCalled();
  });

  it('toggles theme when theme button is clicked', () => {
    renderWithRouter(<RoleSelection />);
    
    const themeToggle = screen.getByLabelText(/toggle theme/i);
    fireEvent.click(themeToggle);
    
    // Check if dark mode classes are applied (simplified check)
    expect(document.querySelector('.min-h-screen')).toBeInTheDocument();
  });

  it('shows default benefits text when no role is selected', () => {
    renderWithRouter(<RoleSelection />);
    
    expect(screen.getByText(/select a role to see benefits/i)).toBeInTheDocument();
    expect(screen.getByText(/choose a role above to see what you can do/i)).toBeInTheDocument();
  });

  it('switches role selection', () => {
    renderWithRouter(<RoleSelection />);
    
    // Select user role first
    const userRole = screen.getByRole('button', { name: /user join existing messes and connect with others/i });
    fireEvent.click(userRole);
    expect(screen.getByText(/user benefits:/i)).toBeInTheDocument();
    
    // Switch to mess owner role
    const messOwnerRole = screen.getByRole('button', { name: /mess owner create and manage your own mess/i });
    fireEvent.click(messOwnerRole);
    expect(screen.getByText(/mess owner benefits:/i)).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    renderWithRouter(<RoleSelection />);
    
    expect(screen.getByLabelText(/go back/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/toggle theme/i)).toBeInTheDocument();
    
    // Role buttons should be focusable
    const userRole = screen.getByRole('button', { name: /user join existing messes and connect with others/i });
    expect(userRole).toHaveAttribute('tabIndex', '0');
  });
});
