import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/authService';

const AuthTest: React.FC = () => {
  const { user, isAuthenticated, isLoading, error, login, logout } = useAuth();
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [testResult, setTestResult] = useState<any>(null);

  const handleLogin = async () => {
    try {
      await login(email, password);
      setTestResult({ success: true, message: 'Login successful' });
    } catch (error) {
      setTestResult({ success: false, message: 'Login failed', error });
    }
  };

  const handleLogout = () => {
    logout();
    setTestResult({ success: true, message: 'Logout successful' });
  };

  const handleCheckAuth = () => {
    const authStatus = {
      isAuthenticated: authService.isAuthenticated(),
      isTokenExpired: authService.isTokenExpired(),
      userRole: authService.getCurrentUserRole(),
      currentUser: authService.getCurrentUser()
    };
    setTestResult({ success: true, message: 'Auth status checked', data: authStatus });
  };

  const handleClearStorage = () => {
    localStorage.clear();
    setTestResult({ success: true, message: 'Local storage cleared' });
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Authentication Test</h1>
      
      <div className="mb-6 p-4 bg-gray-100 rounded">
        <h2 className="text-lg font-semibold mb-2">Current Auth State</h2>
        <p><strong>Is Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
        <p><strong>Is Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
        <p><strong>User:</strong> {user ? `${user.firstName} ${user.lastName}` : 'None'}</p>
        {error && <p><strong>Error:</strong> {error}</p>}
      </div>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Test Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          <button 
            onClick={handleLogin}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Test Login
          </button>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Test Logout
          </button>
          <button 
            onClick={handleCheckAuth}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Check Auth Status
          </button>
          <button 
            onClick={handleClearStorage}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Clear Storage
          </button>
        </div>
      </div>
      
      {testResult && (
        <div className="mb-6 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Test Result</h2>
          <pre className={`p-4 rounded overflow-auto ${testResult.success ? 'bg-green-100' : 'bg-red-100'}`}>
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
      )}
      
      <div>
        <h2 className="text-lg font-semibold mb-2">Instructions</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Use this component to test authentication flows</li>
          <li>Check the browser console for detailed logs</li>
          <li>Use "Clear Storage" to reset authentication state</li>
          <li>If you see continuous redirects, check the reload count in console</li>
        </ul>
      </div>
    </div>
  );
};

export default AuthTest;