export interface Complaint {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  messId: string;
  messName: string;
  complaintType: 'service' | 'food_quality' | 'hygiene' | 'staff_behavior' | 'billing' | 'facility' | 'other';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  isResolved: boolean;
  isEscalated: boolean;
  assignedTo?: string;
  resolvedBy?: string;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  images?: string[];
  responses?: ComplaintResponse[];
}

export interface ComplaintResponse {
  id: string;
  userId: string;
  userName: string;
  comment: string;
  createdAt: Date;
  isFromMessOwner: boolean;
}

export interface ComplaintFormData {
  messId: string;
  complaintType: 'service' | 'food_quality' | 'hygiene' | 'staff_behavior' | 'billing' | 'facility' | 'other';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  incidentDate?: Date;
}

export interface FeedbackFilterOptions {
  dateRange?: 'today' | 'week' | 'month';
  rating?: number | 'all';
  search?: string;
  complaintType?: 'service' | 'food_quality' | 'hygiene' | 'staff_behavior' | 'billing' | 'other' | 'all';
  priority?: 'low' | 'medium' | 'high' | 'all';
  isResolved?: boolean;
  isEscalated?: boolean;
}

export interface ComplaintStatistics {
  totalComplaints: number;
  resolvedComplaints: number;
  unresolvedComplaints: number;
  escalatedComplaints: number;
  averageResolutionTime: number;
  complaintTypeDistribution: Array<{ type: string; count: number }>;
  priorityDistribution: Array<{ priority: string; count: number }>;
}