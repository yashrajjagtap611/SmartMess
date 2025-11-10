import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ComplaintFormData } from '../FeedbackComplaints.types';

interface ComplaintFormProps {
  onSubmit: (data: ComplaintFormData) => Promise<void>;
  onCancel: () => void;
  messId: string;
}

const ComplaintForm: React.FC<ComplaintFormProps> = ({ onSubmit, onCancel, messId }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ComplaintFormData>({
    messId,
    complaintType: 'other',
    priority: 'medium',
    title: '',
    description: '',
    incidentDate: new Date(),
  });
  
  const [dateString, setDateString] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'mealDate') {
      setDateString(value);
      setFormData(prev => ({
        ...prev,
        [name]: new Date(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'rating' ? parseInt(value) : value
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors['title'] = 'Complaint title is required';
    } else if (formData.title.trim().length < 5) {
      newErrors['title'] = 'Title must be at least 5 characters long';
    }
    
    if (!formData.description.trim()) {
      newErrors['description'] = 'Description is required';
    } else if (formData.description.trim().length < 20) {
      newErrors['description'] = 'Description must be at least 20 characters long';
    }
    
    if (!formData.priority) {
      newErrors['priority'] = 'Please select a priority level';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      await onSubmit(formData);
      toast({
        title: 'Success',
        description: 'Your complaint has been submitted successfully.',
      });
      onCancel(); // Close the form after successful submission
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit complaint',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-SmartMess-light-surface dark:bg-SmartMess-dark-surface rounded-lg shadow-md p-6 border border-SmartMess-light-border dark:border-SmartMess-dark-border transition-all duration-300">
      <h2 className="text-xl font-bold mb-4 text-SmartMess-light-text dark:text-SmartMess-dark-text">Submit a Complaint</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-SmartMess-light-text-secondary dark:text-SmartMess-dark-text-secondary mb-1">
            Complaint Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-SmartMess-primary focus:border-SmartMess-primary dark:bg-SmartMess-dark-input-bg dark:border-SmartMess-dark-border dark:text-SmartMess-dark-text transition-all duration-200 ${
              errors['title'] ? 'border-SmartMess-light-error' : 'border-SmartMess-light-border'
            }`}
            placeholder="Brief summary of your complaint"
            required
          />
          {errors['title'] && (
            <p className="mt-1 text-sm text-SmartMess-light-error dark:text-SmartMess-dark-error">{errors['title']}</p>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-SmartMess-light-text-secondary dark:text-SmartMess-dark-text-secondary mb-1">
              Complaint Type
            </label>
            <select
              name="complaintType"
              value={formData.complaintType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-SmartMess-light-border rounded-md shadow-sm focus:outline-none focus:ring-SmartMess-primary focus:border-SmartMess-primary dark:bg-SmartMess-dark-input-bg dark:border-SmartMess-dark-border dark:text-SmartMess-dark-text transition-all duration-200"
              required
            >
              <option value="service">Service Issue</option>
              <option value="food_quality">Food Quality</option>
              <option value="hygiene">Hygiene</option>
              <option value="staff_behavior">Staff Behavior</option>
              <option value="billing">Billing</option>
              <option value="facility">Facility Issue</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-SmartMess-light-text-secondary dark:text-SmartMess-dark-text-secondary mb-1">
              Priority Level
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-SmartMess-primary focus:border-SmartMess-primary dark:bg-SmartMess-dark-input-bg dark:border-SmartMess-dark-border dark:text-SmartMess-dark-text transition-all duration-200 ${
                errors['priority'] ? 'border-SmartMess-light-error' : 'border-SmartMess-light-border'
              }`}
              required
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
            {errors['priority'] && (
              <p className="mt-1 text-sm text-SmartMess-light-error dark:text-SmartMess-dark-error">{errors['priority']}</p>
            )}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-SmartMess-light-text-secondary dark:text-SmartMess-dark-text-secondary mb-1">
            Incident Date (Optional)
          </label>
          <input
            type="date"
            name="incidentDate"
            value={dateString}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-SmartMess-light-border rounded-md shadow-sm focus:outline-none focus:ring-SmartMess-primary focus:border-SmartMess-primary dark:bg-SmartMess-dark-input-bg dark:border-SmartMess-dark-border dark:text-SmartMess-dark-text transition-all duration-200"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-SmartMess-light-text-secondary dark:text-SmartMess-dark-text-secondary mb-1">
            Detailed Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={5}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-SmartMess-primary focus:border-SmartMess-primary dark:bg-SmartMess-dark-input-bg dark:border-SmartMess-dark-border dark:text-SmartMess-dark-text transition-all duration-200 ${
              errors['description'] ? 'border-SmartMess-light-error' : 'border-SmartMess-light-border'
            }`}
            placeholder="Please provide a detailed description of your complaint, including what happened, when it occurred, and any other relevant information..."
            required
          />
          {errors['description'] && (
            <p className="mt-1 text-sm text-SmartMess-light-error dark:text-SmartMess-dark-error">{errors['description']}</p>
          )}
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-SmartMess-light-text-secondary bg-SmartMess-light-secondary rounded-md hover:bg-SmartMess-light-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-SmartMess-primary dark:bg-SmartMess-dark-secondary dark:text-SmartMess-dark-text dark:hover:bg-SmartMess-dark-hover transition-all duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-SmartMess-primary-foreground bg-SmartMess-primary rounded-md hover:bg-SmartMess-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-SmartMess-primary disabled:opacity-50 transition-all duration-200"
          >
            {loading ? 'Submitting...' : 'Submit Complaint'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ComplaintForm;