import { Calendar, MapPin, Flame, Bookmark, Users } from 'lucide-react';
import { Event, Club } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { formatEventDate } from '../utils/dateUtils';

interface EventCardProps {
  event: Event;
  club?: Club;
  onClick: () => void;
  isSaved?: boolean;
  onToggleSave?: (e: React.MouseEvent) => void;
  darkMode?: boolean;
}

const categoryColors: Record<string, string> = {
  Workshops: '#3A82F7',
  Parties: '#A05BFF',
  Seminars: '#F59E0B',
  Sports: '#10B981',
  Clubs: '#EC4899',
  Music: '#4DFFF3',
  Tech: '#3A82F7',
  Art: '#8B5CF6',
};

export function EventCard({ event, club, onClick, isSaved, onToggleSave, darkMode = true }: EventCardProps) {
  const isOnFire = event.attendees >= 200;
  
  return (
    <div className="relative">
      {/* Flame aura effect */}
      {isOnFire && (
        <>
          <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 rounded-3xl blur-xl opacity-30 animate-pulse" aria-hidden="true" />
          <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-400 via-red-400 to-orange-400 rounded-3xl blur-md opacity-20" aria-hidden="true" />
        </>
      )}
      
      <Card
        variant="default"
        hoverable
        padding="none"
        darkMode={darkMode}
        className={`w-full text-left overflow-hidden group relative cursor-pointer ${isOnFire ? 'border-orange-500/30' : ''}`}
        role="article"
        aria-label={`${event.title}, ${formatEventDate(event.date)} at ${event.time.split(' - ')[0]}${isOnFire ? ', Hot event' : ''}`}
      >
        {/* Image - clickable area */}
        <div className="relative h-48 overflow-hidden" onClick={onClick}>
          <ImageWithFallback
            src={event.image}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Fire indicator */}
          {isOnFire && (
            <div className="absolute top-3 left-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full shadow-lg shadow-orange-500/50">
                <Flame className="w-4 h-4 text-white animate-pulse" strokeWidth={2} fill="currentColor" />
                <span className="text-white text-xs">On Fire</span>
              </div>
            </div>
          )}
          
          {/* Category badge */}
          <div className="absolute top-3 right-3">
            <Badge variant="custom" customColor={categoryColors[event.category]}>
              {event.category}
            </Badge>
          </div>

          {/* Gradient overlay */}
          <div className={`absolute inset-0 bg-gradient-to-t via-transparent to-transparent ${
            darkMode ? 'from-dark-700' : 'from-white'
          }`} aria-hidden="true" />
        </div>

        {/* Content */}
        <div className="p-4" onClick={onClick}>
          <h3 className={`mb-2 line-clamp-2 group-hover:text-neon-blue transition-colors ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {event.title}
          </h3>

          <div className={`flex items-center gap-4 text-sm mb-2 ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} aria-hidden="true" />
              <time dateTime={event.date}>{formatEventDate(event.date)}</time>
            </div>
            <div className="flex items-center gap-1.5">
              <span>{event.time.split(' - ')[0]}</span>
            </div>
          </div>

          <div className={`flex items-start gap-1.5 text-sm mb-3 ${
            darkMode ? 'text-gray-500' : 'text-gray-600'
          }`}>
            <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={1.5} aria-hidden="true" />
            <span className="line-clamp-1">{event.location}</span>
          </div>

          {/* Attendees count and Save button */}
          <div className="flex items-center justify-between mb-3" onClick={(e) => e.stopPropagation()}>
            <div className={`flex items-center gap-1.5 text-sm ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <Users className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} aria-hidden="true" />
              <span>{event.attendees} attending</span>
            </div>
            
            {onToggleSave && (
              <button
                onClick={onToggleSave}
                className={`p-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-neon-blue ${
                  isSaved
                    ? 'bg-neon-blue/20 text-neon-blue'
                    : darkMode
                      ? 'bg-dark-700/50 text-gray-400 hover:bg-dark-700 hover:text-neon-blue'
                      : 'bg-light-700 text-gray-500 hover:bg-light-600 hover:text-neon-blue'
                }`}
                aria-label={isSaved ? 'Remove from saved events' : 'Save event'}
                aria-pressed={isSaved}
              >
                <Bookmark 
                  className="w-4 h-4" 
                  strokeWidth={2} 
                  fill={isSaved ? 'currentColor' : 'none'}
                />
              </button>
            )}
          </div>

          {/* Club badge */}
          {club && (
            <div className={`flex items-center gap-2 pt-3 border-t ${
              darkMode ? 'border-white/5' : 'border-black/5'
            }`} onClick={(e) => e.stopPropagation()}>
              <span
                className="text-lg"
                aria-hidden="true"
              >
                {club.logo}
              </span>
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{club.name}</span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}