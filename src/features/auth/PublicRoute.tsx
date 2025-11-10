import React from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '@/services/authService';
import { ROUTES } from '../../constants/routes';

interface PublicRouteProps {
  element: React.ReactElement;
  restrictedAfterAuth?: boolean;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ element, restrictedAfterAuth = true }) => {
  const isAuthenticated = authService.isAuthenticated();
  const userRole = authService.getCurrentUserRole();
  
  // If authenticated and this route is restricted after auth (like login page)
  // then redirect to appropriate dashboard
  if (isAuthenticated && restrictedAfterAuth) {
    if (userRole === 'admin') {
      return <Navigate to={ROUTES.ADMIN.DASHBOARD} replace />;
    } else if (userRole === 'mess-owner') {
      return <Navigate to={ROUTES.MESS_OWNER.DASHBOARD} replace />;
    } else if (userRole === 'user') {
      return <Navigate to={ROUTES.USER.DASHBOARD} replace />;
    }
  }
  
  // If not authenticated or route is not restricted after auth, render the route
  return <>{element}</>;
};

export default PublicRoute; 