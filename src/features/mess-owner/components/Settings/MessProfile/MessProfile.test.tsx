import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { MessProfileProvider } from '../../../../../contexts/MessProfileContext';
import MessProfile from './MessProfile';

// Mock dependencies
jest.mock('../../../../../components/theme/theme-provider', () => ({
  useTheme: () => ({
    isDarkTheme: false,
    toggleTheme: jest.fn(),
  }),
}));

jest.mock('../../../../../contexts/MessProfileContext', () => ({
  MessProfileProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="mess-profile-provider">{children}</div>,
  useMessProfile: () => ({
    messProfile: {
      name: 'Test Mess',
      types: ['Veg'],
      location: {
        street: 'Test Street',
        city: 'Test City',
        district: 'Test District',
        state: 'Test State',
        pincode: '123456',
        country: 'India'
      },
      colleges: ['Test College'],
      collegeInput: '',
      ownerPhone: '1234567890',
      ownerEmail: 'test@example.com'
    },
    photo: null,
    loading: false,
    error: null,
    uploadProgress: null,
    isInitialized: true,
    updateMessProfile: jest.fn(),
    saveMessProfile: jest.fn(),
    handlePhotoChange: jest.fn(),
  }),
}));

jest.mock('../../../../../components/common/Navbar/CommonNavbar', () => ({
  SideNavigation: ({ children }: { children: React.ReactNode }) => <div data-testid="side-navigation">{children}</div>,
  BottomNavigation: ({ children }: { children: React.ReactNode }) => <div data-testid="bottom-navigation">{children}</div>,
}));

jest.mock('../../../../../components/common/Header/CommonHeader', () => ({
  CommonHeader: () => <div data-testid="common-header">Common Header</div>,
}));

jest.mock('../../../../../components/ui/toaster', () => ({
  Toaster: () => <div data-testid="toaster">Toaster</div>,
}));

const renderMessProfile = () => {
  return render(
    <BrowserRouter>
      <MessProfileProvider>
        <MessProfile />
      </MessProfileProvider>
    </BrowserRouter>
  );
};

describe('MessProfile', () => {
  it('renders without crashing', () => {
    renderMessProfile();
    expect(screen.getByTestId('mess-profile-provider')).toBeInTheDocument();
  });

  it('displays loading state when not initialized', () => {
    // Mock useMessProfile to return not initialized
    jest.mocked(require('../../../../../contexts/MessProfileContext').useMessProfile).mockReturnValue({
      messProfile: {},
      photo: null,
      loading: false,
      error: null,
      uploadProgress: null,
      isInitialized: false,
      updateMessProfile: jest.fn(),
      saveMessProfile: jest.fn(),
      handlePhotoChange: jest.fn(),
    });

    renderMessProfile();
    expect(screen.getByText('Loading Mess Profile')).toBeInTheDocument();
  });

  it('displays form when initialized', () => {
    renderMessProfile();
    expect(screen.getByText('Mess Name')).toBeInTheDocument();
    expect(screen.getByText('Location Details')).toBeInTheDocument();
    expect(screen.getByText('Nearby Colleges')).toBeInTheDocument();
    expect(screen.getByText('Contact Information')).toBeInTheDocument();
  });

  it('displays save button', () => {
    renderMessProfile();
    expect(screen.getByText('Save Changes')).toBeInTheDocument();
  });
});
