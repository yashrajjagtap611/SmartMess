import React, { useState, useEffect } from 'react';
import { useChat } from '../../contexts/ChatContext';
// import { useAuth } from '../../../../contexts/AuthContext'; // Unused
import { MessMember } from '../../types/chat.types';
import { 
  Search, 
  User, 
  MessageCircle, 
  Users
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface UserListProps {
  onUserSelect: (userId: string) => void;
  isVisible: boolean;
  onClose: () => void;
}

export const UserList: React.FC<UserListProps> = ({
  onUserSelect,
  isVisible,
  onClose
}) => {
  const { actions, state } = useChat();
  // const { user } = useAuth(); // Unused
  const [searchQuery, setSearchQuery] = useState('');
  const [_isCreating, setIsCreating] = useState(false);
  const [filteredMembers, setFilteredMembers] = useState<MessMember[]>([]);

  // Load mess members when component becomes visible
  useEffect(() => {
    if (isVisible && state.messMembers.length === 0) {
      actions.loadMessMembers();
    }
  }, [isVisible, state.messMembers.length, actions]);

  // Filter members based on search query and deduplicate
  useEffect(() => {
    // Deduplicate members by _id
    const uniqueMembers = Array.from(
      new Map(state.messMembers.map(member => [member._id, member])).values()
    );

    if (!searchQuery.trim()) {
      setFilteredMembers(uniqueMembers);
    } else {
      const filtered = uniqueMembers.filter(member =>
        member.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMembers(filtered);
    }
  }, [searchQuery, state.messMembers]);

  const handleUserClick = async (member: MessMember) => {
    try {
      setIsCreating(true);
      await onUserSelect(member._id);
      onClose();
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

  if (!isVisible) return null;

  return (
    <div className="flex flex-col h-full bg-card/50 backdrop-blur-sm">
      {/* Header */}
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-card-foreground">Mess Members</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
          >
            <User className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-input rounded-xl focus:ring-2 focus:ring-ring focus:border-transparent bg-background/50 text-foreground placeholder:text-muted-foreground transition-all duration-200"
          />
        </div>
      </div>

      {/* User List */}
      <div className="flex-1 overflow-y-auto">
        {state.isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="flex flex-col items-center space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary/20 border-t-primary"></div>
              <p className="text-sm text-muted-foreground">Loading members...</p>
            </div>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <Users className="w-12 h-12 opacity-50 mb-3" />
            <p className="text-sm font-medium">No members found</p>
            <p className="text-xs text-muted-foreground/70">
              {searchQuery ? 'Try a different search term' : 'No mess members available'}
            </p>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {filteredMembers.map((member) => (
              <div
                key={member._id}
                onClick={() => handleUserClick(member)}
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
      <div className="p-4 border-t border-border/50 bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {filteredMembers.length} member{filteredMembers.length !== 1 ? 's' : ''}
          </div>
          <div className="text-xs text-muted-foreground">
            Click to start chat
          </div>
        </div>
      </div>
    </div>
  );
};
