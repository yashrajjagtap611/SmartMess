import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Filter, CheckCircle, X } from 'lucide-react';
import type { FilterOption } from './FilterModal';

export interface FilterSection {
  id: string;
  title: string;
  options: FilterOption[];
}

interface MultiSelectFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFilters: Record<string, string[]>;
  onFilterChange: (filters: Record<string, string[]>) => void;
  filterSections: FilterSection[];
  title?: string;
  showCounts?: boolean;
}

const MultiSelectFilterModal: React.FC<MultiSelectFilterModalProps> = ({
  isOpen,
  onClose,
  selectedFilters,
  onFilterChange,
  filterSections,
  title = 'Filter',
  showCounts = false
}) => {
  const [localFilters, setLocalFilters] = useState<Record<string, string[]>>(selectedFilters);

  useEffect(() => {
    setLocalFilters(selectedFilters);
  }, [selectedFilters, isOpen]);

  if (!isOpen) return null;

  const handleToggleFilter = (sectionId: string, filterId: string) => {
    const currentSectionFilters = localFilters[sectionId] || [];
    const isSelected = currentSectionFilters.includes(filterId);

    let newSectionFilters: string[];
    if (filterId === 'all') {
      // If "all" is selected, clear all other selections
      newSectionFilters = isSelected ? [] : ['all'];
    } else {
      // Remove "all" if it exists, then toggle the specific filter
      newSectionFilters = currentSectionFilters.filter(id => id !== 'all');
      if (isSelected) {
        newSectionFilters = newSectionFilters.filter(id => id !== filterId);
      } else {
        newSectionFilters = [...newSectionFilters, filterId];
      }
      // If no filters selected, select "all"
      if (newSectionFilters.length === 0) {
        newSectionFilters = ['all'];
      }
    }

    setLocalFilters({
      ...localFilters,
      [sectionId]: newSectionFilters
    });
  };

  const handleReset = () => {
    const resetFilters: Record<string, string[]> = {};
    filterSections.forEach(section => {
      resetFilters[section.id] = ['all'];
    });
    setLocalFilters(resetFilters);
  };

  const handleApply = () => {
    onFilterChange(localFilters);
    onClose();
  };

  const getSelectedCount = (sectionId: string): number => {
    const filters = localFilters[sectionId] || ['all'];
    if (filters.includes('all')) return 0;
    return filters.length;
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
        onClick={(e) => e.stopPropagation()}
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
                onClick={handleReset}
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
        
        <div className="space-y-6 py-4">
          {filterSections.map((section) => {
            const sectionFilters = localFilters[section.id] || ['all'];
            const selectedCount = getSelectedCount(section.id);
            
            return (
              <div key={section.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                    {section.title}
                  </h3>
                  {selectedCount > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                      {selectedCount} selected
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  {section.options.map((option) => {
                    const IconComponent = option.icon;
                    const isSelected = sectionFilters.includes(option.id);
                    return (
                      <button
                        key={option.id}
                        onClick={() => handleToggleFilter(section.id, option.id)}
                        className={`w-full p-3 rounded-xl border transition-all duration-200 focus:outline-none ${
                          isSelected 
                            ? 'ring-2 ring-primary/30 bg-primary/5 border-primary/30' 
                            : 'focus:ring-2 focus:ring-primary/20 bg-card border-border hover:bg-muted'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              isSelected 
                                ? 'bg-primary/20 text-primary' 
                                : 'bg-muted text-muted-foreground'
                            }`}>
                              <IconComponent className="w-4 h-4" />
                            </div>
                            <div className="text-left flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className={`font-medium text-sm truncate ${
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
                              {option.description && (
                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                  {option.description}
                                </p>
                              )}
                            </div>
                          </div>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-primary-foreground flex-shrink-0 ml-2">
                              <CheckCircle className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="flex space-x-3 pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 h-11 sm:h-12 rounded-xl"
          >
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground h-11 sm:h-12 rounded-xl font-medium"
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MultiSelectFilterModal;

