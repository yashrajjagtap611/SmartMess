import React, { useState } from 'react';
import { CheckCircle, Users, Clock, Edit, Trash2, X } from 'lucide-react';
import { useAuth } from '../../../../contexts/AuthContext';

interface PollOption {
  id: string;
  text: string;
  votes: number;
  voters: string[];
}

interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  createdBy: string;
  createdAt: string;
  expiresAt?: string;
  isActive: boolean;
  totalVotes: number;
}

interface PollProps {
  poll: Poll;
  onVote: (pollId: string, optionId: string) => void;
  canCreatePolls?: boolean;
  onClose?: (pollId: string) => void;
  onEdit?: (pollId: string) => void;
  onDelete?: (pollId: string) => void;
}

export const Poll: React.FC<PollProps> = ({ poll, onVote, canCreatePolls = false, onClose, onEdit, onDelete }) => {
  const { user } = useAuth();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);


  const hasUserVoted = poll.options.some(option => 
    option.voters.includes(user?.id || '')
  );

  const userVotedOption = poll.options.find(option => 
    option.voters.includes(user?.id || '')
  );

  const handleVote = (optionId: string) => {
    if (!poll.isActive) return;
    
    // Allow voting or changing vote
    setSelectedOption(optionId);
    onVote(poll.id, optionId);
  };

  const getPercentage = (votes: number) => {
    if (poll.totalVotes === 0) return 0;
    return Math.round((votes / poll.totalVotes) * 100);
  };

  const isExpired = poll.expiresAt ? new Date(poll.expiresAt) < new Date() : false;
  const isPollActive = poll.isActive && !isExpired;

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          <h3 className="font-semibold text-card-foreground text-base sm:text-lg break-words">{poll.question}</h3>
        </div>
        {canCreatePolls && (
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            {onEdit && (
              <button
                onClick={() => onEdit(poll.id)}
                className="p-2 sm:p-1 text-muted-foreground hover:text-primary transition-colors rounded hover:bg-primary/10"
                title="Edit Poll"
              >
                <Edit className="w-5 h-5 sm:w-4 sm:h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(poll.id)}
                className="p-2 sm:p-1 text-muted-foreground hover:text-destructive transition-colors rounded hover:bg-destructive/10"
                title="Delete Poll"
              >
                <Trash2 className="w-5 h-5 sm:w-4 sm:h-4" />
              </button>
            )}
            {onClose && poll.isActive && (
              <button
                onClick={() => onClose(poll.id)}
                className="p-2 sm:p-1 text-muted-foreground hover:text-foreground transition-colors rounded hover:bg-muted"
                title="Close Poll"
              >
                <X className="w-5 h-5 sm:w-4 sm:h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="mb-4">
        {poll.expiresAt && (
          <div className="flex items-center space-x-1 text-xs text-muted-foreground mb-3">
            <Clock className="w-3 h-3" />
            <span>
              {isExpired ? 'Expired' : `Expires ${new Date(poll.expiresAt).toLocaleDateString()}`}
            </span>
          </div>
        )}
      </div>

      <div className="space-y-3 sm:space-y-2 mb-4">
        {poll.options.map((option) => {
          const percentage = getPercentage(option.votes);
          const isUserVoted = userVotedOption?.id === option.id;
          const isSelected = selectedOption === option.id;

          return (
            <div
              key={option.id}
              className={`relative rounded-lg border transition-all duration-200 ${
                isUserVoted
                  ? 'border-primary bg-primary/5 hover:bg-primary/10 cursor-pointer'
                  : isPollActive
                  ? 'border-input hover:border-primary/50 cursor-pointer'
                  : 'border-muted bg-muted/30'
              }`}
              onClick={() => handleVote(option.id)}
            >
              <div className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                  <span className="text-base sm:text-sm text-card-foreground break-words flex-1">{option.text}</span>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    {isUserVoted && (
                      <CheckCircle className="w-4 h-4 text-primary" />
                    )}
                    <span className="text-xs text-muted-foreground">
                      {percentage}%
                    </span>
                  </div>
                </div>
                
                <div className="w-full bg-muted rounded-full h-3 sm:h-2">
                  <div
                    className={`h-3 sm:h-2 rounded-full transition-all duration-300 ${
                      isUserVoted ? 'bg-primary' : 'bg-muted-foreground/30'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mt-2">
                  <span className="text-sm sm:text-xs text-muted-foreground">
                    {option.votes} vote{option.votes !== 1 ? 's' : ''}
                  </span>
                  {isSelected && !hasUserVoted && (
                    <span className="text-sm sm:text-xs text-primary">Voting...</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm sm:text-xs text-muted-foreground">
        <div className="flex items-center space-x-1 flex-wrap">
          <Users className="w-4 h-4 sm:w-3 sm:h-3 flex-shrink-0" />
          <span>{poll.totalVotes} total vote{poll.totalVotes !== 1 ? 's' : ''}</span>
          {hasUserVoted && isPollActive && (
            <span className="text-primary ml-2 hidden sm:inline">• Click to change vote</span>
          )}
        </div>
        <div className="flex items-center justify-between sm:justify-end">
          {hasUserVoted && isPollActive && (
            <span className="text-primary text-sm sm:text-xs sm:hidden">Click to change vote</span>
          )}
          <span className="text-sm sm:text-xs">
            {isPollActive ? 'Active' : isExpired ? 'Expired' : 'Closed'}
          </span>
        </div>
      </div>
    </div>
  );
};
