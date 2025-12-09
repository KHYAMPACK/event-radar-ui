import { useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Event, Club, Screen } from '../types';
import { BottomNav } from './BottomNav';
import { CalendarGrid } from './CalendarGrid';
import { DayEventsSheet } from './DayEventsSheet';
import { motion } from 'motion/react';

interface CalendarScreenProps {
  savedEvents: Event[];
  clubs: Club[];
  onNavigate: (screen: Screen) => void;
  onEventClick: (event: Event) => void;
  darkMode?: boolean;
}

export function CalendarScreen({ savedEvents, clubs, onNavigate, onEventClick, darkMode = true }: CalendarScreenProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDayEvents, setSelectedDayEvents] = useState<Event[]>([]);

  const handleDayClick = (date: Date, events: Event[]) => {
    if (events.length > 0) {
      setSelectedDate(date);
      setSelectedDayEvents(events);
    }
  };

  const handleCloseSheet = () => {
    setSelectedDate(null);
    setSelectedDayEvents([]);
  };

  return (
    <div className={`min-h-screen pb-28 ${darkMode ? 'bg-dark-900' : 'bg-light-800'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-40 backdrop-blur-xl border-b px-6 pt-8 pb-4 ${
        darkMode 
          ? 'bg-dark-900/95 border-white/5' 
          : 'bg-light-900/95 border-black/5'
      }`}>
        <div className="flex items-center gap-2 mb-2">
          <h1 className={`text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>Calendar</h1>
          <CalendarIcon className="w-5 h-5 text-neon-cyan" strokeWidth={2} aria-hidden="true" />
        </div>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} aria-live="polite">
          {savedEvents.length} saved event{savedEvents.length !== 1 ? 's' : ''}
        </p>
      </header>

      <main className="px-6 pt-6">
        <CalendarGrid
          savedEvents={savedEvents}
          clubs={clubs}
          onDayClick={handleDayClick}
          darkMode={darkMode}
        />
      </main>

      {/* Day events sheet */}
      <DayEventsSheet
        isOpen={selectedDate !== null}
        onClose={handleCloseSheet}
        date={selectedDate}
        events={selectedDayEvents}
        clubs={clubs}
        onEventClick={onEventClick}
      />

      {/* Bottom navigation */}
      <BottomNav activeScreen="calendar" onNavigate={onNavigate} darkMode={darkMode} />
    </div>
  );
}