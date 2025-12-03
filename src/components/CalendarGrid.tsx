import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Event } from '../types';
import { getDaysInMonth, formatDate, isSameDay, isToday, getMonthName } from '../utils/dateUtils';
import { motion } from 'motion/react';

interface CalendarGridProps {
  savedEvents: Event[];
  onDayClick: (date: Date, events: Event[]) => void;
  darkMode?: boolean;
}

export function CalendarGrid({ savedEvents, onDayClick, darkMode = true }: CalendarGridProps) {
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
            const hasEvents = dayEvents.length > 0;
            const isCurrentMonthDay = isCurrentMonth(day);
            const isTodayDay = isToday(day);

            return (
              <motion.button
                key={index}
                whileHover={isCurrentMonthDay ? { scale: 1.05 } : {}}
                whileTap={isCurrentMonthDay ? { scale: 0.95 } : {}}
                onClick={() => isCurrentMonthDay && onDayClick(day, dayEvents)}
                disabled={!isCurrentMonthDay}
                className={`
                  aspect-square rounded-xl flex flex-col items-center justify-center p-1 transition-all relative
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
                <span className="text-sm">{day.getDate()}</span>
                {hasEvents && isCurrentMonthDay && (
                  <div className="absolute bottom-1 flex gap-0.5" aria-hidden="true">
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