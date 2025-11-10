import React from 'react';
import { ArrowLeft, Sun, Moon, Eye, EyeOff, Mail, Lock, Phone, Users, Building2 } from 'lucide-react';
import { useRegisterScreen } from './RegisterScreen.hooks';
import { useTheme } from '@/components/theme/theme-provider';
import type { RegisterScreenProps } from './RegisterScreen.types';

const RegisterScreen: React.FC<RegisterScreenProps> = ({ onRegister, onGoogleRegister }) => {
  const { isDarkTheme, toggleTheme } = useTheme();
  const {
    showPassword,
    showConfirmPassword,
    selectedRole,
    formData,
    errors,
    togglePasswordVisibility,
    toggleConfirmPasswordVisibility,
    handleInputChange,
    handleRegister,
    handleGoogleRegister,
    handleBack,
    handleSignIn,
  } = useRegisterScreen({ 
    onRegister: onRegister || (() => {}), 
    onGoogleRegister: onGoogleRegister || (() => {}) 
  });

  // If no role is selected, show loading or redirect
  if (!selectedRole) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDarkTheme ? 'bg-messhub-dark-bg text-messhub-dark-text' : 'bg-messhub-light-bg text-messhub-light-text'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      {/* Dynamic CSS for placeholder colors */}
      

           {/* Header */}
           <div className="flex items-center justify-between p-2">
        <button
          onClick={handleBack}
          className={`p-3 rounded-2xl transition-all duration-300 ${
            isDarkTheme
              ? "bg-messhub-dark-surface/50 text-messhub-dark-text hover:bg-messhub-dark-hover border border-messhub-dark-border"
              : "bg-messhub-light-surface/50 text-messhub-light-text hover:bg-messhub-light-hover border border-messhub-light-border"
          } shadow-soft hover:shadow-medium backdrop-blur-sm`}
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>

        <button
          onClick={toggleTheme}
          className={`p-3 rounded-2xl transition-all duration-300 ${
            isDarkTheme
              ? "bg-messhub-dark-surface/50 text-messhub-dark-text hover:bg-messhub-dark-hover border border-messhub-dark-border"
              : "bg-messhub-light-surface/50 text-messhub-light-text hover:bg-messhub-light-hover border border-messhub-light-border"
          } shadow-soft hover:shadow-medium backdrop-blur-sm`}
          aria-label="Toggle theme"
        >
          {isDarkTheme ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      
      {/* Main Content */}
      <div className="flex flex-col items-center justify-center px-6 pb-8 lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
        {/* Left: Existing Form (mobile as-is) */}
        <div className="hidden lg:flex flex-col items-center justify-center space-y-8">
          <div className="text-center lg:text-left">
            <h2 className={`text-3xl lg:text-4xl font-bold mb-4 ${isDarkTheme ? 'text-messhub-dark-primary' : 'text-messhub-light-primary'}`}>Join MessHub</h2>
            <p className={`text-lg mb-8 ${isDarkTheme ? 'text-messhub-dark-text-secondary' : 'text-messhub-light-text-secondary'}`}>Create your account and become part of a growing community. Enjoy seamless mess management and exclusive features.</p>
          </div>
          <div className="grid grid-cols-1 gap-6 w-full max-w-md">
            <div className={`flex items-center space-x-4 p-6 rounded-2xl ${isDarkTheme ? 'bg-messhub-dark-surface/60' : 'bg-messhub-light-surface/60'} shadow-lg`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDarkTheme ? 'bg-messhub-dark-accent' : 'bg-messhub-light-accent'} shadow-md`}>
                <Users size={28} className={isDarkTheme ? 'text-messhub-dark-primary' : 'text-messhub-light-primary'} />
              </div>
              <div>
                <h3 className={`font-bold text-lg mb-1 ${isDarkTheme ? 'text-messhub-dark-text' : 'text-messhub-light-text'}`}>Community Access</h3>
                <p className={`text-sm ${isDarkTheme ? 'text-messhub-dark-text-secondary' : 'text-messhub-light-text-secondary'}`}>Connect with mess members and owners across the platform.</p>
              </div>
            </div>
            <div className={`flex items-center space-x-4 p-6 rounded-2xl ${isDarkTheme ? 'bg-messhub-dark-surface/60' : 'bg-messhub-light-surface/60'} shadow-lg`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDarkTheme ? 'bg-messhub-dark-accent' : 'bg-messhub-light-accent'} shadow-md`}>
                <Building2 size={28} className={isDarkTheme ? 'text-messhub-dark-primary' : 'text-messhub-light-primary'} />
              </div>
              <div>
                <h3 className={`font-bold text-lg mb-1 ${isDarkTheme ? 'text-messhub-dark-text' : 'text-messhub-light-text'}`}>Powerful Tools</h3>
                <p className={`text-sm ${isDarkTheme ? 'text-messhub-dark-text-secondary' : 'text-messhub-light-text-secondary'}`}>Manage, organize, and grow your mess with advanced features.</p>
              </div>
            </div>
          </div>
        </div>


        {/* Right: Additional Content for Desktop */}
        <div className="w-full max-w-md mx-auto lg:mx-0">
          {/* App Logo/Image */}
          <div className="text-center mb-4">
            <div className={`mx-auto mb-4 flex items-center justify-center ${
              isDarkTheme ? 'bg-messhub-dark-surface border-messhub-dark-accent' : 'bg-messhub-light-surface border-messhub-light-accent'
            }`}>
              <img
                src={isDarkTheme ? '/authImg/SignUpDark.png' : '/authImg/SignUpLight.png'}
                alt="MessHub Logo"
                className="object-cover"
              />
            </div>
            <h1 className={`text-2xl md:text-3xl font-bold mb-2 ${
              isDarkTheme ? 'text-messhub-dark-text' : 'text-messhub-light-text'
            }`}>Create Account</h1>
            <p className={`text-sm md:text-base ${
              isDarkTheme ? 'text-messhub-dark-text-secondary' : 'text-messhub-light-text-secondary'
            }`}>
              Join our community today
            </p>
          </div>




          {/* Role Display */}
          <div className={`mb-4 p-4 rounded-lg border ${
            isDarkTheme ? 'bg-messhub-dark-surface border-messhub-dark-border' : 'bg-messhub-light-surface border-messhub-light-border'
          }`}>
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${
                isDarkTheme ? 'bg-messhub-dark-primary/20' : 'bg-messhub-light-primary/20'
              }`}>
                {selectedRole === 'user' ? (
                  <Users size={20} className={isDarkTheme ? 'text-messhub-dark-primary' : 'text-messhub-light-primary'} />
                ) : (
                  <Building2 size={20} className={isDarkTheme ? 'text-messhub-dark-primary' : 'text-messhub-light-primary'} />
                )}
              </div>
              <div>
                <p className={`text-sm font-medium ${
                  isDarkTheme ? 'text-messhub-dark-text' : 'text-messhub-light-text'
                }`}>
                  {selectedRole === 'user' ? 'User Account' : 'Mess Owner Account'}
                </p>
                <p className={`text-xs ${
                  isDarkTheme ? 'text-messhub-dark-text-muted' : 'text-messhub-light-text-muted'
                }`}>
                  {selectedRole === 'user' 
                    ? 'You can join existing messes' 
                    : 'You can create and manage messes'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Registration Form */}
          <div className="space-y-2 ">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className={`block text-sm font-medium mb-2 ${
                  isDarkTheme ? 'text-messhub-dark-text' : 'text-messhub-light-text'
                }`}>
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  value={formData['firstName']}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors register-input ${
                    errors['firstName'] ? 'border-red-500' : isDarkTheme ? 'border-messhub-dark-border' : 'border-messhub-light-border'
                  } ${
                    isDarkTheme ? 'bg-messhub-dark-input-bg text-messhub-dark-text' : 'bg-messhub-light-input-bg text-messhub-light-text'
                  }`}
                  placeholder="First name"
                />
                {errors['firstName'] && (
                  <p className="text-red-500 text-sm mt-1">{errors['firstName']}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="lastName" className={`block text-sm font-medium mb-2 ${
                  isDarkTheme ? 'text-messhub-dark-text' : 'text-messhub-light-text'
                }`}>
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  value={formData['lastName']}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors register-input ${
                    errors['lastName'] ? 'border-red-500' : isDarkTheme ? 'border-messhub-dark-border' : 'border-messhub-light-border'
                  } ${
                    isDarkTheme ? 'bg-messhub-dark-input-bg text-messhub-dark-text' : 'bg-messhub-light-input-bg text-messhub-light-text'
                  }`}
                  placeholder="Last name"
                />
                {errors['lastName'] && (
                  <p className="text-red-500 text-sm mt-1">{errors['lastName']}</p>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className={`block text-sm font-medium mb-2 ${
                isDarkTheme ? 'text-messhub-dark-text' : 'text-messhub-light-text'
              }`}>
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={20} className={isDarkTheme ? 'text-messhub-dark-text-muted' : 'text-messhub-light-text-muted'} />
                </div>
                <input
                  type="email"
                  id="email"
                  value={formData['email']}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors register-input ${
                    errors['email'] ? 'border-red-500' : isDarkTheme ? 'border-messhub-dark-border' : 'border-messhub-light-border'
                  } ${
                    isDarkTheme ? 'bg-messhub-dark-input-bg text-messhub-dark-text' : 'bg-messhub-light-input-bg text-messhub-light-text'
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {errors['email'] && (
                <p className="text-red-500 text-sm mt-1">{errors['email']}</p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className={`block text-sm font-medium mb-2 ${
                isDarkTheme ? 'text-messhub-dark-text' : 'text-messhub-light-text'
              }`}>
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone size={20} className={isDarkTheme ? 'text-messhub-dark-text-muted' : 'text-messhub-light-text-muted'} />
                </div>
                <input
                  type="tel"
                  id="phone"
                  value={formData['phone']}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors register-input ${
                    errors['phone'] ? 'border-red-500' : isDarkTheme ? 'border-messhub-dark-border' : 'border-messhub-light-border'
                  } ${
                    isDarkTheme ? 'bg-messhub-dark-input-bg text-messhub-dark-text' : 'bg-messhub-light-input-bg text-messhub-light-text'
                  }`}
                  placeholder="Enter your phone number"
                />
              </div>
              {errors['phone'] && (
                <p className="text-red-500 text-sm mt-1">{errors['phone']}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className={`block text-sm font-medium mb-2 ${
                isDarkTheme ? 'text-messhub-dark-text' : 'text-messhub-light-text'
              }`}>
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={20} className={isDarkTheme ? 'text-messhub-dark-text-muted' : 'text-messhub-light-text-muted'} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={formData['password']}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors register-input ${
                    errors['password'] ? 'border-red-500' : isDarkTheme ? 'border-messhub-dark-border' : 'border-messhub-light-border'
                  } ${
                    isDarkTheme ? 'bg-messhub-dark-input-bg text-messhub-dark-text' : 'bg-messhub-light-input-bg text-messhub-light-text'
                  }`}
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff size={20} className={isDarkTheme ? 'text-messhub-dark-text-muted' : 'text-messhub-light-text-muted'} />
                  ) : (
                    <Eye size={20} className={isDarkTheme ? 'text-messhub-dark-text-muted' : 'text-messhub-light-text-muted'} />
                  )}
                </button>
              </div>
              {errors['password'] && (
                <p className="text-red-500 text-sm mt-1">{errors['password']}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className={`block text-sm font-medium mb-2 ${
                isDarkTheme ? 'text-messhub-dark-text' : 'text-messhub-light-text'
              }`}>
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={20} className={isDarkTheme ? 'text-messhub-dark-text-muted' : 'text-messhub-light-text-muted'} />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={formData['confirmPassword']}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors register-input ${
                    errors['confirmPassword'] ? 'border-red-500' : isDarkTheme ? 'border-messhub-dark-border' : 'border-messhub-light-border'
                  } ${
                    isDarkTheme ? 'bg-messhub-dark-input-bg text-messhub-dark-text' : 'bg-messhub-light-input-bg text-messhub-light-text'
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} className={isDarkTheme ? 'text-messhub-dark-text-muted' : 'text-messhub-light-text-muted'} />
                  ) : (
                    <Eye size={20} className={isDarkTheme ? 'text-messhub-dark-text-muted' : 'text-messhub-light-text-muted'} />
                  )}
                </button>
              </div>
              {errors['confirmPassword'] && (
                <p className="text-red-500 text-sm mt-1">{errors['confirmPassword']}</p>
              )}
            </div>


          </div>

            {/* Register Button */}
            <button
              onClick={handleRegister}
              className={`mt-4 w-full py-3 px-4 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                isDarkTheme 
                  ? 'bg-messhub-dark-primary text-messhub-dark-text hover:bg-messhub-dark-primary-dark' 
                  : 'bg-messhub-light-primary text-messhub-light-bg hover:bg-messhub-light-primary-dark'
              } shadow-md`}
            >
              Create Account
            </button>

          {/* Divider */}
          <div className="my-2 flex items-center">
            <div className={`flex-grow border-t ${
              isDarkTheme ? 'border-messhub-dark-border' : 'border-messhub-light-border'
            }`}></div>
            <span className={`mx-4 text-sm ${
              isDarkTheme ? 'text-messhub-dark-text-muted' : 'text-messhub-light-text-muted'
            }`}>
              or
            </span>
            <div className={`flex-grow border-t ${
              isDarkTheme ? 'border-messhub-dark-border' : 'border-messhub-light-border'
            }`}></div>
          </div>

          {/* Google Register Button */}
          <button
            onClick={handleGoogleRegister}
            className={`w-full py-3 px-4 border rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50 flex items-center justify-center space-x-2 ${
              isDarkTheme 
                ? 'border-messhub-dark-border text-messhub-dark-text bg-messhub-dark-surface hover:bg-messhub-dark-hover' 
                : 'border-messhub-light-border text-messhub-light-text bg-messhub-light-surface hover:bg-messhub-light-hover'
            } shadow-sm`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Sign In Link */}
          <p className={`text-center text-sm mt-6 ${
            isDarkTheme ? 'text-messhub-dark-text-muted' : 'text-messhub-light-text-muted'
          }`}>
            Already have an account?{' '}
            <button
              type="button"
              onClick={handleSignIn}
              className={`font-medium hover:underline transition-colors ${
                isDarkTheme ? 'text-messhub-dark-primary hover:text-messhub-dark-primary-dark' : 'text-messhub-light-primary hover:text-messhub-light-primary-dark'
              }`}
            >
              Sign In
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};

export default RegisterScreen;
