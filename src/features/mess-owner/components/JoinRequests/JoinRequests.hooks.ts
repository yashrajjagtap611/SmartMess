import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import messService from '@/services/api/messService';
import type { JoinRequest } from '../UserManagement/UserManagement.types';

export const useJoinRequests = () => {
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch join requests
  const fetchJoinRequests = async () => {
    try {
      setLoading(true);
      const response = await messService.getNotifications();
      
      if (response.success && response.data) {
        // Filter for join_request type notifications
        const joinRequestNotifications = response.data.filter((notif: any) => 
          notif.type === 'join_request'
        );

        // Fetch meal plans to get plan names
        let mealPlansMap: Record<string, any> = {};
        try {
          const mealPlansResponse = await messService.getMealPlans();
          if (mealPlansResponse.success && mealPlansResponse.data) {
            mealPlansMap = (mealPlansResponse.data as any[]).reduce((acc, plan: any) => {
              acc[plan._id || plan.id] = plan;
              return acc;
            }, {} as Record<string, any>);
          }
        } catch (err) {
          console.error('Error fetching meal plans for join requests:', err);
        }

        // Transform notifications to JoinRequest format
        const transformedRequests: JoinRequest[] = joinRequestNotifications.map((notif: any) => {
          const requestingUserId = notif.data?.requestingUserId || notif.data?.userId;
          const mealPlanId = notif.data?.mealPlanId;
          const mealPlan = mealPlanId ? mealPlansMap[mealPlanId] : null;
          
          return {
            id: notif._id || notif.id,
            notificationId: notif._id || notif.id,
            userId: requestingUserId?.toString() || '',
            userName: notif.data?.requestingUserName || notif.data?.userName || notif.data?.name || 'Unknown User',
            userEmail: notif.data?.userEmail || notif.data?.email,
            userPhone: notif.data?.userPhone || notif.data?.phone,
            planName: mealPlan?.name || notif.data?.planName || notif.data?.plan || 'Unknown Plan',
            mealPlanId: mealPlanId?.toString(),
            paymentType: notif.data?.paymentType,
            amount: mealPlan?.pricing?.amount || notif.data?.amount,
            status: notif.status || 'pending',
            requestedAt: notif.createdAt || notif.updatedAt,
            message: notif.message,
            data: notif.data
          };
        });

        setJoinRequests(transformedRequests);
      }
    } catch (error: any) {
      console.error('Error fetching join requests:', error);
      toast.error('Failed to fetch join requests');
    } finally {
      setLoading(false);
    }
  };

  // Fetch join requests on mount
  useEffect(() => {
    fetchJoinRequests();
  }, []);

  // Handle approve join request
  const handleApproveJoinRequest = async (notificationId: string, remarks?: string) => {
    try {
      const response = await messService.handleJoinRequestAction(notificationId, 'approve', remarks);
      
      if (response.success) {
        // Update local state
        setJoinRequests(prev => 
          prev.map(req => 
            req.notificationId === notificationId 
              ? { ...req, status: 'approved' as const }
              : req
          )
        );
        
        toast.success('Join request approved successfully');
        // Refresh the list
        await fetchJoinRequests();
      } else {
        throw new Error(response.message || 'Failed to approve join request');
      }
    } catch (error: any) {
      console.error('Error approving join request:', error);
      // Re-throw to let the component handle it (e.g., show insufficient credits modal)
      throw error;
    }
  };

  // Handle reject join request
  const handleRejectJoinRequest = async (notificationId: string, remarks?: string) => {
    try {
      const response = await messService.handleJoinRequestAction(notificationId, 'reject', remarks);
      
      if (response.success) {
        // Update local state
        setJoinRequests(prev => 
          prev.map(req => 
            req.notificationId === notificationId 
              ? { ...req, status: 'rejected' as const }
              : req
          )
        );
        
        toast.success('Join request rejected');
        // Refresh the list
        await fetchJoinRequests();
      } else {
        throw new Error(response.message || 'Failed to reject join request');
      }
    } catch (error: any) {
      console.error('Error rejecting join request:', error);
      toast.error(error.message || 'Failed to reject join request');
      throw error;
    }
  };

  // Refresh join requests
  const refreshJoinRequests = async () => {
    await fetchJoinRequests();
  };

  return {
    joinRequests,
    loading,
    handleApproveJoinRequest,
    handleRejectJoinRequest,
    refreshJoinRequests,
  };
};

