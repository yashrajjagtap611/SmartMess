import React, { useState, useRef, useEffect } from 'react';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const EMOJI_CATEGORIES = {
  'Faces': ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐'],
  'Hearts': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟'],
  'Hands': ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤝', '👏', '🙌', '👐', '🤲', '🤜', '🤛', '✊', '👊', '👎', '👍'],
  'Objects': ['📱', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '💾', '💿', '📀', '📷', '📹', '🎥', '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭', '⏱️', '⏲️', '⏰', '🕰️', '⌛', '⏳', '📡', '🔋', '🔌', '💡', '🔦', '🕯️', '🪔', '🧯', '🛢️', '💸', '💵', '💴', '💶', '💷', '💰', '💳', '💎', '⚖️', '🧰', '🔧', '🔨', '⚒️', '🛠️', '⛏️', '🔩', '⚙️', '🧱', '⛓️', '🧲', '🔫', '💣', '🧨', '🪓', '🔪', '🗡️', '⚔️', '🛡️', '🚬', '⚰️', '🪦', '⚱️', '🏺', '🔮', '📿', '🧿', '💈', '⚗️', '🔭', '🔬', '🕳️', '🩹', '🩺', '💊', '💉', '🩸', '🧬', '🦠', '🧫', '🧪', '🌡️', '🧹', '🧺', '🧻', '🚽', '🚰', '🚿', '🛁', '🛀', '🧼', '🪒', '🧽', '🧴', '🛎️', '🔑', '🗝️', '🚪', '🪑', '🛋️', '🛏️', '🛌', '🧸', '🖼️', '🪞', '🪟', '🛍️', '🛒', '🎁', '🎈', '🎏', '🎀', '🎊', '🎉', '🎎', '🏮', '🎐', '🧧', '✉️', '📩', '📨', '📧', '💌', '📥', '📤', '📦', '🏷️', '📪', '📫', '📬', '📭', '📮', '🗳️', '✏️', '✒️', '🖋️', '🖊️', '🖌️', '🖍️', '📝', '💼', '📁', '📂', '🗂️', '📅', '📆', '🗒️', '🗓️', '📇', '📈', '📉', '📊', '📋', '📌', '📍', '📎', '🖇️', '📏', '📐', '✂️', '🗃️', '🗄️', '🗑️', '🔒', '🔓', '🔏', '🔐', '🔑', '🗝️', '🔨', '⛏️', '⚒️', '🛠️', '🗡️', '⚔️', '🔫', '🏹', '🛡️', '🔧', '🔩', '⚙️', '🗜️', '⚖️', '🦯', '🔗', '⛓️', '🧰', '🧲', '⚗️', '🧪', '🧫', '🧬', '🦠', '💊', '💉', '🩸', '🩹', '🩺', '🧿', '🔮', '📿', '🕳️', '🩰', '🩱', '🩲', '🩳', '👔', '👕', '👖', '🧣', '🧤', '🧥', '🧦', '👗', '👘', '🥻', '🩱', '🩲', '🩳', '👙', '👚', '👛', '👜', '👝', '🛍️', '🎒', '👞', '👟', '🥾', '🥿', '👠', '👡', '👢', '👑', '👒', '🎩', '🎓', '🧢', '⛑️', '🪖', '💄', '💍', '💎'],
  'Food': ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐', '🥖', '🍞', '🥨', '🥯', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔', '🍟', '🍕', '🫓', '🥙', '🌮', '🌯', '🫔', '🥗', '🥘', '🫕', '🥫', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🦪', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰', '🥜', '🍯']
};

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiSelect, isOpen, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof EMOJI_CATEGORIES>('Faces');
  const pickerRef = useRef<HTMLDivElement>(null);

  // Adjust position to stay within screen bounds
  useEffect(() => {
    if (!isOpen || !pickerRef.current) return;

    const adjustPosition = () => {
      const picker = pickerRef.current;
      if (!picker) return;

      const viewportWidth = window.innerWidth;
      const padding = 12; // Minimum padding from screen edges
      
      // Reset positioning first
      picker.style.position = 'absolute';
      picker.style.left = '0';
      picker.style.right = '';
      picker.style.transform = '';
      
      // Force reflow to get actual position
      void picker.offsetHeight;
      
      // Get actual rendered position
      const pickerRect = picker.getBoundingClientRect();
      
      // Check if it goes outside right edge
      if (pickerRect.right > viewportWidth - padding) {
        // Calculate how much to shift left
        const overflowAmount = pickerRect.right - (viewportWidth - padding);
        const currentLeft = parseFloat(picker.style.left) || 0;
        picker.style.left = `${currentLeft - overflowAmount}px`;
      }
      // Check if it goes outside left edge
      else if (pickerRect.left < padding) {
        // Shift right to stay within bounds
        const underflowAmount = padding - pickerRect.left;
        const currentLeft = parseFloat(picker.style.left) || 0;
        picker.style.left = `${currentLeft + underflowAmount}px`;
      }
    };

    // Adjust position after render with multiple attempts for accuracy
    const timeout1 = setTimeout(adjustPosition, 0);
    const timeout2 = setTimeout(adjustPosition, 50);
    const timeout3 = setTimeout(adjustPosition, 100);
    
    // Also adjust on window resize and scroll
    window.addEventListener('resize', adjustPosition);
    window.addEventListener('scroll', adjustPosition, true);
    
    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
      window.removeEventListener('resize', adjustPosition);
      window.removeEventListener('scroll', adjustPosition, true);
    };
  }, [isOpen, selectedCategory]);

  if (!isOpen) return null;

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
  };

  return (
    <div 
      ref={pickerRef}
      className="absolute bottom-full left-0 mb-2 w-80 sm:w-80 bg-card border border-border rounded-lg shadow-lg z-50"
      style={{
        maxWidth: 'min(320px, calc(100vw - 2rem))',
        width: 'min(320px, calc(100vw - 2rem))'
      }}
    >
      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-card-foreground">Choose an emoji</h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            ✕
          </button>
        </div>
        
        {/* Category tabs */}
        <div className="flex space-x-1 mt-2">
          {Object.keys(EMOJI_CATEGORIES).map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category as keyof typeof EMOJI_CATEGORIES)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                selectedCategory === category
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      
      {/* Emoji grid */}
      <div className="p-3 max-h-60 overflow-y-auto">
        <div className="grid grid-cols-8 gap-1">
          {EMOJI_CATEGORIES[selectedCategory].map((emoji, index) => (
            <button
              key={index}
              onClick={() => handleEmojiClick(emoji)}
              className="w-8 h-8 flex items-center justify-center text-lg hover:bg-accent rounded transition-colors"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
