import React, { useState } from 'react';
import { SideNavigation, BottomNavigation } from '@/components/common/Navbar/CommonNavbar';
import { useTheme } from '@/components/theme/theme-provider';
import { useNavigate } from 'react-router-dom';
import { handleLogout as logoutUtil } from '@/utils/logout';
import { useMealManagement } from './MealManagement.hooks';
import {
  MealManagementHeader,
  MealCalendar,
  WeeklyMealPlanning,
  TodaysMenu,
  MealStats,
  AddMealModal
} from './components';

const MealManagement: React.FC = () => {
  const { isDarkTheme: isDarkMode, toggleTheme: toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const mealManagement = useMealManagement();
  const [activeTab, setActiveTab] = useState<'today' | 'weekly' | 'stats'>('today');
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });
  const [showCalendar, setShowCalendar] = useState(true);
  const [calendarView, setCalendarView] = useState<'month' | 'week'>('month');
  const [showAddMealModal, setShowAddMealModal] = useState(false);

  const handleLogout = () => {
    logoutUtil(navigate);
  };

  const handleToggleCalendar = () => {
    if (showCalendar) {
      // If calendar is shown, toggle between month and week view
      setCalendarView(calendarView === 'month' ? 'week' : 'month');
    } else {
      // If calendar is hidden, show it in month view
      setShowCalendar(true);
      setCalendarView('month');
    }
  };

  const handleAddMenu = () => {
    setShowAddMealModal(true);
  };

  return (
    <div className="min-h-screen bg-SmartMess-light-bg dark:SmartMess-dark-bg dark:bg-SmartMess-light-bg dark:SmartMess-dark-bg transition-all duration-300">
      <SideNavigation
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        handleLogout={handleLogout}
      />
      <div className="lg:ml-90 transition-all duration-300">
        <MealManagementHeader 
          showCalendar={showCalendar}
          calendarView={calendarView}
          onToggleCalendar={handleToggleCalendar}
          onAddMenu={handleAddMenu}
        />

        {/* Content Area */}
        <div className="p-4 md:p-6 pb-32">
          {/* Mobile/Tablet Layout - Calendar above tabs */}
          <div className="lg:hidden">
            {/* Mobile Calendar */}
            {showCalendar && (
              <div className="mb-6">
                <MealCalendar
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                  meals={mealManagement.meals}
                  className="w-full"
                  view={calendarView}
                />
              </div>
            )}
            
            {/* Mobile Tab Navigation */}
            <div className="mb-6">
              <div className="flex space-x-2 bg-SmartMess-light-surface dark:SmartMess-dark-surface dark:bg-SmartMess-light-surface dark:SmartMess-dark-surface rounded-xl p-2 shadow-sm border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border overflow-x-auto scrollbar-hide">
                <button
                  onClick={() => setActiveTab('today')}
                  className={`flex-shrink-0 px-6 py-3 text-sm md:text-base font-semibold rounded-lg transition-all duration-300 whitespace-nowrap flex items-center space-x-2 ${
                    activeTab === 'today'
                      ? 'bg-SmartMess-light-primary dark:SmartMess-dark-primary text-white shadow-lg transform scale-105'
                      : 'text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text hover:text-SmartMess-light-primary dark:SmartMess-dark-primary dark:hover:text-SmartMess-light-primary dark:SmartMess-dark-primary hover:bg-SmartMess-light-surface dark:SmartMess-dark-surface-hover dark:hover:bg-SmartMess-light-surface dark:SmartMess-dark-surface-hover'
                  }`}
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Today's Menu</span>
                </button>
                <button
                  onClick={() => setActiveTab('weekly')}
                  className={`flex-shrink-0 px-6 py-3 text-sm md:text-base font-semibold rounded-lg transition-all duration-300 whitespace-nowrap flex items-center space-x-2 ${
                    activeTab === 'weekly'
                      ? 'bg-SmartMess-light-primary dark:SmartMess-dark-primary text-white shadow-lg transform scale-105'
                      : 'text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text hover:text-SmartMess-light-primary dark:SmartMess-dark-primary dark:hover:text-SmartMess-light-primary dark:SmartMess-dark-primary hover:bg-SmartMess-light-surface dark:SmartMess-dark-surface-hover dark:hover:bg-SmartMess-light-surface dark:SmartMess-dark-surface-hover'
                  }`}
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Weekly Planning</span>
                </button>
                <button
                  onClick={() => setActiveTab('stats')}
                  className={`flex-shrink-0 px-6 py-3 text-sm md:text-base font-semibold rounded-lg transition-all duration-300 whitespace-nowrap flex items-center space-x-2 ${
                    activeTab === 'stats'
                      ? 'bg-SmartMess-light-primary dark:SmartMess-dark-primary text-white shadow-lg transform scale-105'
                      : 'text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text hover:text-SmartMess-light-primary dark:SmartMess-dark-primary dark:hover:text-SmartMess-light-primary dark:SmartMess-dark-primary hover:bg-SmartMess-light-surface dark:SmartMess-dark-surface-hover dark:hover:bg-SmartMess-light-surface dark:SmartMess-dark-surface-hover'
                  }`}
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span>Statistics</span>
                </button>
              </div>
            </div>
          </div>

          {/* Large Screen Layout - Sidebar with calendar and navigation */}
          <div className="hidden lg:flex lg:gap-6">
            {/* Left Sidebar - Calendar and Navigation */}
            {showCalendar && (
              <div className="w-64 flex-shrink-0">
                <div className="sticky top-24 space-y-4">
                  {/* Calendar */}
                  <div className="w-full">
                    <MealCalendar
                      selectedDate={selectedDate}
                      onDateSelect={setSelectedDate}
                      meals={mealManagement.meals}
                      className="w-full"
                      view={calendarView}
                    />
                  </div>
                  
                  {/* Tab Navigation */}
                  <div className="bg-SmartMess-light-surface dark:SmartMess-dark-surface dark:bg-SmartMess-light-surface dark:SmartMess-dark-surface rounded-xl p-4 shadow-sm border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border">
                    <div className="space-y-2">
                      <button
                        onClick={() => setActiveTab('today')}
                        className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 ${
                          activeTab === 'today'
                            ? 'bg-SmartMess-light-primary dark:SmartMess-dark-primary text-white shadow-lg'
                            : 'text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text hover:text-SmartMess-light-primary dark:SmartMess-dark-primary dark:hover:text-SmartMess-light-primary dark:SmartMess-dark-primary hover:bg-SmartMess-light-surface dark:SmartMess-dark-surface-hover dark:hover:bg-SmartMess-light-surface dark:SmartMess-dark-surface-hover'
                        }`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Today's Menu</span>
                      </button>
                      <button
                        onClick={() => setActiveTab('weekly')}
                        className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 ${
                          activeTab === 'weekly'
                            ? 'bg-SmartMess-light-primary dark:SmartMess-dark-primary text-white shadow-lg'
                            : 'text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text hover:text-SmartMess-light-primary dark:SmartMess-dark-primary dark:hover:text-SmartMess-light-primary dark:SmartMess-dark-primary hover:bg-SmartMess-light-surface dark:SmartMess-dark-surface-hover dark:hover:bg-SmartMess-light-surface dark:SmartMess-dark-surface-hover'
                        }`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Weekly Planning</span>
                      </button>
                      <button
                        onClick={() => setActiveTab('stats')}
                        className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 ${
                          activeTab === 'stats'
                            ? 'bg-SmartMess-light-primary dark:SmartMess-dark-primary text-white shadow-lg'
                            : 'text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text hover:text-SmartMess-light-primary dark:SmartMess-dark-primary dark:hover:text-SmartMess-light-primary dark:SmartMess-dark-primary hover:bg-SmartMess-light-surface dark:SmartMess-dark-surface-hover dark:hover:bg-SmartMess-light-surface dark:SmartMess-dark-surface-hover'
                        }`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <span>Statistics</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Main Content Area */}
            <div className="flex-1 min-w-0">
              <div className="bg-SmartMess-light-surface dark:SmartMess-dark-surface dark:bg-SmartMess-light-surface dark:SmartMess-dark-surface rounded-xl border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border shadow-sm overflow-hidden">
                {activeTab === 'today' && (
                  <TodaysMenu
                    meals={mealManagement.meals}
                    mealPlans={mealManagement.mealPlans}
                    tags={mealManagement.tags}
                    loading={mealManagement.loading}
                    onCreateMeal={mealManagement.createMeal}
                    onUpdateMeal={mealManagement.updateMeal}
                    onDeleteMeal={mealManagement.deleteMeal}
                    selectedDate={selectedDate}
                  />
                )}
                
                {activeTab === 'weekly' && (
                  <WeeklyMealPlanning
                    meals={mealManagement.meals}
                    mealPlans={mealManagement.mealPlans}
                    tags={mealManagement.tags}
                    loading={mealManagement.loading}
                    onCreateMeal={mealManagement.createMeal}
                    onUpdateMeal={mealManagement.updateMeal}
                    onDeleteMeal={mealManagement.deleteMeal}
                    selectedDate={selectedDate}
                    onDateSelect={setSelectedDate}
                  />
                )}
                
                {activeTab === 'stats' && (
                  <MealStats
                    meals={mealManagement.meals}
                    mealPlans={mealManagement.mealPlans}
                    loading={mealManagement.loading}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Mobile Content Area */}
          <div className="lg:hidden">
            <div className="bg-SmartMess-light-surface dark:SmartMess-dark-surface dark:bg-SmartMess-light-surface dark:SmartMess-dark-surface rounded-xl border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border shadow-sm overflow-hidden">
              {activeTab === 'today' && (
                <TodaysMenu
                  meals={mealManagement.meals}
                  mealPlans={mealManagement.mealPlans}
                  tags={mealManagement.tags}
                  loading={mealManagement.loading}
                  onCreateMeal={mealManagement.createMeal}
                  onUpdateMeal={mealManagement.updateMeal}
                  onDeleteMeal={mealManagement.deleteMeal}
                  selectedDate={selectedDate}
                />
              )}
              
              {activeTab === 'weekly' && (
                <WeeklyMealPlanning
                  meals={mealManagement.meals}
                  mealPlans={mealManagement.mealPlans}
                  tags={mealManagement.tags}
                  loading={mealManagement.loading}
                  onCreateMeal={mealManagement.createMeal}
                  onUpdateMeal={mealManagement.updateMeal}
                  onDeleteMeal={mealManagement.deleteMeal}
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                />
              )}
              
              {activeTab === 'stats' && (
                <MealStats
                  meals={mealManagement.meals}
                  mealPlans={mealManagement.mealPlans}
                  loading={mealManagement.loading}
                />
              )}
            </div>
          </div>
          </div>
        </div>
      

      {/* Floating Add Menu Button - Mobile Only */}
      <button
        onClick={handleAddMenu}
        className="fixed bottom-28 right-4 lg:hidden z-[9999] w-14 h-14 bg-SmartMess-light-primary dark:SmartMess-dark-primary text-white rounded-full shadow-lg hover:bg-SmartMess-light-primary dark:SmartMess-dark-primary/90 transition-all duration-200 flex items-center justify-center"
        title="Add Menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
      
      {/* Add Meal Modal */}
      {showAddMealModal && (
        <AddMealModal
          isOpen={showAddMealModal}
          onClose={() => setShowAddMealModal(false)}
          onSubmit={mealManagement.createMeal}
          mealPlans={mealManagement.mealPlans}
          tags={mealManagement.tags}
          loading={mealManagement.loading}
          initialDate={selectedDate}
          initialMealType="breakfast"
        />
      )}
      
      <BottomNavigation
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        handleLogout={handleLogout}
      />
    </div>
  );
};

export { MealManagement };
