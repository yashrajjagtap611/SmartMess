import React from 'react';
import { Input } from '@/components/ui/input';
import { Search, Filter, X } from 'lucide-react';
import type { SearchHeaderProps } from '../UserManagement.types';

const SearchHeader: React.FC<SearchHeaderProps> = ({
  searchQuery,
  onSearchChange,
  showSearch,
  onToggleSearch,
  onFilterClick
}) => {
  return (
    <header className="sticky top-0 left-0 right-0 z-10 w-full flex items-center px-4 py-3 backdrop-blur-md bg-SmartMess-light-bg dark:SmartMess-dark-bg/80 dark:bg-SmartMess-light-bg dark:SmartMess-dark-bg/70 border-b SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border">
      {/* Mobile/Tablet Layout - Centered Title */}
      <div className="flex items-center justify-between w-full lg:hidden">
        <div className="w-8">
          {/* Empty div to balance the layout */}
        </div>
        <div className="flex-1 flex justify-center">
          <h1 className="text-xl md:text-2xl font-bold text-center text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
            User Management
          </h1>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-3">
          {showSearch ? (
            <div className="flex items-center space-x-2 bg-SmartMess-light-input-bg dark:SmartMess-dark-input-bg dark:bg-SmartMess-light-input-bg dark:SmartMess-dark-input-bg rounded-lg border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border overflow-hidden transition-all duration-200 animate-fade-in">
              <div className="pl-3 text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
                <Search className="w-4 h-4" />
              </div>
              <Input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-36 sm:w-56 h-9 text-sm border-0 bg-transparent focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                autoFocus
              />
              <button
                onClick={() => {
                  onToggleSearch();
                  onSearchChange("");
                }}
                className="p-2 hover:bg-SmartMess-light-hover dark:SmartMess-dark-hover dark:hover:bg-SmartMess-light-hover dark:SmartMess-dark-hover transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4 text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted hover:text-SmartMess-light-text dark:SmartMess-dark-text dark:hover:text-SmartMess-light-text dark:SmartMess-dark-text" />
              </button>
            </div>
          ) : (
            <button
              onClick={onToggleSearch}
              className="p-2 rounded-lg hover:bg-SmartMess-light-hover dark:SmartMess-dark-hover dark:hover:bg-SmartMess-light-hover dark:SmartMess-dark-hover transition-colors focus:outline-none focus:ring-2 focus:ring-SmartMess-light-primary dark:SmartMess-dark-primary/20 dark:focus:ring-SmartMess-light-primary dark:SmartMess-dark-primary/30"
              aria-label="Search users"
            >
              <Search className="w-5 h-5 text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text" />
            </button>
          )}
          
          <button
            onClick={onFilterClick}
            className="p-2 rounded-lg hover:bg-SmartMess-light-hover dark:SmartMess-dark-hover dark:hover:bg-SmartMess-light-hover dark:SmartMess-dark-hover transition-colors focus:outline-none focus:ring-2 focus:ring-SmartMess-light-primary dark:SmartMess-dark-primary/20 dark:focus:ring-SmartMess-light-primary dark:SmartMess-dark-primary/30"
            aria-label="Filter users"
          >
            <Filter className="w-5 h-5 text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text" />
          </button>
        </div>
      </div>

      {/* Desktop/Laptop Layout - Professional Alignment */}
      <div className="hidden lg:flex items-center justify-between w-full">
        {/* Left Section - Title and Breadcrumb */}
        <div className="flex items-center space-x-6 px-6">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
              User Management
            </h1>
            <p className="text-sm text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
              Manage your mess members and subscriptions
            </p>
          </div>
        </div>

        {/* Center Section - Search Bar */}
        <div className="flex-1 max-w-md mx-8">
          {showSearch ? (
            <div className="flex items-center space-x-2 bg-SmartMess-light-input-bg dark:SmartMess-dark-input-bg dark:bg-SmartMess-light-input-bg dark:SmartMess-dark-input-bg rounded-lg border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border overflow-hidden transition-all duration-200 animate-fade-in">
              <div className="pl-4 text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
                <Search className="w-4 h-4" />
              </div>
              <Input
                type="text"
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="flex-1 h-10 text-sm border-0 bg-transparent focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                autoFocus
              />
              <button
                onClick={() => {
                  onToggleSearch();
                  onSearchChange("");
                }}
                className="p-2 hover:bg-SmartMess-light-hover dark:SmartMess-dark-hover dark:hover:bg-SmartMess-light-hover dark:SmartMess-dark-hover transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4 text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted hover:text-SmartMess-light-text dark:SmartMess-dark-text dark:hover:text-SmartMess-light-text dark:SmartMess-dark-text" />
              </button>
            </div>
          ) : (
            <button
              onClick={onToggleSearch}
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
            onClick={onFilterClick}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-lg border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border bg-SmartMess-light-surface dark:SmartMess-dark-surface dark:bg-SmartMess-light-surface dark:SmartMess-dark-surface hover:bg-SmartMess-light-hover dark:SmartMess-dark-hover dark:hover:bg-SmartMess-light-hover dark:SmartMess-dark-hover transition-colors focus:outline-none focus:ring-2 focus:ring-SmartMess-light-primary dark:SmartMess-dark-primary/20 dark:focus:ring-SmartMess-light-primary dark:SmartMess-dark-primary/30"
            aria-label="Filter users"
          >
            <Filter className="w-4 h-4 text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text" />
            <span className="text-sm font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
              Filter
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default SearchHeader; 