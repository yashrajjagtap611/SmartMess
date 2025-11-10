import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { ChatContextType, ChatState, CreateRoomData, SendMessageData, TypingUser, CreatePollData } from '../types/chat.types';
import { ChatService } from '../services/chat.service';
import { getWebSocketService } from '../services/websocket.service';
import { useAuth } from '../../../contexts/AuthContext';

// Initial state
const initialState: ChatState = {
  rooms: [],
  currentRoom: null,
  messages: [],
  notifications: [],
  messMembers: [],
  polls: [],
  isLoading: false,
  isConnected: false,
  typingUsers: [],
  error: null,
};

// Action types
type ChatAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'SET_ROOMS'; payload: any[] }
  | { type: 'ADD_ROOM'; payload: any }
  | { type: 'UPDATE_ROOM'; payload: any }
  | { type: 'SET_CURRENT_ROOM'; payload: any | null }
  | { type: 'SET_MESSAGES'; payload: any[] }
  | { type: 'ADD_MESSAGE'; payload: any }
  | { type: 'UPDATE_MESSAGE'; payload: any }
  | { type: 'SET_NOTIFICATIONS'; payload: any[] }
  | { type: 'ADD_NOTIFICATION'; payload: any }
  | { type: 'UPDATE_NOTIFICATION'; payload: any }
  | { type: 'SET_MESS_MEMBERS'; payload: any[] }
  | { type: 'SET_TYPING_USERS'; payload: TypingUser[] }
  | { type: 'ADD_TYPING_USER'; payload: TypingUser }
  | { type: 'REMOVE_TYPING_USER'; payload: string }
  | { type: 'SET_POLLS'; payload: any[] }
  | { type: 'ADD_POLL'; payload: any }
  | { type: 'UPDATE_POLL'; payload: any }
  | { type: 'REMOVE_POLL'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RECONNECT' };

// Reducer
const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_CONNECTED':
      return { ...state, isConnected: action.payload };
    
    case 'SET_ROOMS':
      return { ...state, rooms: action.payload };
    
    case 'ADD_ROOM':
      return { ...state, rooms: [...state.rooms, action.payload] };
    
    case 'UPDATE_ROOM':
      return {
        ...state,
        rooms: state.rooms.map(room =>
          room._id === action.payload._id ? action.payload : room
        ),
        currentRoom: state.currentRoom?._id === action.payload._id ? action.payload : state.currentRoom
      };
    
    case 'SET_CURRENT_ROOM':
      return { ...state, currentRoom: action.payload };
    
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };
    
    case 'ADD_MESSAGE':
      // Prevent duplicate messages by _id
      if (state.messages.find(m => m._id === action.payload._id)) {
        return state;
      }
      return { ...state, messages: [...state.messages, action.payload] };
    
    case 'UPDATE_MESSAGE':
      return {
        ...state,
        messages: state.messages.map(message =>
          message._id === action.payload._id ? { ...message, ...action.payload } : message
        )
      };
    
    case 'SET_NOTIFICATIONS':
      return { ...state, notifications: action.payload };
    
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.payload, ...state.notifications] };
    
    case 'UPDATE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification._id === action.payload._id ? action.payload : notification
        )
      };
    
    case 'SET_MESS_MEMBERS':
      return { ...state, messMembers: action.payload };
    
    case 'SET_TYPING_USERS':
      return { ...state, typingUsers: action.payload };
    
    case 'ADD_TYPING_USER':
      return {
        ...state,
        typingUsers: [
          ...state.typingUsers.filter(u => !(u.userId === action.payload.userId && u.roomId === action.payload.roomId)),
          action.payload
        ]
      };
    
    case 'REMOVE_TYPING_USER':
      return {
        ...state,
        typingUsers: state.typingUsers.filter(u => u.userId !== action.payload)
      };
    
    case 'SET_POLLS':
      return { ...state, polls: action.payload };
    
    case 'ADD_POLL':
      // Prevent duplicate polls by checking if poll with same id already exists
      if (state.polls.find(poll => poll.id === action.payload.id)) {
        return state;
      }
      return {
        ...state,
        polls: [...state.polls, action.payload]
      };
    
    case 'UPDATE_POLL':
      return {
        ...state,
        polls: state.polls.map(poll => 
          poll.id === action.payload.id ? action.payload : poll
        )
      };
    
    case 'REMOVE_POLL':
      return {
        ...state,
        polls: state.polls.filter(poll => poll.id !== action.payload)
      };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    case 'RECONNECT':
      getWebSocketService().reconnect();
      return state;
    
    default:
      return state;
  }
};

// Context
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Provider
export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const { user } = useAuth();
  const listenersAttachedRef = React.useRef(false);
  const stateRef = React.useRef(state);
  const loadingMessagesRef = React.useRef<Set<string>>(new Set()); // Track which rooms are currently loading
  const loadingRoomsRef = React.useRef(false); // Track if rooms are currently loading
  
  // Keep state ref updated
  React.useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Actions - Define loadRooms first so it can be used in other effects
  const loadRooms = useCallback(async () => {
    // Prevent duplicate calls
    if (loadingRoomsRef.current) {
      console.log('⏭️ Skipping loadRooms - already loading');
      return;
    }
    
    try {
      loadingRoomsRef.current = true;
      dispatch({ type: 'SET_LOADING', payload: true });
      const rooms = await ChatService.getRooms();
      dispatch({ type: 'SET_ROOMS', payload: rooms });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load rooms' });
    } finally {
      loadingRoomsRef.current = false;
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Listen for mess membership changes to refresh chat rooms
  useEffect(() => {
    if (!user) return;

    const handleMessMembershipChange = () => {
      // Refresh chat rooms when mess membership changes (user left/joined mess)
      console.log('Mess membership changed, refreshing chat rooms...');
      loadRooms();
    };

    // Listen for custom event when user leaves/joins mess
    window.addEventListener('messMembershipChanged', handleMessMembershipChange);
    
    // Also listen for storage events (in case membership changes in another tab)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'messMembershipChanged') {
        handleMessMembershipChange();
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('messMembershipChanged', handleMessMembershipChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, [user, loadRooms]);

  // WebSocket event handlers
  useEffect(() => {
    if (!user) return;

    // Attach listeners only once
    if (listenersAttachedRef.current) return;
    listenersAttachedRef.current = true;

    // Initialize WebSocket connection
    getWebSocketService().initializeConnection();

    getWebSocketService().onConnect(() => {
      dispatch({ type: 'SET_CONNECTED', payload: true });
    });

    getWebSocketService().onDisconnect(() => {
      dispatch({ type: 'SET_CONNECTED', payload: false });
    });

    // Message events
    getWebSocketService().onNewMessage((message) => {
      console.log('📨 New message received via WebSocket:', {
        messageId: message._id,
        roomId: message.roomId,
        sender: message.senderId?.firstName || message.senderId?.email,
        content: message.content?.substring(0, 50),
        currentRoom: state.currentRoom?._id
      });
      // Add message if not present. We don't filter sender here because server
      // emits the saved message (with _id) and reducer will dedupe by _id.
      dispatch({ type: 'ADD_MESSAGE', payload: message });

      // Update room's last message timestamp safely
      dispatch({ type: 'UPDATE_ROOM', payload: { _id: message.roomId, updatedAt: message.createdAt } as any });
    });

    getWebSocketService().onUserJoined((data) => {
      console.log('User joined:', data);
    });

    getWebSocketService().onUserLeft((data) => {
      console.log('User left:', data);
    });

    getWebSocketService().onUserTyping((data) => {
      if (data.isTyping) {
        dispatch({ type: 'ADD_TYPING_USER', payload: data });
      } else {
        dispatch({ type: 'REMOVE_TYPING_USER', payload: data.userId });
      }
    });

    getWebSocketService().onReactionUpdated((data) => {
      // Ensure reactions have userId as string for consistent comparison
      const formattedReactions = data.reactions.map((r: any) => ({
        ...r,
        userId: typeof r.userId === 'string' ? r.userId : (r.userId?.toString?.() || String(r.userId))
      }));
      dispatch({ type: 'UPDATE_MESSAGE', payload: { _id: data.messageId, reactions: formattedReactions } as any });
    });

    // messages_read events are handled by individual message updates via sockets
    getWebSocketService().onMessagesRead(() => {
      // No-op: server will emit updated message objects via 'new_message' or
      // 'reaction_updated' events. Keep listener to avoid unhandled events.
    });

    getWebSocketService().onNotification((notification) => {
      dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
    });

    // Poll WebSocket events
    getWebSocketService().onPollCreated((data) => {
      dispatch({ type: 'ADD_POLL', payload: data.poll });
    });

    getWebSocketService().onPollUpdated((data) => {
      dispatch({ type: 'UPDATE_POLL', payload: data.poll });
    });

    getWebSocketService().onPollDeleted((data) => {
      dispatch({ type: 'REMOVE_POLL', payload: data.pollId });
    });

    getWebSocketService().onError((error) => {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    });

    // New WebSocket events for message deletion and updates
    getWebSocketService().onMessageDeleted((data) => {
      dispatch({ type: 'UPDATE_MESSAGE', payload: data.deletedMessage });
    });

    getWebSocketService().onMessageUpdated((data) => {
      dispatch({ type: 'UPDATE_MESSAGE', payload: data.updatedMessage });
    });

    // Clean up on unmount: only reset flag, don't disconnect WebSocket
    // WebSocket is a singleton and should persist across component re-renders
    // Only disconnect when user logs out or app is closed
    return () => {
      // Don't disconnect WebSocket here - it's shared across the app
      // Just reset the listeners flag so they can be re-attached if needed
      listenersAttachedRef.current = false;
    };
  }, [user]);

  // Actions (loadRooms already defined above)
  const createRoom = useCallback(async (data: CreateRoomData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const room = await ChatService.createRoom(data);
      dispatch({ type: 'ADD_ROOM', payload: room });
      return room;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create room' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const createIndividualChat = useCallback(async (userId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const room = await ChatService.createIndividualChat(userId);
      dispatch({ type: 'ADD_ROOM', payload: room });
      return room;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create individual chat' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const deleteRoom = useCallback(async (roomId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await ChatService.deleteRoom(roomId);
      dispatch({ type: 'SET_ROOMS', payload: state.rooms.filter(room => room._id !== roomId) });
      
      // If the deleted room was the current room, clear it
      if (state.currentRoom?._id === roomId) {
        dispatch({ type: 'SET_CURRENT_ROOM', payload: null });
        dispatch({ type: 'SET_MESSAGES', payload: [] });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete room' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.rooms, state.currentRoom]);

  const joinRoom = useCallback((roomId: string) => {
    getWebSocketService().joinRoom(roomId);
  }, []);

  const leaveRoom = useCallback((roomId: string) => {
    getWebSocketService().leaveRoom(roomId);
  }, []);

  const loadMessages = useCallback(async (roomId: string, page: number = 1) => {
    // Prevent duplicate calls for the same room
    if (page === 1 && loadingMessagesRef.current.has(roomId)) {
      console.log('⏭️ Skipping loadMessages - already loading for room:', roomId);
      return;
    }
    
    try {
      if (page === 1) {
        loadingMessagesRef.current.add(roomId);
      }
      dispatch({ type: 'SET_LOADING', payload: true });
      const messages = await ChatService.getRoomMessages(roomId, page);
      if (page === 1) {
        dispatch({ type: 'SET_MESSAGES', payload: messages });
        
        // Also load polls for this room
        const polls = await ChatService.getRoomPolls(roomId);
        dispatch({ type: 'SET_POLLS', payload: polls });
      } else {
        // For pagination, use ref to get current messages without dependency
        const currentMessages = stateRef.current.messages;
        dispatch({ type: 'SET_MESSAGES', payload: [...messages, ...currentMessages] });
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load messages' });
    } finally {
      if (page === 1) {
        loadingMessagesRef.current.delete(roomId);
      }
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []); // No dependencies - use ref to access current state

  const selectRoom = useCallback(async (roomId: string) => {
    // Use ref to get current rooms without dependency
    const currentRooms = stateRef.current.rooms;
    const room = currentRooms.find(r => r._id === roomId);
    
    // Set current room immediately (so header shows name right away)
    dispatch({ type: 'SET_CURRENT_ROOM', payload: room || null });
    
    // Load messages and join room in parallel (non-blocking)
    if (room) {
      // Don't await - load messages in background so UI is responsive
      loadMessages(roomId).catch(error => {
        console.error('Failed to load messages:', error);
      });
      // Join the room via WebSocket
      joinRoom(roomId);
    }
  }, [loadMessages, joinRoom]); // Removed state.rooms dependency

  const sendMessage = useCallback(async (data: SendMessageData) => {
    try {
      // Check if WebSocket is connected
      if (!getWebSocketService().isSocketConnected()) {
        throw new Error('Not connected to server. Please refresh the page.');
      }
      
      // Send message via WebSocket only. The WebSocket service handles saving and broadcasting.
      getWebSocketService().sendMessage(data);
      
      // Return success (WebSocket is fire-and-forget, server will emit confirmation)
      return Promise.resolve();
    } catch (error: any) {
      console.error('Failed to send message:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to send message' });
      throw error; // Re-throw so caller can handle it
    }
  }, []);

  const editMessage = useCallback(async (messageId: string, content: string) => {
    // This would need to be implemented in the backend
    console.log('Edit message:', messageId, content);
  }, []);

  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      if (state.currentRoom) {
        // Use WebSocket for real-time deletion
        getWebSocketService().deleteMessage(messageId, state.currentRoom._id);
      }
      
      // Also call the API to ensure the deletion is saved
      const deletedMessage = await ChatService.deleteMessage(messageId);
      dispatch({ type: 'UPDATE_MESSAGE', payload: deletedMessage });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete message' });
      throw error;
    }
  }, [state.currentRoom]);

  const addReaction = useCallback((messageId: string, emoji: string) => {
    if (state.currentRoom) {
      getWebSocketService().addReaction(messageId, emoji, state.currentRoom._id);
      
      // Also call the API to ensure the reaction is saved
      ChatService.addReaction(messageId, emoji)
        .then(updatedMessage => {
          dispatch({ type: 'UPDATE_MESSAGE', payload: updatedMessage });
        })
        .catch(error => {
          console.error('Failed to add reaction:', error);
          dispatch({ type: 'SET_ERROR', payload: 'Failed to add reaction' });
        });
    }
  }, [state.currentRoom]);

  const removeReaction = useCallback((messageId: string, emoji: string) => {
    if (state.currentRoom) {
      getWebSocketService().addReaction(messageId, emoji, state.currentRoom._id);
      
      // Also call the API to ensure the reaction is saved
      ChatService.addReaction(messageId, emoji)
        .then(updatedMessage => {
          dispatch({ type: 'UPDATE_MESSAGE', payload: updatedMessage });
        })
        .catch(error => {
          console.error('Failed to remove reaction:', error);
          dispatch({ type: 'SET_ERROR', payload: 'Failed to remove reaction' });
        });
    }
  }, [state.currentRoom]);

  // New function for mass deletion
  const massDeleteMessages = useCallback(async (messageIds: string[]) => {
    try {
      if (state.currentRoom) {
        // Use WebSocket for real-time mass deletion
        getWebSocketService().massDeleteMessages(messageIds, state.currentRoom._id);
      }
      
      // Also call the API to ensure the deletion is saved
      const deletedCount = await ChatService.massDeleteMessages(messageIds);
      
      // Update the messages in the state
      const updatedMessages = state.messages.map(message => {
        if (messageIds.includes(message._id)) {
          return {
            ...message,
            isDeleted: true,
            deletedAt: new Date().toISOString(),
            content: '[Message deleted]'
          };
        }
        return message;
      });
      
      dispatch({ type: 'SET_MESSAGES', payload: updatedMessages });
      
      return deletedCount;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete messages' });
      throw error;
    }
  }, [state.currentRoom, state.messages]);

  const markAsRead = useCallback(async (roomId: string, messageIds: string[]) => {
    try {
      await ChatService.markMessagesAsRead(roomId, messageIds);
      getWebSocketService().markMessagesAsRead(roomId, messageIds);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to mark messages as read' });
    }
  }, []);

  const loadNotifications = useCallback(async (page: number = 1, unreadOnly: boolean = false) => {
    try {
      const { notifications } = await ChatService.getNotifications(page, 20, unreadOnly);
      if (page === 1) {
        dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications });
      } else {
        dispatch({ type: 'SET_NOTIFICATIONS', payload: [...state.notifications, ...notifications] });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load notifications' });
    }
  }, [state.notifications]);

  const markNotificationAsRead = useCallback(async (notificationId: string) => {
    try {
      await ChatService.markNotificationAsRead(notificationId);
      dispatch({
        type: 'UPDATE_NOTIFICATION',
        payload: { _id: notificationId, isRead: true, readAt: new Date().toISOString() }
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to mark notification as read' });
    }
  }, []);

  const loadMessMembers = useCallback(async () => {
    try {
      const members = await ChatService.getMessMembers();
      dispatch({ type: 'SET_MESS_MEMBERS', payload: members });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load mess members' });
    }
  }, []);

  const checkCommunicationPermission = useCallback(async (targetUserId: string): Promise<boolean> => {
    try {
      return await ChatService.checkCommunicationPermission(targetUserId);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to check communication permission' });
      return false;
    }
  }, []);

  const startTyping = useCallback((roomId: string) => {
    getWebSocketService().startTyping(roomId);
  }, []);

  const stopTyping = useCallback((roomId: string) => {
    getWebSocketService().stopTyping(roomId);
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // Poll functions
  const createPoll = useCallback(async (roomId: string, pollData: CreatePollData) => {
    try {
      const newPoll = await ChatService.createPoll(roomId, pollData);
      dispatch({ type: 'ADD_POLL', payload: newPoll });
    } catch (error) {
      console.error('Failed to create poll:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create poll' });
    }
  }, []);

  const voteOnPoll = useCallback(async (pollId: string, optionId: string) => {
    try {
      const updatedPoll = await ChatService.voteOnPoll(pollId, optionId);
      dispatch({ type: 'UPDATE_POLL', payload: updatedPoll });
    } catch (error) {
      console.error('Failed to vote on poll:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to vote on poll' });
    }
  }, []);

  const closePoll = useCallback(async (pollId: string) => {
    try {
      const updatedPoll = await ChatService.closePoll(pollId);
      dispatch({ type: 'UPDATE_POLL', payload: updatedPoll });
    } catch (error) {
      console.error('Failed to close poll:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to close poll' });
    }
  }, []);

  const updatePoll = useCallback(async (pollId: string, pollData: CreatePollData) => {
    try {
      const updatedPoll = await ChatService.updatePoll(pollId, pollData);
      dispatch({ type: 'UPDATE_POLL', payload: updatedPoll });
    } catch (error) {
      console.error('Failed to update poll:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update poll' });
    }
  }, []);

  const deletePoll = useCallback(async (pollId: string) => {
    try {
      await ChatService.deletePoll(pollId);
      dispatch({ type: 'REMOVE_POLL', payload: pollId });
    } catch (error) {
      console.error('Failed to delete poll:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete poll' });
    }
  }, []);

  const contextValue: ChatContextType = {
    state,
    actions: {
      loadRooms,
      createRoom,
      createIndividualChat,
      deleteRoom,
      selectRoom,
      joinRoom,
      leaveRoom,
      loadMessages,
      sendMessage,
      editMessage,
      deleteMessage,
      addReaction,
      removeReaction,
      markAsRead,
      loadNotifications,
      markNotificationAsRead,
      loadMessMembers,
      checkCommunicationPermission,
      startTyping,
      stopTyping,
      clearError,
      createPoll,
      voteOnPoll,
      closePoll,
      updatePoll,
      deletePoll,
      massDeleteMessages, // Add the new function
    },
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};

// Hook
export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};










