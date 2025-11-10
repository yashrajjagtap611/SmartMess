import React from "react";
import { ArrowLeft, Sun, Moon, Shield, RotateCcw } from "lucide-react";
import { useOtpVerificationScreen } from "./OtpVerificationScreen.hooks";
import { formatCountdown } from "./OtpVerificationScreen.utils";

const OtpVerificationScreen: React.FC = () => {
  const {
    isDarkMode,
    otp,
    isVerified,
    error,
    timeLeft,
    isPasswordReset,
    inputRefs,
    toggleTheme,
    handleOtpChange,
    handleKeyDown,
    handlePaste,
    handleVerify,
    handleResend,
    handleBack,
    handleContinueToApp,
  } = useOtpVerificationScreen({});

  return (
    <div
      className={`min-h-screen transition-all duration-300 ${
        isDarkMode
          ? "bg-messhub-dark-bg text-messhub-dark-text"
          : "bg-messhub-light-bg text-messhub-light-text"
      } p-6`}
    >
      {/* Dynamic CSS for placeholder colors */}
      <style>
        {`
          .otp-input::placeholder {
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
                src={isDarkMode ? '/authImg/OtpDark.png' : '/authImg/OtpLight.png'}
                alt="MessHub Logo"
                className="object-cover"
              />
            </div>
            <h1
              className={`text-2xl md:text-3xl font-bold mb-2 ${
                isDarkMode
                  ? "text-messhub-dark-text"
                  : "text-messhub-light-text"
              }`}
            >
              {isVerified
                ? "Verification Complete!"
                : isPasswordReset
                ? "Reset Password"
                : "Verify Your Code"}
            </h1>
            <p
              className={`text-sm md:text-base ${
                isDarkMode
                  ? "text-messhub-dark-text-secondary"
                  : "text-messhub-light-text-secondary"
              }`}
            >
              {isVerified
                ? isPasswordReset
                  ? "Your email has been verified. You can now reset your password."
                  : "Your account has been successfully verified"
                : isPasswordReset
                ? "Enter the 6-digit code sent to your email to reset your password"
                : "Enter the 6-digit code sent to your email to verify your account"}
            </p>
          </div>

          {!isVerified ? (
            <div className="space-y-6">
              {/* OTP Input Fields */}
              <div>
                <label
                  className={`block text-sm font-medium mb-4 text-center ${
                    isDarkMode
                      ? "text-messhub-dark-text"
                      : "text-messhub-light-text"
                  }`}
                >
                  Verification Code
                </label>
                <div className="flex justify-center space-x-2 mb-4">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      className={`w-12 h-12 text-center text-lg font-semibold border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors ${
                        error
                          ? "border-red-500"
                          : isDarkMode
                          ? "border-messhub-dark-border"
                          : "border-messhub-light-border"
                      } ${
                        isDarkMode
                          ? "bg-messhub-dark-input-bg text-messhub-dark-text"
                          : "bg-messhub-light-input-bg text-messhub-light-text"
                      }`}
                    />
                  ))}
                </div>
                {error && (
                  <p className="text-red-500 text-sm text-center">{error}</p>
                )}
              </div>

              {/* Verify Button */}
              <button
                onClick={handleVerify}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                  isDarkMode
                    ? "bg-messhub-dark-primary text-messhub-dark-text hover:bg-messhub-dark-primary-dark"
                    : "bg-messhub-light-primary text-messhub-light-bg hover:bg-messhub-light-primary-dark"
                } shadow-md`}
              >
                {isPasswordReset ? "Verify & Reset Password" : "Verify Code"}
              </button>

              {/* Resend Section */}
              <div className="text-center">
                <p
                  className={`text-sm ${
                    isDarkMode
                      ? "text-messhub-dark-text-muted"
                      : "text-messhub-light-text-muted"
                  }`}
                >
                  Didn't receive the code?
                </p>
                <button
                  onClick={handleResend}
                  disabled={timeLeft > 0}
                  className={`text-sm font-medium transition-colors ${
                    timeLeft > 0 ? "opacity-50 cursor-not-allowed" : ""
                  } ${
                    isDarkMode
                      ? "text-messhub-dark-primary hover:text-messhub-dark-primary-dark"
                      : "text-messhub-light-primary hover:text-messhub-light-primary-dark"
                  }`}
                >
                   {timeLeft > 0 ? (
                    <span className="flex items-center justify-center space-x-1">
                      <RotateCcw size={14} />
                       <span>Resend in {formatCountdown(timeLeft)}</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center space-x-1">
                      <RotateCcw size={14} />
                      <span>Resend Code</span>
                    </span>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Success Message */}
              <div
                className={`text-center p-6 rounded-lg ${
                  isDarkMode
                    ? "bg-messhub-dark-surface border-messhub-dark-accent"
                    : "bg-messhub-light-surface border-messhub-light-accent"
                } border`}
              >
                <div
                  className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                    isDarkMode
                      ? "bg-messhub-dark-accent"
                      : "bg-messhub-light-accent"
                  }`}
                >
                  <Shield
                    size={24}
                    className={
                      isDarkMode
                        ? "text-messhub-dark-primary"
                        : "text-messhub-light-primary"
                    }
                  />
                </div>
                <h3
                  className={`text-lg font-semibold mb-2 ${
                    isDarkMode
                      ? "text-messhub-dark-text"
                      : "text-messhub-light-text"
                  }`}
                >
                  {isPasswordReset
                    ? "Email Verified!"
                    : "Verification Successful!"}
                </h3>
                <p
                  className={`text-sm ${
                    isDarkMode
                      ? "text-messhub-dark-text-secondary"
                      : "text-messhub-light-text-secondary"
                  }`}
                >
                  {isPasswordReset
                    ? "You can now proceed to reset your password."
                    : "Your account has been verified and you can now access all features."}
                </p>
              </div>

              {/* Continue Button */}
              <button
                onClick={handleContinueToApp}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                  isDarkMode
                    ? "bg-messhub-dark-primary text-messhub-dark-text hover:bg-messhub-dark-primary-dark"
                    : "bg-messhub-light-primary text-messhub-light-bg hover:bg-messhub-light-primary-dark"
                } shadow-md`}
              >
                {isPasswordReset ? "Reset Password" : "Continue to App"}
              </button>
            </div>
          )}
        </div>
        {/* Right: Additional Content for Desktop */}
        <div className="hidden lg:flex flex-col items-center justify-center space-y-8">
          <div className="text-center lg:text-left">
            <h2 className={`text-3xl lg:text-4xl font-bold mb-4 ${isDarkMode ? 'text-messhub-dark-primary' : 'text-messhub-light-primary'}`}>Secure Verification</h2>
            <p className={`text-lg mb-8 ${isDarkMode ? 'text-messhub-dark-text-secondary' : 'text-messhub-light-text-secondary'}`}>We use advanced security to keep your account safe. Enter your code to continue.</p>
            <img src={isDarkMode ? '/authImg/VerificationDark.png' : '/authImg/VerificationLight.png'} alt="Verification" className="mx-auto w-48 h-48 object-contain mb-8" />
          </div>
          <div className="grid grid-cols-1 gap-6 w-full max-w-md">
            <div className={`flex items-center space-x-4 p-6 rounded-2xl ${isDarkMode ? 'bg-messhub-dark-surface/60' : 'bg-messhub-light-surface/60'} shadow-lg`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-messhub-dark-accent' : 'bg-messhub-light-accent'} shadow-md`}>
                <Shield size={28} className={isDarkMode ? 'text-messhub-dark-primary' : 'text-messhub-light-primary'} />
              </div>
              <div>
                <h3 className={`font-bold text-lg mb-1 ${isDarkMode ? 'text-messhub-dark-text' : 'text-messhub-light-text'}`}>Advanced Security</h3>
                <p className={`text-sm ${isDarkMode ? 'text-messhub-dark-text-secondary' : 'text-messhub-light-text-secondary'}`}>Your verification code is encrypted and protected.</p>
              </div>
            </div>
            <div className={`flex items-center space-x-4 p-6 rounded-2xl ${isDarkMode ? 'bg-messhub-dark-surface/60' : 'bg-messhub-light-surface/60'} shadow-lg`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-messhub-dark-accent' : 'bg-messhub-light-accent'} shadow-md`}>
                <RotateCcw size={28} className={isDarkMode ? 'text-messhub-dark-primary' : 'text-messhub-light-primary'} />
              </div>
              <div>
                <h3 className={`font-bold text-lg mb-1 ${isDarkMode ? 'text-messhub-dark-text' : 'text-messhub-light-text'}`}>Quick Process</h3>
                <p className={`text-sm ${isDarkMode ? 'text-messhub-dark-text-secondary' : 'text-messhub-light-text-secondary'}`}>Verification is fast and easy, so you can get started right away.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtpVerificationScreen;
