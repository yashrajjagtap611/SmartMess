export interface ChatRoom {
  _id: string;
  name: string;
  description?: string;
  type: 'mess' | 'direct' | 'admin' | 'individual';
  messId?: string;
  participants: ChatParticipant[];
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
    role: string;
  };
  isActive: boolean;
  settings: {
    allowFileUpload: boolean;
    allowImageUpload: boolean;
    maxFileSize: number;
    messageRetentionDays: number;
  };
  disappearingMessagesDays?: number | null;
  userRole?: string;
  lastSeen?: Date;
  createdAt: string;
  updatedAt: string;
  // For individual messaging
  individualWith?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
    role: string;
  };
}

export interface ChatParticipant {
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
    role: string;
  };
  role: 'user' | 'mess-owner' | 'admin';
  joinedAt: string;
  lastSeen?: string;
  isActive: boolean;
}

export interface ChatMessage {
  _id: string;
  roomId: string;
  senderId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
    role: string;
  };
  content: string;
  messageType: 'text' | 'image' | 'file' | 'system';
  attachments?: ChatAttachment[];
  replyTo?: {
    _id: string;
    content: string;
    senderId: {
      _id: string;
      firstName: string;
      lastName: string;
    };
  };
  editedAt?: string;
  isEdited: boolean;
  isDeleted: boolean;
  deletedAt?: string;
  deletedBy?: string;
  reactions: ChatReaction[];
  readBy: ChatReadStatus[];
  isPinned: boolean;
  pinnedAt?: string;
  pinnedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatAttachment {
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
  voters: string[];
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  createdBy: string;
  createdAt: string;
  expiresAt?: string;
  isActive: boolean;
  totalVotes: number;
  roomId: string;
}

export interface CreatePollData {
  question: string;
  options: string[];
  expiresAt?: string;
}

export interface ChatReaction {
  userId: string;
  emoji: string;
  addedAt: string;
}

export interface ChatReadStatus {
  userId: string;
  readAt: string;
}

export interface ChatNotification {
  _id: string;
  userId: string;
  roomId: {
    _id: string;
    name: string;
    type: string;
  };
  messageId?: {
    _id: string;
    content: string;
    messageType: string;
  };
  type: 'new_message' | 'mention' | 'reaction' | 'room_invite' | 'room_update';
  title: string;
  content: string;
  isRead: boolean;
  readAt?: string;
  priority: 'low' | 'medium' | 'high';
  metadata?: {
    senderId?: {
      _id: string;
      firstName: string;
      lastName: string;
      profilePicture?: string;
    };
    roomName?: string;
    emoji?: string;
    [key: string]: any;
  };
  createdAt: string;
  updatedAt: string;
}

export interface MessMember {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
  role: string;
  joinDate: string;
}

export interface CreateRoomData {
  name: string;
  description?: string;
  type: 'mess' | 'direct' | 'admin' | 'individual';
  messId?: string;
  participantIds: string[];
  // For individual messaging
  individualWithUserId?: string;
}

export interface SendMessageData {
  roomId: string;
  content: string;
  messageType?: 'text' | 'image' | 'file' | 'system';
  replyTo?: string;
  attachments?: ChatAttachment[];
}

export interface TypingUser {
  userId: string;
  roomId: string;
  isTyping: boolean;
}

export interface ChatState {
  rooms: ChatRoom[];
  currentRoom: ChatRoom | null;
  messages: ChatMessage[];
  notifications: ChatNotification[];
  messMembers: MessMember[];
  polls: Poll[];
  isLoading: boolean;
  isConnected: boolean;
  typingUsers: TypingUser[];
  error: string | null;
}

export interface ChatContextType {
  state: ChatState;
  actions: {
    // Room actions
    loadRooms: () => Promise<void>;
    createRoom: (data: CreateRoomData) => Promise<ChatRoom>;
    createIndividualChat: (userId: string) => Promise<ChatRoom>;
    deleteRoom: (roomId: string) => Promise<void>;
    selectRoom: (roomId: string) => void;
    joinRoom: (roomId: string) => void;
    leaveRoom: (roomId: string) => void;
    
    // Message actions
    loadMessages: (roomId: string, page?: number) => Promise<void>;
    sendMessage: (data: SendMessageData) => Promise<void>;
    editMessage: (messageId: string, content: string) => Promise<void>;
    deleteMessage: (messageId: string) => Promise<void>;
    addReaction: (messageId: string, emoji: string) => void;
    removeReaction: (messageId: string, emoji: string) => void;
    markAsRead: (roomId: string, messageIds: string[]) => Promise<void>;
    massDeleteMessages: (messageIds: string[]) => Promise<number>; // Add this line
    
    // Notification actions
    loadNotifications: (page?: number, unreadOnly?: boolean) => Promise<void>;
    markNotificationAsRead: (notificationId: string) => Promise<void>;
    
    // Utility actions
    loadMessMembers: () => Promise<void>;
    checkCommunicationPermission: (targetUserId: string) => Promise<boolean>;
    startTyping: (roomId: string) => void;
    stopTyping: (roomId: string) => void;
    
    // Poll actions
    createPoll: (roomId: string, pollData: CreatePollData) => Promise<void>;
    voteOnPoll: (pollId: string, optionId: string) => Promise<void>;
    closePoll: (pollId: string) => Promise<void>;
    updatePoll: (pollId: string, pollData: CreatePollData) => Promise<void>;
    deletePoll: (pollId: string) => Promise<void>;
    
    // Error handling
    clearError: () => void;
  };
}


