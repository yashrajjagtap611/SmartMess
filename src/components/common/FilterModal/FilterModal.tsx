import React from 'react';
import { Button } from '@/components/ui/button';
import { Filter, CheckCircle, X } from 'lucide-react';

export interface FilterOption {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  selected: boolean;
  count?: number;
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFilter: string;
  onFilterChange: (filterId: string) => void;
  filterOptions: FilterOption[];
  title?: string;
  showCounts?: boolean;
}

const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  selectedFilter,
  onFilterChange,
  filterOptions,
  title = 'Filter',
  showCounts = false
}) => {
  if (!isOpen) return null;

  const handleFilterSelect = (filterId: string) => {
    onFilterChange(filterId);
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content - Right side panel on large screens, bottom sheet on mobile */}
      <div 
        className="absolute inset-x-0 bottom-0 lg:top-0 lg:left-auto lg:right-0 lg:inset-x-auto w-full lg:w-[420px] lg:max-w-[420px] max-h-[calc(100vh-4rem)] lg:max-h-screen bg-card border-t lg:border-l border-border rounded-t-3xl lg:rounded-none p-6 overflow-y-auto transform transition-all duration-300 ease-out translate-y-0 shadow-xl lg:shadow-2xl"
      >
        {/* Drag Handle - Only on mobile */}
        <div className="lg:hidden absolute top-3 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-border rounded-full opacity-60"></div>
        
        <div className="pt-8 lg:pt-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Filter className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">{title}</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const allOption = filterOptions.find(opt => opt.id === 'all');
                  if (allOption) {
                    onFilterChange('all');
                  }
                }}
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-lg px-2 py-1"
              >
                Reset
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-foreground" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="space-y-3 py-4">
          {filterOptions.map((option) => {
            const IconComponent = option.icon;
            const isSelected = option.id === selectedFilter;
            return (
              <button
                key={option.id}
                onClick={() => handleFilterSelect(option.id)}
                className={`w-full p-4 rounded-xl border transition-all duration-200 focus:outline-none ${
                  isSelected 
                    ? 'ring-2 ring-primary/30 bg-primary/5 border-primary/30' 
                    : 'focus:ring-2 focus:ring-primary/20 bg-card border-border hover:bg-muted'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isSelected 
                        ? 'bg-primary/20 text-primary' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`font-medium text-base truncate ${
                          isSelected 
                            ? 'text-primary' 
                            : 'text-foreground'
                        }`}>
                          {option.title}
                        </p>
                        {showCounts && option.count !== undefined && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            isSelected
                              ? 'bg-primary/20 text-primary'
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {option.count}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                        {option.description}
                      </p>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground flex-shrink-0 ml-2">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
        
        <div className="flex space-x-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 h-11 sm:h-12 rounded-xl"
          >
            Cancel
          </Button>
          <Button
            onClick={onClose}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground h-11 sm:h-12 rounded-xl font-medium"
          >
            Apply Filter
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;

