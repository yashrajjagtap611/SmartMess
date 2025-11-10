import React, { useState, useEffect } from 'react';
import { useFeedbackComplaints } from './FeedbackComplaints.hooks';
import ComplaintForm from './Components/ComplaintForm';
import ComplaintList from './Components/ComplaintList';
import ComplaintStats from './Components/ComplaintStats';
import ComplaintFilters from './Components/ComplaintFilters';
import { FeedbackFilterOptions } from './FeedbackComplaints.types';

const FeedbackComplaints: React.FC = () => {
  const {
    complaints,
    loading,
    error,
    stats,
    fetchFeedback,
    fetchStats,
    createComplaint,
    respondToComplaint,
    resolveComplaint
  } = useFeedbackComplaints();
  
  const [showForm, setShowForm] = useState(false);
  // This would come from context in a real app
  const messId = 'mess-123';

  useEffect(() => {
    fetchFeedback();
    fetchStats();
  }, []);

  const handleFilterChange = (filters: FeedbackFilterOptions) => {
    fetchFeedback(filters);
  };

  const handleCreateComplaint = async (data: any) => {
    await createComplaint(data);
    // Refresh the list after creating a new complaint
    fetchFeedback();
  };

  return (
    <div className="min-h-screen bg-SmartMess-light-bg dark:bg-SmartMess-dark-bg transition-all duration-300">
      {/* Header */}
      <header className="sticky top-0 left-0 right-0 z-10 w-full flex items-center px-4 py-3 backdrop-blur-md bg-SmartMess-light-surface/80 dark:bg-SmartMess-dark-surface/80 border-b border-SmartMess-light-border dark:border-SmartMess-dark-border transition-all duration-300">
        <div className="flex items-center justify-center w-full lg:hidden">
          <h1 className="text-xl md:text-2xl font-bold text-center text-SmartMess-light-text dark:text-SmartMess-dark-text">
            Feedback & Complaints
          </h1>
        </div>
        <div className="hidden lg:flex items-center justify-between w-full">
          <div className="flex items-center space-x-6 px-6">
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-SmartMess-light-text dark:text-SmartMess-dark-text">
                Feedback & Complaints
              </h1>
              <p className="text-sm text-SmartMess-light-text-secondary dark:text-SmartMess-dark-text-secondary">
                Manage your feedback and complaints
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3 pr-6">
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 text-sm font-medium text-SmartMess-primary-foreground bg-SmartMess-primary rounded-md hover:bg-SmartMess-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-SmartMess-primary transition-all duration-200"
            >
              New Complaint
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Header Actions */}
      <div className="lg:hidden p-4 bg-SmartMess-light-surface dark:bg-SmartMess-dark-surface border-b border-SmartMess-light-border dark:border-SmartMess-dark-border transition-all duration-300">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-SmartMess-light-text dark:text-SmartMess-dark-text">
            Feedback & Complaints
          </h2>
          <button
            onClick={() => setShowForm(true)}
            className="px-3 py-1.5 text-sm font-medium text-SmartMess-primary-foreground bg-SmartMess-primary rounded-md hover:bg-SmartMess-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-SmartMess-primary transition-all duration-200"
          >
            New
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {showForm ? (
          <ComplaintForm 
            onSubmit={handleCreateComplaint}
            onCancel={() => setShowForm(false)}
            messId={messId}
          />
        ) : (
          <>
            <ComplaintStats stats={stats} />
            
            <ComplaintFilters onFilterChange={handleFilterChange} />
            
            {error && (
              <div className="bg-SmartMess-light-error/10 dark:bg-SmartMess-dark-error/20 border border-SmartMess-light-error/30 dark:border-SmartMess-dark-error/50 rounded-md p-4 mb-6">
                <p className="text-SmartMess-light-error dark:text-SmartMess-dark-error">{error}</p>
              </div>
            )}
            
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-SmartMess-primary"></div>
                  <p className="text-SmartMess-light-text-secondary dark:text-SmartMess-dark-text-secondary">Loading complaints...</p>
                </div>
              </div>
            ) : (
              <ComplaintList 
                complaints={complaints}
                onResolve={async (id: string) => {
                  await resolveComplaint(id);
                  fetchFeedback();
                }}
                onRespond={async (id: string, message: string) => {
                  await respondToComplaint(id, message);
                }}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default FeedbackComplaints;