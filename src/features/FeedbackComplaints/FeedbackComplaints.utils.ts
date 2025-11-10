export const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getComplaintTypeIcon = (type: string) => {
  switch (type) {
    case 'service':
      return '🔧';
    case 'food_quality':
      return '🍽️';
    case 'hygiene':
      return '🧼';
    case 'staff_behavior':
      return '👤';
    case 'billing':
      return '💰';
    case 'other':
      return '❓';
    default:
      return '📝';
  }
};

export const getComplaintTypeName = (type: string) => {
  switch (type) {
    case 'service':
      return 'Service Issue';
    case 'food_quality':
      return 'Food Quality';
    case 'hygiene':
      return 'Hygiene';
    case 'staff_behavior':
      return 'Staff Behavior';
    case 'billing':
      return 'Billing';
    case 'other':
      return 'Other';
    default:
      return 'General';
  }
};

export const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatTimeAgo = (date: Date) => {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) {
    return Math.floor(interval) + ' years ago';
  }
  
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + ' months ago';
  }
  
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + ' days ago';
  }
  
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + ' hours ago';
  }
  
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + ' minutes ago';
  }
  
  return Math.floor(seconds) + ' seconds ago';
};

export const getSentimentColor = (sentiment: string) => {
  switch (sentiment) {
    case 'positive':
      return 'text-green-600';
    case 'negative':
      return 'text-red-600';
    case 'neutral':
      return 'text-gray-600';
    default:
      return 'text-gray-600';
  }
};
