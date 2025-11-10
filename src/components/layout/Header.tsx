import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface HeaderProps {
  title?: string;
  subtitle?: string;
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  className?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  breadcrumbs?: Array<{
    label: string;
    path?: string;
    onClick?: () => void;
  }>;
}

const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  leftContent,
  rightContent,
  className,
  showBackButton = false,
  onBackClick,
  breadcrumbs,
}) => {
  return (
    <header className={cn('flex items-center justify-between py-4 px-6 border-b SmartMess-light-bg dark:SmartMess-dark-bg', className)}>
      <div className="flex items-center space-x-4">
        {showBackButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBackClick}
            className="p-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Button>
        )}
        
        {leftContent}
        
        <div className="flex flex-col">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="flex items-center space-x-2 text-sm SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary mb-1">
              {breadcrumbs.map((breadcrumb, index) => (
                <React.Fragment key={index}>
                  {index > 0 && (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  )}
                  {breadcrumb.path || breadcrumb.onClick ? (
                    <button
                      onClick={breadcrumb.onClick}
                      className="hover:SmartMess-light-text dark:SmartMess-dark-text transition-colors"
                    >
                      {breadcrumb.label}
                    </button>
                  ) : (
                    <span className="SmartMess-light-text dark:SmartMess-dark-text font-medium">
                      {breadcrumb.label}
                    </span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          )}
          
          {title && (
            <h1 className="text-2xl font-bold SmartMess-light-text dark:SmartMess-dark-text">
              {title}
            </h1>
          )}
          
          {subtitle && (
            <p className="text-sm SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary mt-1">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      
      {rightContent && (
        <div className="flex items-center space-x-2">
          {rightContent}
        </div>
      )}
    </header>
  );
};

export { Header }; 