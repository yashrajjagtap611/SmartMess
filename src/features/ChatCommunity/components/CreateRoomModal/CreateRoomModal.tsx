import React, { useState, useEffect } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { useMessProfile } from '../../../../contexts/MessProfileContext';
import { X, Users, Search, Check, Plus } from 'lucide-react';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({ isOpen, onClose }) => {
  const { state, actions } = useChat();
  const { messProfile } = useMessProfile();
  const [roomName, setRoomName] = useState('');
  const [roomDescription, setRoomDescription] = useState('');
  const [roomType, setRoomType] = useState<'mess' | 'direct' | 'admin'>('mess');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      actions.loadMessMembers();
    }
  }, [isOpen]);

  const filteredMembers = state.messMembers.filter(member =>
    `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMemberToggle = (memberId: string) => {
    setSelectedMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!roomName.trim() || selectedMembers.length === 0) {
      return;
    }

    setIsLoading(true);
    try {
      const roomData: any = {
        name: roomName.trim(),
        description: roomDescription.trim(),
        type: roomType,
        participantIds: selectedMembers
      };

      // Add messId for mess-type rooms
      if (roomType === 'mess' && messProfile?._id) {
        roomData.messId = messProfile._id;
      }

      await actions.createRoom(roomData);
      
      onClose();
      resetForm();
    } catch (error) {
      console.error('Failed to create room:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setRoomName('');
    setRoomDescription('');
    setRoomType('mess');
    setSelectedMembers([]);
    setSearchTerm('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Plus className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-card-foreground">Create New Chat</h2>
              <p className="text-sm text-muted-foreground">Start a conversation with your mess members</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          {/* Room Name */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-card-foreground">
              Room Name *
            </label>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Enter room name"
              className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground placeholder:text-muted-foreground"
              required
            />
          </div>

          {/* Room Description */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-card-foreground">
              Description
            </label>
            <textarea
              value={roomDescription}
              onChange={(e) => setRoomDescription(e.target.value)}
              placeholder="Enter room description (optional)"
              rows={3}
              className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground placeholder:text-muted-foreground resize-none"
            />
          </div>

          {/* Room Type - Fixed to mess type for community chat */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-card-foreground">
              Room Type
            </label>
            <div className="p-4 border border-border rounded-lg bg-muted/30">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-blue-500" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-card-foreground text-sm">Community Chat</div>
                  <div className="text-xs text-muted-foreground">Main community group for announcements, meal discussions, and general chat</div>
                </div>
              </div>
            </div>
          </div>

          {/* Member Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-card-foreground">
              Select Members *
            </label>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* Member List */}
            <div className="max-h-48 overflow-y-auto border border-border rounded-lg bg-muted/30">
              {filteredMembers.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No members found</p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {filteredMembers.map((member) => (
                    <label
                      key={member._id}
                      className="flex items-center space-x-3 p-3 hover:bg-accent/50 rounded-lg cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(member._id)}
                        onChange={() => handleMemberToggle(member._id)}
                        className="text-primary focus:ring-ring"
                      />
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {member.firstName.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-card-foreground truncate">
                          {member.firstName} {member.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground truncate">
                          {member.email}
                        </div>
                      </div>
                      {selectedMembers.includes(member._id) && (
                        <Check className="w-4 h-4 text-primary" />
                      )}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {selectedMembers.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {selectedMembers.length} member{selectedMembers.length !== 1 ? 's' : ''} selected
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={handleClose}
              className="w-full sm:w-auto px-6 py-3 text-muted-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!roomName.trim() || selectedMembers.length === 0 || isLoading}
              className="w-full sm:w-auto px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Create Chat</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
