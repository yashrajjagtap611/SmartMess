// WebSocket connection test utility
export const testWebSocketConnection = () => {
  const wsUrl = `ws://${window.location.host}/?token=${Date.now()}`;
  
  console.log('Testing WebSocket connection to:', wsUrl);
  
  try {
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('✅ WebSocket connection successful');
      ws.close();
    };
    
    ws.onerror = (error) => {
      console.error('❌ WebSocket connection failed:', error);
    };
    
    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };
    
    // Timeout after 5 seconds
    setTimeout(() => {
      if (ws.readyState === WebSocket.CONNECTING) {
        console.error('❌ WebSocket connection timeout');
        ws.close();
      }
    }, 5000);
    
  } catch (error) {
    console.error('❌ Failed to create WebSocket:', error);
  }
};

// Check if HMR is working
export const checkHMRStatus = () => {
  if (import.meta.hot) {
    console.log('✅ HMR is available');
    
    import.meta.hot.on('vite:beforeUpdate', () => {
      console.log('🔄 HMR update detected');
    });
    
    import.meta.hot.on('vite:afterUpdate', () => {
      console.log('✅ HMR update applied');
    });
    
    import.meta.hot.on('vite:error', (error) => {
      console.error('❌ HMR error:', error);
    });
  } else {
    console.log('❌ HMR is not available');
  }
};

// Network connectivity test
export const testNetworkConnectivity = async () => {
  try {
    const response = await fetch('/');
    console.log('✅ HTTP connection successful:', response.status);
  } catch (error) {
    console.error('❌ HTTP connection failed:', error);
  }
};

// Run all tests
export const runDiagnostics = () => {
  console.log('🔍 Running network diagnostics...');
  testNetworkConnectivity();
  testWebSocketConnection();
  checkHMRStatus();
}; 