import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import MealPlan from './MealPlan';
import type { MealPlanProps } from './MealPlan.types';

// Mock the components
jest.mock('./components/MealPlanForm', () => ({
  MealPlanForm: ({ planId }: { planId?: string }) => (
    <div data-testid="meal-plan-form">
      <h2>Meal Plan Form</h2>
      {planId && <p>Editing plan: {planId}</p>}
    </div>
  ),
}));

jest.mock('./components/MessPlans', () => ({
  MessPlans: (props: any) => (
    <div data-testid="mess-plans">
      <h2>Mess Plans</h2>
      <button onClick={() => props?.onMealPlanCreate?.()}>Create Plan</button>
      <button onClick={() => props?.onMealPlanEdit?.({ _id: 'test-id', name: 'Test Plan' })}>Edit Plan</button>
      <button onClick={() => props?.onMealPlanDelete?.('test-id')}>Delete Plan</button>
    </div>
  ),
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Routes: ({ children }: { children: React.ReactNode }) => <div data-testid="routes">{children}</div>,
  Route: ({ element }: { element: React.ReactNode }) => <div data-testid="route">{element}</div>,
}));

describe('MealPlan', () => {
  const defaultProps: MealPlanProps = {
    onMealPlanCreate: jest.fn(),
    onMealPlanUpdate: jest.fn(),
    onMealPlanDelete: jest.fn(),
  };

  const renderMealPlan = (props = {}) => {
    return render(
      <BrowserRouter>
        <MealPlan {...defaultProps} {...props} />
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    renderMealPlan();
    expect(screen.getByTestId('routes')).toBeInTheDocument();
  });

  it('renders MessPlans component by default', () => {
    renderMealPlan();
    expect(screen.getByTestId('mess-plans')).toBeInTheDocument();
  });

  it('renders MealPlanForm component for new route', () => {
    // Mock useLocation to return pathname with /new
    jest.spyOn(require('react-router-dom'), 'useLocation').mockReturnValue({
      pathname: '/mess-owner/settings/mess-plans/new',
    });

    renderMealPlan();
    expect(screen.getByTestId('meal-plan-form')).toBeInTheDocument();
  });

  it('renders MealPlanForm component for edit route', () => {
    // Mock useLocation to return pathname with /edit
    jest.spyOn(require('react-router-dom'), 'useLocation').mockReturnValue({
      pathname: '/mess-owner/settings/mess-plans/edit/test-id',
    });

    renderMealPlan();
    expect(screen.getByTestId('meal-plan-form')).toBeInTheDocument();
  });

  it('passes props to MessPlans component', () => {
    const mockOnCreate = jest.fn();
    const mockOnEdit = jest.fn();
    const mockOnDelete = jest.fn();

    renderMealPlan({
      onMealPlanCreate: mockOnCreate,
      onMealPlanEdit: mockOnEdit,
      onMealPlanDelete: mockOnDelete,
    });

    const createButton = screen.getByText('Create Plan');
    const editButton = screen.getByText('Edit Plan');
    const deleteButton = screen.getByText('Delete Plan');

    fireEvent.click(createButton);
    expect(mockOnCreate).toHaveBeenCalled();

    fireEvent.click(editButton);
    expect(mockOnEdit).toHaveBeenCalledWith({ _id: 'test-id', name: 'Test Plan' });

    fireEvent.click(deleteButton);
    expect(mockOnDelete).toHaveBeenCalledWith('test-id');
  });

  it('handles undefined props gracefully', () => {
    renderMealPlan({});
    
    const createButton = screen.getByText('Create Plan');
    const editButton = screen.getByText('Edit Plan');
    const deleteButton = screen.getByText('Delete Plan');

    // Should not throw errors when props are undefined
    expect(() => {
      fireEvent.click(createButton);
      fireEvent.click(editButton);
      fireEvent.click(deleteButton);
    }).not.toThrow();
  });
});









