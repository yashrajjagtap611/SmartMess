import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { useChat } from '../../contexts/ChatContext';
import { toast } from '@/hooks/use-toast';
import { ChatRoomList } from '../ChatRoomList/ChatRoomList';
import { ChatMessages } from '../ChatMessages/ChatMessages';
import { CreateRoomModal } from '../CreateRoomModal/CreateRoomModal';
import { IndividualChatModal } from '../IndividualChatModal/IndividualChatModal';
import { UserList } from '../UserList/UserList';
import { Settings, Users, MessageCircle, Clock, ArrowLeft, Calendar, Utensils, Timer, Edit, Send, User as UserIcon, Search } from 'lucide-react';
import { useAuth } from '../../../../contexts/AuthContext';
import messService from '../../../../services/api/messService';
import { ChatService } from '../../services/chat.service';

export const ChatCommunity: React.FC = () => {
  const { state, actions } = useChat();
  const { user } = useAuth();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Restore chat room from location state when returning from user detail page
  useEffect(() => {
    const locationState = location.state as { returnTo?: string; roomId?: string } | null;
    if (locationState?.roomId && state.rooms.length > 0) {
      // Check if we need to restore the room
      if (state.currentRoom?._id !== locationState.roomId) {
        const room = state.rooms.find(r => r._id === locationState.roomId);
        if (room) {
          console.log('🔄 Restoring room from navigation state:', locationState.roomId);
          actions.selectRoom(locationState.roomId);
          // Update URL to include roomId
          const newParams = new URLSearchParams(searchParams);
          newParams.set('roomId', locationState.roomId);
          setSearchParams(newParams, { replace: true });
        }
      }
      // Clear the state to prevent re-triggering
      if (locationState) {
        window.history.replaceState({}, '', location.pathname + location.search);
      }
    }
  }, [location.state, state.rooms.length, state.currentRoom?._id, actions, searchParams, setSearchParams]);
  
  // Notify layouts when viewing messages (hide bottom nav)
  useEffect(() => {
    const isViewingMessages = !!state.currentRoom;
    // Dispatch custom event for layouts to listen
    window.dispatchEvent(new CustomEvent('chatViewStateChanged', { 
      detail: { isViewingMessages } 
    }));
    // Also store in localStorage for cross-tab sync
    localStorage.setItem('chatViewingMessages', String(isViewingMessages));
  }, [state.currentRoom]);

  // Persist current room ID in URL
  useEffect(() => {
    if (state.currentRoom?._id) {
      const currentRoomId = searchParams.get('roomId');
      if (currentRoomId !== state.currentRoom._id) {
        // Update URL with roomId, preserving other params like userId
        const newParams = new URLSearchParams(searchParams);
        newParams.set('roomId', state.currentRoom._id);
        setSearchParams(newParams, { replace: true });
      }
    } else {
      // If no room selected, only remove roomId from URL if:
      // 1. Rooms are loaded (so we know the room doesn't exist)
      // 2. We're not currently loading rooms
      // 3. There's no roomId in URL that we're trying to restore
      const roomId = searchParams.get('roomId');
      if (roomId && state.rooms.length > 0 && !state.isLoading) {
        // Check if the room exists in the loaded rooms
        const roomExists = state.rooms.some(r => r._id === roomId);
        if (!roomExists) {
          // Room doesn't exist, safe to remove from URL
          console.log('🗑️ Removing invalid roomId from URL:', roomId);
          const newParams = new URLSearchParams(searchParams);
          newParams.delete('roomId');
          setSearchParams(newParams, { replace: true });
        }
        // If room exists, don't remove - let the restoration logic handle it
      }
    }
  }, [state.currentRoom?._id, searchParams, setSearchParams, state.rooms.length, state.isLoading]);

  // Restore room from URL on mount or when rooms are loaded or URL changes
  useEffect(() => {
    // Don't restore if we're explicitly deselecting (user clicked back button)
    if (isExplicitlyDeselectingRef.current) {
      console.log('⏭️ Skipping restore - explicitly deselecting room');
      return;
    }
    
    const roomIdFromUrl = searchParams.get('roomId');
    const userIdFromUrl = searchParams.get('userId');
    
    console.log('🔍 Checking URL for roomId:', roomIdFromUrl, 'currentRoom:', state.currentRoom?._id, 'rooms loaded:', state.rooms.length, 'location:', location.pathname);
    
    // Don't restore if we're opening a chat with a user
    if (userIdFromUrl) {
      console.log('⏭️ Skipping restore - opening chat with user:', userIdFromUrl);
      setIsRestoringFromUrl(false);
      return;
    }
    
    // If we have a roomId in URL, set restoring flag
    if (roomIdFromUrl) {
      if (state.rooms.length > 0) {
        // Only restore if the current room is different from URL and we haven't just restored this room
        if (state.currentRoom?._id !== roomIdFromUrl && lastRestoredRoomIdRef.current !== roomIdFromUrl) {
          const room = state.rooms.find(r => r._id === roomIdFromUrl);
          if (room) {
            console.log('🔄 Restoring room from URL:', roomIdFromUrl, 'room name:', room.name);
            setIsRestoringFromUrl(true);
            lastRestoredRoomIdRef.current = roomIdFromUrl;
            // selectRoom is async, call it and let useEffect handle the flag clearing
            actions.selectRoom(roomIdFromUrl);
          } else {
            // Room not found, remove from URL
            console.log('⚠️ Room not found in list, removing from URL:', roomIdFromUrl);
            setIsRestoringFromUrl(false);
            const newParams = new URLSearchParams(searchParams);
            newParams.delete('roomId');
            setSearchParams(newParams, { replace: true });
          }
        } else {
          console.log('✅ Room already selected:', roomIdFromUrl);
          setIsRestoringFromUrl(false);
          lastRestoredRoomIdRef.current = roomIdFromUrl; // Mark as restored
        }
      } else {
        console.log('⏳ Waiting for rooms to load before restoring:', roomIdFromUrl);
        // Set restoring flag while waiting for rooms
        setIsRestoringFromUrl(true);
        // Only load rooms if not already loading and rooms list is empty
        // loadRooms is already called on mount, so we don't need to call it again here
        // The rooms will be loaded and then this effect will run again to restore the room
      }
    } else {
      setIsRestoringFromUrl(false);
    }
  }, [state.rooms.length, searchParams, state.currentRoom?._id, setSearchParams, location.pathname, state.isLoading]); // Removed actions from deps to prevent loops
  
  // Also restore from location state when component mounts (for browser back button)
  useEffect(() => {
    const locationState = location.state as { returnTo?: string; roomId?: string } | null;
    const roomIdFromState = locationState?.roomId;
    const roomIdFromUrl = searchParams.get('roomId');
    
    // If we have roomId from state but not from URL, and rooms are loaded, restore it
    if (roomIdFromState && !roomIdFromUrl && state.rooms.length > 0) {
      const room = state.rooms.find(r => r._id === roomIdFromState);
      if (room && state.currentRoom?._id !== roomIdFromState && lastRestoredRoomIdRef.current !== roomIdFromState) {
        console.log('🔄 Restoring room from location state:', roomIdFromState);
        lastRestoredRoomIdRef.current = roomIdFromState;
        actions.selectRoom(roomIdFromState);
        // Update URL to include roomId
        const newParams = new URLSearchParams(searchParams);
        newParams.set('roomId', roomIdFromState);
        setSearchParams(newParams, { replace: true });
      }
    }
  }, [location.state, state.rooms.length, searchParams, state.currentRoom?._id, setSearchParams]); // Removed actions from deps to prevent loops
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showIndividualChatModal, setShowIndividualChatModal] = useState(false);
  const [showUserList, setShowUserList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isOpeningChat, setIsOpeningChat] = useState(false);
  const [messDetails, setMessDetails] = useState<any>(null);
  const [isRestoringFromUrl, setIsRestoringFromUrl] = useState(false);
  const isExplicitlyDeselectingRef = useRef(false);
  const lastRestoredRoomIdRef = useRef<string | null>(null); // Track last restored room to prevent loops
  const [disappearingDays, setDisappearingDays] = useState<number | null>(null);
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);
  const [editingRoomName, setEditingRoomName] = useState(false);
  const [editingRoomDescription, setEditingRoomDescription] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [roomDescription, setRoomDescription] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // Check if user can create rooms (mess-owner and admin only)
  const canCreateRooms = user?.role === 'mess-owner' || user?.role === 'admin';

  useEffect(() => {
    actions.loadRooms();
    actions.loadNotifications();
  }, []);

  // Load room settings when a room is selected (non-blocking, for settings only)
  useEffect(() => {
    if (state.currentRoom?._id) {
      // Use room name and description from currentRoom immediately (no need to wait for API)
      setRoomName(state.currentRoom.name || '');
      setRoomDescription(state.currentRoom.description || '');
      
      // Load room details in background to get settings (disappearing messages, etc.)
      // This is non-blocking - the name is already available from state.currentRoom
      ChatService.getRoomDetails(state.currentRoom._id).then((room: any) => {
        setDisappearingDays(room.disappearingMessagesDays || null);
        // Only update name/description if they're different (in case they were edited)
        if (room.name && room.name !== state.currentRoom?.name) {
          setRoomName(room.name);
        }
        if (room.description !== undefined && room.description !== state.currentRoom?.description) {
          setRoomDescription(room.description || '');
        }
      }).catch((error: any) => {
        console.error('Failed to load room settings:', error);
        // Don't clear the name/description on error - keep what we have from currentRoom
      });
    } else {
      setDisappearingDays(null);
      setRoomName('');
      setRoomDescription('');
    }
  }, [state.currentRoom?._id, state.currentRoom?.name, state.currentRoom?.description]);

  // Load mess details when a mess room is selected
  useEffect(() => {
    const loadMessDetails = async () => {
      if (state.currentRoom?.messId && state.currentRoom?.type === 'mess') {
        try {
          const response = await messService.getUserMessDetails();
          if (response.success && response.data) {
            // Response.data has a 'messes' array
            const messes = response.data.messes || (Array.isArray(response.data) ? response.data : []);
            // Find the mess that matches the current room's messId
            const mess = messes.find((m: any) => {
              const messId = m.messId || m.id || m._id;
              return messId === state.currentRoom?.messId || messId?.toString() === state.currentRoom?.messId?.toString();
            });
            setMessDetails(mess || null);
          }
        } catch (error) {
          console.error('Failed to load mess details:', error);
          setMessDetails(null);
        }
      } else {
        setMessDetails(null);
      }
    };

    loadMessDetails();
  }, [state.currentRoom?.messId, state.currentRoom?.type]);

  // Get weekly schedule day - calculate from subscription start date
  const getWeeklyDay = () => {
    if (!messDetails?.mealPlans || messDetails.mealPlans.length === 0) return null;
    
    // Get the first active meal plan
    const activePlan = messDetails.mealPlans.find((plan: any) => 
      plan.status === 'active' || plan.paymentStatus === 'paid'
    ) || messDetails.mealPlans[0];
    
    // Try to get weekly schedule from plan
    if (activePlan?.weeklySchedule) {
      return activePlan.weeklySchedule;
    }
    
    // Calculate from subscription start date
    if (activePlan?.subscriptionStartDate) {
      const startDate = new Date(activePlan.subscriptionStartDate);
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return days[startDate.getDay()];
    }
    
    // Default to Saturday
    return 'Saturday';
  };

  // Get meal options from active meal plan
  const getMealOptions = () => {
    if (!messDetails?.mealPlans || messDetails.mealPlans.length === 0) return null;
    
    // Get the first active meal plan
    const activePlan = messDetails.mealPlans.find((plan: any) => 
      plan.status === 'active' || plan.paymentStatus === 'paid'
    ) || messDetails.mealPlans[0];
    
    // Check if mealOptions exist in the plan
    if (activePlan?.mealOptions) {
      const meals = [];
      if (activePlan.mealOptions.breakfast) meals.push('Breakfast');
      if (activePlan.mealOptions.lunch) meals.push('Lunch');
      if (activePlan.mealOptions.dinner) meals.push('Dinner');
      return meals.length > 0 ? meals.join(', ') : null;
    }
    
    // Try to get from meal plan details if available
    // For now, default to all meals
    return 'Breakfast, Lunch and Dinner';
  };

  // Handle userId from query params - open chat with specific user
  useEffect(() => {
    const userId = searchParams.get('userId');
    if (userId && !isOpeningChat) {
      const handleOpenChatWithUser = async (targetUserId: string) => {
        if (isOpeningChat) return;
        
        setIsOpeningChat(true);
        try {
          // First, try to check existing rooms if they're loaded
          let existingRoom = null;
          if (state.rooms.length > 0) {
            existingRoom = state.rooms.find((room: any) => 
              room.type === 'individual' && 
              room.participants?.some((p: any) => {
                const participantUserId = typeof p.userId === 'string' 
                  ? p.userId 
                  : p.userId?._id || p.userId?.id;
                return String(participantUserId) === String(targetUserId);
              })
            );
          }

          if (existingRoom) {
            // Room exists, select it
            actions.selectRoom(existingRoom._id);
            // Remove userId from URL
            setSearchParams({});
          } else {
            // Create new individual chat (this will work even if rooms failed to load)
            const room = await actions.createIndividualChat(targetUserId);
            actions.selectRoom(room._id);
            // Remove userId from URL
            setSearchParams({});
            toast({
              title: 'Chat Started',
              description: 'Individual chat created successfully',
              variant: 'default'
            });
          }
        } catch (error: any) {
          console.error('Error opening chat with user:', error);
          toast({
            title: 'Error',
            description: error.message || 'Failed to open chat with user',
            variant: 'destructive'
          });
          // Remove userId from URL even on error
          setSearchParams({});
        } finally {
          setIsOpeningChat(false);
        }
      };
      
      // Wait a bit for rooms to load, but don't require them
      const timeout = setTimeout(() => {
        handleOpenChatWithUser(userId);
      }, state.rooms.length === 0 ? 500 : 0);
      
      return () => clearTimeout(timeout);
    }
  }, [searchParams, state.rooms, isOpeningChat, actions, setSearchParams]);

  // Monitor connection status (no toast notifications)
  useEffect(() => {
    // Connection status is handled silently
  }, [state.isConnected]);

  // Monitor errors and show toasts
  useEffect(() => {
    if (state.error) {
      toast({
        title: 'Error',
        description: state.error,
        variant: 'destructive'
      });
      // Clear error after showing (with a small delay to ensure toast is visible)
      setTimeout(() => {
        actions.clearError();
      }, 100);
    }
  }, [state.error, actions]);

  const handleCreateRoom = () => {
    setShowCreateModal(true);
  };

  const handleStartIndividualChat = () => {
    setShowUserList(true);
  };

  const handleUserSelect = async (userId: string) => {
    try {
      const room = await actions.createIndividualChat(userId);
      actions.selectRoom(room._id);
      setShowUserList(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to start individual chat',
        variant: 'destructive'
      });
    }
  };

  const handleIndividualChatCreated = (roomId: string) => {
    // Select the newly created room
    actions.selectRoom(roomId);
    setShowIndividualChatModal(false);
  };

  const handleSettings = () => {
    setShowSettings(true);
  };

  const handleBackToChatList = () => {
    console.log('🔙 Back button clicked, deselecting room');
    // Set flag to prevent restoration logic from interfering
    isExplicitlyDeselectingRef.current = true;
    
    // Leave the current room via WebSocket if we have one
    if (state.currentRoom?._id) {
      actions.leaveRoom(state.currentRoom._id);
    }
    
    // Remove roomId from URL first
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('roomId');
    setSearchParams(newParams, { replace: true });
    
    // Then deselect the current room
    actions.selectRoom('');
    
    // Clear the flag after a short delay
    setTimeout(() => {
      isExplicitlyDeselectingRef.current = false;
    }, 100);
  };


  const handleUpdateDisappearingMessages = async (days: number | null) => {
    if (!state.currentRoom?._id || user?.role !== 'mess-owner') return;
    
    setIsUpdatingSettings(true);
    try {
      const updatedRoom = await ChatService.updateRoomSettings(state.currentRoom._id, {
        disappearingMessagesDays: days
      });
      setDisappearingDays(days);
      // Update the room in state by reloading rooms
      await actions.loadRooms();
      // Also update currentRoom if it's the same room
      if (state.currentRoom?._id === updatedRoom._id) {
        actions.selectRoom(updatedRoom._id);
      }
      toast({
        title: 'Success',
        description: days ? `Messages will disappear after ${days} day${days > 1 ? 's' : ''}` : 'Disappearing messages disabled',
      });
    } catch (error: any) {
      console.error('Failed to update room settings:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update disappearing messages setting',
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const handleUpdateRoomName = async () => {
    if (!state.currentRoom?._id || user?.role !== 'mess-owner' || !roomName.trim()) return;
    
    setIsUpdatingSettings(true);
    try {
      const updatedRoom = await ChatService.updateRoomSettings(state.currentRoom._id, {
        name: roomName.trim()
      });
      setEditingRoomName(false);
      // Update the room in state by reloading rooms
      await actions.loadRooms();
      // Also update currentRoom if it's the same room
      if (state.currentRoom?._id === updatedRoom._id) {
        actions.selectRoom(updatedRoom._id);
      }
      toast({
        title: 'Success',
        description: 'Room name updated successfully',
      });
    } catch (error: any) {
      console.error('Failed to update room name:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update room name',
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const handleUpdateRoomDescription = async () => {
    if (!state.currentRoom?._id || user?.role !== 'mess-owner') return;
    
    setIsUpdatingSettings(true);
    try {
      const updatedRoom = await ChatService.updateRoomSettings(state.currentRoom._id, {
        description: roomDescription.trim()
      });
      setEditingRoomDescription(false);
      // Update the room in state by reloading rooms
      await actions.loadRooms();
      // Also update currentRoom if it's the same room
      if (state.currentRoom?._id === updatedRoom._id) {
        actions.selectRoom(updatedRoom._id);
      }
      toast({
        title: 'Success',
        description: 'Room description updated successfully',
      });
    } catch (error: any) {
      console.error('Failed to update room description:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update room description',
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const handleStartPrivateChat = async (userId: string) => {
    try {
      setIsOpeningChat(true);
      const room = await actions.createIndividualChat(userId);
      // Select the newly created room
      actions.selectRoom(room._id);
      // Update URL
      const newParams = new URLSearchParams(searchParams);
      newParams.set('roomId', room._id);
      setSearchParams(newParams, { replace: true });
      setShowSettings(false);
      toast({
        title: 'Success',
        description: 'Private chat started',
      });
    } catch (error: any) {
      console.error('Failed to start private chat:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to start private chat',
        variant: 'destructive',
      });
    } finally {
      setIsOpeningChat(false);
    }
  };

  const getRoomTypeIcon = (type: string) => {
    switch (type) {
      case 'mess': return <Users className="w-6 h-6 text-blue-500" />;
      case 'direct': return <MessageCircle className="w-6 h-6 text-purple-500" />;
      case 'admin': return <span className="material-icons text-red-500 text-2xl">admin_panel_settings</span>;
      default: return <MessageCircle className="w-6 h-6 text-muted-foreground" />;
    }
  };

  // Determine if we should show room list or loading/chat
  // If restoring from URL, don't show room list until restoration is complete
  const shouldShowRoomList = !isRestoringFromUrl && !state.currentRoom;
  // Only show loading if we're actively restoring AND don't have a current room yet
  // Once we have a room, show it immediately even if messages are still loading
  const isRestoring = isRestoringFromUrl && !state.currentRoom && state.rooms.length > 0;

  // Clear restoring flag when room is actually selected
  useEffect(() => {
    if (isRestoringFromUrl && state.currentRoom) {
      setIsRestoringFromUrl(false);
      lastRestoredRoomIdRef.current = state.currentRoom._id;
    }
  }, [isRestoringFromUrl, state.currentRoom]);

  return (
    <div className="flex h-screen lg:h-[calc(100vh-2rem)] bg-background overflow-hidden">
      {/* Sidebar - Hidden on mobile when chat is selected, also hidden when restoring */}
      <div className={`w-full lg:w-80 bg-card border-r border-border flex-shrink-0 ${(state.currentRoom || isRestoring) ? 'hidden lg:block' : 'block'}`}>
        {showUserList ? (
          <UserList
            onUserSelect={handleUserSelect}
            isVisible={showUserList}
            onClose={() => setShowUserList(false)}
          />
        ) : shouldShowRoomList ? (
          <ChatRoomList
            onCreateRoom={canCreateRooms ? handleCreateRoom : undefined}
            onSettings={handleSettings}
            canCreateRooms={canCreateRooms}
            onStartIndividualChat={user?.role === 'mess-owner' ? handleStartIndividualChat : undefined}
          />
        ) : null}
      </div>

      {/* Main Chat Area - Takes remaining space */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
        {/* Chat Header - Only show when room is selected */}
        {state.currentRoom ? (
          <div className="bg-card border-b border-border px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0">
            <div className="flex items-center justify-between gap-2 sm:gap-4 min-w-0">
              <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
                {/* Back arrow for mobile devices */}
                <button
                  onClick={handleBackToChatList}
                  className="lg:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all duration-200 flex-shrink-0"
                  title="Back to chat list"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center flex-shrink-0">
                  {getRoomTypeIcon(state.currentRoom.type)}
                </div>
                <div 
                  className={`min-w-0 flex-1 overflow-hidden ${user?.role === 'mess-owner' && state.currentRoom.type === 'mess' ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                  onClick={() => {
                    if (user?.role === 'mess-owner' && state.currentRoom?.type === 'mess') {
                      handleSettings();
                    }
                  }}
                  title={user?.role === 'mess-owner' && state.currentRoom.type === 'mess' ? 'Click to edit community settings' : ''}
                >
                  <h1 className="text-lg sm:text-xl font-bold text-card-foreground truncate">
                    {state.currentRoom.name || 'Chat Room'}
                  </h1>
                  <div className="flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm text-muted-foreground mb-1">
                    <div className="flex items-center space-x-1">
                      <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{(state.currentRoom?.participants?.length ?? 0)} members</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>Active now</span>
                    </div>
                  </div>
                  
                  {/* Weekly Schedule and Meals Info - Only for mess rooms */}
                  {state.currentRoom.type === 'mess' && (getWeeklyDay() || getMealOptions()) && (
                    <div className="flex flex-col gap-1.5 mt-2">
                      {getWeeklyDay() && (
                        <div className="flex items-center space-x-2 px-2 py-1 bg-primary/10 dark:bg-primary/20 rounded-md">
                          <Calendar className="w-3.5 h-3.5 text-primary" />
                          <span className="text-xs sm:text-sm text-primary font-medium">Weekly: {getWeeklyDay()}</span>
                        </div>
                      )}
                      {getMealOptions() && (
                        <div className="flex items-center space-x-2 px-2 py-1 bg-primary/10 dark:bg-primary/20 rounded-md">
                          <Utensils className="w-3.5 h-3.5 text-primary" />
                          <span className="text-xs sm:text-sm text-primary font-medium">Meals: {getMealOptions()}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">


                {/* Settings */}
                <button
                  onClick={handleSettings}
                  className="p-2 sm:p-3 text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl transition-all duration-200 group flex-shrink-0"
                  title="Chat settings"
                  aria-label="Chat settings"
                >
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-90 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-card border-b border-border px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <h1 className="text-lg sm:text-xl font-bold text-card-foreground">Chat Community</h1>
              </div>
            </div>
          </div>
        )}

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {isRestoring ? (
            <div className="flex-1 flex items-center justify-center bg-muted/20 p-4 sm:p-8">
              <div className="text-center max-w-md w-full">
                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg animate-pulse">
                  <MessageCircle className="w-8 h-8 sm:w-12 sm:h-12 text-primary" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-card-foreground mb-2 sm:mb-3">
                  Loading chat...
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Restoring your conversation
                </p>
              </div>
            </div>
          ) : state.currentRoom ? (
            <ChatMessages roomId={state.currentRoom?._id} />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-muted/20 p-4 sm:p-8 overflow-y-auto">
              <div className="text-center max-w-md w-full">
                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
                  <MessageCircle className="w-8 h-8 sm:w-12 sm:h-12 text-primary" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-card-foreground mb-2 sm:mb-3">
                  Welcome to Chat Community
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed px-4">
                  {canCreateRooms
                    ? "Select a chat room to start messaging with your community"
                    : "Select a chat room to start messaging with your mess community"
                  }
                </p>
                {!canCreateRooms && (
                  <p className="text-xs sm:text-sm text-muted-foreground/70 mb-4 sm:mb-6 px-4">
                    Your mess owner will create chat rooms for you to join
                  </p>
                )}
                {canCreateRooms && (
                  <button
                    onClick={handleCreateRoom}
                    className="px-4 py-2 sm:px-6 sm:py-3 bg-primary text-primary-foreground rounded-lg sm:rounded-xl hover:bg-primary/90 transition-all duration-200 flex items-center gap-2 mx-auto shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base"
                  >
                    <Users className="w-4 h-4" />
                    Start New Chat
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {canCreateRooms && (
        <CreateRoomModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Individual Chat Modal */}
      {user?.role === 'mess-owner' && (
        <IndividualChatModal
          isOpen={showIndividualChatModal}
          onClose={() => setShowIndividualChatModal(false)}
          onChatCreated={handleIndividualChatCreated}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={() => setShowSettings(false)}>
          <div className="bg-card border border-border rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] my-4" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-card-foreground">
                    {user?.role === 'mess-owner' && state.currentRoom?.type === 'mess' ? 'Community Settings' : 'Chat Settings'}
                  </h2>
                </div>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-1.5 sm:p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                  aria-label="Close settings"
                >
                  <span className="material-icons text-lg sm:text-xl">close</span>
                </button>
              </div>
              <div className="space-y-4 sm:space-y-6 max-h-[calc(90vh-120px)] overflow-y-auto">
                {/* Edit Room Name - Only for mess owners on mess rooms */}
                {user?.role === 'mess-owner' && state.currentRoom?.type === 'mess' && (
                  <div className="p-3 sm:p-4 bg-muted/30 rounded-lg sm:rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Edit className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                        <h3 className="text-sm sm:text-base font-medium text-card-foreground">Community Name</h3>
                      </div>
                    </div>
                    {editingRoomName ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={roomName}
                          onChange={(e) => setRoomName(e.target.value)}
                          className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Enter community name"
                          autoFocus
                        />
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={handleUpdateRoomName}
                            disabled={isUpdatingSettings || !roomName.trim()}
                            className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingRoomName(false);
                              setRoomName(state.currentRoom?.name || '');
                            }}
                            className="px-3 py-1.5 bg-muted text-muted-foreground rounded-lg text-sm hover:bg-muted/80 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-card-foreground">{state.currentRoom?.name || 'No name'}</p>
                        <button
                          onClick={() => setEditingRoomName(true)}
                          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Edit Room Description - Only for mess owners on mess rooms */}
                {user?.role === 'mess-owner' && state.currentRoom?.type === 'mess' && (
                  <div className="p-3 sm:p-4 bg-muted/30 rounded-lg sm:rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Edit className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                        <h3 className="text-sm sm:text-base font-medium text-card-foreground">Description</h3>
                      </div>
                    </div>
                    {editingRoomDescription ? (
                      <div className="space-y-2">
                        <textarea
                          value={roomDescription}
                          onChange={(e) => setRoomDescription(e.target.value)}
                          className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                          placeholder="Enter community description"
                          rows={3}
                        />
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={handleUpdateRoomDescription}
                            disabled={isUpdatingSettings}
                            className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingRoomDescription(false);
                              setRoomDescription(state.currentRoom?.description || '');
                            }}
                            className="px-3 py-1.5 bg-muted text-muted-foreground rounded-lg text-sm hover:bg-muted/80 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-card-foreground">{state.currentRoom?.description || 'No description'}</p>
                        <button
                          onClick={() => setEditingRoomDescription(true)}
                          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Disappearing Messages - Only for mess owners */}
                {user?.role === 'mess-owner' && state.currentRoom && (
                  <div className="p-3 sm:p-4 bg-muted/30 rounded-lg sm:rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Timer className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                        <h3 className="text-sm sm:text-base font-medium text-card-foreground">Disappearing Messages</h3>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                      Set messages to automatically disappear after a certain number of days
                    </p>
                    <div className="space-y-2">
                      <select
                        value={disappearingDays || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          handleUpdateDisappearingMessages(value === '' ? null : parseInt(value));
                        }}
                        disabled={isUpdatingSettings}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="">Off</option>
                        <option value="1">1 day</option>
                        <option value="7">7 days</option>
                        <option value="30">30 days</option>
                        <option value="90">90 days</option>
                      </select>
                      {disappearingDays && (
                        <p className="text-xs text-muted-foreground">
                          Messages in this chat will disappear after {disappearingDays} day{disappearingDays > 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                
                {/* Mess Users List - Only for mess owners on mess rooms */}
                {user?.role === 'mess-owner' && state.currentRoom?.type === 'mess' && (
                  <div className="p-3 sm:p-4 bg-muted/30 rounded-lg sm:rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                        <h3 className="text-sm sm:text-base font-medium text-card-foreground">Mess Users ({state.currentRoom?.participants?.length || 0})</h3>
                      </div>
                    </div>
                    {/* Search Users */}
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={userSearchQuery}
                        onChange={(e) => setUserSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {state.currentRoom?.participants && state.currentRoom.participants.length > 0 ? (
                        state.currentRoom.participants
                          .filter((p: any) => {
                            const userId = p.userId?._id || p.userId || p._id;
                            // Exclude current user
                            if (userId === user?.id) return false;
                            
                            // Apply search filter
                            if (userSearchQuery.trim()) {
                              const userName = p.userId?.firstName 
                                ? `${p.userId.firstName} ${p.userId.lastName || ''}`.trim()
                                : p.userId?.email || 'Unknown User';
                              const userEmail = p.userId?.email || '';
                              const searchLower = userSearchQuery.toLowerCase();
                              return userName.toLowerCase().includes(searchLower) || 
                                     userEmail.toLowerCase().includes(searchLower);
                            }
                            
                            return true;
                          })
                          .map((participant: any) => {
                            const userId = participant.userId?._id || participant.userId || participant._id;
                            const userName = participant.userId?.firstName 
                              ? `${participant.userId.firstName} ${participant.userId.lastName || ''}`.trim()
                              : participant.userId?.email || 'Unknown User';
                            const userEmail = participant.userId?.email || '';
                            
                            return (
                              <div
                                key={userId}
                                className="flex items-center justify-between p-2 bg-background rounded-lg border border-border hover:bg-accent/50 transition-colors"
                              >
                                <div className="flex items-center space-x-2 flex-1 min-w-0">
                                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                    <UserIcon className="w-4 h-4 text-primary" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-card-foreground truncate">{userName}</p>
                                    <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleStartPrivateChat(userId)}
                                  disabled={isOpeningChat}
                                  className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Send private message"
                                >
                                  <Send className="w-4 h-4" />
                                </button>
                              </div>
                            );
                          })
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">No users found</p>
                      )}
                      {userSearchQuery.trim() && state.currentRoom?.participants && 
                       state.currentRoom.participants.filter((p: any) => {
                         const userId = p.userId?._id || p.userId || p._id;
                         if (userId === user?.id) return false;
                         if (userSearchQuery.trim()) {
                           const userName = p.userId?.firstName 
                             ? `${p.userId.firstName} ${p.userId.lastName || ''}`.trim()
                             : p.userId?.email || 'Unknown User';
                           const userEmail = p.userId?.email || '';
                           const searchLower = userSearchQuery.toLowerCase();
                           return userName.toLowerCase().includes(searchLower) || 
                                  userEmail.toLowerCase().includes(searchLower);
                         }
                         return true;
                       }).length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">No users found matching "{userSearchQuery}"</p>
                      )}
                    </div>
                  </div>
                )}


              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};