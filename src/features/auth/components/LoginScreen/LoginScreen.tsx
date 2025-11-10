import { Mail, Lock, Eye, EyeOff, Sun, Moon, ArrowLeft, Zap, Shield, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { useLoginScreen } from "./LoginScreen.hooks";
import { useTheme } from "@/components/theme/theme-provider";
import type { LoginScreenProps } from "./LoginScreen.types";

export const LoginScreen = ({ 
  onSubmit,
  onForgotPassword,
  onRegister 
}: LoginScreenProps) => {
  const navigate = useNavigate();
  const { isDarkTheme, toggleTheme } = useTheme();

  const { 
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    error,
    isLoading,
    handleSubmit,
    togglePasswordVisibility
  } = useLoginScreen({ onSubmit: onSubmit || (() => {}) });

  const handleBack = () => navigate(ROUTES.PUBLIC.ROOT);
  const handleForgot = () => onForgotPassword ? onForgotPassword() : navigate(ROUTES.PUBLIC.FORGOT_PASSWORD);
  const handleRegister = () => onRegister ? onRegister() : navigate(ROUTES.PUBLIC.REGISTER);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-secondary/10 rounded-full blur-3xl" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-6">
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

      <div className="relative z-10 flex flex-col lg:flex-row min-h-[calc(100vh-120px)]">
        {/* Left Side - Hero Content */}
        <div className="hidden lg:flex lg:flex-1 items-center justify-center p-8">
          <div className="w-full max-w-lg space-y-8">
            {/* Hero Image */}
            <div className="text-center">
              <img 
                src={isDarkTheme ? "/authImg/LoginDark.png" : "/authImg/LoginLight.png"} 
                alt="SmartMess Login" 
                className="w-full h-auto max-w-md mx-auto object-contain" 
              />
            </div>

            {/* Hero Content */}
            <div className="text-center space-y-6">
              <h2 className="text-3xl font-bold text-foreground">
                Welcome Back to <span className="text-primary">SmartMess</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Continue managing your mess with ease and efficiency
              </p>

              {/* Feature Highlights */}
              <div className="grid gap-4 mt-8">
                <div className="flex items-center space-x-3 p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-foreground">Member Management</h3>
                    <p className="text-sm text-muted-foreground">Manage all your mess members efficiently</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border">
                  <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-secondary" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-foreground">Secure Platform</h3>
                    <p className="text-sm text-muted-foreground">Your data is protected with bank-level security</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-8">
          <div className="w-full max-w-md">
            {/* Mobile Header */}
            <div className="lg:hidden mb-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Zap size={32} className="text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Welcome Back</h1>
              <p className="text-muted-foreground">Sign in to your SmartMess account</p>
            </div>

            {/* Back Button */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={handleBack}
                className="flex items-center space-x-2 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft size={18} />
                <span className="text-sm">Back</span>
              </button>
            </div>

            {/* Login Form Card */}
            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 shadow-xl">
              <div className="hidden lg:block text-center mb-6">
                <h1 className="text-2xl font-bold text-foreground mb-2">Sign In</h1>
                <p className="text-muted-foreground">Enter your credentials to continue</p>
              </div>

              <div className="space-y-4">
                {/* Email Field */}
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-foreground">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <input
                      id="email"
                      placeholder="Enter your email"
                      type="email"
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect="off"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`flex h-12 w-full rounded-xl border bg-background/50 px-3 py-2 pl-10 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 ${
                        error ? "border-red-500 focus-visible:ring-red-500" : "border-border hover:border-primary/50"
                      }`}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-foreground">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoCapitalize="none"
                      autoComplete="current-password"
                      autoCorrect="off"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`flex h-12 w-full rounded-xl border bg-background/50 px-3 py-2 pl-10 pr-12 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 ${
                        error ? "border-red-500 focus-visible:ring-red-500" : "border-border hover:border-primary/50"
                      }`}
                      placeholder="Enter your password"
                    />
                    <button 
                      type="button" 
                      onClick={togglePasswordVisibility} 
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 dark:bg-red-950/20 dark:border-red-800">
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </div>
                )}

                {/* Sign In Button */}
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02]"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <span>Sign In</span>
                  )}
                </button>

                {/* Forgot Password & Register Links */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-4">
                  <button 
                    onClick={handleForgot} 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
                  >
                    Forgot your password?
                  </button>
                  <div className="flex items-center space-x-1 text-sm">
                    <span className="text-muted-foreground">Don't have an account?</span>
                    <button 
                      onClick={handleRegister} 
                      className="text-primary hover:text-primary/80 font-medium transition-colors"
                    >
                      Sign up
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;





