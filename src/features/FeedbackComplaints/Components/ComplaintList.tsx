import React, { useState } from 'react';
import { Complaint } from '../FeedbackComplaints.types';
import { getComplaintTypeName, getPriorityColor, formatDate } from '../FeedbackComplaints.utils';

interface ComplaintListProps {
  complaints: Complaint[];
  onResolve: (id: string) => Promise<void>;
  onRespond: (id: string, message: string) => Promise<void>;
}

const ComplaintList: React.FC<ComplaintListProps> = ({ complaints, onResolve, onRespond }) => {
  const [responseText, setResponseText] = useState<Record<string, string>>({});
  const [expandedComplaint, setExpandedComplaint] = useState<string | null>(null);
  const [loadingActions, setLoadingActions] = useState<Record<string, boolean>>({});

  const handleResponseChange = (id: string, text: string) => {
    setResponseText(prev => ({ ...prev, [id]: text }));
  };

  const handleSendResponse = async (id: string) => {
    if (responseText[id]?.trim()) {
      setLoadingActions(prev => ({ ...prev, [`respond-${id}`]: true }));
      try {
        await onRespond(id, responseText[id].trim());
        setResponseText(prev => ({ ...prev, [id]: '' }));
      } finally {
        setLoadingActions(prev => ({ ...prev, [`respond-${id}`]: false }));
      }
    }
  };

  const handleResolve = async (id: string) => {
    setLoadingActions(prev => ({ ...prev, [`resolve-${id}`]: true }));
    try {
      await onResolve(id);
    } finally {
      setLoadingActions(prev => ({ ...prev, [`resolve-${id}`]: false }));
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedComplaint(prev => prev === id ? null : id);
  };

  return (
    <div className="space-y-4">
      {complaints.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No complaints found.</p>
        </div>
      ) : (
        complaints.map((complaint) => (
          <div 
            key={complaint.id} 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700"
          >
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {getComplaintTypeName(complaint.complaintType || 'other')}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(complaint.priority || 'medium')}`}>
                      {complaint.priority || 'medium'}
                    </span>
                    {complaint.isResolved && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        Resolved
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    By {complaint.userName} on {formatDate(complaint.createdAt)}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <span 
                        key={i} 
                        className={`text-lg ${i < 3 ? 'text-yellow-400' : 'text-gray-300'}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <button 
                    onClick={() => toggleExpand(complaint.id)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    {expandedComplaint === complaint.id ? '▲' : '▼'}
                  </button>
                </div>
              </div>
              
              <p className="mt-3 text-gray-700 dark:text-gray-300">
                {complaint.description}
              </p>
              
              {expandedComplaint === complaint.id && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900 dark:text-white">Responses</h4>
                    {!complaint.isResolved && (
                      <button
                        onClick={() => handleResolve(complaint.id)}
                        disabled={loadingActions[`resolve-${complaint.id}`]}
                        className="px-3 py-1 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                      >
                        {loadingActions[`resolve-${complaint.id}`] ? 'Resolving...' : 'Mark as Resolved'}
                      </button>
                    )}
                  </div>
                  
                  {complaint.responses && complaint.responses.length > 0 ? (
                    <div className="space-y-3">
                      {complaint.responses.map((response) => (
                        <div key={response.id} className="bg-gray-50 dark:bg-gray-700 rounded-md p-3">
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {response.userName}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {formatDate(response.createdAt)}
                            </span>
                          </div>
                          <p className="mt-1 text-gray-700 dark:text-gray-300">
                            {response.comment}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 italic">
                      No responses yet.
                    </p>
                  )}
                  
                  {!complaint.isResolved && (
                    <div className="mt-4 flex space-x-2">
                      <input
                        type="text"
                        value={responseText[complaint.id] || ''}
                        onChange={(e) => handleResponseChange(complaint.id, e.target.value)}
                        placeholder="Type your response..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      <button
                        onClick={() => handleSendResponse(complaint.id)}
                        disabled={loadingActions[`respond-${complaint.id}`] || !responseText[complaint.id]?.trim()}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        {loadingActions[`respond-${complaint.id}`] ? 'Sending...' : 'Send'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ComplaintList;