import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../../../contexts/AuthContext';
import { ChatMessage } from '../../types/chat.types';
import { format } from 'date-fns';
import { ROUTES } from '../../../../constants/routes';
import { 
  Send, 
  Smile, 
  Paperclip, 
  Pin,
  MessageCircle,
  Check,
  BarChart3,
  MoreVertical,
  Trash2,
  Heart,
  Users,
  X,
  ThumbsUp,
  Plus,
  Reply,
  FileText,
  Camera,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { EmojiPicker } from '../../../../components/ui/emoji-picker';
import { Poll, PollModal } from '../Poll';
import { Poll as PollType } from '../../types/chat.types';
import { toast } from '../../../../hooks/use-toast';

interface ChatMessagesProps {
  roomId: string;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({ roomId }) => {
  const { state, actions } = useChat();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewCaption, setPreviewCaption] = useState('');
  const attachmentMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const previewImageRef = useRef<HTMLImageElement>(null);
  const [showPollModal, setShowPollModal] = useState(false);
  const [editingPoll, setEditingPoll] = useState<PollType | null>(null);
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [showMessageMenu, setShowMessageMenu] = useState<string | null>(null);
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
  const [lastTap, setLastTap] = useState<number>(0);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  // Removed allImages state - using allImagesMemo directly to prevent infinite loops
  const [imageCache, setImageCache] = useState<Map<string, string>>(new Map());
  const [visibleImages, setVisibleImages] = useState<Set<string>>(new Set());
  const imageRefs = useRef<Map<string, HTMLImageElement>>(new Map());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageMenuRef = useRef<HTMLDivElement>(null);
  const reactionPickerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);
  const isInitialLoadRef = useRef<boolean>(true);
  const hasScrolledToBottomRef = useRef<boolean>(false);
  const lastLoadedRoomIdRef = useRef<string | null>(null); // Track last loaded room to prevent duplicate loads
  // Swipe detection
  const swipeStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const swipeThreshold = 50; // Minimum swipe distance in pixels
  const swipeTimeThreshold = 300; // Maximum swipe time in milliseconds
  // Minimal markdown renderer: supports **bold**, *italic*, and line breaks
  const renderMessageHtml = (text: string) => {
    if (!text) return '';
    // Escape HTML to prevent XSS
    const escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    // Bold **text**
    const withBold = escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Italic *text*
    const withItalic = withBold.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
    // Newlines to <br/>
    const withBreaks = withItalic.replace(/\n/g, '<br/>');
    return withBreaks;
  };

  // Filter messages for current room (memoized to prevent unnecessary recalculations)
  const roomMessages = useMemo(() => {
    return state.messages.filter(msg => msg.roomId === roomId);
  }, [state.messages, roomId]);

  useEffect(() => {
    if (roomId && lastLoadedRoomIdRef.current !== roomId) {
      // Reset flags when room changes
      isInitialLoadRef.current = true;
      hasScrolledToBottomRef.current = false;
      lastLoadedRoomIdRef.current = roomId;
      actions.loadMessages(roomId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]); // Only depend on roomId, actions.loadMessages is stable

  // Scroll to bottom when messages change, but use instant scroll on initial load
  useEffect(() => {
    if (roomMessages.length === 0) {
      // No messages yet, don't scroll
      return;
    }

    // On initial load, scroll instantly to bottom without animation
    if (isInitialLoadRef.current && !hasScrolledToBottomRef.current) {
      // Use multiple attempts to ensure DOM and images are fully rendered
      const attemptScroll = (attempt: number = 0) => {
        const container = messagesContainerRef.current;
        if (container) {
          const previousScrollHeight = container.scrollHeight;
          // Instant scroll to bottom
          container.scrollTop = container.scrollHeight;
          
          // Check if scroll height changed (images loading)
          setTimeout(() => {
            if (container.scrollHeight !== previousScrollHeight && attempt < 3) {
              // Scroll height changed, try again
              attemptScroll(attempt + 1);
            } else {
              // Done scrolling
              hasScrolledToBottomRef.current = true;
              isInitialLoadRef.current = false;
            }
          }, 100);
        }
      };
      
      // Start scrolling after a small delay to ensure DOM is rendered
      const timeoutId = setTimeout(() => {
        attemptScroll();
      }, 50);
      
      return () => clearTimeout(timeoutId);
    } else if (!isInitialLoadRef.current) {
      // After initial load, use smooth scroll for new messages
      // Only scroll if user is near the bottom (within 200px)
      const container = messagesContainerRef.current;
      if (container) {
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 200;
        if (isNearBottom) {
          scrollToBottom();
        }
      }
    }
  }, [roomMessages.length, roomId]);

  // Helper function to construct image URL (cached)
  const constructImageUrl = useCallback((fileUrl: string): string => {
    const apiBaseUrl = import.meta.env['VITE_API_BASE_URL'] || import.meta.env['VITE_API_URL'] || 'http://localhost:5000';
    const serverBaseUrl = apiBaseUrl.replace(/\/api$/, '');
    
    if (fileUrl.startsWith('http')) {
      return fileUrl;
    } else if (fileUrl.startsWith('/uploads/')) {
      return `${serverBaseUrl}${fileUrl}`;
    } else if (fileUrl.includes('uploads/')) {
      return `${serverBaseUrl}/${fileUrl}`;
    } else {
      return `${serverBaseUrl}/uploads/chat/${fileUrl}`;
    }
  }, []);

  // Collect all images from current room messages for full-screen viewer (memoized for caching)
  const allImagesMemo = useMemo(() => {
    const images: Array<{ url: string; caption?: string; sender?: string }> = [];
    
    roomMessages.forEach((message) => {
      if (message.attachments && message.attachments.length > 0) {
        message.attachments.forEach((attachment) => {
          const isImage = attachment.fileType?.startsWith('image/') || 
                         message.messageType === 'image' ||
                         /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(attachment.fileName);
          
          if (isImage && attachment.fileUrl) {
            const imageUrl = constructImageUrl(attachment.fileUrl);
            
            const senderName = message.senderId?.firstName 
              ? `${message.senderId.firstName}${message.senderId.lastName ? ` ${message.senderId.lastName}` : ''}`
              : message.senderId?.email || 'Unknown';
            
            const caption = message.content?.trim();
            images.push({
              url: imageUrl,
              ...(caption ? { caption } : {}),
              sender: senderName
            });
          }
        });
      }
    });
    
    return images;
  }, [roomMessages, constructImageUrl]);

  // Use allImagesMemo directly - no intermediate state needed

  // Intersection Observer for lazy loading images - only load when visible
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const imageUrl = entry.target.getAttribute('data-image-url');
          if (imageUrl && entry.isIntersecting) {
            setVisibleImages((prev) => {
              // Only update if not already visible to prevent unnecessary re-renders
              if (prev.has(imageUrl)) return prev;
              return new Set(prev).add(imageUrl);
            });
            // Unobserve once loaded to improve performance
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: '100px', // Start loading 100px before image enters viewport
        threshold: 0.01
      }
    );

    // Use setTimeout to ensure DOM is updated before observing
    const timeoutId = setTimeout(() => {
      // Observe all image placeholder elements that aren't already visible
      imageRefs.current.forEach((imgElement) => {
        if (imgElement) {
          const imageUrl = imgElement.getAttribute('data-image-url');
          if (imageUrl && !visibleImages.has(imageUrl)) {
            observer.observe(imgElement);
          }
        }
      });
    }, 100); // Small delay to ensure DOM is fully rendered

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [roomMessages.length]); // Removed visibleImages.size from dependencies to prevent infinite loop

  // Keyboard navigation for image modal
  useEffect(() => {
    if (!showImageModal) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowImageModal(false);
      } else if (e.key === 'ArrowLeft' && allImagesMemo.length > 1) {
        setSelectedImageIndex((prev) => 
          prev > 0 ? prev - 1 : allImagesMemo.length - 1
        );
      } else if (e.key === 'ArrowRight' && allImagesMemo.length > 1) {
        setSelectedImageIndex((prev) => 
          prev < allImagesMemo.length - 1 ? prev + 1 : 0
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showImageModal, allImagesMemo.length]);

  // Handle mobile keyboard and viewport changes
  useEffect(() => {
    const handleResize = () => {
      // Scroll to bottom when viewport changes (keyboard appears/disappears)
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    };

    const handleFocus = () => {
      // Scroll to bottom when input is focused (keyboard appears)
      setTimeout(() => {
        scrollToBottom();
      }, 300);
    };

    const textarea = textareaRef.current;
    if (textarea) {
      textarea.addEventListener('focus', handleFocus);
      window.addEventListener('resize', handleResize);
      // Handle visual viewport changes (mobile keyboard)
      if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', handleResize);
      }
    }

    return () => {
      if (textarea) {
        textarea.removeEventListener('focus', handleFocus);
      }
      window.removeEventListener('resize', handleResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      }
    };
  }, []);

  useEffect(() => {
    // Close reaction picker when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (reactionPickerRef.current && !reactionPickerRef.current.contains(event.target as Node)) {
        setShowReactionPicker(null);
      }
      if (messageMenuRef.current && !messageMenuRef.current.contains(event.target as Node)) {
        setShowMessageMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Adjust message menu dropdown position to stay within screen bounds
  useEffect(() => {
    if (!showMessageMenu || !messageMenuRef.current) return;

    const adjustMenuPosition = () => {
      const menu = messageMenuRef.current;
      if (!menu) return;

      // Get viewport dimensions
      const viewportWidth = window.innerWidth;
      const padding = 12; // Minimum padding from screen edges
      
      // Reset positioning first
      menu.style.position = 'absolute';
      menu.style.left = '';
      menu.style.right = '';
      menu.style.top = '';
      menu.style.transform = '';
      
      // Get actual rendered position (will be used after initial positioning)
      
      // Find the parent message bubble
      const messageBubble = menu.closest('[class*="rounded-2xl"]');
      if (!messageBubble) return;
      
      const bubbleRect = messageBubble.getBoundingClientRect();
      
      // Find the three-dot button
      const threeDotButton = messageBubble.querySelector('button[aria-label="Message options"]') as HTMLElement;
      
      // Calculate desired position (align with three-dot button or bubble right edge)
      let desiredRight: number;
      if (threeDotButton) {
        const buttonRect = threeDotButton.getBoundingClientRect();
        const parentElement = menu.offsetParent as HTMLElement;
        if (parentElement) {
          const parentRect = parentElement.getBoundingClientRect();
          desiredRight = parentRect.right - buttonRect.right;
        } else {
          desiredRight = viewportWidth - buttonRect.right;
        }
      } else {
        // Fallback to bubble right edge
        const parentElement = menu.offsetParent as HTMLElement;
        if (parentElement) {
          const parentRect = parentElement.getBoundingClientRect();
          desiredRight = parentRect.right - bubbleRect.right;
        } else {
          desiredRight = viewportWidth - bubbleRect.right;
        }
      }
      
      // Set initial position
      menu.style.right = `${desiredRight}px`;
      menu.style.left = 'auto';
      
      // Force reflow to get actual position
      void menu.offsetHeight;
      
      // Check actual position after render
      const actualRect = menu.getBoundingClientRect();
      
      // Adjust if it goes outside right edge
      if (actualRect.right > viewportWidth - padding) {
        menu.style.right = `${padding}px`;
        menu.style.left = 'auto';
      }
      // Adjust if it goes outside left edge
      else if (actualRect.left < padding) {
        menu.style.left = `${padding}px`;
        menu.style.right = 'auto';
      }
    };

    // Adjust position after render with multiple attempts for accuracy
    const timeout1 = setTimeout(adjustMenuPosition, 0);
    const timeout2 = setTimeout(adjustMenuPosition, 50);
    const timeout3 = setTimeout(adjustMenuPosition, 100);
    
    // Also adjust on window resize and scroll
    window.addEventListener('resize', adjustMenuPosition);
    window.addEventListener('scroll', adjustMenuPosition, true);
    
    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
      window.removeEventListener('resize', adjustMenuPosition);
      window.removeEventListener('scroll', adjustMenuPosition, true);
    };
  }, [showMessageMenu, state.messages]);

  // Adjust reaction picker position to stay within screen bounds
  useEffect(() => {
    if (!showReactionPicker || !reactionPickerRef.current) return;

    const adjustPosition = () => {
      const picker = reactionPickerRef.current;
      if (!picker) return;

      // Get viewport dimensions
      const viewportWidth = window.innerWidth;
      const padding = 12; // Minimum padding from screen edges
      
      // Find the parent message bubble to get its position
      const messageBubble = picker.closest('[class*="rounded-2xl"]');
      if (!messageBubble) return;
      
      // Check if message is from current user by checking if it has right alignment classes
      const messageContainer = picker.closest('[class*="items-end"]');
      const isCurrentUserMessage = messageContainer !== null;
      
      const bubbleRect = messageBubble.getBoundingClientRect();
      
      // Force a reflow to get accurate picker width
      picker.style.visibility = 'hidden';
      picker.style.display = 'block';
      const pickerWidth = picker.offsetWidth || (6 * 32 + 16); // Approximate width: 6 emojis * 32px + padding
      picker.style.visibility = '';
      picker.style.display = '';

      // Reset any previous positioning
      picker.style.position = 'absolute'; // Reset to absolute first
      picker.style.left = '';
      picker.style.right = '';
      picker.style.top = '';
      picker.style.transform = '';

      let newLeft: number | null = null;
      let newRight: number | null = null;

      if (isCurrentUserMessage) {
        // For outgoing messages, try to align to right edge of bubble
        const bubbleRight = bubbleRect.right;
        const proposedLeft = bubbleRight - pickerWidth;
        
        // Check if it goes outside right edge
        if (bubbleRight > viewportWidth - padding) {
          newRight = padding;
        } 
        // Check if it goes outside left edge
        else if (proposedLeft < padding) {
          newLeft = padding;
        } else {
          // Position relative to bubble's right edge
          const parentElement = picker.offsetParent as HTMLElement;
          if (parentElement) {
            const parentRect = parentElement.getBoundingClientRect();
            const relativeRight = parentRect.right - bubbleRight;
            picker.style.right = `${relativeRight}px`;
            picker.style.left = 'auto';
            return; // Early return for relative positioning
          }
        }
      } else {
        // For incoming messages, try to align to left edge of bubble
        const bubbleLeft = bubbleRect.left;
        
        // Check if it goes outside left edge
        if (bubbleLeft < padding) {
          newLeft = padding;
        }
        // Check if it goes outside right edge
        else if (bubbleLeft + pickerWidth > viewportWidth - padding) {
          newRight = padding;
        } else {
          // Position relative to bubble's left edge
          const parentElement = picker.offsetParent as HTMLElement;
          if (parentElement) {
            const parentRect = parentElement.getBoundingClientRect();
            const relativeLeft = bubbleLeft - parentRect.left;
            picker.style.left = `${relativeLeft}px`;
            picker.style.right = 'auto';
            return; // Early return for relative positioning
          }
        }
      }

      // Apply absolute viewport positioning if needed (fallback)
      if (newLeft !== null) {
        picker.style.position = 'fixed';
        picker.style.left = `${newLeft}px`;
        picker.style.right = 'auto';
        picker.style.top = `${bubbleRect.top - picker.offsetHeight - 8}px`;
      } else if (newRight !== null) {
        picker.style.position = 'fixed';
        picker.style.right = `${newRight}px`;
        picker.style.left = 'auto';
        picker.style.top = `${bubbleRect.top - picker.offsetHeight - 8}px`;
      }
    };

    // Adjust position after render with multiple attempts for accuracy
    const timeout1 = setTimeout(adjustPosition, 0);
    const timeout2 = setTimeout(adjustPosition, 50);
    
    // Also adjust on window resize and scroll
    window.addEventListener('resize', adjustPosition);
    window.addEventListener('scroll', adjustPosition, true);
    
    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      window.removeEventListener('resize', adjustPosition);
      window.removeEventListener('scroll', adjustPosition, true);
    };
  }, [showReactionPicker, state.messages]);

  const scrollToBottom = () => {
    // Use requestAnimationFrame for better mobile performance
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest'
      });
    });
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !state.currentRoom) return;

    const messageContent = message.trim();
    const replyToId = replyingTo?._id;
    setMessage(''); // Clear input immediately for better UX
    setReplyingTo(null); // Clear reply context
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = '44px';
      textareaRef.current.blur(); // Blur to dismiss keyboard on mobile
    }

    try {
      await actions.sendMessage({
        roomId: state.currentRoom._id,
        content: messageContent,
        messageType: 'text',
        ...(replyToId && { replyTo: replyToId })
      });
      actions.stopTyping(state.currentRoom._id);
    } catch (error: any) {
      console.error('Failed to send message:', error);
      // Restore message if sending failed
      setMessage(messageContent);
      // Show error toast
      toast({
        title: 'Error',
        description: error.message || 'Failed to send message. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleReply = (message: ChatMessage) => {
    setReplyingTo(message);
    setShowMessageMenu(null);
    setSelectedMessages([]); // Clear selection if any
    // Focus on textarea
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  };

  // Swipe handlers
  const handleTouchStart = (e: React.TouchEvent, _message: ChatMessage) => {
    const touch = e.touches[0];
    if (!touch) return;
    swipeStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
  };

  const handleTouchEnd = (e: React.TouchEvent, message: ChatMessage) => {
    if (!swipeStartRef.current) return;

    const touch = e.changedTouches[0];
    if (!touch) {
      swipeStartRef.current = null;
      return;
    }

    const deltaX = touch.clientX - swipeStartRef.current.x;
    const deltaY = touch.clientY - swipeStartRef.current.y;
    const deltaTime = Date.now() - swipeStartRef.current.time;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Check if it's a horizontal swipe (not vertical scroll)
    if (absDeltaX > swipeThreshold && absDeltaX > absDeltaY && deltaTime < swipeTimeThreshold) {
      // Swipe detected - left or right
      if (deltaX > 0) {
        // Swipe right - reply to message
        handleReply(message);
      } else {
        // Swipe left - also reply to message (or could be used for other actions)
        handleReply(message);
      }
    }

    swipeStartRef.current = null;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, 120);
    textarea.style.height = newHeight + 'px';
    
    // Scroll to bottom when typing (mobile keyboard handling)
    if (newHeight > 44) {
      setTimeout(() => {
        scrollToBottom();
      }, 50);
    }
    
    if (!isTyping && state.currentRoom) {
      setIsTyping(true);
      actions.startTyping(state.currentRoom._id);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (state.currentRoom) {
        actions.stopTyping(state.currentRoom._id);
        setIsTyping(false);
      }
    }, 1000);
  };

  const handleReaction = (messageId: string, emoji: string) => {
    // Find the message to check if user already reacted with this emoji
    const message = roomMessages.find(m => m._id === messageId) || state.messages.find(m => m._id === messageId);
    if (!message) return;

    // Check if user already reacted with this specific emoji
    const userReaction = getUserReaction(message);
    if (userReaction && userReaction.emoji === emoji) {
      // User already reacted with this emoji - toggle it off
      actions.removeReaction(messageId, emoji);
    } else {
      // User hasn't reacted with this emoji yet - add it
    actions.addReaction(messageId, emoji);
    }
    setShowMessageMenu(null);
    setShowReactionPicker(null);
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await actions.deleteMessage(messageId);
      setShowMessageMenu(null);
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  const toggleMessageSelection = (messageId: string) => {
    setSelectedMessages(prev => {
      if (prev.includes(messageId)) {
        return prev.filter(id => id !== messageId);
      } else {
        return [...prev, messageId];
      }
    });
  };

  const handleMassDelete = async () => {
    if (selectedMessages.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedMessages.length} message(s)?`)) {
      try {
        await actions.massDeleteMessages(selectedMessages);
        setSelectedMessages([]);
      } catch (error) {
        console.error('Failed to delete messages:', error);
      }
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  // Show preview before sending
  const handleFileSelect = (file: File) => {
    setPreviewFile(file);
    setPreviewCaption('');
    setShowPreviewModal(true);
    setShowAttachmentMenu(false);
  };

  // Send file after confirmation
  const handleSendFile = async () => {
    if (!state.currentRoom || !previewFile) return;

    try {
      console.log('📤 Starting file upload:', previewFile.name, previewFile.type, previewFile.size);
      
      // Upload file first
      const { ChatService } = await import('../../services/chat.service');
      const uploadResult = await ChatService.uploadFile(previewFile);
      
      console.log('✅ File uploaded successfully:', uploadResult);
      
      // Determine message type based on file type
      const isImage = uploadResult.fileType?.startsWith('image/') || 
                     /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(uploadResult.fileName);
      const messageType = isImage ? 'image' : 'file';
      
      // Use caption if provided, otherwise use default
      const content = previewCaption.trim() || (isImage ? ' ' : `📎 ${uploadResult.fileName}`);
      
      const messageData = {
        roomId: state.currentRoom._id,
        content: content,
        messageType: messageType as 'text' | 'image' | 'file' | 'system',
        attachments: [{
          fileName: uploadResult.fileName,
          fileUrl: uploadResult.fileUrl,
          fileType: uploadResult.fileType,
          fileSize: uploadResult.fileSize,
          uploadedAt: new Date().toISOString() // Include for type compatibility, backend may override
        }]
      };
      
      console.log('📨 Sending message with attachment:', messageData);
      
      // Send message with attachment
      await actions.sendMessage(messageData);
      
      console.log('✅ Message sent successfully');
      setShowPreviewModal(false);
      setPreviewFile(null);
      setPreviewCaption('');
    } catch (error: any) {
      console.error('❌ Failed to upload and send file:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response?.data
      });
      // Show error to user with toast
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload file. Please try again.',
        variant: 'destructive'
      });
    }
  };

  // Cancel preview
  const handleCancelPreview = () => {
    // Clean up object URL if it exists
    if (previewFile && previewFile.type.startsWith('image/') && previewImageRef.current?.src) {
      URL.revokeObjectURL(previewImageRef.current.src);
    }
    setShowPreviewModal(false);
    setPreviewFile(null);
    setPreviewCaption('');
  };

  // Handle document selection
  const handleDocumentSelect = () => {
    setShowAttachmentMenu(false);
    fileInputRef.current?.click();
  };

  // Handle gallery selection
  const handleGallerySelect = () => {
    setShowAttachmentMenu(false);
    imageInputRef.current?.click();
  };

  // Handle camera capture - open camera modal
  const handleCameraSelect = async () => {
    setShowAttachmentMenu(false);
    setShowCameraModal(true);
    
    try {
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use rear camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false 
      });
      
      streamRef.current = stream;
      
      // Show video stream in video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error: any) {
      console.error('Error accessing camera:', error);
      toast({
        title: 'Camera Access Error',
        description: error.message || 'Unable to access camera. Please check permissions.',
        variant: 'destructive'
      });
      setShowCameraModal(false);
    }
  };

  // Capture photo from camera
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (blob) {
        // Create a File from the blob
        const file = new File([blob], `camera_${Date.now()}.jpg`, { type: 'image/jpeg' });
        // Show preview instead of sending directly
        setPreviewFile(file);
        setPreviewCaption('');
        setShowPreviewModal(true);
        closeCamera();
      }
    }, 'image/jpeg', 0.9);
  };

  // Close camera and stop stream
  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setShowCameraModal(false);
  };

  // Handle file input change (for documents)
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
      e.target.value = ''; // Reset input
    }
  };

  // Handle image input change (for gallery)
  const handleImageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
      e.target.value = ''; // Reset input
    }
  };

  // Close attachment menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (attachmentMenuRef.current && !attachmentMenuRef.current.contains(event.target as Node)) {
        setShowAttachmentMenu(false);
      }
    };

    if (showAttachmentMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showAttachmentMenu]);

  // Cleanup camera stream on unmount or when modal closes
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, []);

  // Stop camera when modal closes
  useEffect(() => {
    if (!showCameraModal && streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  }, [showCameraModal]);

  const handleCreatePoll = () => {
    setEditingPoll(null);
    setShowPollModal(true);
  };

  const handlePollSubmit = async (pollData: { question: string; options: string[]; expiresAt?: string }) => {
    if (!state.currentRoom) return;
    
    try {
      if (editingPoll) {
        // Update existing poll
        await actions.updatePoll(editingPoll.id, pollData);
      } else {
        // Create new poll
        await actions.createPoll(state.currentRoom._id, pollData);
      }
      setShowPollModal(false);
      setEditingPoll(null);
    } catch (error) {
      console.error('Failed to submit poll:', error);
    }
  };

  const handleVotePoll = async (pollId: string, optionId: string) => {
    try {
      await actions.voteOnPoll(pollId, optionId);
    } catch (error) {
      console.error('Failed to vote on poll:', error);
    }
  };

  const handleClosePoll = async (pollId: string) => {
    try {
      await actions.closePoll(pollId);
    } catch (error) {
      console.error('Failed to close poll:', error);
    }
  };

  const handleEditPoll = (pollId: string) => {
    const poll = roomPolls.find(p => p.id === pollId);
    if (poll) {
      setEditingPoll(poll);
      setShowPollModal(true);
    }
  };

  const handleDeletePoll = async (pollId: string) => {
    if (window.confirm('Are you sure you want to delete this poll? This action cannot be undone.')) {
      try {
        await actions.deletePoll(pollId);
      } catch (error) {
        console.error('Failed to delete poll:', error);
      }
    }
  };

  // Filter polls for current room
  const roomPolls = state.polls.filter(poll => poll.roomId === roomId);

  // Create combined array of messages and polls sorted by timestamp
  const combinedItems = [
    ...roomMessages.map(msg => ({ ...msg, itemType: 'message' as const })),
    ...roomPolls.map(poll => ({ ...poll, itemType: 'poll' as const }))
  ].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const formatMessageDate = (createdAt: string) => {
    const date = new Date(createdAt);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return format(date, 'HH:mm');
    } else {
      return format(date, 'MMM d, HH:mm');
    }
  };

  const isMessageFromCurrentUser = (message: ChatMessage) => {
    return user && message.senderId?._id === user.id;
  };

  const getReactionCount = (message: ChatMessage, emoji: string) => {
    return message.reactions.filter(r => r.emoji === emoji).length;
  };

  const getUniqueReactions = (message: ChatMessage) => {
    const uniqueEmojis = [...new Set(message.reactions.map(r => r.emoji))];
    return uniqueEmojis;
  };

  const getUserReaction = (message: ChatMessage) => {
    if (!user?.id) return undefined;
    // Handle both string and ObjectId formats
    const userId = user.id.toString();
    return message.reactions.find(r => {
      const reactionUserId = typeof r.userId === 'string' 
        ? r.userId 
        : (r.userId as any)?.toString?.() || String(r.userId);
      return reactionUserId === userId;
    });
  };

  if (!state.currentRoom) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-muted/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-card-foreground mb-2">No chat selected</h3>
          <p className="text-muted-foreground">Choose a chat to start messaging</p>
        </div>
      </div>
    );
  }

  const handleDoubleClick = (messageId: string) => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTap;
    
    if (timeSinceLastTap < 300) {
      // Double tap detected - add default reaction (thumbs up)
      handleReaction(messageId, '👍');
    }
    
    setLastTap(now);
  };

  const handleShowReactionPicker = (messageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowReactionPicker(showReactionPicker === messageId ? null : messageId);
    setShowMessageMenu(null); // Close message menu if open
  };

  return (
    <div className="flex flex-col h-full bg-background min-h-0 overflow-hidden">
      {/* WhatsApp-style Messages */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden bg-background p-2 sm:p-4 pb-2 lg:pb-4 min-h-0"
        style={{
          WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
          overscrollBehavior: 'contain', // Prevent pull-to-refresh interference
          touchAction: 'pan-y' // Enable vertical scrolling, prevent horizontal
        }}
      >
        {/* Mass delete toolbar */}
        {selectedMessages.length > 0 && (
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-2 mb-2 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                {selectedMessages.length} message(s) selected
              </span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  // Reply to the last selected message (most recent)
                  const lastSelectedId = selectedMessages[selectedMessages.length - 1];
                  const messageToReply = roomMessages.find(m => m._id === lastSelectedId) || state.messages.find(m => m._id === lastSelectedId);
                  if (messageToReply) {
                    handleReply(messageToReply);
                    setSelectedMessages([]);
                  }
                }}
                className="p-1.5 text-primary hover:text-primary/80 rounded-full hover:bg-primary/20 flex items-center gap-1.5"
                title="Reply to selected message"
              >
                <Reply className="w-4 h-4" />
                <span className="text-xs font-medium hidden sm:inline">Reply</span>
              </button>
              <button
                onClick={handleMassDelete}
                className="p-1.5 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50"
                title="Delete selected messages"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSelectedMessages([])}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted"
                title="Cancel selection"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {roomMessages.length === 0 && roomPolls.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8" />
            </div>
            <p className="text-sm font-medium">No messages yet</p>
            <p className="text-xs">Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-1 w-full min-w-0">
            {/* Add some top padding to push messages down slightly when there are few messages */}
            {combinedItems.length < 10 && <div key="spacer" className="h-4"></div>}
            
            {combinedItems.map((item, index) => {
              if (item.itemType === 'poll') {
                // Check if poll was created by current user
                // Handle both string and object formats for createdBy
                const pollCreatorId = typeof item.createdBy === 'string' 
                  ? item.createdBy 
                  : (item.createdBy as any)?._id || (item.createdBy as any)?.id;
                
                const isCurrentUserPoll = pollCreatorId === user?.id;
                
                // Render poll
                return (
                  <div key={item.id || `poll-${index}`} className={`flex ${isCurrentUserPoll ? 'justify-end' : 'justify-start'} mb-3 sm:mb-4 w-full min-w-0`}>
                    <div className="w-full max-w-[90%] sm:max-w-[85%] lg:max-w-[80%] min-w-0">
                      <div className={`${isCurrentUserPoll ? 'bg-primary/10 border-primary/30' : 'bg-card border-primary/20'} border rounded-lg p-3 sm:p-4 shadow-sm`}>
                        {/* Poll header with sender info */}
                        <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-border/50">
                          <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                            <BarChart3 className="w-3 h-3 text-primary" />
                          </div>
                          <div className="flex-1">
                            <span className="text-sm font-medium text-card-foreground">Poll</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              {new Date(item.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                        
                        <Poll
                          poll={item}
                          onVote={handleVotePoll}
                          canCreatePolls={user?.role === 'mess-owner' || user?.role === 'admin'}
                          onClose={handleClosePoll}
                          onEdit={handleEditPoll}
                          onDelete={handleDeletePoll}
                        />
                      </div>
                    </div>
                  </div>
                );
              } else {
                // Render message
                const message = item as ChatMessage;
                const isCurrentUser = isMessageFromCurrentUser(message);
                const prevMessage = combinedItems[index - 1] as ChatMessage | undefined;
                const showAvatar = index === 0 || 
                  combinedItems[index - 1]?.itemType === 'poll' || 
                  (prevMessage?.senderId?._id && message.senderId?._id && prevMessage.senderId._id !== message.senderId._id);
                const isSelected = selectedMessages.includes(message._id);
                const userReaction = getUserReaction(message);
                const showReactionPickerForMessage = showReactionPicker === message._id;
              
                return (
                  <div 
                    key={message._id} 
                    className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-1 relative w-full`}
                  >
                    {/* Message selection overlay */}
                    {selectedMessages.length > 0 && (
                      <div 
                        className={`absolute inset-0 rounded-2xl cursor-pointer ${
                          isSelected 
                            ? 'bg-primary/20 border-2 border-primary' 
                            : 'bg-muted/30 hover:bg-muted/50'
                        }`}
                        onClick={() => toggleMessageSelection(message._id)}
                      />
                    )}
                    
                    <div className={`flex space-x-2 max-w-[85%] sm:max-w-[75%] lg:max-w-[70%] ${isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''} min-w-0`}>
                      {/* Avatar */}
                      {!isCurrentUser && showAvatar && (
                        // Only mess-owner and admin can click on other users' profiles
                        // Regular users cannot view other users' profiles
                        user?.role === 'mess-owner' || user?.role === 'admin' ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const senderId = message.senderId?._id || (message.senderId as any)?.id;
                              if (senderId) {
                                // Preserve current chat room in navigation state and URL
                                const currentChatPath = `${location.pathname}${location.search}`;
                                
                                // Navigate to user detail page
                                // Include roomId in URL for browser back button support
                                const userDetailUrl = roomId 
                                  ? `/mess-owner/user-management/${senderId}?returnTo=${encodeURIComponent(currentChatPath)}&roomId=${roomId}`
                                  : `/mess-owner/user-management/${senderId}?returnTo=${encodeURIComponent(currentChatPath)}`;
                                navigate(userDetailUrl, {
                                  state: { returnTo: currentChatPath, roomId: roomId }
                                });
                              }
                            }}
                            className="w-8 h-8 bg-primary/10 hover:bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                            title={`View ${message.senderId?.firstName || message.senderId?.email || 'user'}'s profile`}
                            aria-label={`View ${message.senderId?.firstName || message.senderId?.email || 'user'}'s profile`}
                          >
                            <span className="text-sm font-medium text-primary">
                              {(message.senderId?.firstName || message.senderId?.email || '?').charAt(0).toUpperCase()}
                            </span>
                          </button>
                        ) : (
                          // Regular users: non-clickable avatar (no profile access)
                          <div
                            className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0"
                            title={`${message.senderId?.firstName || message.senderId?.email || 'user'}`}
                            aria-label={`${message.senderId?.firstName || message.senderId?.email || 'user'}`}
                          >
                            <span className="text-sm font-medium text-primary">
                              {(message.senderId?.firstName || message.senderId?.email || '?').charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )
                      )}
                      
                      {!isCurrentUser && !showAvatar && (
                        <div className="w-8 h-8 flex-shrink-0" />
                      )}
                      
                      {/* Current User Avatar (shown on the right side) */}
                      {isCurrentUser && showAvatar && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Preserve current chat room in navigation state and URL
                            const currentChatPath = `${location.pathname}${location.search}`;
                            
                            // Navigate to current user's profile
                            // Include roomId in URL for browser back button support
                            if (user?.role === 'mess-owner') {
                              const profileUrl = roomId
                                ? `${ROUTES.MESS_OWNER.PROFILE}?returnTo=${encodeURIComponent(currentChatPath)}&roomId=${roomId}`
                                : `${ROUTES.MESS_OWNER.PROFILE}?returnTo=${encodeURIComponent(currentChatPath)}`;
                              navigate(profileUrl, {
                                state: { returnTo: currentChatPath, roomId: roomId }
                              });
                            } else if (user?.role === 'admin') {
                              const profileUrl = roomId
                                ? `${ROUTES.ADMIN.PROFILE}?returnTo=${encodeURIComponent(currentChatPath)}&roomId=${roomId}`
                                : `${ROUTES.ADMIN.PROFILE}?returnTo=${encodeURIComponent(currentChatPath)}`;
                              navigate(profileUrl, {
                                state: { returnTo: currentChatPath, roomId: roomId }
                              });
                            } else {
                              const profileUrl = roomId
                                ? `${ROUTES.USER.PROFILE}?returnTo=${encodeURIComponent(currentChatPath)}&roomId=${roomId}`
                                : `${ROUTES.USER.PROFILE}?returnTo=${encodeURIComponent(currentChatPath)}`;
                              navigate(profileUrl, {
                                state: { returnTo: currentChatPath, roomId: roomId }
                              });
                            }
                          }}
                          className="w-8 h-8 bg-primary hover:bg-primary/90 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                          title="View your profile"
                          aria-label="View your profile"
                        >
                          <span className="text-sm font-medium text-primary-foreground">
                            {(user?.firstName || user?.email || '?').charAt(0).toUpperCase()}
                          </span>
                        </button>
                      )}
                      
                      {isCurrentUser && !showAvatar && (
                        <div className="w-8 h-8 flex-shrink-0" />
                      )}
                      
                      {/* Message Content */}
                      <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'} relative min-w-0 flex-1`}>
                        {!isCurrentUser && showAvatar && (
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-xs font-medium text-card-foreground">
                              {message.senderId?.firstName && message.senderId?.lastName
                                ? `${message.senderId.firstName} ${message.senderId.lastName}`
                                : message.senderId?.email || 'Unknown User'}
                            </span>
                          </div>
                        )}
                        
                        <div
                          className={`px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 rounded-2xl max-w-full relative group min-h-[44px] min-w-0 ${
                            isCurrentUser
                              ? 'bg-primary text-primary-foreground rounded-br-sm'
                              : 'bg-card border border-border rounded-bl-sm'
                          } ${message.isDeleted ? 'opacity-70 italic' : ''}`}
                          onDoubleClick={() => handleDoubleClick(message._id)}
                          onTouchStart={(e) => {
                            if (!message.isDeleted) {
                              handleTouchStart(e, message);
                            }
                          }}
                          onTouchEnd={(e) => {
                            if (!message.isDeleted) {
                              handleTouchEnd(e, message);
                            }
                          }}
                          style={{ touchAction: 'pan-y' }}
                        >
                          {/* Message menu button */}
                          {!message.isDeleted && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowMessageMenu(showMessageMenu === message._id ? null : message._id);
                                setShowReactionPicker(null); // Close reaction picker if open
                              }}
                              className="absolute top-2 right-2 p-1.5 sm:p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity touch-manipulation z-10"
                              aria-label="Message options"
                            >
                              <MoreVertical className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                          )}
                          
                          {/* Reaction picker button - WhatsApp style */}
                          {!message.isDeleted && (
                            <button
                              onClick={(e) => handleShowReactionPicker(message._id, e)}
                              className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 bg-white dark:bg-gray-800 rounded-full shadow-md flex items-center justify-center border border-gray-200 dark:border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50 dark:hover:bg-gray-700 touch-manipulation z-10"
                              aria-label="Add reaction"
                            >
                              <Smile className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 dark:text-gray-400" />
                            </button>
                          )}
                          
                          {/* Message menu dropdown */}
                          {showMessageMenu === message._id && (
                            <div 
                              ref={messageMenuRef}
                              className="absolute top-full right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-20 min-w-[120px]"
                              style={{
                                maxWidth: 'min(200px, calc(100vw - 2rem))',
                                left: 'auto',
                                right: '0px'
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="py-1">
                                {/* Reply button */}
                                <button
                                  onClick={() => handleReply(message)}
                                  className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted flex items-center space-x-2"
                                >
                                  <Reply className="w-4 h-4" />
                                  <span>Reply</span>
                                </button>
                                <hr className="my-1 border-border" />
                                {(() => {
                                  const userReaction = getUserReaction(message);
                                  const hasReacted = (emoji: string) => userReaction?.emoji === emoji;
                                  return (
                                    <>
                                <button
                                  onClick={() => handleReaction(message._id, '👍')}
                                        className={`w-full text-left px-3 py-1.5 text-sm hover:bg-muted flex items-center space-x-2 ${
                                          hasReacted('👍') ? 'bg-primary/10 text-primary font-medium' : ''
                                        }`}
                                >
                                  <ThumbsUp className="w-4 h-4" />
                                  <span>Like</span>
                                        {hasReacted('👍') && <span className="ml-auto text-xs">✓</span>}
                                </button>
                                <button
                                  onClick={() => handleReaction(message._id, '❤️')}
                                        className={`w-full text-left px-3 py-1.5 text-sm hover:bg-muted flex items-center space-x-2 ${
                                          hasReacted('❤️') ? 'bg-primary/10 text-primary font-medium' : ''
                                        }`}
                                >
                                  <Heart className="w-4 h-4 text-red-500" />
                                  <span>Love</span>
                                        {hasReacted('❤️') && <span className="ml-auto text-xs">✓</span>}
                                </button>
                                <button
                                  onClick={() => handleReaction(message._id, '😂')}
                                        className={`w-full text-left px-3 py-1.5 text-sm hover:bg-muted flex items-center space-x-2 ${
                                          hasReacted('😂') ? 'bg-primary/10 text-primary font-medium' : ''
                                        }`}
                                >
                                  <span className="text-lg">😂</span>
                                  <span>Laugh</span>
                                        {hasReacted('😂') && <span className="ml-auto text-xs">✓</span>}
                                </button>
                                <button
                                  onClick={() => handleReaction(message._id, '😮')}
                                        className={`w-full text-left px-3 py-1.5 text-sm hover:bg-muted flex items-center space-x-2 ${
                                          hasReacted('😮') ? 'bg-primary/10 text-primary font-medium' : ''
                                        }`}
                                >
                                  <span className="text-lg">😮</span>
                                  <span>Wow</span>
                                        {hasReacted('😮') && <span className="ml-auto text-xs">✓</span>}
                                </button>
                                <button
                                  onClick={() => handleReaction(message._id, '😢')}
                                        className={`w-full text-left px-3 py-1.5 text-sm hover:bg-muted flex items-center space-x-2 ${
                                          hasReacted('😢') ? 'bg-primary/10 text-primary font-medium' : ''
                                        }`}
                                >
                                  <span className="text-lg">😢</span>
                                  <span>Sad</span>
                                        {hasReacted('😢') && <span className="ml-auto text-xs">✓</span>}
                                </button>
                                <button
                                  onClick={() => handleReaction(message._id, '😡')}
                                        className={`w-full text-left px-3 py-1.5 text-sm hover:bg-muted flex items-center space-x-2 ${
                                          hasReacted('😡') ? 'bg-primary/10 text-primary font-medium' : ''
                                        }`}
                                >
                                  <span className="text-lg">😡</span>
                                  <span>Angry</span>
                                        {hasReacted('😡') && <span className="ml-auto text-xs">✓</span>}
                                </button>
                                    </>
                                  );
                                })()}
                                {isCurrentUser && (
                                  <>
                                    <hr className="my-1 border-border" />
                                    <button
                                      onClick={() => handleDeleteMessage(message._id)}
                                      className="w-full text-left px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 flex items-center space-x-2"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                      <span>Delete</span>
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {/* Reaction picker - WhatsApp style */}
                          {showReactionPickerForMessage && (
                            <div 
                              ref={reactionPickerRef}
                              className="absolute bottom-full mb-2 bg-white dark:bg-gray-800 rounded-full shadow-lg z-20 flex p-1 border border-gray-200 dark:border-gray-700"
                              style={{
                                maxWidth: 'min(300px, calc(100vw - 2rem))',
                                minWidth: 'fit-content'
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {['👍', '❤️', '😂', '😮', '😢', '😡'].map((emoji) => (
                                <button
                                  key={emoji}
                                  onClick={() => {
                                    handleReaction(message._id, emoji);
                                    setShowReactionPicker(null);
                                  }}
                                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-lg transition-all hover:scale-125 flex-shrink-0 touch-manipulation"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          )}
                          
                          {message.replyTo && (
                            <div className={`text-xs mb-2 p-2 rounded-lg border-l-2 ${
                              isCurrentUser
                                ? 'bg-primary-foreground/20 border-primary-foreground/30'
                                : 'bg-muted/50 border-border'
                            }`}>
                              <div className="font-medium">
                                {message.replyTo.senderId?.firstName && message.replyTo.senderId?.lastName
                                  ? `${message.replyTo.senderId.firstName} ${message.replyTo.senderId.lastName}`
                                  : 'Unknown User'}
                              </div>
                              <div className="truncate">{message.replyTo.content}</div>
                            </div>
                          )}
                          
                          {/* Image/File Attachments */}
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="mb-2 space-y-2">
                              {message.attachments.map((attachment, idx) => {
                                const isImage = attachment.fileType?.startsWith('image/') || 
                                               message.messageType === 'image' ||
                                               /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(attachment.fileName);
                                
                                if (isImage && attachment.fileUrl) {
                                  const imageUrl = constructImageUrl(attachment.fileUrl);
                                  const imageKey = `${message._id}-${idx}`;
                                  const isVisible = visibleImages.has(imageUrl);
                                  
                                  return (
                                    <div key={idx} className="relative group">
                                      {isVisible ? (
                                        <img
                                          ref={(el) => {
                                            if (el) {
                                              imageRefs.current.set(imageKey, el);
                                              el.setAttribute('data-image-url', imageUrl);
                                            } else {
                                              imageRefs.current.delete(imageKey);
                                            }
                                          }}
                                          src={imageUrl}
                                          alt={attachment.fileName || 'Image'}
                                          className="max-w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                          style={{ maxHeight: '300px', objectFit: 'contain' }}
                                          loading="lazy"
                                          onClick={() => {
                                            // Find image index and open full-screen modal
                                            const imageIndex = allImagesMemo.findIndex(img => img.url === imageUrl);
                                            if (imageIndex !== -1) {
                                              setSelectedImageIndex(imageIndex);
                                              setShowImageModal(true);
                                            }
                                          }}
                                          onError={(e) => {
                                            console.error('❌ Image failed to load:', {
                                              imageUrl,
                                              originalUrl: attachment.fileUrl,
                                              fileName: attachment.fileName
                                            });
                                            // Fallback to file info if image fails to load
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                            const fallback = target.nextElementSibling as HTMLElement;
                                            if (fallback) fallback.style.display = 'block';
                                          }}
                                          onLoad={(e) => {
                                            // Cache the successfully loaded image
                                            const target = e.target as HTMLImageElement;
                                            if (target.src && !imageCache.has(imageUrl)) {
                                              // Use functional update to prevent unnecessary re-renders
                                              setImageCache((prev) => {
                                                if (prev.has(imageUrl)) return prev; // Already cached
                                                const newCache = new Map(prev);
                                                newCache.set(imageUrl, target.src);
                                                return newCache;
                                              });
                                            }
                                          }}
                                        />
                                      ) : (
                                        <div
                                          ref={(el) => {
                                            if (el) {
                                              imageRefs.current.set(imageKey, el as any);
                                              el.setAttribute('data-image-url', imageUrl);
                                            } else {
                                              imageRefs.current.delete(imageKey);
                                            }
                                          }}
                                          className="max-w-full rounded-lg bg-muted/30 flex items-center justify-center cursor-pointer"
                                          style={{ 
                                            maxHeight: '300px', 
                                            minHeight: '150px',
                                            aspectRatio: '16/9'
                                          }}
                                          onClick={() => {
                                            // Force load image when clicked
                                            setVisibleImages((prev) => new Set(prev).add(imageUrl));
                                          }}
                                        >
                                          <div className="text-center text-muted-foreground">
                                            <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                            <p className="text-xs">Tap to load image</p>
                                          </div>
                                        </div>
                                      )}
                                      <div className="hidden text-xs text-muted-foreground mt-1">
                                        <Paperclip className="w-3 h-3 inline mr-1" />
                                        {attachment.fileName} ({(attachment.fileSize / 1024 / 1024).toFixed(2)}MB)
                                      </div>
                                    </div>
                                  );
                                } else {
                                  // Non-image file (PDF, documents, etc.)
                                  // Construct full file URL - same logic as images
                                  const apiBaseUrl = import.meta.env['VITE_API_BASE_URL'] || import.meta.env['VITE_API_URL'] || 'http://localhost:5000';
                                  // Remove /api from base URL if present, as static files are served directly
                                  const serverBaseUrl = apiBaseUrl.replace(/\/api$/, '');
                                  let fileUrl = attachment.fileUrl;
                                  
                                  if (fileUrl.startsWith('http')) {
                                    // Already a full URL
                                    fileUrl = fileUrl;
                                  } else if (fileUrl.startsWith('/uploads/')) {
                                    // Relative path starting with /uploads/ - use server base URL without /api
                                    fileUrl = `${serverBaseUrl}${fileUrl}`;
                                  } else if (fileUrl.includes('uploads/')) {
                                    // Path contains uploads/ but doesn't start with /
                                    fileUrl = `${serverBaseUrl}/${fileUrl}`;
                                  } else {
                                    // Just filename, construct full path
                                    fileUrl = `${serverBaseUrl}/uploads/chat/${fileUrl}`;
                                  }
                                  
                                  const isPDF = attachment.fileType === 'application/pdf' || 
                                               /\.pdf$/i.test(attachment.fileName);
                                  
                                  return (
                                    <div key={idx} className="flex items-center space-x-2 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                                      {isPDF ? (
                                        <FileText className="w-5 h-5 text-red-500 flex-shrink-0" />
                                      ) : (
                                        <Paperclip className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <a
                                          href={fileUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          onClick={(e) => {
                                            // For PDFs, ensure they open in a new tab
                                            if (isPDF) {
                                              e.preventDefault();
                                              window.open(fileUrl, '_blank');
                                            }
                                          }}
                                          className="text-sm font-medium text-primary hover:underline truncate block"
                                        >
                                          {attachment.fileName || 'File'}
                                        </a>
                                        <div className="flex items-center gap-2 mt-1">
                                          <span className="text-xs text-muted-foreground">
                                            {attachment.fileSize < 1024 
                                              ? `${attachment.fileSize} B`
                                              : attachment.fileSize < 1024 * 1024
                                              ? `${(attachment.fileSize / 1024).toFixed(2)} KB`
                                              : `${(attachment.fileSize / 1024 / 1024).toFixed(2)} MB`}
                                          </span>
                                          {isPDF && (
                                            <span className="text-xs px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded">
                                              PDF
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <a
                                        href={fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => {
                                          // For PDFs, ensure they open in a new tab
                                          if (isPDF) {
                                            e.preventDefault();
                                            window.open(fileUrl, '_blank');
                                          }
                                        }}
                                        className="flex-shrink-0 p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                        aria-label={isPDF ? "Open PDF" : "Download file"}
                                        title={isPDF ? "Open PDF" : "Download file"}
                                      >
                                        {isPDF ? (
                                          <FileText className="w-5 h-5" />
                                        ) : (
                                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                          </svg>
                                        )}
                                      </a>
                                    </div>
                                  );
                                }
                              })}
                            </div>
                          )}
                          
                          {/* Message Content - show caption if provided, or text content for non-image messages */}
                          {message.content && 
                           !message.content.startsWith('📎') && 
                           message.content.trim() !== '' && 
                           message.content.trim() !== ' ' && (
                            <div
                              className={`text-sm leading-relaxed break-words whitespace-pre-wrap overflow-wrap-anywhere ${
                                message.messageType === 'image' ? 'mt-2' : ''
                              }`}
                              style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                              dangerouslySetInnerHTML={{ __html: renderMessageHtml(message.content.trim()) }}
                            />
                          )}
                          
                          {/* Fallback: Try to extract and display image from content if no attachments */}
                          {!message.attachments && (message.messageType === 'file' || message.messageType === 'image') && message.content && (
                            (() => {
                              // Try to extract file path/URL from content
                              const content = message.content;
                              // Check if content contains a file path (starts with /uploads/ or http)
                              const isImagePath = /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(content) || 
                                                content.includes('/uploads/') || 
                                                content.startsWith('http');
                              
                              if (message.messageType === 'image' && isImagePath) {
                                // Try to construct image URL using helper function
                                const imageUrl = constructImageUrl(content);
                                
                                if (imageUrl) {
                                  const imageKey = `fallback-${message._id}`;
                                  const isVisible = visibleImages.has(imageUrl);
                                  
                                  return (
                                    <div className="relative group mb-2">
                                      {isVisible ? (
                                        <img
                                          ref={(el) => {
                                            if (el) {
                                              imageRefs.current.set(imageKey, el);
                                              el.setAttribute('data-image-url', imageUrl);
                                            } else {
                                              imageRefs.current.delete(imageKey);
                                            }
                                          }}
                                          src={imageUrl}
                                          alt="Sent image"
                                          className="max-w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                          style={{ maxHeight: '300px', objectFit: 'contain' }}
                                          loading="lazy"
                                          onClick={() => {
                                            // Find image index and open full-screen modal
                                            const imageIndex = allImagesMemo.findIndex(img => img.url === imageUrl);
                                            if (imageIndex !== -1) {
                                              setSelectedImageIndex(imageIndex);
                                              setShowImageModal(true);
                                            }
                                          }}
                                          onError={(e) => {
                                            // Fallback to file info if image fails to load
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                            const fallback = target.nextElementSibling as HTMLElement;
                                            if (fallback) fallback.style.display = 'block';
                                          }}
                                          onLoad={(e) => {
                                            // Cache the successfully loaded image
                                            const target = e.target as HTMLImageElement;
                                            if (target.src && !imageCache.has(imageUrl)) {
                                              // Use functional update to prevent unnecessary re-renders
                                              setImageCache((prev) => {
                                                if (prev.has(imageUrl)) return prev; // Already cached
                                                const newCache = new Map(prev);
                                                newCache.set(imageUrl, target.src);
                                                return newCache;
                                              });
                                            }
                                          }}
                                        />
                                      ) : (
                                        <div
                                          ref={(el) => {
                                            if (el) {
                                              imageRefs.current.set(imageKey, el as any);
                                              el.setAttribute('data-image-url', imageUrl);
                                            } else {
                                              imageRefs.current.delete(imageKey);
                                            }
                                          }}
                                          className="max-w-full rounded-lg bg-muted/30 flex items-center justify-center cursor-pointer"
                                          style={{ 
                                            maxHeight: '300px', 
                                            minHeight: '150px',
                                            aspectRatio: '16/9'
                                          }}
                                          onClick={() => {
                                            // Force load image when clicked
                                            setVisibleImages((prev) => new Set(prev).add(imageUrl));
                                          }}
                                        >
                                          <div className="text-center text-muted-foreground">
                                            <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                            <p className="text-xs">Tap to load image</p>
                                          </div>
                                        </div>
                                      )}
                                      <div className="hidden flex items-center space-x-2 p-2 bg-muted/30 rounded-lg">
                                        <Paperclip className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                          <span className="text-sm text-muted-foreground">{content}</span>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                }
                              }
                              
                              // Default: Show file info
                              return (
                                <div className="flex items-center space-x-2 p-2 bg-muted/30 rounded-lg">
                                  <Paperclip className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <span className="text-sm text-muted-foreground">{content}</span>
                                  </div>
                                </div>
                              );
                            })()
                          )}
                          
                          {message.isEdited && !message.isDeleted && (
                            <p className="text-xs opacity-75 mt-1">(edited)</p>
                          )}
                        </div>
                        
                        {/* Message Time and Status */}
                        <div className={`flex items-center space-x-1 mt-1 ${isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                          <span className="text-xs text-muted-foreground">
                            {formatMessageDate(message.createdAt)}
                          </span>
                          
                          {isCurrentUser && (
                            <div className="flex items-center space-x-1">
                              <Check className="w-3 h-3 text-muted-foreground" />
                            </div>
                          )}
                          
                          {message.isPinned && (
                            <Pin className="w-3 h-3 text-muted-foreground" />
                          )}
                        </div>
                        
                        {/* Reactions - WhatsApp style below message */}
                        <div className={`flex flex-wrap items-center gap-1 mt-2 mb-1 w-full min-w-0 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                        {message.reactions.length > 0 && (
                            <>
                            {getUniqueReactions(message).map((emoji) => (
                              <button
                                key={emoji}
                                onClick={() => handleReaction(message._id, emoji)}
                                  className={`flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs transition-colors touch-manipulation ${
                                  userReaction?.emoji === emoji
                                    ? 'bg-blue-500 text-white'
                                      : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600'
                                }`}
                              >
                                  <span className="text-sm">{emoji}</span>
                                  <span className="font-medium text-[10px]">{getReactionCount(message, emoji)}</span>
                              </button>
                            ))}
                              {/* Add reaction button - WhatsApp style */}
                              <button
                                onClick={(e) => handleShowReactionPicker(message._id, e)}
                                className="w-6 h-6 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors touch-manipulation"
                                aria-label="Add reaction"
                              >
                                <Plus className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                              </button>
                            </>
                          )}
                          {/* Show add reaction button even when no reactions exist */}
                          {message.reactions.length === 0 && (
                            <button
                              onClick={(e) => handleShowReactionPicker(message._id, e)}
                              className="w-6 h-6 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors touch-manipulation opacity-0 group-hover:opacity-100"
                              aria-label="Add reaction"
                            >
                              <Plus className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
            })}
          </div>
        )}
        
        {/* Typing indicator */}
        {state.typingUsers.filter(u => u.roomId === roomId).length > 0 && (
          <div className="flex items-center space-x-2 text-muted-foreground text-sm">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span>Someone is typing...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* WhatsApp-style Message Input */}
      <div 
        className="px-3 sm:px-4 py-2 sm:py-3 border-t border-border/50 bg-card/95 backdrop-blur-sm relative flex-shrink-0"
        style={{ 
          paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))',
          WebkitTransform: 'translateZ(0)', // Force hardware acceleration
          transform: 'translateZ(0)'
        }}
      >
        {/* Reply context display */}
        {replyingTo && (
          <div className="mb-2 px-3 py-2 bg-muted/50 dark:bg-muted/30 rounded-lg border-l-4 border-primary flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Reply className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <span className="text-xs font-medium text-primary">
                  Replying to {replyingTo.senderId?.firstName || replyingTo.senderId?.email || 'Unknown'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {replyingTo.content || '[Message]'}
              </p>
            </div>
            <button 
              onClick={() => setReplyingTo(null)}
              className="flex-shrink-0 p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
              aria-label="Cancel reply"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="flex items-end gap-2 w-full min-w-0">
          {/* Attachment Button with Menu */}
          <div className="relative flex-shrink-0" ref={attachmentMenuRef}>
            <button 
              onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
              className="flex-shrink-0 p-2.5 sm:p-3 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-all duration-200 active:scale-95 touch-manipulation"
              aria-label="Attach file"
            >
              <Paperclip className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            
            {/* Attachment Menu Dropdown */}
            {showAttachmentMenu && (
              <div className="absolute bottom-full left-0 mb-2 bg-card border border-border rounded-lg shadow-lg z-50 min-w-[180px]">
                <div className="p-1">
                  {/* Document Option */}
                  <button
                    onClick={handleDocumentSelect}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-card-foreground hover:bg-muted/50 rounded-lg transition-colors"
                  >
                    <FileText className="w-5 h-5 text-primary" />
                    <span>Document</span>
                  </button>
                  
                  {/* Camera Option */}
                  <button
                    onClick={handleCameraSelect}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-card-foreground hover:bg-muted/50 rounded-lg transition-colors"
                  >
                    <Camera className="w-5 h-5 text-primary" />
                    <span>Camera</span>
                  </button>
                  
                  {/* Gallery Option */}
                  <button
                    onClick={handleGallerySelect}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-card-foreground hover:bg-muted/50 rounded-lg transition-colors"
                  >
                    <ImageIcon className="w-5 h-5 text-primary" />
                    <span>Gallery</span>
                  </button>
                </div>
              </div>
            )}
            
            {/* Hidden file inputs */}
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileInputChange}
              accept="*/*"
              className="hidden"
            />
            <input
              ref={imageInputRef}
              type="file"
              onChange={handleImageInputChange}
              accept="image/*"
              className="hidden"
            />
          </div>
          
          {/* Message Input Container */}
          <div className="flex-1 relative min-w-0 max-w-full" ref={inputContainerRef}>
            <div className="relative bg-muted/50 dark:bg-muted/30 rounded-3xl border border-border/50 focus-within:border-primary/50 focus-within:bg-background transition-all duration-200">
            <textarea
                ref={textareaRef}
              value={message}
              onChange={handleTyping}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
                className="w-full px-4 sm:px-5 py-2.5 sm:py-3 pr-12 sm:pr-14 bg-transparent border-0 rounded-3xl resize-none text-foreground placeholder:text-muted-foreground/70 transition-all duration-200 text-base sm:text-base leading-relaxed focus:outline-none focus:ring-0 touch-manipulation"
              rows={1}
                style={{ 
                  minHeight: '44px', 
                  maxHeight: '120px',
                  fontSize: '16px', // Prevent zoom on iOS
                  WebkitAppearance: 'none',
                  WebkitTapHighlightColor: 'transparent'
                }}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="sentences"
                spellCheck="true"
              />
              
              {/* Emoji Button inside input */}
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-all duration-200 active:scale-95 touch-manipulation"
                aria-label="Add emoji"
              >
                <Smile className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            <EmojiPicker
              onEmojiSelect={handleEmojiSelect}
              isOpen={showEmojiPicker}
              onClose={() => setShowEmojiPicker(false)}
            />
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Poll creation button - only for mess owners and admins */}
            {(user?.role === 'mess-owner' || user?.role === 'admin') && (
              <button
                onClick={handleCreatePoll}
                className="p-2.5 sm:p-3 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-all duration-200 active:scale-95 touch-manipulation"
                title="Create Poll"
                aria-label="Create Poll"
              >
                <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            )}
            
            {/* Send Button */}
            <button
              onClick={handleSendMessage}
              disabled={!message.trim()}
              className={`p-2.5 sm:p-3 rounded-full transition-all duration-200 touch-manipulation ${
                message.trim() 
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 shadow-md shadow-primary/20' 
                  : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
              }`}
              aria-label="Send message"
            >
              <Send className={`w-5 h-5 sm:w-6 sm:h-6 ${message.trim() ? 'rotate-0' : ''}`} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Unified Poll Modal */}
      <PollModal
        isOpen={showPollModal}
        onClose={() => {
          setShowPollModal(false);
          setEditingPoll(null);
        }}
        onSubmit={handlePollSubmit}
        poll={editingPoll}
        title={editingPoll ? 'Edit Poll' : 'Create Poll'}
      />

      {/* Camera Modal */}
      {showCameraModal && (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center">
          <div className="w-full max-w-md h-full max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-black/50">
              <h3 className="text-white font-medium">Take Photo</h3>
              <button
                onClick={closeCamera}
                className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
                aria-label="Close camera"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Preview */}
            <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-contain"
                style={{ transform: 'scaleX(-1)' }} // Mirror the video for better UX
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Controls */}
            <div className="p-6 bg-black/50 flex items-center justify-center gap-4">
              <button
                onClick={closeCamera}
                className="px-6 py-3 text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={capturePhoto}
                className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors active:scale-95"
                aria-label="Capture photo"
              >
                <div className="w-14 h-14 border-4 border-gray-800 rounded-full"></div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview/Confirmation Modal - WhatsApp Style */}
      {showPreviewModal && previewFile && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center"
          onClick={(e) => {
            // Close modal when clicking outside
            if (e.target === e.currentTarget) {
              handleCancelPreview();
            }
          }}
        >
          <div 
            className="w-full max-w-md bg-card rounded-t-2xl sm:rounded-2xl shadow-xl flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-lg font-semibold text-card-foreground">Send {previewFile.type.startsWith('image/') ? 'Photo' : 'File'}</h3>
              <button
                onClick={handleCancelPreview}
                className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
                aria-label="Close preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Preview Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {previewFile.type.startsWith('image/') ? (
                <div className="relative w-full bg-black rounded-lg overflow-hidden mb-4" style={{ aspectRatio: '1', maxHeight: '400px' }}>
                  <img
                    ref={previewImageRef}
                    src={URL.createObjectURL(previewFile)}
                    alt="Preview"
                    className="w-full h-full object-contain"
                    onLoad={() => {
                      // Revoke object URL after image loads to free memory
                      if (previewImageRef.current?.src) {
                        URL.revokeObjectURL(previewImageRef.current.src);
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="flex items-center space-x-4 p-4 bg-muted/30 rounded-lg mb-4">
                  {previewFile.type === 'application/pdf' ? (
                    <FileText className="w-12 h-12 text-red-500 flex-shrink-0" />
                  ) : (
                    <Paperclip className="w-8 h-8 text-muted-foreground flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-card-foreground truncate">
                      {previewFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {previewFile.size < 1024 
                        ? `${previewFile.size} B`
                        : previewFile.size < 1024 * 1024
                        ? `${(previewFile.size / 1024).toFixed(2)} KB`
                        : `${(previewFile.size / 1024 / 1024).toFixed(2)} MB`}
                    </p>
                  </div>
                </div>
              )}

              {/* Caption Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-card-foreground">
                  Add a caption (optional)
                </label>
                <textarea
                  value={previewCaption}
                  onChange={(e) => setPreviewCaption(e.target.value)}
                  placeholder="Type a message..."
                  className="w-full px-4 py-3 bg-muted/50 dark:bg-muted/30 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none text-foreground placeholder:text-muted-foreground"
                  rows={3}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {previewCaption.length}/500
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-4 border-t border-border flex items-center gap-3">
              <button
                onClick={handleCancelPreview}
                className="flex-1 px-4 py-3 bg-muted hover:bg-muted/80 text-foreground rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendFile}
                className="flex-1 px-4 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full-Screen Image Modal */}
      {showImageModal && allImagesMemo.length > 0 && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setShowImageModal(false)}
          style={{ touchAction: 'none' }}
        >
          {/* Close Button */}
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation Buttons */}
          {allImagesMemo.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImageIndex((prev) => 
                    prev > 0 ? prev - 1 : allImagesMemo.length - 1
                  );
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImageIndex((prev) => 
                    prev < allImagesMemo.length - 1 ? prev + 1 : 0
                  );
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Image Counter */}
          {allImagesMemo.length > 1 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-3 py-1 bg-black/50 rounded-full text-white text-sm">
              {selectedImageIndex + 1} / {allImagesMemo.length}
            </div>
          )}

          {/* Image Container */}
          <div 
            className="relative w-full h-full flex flex-col items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {allImagesMemo[selectedImageIndex] && (
              <img
                src={allImagesMemo[selectedImageIndex].url}
                alt={`Image ${selectedImageIndex + 1}`}
                className="max-w-full max-h-[85vh] object-contain"
                style={{ 
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  touchAction: 'none'
                }}
              />
            )}
            
            {/* Caption and Sender Info */}
            {allImagesMemo[selectedImageIndex] && (allImagesMemo[selectedImageIndex].caption || allImagesMemo[selectedImageIndex].sender) && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
                {allImagesMemo[selectedImageIndex]?.sender && (
                  <div className="text-sm font-medium mb-1">
                    {allImagesMemo[selectedImageIndex].sender}
                  </div>
                )}
                {allImagesMemo[selectedImageIndex]?.caption && (
                  <div className="text-sm opacity-90">
                    {allImagesMemo[selectedImageIndex].caption}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};