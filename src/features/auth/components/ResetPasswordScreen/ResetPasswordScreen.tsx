import React from 'react';
import { ArrowLeft, Sun, Moon, Eye, EyeOff, Lock, CheckCircle } from 'lucide-react';
import { useResetPasswordScreen } from './ResetPasswordScreen.hooks';
import type { ResetPasswordScreenProps } from './ResetPasswordScreen.types';

const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({ onResetPassword, onLogin }) => {
  const {
    isDarkMode,
    showPassword,
    showConfirmPassword,
    email,
    formData,
    errors,
    isReset,
    toggleTheme,
    togglePasswordVisibility,
    toggleConfirmPasswordVisibility,
    handleInputChange,
    handleResetPassword,
    handleBack,
    handleLogin,
  } = useResetPasswordScreen({ 
    onResetPassword: onResetPassword || (() => {}), 
    onLogin: onLogin || (() => {}) 
  });

  return (
    <div className={`min-h-screen transition-all duration-300 ${
      isDarkMode ? 'bg-messhub-dark-bg text-messhub-dark-text' : 'bg-messhub-light-bg text-messhub-light-text'
    } p-6`}>
      {/* Dynamic CSS for placeholder colors */}
      <style>
        {`
          .reset-input::placeholder {
            color: ${isDarkMode ? '#8BB0B3' : '#306C73'} !important;
          }
        `}
      </style>
      {/* Header */}
      <div className="flex items-center justify-between p-2">
        <button
          onClick={handleBack}
          className={`p-3 rounded-2xl transition-all duration-300 ${
            isDarkMode
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
            isDarkMode
              ? "bg-messhub-dark-surface/50 text-messhub-dark-text hover:bg-messhub-dark-hover border border-messhub-dark-border"
              : "bg-messhub-light-surface/50 text-messhub-light-text hover:bg-messhub-light-hover border border-messhub-light-border"
          } shadow-soft hover:shadow-medium backdrop-blur-sm`}
          aria-label="Toggle theme"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
      {/* Main Content */}
      <div className="flex flex-col items-center justify-center px-6 pb-8 lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
        {/* Left: Existing Form (mobile as-is) */}
        <div className="w-full max-w-md mx-auto lg:mx-0">
          {/* App Logo/Image */}
          <div className="text-center mb-8">
            <div className={`mx-auto mb-4 flex items-center justify-center ${
              isDarkMode ? 'bg-messhub-dark-surface border-messhub-dark-accent' : 'bg-messhub-light-surface border-messhub-light-accent'
            }`}>
              <img
                src={isDarkMode ? '/authImg/ResetPasswordDark.png' : '/authImg/ResetPasswordLight.png'}
                alt="MessHub Logo"
                className="object-cover"
              />
            </div>
            <h1 className={`text-2xl md:text-3xl font-bold mb-2 ${
              isDarkMode ? 'text-messhub-dark-text' : 'text-messhub-light-text'
            }`}>
              {isReset ? 'Password Reset Complete!' : 'Reset Your Password'}
            </h1>
            <p className={`text-sm md:text-base ${
              isDarkMode ? 'text-messhub-dark-text-secondary' : 'text-messhub-light-text-secondary'
            }`}>
              {isReset 
                ? 'Your password has been successfully updated'
                : `Create a new password for ${email}`
              }
            </p>
          </div>
          {!isReset ? (
            <div className="space-y-6">
              {/* Password Field */}
              <div>
                <label htmlFor="password" className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-messhub-dark-text' : 'text-messhub-light-text'
                }`}>
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={20} className={isDarkMode ? 'text-messhub-dark-text-muted' : 'text-messhub-light-text-muted'} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={formData['password']}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors reset-input ${
                      errors['password'] ? 'border-red-500' : isDarkMode ? 'border-messhub-dark-border' : 'border-messhub-light-border'
                    } ${
                      isDarkMode ? 'bg-messhub-dark-input-bg text-messhub-dark-text' : 'bg-messhub-light-input-bg text-messhub-light-text'
                    }`}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff size={20} className={isDarkMode ? 'text-messhub-dark-text-muted' : 'text-messhub-light-text-muted'} />
                    ) : (
                      <Eye size={20} className={isDarkMode ? 'text-messhub-dark-text-muted' : 'text-messhub-light-text-muted'} />
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
                  isDarkMode ? 'text-messhub-dark-text' : 'text-messhub-light-text'
                }`}>
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={20} className={isDarkMode ? 'text-messhub-dark-text-muted' : 'text-messhub-light-text-muted'} />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={formData['confirmPassword']}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors reset-input ${
                      errors['confirmPassword'] ? 'border-red-500' : isDarkMode ? 'border-messhub-dark-border' : 'border-messhub-light-border'
                    } ${
                      isDarkMode ? 'bg-messhub-dark-input-bg text-messhub-dark-text' : 'bg-messhub-light-input-bg text-messhub-light-text'
                    }`}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} className={isDarkMode ? 'text-messhub-dark-text-muted' : 'text-messhub-light-text-muted'} />
                    ) : (
                      <Eye size={20} className={isDarkMode ? 'text-messhub-dark-text-muted' : 'text-messhub-light-text-muted'} />
                    )}
                  </button>
                </div>
                {errors['confirmPassword'] && (
                  <p className="text-red-500 text-sm mt-1">{errors['confirmPassword']}</p>
                )}
              </div>

              {/* Reset Password Button */}
              <button
                onClick={handleResetPassword}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                  isDarkMode 
                    ? 'bg-messhub-dark-primary text-messhub-dark-text hover:bg-messhub-dark-primary-dark' 
                    : 'bg-messhub-light-primary text-messhub-light-bg hover:bg-messhub-light-primary-dark'
                } shadow-md`}
              >
                Reset Password
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Success Message */}
              <div className={`text-center p-6 rounded-lg ${
                isDarkMode ? 'bg-messhub-dark-surface border-messhub-dark-accent' : 'bg-messhub-light-surface border-messhub-light-accent'
              } border`}>
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-messhub-dark-accent' : 'bg-messhub-light-accent'
                }`}>
                  <CheckCircle size={24} className={isDarkMode ? 'text-messhub-dark-primary' : 'text-messhub-light-primary'} />
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${
                  isDarkMode ? 'text-messhub-dark-text' : 'text-messhub-light-text'
                }`}>
                  Password Updated Successfully!
                </h3>
                <p className={`text-sm ${
                  isDarkMode ? 'text-messhub-dark-text-secondary' : 'text-messhub-light-text-secondary'
                }`}>
                  Your password has been reset. You can now log in with your new password.
                </p>
              </div>

              {/* Login Button */}
              <button
                onClick={handleLogin}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                  isDarkMode 
                    ? 'bg-messhub-dark-primary text-messhub-dark-text hover:bg-messhub-dark-primary-dark' 
                    : 'bg-messhub-light-primary text-messhub-light-bg hover:bg-messhub-light-primary-dark'
                } shadow-md`}
              >
                Continue to Login
              </button>
            </div>
          )}
        </div>
        {/* Right: Additional Content for Desktop */}
        <div className="hidden lg:flex flex-col items-center justify-center space-y-8">
          <div className="text-center lg:text-left">
            <h2 className={`text-3xl lg:text-4xl font-bold mb-4 ${isDarkMode ? 'text-messhub-dark-primary' : 'text-messhub-light-primary'}`}>Strong Security</h2>
            <p className={`text-lg mb-8 ${isDarkMode ? 'text-messhub-dark-text-secondary' : 'text-messhub-light-text-secondary'}`}>Create a strong password to keep your account safe. We recommend using a mix of letters, numbers, and symbols.</p>
            <img src={isDarkMode ? '/authImg/PasswordSecurityDark.png' : '/authImg/PasswordSecurityLight.png'} alt="Password Security" className="mx-auto w-48 h-48 object-contain mb-8" />
          </div>
          <div className="grid grid-cols-1 gap-6 w-full max-w-md">
            <div className={`flex items-center space-x-4 p-6 rounded-2xl ${isDarkMode ? 'bg-messhub-dark-surface/60' : 'bg-messhub-light-surface/60'} shadow-lg`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-messhub-dark-accent' : 'bg-messhub-light-accent'} shadow-md`}>
                <Lock size={28} className={isDarkMode ? 'text-messhub-dark-primary' : 'text-messhub-light-primary'} />
              </div>
              <div>
                <h3 className={`font-bold text-lg mb-1 ${isDarkMode ? 'text-messhub-dark-text' : 'text-messhub-light-text'}`}>Password Tips</h3>
                <p className={`text-sm ${isDarkMode ? 'text-messhub-dark-text-secondary' : 'text-messhub-light-text-secondary'}`}>Use at least 8 characters, including uppercase, lowercase, and numbers.</p>
              </div>
            </div>
            <div className={`flex items-center space-x-4 p-6 rounded-2xl ${isDarkMode ? 'bg-messhub-dark-surface/60' : 'bg-messhub-light-surface/60'} shadow-lg`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-messhub-dark-accent' : 'bg-messhub-light-accent'} shadow-md`}>
                <CheckCircle size={28} className={isDarkMode ? 'text-messhub-dark-primary' : 'text-messhub-light-primary'} />
              </div>
              <div>
                <h3 className={`font-bold text-lg mb-1 ${isDarkMode ? 'text-messhub-dark-text' : 'text-messhub-light-text'}`}>Easy Reset</h3>
                <p className={`text-sm ${isDarkMode ? 'text-messhub-dark-text-secondary' : 'text-messhub-light-text-secondary'}`}>Resetting your password is quick and easy. Just follow the steps.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordScreen; 