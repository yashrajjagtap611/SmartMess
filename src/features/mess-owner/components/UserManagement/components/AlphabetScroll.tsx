import React from 'react';
import type { AlphabetScrollProps } from '../UserManagement.types';

const AlphabetScroll: React.FC<AlphabetScrollProps> = ({
  alphabet,
  groupedUsers,
  selectedLetter,
  onLetterSelect,

}) => {
  return (
    <>
      {/* Desktop Version */}
      <div 
        className="fixed right-4 z-30 hidden lg:block"
        style={{ 
          top: '60px',
          marginTop: '45px',
          maxHeight: 'calc(100vh - 170px)',
          height: 'calc(100vh - 170px)',
          bottom: '100px'
        }}
      >
        <div 
          className="flex flex-col space-y-1 p-2 bg-SmartMess-light-surface dark:SmartMess-dark-surface dark:bg-SmartMess-light-surface dark:SmartMess-dark-surface rounded-2xl border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95 overflow-y-auto scrollbar-hide"
          style={{
            maxHeight: 'calc(100vh - 150px)',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {alphabet.map((letter) => {
            const hasUsers = groupedUsers[letter] && groupedUsers[letter].length > 0;
            const isSelected = selectedLetter === letter;
            
            return (
              <button
                key={letter}
                onClick={() => onLetterSelect(letter)}
                disabled={!hasUsers}
                className={`w-8 h-8 flex items-center justify-center text-xs font-bold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-SmartMess-light-primary dark:SmartMess-dark-primary/30 dark:focus:ring-SmartMess-light-primary dark:SmartMess-dark-primary/40 flex-shrink-0 ${
                  isSelected 
                    ? 'bg-SmartMess-light-primary dark:SmartMess-dark-primary text-white shadow-lg scale-110 ring-2 ring-SmartMess-light-primary dark:SmartMess-dark-primary/50 dark:ring-SmartMess-light-primary dark:SmartMess-dark-primary/50 animate-pulse' 
                    : hasUsers 
                      ? 'text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text hover:bg-SmartMess-light-primary dark:SmartMess-dark-primary/10 dark:hover:bg-SmartMess-light-primary dark:SmartMess-dark-primary/20 hover:text-SmartMess-light-primary dark:SmartMess-dark-primary dark:hover:text-SmartMess-light-primary dark:SmartMess-dark-primary hover:scale-105' 
                      : 'text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted opacity-40 cursor-not-allowed'
                }`}
                aria-label={`Scroll to users starting with ${letter}`}
                title={hasUsers ? `Users starting with ${letter}` : `No users starting with ${letter}`}
              >
                {letter}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Version */}
      <div 
        className="fixed right-2 z-20 block lg:hidden"
        style={{ 
          top: '60px',
          maxHeight: 'calc(100vh - 170px)',
          height: 'calc(100vh - 170px)',
          bottom: '100px'
        }}
      >
        <div 
          className="flex flex-col space-y-0.5 p-1.5 lg:bg-SmartMess-light-surface dark:SmartMess-dark-surface lg:dark:bg-SmartMess-light-surface dark:SmartMess-dark-surface lg:rounded-2xl lg:shadow-2xl lg:border lg:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border lg:dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95 overflow-y-auto scrollbar-hide"
          style={{
            maxHeight: 'calc(100vh - 150px)',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {alphabet.map((letter) => {
            const hasUsers = groupedUsers[letter] && groupedUsers[letter].length > 0;
            const isSelected = selectedLetter === letter;
            
            return (
              <button
                key={letter}
                onClick={() => onLetterSelect(letter)}
                disabled={!hasUsers}
                className={`w-5 h-5 sm:w-6 sm:h-6 md:w-4 md:h-4 flex items-center justify-center text-xs font-bold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-SmartMess-light-primary dark:SmartMess-dark-primary/30 dark:focus:ring-SmartMess-light-primary dark:SmartMess-dark-primary/40 flex-shrink-0 ${
                  isSelected 
                    ? 'bg-SmartMess-light-primary dark:SmartMess-dark-primary text-white shadow-lg scale-110 ring-2 ring-SmartMess-light-primary dark:SmartMess-dark-primary/50 dark:ring-SmartMess-light-primary dark:SmartMess-dark-primary/50 animate-pulse' 
                    : hasUsers 
                      ? 'text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text hover:bg-SmartMess-light-primary dark:SmartMess-dark-primary/10 dark:hover:bg-SmartMess-light-primary dark:SmartMess-dark-primary/20 hover:text-SmartMess-light-primary dark:SmartMess-dark-primary dark:hover:text-SmartMess-light-primary dark:SmartMess-dark-primary hover:scale-105' 
                      : 'text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted opacity-40 cursor-not-allowed'
                }`}
                aria-label={`Scroll to users starting with ${letter}`}
                title={hasUsers ? `Users starting with ${letter}` : `No users starting with ${letter}`}
              >
                {letter}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default AlphabetScroll; 