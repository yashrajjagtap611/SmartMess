import { useState } from 'react';
import { FeedbackService } from '@/services/feedbackService';
import { MealFeedback } from '@/types/feedback';
import { Complaint, FeedbackFilterOptions, ComplaintStatistics } from './FeedbackComplaints.types';

export const useFeedbackComplaints = () => {
  const [feedback, setFeedback] = useState<MealFeedback[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ComplaintStatistics | null>(null);

  const fetchFeedback = async (filters: FeedbackFilterOptions = {}) => {
    try {
      setLoading(true);
      const result = await FeedbackService.getFeedback(filters);
      setFeedback(result.feedback);
      // For now, we'll treat all feedback as complaints in the UI
      // Map MealFeedback to Complaint format
      const mappedComplaints: Complaint[] = result.feedback.map((feedback) => ({
        id: feedback.id,
        userId: feedback.userId,
        userName: feedback.userName,
        userEmail: '', // MealFeedback doesn't have email
        messId: '', // MealFeedback doesn't have messId
        messName: '', // MealFeedback doesn't have messName
        complaintType: 'other' as const,
        priority: 'medium' as const,
        title: feedback.comment.substring(0, 50) || 'Feedback',
        description: feedback.comment,
        isResolved: feedback.isResolved || false,
        isEscalated: false,
        createdAt: feedback.createdAt,
        updatedAt: feedback.createdAt,
        responses: feedback.responses?.map((r) => ({
          id: r.id,
          userId: r.userId,
          userName: r.userName,
          comment: r.comment,
          createdAt: r.createdAt,
          isFromMessOwner: false // Default to false, would need backend to determine
        })) || []
      }));
      setComplaints(mappedComplaints);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch feedback');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // In a real implementation, we would have a separate stats endpoint for complaints
      // For now, we'll use the existing feedback stats
      const feedbackStats = await FeedbackService.getFeedbackStats();
      setStats({
        totalComplaints: feedbackStats.totalFeedback,
        resolvedComplaints: feedbackStats.totalFeedback - feedbackStats.unresolvedCount,
        unresolvedComplaints: feedbackStats.unresolvedCount,
        escalatedComplaints: 0, // Would need backend support
        averageResolutionTime: 0, // Would need backend support
        complaintTypeDistribution: [], // Would need backend support
        priorityDistribution: [], // Would need backend support
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch statistics');
    }
  };

  const createComplaint = async (data: any) => {
    try {
      setLoading(true);
      const result = await FeedbackService.createFeedback(data);
      // Add the new complaint to the list
      // Map MealFeedback to Complaint format
      const mappedComplaint: Complaint = {
        id: result.id,
        userId: result.userId,
        userName: result.userName,
        userEmail: '',
        messId: '',
        messName: '',
        complaintType: 'other' as const,
        priority: 'medium' as const,
        title: result.comment.substring(0, 50) || 'Feedback',
        description: result.comment,
        isResolved: result.isResolved || false,
        isEscalated: false,
        createdAt: result.createdAt,
        updatedAt: result.createdAt,
        responses: result.responses?.map((r) => ({
          id: r.id,
          userId: r.userId,
          userName: r.userName,
          comment: r.comment,
          createdAt: r.createdAt,
          isFromMessOwner: false
        })) || []
      };
      setComplaints(prev => [mappedComplaint, ...prev]);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create complaint');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const respondToComplaint = async (feedbackId: string, message: string) => {
    try {
      setLoading(true);
      await FeedbackService.respondToFeedback(feedbackId, message);
      // Update the complaint with the new response
      setComplaints(prev => 
        prev.map(complaint => 
          complaint.id === feedbackId 
            ? { 
                ...complaint, 
                responses: complaint.responses 
                  ? [...complaint.responses, { 
                      id: Date.now().toString(), 
                      userId: 'current-user-id', 
                      userName: 'Current User', 
                      comment: message, 
                      createdAt: new Date(),
                      isFromMessOwner: false
                    }] 
                  : [{
                      id: Date.now().toString(), 
                      userId: 'current-user-id', 
                      userName: 'Current User', 
                      comment: message, 
                      createdAt: new Date(),
                      isFromMessOwner: false
                    }]
              } 
            : complaint
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to respond to complaint');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resolveComplaint = async (feedbackId: string) => {
    try {
      setLoading(true);
      await FeedbackService.resolveFeedback(feedbackId);
      // Mark the complaint as resolved
      setComplaints(prev => 
        prev.map(complaint => 
          complaint.id === feedbackId 
            ? { ...complaint, isResolved: true } 
            : complaint
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve complaint');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    feedback,
    complaints,
    loading,
    error,
    stats,
    fetchFeedback,
    fetchStats,
    createComplaint,
    respondToComplaint,
    resolveComplaint
  };
};