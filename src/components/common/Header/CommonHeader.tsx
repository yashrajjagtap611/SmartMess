// src/components/common/Header/CommonHeader.tsx
import React from 'react';
import { User } from 'lucide-react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface CommonHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode; // For custom actions/buttons
  showUserProfile?: boolean;
  onUserProfileClick?: () => void;
  user?: {
    firstName?: string;
    lastName?: string;
    role?: string;
    avatar?: string; // Added for avatar support
    email?: string; // Added for email support
  };
  className?: string;
  variant?: 'default' | 'settings' | 'search';
  searchProps?: {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    showSearch: boolean;
    onToggleSearch: () => void;
    onFilterClick?: () => void;
  };
  onBack?: () => void; // Optional back button handler (only shows on small screens)
}

export const CommonHeader: React.FC<CommonHeaderProps> = ({
  title,
  subtitle,
  children,
  showUserProfile = false,
  onUserProfileClick,
  user,
  className = '',
  variant = 'default',
  searchProps,
  onBack
}) => {
  const baseHeaderClasses = "sticky top-0 left-0 right-0 z-10 w-full flex items-center px-4 py-3 backdrop-blur-md border-b transition-all duration-300";
  
  const variantClasses = {
    default: "bg-SmartMess-light-bg dark:SmartMess-dark-bg/80 dark:bg-SmartMess-light-bg dark:SmartMess-dark-bg/70 SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border",
    settings: "SmartMess-light-bg dark:SmartMess-dark-bg/80 SmartMess-light-border dark:SmartMess-dark-border",
    search: "bg-SmartMess-light-bg dark:SmartMess-dark-bg/80 dark:bg-SmartMess-light-bg dark:SmartMess-dark-bg/70 SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border"
  };

  const textClasses = {
    default: {
      title: "text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text",
      subtitle: "text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted"
    },
    settings: {
      title: "SmartMess-light-text dark:SmartMess-dark-text",
      subtitle: "SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary"
    },
    search: {
      title: "text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text",
      subtitle: "text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted"
    }
  };

  const renderMobileLayout = () => {
    if (variant === 'search' && searchProps) {
      return (
        <div className="flex items-center justify-between w-full lg:hidden">
          {/* Left Section - Back Button (only on mobile) */}
          <div className="w-10 flex-shrink-0">
            {onBack ? (
              <button
                onClick={onBack}
                className="p-2 rounded-lg hover:bg-SmartMess-light-hover dark:SmartMess-dark-hover dark:hover:bg-SmartMess-light-hover dark:SmartMess-dark-hover transition-colors focus:outline-none focus:ring-2 focus:ring-SmartMess-light-primary dark:SmartMess-dark-primary/20 dark:focus:ring-SmartMess-light-primary dark:SmartMess-dark-primary/30"
                aria-label="Go back"
              >
                <svg className="w-5 h-5 text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            ) : (
          <div className="w-8" />
            )}
          </div>
          <div className="flex-1 flex justify-center">
            <h1 className="text-xl md:text-2xl font-bold text-center text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
              {title}
            </h1>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3">
            {searchProps.showSearch ? (
              <div className="flex items-center space-x-2 bg-SmartMess-light-input-bg dark:SmartMess-dark-input-bg dark:bg-SmartMess-light-input-bg dark:SmartMess-dark-input-bg rounded-lg border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border overflow-hidden transition-all duration-200 animate-fade-in">
                <div className="pl-3 text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
                  <Search className="w-4 h-4" />
                </div>
                <Input
                  type="text"
                  placeholder="Search users..."
                  value={searchProps.searchQuery}
                  onChange={e => searchProps.onSearchChange(e.target.value)}
                  className="w-36 sm:w-56 h-9 text-sm border-0 bg-transparent focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  autoFocus
                />
                <button
                  onClick={() => {
                    searchProps.onToggleSearch();
                    searchProps.onSearchChange("");
                  }}
                  className="p-2 hover:bg-SmartMess-light-hover dark:SmartMess-dark-hover dark:hover:bg-SmartMess-light-hover dark:SmartMess-dark-hover transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4 text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted hover:text-SmartMess-light-text dark:SmartMess-dark-text dark:hover:text-SmartMess-light-text dark:SmartMess-dark-text" />
                </button>
              </div>
            ) : (
              <button
                onClick={searchProps.onToggleSearch}
                className="p-2 rounded-lg hover:bg-SmartMess-light-hover dark:SmartMess-dark-hover dark:hover:bg-SmartMess-light-hover dark:SmartMess-dark-hover transition-colors focus:outline-none focus:ring-2 focus:ring-SmartMess-light-primary dark:SmartMess-dark-primary/20 dark:focus:ring-SmartMess-light-primary dark:SmartMess-dark-primary/30"
                aria-label="Search users"
              >
                <Search className="w-5 h-5 text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text" />
              </button>
            )}
            <button
              onClick={searchProps.onFilterClick}
              className="p-2 rounded-lg hover:bg-SmartMess-light-hover dark:SmartMess-dark-hover dark:hover:bg-SmartMess-light-hover dark:SmartMess-dark-hover transition-colors focus:outline-none focus:ring-2 focus:ring-SmartMess-light-primary dark:SmartMess-dark-primary/20 dark:focus:ring-SmartMess-light-primary dark:SmartMess-dark-primary/30"
              aria-label="Filter users"
            >
              <Filter className="w-5 h-5 text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text" />
            </button>
            {children && (
              <div className="flex items-center">
                {children}
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-between w-full lg:hidden">
        {/* Left Section - Back Button (only on mobile) */}
        <div className="w-10 flex-shrink-0">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-lg hover:bg-SmartMess-light-hover dark:SmartMess-dark-hover dark:hover:bg-SmartMess-light-hover dark:SmartMess-dark-hover transition-colors focus:outline-none focus:ring-2 focus:ring-SmartMess-light-primary dark:SmartMess-dark-primary/20 dark:focus:ring-SmartMess-light-primary dark:SmartMess-dark-primary/30"
              aria-label="Go back"
            >
              <svg className="w-5 h-5 text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
        </div>
        <div className="flex-1 flex justify-center">
          <h1 className="text-xl md:text-2xl font-bold text-center text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
            {title}
          </h1>
        </div>
        {/* Right Section - Children (Actions) */}
        <div className="flex items-center space-x-2 w-10 flex-shrink-0 justify-end">
          {children}
        </div>
      </div>
    );
  };

  const renderDesktopLayout = () => {
    if (variant === 'search' && searchProps) {
      return (
        <div className="hidden lg:flex items-center justify-between w-full transition-all duration-300">
          {/* Left Section - Title and Breadcrumb */}
          <div className="flex items-center space-x-6 px-6">
            <div className="flex flex-col">
              <h1 className={`text-2xl font-bold ${textClasses[variant].title}`}>
                {title}
              </h1>
              {subtitle && (
                <p className={`text-sm ${textClasses[variant].subtitle}`}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {/* Center Section - Search Bar */}
          <div className="flex-1 max-w-md mx-8">
            {searchProps.showSearch ? (
              <div className="flex items-center space-x-2 bg-SmartMess-light-input-bg dark:SmartMess-dark-input-bg dark:bg-SmartMess-light-input-bg dark:SmartMess-dark-input-bg rounded-lg border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border overflow-hidden transition-all duration-200 animate-fade-in">
                <div className="pl-4 text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
                  <Search className="w-4 h-4" />
                </div>
                <Input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchProps.searchQuery}
                  onChange={e => searchProps.onSearchChange(e.target.value)}
                  className="flex-1 h-10 text-sm border-0 bg-transparent focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  autoFocus
                />
                <button
                  onClick={() => {
                    searchProps.onToggleSearch();
                    searchProps.onSearchChange("");
                  }}
                  className="p-2 hover:bg-SmartMess-light-hover dark:SmartMess-dark-hover dark:hover:bg-SmartMess-light-hover dark:SmartMess-dark-hover transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4 text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted hover:text-SmartMess-light-text dark:SmartMess-dark-text dark:hover:text-SmartMess-light-text dark:SmartMess-dark-text" />
                </button>
              </div>
            ) : (
              <button
                onClick={searchProps.onToggleSearch}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border bg-SmartMess-light-input-bg dark:SmartMess-dark-input-bg dark:bg-SmartMess-light-input-bg dark:SmartMess-dark-input-bg hover:bg-SmartMess-light-hover dark:SmartMess-dark-hover dark:hover:bg-SmartMess-light-hover dark:SmartMess-dark-hover transition-colors focus:outline-none focus:ring-2 focus:ring-SmartMess-light-primary dark:SmartMess-dark-primary/20 dark:focus:ring-SmartMess-light-primary dark:SmartMess-dark-primary/30"
                aria-label="Search users"
              >
                <Search className="w-4 h-4 text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted" />
                <span className="text-sm text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
                  Search users...
                </span>
              </button>
            )}
          </div>
          {/* Right Section - Actions */}
          <div className="flex items-center space-x-3 pr-6">
            <button
              onClick={searchProps.onFilterClick}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-lg border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border bg-SmartMess-light-surface dark:SmartMess-dark-surface dark:bg-SmartMess-light-surface dark:SmartMess-dark-surface hover:bg-SmartMess-light-hover dark:SmartMess-dark-hover dark:hover:bg-SmartMess-light-hover dark:SmartMess-dark-hover transition-colors focus:outline-none focus:ring-2 focus:ring-SmartMess-light-primary dark:SmartMess-dark-primary/20 dark:focus:ring-SmartMess-light-primary dark:SmartMess-dark-primary/30"
              aria-label="Filter users"
            >
              <Filter className="w-4 h-4 text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text" />
              <span className="text-sm font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
                Filter
              </span>
            </button>
            {children}
            {showUserProfile && (
              <div className="relative group">
                {/* Desktop: Full profile card */}
                <button
                  onClick={onUserProfileClick}
                  className="hidden lg:flex items-center space-x-3 px-3 py-2 rounded-lg SmartMess-light-surface dark:SmartMess-dark-surface SmartMess-light-hover dark:SmartMess-dark-hover border SmartMess-light-border dark:SmartMess-dark-border transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label="Go to profile"
                >
                  <div className="w-9 h-9 rounded-full SmartMess-light-primary dark:SmartMess-dark-primary flex items-center justify-center shadow-sm flex-shrink-0 overflow-hidden">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt="Profile"
                        className="w-9 h-9 object-cover rounded-full"
                        onError={e => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      <span className="text-base font-bold text-primary-foreground">
                        {(() => {
                          let initials = "U";
                          if (user && typeof user === "object") {
                            const first = user.firstName?.[0] || "";
                            const last = user.lastName?.[0] || "";
                            if (first || last) {
                              initials = (first + last).toUpperCase();
                            } else if (user?.email && user.email.length > 0) {
                              initials = user.email.charAt(0).toUpperCase();
                            }
                          }
                          return initials;
                        })()}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col items-start min-w-0">
                    <span className="font-semibold SmartMess-light-text dark:SmartMess-dark-text text-sm truncate max-w-[120px]">
                      {user && typeof user === 'object' && (user.firstName || user.lastName) ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'User'}
                    </span>
                    <span className="text-xs SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary truncate max-w-[120px]">
                      {user?.role ? user.role.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) : ''}
                    </span>
                  </div>
                </button>
                {/* Mobile: Only icon */}
                <button
                  onClick={onUserProfileClick}
                  className="lg:hidden p-2 rounded-full SmartMess-light-text dark:SmartMess-dark-text hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label="Go to profile"
                >
                  <User className="w-6 h-6" />
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }
    // fallback to default
    return (
      <div className="hidden lg:flex items-center justify-between w-full">
        {/* Left Section - Title and Breadcrumb */}
        <div className="flex items-center space-x-6 px-6">
          <div className="flex flex-col">
            <h1 className={`text-2xl font-bold ${textClasses[variant].title}`}>
              {title}
            </h1>
            {subtitle && (
              <p className={`text-sm ${textClasses[variant].subtitle}`}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {/* Right Section - Actions and User Profile */}
        <div className="flex items-center space-x-3 pr-6">
          {children}
          {showUserProfile && (
            <div className="relative group">
              {/* Desktop: Full profile card */}
              <button
                onClick={onUserProfileClick}
                className="hidden lg:flex items-center space-x-3 px-3 py-2 rounded-lg SmartMess-light-surface dark:SmartMess-dark-surface SmartMess-light-hover dark:SmartMess-dark-hover border SmartMess-light-border dark:SmartMess-dark-border transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Go to profile"
              >
                <div className="w-9 h-9 rounded-full SmartMess-light-primary dark:SmartMess-dark-primary flex items-center justify-center shadow-sm flex-shrink-0 overflow-hidden">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt="Profile"
                      className="w-9 h-9 object-cover rounded-full"
                      onError={e => { e.currentTarget.style.display = 'none'; }}
                    />
                  ) : (
                    <span className="text-base font-bold text-primary-foreground">
                      {(() => {
                        let initials = "U";
                        if (user && typeof user === "object") {
                          const first = user.firstName?.[0] || "";
                          const last = user.lastName?.[0] || "";
                          if (first || last) {
                            initials = (first + last).toUpperCase();
                          } else if (user?.email && user.email.length > 0) {
                            initials = user.email.charAt(0).toUpperCase();
                          }
                        }
                        return initials;
                      })()}
                    </span>
                  )}
                </div>
                <div className="flex flex-col items-start min-w-0">
                  <span className="font-semibold SmartMess-light-text dark:SmartMess-dark-text text-sm truncate max-w-[120px]">
                    {user && typeof user === 'object' && (user.firstName || user.lastName) ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'User'}
                  </span>
                  <span className="text-xs SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary truncate max-w-[120px]">
                    {user?.role ? user.role.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) : ''}
                  </span>
                </div>
              </button>
              {/* Mobile: Only icon */}
              <button
                onClick={onUserProfileClick}
                className="lg:hidden p-2 rounded-full SmartMess-light-text dark:SmartMess-dark-text hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Go to profile"
              >
                <User className="w-6 h-6" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <header className={`${baseHeaderClasses} ${variantClasses[variant]} ${className}`}>
      {renderMobileLayout()}
      {renderDesktopLayout()}
    </header>
  );
};

// Specialized header components for common use cases
export const PageHeader: React.FC<Omit<CommonHeaderProps, 'variant' | 'title' | 'subtitle'> & { pageTitle: string; pageDescription?: string }> = ({
  pageTitle,
  pageDescription,
  ...props
}) => {
  return (
    <CommonHeader
      title={pageTitle}
      subtitle={pageDescription || ''}
      variant="default"
      {...props}
    />
  );
};

export const SearchHeaderComponent: React.FC<Omit<CommonHeaderProps, 'variant' | 'title' | 'subtitle'> & {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  showSearch: boolean;
  onToggleSearch: () => void;
  onFilterClick?: () => void;
  pageTitle: string;
}> = ({
  searchQuery,
  onSearchChange,
  showSearch,
  onToggleSearch,
  onFilterClick,
  pageTitle,
  ...props
}) => {
  return (
    <CommonHeader
      title={pageTitle}
      variant="search"
      searchProps={{
        searchQuery,
        onSearchChange,
        showSearch,
        onToggleSearch,
        ...(onFilterClick !== undefined ? { onFilterClick } : {}) // Only include onFilterClick if it's defined
      }}
      {...props}
    />
  );
};

export default CommonHeader;