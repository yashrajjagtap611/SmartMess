import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ReportsAnalytics from './ReportsAnalytics';

// Mock the dependencies
jest.mock('@/components/common/Navbar/CommonNavbar', () => ({
  SideNavigation: () => <div data-testid="side-navigation">Side Navigation</div>,
  BottomNavigation: () => <div data-testid="bottom-navigation">Bottom Navigation</div>,
}));

jest.mock('@/components/theme/theme-provider', () => ({
  useTheme: () => ({
    isDarkTheme: false,
    toggleTheme: jest.fn(),
  }),
}));

jest.mock('@/utils/logout', () => ({
  handleLogout: jest.fn(),
}));

jest.mock('./components/ReportsAnalyticsContent', () => ({
  __esModule: true,
  default: () => <div data-testid="reports-analytics-content">Reports Analytics Content</div>,
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('ReportsAnalytics', () => {
  it('renders the reports analytics component', () => {
    renderWithRouter(<ReportsAnalytics />);
    expect(screen.getByTestId('reports-analytics-content')).toBeInTheDocument();
  });

  it('renders side navigation', () => {
    renderWithRouter(<ReportsAnalytics />);
    expect(screen.getByTestId('side-navigation')).toBeInTheDocument();
  });

  it('renders bottom navigation', () => {
    renderWithRouter(<ReportsAnalytics />);
    expect(screen.getByTestId('bottom-navigation')).toBeInTheDocument();
  });
});



