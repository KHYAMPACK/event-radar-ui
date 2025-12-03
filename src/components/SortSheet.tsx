import { X, Calendar, TrendingUp, Users, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useEffect } from 'react';

export type SortOption = 'date' | 'popular' | 'recent';

interface SortSheetProps {
  isOpen: boolean;
  onClose: () => void;
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export function SortSheet({ isOpen, onClose, currentSort, onSortChange }: SortSheetProps) {
  useEffect(() => {
    if (isOpen) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  const sortOptions: { id: SortOption; label: string; description: string; icon: typeof Calendar }[] = [
    {
      id: 'date',
      label: 'By Date',
      description: 'Sort events by date (soonest first)',
      icon: Calendar
    },
    {
      id: 'popular',
      label: 'Most Popular',
      description: 'Sort by number of attendees',
      icon: TrendingUp
    },
    {
      id: 'recent',
      label: 'Recently Added',
      description: 'Newest events first',
      icon: Clock
    }
  ];

  const handleSortSelect = (sort: SortOption) => {
    onSortChange(sort);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="relative w-full max-w-md mx-auto bg-dark-800 rounded-t-3xl border-t border-x border-white/10 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sort-sheet-title"
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-2" aria-hidden="true">
              <div className="w-12 h-1 bg-gray-600 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 pb-4 border-b border-white/5">
              <h2 id="sort-sheet-title" className="text-xl text-white">
                Sort Events
              </h2>
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-dark-700/50 hover:bg-dark-700 transition-colors focus:outline-none focus:ring-2 focus:ring-neon-blue"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-400" strokeWidth={2} />
              </button>
            </div>

            {/* Sort options */}
            <div className="px-6 py-4 pb-6 space-y-2">
              {sortOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = currentSort === option.id;
                
                return (
                  <button
                    key={option.id}
                    onClick={() => handleSortSelect(option.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left focus:outline-none focus:ring-2 focus:ring-neon-blue ${
                      isSelected
                        ? 'bg-neon-blue/10 border border-neon-blue/30'
                        : 'bg-dark-700/30 border border-white/5 hover:bg-dark-700/50'
                    }`}
                    aria-pressed={isSelected}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isSelected ? 'bg-neon-blue/20' : 'bg-dark-700/50'
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 ${isSelected ? 'text-neon-blue' : 'text-gray-400'}`}
                        strokeWidth={2}
                      />
                    </div>
                    
                    <div className="flex-1">
                      <div className={`mb-0.5 ${isSelected ? 'text-neon-blue' : 'text-white'}`}>
                        {option.label}
                      </div>
                      <div className="text-sm text-gray-500">{option.description}</div>
                    </div>

                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-neon-cyan shadow-lg shadow-neon-cyan/50" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
