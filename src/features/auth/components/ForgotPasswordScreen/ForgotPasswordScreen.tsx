import { ArrowLeft, Sun, Moon, Mail, Send, Shield, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { useForgotPasswordScreen } from "./ForgotPasswordScreen.hooks";
import { useTheme } from "@/components/theme/theme-provider";
import type { ForgotPasswordScreenProps } from "./ForgotPasswordScreen.types";

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ onSubmit, onBack }) => {
  const navigate = useNavigate();
  const { isDarkTheme, toggleTheme } = useTheme();
  const { 
    email, 
    setEmail, 
    error, 
    isLoading, 
    handleSubmit 
  } = useForgotPasswordScreen({ onSubmit: onSubmit || (() => {}) });


  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(ROUTES.PUBLIC.LOGIN);
    }
  };

  const handleBackToLogin = () => {
    navigate(ROUTES.PUBLIC.LOGIN);
  };

  return (
    <div
      className={`min-h-screen transition-all duration-300 ${
        isDarkTheme
          ? "bg-messhub-dark-bg text-messhub-dark-text"
          : "bg-messhub-light-bg text-messhub-light-text"
      } p-6`}
    >
      {/* Dynamic CSS for placeholder colors */}
      <style>
        {`
          .forgot-input::placeholder {
            color: ${isDarkTheme ? "#8BB0B3" : "#306C73"} !important;
          }
        `}
      </style>

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
            <h2 className={`text-3xl lg:text-4xl font-bold mb-4 ${isDarkTheme ? 'text-messhub-dark-primary' : 'text-messhub-light-primary'}`}>Secure Recovery</h2>
            <p className={`text-lg mb-8 ${isDarkTheme ? 'text-messhub-dark-text-secondary' : 'text-messhub-light-text-secondary'}`}>Reset your password safely and quickly. We use bank-level security to protect your account.</p>
            <img src={isDarkTheme ? '/authImg/SecurityDark.png' : '/authImg/SecurityLight.png'} alt="Security" className="mx-auto w-48 h-48 object-contain mb-8" />
          </div>
          <div className="grid grid-cols-1 gap-6 w-full max-w-md">
            <div className={`flex items-center space-x-4 p-6 rounded-2xl ${isDarkTheme ? 'bg-messhub-dark-surface/60' : 'bg-messhub-light-surface/60'} shadow-lg`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDarkTheme ? 'bg-messhub-dark-accent' : 'bg-messhub-light-accent'} shadow-md`}>
                <Shield size={28} className={isDarkTheme ? 'text-messhub-dark-primary' : 'text-messhub-light-primary'} />
              </div>
              <div>
                <h3 className={`font-bold text-lg mb-1 ${isDarkTheme ? 'text-messhub-dark-text' : 'text-messhub-light-text'}`}>Bank-Level Security</h3>
                <p className={`text-sm ${isDarkTheme ? 'text-messhub-dark-text-secondary' : 'text-messhub-light-text-secondary'}`}>Your data is encrypted and protected at every step.</p>
              </div>
            </div>
            <div className={`flex items-center space-x-4 p-6 rounded-2xl ${isDarkTheme ? 'bg-messhub-dark-surface/60' : 'bg-messhub-light-surface/60'} shadow-lg`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDarkTheme ? 'bg-messhub-dark-accent' : 'bg-messhub-light-accent'} shadow-md`}>
                <RotateCcw size={28} className={isDarkTheme ? 'text-messhub-dark-primary' : 'text-messhub-light-primary'} />
              </div>
              <div>
                <h3 className={`font-bold text-lg mb-1 ${isDarkTheme ? 'text-messhub-dark-text' : 'text-messhub-light-text'}`}>Fast Support</h3>
                <p className={`text-sm ${isDarkTheme ? 'text-messhub-dark-text-secondary' : 'text-messhub-light-text-secondary'}`}>Get help quickly if you have any trouble resetting your password.</p>
              </div>
            </div>
          </div>
        </div>


        {/* Right: Additional Content for Desktop */}
        <div className="w-full max-w-md mx-auto lg:mx-0">
          {/* App Logo/Image */}
          <div className="text-center mb-8">
            <div className={`mx-auto mb-4 flex items-center justify-center ${
              isDarkTheme ? 'bg-messhub-dark-surface border-messhub-dark-accent' : 'bg-messhub-light-surface border-messhub-light-accent'
            }`}>
              <img
                src={isDarkTheme ? '/authImg/ForgotPasswordDark.png' : '/authImg/ForgotPasswordLight.png'}
                alt="MessHub Logo"
                className="object-cover"
              />
            </div>
            <h1
              className={`text-2xl md:text-3xl font-bold mb-2 ${
                isDarkTheme
                  ? "text-messhub-dark-text"
                  : "text-messhub-light-text"
              }`}
            >
              Forgot Password?
            </h1>
            <p
              className={`text-sm md:text-base ${
                isDarkTheme
                  ? "text-messhub-dark-text-secondary"
                  : "text-messhub-light-text-secondary"
              }`}
            >
              Enter your email to receive a verification code
            </p>
          </div>
          <div className="space-y-6">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className={`block text-sm font-medium mb-2 ${
                  isDarkTheme
                    ? "text-messhub-dark-text"
                    : "text-messhub-light-text"
                }`}
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail
                    size={20}
                    className={
                      isDarkTheme
                        ? "text-messhub-dark-text-muted"
                        : "text-messhub-light-text-muted"
                    }
                  />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors forgot-input ${
                    error
                      ? "border-red-500"
                      : isDarkTheme
                      ? "border-messhub-dark-border"
                      : "border-messhub-light-border"
                  } ${
                    isDarkTheme
                      ? "bg-messhub-dark-input-bg text-messhub-dark-text"
                      : "bg-messhub-light-input-bg text-messhub-light-text"
                  }`}
                  placeholder="Enter your email address"
                />
              </div>
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>
            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50 flex items-center justify-center space-x-2 ${
                isDarkTheme
                  ? "bg-messhub-dark-primary text-messhub-dark-text hover:bg-messhub-dark-primary-dark"
                  : "bg-messhub-light-primary text-messhub-light-bg hover:bg-messhub-light-primary-dark"
              } shadow-md ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Send size={20} />
              <span>{isLoading ? 'Sending...' : 'Send Verification Code'}</span>
            </button>
          </div>
          {/* Back to Login Link */}
          <p
            className={`text-center text-sm mt-6 ${
              isDarkTheme
                ? "text-messhub-dark-text-muted"
                : "text-messhub-light-text-muted"
            }`}
          >
            Remember your password?{" "}
            <button
              type="button"
              onClick={handleBackToLogin}
              className={`font-medium hover:underline transition-colors ${
                isDarkTheme
                  ? "text-messhub-dark-primary hover:text-messhub-dark-primary-dark"
                  : "text-messhub-light-primary hover:text-messhub-light-primary-dark"
              }`}
            >
              Back to Login
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};

export default ForgotPasswordScreen;
