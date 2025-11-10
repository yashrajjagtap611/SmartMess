import React from 'react';

interface MealManagementHeaderProps {
  showCalendar: boolean;
  calendarView?: 'month' | 'week';
  onToggleCalendar: () => void;
  onAddMenu: () => void;
}

export const MealManagementHeader: React.FC<MealManagementHeaderProps> = ({
  showCalendar,
  calendarView = 'month',
  onToggleCalendar,
  onAddMenu,
}) => {
  return (
    <header className="sticky top-0 left-0 right-0 z-10 w-full flex items-center px-4 py-3 backdrop-blur-md bg-SmartMess-light-bg dark:SmartMess-dark-bg/80 dark:bg-SmartMess-light-bg dark:SmartMess-dark-bg/70 border-b SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border">
             {/* Mobile/Tablet Layout - Title with Calendar Icon */}
       <div className="flex items-center justify-between w-full lg:hidden">
         <div className="w-10"></div> {/* Spacer for centering */}
         
         <h1 className="text-xl md:text-2xl font-bold text-center text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
           Meal Management
         </h1>
         
         <button
           onClick={onToggleCalendar}
           className={`p-2 rounded-lg transition-all duration-200 ${
             showCalendar 
               ? 'bg-SmartMess-light-primary dark:SmartMess-dark-primary text-white' 
               : 'text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text hover:bg-SmartMess-light-surface dark:SmartMess-dark-surface-hover dark:hover:bg-SmartMess-light-surface dark:SmartMess-dark-surface-hover'
           }`}
           title={showCalendar ? `Switch to ${calendarView === 'month' ? 'Week' : 'Month'} View` : 'Show Calendar'}
         >
           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
           </svg>
         </button>
       </div>
      
      {/* Desktop/Laptop Layout - Professional Alignment */}
      <div className="hidden lg:flex items-center justify-between w-full">
        {/* Left Section - Title and Breadcrumb */}
        <div className="flex items-center space-x-6 px-6">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
              Meal Management
            </h1>
            <p className="text-sm text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
              Manage your daily meals and view statistics
            </p>
          </div>
        </div>
        
        {/* Right Section - Action Buttons */}
        <div className="flex items-center space-x-3 pr-6">
          <button
            onClick={onToggleCalendar}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              showCalendar 
                ? 'bg-SmartMess-light-primary dark:SmartMess-dark-primary text-white' 
                : 'text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text hover:bg-SmartMess-light-surface dark:SmartMess-dark-surface-hover dark:hover:bg-SmartMess-light-surface dark:SmartMess-dark-surface-hover border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border'
            }`}
            title={showCalendar ? `Switch to ${calendarView === 'month' ? 'Week' : 'Month'} View` : 'Show Calendar'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm font-medium">Calendar</span>
          </button>
          
          <button
            onClick={onAddMenu}
            className="flex items-center space-x-2 px-4 py-2 bg-SmartMess-light-primary dark:SmartMess-dark-primary text-white rounded-lg hover:bg-SmartMess-light-primary dark:SmartMess-dark-primary/90 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="text-sm font-medium">Add Menu</span>
          </button>
        </div>
      </div>
    </header>
  );
};
