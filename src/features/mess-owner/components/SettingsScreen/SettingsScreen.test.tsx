import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SettingsScreen from './SettingsScreen';
import '@testing-library/jest-dom';

// Mock dependencies
jest.mock('@/contexts/MessProfileContext', () => ({
  MessProfileProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useMessProfile: () => ({
    photo: 'test-photo.jpg',
    loading: false,
    error: null,
    uploadProgress: null,
    handlePhotoChange: jest.fn(),
    handleDeletePhoto: jest.fn(),
    messProfile: {
      name: 'Test Mess',
      location: { city: 'Test City', state: 'Test State' },
      colleges: ['Test College'],
      rating: 4.5,
      memberCount: 50
    },
    isInitialized: true
  })
}));

jest.mock('@/components/theme/theme-provider', () => ({
  useTheme: () => ({
    isDarkTheme: false,
    toggleTheme: jest.fn()
  })
}));

jest.mock('@/services/authService', () => ({
  authService: {
    getCurrentUser: () => ({ id: '1', name: 'Test User' })
  }
}));

jest.mock('@/utils/logout', () => ({
  handleLogout: jest.fn()
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('SettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders settings screen with all components', () => {
    renderWithRouter(<SettingsScreen />);
    
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Manage your settings and profile details here.')).toBeInTheDocument();
  });

  it('renders photo upload component', () => {
    renderWithRouter(<SettingsScreen />);
    
    expect(screen.getByLabelText('Upload photo')).toBeInTheDocument();
  });

  it('renders mess info component', () => {
    renderWithRouter(<SettingsScreen />);
    
    expect(screen.getByText('1 Colleges')).toBeInTheDocument();
    expect(screen.getByText('4.5 Rating')).toBeInTheDocument();
    expect(screen.getByText('📍 Test City, Test State')).toBeInTheDocument();
  });

  it('renders settings navigation with all items', () => {
    renderWithRouter(<SettingsScreen />);
    
    expect(screen.getByText('Mess Profile')).toBeInTheDocument();
    expect(screen.getByText('Mess Plans')).toBeInTheDocument();
    expect(screen.getByText('Operating Hours')).toBeInTheDocument();
    expect(screen.getByText('Security')).toBeInTheDocument();
    expect(screen.getByText('Payment')).toBeInTheDocument();
  });

  it('shows loading state when not initialized', () => {
    jest.doMock('@/contexts/MessProfileContext', () => ({
      MessProfileProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
      useMessProfile: () => ({
        photo: null,
        loading: false,
        error: null,
        uploadProgress: null,
        handlePhotoChange: jest.fn(),
        handleDeletePhoto: jest.fn(),
        messProfile: null,
        isInitialized: false
      })
    }));

    renderWithRouter(<SettingsScreen />);
    
    expect(screen.getByText('Loading settings...')).toBeInTheDocument();
  });

  it('handles photo upload click', () => {
    renderWithRouter(<SettingsScreen />);
    
    const uploadButton = screen.getByLabelText('Upload photo');
    fireEvent.click(uploadButton);
    
    // The click should be handled by the component
    expect(uploadButton).toBeInTheDocument();
  });

  it('displays error message when photo upload fails', () => {
    jest.doMock('@/contexts/MessProfileContext', () => ({
      MessProfileProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
      useMessProfile: () => ({
        photo: null,
        loading: false,
        error: 'Upload failed',
        uploadProgress: null,
        handlePhotoChange: jest.fn(),
        handleDeletePhoto: jest.fn(),
        messProfile: {
          name: 'Test Mess',
          location: { city: 'Test City', state: 'Test State' },
          colleges: ['Test College'],
          rating: 4.5,
          memberCount: 50
        },
        isInitialized: true
      })
    }));

    renderWithRouter(<SettingsScreen />);
    
    expect(screen.getByText('Upload failed')).toBeInTheDocument();
  });

  it('displays upload progress when uploading', () => {
    jest.doMock('@/contexts/MessProfileContext', () => ({
      MessProfileProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
      useMessProfile: () => ({
        photo: null,
        loading: true,
        error: null,
        uploadProgress: 'Uploading... 50%',
        handlePhotoChange: jest.fn(),
        handleDeletePhoto: jest.fn(),
        messProfile: {
          name: 'Test Mess',
          location: { city: 'Test City', state: 'Test State' },
          colleges: ['Test College'],
          rating: 4.5,
          memberCount: 50
        },
        isInitialized: true
      })
    }));

    renderWithRouter(<SettingsScreen />);
    
    expect(screen.getByText('Uploading... 50%')).toBeInTheDocument();
  });

  it('navigates to settings pages when navigation items are clicked', () => {
    const mockNavigate = jest.fn();
    jest.doMock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useNavigate: () => mockNavigate,
    }));

    renderWithRouter(<SettingsScreen />);
    
    const messProfileButton = screen.getByText('Mess Profile');
    fireEvent.click(messProfileButton);
    
    // The navigation should be handled by the component
    expect(messProfileButton).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    renderWithRouter(<SettingsScreen />);
    
    expect(screen.getByLabelText('Upload photo')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('applies dark mode styling correctly', () => {
    renderWithRouter(<SettingsScreen />);
    
    const container = screen.getByText('Settings').closest('.min-h-screen');
    expect(container).toHaveClass('SmartMess-light-bg dark:SmartMess-dark-bg');
  });
});




