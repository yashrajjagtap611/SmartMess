import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import messService from '@/services/api/messService';
import { ROUTES } from '@/constants/routes';
import type { User, FilterOption, ViewMode } from './UserManagement.types';

export const useUserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [isMobile, setIsMobile] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [scrollbarPosition] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isUserDetailModalOpen, setIsUserDetailModalOpen] = useState(false);

  // Refs
  const userListRef = useRef<HTMLDivElement>(null);
  const tableBodyRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch users from backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await messService.getMessMembers();
        
        if (response.success && response.data) {
          // Transform backend data to match frontend interface
          const transformedUsers = response.data.map((user: any) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            plan: user.plan,
            meals: user.meals,
            paymentStatus: user.paymentStatus,
            paymentAmount: user.paymentAmount,
            isActive: user.isActive,
            joinDate: user.joinDate,
            subscriptionStartDate: user.subscriptionStartDate,
            subscriptionEndDate: user.subscriptionEndDate,
            lastPaymentDate: user.lastPaymentDate,
            nextPaymentDate: user.nextPaymentDate,
            totalPlans: user.totalPlans,
            totalMonthlyAmount: user.totalMonthlyAmount,
            totalPaid: user.totalPaid || 0,
            lastActive: user.lastActive || user.joinDate,
            phone: user.phone,
            paymentHistory: user.paymentHistory || [],
            planHistory: user.planHistory || [],
            leaves: user.leaves || [],
            emergencyContact: user.emergencyContact,
            preferences: user.preferences,
            address: user.address,
            mealPlanDetails: user.mealPlanDetails || []
          }));
          
          // Sort users alphabetically by name
          const sortedUsers = transformedUsers.sort((a: any, b: any) => 
            a.name.toLowerCase().localeCompare(b.name.toLowerCase())
          );
          
          setUsers(sortedUsers);
        } else {
          setError(response.message || 'Failed to fetch users');
          toast.error(response.message || 'Failed to fetch users');
        }
      } catch (err: any) {
        const errorMessage = err?.message || 'Failed to fetch users';
        // Gracefully handle missing mess profile for this user (backend returns 404)
        if (typeof errorMessage === 'string' && errorMessage.includes('No mess profile found for this user')) {
          setUsers([]);
          setError(null);
          toast.info('Create your Mess Profile to start managing members.');
        } else {
          setError(errorMessage);
          toast.error(errorMessage);
          console.error('Error fetching users:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter users based on search and filter criteria
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    switch (selectedFilter) {
      case 'active':
        return user.isActive;
      case 'inactive':
        return !user.isActive;
      case 'pending':
        return user.paymentStatus === 'Pending';
      case 'overdue':
        return user.paymentStatus === 'Overdue';
      default:
        return true;
    }
  });

  // Group users by first letter
  const groupedUsers = filteredUsers.reduce((acc, user) => {
    const firstLetter = user.name.charAt(0).toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(user);
    return acc;
  }, {} as Record<string, User[]>);

  // Handle letter selection
  const handleLetterSelect = (letter: string) => {
    console.log('Letter selected:', letter);
    setSelectedLetter(letter);
    setIsScrolling(true);
    
    // Find the first user with this letter
    const usersWithLetter = groupedUsers[letter];
    
    if (usersWithLetter && usersWithLetter.length > 0) {
      // Wait for next tick to ensure DOM is updated
      setTimeout(() => {
        // Check if we're in table view - use viewMode as primary indicator
        const isTableMode = viewMode === 'table';
        
        // Use different ID formats for cards vs table rows
        const firstUser = usersWithLetter[0];
        if (!firstUser) return;
        const elementId = isTableMode ? `table-user-${firstUser.id}` : `card-user-${firstUser.id}`;
        const userElement = document.getElementById(elementId);
        
        console.log(`Looking for ${isTableMode ? 'table' : 'card'} element with ID:`, elementId);
        
        if (userElement) {
          // For table detection, primarily rely on viewMode since Tailwind classes can be complex
          const isTable = isTableMode;
          
          console.log(`Found element, using ${isTable ? 'table' : 'card'} scrolling`);
          
          if (isTable) {
            // Use table-specific scrolling
            scrollToTableRow(userElement);
          } else {
            // Use card-specific scrolling
            scrollToCard(userElement);
          }
          
          // Add a subtle flash effect for better visibility
          userElement.style.animation = 'flash-highlight 0.5s ease-in-out';
          setTimeout(() => {
            userElement.style.animation = '';
          }, 500);
        } else {
          console.error('User element not found for ID:', elementId);
        }
      }, 300);
    } else {
      console.log('No users found with letter:', letter);
    }
    
    // Reset scrolling state after animation
    setTimeout(() => setIsScrolling(false), 1500);
  };

  // Handle user click to navigate to detail page
  const handleUserClick = (user: User) => {
    // Navigate to user details page instead of opening modal
    navigate(ROUTES.MESS_OWNER.USER_DETAILS.replace(':userId', user.id));
  };

  // User management actions
  const handleUpdateUserStatus = async (userId: string, isActive: boolean) => {
    try {
      // Call API to update user status
      const response = await messService.updateUserStatus(userId, isActive);
      
      if (response.success) {
        // Update local state
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === userId ? { ...user, isActive } : user
          )
        );
        
        // Update selected user if it's the same user
        if (selectedUser?.id === userId) {
          setSelectedUser(prev => prev ? { ...prev, isActive } : null);
        }
        
        toast.success(`User ${isActive ? 'activated' : 'deactivated'} successfully`);
      } else {
        throw new Error(response.message || 'Failed to update user status');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
      throw error;
    }
  };

  const handleUpdatePaymentStatus = async (userId: string, paymentStatus: User['paymentStatus']) => {
    try {
      // Call API to update payment status
      const response = await messService.updateUserPaymentStatus(userId, paymentStatus);
      
      if (response.success) {
        // Update local state
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === userId ? { ...user, paymentStatus } : user
          )
        );
        
        // Update selected user if it's the same user
        if (selectedUser?.id === userId) {
          setSelectedUser(prev => prev ? { ...prev, paymentStatus } : null);
        }
        
        toast.success('Payment status updated successfully');
      } else {
        throw new Error(response.message || 'Failed to update payment status');
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Failed to update payment status');
      throw error;
    }
  };

  const handleUpdateUserPlan = async (userId: string, plan: User['plan']) => {
    try {
      // For now, we'll just update the local state since plan updates require more complex logic
      // In a real implementation, you would call an API to update the user's meal plans
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, plan } : user
        )
      );
      
      // Update selected user if it's the same user
      if (selectedUser?.id === userId) {
        setSelectedUser(prev => prev ? { ...prev, plan } : null);
      }
      
      toast.success('User plan updated successfully');
    } catch (error) {
      console.error('Error updating user plan:', error);
      toast.error('Failed to update user plan');
      throw error;
    }
  };

  const handleRemoveUser = async (userId: string) => {
    try {
      // Call API to remove user
      const response = await messService.removeUser(userId);
      
      if (response.success) {
        // Remove user from local state
        setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
        
        // Close modal if the removed user was selected
        if (selectedUser?.id === userId) {
          setSelectedUser(null);
          setIsUserDetailModalOpen(false);
        }
        
        toast.success('User removed successfully');
      } else {
        throw new Error(response.message || 'Failed to remove user');
      }
    } catch (error) {
      console.error('Error removing user:', error);
      throw error;
    }
  };

  // Function to scroll to table row
  const scrollToTableRow = (userElement: HTMLElement) => {
    // Use the dedicated table body ref, with fallback to ID
    const tableBodyScrollable = tableBodyRef.current || document.getElementById('table-body-scrollable');
    
    if (tableBodyScrollable) {
      // Get the position of the element relative to the scrollable container
      const elementTop = userElement.offsetTop;
      const containerHeight = tableBodyScrollable.clientHeight;
      const elementHeight = userElement.offsetHeight;
      
      // Calculate scroll position to center the element
      const scrollTop = elementTop - (containerHeight / 2) + (elementHeight / 2);
      
      console.log('Table scrolling:', {
        elementTop,
        containerHeight,
        elementHeight,
        scrollTop,
        currentScrollTop: tableBodyScrollable.scrollTop,
        usingTableRef: !!tableBodyRef.current,
        usingFallback: !tableBodyRef.current
      });
      
      // Scroll to the calculated position
      tableBodyScrollable.scrollTo({
        top: Math.max(0, scrollTop),
        behavior: 'smooth'
      });
      
      // Add a fallback check to ensure the element is visible
      setTimeout(() => {
        const rect = userElement.getBoundingClientRect();
        const containerRect = tableBodyScrollable.getBoundingClientRect();
        
        // Check if element is visible in the container
        const isVisible = rect.top >= containerRect.top && rect.bottom <= containerRect.bottom;
        
        if (!isVisible) {
          console.log('Element not visible after scroll, using scrollIntoView fallback');
          userElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
          });
        }
      }, 500);
    } else {
      console.error('Table body scrollable container not found - both ref and ID failed');
    }
  };

  // Function to scroll to card
  const scrollToCard = (userElement: HTMLElement) => {
    // For cards view, use scrollIntoView with proper options
    userElement.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest'
    });
  };

  return {
    // State
    users,
    loading,
    error,
    searchQuery,
    selectedFilter,
    viewMode,
    isMobile,
    selectedLetter,
    scrollbarPosition,
    isScrolling,
    isFilterModalOpen,
    showSearch,
    filteredUsers,
    groupedUsers,
    selectedUser,
    isUserDetailModalOpen,
    
    // Refs
    userListRef,
    tableBodyRef,
    headerRef,
    
    // Actions
    setSearchQuery,
    setSelectedFilter,
    setViewMode,
    setSelectedLetter,
    setIsFilterModalOpen,
    setShowSearch,
    handleLetterSelect,
    handleUserClick,
    setIsUserDetailModalOpen,
    handleUpdateUserStatus,
    handleUpdatePaymentStatus,
    handleRemoveUser,
    handleUpdateUserPlan,
  };
};
