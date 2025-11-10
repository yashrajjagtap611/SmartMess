// Centralized authentication utilities for LeaveManagement
export const useAuth = () => {
  const getAuthToken = () => {
    return localStorage.getItem('authToken');
  };

  const checkMessOwnerRole = () => {
    const token = getAuthToken();
    if (!token) {
      return { isValid: false, error: 'No authentication token found' };
    }

    try {
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        throw new Error('Invalid token format');
      }
      
      if (!tokenParts[1] || typeof tokenParts[1] !== 'string') {
        throw new Error('Invalid token payload');
      }
      
      const payload = JSON.parse(atob(tokenParts[1]));
      if (payload.role !== 'mess-owner') {
        return { 
          isValid: false, 
          error: 'Access denied. This feature is only available for mess owners.' 
        };
      }
      
      return { isValid: true, error: null };
    } catch (error) {
      console.warn('Token parsing failed, but continuing with API call:', error);
      return { isValid: true, error: null }; // Let API handle authentication
    }
  };

  const getAuthHeaders = () => {
    const token = getAuthToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  return {
    getAuthToken,
    checkMessOwnerRole,
    getAuthHeaders
  };
};
