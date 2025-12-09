import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Event } from '../types';
import { getDaysInMonth, formatDate, isSameDay, isToday, getMonthName } from '../utils/dateUtils';
import { motion } from 'motion/react';

import type { Club } from '../types';

interface CalendarGridProps {
  savedEvents: Event[];
  clubs: Club[];
  onDayClick: (date: Date, events: Event[]) => void;
  darkMode?: boolean;
}

export function CalendarGrid({ savedEvents, clubs, onDayClick, darkMode = true }: CalendarGridProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const days = getDaysInMonth(year, month);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getEventsForDay = (date: Date): Event[] => {
    const dateStr = formatDate(date);
    return savedEvents.filter(event => event.date === dateStr);
  };

  const getClubsForDay = (date: Date): Club[] => {
    const dayEvents = getEventsForDay(date);
    const ids = new Set(dayEvents.map(e => e.clubId));
    return clubs.filter(c => ids.has(c.id));
  };

  const getTopEventForDay = (date: Date): Event | null => {
    const dayEvents = getEventsForDay(date);
    if (dayEvents.length === 0) return null;
    return dayEvents.reduce((top, ev) => (ev.attendees > top.attendees ? ev : top), dayEvents[0]);
  };

  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === month;
  };

  return (
    <div className={`backdrop-blur-sm rounded-3xl border overflow-hidden ${
      darkMode 
        ? 'bg-dark-700/50 border-white/5' 
        : 'bg-white border-black/5 shadow-sm'
    }`}>
      {/* Month navigation */}
      <div className={`flex items-center justify-between p-4 border-b ${
        darkMode ? 'border-white/5' : 'border-black/5'
      }`}>
        <button
          onClick={previousMonth}
          className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-neon-blue ${
            darkMode
              ? 'bg-dark-700/50 hover:bg-dark-600'
              : 'bg-light-700 hover:bg-light-600'
          }`}
          aria-label="Previous month"
        >
          <ChevronLeft className="w-5 h-5 text-gray-400" strokeWidth={2} />
        </button>

        <h2 className={`text-xl ${darkMode ? 'text-white' : 'text-gray-900'}`} aria-live="polite">
          {getMonthName(month)} {year}
        </h2>

        <button
          onClick={nextMonth}
          className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-neon-blue ${
            darkMode
              ? 'bg-dark-700/50 hover:bg-dark-600'
              : 'bg-light-700 hover:bg-light-600'
          }`}
          aria-label="Next month"
        >
          <ChevronRight className="w-5 h-5 text-gray-400" strokeWidth={2} />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="p-4">
        {/* Week day headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {weekDays.map(day => (
            <div
              key={day}
              className={`text-center text-xs py-2 ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}
              aria-label={day}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-2" role="grid" aria-label="Calendar">
          {days.map((day, index) => {
            const dayEvents = getEventsForDay(day);
            const dayClubs = getClubsForDay(day);
            const hasEvents = dayEvents.length > 0;
            const isCurrentMonthDay = isCurrentMonth(day);
            const isTodayDay = isToday(day);
            const topEvent = getTopEventForDay(day);
            const topClub = topEvent ? clubs.find(c => c.id === topEvent.clubId) ?? null : null;
            const hasMultipleEvents = dayEvents.length > 1;

            return (
              <motion.button
                key={index}
                whileHover={isCurrentMonthDay ? { scale: 1.05 } : {}}
                whileTap={isCurrentMonthDay ? { scale: 0.95 } : {}}
                onClick={() => isCurrentMonthDay && onDayClick(day, dayEvents)}
                disabled={!isCurrentMonthDay}
                className={`
                  h-20 rounded-2xl flex flex-col items-center justify-start py-1.5 px-1 transition-all relative
                  focus:outline-none focus:ring-2 focus:ring-neon-blue focus:ring-offset-2 ${darkMode ? 'focus:ring-offset-dark-700' : 'focus:ring-offset-white'}
                  ${isCurrentMonthDay 
                    ? darkMode ? 'text-white' : 'text-gray-900' 
                    : 'text-gray-600 cursor-default'}
                  ${isTodayDay 
                    ? 'bg-neon-blue/20 border border-neon-blue/50' 
                    : darkMode 
                      ? 'bg-dark-800/50' 
                      : 'bg-light-700/50'}
                  ${hasEvents && isCurrentMonthDay 
                    ? darkMode 
                      ? 'hover:bg-dark-700' 
                      : 'hover:bg-light-600' 
                    : ''}
                `}
                aria-label={`${getMonthName(day.getMonth())} ${day.getDate()}, ${day.getFullYear()}${hasEvents ? `, ${dayEvents.length} event${dayEvents.length > 1 ? 's' : ''}` : ''}`}
                aria-current={isTodayDay ? 'date' : undefined}
              >
                {/* Day number */}
                <div className="w-full flex justify-center items-start text-xs mb-1">
                  <span className="text-sm font-medium flex items-center gap-1">
                    {day.getDate()}
                  </span>
                </div>

                {/* Top club logo + plus indicator if multiple events */}
                {hasEvents && isCurrentMonthDay && topClub && (
                  <div className="flex-1 flex items-center justify-center relative z-10">
                    <div className="flex items-center gap-1 max-h-10 overflow-hidden">
                      <span
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] bg-dark-900/60 shadow-sm"
                        style={{ border: `1px solid ${topClub.color}66` }}
                        aria-hidden="true"
                      >
                        {topClub.logo}
                      </span>
                      {hasMultipleEvents && (
                        <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-dark-900/70 border border-white/10 text-[10px] text-gray-300">
                          <Plus className="w-3 h-3" strokeWidth={2} />
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* fallback tiny dots if there are events but no clubs found (should be rare) */}
                {hasEvents && isCurrentMonthDay && (!topClub || dayClubs.length === 0) && (
                  <div className="flex items-center justify-center gap-0.5" aria-hidden="true">
                    {dayEvents.slice(0, 3).map((_, i) => (
                      <div
                        key={i}
                        className="w-1 h-1 rounded-full bg-neon-cyan"
                      />
                    ))}
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}