import React, { useEffect, useState } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../../../contexts/AuthContext';
import { ChatRoom } from '../../types/chat.types';
import { formatDistanceToNow } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { 
  MessageCircle, 
  Users, 
  Plus, 
  Search,
  Settings,
  Clock,
  Hash,
  Trash2,
  User
} from 'lucide-react';

interface ChatRoomListProps {
  onCreateRoom?: (() => void) | undefined;
  onSettings: () => void;
  canCreateRooms?: boolean;
  onStartIndividualChat?: (() => void) | undefined;
}

export const ChatRoomList: React.FC<ChatRoomListProps> = ({ 
  onCreateRoom, 
  onSettings,
  canCreateRooms = false,
  onStartIndividualChat
}) => {
  const { state, actions } = useChat();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRooms, setFilteredRooms] = useState<ChatRoom[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Don't load rooms here - ChatCommunity already loads them
  // This prevents duplicate API calls

  useEffect(() => {
    // Deduplicate rooms by _id first
    const uniqueRooms = Array.from(
      new Map(state.rooms.map(room => [room._id, room])).values()
    );

    const filtered = uniqueRooms.filter(room =>
      room.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Sort rooms: mess community groups first for mess owners, then by updatedAt
    const sorted = filtered.sort((a, b) => {
      // For mess owners, pin mess community groups at the top
      if (user?.role === 'mess-owner') {
        const aIsMess = a.type === 'mess';
        const bIsMess = b.type === 'mess';
        
        if (aIsMess && !bIsMess) return -1; // a comes first
        if (!aIsMess && bIsMess) return 1;  // b comes first
        // If both are mess or both are not mess, sort by updatedAt
      }
      
      // Sort by updatedAt (most recent first)
      const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return bTime - aTime;
    });
    
    setFilteredRooms(sorted);
  }, [state.rooms, searchTerm, user?.role]);

  const getRoomIcon = (room: ChatRoom) => {
    const iconClass = "w-5 h-5";
    switch (room.type) {
      case 'mess':
        return <Users className={`${iconClass} text-blue-500`} />;
      case 'direct':
        return <MessageCircle className={`${iconClass} text-purple-500`} />;
      case 'individual':
        return <User className={`${iconClass} text-green-500`} />;
      case 'admin':
        return <span className={`material-icons ${iconClass} text-red-500`}>admin_panel_settings</span>;
      default:
        return <MessageCircle className={`${iconClass} text-muted-foreground`} />;
    }
  };

  const getLastMessageTime = (room: ChatRoom) => {
    if (!room.updatedAt) return '';
    return formatDistanceToNow(new Date(room.updatedAt), { addSuffix: true });
  };

  const getUnreadCount = (_room: ChatRoom) => {
    // For now, return 0 since we don't have actual unread message tracking
    // This should be calculated based on unread messages in the future
    return 0;
  };

  const getRoomTypeLabel = (type: string) => {
    switch (type) {
      case 'mess': return 'Community';
      case 'direct': return 'Direct Message';
      case 'individual': return 'Individual Chat';
      case 'admin': return 'Admin Chat';
      default: return 'Chat';
    }
  };

  const getRoomTypeColor = (type: string) => {
    switch (type) {
      case 'mess': return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'direct': return 'bg-purple-500/10 text-purple-600 border-purple-200';
      case 'individual': return 'bg-green-500/10 text-green-600 border-green-200';
      case 'admin': return 'bg-red-500/10 text-red-600 border-red-200';
      default: return 'bg-muted/10 text-muted-foreground border-border';
    }
  };

  const handleDeleteRoom = async (roomId: string, roomName: string) => {
    try {
      await actions.deleteRoom(roomId);
      toast({
        title: 'Room deleted',
        description: `${roomName} has been deleted successfully`,
        variant: 'default'
      });
      setShowDeleteConfirm(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete room',
        variant: 'destructive'
      });
    }
  };

  const canDeleteRoom = (room: ChatRoom) => {
    // Only mess owners and admins can delete rooms
    // Don't allow deletion of default mess groups
    return (user?.role === 'mess-owner' || user?.role === 'admin') && 
           room.type !== 'mess' && 
           room.createdBy._id === user?.id;
  };

  return (
    <div className="flex flex-col h-full bg-card/50 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-card-foreground">Chats</h2>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={onSettings}
              className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all duration-200 group"
              title="Settings"
            >
              <Settings className="w-4 h-4 group-hover:rotate-90 transition-transform" />
            </button>
            {(user?.role === 'mess-owner' || user?.role === 'admin') && onStartIndividualChat && (
              <button
                onClick={onStartIndividualChat}
                className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all duration-200 group"
                title="Start Individual Chat"
              >
                <User className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </button>
            )}
            {canCreateRooms && onCreateRoom && (
              <button
                onClick={onCreateRoom}
                className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all duration-200 group"
                title="Create New Chat"
              >
                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-input rounded-xl focus:ring-2 focus:ring-ring focus:border-transparent bg-background/50 text-foreground placeholder:text-muted-foreground transition-all duration-200"
          />
        </div>
      </div>

      {/* Room List */}
      <div className="flex-1 overflow-y-auto">
        {state.isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="flex flex-col items-center space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary/20 border-t-primary"></div>
              <p className="text-sm text-muted-foreground">Loading chats...</p>
            </div>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground p-6">
            <div className="w-16 h-16 bg-muted/20 rounded-2xl flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 opacity-50" />
            </div>
            <p className="text-sm font-medium mb-1">No chats found</p>
            <p className="text-xs text-muted-foreground/70 text-center">
              {searchTerm ? 'Try a different search term' : 'Start a conversation'}
            </p>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {filteredRooms.map((room) => {
              const unreadCount = getUnreadCount(room);
              const isActive = state.currentRoom?._id === room._id;
              
              return (
                <div
                  key={room._id}
                  onClick={() => {
                    actions.selectRoom(room._id);
                    actions.joinRoom(room._id);
                  }}
                  className={`group p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                    isActive
                      ? 'bg-primary/10 border-2 border-primary/30 shadow-lg'
                      : 'hover:bg-accent/50 hover:shadow-sm border border-transparent'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isActive ? 'bg-primary/20' : 'bg-muted/30'
                      }`}>
                        {getRoomIcon(room)}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-semibold text-card-foreground">
                          {room.name}
                        </h3>
                        <div className="flex items-center space-x-2">
                          {unreadCount > 0 && (
                            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-2 text-xs font-medium text-primary-foreground bg-primary rounded-full">
                              {unreadCount}
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {getLastMessageTime(room)}
                          </span>
                        </div>
                      </div>
                      
                      {/* Hide description and tag for individual chats */}
                      {room.type !== 'individual' && (
                        <p className="text-xs text-muted-foreground mb-2">
                          {room.description || `${room.participants.length} members`}
                        </p>
                      )}
                      
                      <div className={`flex items-center ${room.type === 'individual' ? 'justify-end' : 'justify-between'}`}>
                        {/* Hide tag for individual chats */}
                        {room.type !== 'individual' && (
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-lg border ${getRoomTypeColor(room.type)}`}>
                            <Hash className="w-3 h-3 mr-1" />
                            {getRoomTypeLabel(room.type)}
                          </span>
                        )}
                        
                        <div className="flex items-center space-x-1">
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <Users className="w-3 h-3" />
                            <span>{room.participants.length}</span>
                          </div>
                          
                          {canDeleteRoom(room) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowDeleteConfirm(room._id);
                              }}
                              className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border/50 bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {filteredRooms.length} chat{filteredRooms.length !== 1 ? 's' : ''}
          </div>
          <div className="text-xs text-muted-foreground">
            SmartMess Chat
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-card-foreground">Delete Chat Room</h3>
                  <p className="text-sm text-muted-foreground">This action cannot be undone</p>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-6">
                Are you sure you want to delete this chat room? All messages and data will be permanently removed.
              </p>
              
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const room = filteredRooms.find(r => r._id === showDeleteConfirm);
                    if (room) {
                      handleDeleteRoom(room._id, room.name);
                    }
                  }}
                  className="px-4 py-2 text-sm font-medium text-destructive-foreground bg-destructive hover:bg-destructive/90 rounded-lg transition-colors"
                >
                  Delete Room
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};