import React, { useEffect, useState } from 'react';

const AuthDebug: React.FC = () => {
  const [authInfo, setAuthInfo] = useState<any>({});
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    // Track reloads
    const count = sessionStorage.getItem('authDebugReloadCount');
    const newCount = count ? parseInt(count, 10) + 1 : 1;
    sessionStorage.setItem('authDebugReloadCount', newCount.toString());
    setReloadCount(newCount);

    // Get auth info
    const token = localStorage.getItem('authToken');
    const userInfo = localStorage.getItem('userInfo');
    const userRole = localStorage.getItem('userRole');
    
    setAuthInfo({
      hasToken: !!token,
      hasUserInfo: !!userInfo,
      userRole,
      tokenLength: token ? token.length : 0,
      userInfo: userInfo ? JSON.parse(userInfo) : null
    });

    // Log to console
    console.log('[AUTH DEBUG] Auth Info:', {
      hasToken: !!token,
      hasUserInfo: !!userInfo,
      userRole,
      reloadCount: newCount
    });
  }, []);

  const handleClearAuth = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('userRole');
    localStorage.removeItem('authExpires');
    window.location.reload();
  };

  const handleResetReloadCount = () => {
    sessionStorage.removeItem('authDebugReloadCount');
    window.location.reload();
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Authentication Debug</h1>
      
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <p className="font-bold">Warning: This is a debug component for development only</p>
      </div>
      
      <div className="mb-4">
        <p className="text-lg"><strong>Page Reloads:</strong> {reloadCount}</p>
      </div>
      
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Authentication Status</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify(authInfo, null, 2)}
        </pre>
      </div>
      
      <div className="flex gap-4">
        <button 
          onClick={handleClearAuth}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Clear Auth Data
        </button>
        
        <button 
          onClick={handleResetReloadCount}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Reset Reload Count
        </button>
      </div>
      
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Instructions</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>If you see continuous reloads, check the reload count above</li>
          <li>Use "Clear Auth Data" to reset authentication state</li>
          <li>Use "Reset Reload Count" to reset the counter</li>
          <li>Check browser console for detailed logs</li>
        </ul>
      </div>
    </div>
  );
};

export default AuthDebug;