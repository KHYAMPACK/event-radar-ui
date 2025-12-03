import { X, Calendar, MapPin, Users } from 'lucide-react';
import { Event, Club } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { useEffect } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { formatEventDate } from '../utils/dateUtils';

interface DayEventsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
  events: Event[];
  clubs: Club[];
  onEventClick: (event: Event) => void;
}

export function DayEventsSheet({ isOpen, onClose, date, events, clubs, onEventClick }: DayEventsSheetProps) {
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

  const getClub = (clubId: string) => clubs.find(c => c.id === clubId);

  return (
    <AnimatePresence>
      {isOpen && date && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
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
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="relative w-full max-w-md bg-dark-800 rounded-3xl border border-white/10 shadow-2xl max-h-[85vh] flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-labelledby="day-sheet-title"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/5">
              <div>
                <h2 id="day-sheet-title" className="text-xl text-white">
                  {date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                </h2>
                <p className="text-sm text-gray-400">
                  {events.length} event{events.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-dark-700/50 hover:bg-dark-700 transition-colors focus:outline-none focus:ring-2 focus:ring-neon-blue"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-400" strokeWidth={2} />
              </button>
            </div>

            {/* Events list */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {events.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-3" strokeWidth={1.5} />
                  <p className="text-gray-400">No events on this day</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {events.map((event) => {
                    const club = getClub(event.clubId);
                    return (
                      <button
                        key={event.id}
                        onClick={() => {
                          onEventClick(event);
                          onClose();
                        }}
                        className="w-full bg-dark-700/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/5 hover:border-neon-blue/30 transition-all text-left group"
                      >
                        <div className="flex gap-3 p-3">
                          {/* Event image */}
                          <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden">
                            <ImageWithFallback
                              src={event.image}
                              alt={event.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          </div>

                          {/* Event info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-white text-sm mb-1 line-clamp-2 group-hover:text-neon-blue transition-colors">
                              {event.title}
                            </h3>
                            
                            <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-1">
                              <Calendar className="w-3 h-3 flex-shrink-0" strokeWidth={1.5} />
                              <span>{event.time.split(' - ')[0]}</span>
                            </div>

                            <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-1">
                              <MapPin className="w-3 h-3 flex-shrink-0" strokeWidth={1.5} />
                              <span className="line-clamp-1">{event.location.split(',')[0]}</span>
                            </div>

                            {club && (
                              <div className="flex items-center gap-1.5 text-xs mt-2">
                                <span
                                  className="px-2 py-0.5 rounded-full"
                                  style={{
                                    backgroundColor: `${club.color}20`,
                                    color: club.color
                                  }}
                                >
                                  {club.name}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}