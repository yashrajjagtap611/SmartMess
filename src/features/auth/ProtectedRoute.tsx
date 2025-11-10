import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { authService } from '@/services/authService';
import { ROUTES } from '../../constants/routes';

interface ProtectedRouteProps {
  element: React.ReactElement;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element, allowedRoles }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isAuthenticated, setIsAuthenticated] = useState(() => authService.isAuthenticated());
  const [userRole, setUserRole] = useState(() => authService.getCurrentUserRole());
  
  useEffect(() => {
    // Handle online/offline status changes
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  useEffect(() => {
    // Only check authentication when online
    if (isOnline) {
      const checkAuth = () => {
        const authenticated = authService.isAuthenticated();
        const role = authService.getCurrentUserRole();
        
        setIsAuthenticated(authenticated);
        setUserRole(role);
        
        // If token is expired and we're online, logout gracefully
        if (authenticated && authService.isTokenExpired()) {
          console.warn('Token expired, logging out user');
          authService.logout();
          setIsAuthenticated(false);
          setUserRole(null);
          navigate(ROUTES.PUBLIC.LOGIN, { 
            state: { from: location.pathname },
            replace: true 
          });
        }
      };
      
      checkAuth();
    }
  }, [isOnline]); // Removed 'location.pathname' and 'navigate' to prevent infinite re-renders
  
  // If offline and we have stored auth data, allow access (offline mode)
  if (!isOnline && localStorage.getItem('authToken')) {
    return <>{element}</>;
  }
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.PUBLIC.LOGIN} state={{ from: location.pathname }} replace />;
  }
  
  // If roles are specified, check if user has required role
  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    // Redirect based on user's role
    if (userRole === 'admin') {
      return <Navigate to={ROUTES.ADMIN.DASHBOARD} replace />;
    } else if (userRole === 'mess-owner') {
      return <Navigate to={ROUTES.MESS_OWNER.DASHBOARD} replace />;
    } else if (userRole === 'user') {
      return <Navigate to={ROUTES.USER.DASHBOARD} replace />;
    } else {
      // Fallback if role is unknown
      return <Navigate to={ROUTES.PUBLIC.LOGIN} replace />;
    }
  }
  
  // User is authenticated and has the required role
  return <>{element}</>;
};

export default ProtectedRoute; 