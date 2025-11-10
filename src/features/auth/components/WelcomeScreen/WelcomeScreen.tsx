import React from "react";
import {
  Sun,
  Moon,
  ArrowRight,
  Download,
  Zap,
  Users,
  CreditCard,
  MessageCircle,
  Shield,
  Star
} from "lucide-react";
import { useWelcomeScreen } from './WelcomeScreen.hooks';
import { useTheme } from '@/components/theme/theme-provider';
import type { WelcomeScreenProps } from './WelcomeScreen.types';

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onLogin, onSignUp, onInstallPWA, onDownloadApp }) => {
  const { isDarkTheme, toggleTheme } = useTheme();
  const {
    isInstallable,
    handleLogin,
    handleSignUp,
    handleInstallPWA,
  } = useWelcomeScreen({
    ...(onLogin && { onLogin }),
    ...(onSignUp && { onSignUp }),
    ...(onInstallPWA && { onInstallPWA }),
    ...(onDownloadApp && { onDownloadApp })
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-secondary/10 rounded-full blur-3xl" />

      {/* Header */}
      <div className="relative z-10 p-6">
        {/* Desktop Header */}
        <div className="hidden lg:flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg">
              <Zap size={20} className="text-primary-foreground" />
            </div>
            <span className="font-bold text-xl text-foreground">
              SmartMess
            </span>
          </div>

          <button
            onClick={toggleTheme}
            className="p-3 rounded-xl bg-card/80 backdrop-blur-sm border border-border hover:bg-accent transition-all duration-200 shadow-sm"
            aria-label="Toggle theme"
          >
            {isDarkTheme ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        {/* Mobile Header with Action Buttons */}
        <div className="lg:hidden space-y-4">
          {/* Top row - Logo and Theme Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg">
                <Zap size={16} className="text-primary-foreground" />
              </div>
              <span className="font-bold text-lg text-foreground">
                SmartMess
              </span>
            </div>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-card/80 backdrop-blur-sm border border-border hover:bg-accent transition-all duration-200 shadow-sm"
              aria-label="Toggle theme"
            >
              {isDarkTheme ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>

          {/* Action Buttons Row */}
          <div className="flex gap-3">
            <button
              onClick={handleLogin}
              className="flex-1 py-3 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
            >
              <span>Get Started Now</span>
              <ArrowRight size={16} />
            </button>

            <button
              onClick={handleSignUp}
              className="flex-1 py-3 px-4 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold text-sm rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 pb-8 min-h-[calc(100vh-180px)] lg:min-h-[calc(100vh-120px)]">
        <div className="w-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Hero Content */}
          <div className="text-center lg:text-left space-y-8">
            {/* Hero Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Star className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">India's #1 Mess Management Platform</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Welcome to{" "}
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  SmartMess
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground font-medium">
                Your complete mess management solution
              </p>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl">
                Join thousands of mess owners and members who trust SmartMess for seamless meal management, 
                billing automation, and community building.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 py-6">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground">Active Messes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary">10K+</div>
                <div className="text-sm text-muted-foreground">Happy Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary">99.9%</div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
            </div>
          </div>

          {/* Right Column - Features & Actions */}
          <div className="space-y-8">
            {/* Feature Highlights */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground mb-6">Why Choose SmartMess?</h2>
              
              {/* Enhanced Features */}
              <div className="space-y-4">
                <div className="flex items-start space-x-4 p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border hover:bg-card/80 transition-all duration-200">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">Smart Member Management</h3>
                    <p className="text-sm text-muted-foreground">Effortlessly manage member registrations, meal preferences, and attendance tracking</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border hover:bg-card/80 transition-all duration-200">
                  <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-secondary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">Automated Billing</h3>
                    <p className="text-sm text-muted-foreground">Generate bills automatically, track payments, and send reminders seamlessly</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border hover:bg-card/80 transition-all duration-200">
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-accent-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">Real-time Communication</h3>
                    <p className="text-sm text-muted-foreground">Stay connected with instant messaging, announcements, and community features</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border hover:bg-card/80 transition-all duration-200">
                  <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">Secure & Reliable</h3>
                    <p className="text-sm text-muted-foreground">Bank-level security with 99.9% uptime and automatic data backups</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons - Desktop Only */}
            <div className="hidden lg:block space-y-4">
              {/* Primary CTA */}
              <button
                onClick={handleLogin}
                className="w-full py-4 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg rounded-xl transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl hover:scale-[1.02]"
              >
                <span>Get Started Now</span>
                <ArrowRight size={20} />
              </button>

              {/* Secondary CTA */}
              <button
                onClick={handleSignUp}
                className="w-full py-4 px-8 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold text-lg rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02]"
              >
                Create New Account
              </button>
            </div>

            {/* Install PWA Button - All Screens */}
            {isInstallable && (
              <div className="mt-4">
                <button
                  onClick={handleInstallPWA}
                  className="w-full py-3 px-6 bg-card hover:bg-accent text-foreground font-medium rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 border border-border"
                >
                  <Download size={18} />
                  <span>Install App</span>
                </button>
              </div>
            )}

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                By continuing, you agree to our{" "}
                <button
                  type="button"
                  className="font-medium text-primary hover:underline transition-colors"
                >
                  Terms of Service
                </button>{" "}
                and{" "}
                <button
                  type="button"
                  className="font-medium text-primary hover:underline transition-colors"
                >
                  Privacy Policy
                </button>
              </p>
              
              {/* Trust Indicators */}
              <div className="mt-6 flex items-center justify-center space-x-6 text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Shield className="w-3 h-3" />
                  <span>SSL Secured</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-3 h-3" />
                  <span>4.8/5 Rating</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="w-3 h-3" />
                  <span>10K+ Users</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
