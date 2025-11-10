"use client"

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';


import { Badge } from '../ui/badge';
import { 
  UserIcon, 
  BuildingOfficeIcon, 
  ShieldCheckIcon,
  InformationCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { authService } from '@/services/authService';
import { ROUTES } from '../../constants/routes';

const QuickLoginScreen: React.FC = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleQuickLogin = async (role: string) => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Use mock authentication
    authService.mockAuthenticate(role as 'user' | 'mess-owner' | 'admin');
    
    console.log('🔐 Authentication Debug:', {
      isAuthenticated: authService.isAuthenticated(),
      userRole: authService.getCurrentUserRole(),
      currentUser: authService.getCurrentUser()
    });
    
    // Navigate to appropriate dashboard
    if (role === 'admin') {
      navigate(ROUTES.ADMIN.DASHBOARD);
    } else if (role === 'mess-owner') {
      navigate(ROUTES.MESS_OWNER.DASHBOARD);
    } else if (role === 'user') {
      navigate(ROUTES.USER.DASHBOARD);
    }
    
    setIsLoading(false);
  };

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
  };

  const checkAuthStatus = () => {
    console.log('🔍 Current Auth Status:', {
      isAuthenticated: authService.isAuthenticated(),
      userRole: authService.getCurrentUserRole(),
      currentUser: authService.getCurrentUser(),
      localStorage: {
        authToken: localStorage.getItem('authToken'),
        userRole: localStorage.getItem('userRole'),
        userInfo: localStorage.getItem('userInfo'),
        authExpires: localStorage.getItem('authExpires')
      }
    });
  };

  const clearAuth = () => {
    authService.logout();
    console.log('🧹 Auth cleared');
    navigate('/');
  };

  const roles = [
    {
      id: 'admin',
      name: 'Admin',
      description: 'System administrator with full access',
      icon: ShieldCheckIcon,
      color: 'bg-red-500',
      badgeColor: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    },
    {
      id: 'mess-owner',
      name: 'Mess Owner',
      description: 'Manage mess operations and user accounts',
      icon: BuildingOfficeIcon,
      color: 'bg-blue-500',
      badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    },
    {
      id: 'user',
      name: 'User',
      description: 'Regular user with basic access',
      icon: UserIcon,
      color: 'bg-green-500',
      badgeColor: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            SmartMess Dev
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Quick login for development and testing
          </p>
        </div>

        {/* Quick Login Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <InformationCircleIcon className="w-5 h-5 text-blue-500" />
              <span>Quick Login</span>
            </CardTitle>
            <CardDescription>
              Select a role to quickly access the application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Role Selection */}
            <div className="space-y-3">
              {roles.map((role) => {
                const IconComponent = role.icon;
                return (
                  <button
                    key={role.id}
                    onClick={() => handleRoleSelect(role.id)}
                    className={`w-full p-4 rounded-lg border-2 transition-all duration-200 ${
                      selectedRole === role.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg ${role.color} flex items-center justify-center`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {role.name}
                          </h3>
                          <Badge className={role.badgeColor}>
                            {role.id}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {role.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Login Button */}
            <Button
              onClick={() => handleQuickLogin(selectedRole)}
              disabled={!selectedRole || isLoading}
              className="w-full"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Logging in...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span>Login as {selectedRole || 'User'}</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </div>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Development Tools */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Development Tools</CardTitle>
            <CardDescription>
              Useful tools for development and testing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              onClick={() => navigate('/debug/pwa')}
              className="w-full justify-start"
            >
              <InformationCircleIcon className="w-4 h-4 mr-2" />
              PWA Debug Screen
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                // Clear all storage
                localStorage.clear();
                sessionStorage.clear();
                // Clear service worker cache
                if ('caches' in window) {
                  caches.keys().then(names => {
                    names.forEach(name => caches.delete(name));
                  });
                }
                alert('All storage and cache cleared!');
              }}
              className="w-full justify-start"
            >
              <ShieldCheckIcon className="w-4 h-4 mr-2" />
              Clear Storage & Cache
            </Button>
            
            <Button
              variant="outline"
              onClick={checkAuthStatus}
              className="w-full justify-start"
            >
              <InformationCircleIcon className="w-4 h-4 mr-2" />
              Check Auth Status
            </Button>
            
            <Button
              variant="outline"
              onClick={clearAuth}
              className="w-full justify-start"
            >
              <ShieldCheckIcon className="w-4 h-4 mr-2" />
              Clear Auth & Go Home
            </Button>
          </CardContent>
        </Card>

        {/* Info */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>This is a development screen for quick testing.</p>
          <p>Use the regular login flow for production.</p>
        </div>
      </div>
    </div>
  );
};

export default QuickLoginScreen; 