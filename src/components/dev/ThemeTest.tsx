import React from 'react';
import { useTheme } from '../theme/theme-provider';

const ThemeTest: React.FC = () => {
  const { theme, isDarkTheme, toggleTheme } = useTheme();

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold">Theme Test</h2>
      
      <div className="space-y-2">
        <p>Current Theme: <span className="font-mono">{theme}</span></p>
        <p>Is Dark Theme: <span className="font-mono">{isDarkTheme ? 'true' : 'false'}</span></p>
        <p>Document Classes: <span className="font-mono">{document.documentElement.className}</span></p>
      </div>

      <button 
        onClick={toggleTheme}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Toggle Theme
      </button>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-SmartMess-light-bg dark:bg-SmartMess-dark-bg border border-SmartMess-light-border dark:border-SmartMess-dark-border rounded">
          <h3 className="text-SmartMess-light-text dark:text-SmartMess-dark-text font-semibold">SmartMess Theme Test</h3>
          <p className="text-SmartMess-light-text-secondary dark:text-SmartMess-dark-text-secondary">
            This should change colors with theme
          </p>
        </div>
        
        <div className="p-4 bg-background border border-border rounded">
          <h3 className="text-foreground font-semibold">Standard Theme Test</h3>
          <p className="text-muted-foreground">
            This should also change colors with theme
          </p>
        </div>
      </div>
    </div>
  );
};

export default ThemeTest;

