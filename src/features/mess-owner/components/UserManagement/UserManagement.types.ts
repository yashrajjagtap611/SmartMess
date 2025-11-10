export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  plan: string; // Changed from union type to string to support "Multiple Plans"
  meals: number;
  paymentStatus: 'Paid' | 'Pending' | 'Overdue';
  paymentAmount?: number;
  isActive: boolean;
  // New fields for multiple meal plans
  totalPlans?: number;
  totalMonthlyAmount?: number;
  mealPlanDetails?: MealPlanDetail[];
  // Enhanced fields for detailed view
  phone?: string;
  joinDate?: string;
  lastActive?: string;
  totalPaid?: number;
  paymentHistory?: PaymentRecord[];
  planHistory?: PlanRecord[];
  leaves?: LeaveRecord[];
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
  preferences?: {
    dietary?: string[];
    allergies?: string[];
  };
  address?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
}

// Additional interfaces for enhanced features
export interface PaymentRecord {
  id: string;
  amount: number;
  date: string;
  status: 'Paid' | 'Pending' | 'Failed';
  method: string;
  description?: string;
}

export interface PlanRecord {
  id: string;
  plan: User['plan'];
  startDate: string;
  endDate?: string;
  isActive: boolean;
}

export interface LeaveRecord {
  id: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  appliedDate: string;
}

export interface MealPlanDetail {
  id: string;
  name: string;
  description: string;
  pricing?: {
    amount: number;
    period: string;
  };
  status: string;
  paymentStatus: string;
}

export type FilterOption = 'all' | 'active' | 'inactive' | 'pending' | 'overdue';

export type ViewMode = 'cards' | 'table';

export interface FilterOptionConfig {
  id: FilterOption;
  title: string;
  description: string;
  icon: any;
  selected: boolean;
}

export interface UserCardProps {
  user: User;
  index: number;
  isSelected?: boolean;
  isScrolling?: boolean;
  selectedLetter?: string | null;
  onUserClick?: (user: User) => void;
}

export interface UserTableRowProps {
  user: User;
  index: number;
  isScrolling?: boolean;
  selectedLetter?: string | null;
  onUserClick?: (user: User) => void;
}

export interface AlphabetScrollProps {
  alphabet: string[];
  groupedUsers: Record<string, User[]>;
  selectedLetter: string | null;
  onLetterSelect: (letter: string) => void;
  scrollbarPosition: number;
  isMobile?: boolean;
}

export interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFilter: FilterOption;
  onFilterChange: (filter: FilterOption) => void;
  filterOptions: FilterOptionConfig[];
}

export interface SearchHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  showSearch: boolean;
  onToggleSearch: () => void;
  onFilterClick: () => void;
}

export interface ViewModeToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  isMobile: boolean;
}

export interface FilterSummaryProps {
  selectedFilter: FilterOption;
  onClearFilter: () => void;
  filterOptions: FilterOptionConfig[];
}

export interface JoinRequest {
  id: string;
  notificationId: string;
  userId: string;
  userName: string;
  userEmail?: string;
  userPhone?: string;
  planName?: string;
  mealPlanId?: string;
  paymentType?: 'pay_now' | 'pay_later';
  amount?: number;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt?: string | Date;
  message?: string;
  data?: any;
}

export interface UserManagementViewProps {
  // State
  users: User[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  selectedFilter: FilterOption;
  viewMode: ViewMode;
  isMobile: boolean;
  selectedLetter: string | null;
  scrollbarPosition: number;
  isScrolling: boolean;
  isFilterModalOpen: boolean;
  showSearch: boolean;
  filteredUsers: User[];
  groupedUsers: Record<string, User[]>;
  selectedUser: User | null;
  isUserDetailModalOpen: boolean;
  
  // Refs
  userListRef: React.RefObject<HTMLDivElement>;
  tableBodyRef: React.RefObject<HTMLDivElement>;
  headerRef: React.RefObject<HTMLDivElement>;
  
  // Actions
  setSearchQuery: (query: string) => void;
  setSelectedFilter: (filter: FilterOption) => void;
  setViewMode: (mode: ViewMode) => void;
  setSelectedLetter: (letter: string | null) => void;
  setIsFilterModalOpen: (open: boolean) => void;
  setShowSearch: (show: boolean) => void;
  handleLetterSelect: (letter: string) => void;
  handleUserClick: (user: User) => void;
  setIsUserDetailModalOpen: (open: boolean) => void;
  handleUpdateUserStatus: (userId: string, isActive: boolean) => Promise<void>;
  handleUpdatePaymentStatus: (userId: string, status: User['paymentStatus']) => Promise<void>;
  handleRemoveUser: (userId: string) => Promise<void>;
  handleUpdateUserPlan: (userId: string, plan: User['plan']) => Promise<void>;
}






