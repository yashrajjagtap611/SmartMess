import React, { useState, useEffect } from 'react';
import { useChat } from '../../contexts/ChatContext';
// import { useAuth } from '../../../../contexts/AuthContext'; // Unused
import { MessMember } from '../../types/chat.types';
import { 
  X, 
  Search, 
  User, 
  MessageCircle, 
  Users
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface IndividualChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChatCreated?: (roomId: string) => void;
}

export const IndividualChatModal: React.FC<IndividualChatModalProps> = ({
  isOpen,
  onClose,
  onChatCreated
}) => {
  const { actions, state } = useChat();
  // const { user } = useAuth(); // Unused
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [filteredMembers, setFilteredMembers] = useState<MessMember[]>([]);

  // Load mess members when modal opens
  useEffect(() => {
    if (isOpen && state.messMembers.length === 0) {
      actions.loadMessMembers();
    }
  }, [isOpen, state.messMembers.length, actions]);

  // Filter members based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredMembers(state.messMembers);
    } else {
      const filtered = state.messMembers.filter(member =>
        member.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMembers(filtered);
    }
  }, [searchQuery, state.messMembers]);

  const handleUserSelect = async (member: MessMember) => {
    try {
      setIsCreating(true);
      const room = await actions.createIndividualChat(member._id);
      
      toast({
        title: 'Chat Started',
        description: `Started individual chat with ${member.firstName} ${member.lastName}`,
        variant: 'default'
      });

      // Close modal and notify parent
      onClose();
      onChatCreated?.(room._id);
      
      // Reset state
      setSearchQuery('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to start individual chat',
        variant: 'destructive'
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-card-foreground">Start Individual Chat</h2>
                <p className="text-sm text-muted-foreground">
                  Click on any user to start chatting directly
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-border/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-input rounded-xl focus:ring-2 focus:ring-ring focus:border-transparent bg-background/50 text-foreground placeholder:text-muted-foreground transition-all duration-200"
            />
          </div>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto p-6">
          {state.isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="flex flex-col items-center space-y-3">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary/20 border-t-primary"></div>
                <p className="text-sm text-muted-foreground">Loading users...</p>
              </div>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <Users className="w-12 h-12 opacity-50 mb-3" />
              <p className="text-sm font-medium">No users found</p>
              <p className="text-xs text-muted-foreground/70">
                {searchQuery ? 'Try a different search term' : 'No mess members available'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredMembers.map((member) => (
                <div
                  key={member._id}
                  onClick={() => handleUserSelect(member)}
                  className="p-4 rounded-xl cursor-pointer transition-all duration-200 border hover:bg-accent/50 hover:shadow-sm border-transparent hover:border-primary/20 group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-muted/30 group-hover:bg-primary/20 transition-colors">
                        {member.profilePicture ? (
                          <img
                            src={member.profilePicture}
                            alt={`${member.firstName} ${member.lastName}`}
                            className="w-12 h-12 rounded-xl object-cover"
                          />
                        ) : (
                          <User className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-card-foreground group-hover:text-primary transition-colors">
                          {member.firstName} {member.lastName}
                        </h3>
                        <MessageCircle className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {member.email}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-lg bg-blue-500/10 text-blue-600 border border-blue-200">
                          {member.role}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Joined {new Date(member.joinDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border/50 bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              <span className="flex items-center space-x-2">
                <MessageCircle className="w-4 h-4 text-primary" />
                <span>Click on any user to start chatting</span>
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
              >
                Cancel
              </button>
              {isCreating && (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary/20 border-t-primary"></div>
                  <span>Starting chat...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
