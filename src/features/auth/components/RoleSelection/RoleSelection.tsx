import React from "react";
import {
  ArrowLeft,
  Sun,
  Moon,
  Users,
  Building2,
  ArrowRight,
} from "lucide-react";
import { useRoleSelection } from './RoleSelection.hooks';
import { getRoleInfo } from './RoleSelection.utils';
import type { RoleSelectionProps } from './RoleSelection.types';

const RoleSelection: React.FC<RoleSelectionProps> = ({ onRoleSelect, onBack, onContinue }) => {
  const {
    isDarkMode,
    selectedRole,
    roles,
    isRoleSelected,
    benefitsText,
    toggleTheme,
    handleRoleSelect,
    handleContinue,
    handleBack,
  } = useRoleSelection({
    ...(onRoleSelect && { onRoleSelect }),
    ...(onBack && { onBack }),
    ...(onContinue && { onContinue })
  });

  return (
    <div
      className={`min-h-screen transition-all duration-300 ${
        isDarkMode
          ? "bg-messhub-dark-bg text-messhub-dark-text"
          : "bg-messhub-light-bg text-messhub-light-text"
      } p-6`}
    >
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
      <div className="flex flex-col items-center justify-center px-6 pb-8 min-h-[calc(100vh-120px)] lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
        {/* Left: Existing Form (mobile as-is) */}
        <div className="hidden lg:flex flex-col items-center justify-center space-y-8">
          <div className="text-center lg:text-left">
            <h2
              className={`text-3xl lg:text-4xl font-bold mb-4 ${
                isDarkMode
                  ? "text-messhub-dark-primary"
                  : "text-messhub-light-primary"
              }`}
            >
              Choose Your Role
            </h2>
            <p
              className={`text-lg mb-8 ${
                isDarkMode
                  ? "text-messhub-dark-text-secondary"
                  : "text-messhub-light-text-secondary"
              }`}
            >
              Select the role that best fits your needs. MessHub offers tailored
              experiences for users and mess owners.
            </p>

          </div>
          <div className="grid grid-cols-1 gap-6 w-full max-w-md">
            <div
              className={`flex items-center space-x-4 p-6 rounded-2xl ${
                isDarkMode
                  ? "bg-messhub-dark-surface/60"
                  : "bg-messhub-light-surface/60"
              } shadow-lg`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isDarkMode
                    ? "bg-messhub-dark-accent"
                    : "bg-messhub-light-accent"
                } shadow-md`}
              >
                <Users
                  size={28}
                  className={
                    isDarkMode
                      ? "text-messhub-dark-primary"
                      : "text-messhub-light-primary"
                  }
                />
              </div>
              <div>
                <h3
                  className={`font-bold text-lg mb-1 ${
                    isDarkMode
                      ? "text-messhub-dark-text"
                      : "text-messhub-light-text"
                  }`}
                >
                  User Experience
                </h3>
                <p
                  className={`text-sm ${
                    isDarkMode
                      ? "text-messhub-dark-text-secondary"
                      : "text-messhub-light-text-secondary"
                  }`}
                >
                  Join messes, connect with members, and stay updated.
                </p>
              </div>
            </div>
            <div
              className={`flex items-center space-x-4 p-6 rounded-2xl ${
                isDarkMode
                  ? "bg-messhub-dark-surface/60"
                  : "bg-messhub-light-surface/60"
              } shadow-lg`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isDarkMode
                    ? "bg-messhub-dark-accent"
                    : "bg-messhub-light-accent"
                } shadow-md`}
              >
                <Building2
                  size={28}
                  className={
                    isDarkMode
                      ? "text-messhub-dark-primary"
                      : "text-messhub-light-primary"
                  }
                />
              </div>
              <div>
                <h3
                  className={`font-bold text-lg mb-1 ${
                    isDarkMode
                      ? "text-messhub-dark-text"
                      : "text-messhub-light-text"
                  }`}
                >
                  Mess Owner Tools
                </h3>
                <p
                  className={`text-sm ${
                    isDarkMode
                      ? "text-messhub-dark-text-secondary"
                      : "text-messhub-light-text-secondary"
                  }`}
                >
                  Create, manage, and grow your mess with powerful tools.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Additional Content for Desktop */}

        <div className="w-full max-w-md mx-auto lg:mx-0">
          {/* App Logo/Image */}
          <div className="text-center mb-4">
            <div
              className={`mx-auto mb-4 flex items-center justify-center ${
                isDarkMode
                  ? "bg-messhub-dark-surface border-messhub-dark-accent"
                  : "bg-messhub-light-surface border-messhub-light-accent"
              }`}
            >
              <img
                src={
                  isDarkMode
                    ? "/authImg/RoleDark.png"
                    : "/authImg/RoleLight.png"
                }
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
              Choose Your Role
            </h1>
            <p
              className={`text-sm md:text-base ${
                isDarkMode
                  ? "text-messhub-dark-text-secondary"
                  : "text-messhub-light-text-secondary"
              }`}
            >
              Select how you'll use MessHub
            </p>
          </div>

          {/* Role Selection Cards */}
          <div className="space-y-4 mb-6">
            {roles.map((role) => {
              const IconComponent = role.icon === 'Users' ? Users : Building2;
              return (
                <button
                  key={role.id}
                  onClick={() => handleRoleSelect(role.id)}
                  className={`w-full p-4 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                    selectedRole === role.id
                      ? isDarkMode
                        ? "border-messhub-dark-primary bg-messhub-dark-primary/10"
                        : "border-messhub-light-primary bg-messhub-light-primary/10"
                      : isDarkMode
                      ? "border-messhub-dark-border bg-messhub-dark-surface hover:border-messhub-dark-primary/50"
                      : "border-messhub-light-border bg-messhub-light-surface hover:border-messhub-light-primary/50"
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`p-3 rounded-lg ${
                        isDarkMode
                          ? "bg-messhub-dark-primary/20"
                          : "bg-messhub-light-primary/20"
                      }`}
                    >
                      <IconComponent
                        size={24}
                        className={
                          isDarkMode
                            ? "text-messhub-dark-primary"
                            : "text-messhub-light-primary"
                        }
                      />
                    </div>
                    <div className="flex-1 text-left">
                      <h3
                        className={`font-semibold text-lg mb-1 ${
                          isDarkMode
                            ? "text-messhub-dark-text"
                            : "text-messhub-light-text"
                        }`}
                      >
                        {role.title}
                      </h3>
                      <p
                        className={`text-sm ${
                          isDarkMode
                            ? "text-messhub-dark-text-muted"
                            : "text-messhub-light-text-muted"
                        }`}
                      >
                        {role.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            disabled={!isRoleSelected}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 flex items-center justify-center space-x-2 ${
              isRoleSelected
                ? isDarkMode
                  ? "bg-messhub-dark-primary text-messhub-dark-text hover:bg-messhub-dark-primary-dark shadow-md"
                  : "bg-messhub-light-primary text-messhub-light-bg hover:bg-messhub-light-primary-dark shadow-md"
                : isDarkMode
                ? "bg-messhub-dark-border text-messhub-dark-text-muted cursor-not-allowed"
                : "bg-messhub-light-border text-messhub-light-text-muted cursor-not-allowed"
            }`}
          >
            <span>Continue</span>
            <ArrowRight size={20} />
          </button>

          {/* Role Description */}
          <div
            className={`mt-6 p-4 rounded-lg ${
              isDarkMode
                ? "bg-messhub-dark-surface/50"
                : "bg-messhub-light-surface/50"
            }`}
          >
            <h4
              className={`font-medium mb-2 ${
                isDarkMode
                  ? "text-messhub-dark-text"
                  : "text-messhub-light-text"
              }`}
            >
              {benefitsText}
            </h4>
            <ul
              className={`text-sm space-y-1 ${
                isDarkMode
                  ? "text-messhub-dark-text-muted"
                  : "text-messhub-light-text-muted"
              }`}
            >
              {selectedRole ? (
                getRoleInfo(selectedRole).benefits.map((benefit, index) => (
                  <li key={index}>• {benefit}</li>
                ))
              ) : (
                <li>Choose a role above to see what you can do</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
