import { authService } from '@/services/authService';

export const handleLogout = (navigate: any) => {
  try {
    // Clear authentication data
    authService.logout();
    
    // Show success message
    console.log("Logged out successfully!");
    
    // Use React Router navigation instead of window.location
    if (navigate && typeof navigate === 'function') {
      navigate('/login');
    } else {
      // Fallback to window.location if navigate function is not available
      window.location.href = '/login';
    }
  } catch (error) {
    console.error('Error during logout:', error);
    // Force redirect even if there's an error
    window.location.href = '/login';
  }
}; 