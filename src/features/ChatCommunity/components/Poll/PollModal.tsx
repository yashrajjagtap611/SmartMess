import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Poll } from '../../types/chat.types';

interface CreatePollData {
  question: string;
  options: string[];
  expiresAt?: string;
}

interface PollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (pollData: CreatePollData) => void;
  poll?: Poll | null; // If provided, it's edit mode
  title?: string;
}

export const PollModal: React.FC<PollModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  poll = null,
  title = 'Create Poll'
}) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [expiresAt, setExpiresAt] = useState('');
  const [hasExpiry, setHasExpiry] = useState(false);

  // Initialize form when poll changes (for edit mode)
  useEffect(() => {
    if (poll) {
      setQuestion(poll.question);
      setOptions(poll.options.map(option => option.text));
      setExpiresAt(poll.expiresAt ? new Date(poll.expiresAt).toISOString().slice(0, 16) : '');
      setHasExpiry(!!poll.expiresAt);
    } else {
      // Reset form for create mode
      setQuestion('');
      setOptions(['', '']);
      setExpiresAt('');
      setHasExpiry(false);
    }
  }, [poll]);

  if (!isOpen) return null;

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validOptions = options.filter(opt => opt.trim() !== '');
    if (question.trim() === '' || validOptions.length < 2) {
      alert('Please provide a question and at least 2 options');
      return;
    }

    const pollData: CreatePollData = {
      question: question.trim(),
      options: validOptions,
      ...(hasExpiry && expiresAt ? { expiresAt } : {})
    };

    onSubmit(pollData);
    
    // Reset form
    setQuestion('');
    setOptions(['', '']);
    setExpiresAt('');
    setHasExpiry(false);
    onClose();
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const isEditMode = !!poll;

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto shadow-lg">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-card-foreground">{title}</h2>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-3 sm:p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Question
            </label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What would you like to ask?"
              className="w-full px-3 py-2 border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground placeholder:text-muted-foreground text-sm sm:text-base"
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {question.length}/200 characters
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Options
            </label>
            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="flex-1 px-3 py-2 border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground placeholder:text-muted-foreground text-sm sm:text-base"
                    maxLength={100}
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="p-2 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              
              {options.length < 10 && (
                <button
                  type="button"
                  onClick={addOption}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add option</span>
                </button>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {options.length}/10 options
            </p>
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={hasExpiry}
                onChange={(e) => setHasExpiry(e.target.checked)}
                className="rounded border-input"
              />
              <span className="text-sm font-medium text-card-foreground">
                Set expiry date
              </span>
            </label>
            
            {hasExpiry && (
              <div className="mt-2">
                <input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  min={getMinDate()}
                  className="w-full px-3 py-2 border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground text-sm sm:text-base"
                />
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-input text-foreground rounded-md hover:bg-accent transition-colors text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm sm:text-base"
            >
              {isEditMode ? 'Update Poll' : 'Create Poll'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
