import { ArrowLeft, Calendar, MapPin, Users, Bookmark, Share2 } from 'lucide-react';
import { Event, Club } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { motion } from 'motion/react';
import { formatEventDate } from '../utils/dateUtils';

interface EventDetailScreenProps {
  event: Event;
  club?: Club;
  relatedEvents: Event[];
  clubs: Club[];
  isSaved: boolean;
  onBack: () => void;
  onEventClick: (event: Event) => void;
  onToggleSave: () => void;
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

export function EventDetailScreen({
  event,
  club,
  relatedEvents,
  clubs,
  isSaved,
  onBack,
  onEventClick,
  onToggleSave,
  darkMode
}: EventDetailScreenProps) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: `Check out this event: ${event.title}`,
          url: window.location.href
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    }
  };

  const getClub = (clubId: string) => clubs.find(c => c.id === clubId);

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Header with image */}
      <header className="relative h-80 overflow-hidden">
        <ImageWithFallback
          src={event.image}
          alt=""
          className="w-full h-full object-cover"
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-dark-900/40 via-transparent to-dark-900" aria-hidden="true" />

        {/* Back button */}
        <button
          onClick={onBack}
          className="absolute top-8 left-6 w-10 h-10 bg-dark-900/60 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 hover:bg-dark-900/80 transition-colors focus:outline-none focus:ring-2 focus:ring-neon-blue focus:ring-offset-2 focus:ring-offset-transparent"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-white" strokeWidth={2} />
        </button>

        {/* Action buttons */}
        <div className="absolute top-8 right-6 flex gap-2">
          <button
            onClick={onToggleSave}
            className="w-10 h-10 bg-dark-900/60 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 hover:bg-dark-900/80 transition-colors focus:outline-none focus:ring-2 focus:ring-neon-blue focus:ring-offset-2 focus:ring-offset-transparent"
            aria-label={isSaved ? 'Remove from saved events' : 'Save event'}
            aria-pressed={isSaved}
          >
            <Bookmark
              className={`w-5 h-5 ${isSaved ? 'text-neon-blue fill-neon-blue' : 'text-white'}`}
              strokeWidth={2}
            />
          </button>
          <button
            onClick={handleShare}
            className="w-10 h-10 bg-dark-900/60 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 hover:bg-dark-900/80 transition-colors focus:outline-none focus:ring-2 focus:ring-neon-blue focus:ring-offset-2 focus:ring-offset-transparent"
            aria-label="Share event"
          >
            <Share2 className="w-5 h-5 text-white" strokeWidth={2} />
          </button>
        </div>
      </header>

      {/* Content card */}
      <main className="relative -mt-8 px-6 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card variant="glass" padding="lg">
            {/* Category badge */}
            <div className="mb-4">
              <Badge variant="custom" customColor={categoryColors[event.category]}>
                {event.category}
              </Badge>
            </div>

            {/* Title */}
            <h1 className="text-3xl text-white mb-6">{event.title}</h1>

            {/* Info grid */}
            <div className="space-y-4 mb-6" role="list">
              <div className="flex items-center gap-3" role="listitem">
                <div className="w-10 h-10 bg-neon-blue/10 rounded-xl flex items-center justify-center flex-shrink-0" aria-hidden="true">
                  <Calendar className="w-5 h-5 text-neon-blue" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-white text-sm">
                    <time dateTime={event.date}>{formatEventDate(event.date)}</time>
                  </p>
                  <p className="text-gray-400 text-xs">{event.time}</p>
                </div>
              </div>

              <div className="flex items-center gap-3" role="listitem">
                <div className="w-10 h-10 bg-neon-purple/10 rounded-xl flex items-center justify-center flex-shrink-0" aria-hidden="true">
                  <MapPin className="w-5 h-5 text-neon-purple" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-white text-sm">{event.location}</p>
                  <p className="text-gray-400 text-xs">Tap for directions</p>
                </div>
              </div>

              <div className="flex items-center gap-3" role="listitem">
                <div className="w-10 h-10 bg-neon-cyan/10 rounded-xl flex items-center justify-center flex-shrink-0" aria-hidden="true">
                  <Users className="w-5 h-5 text-neon-cyan" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-white text-sm">{event.attendees} attending</p>
                  {club && <p className="text-gray-400 text-xs">Organized by {club.name}</p>}
                </div>
              </div>

              {club && (
                <div className="flex items-center gap-3 pt-3 border-t border-white/5" role="listitem">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                    style={{ backgroundColor: `${club.color}20` }}
                    aria-hidden="true"
                  >
                    {club.logo}
                  </div>
                  <div>
                    <p className="text-white text-sm">{club.name}</p>
                    <p className="text-gray-400 text-xs">{club.category}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <section className="border-t border-white/5 pt-6 mb-6">
              <h2 className="text-white mb-3">About this event</h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                {event.description}
              </p>
            </section>

            {/* Action buttons */}
            <div className="flex gap-3">
              <Button variant="primary" size="lg" fullWidth>
                Join Event
              </Button>
              <Button
                variant={isSaved ? 'secondary' : 'outline'}
                size="lg"
                onClick={onToggleSave}
                aria-label={isSaved ? 'Remove from saved events' : 'Save event'}
              >
                <Bookmark
                  className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`}
                  strokeWidth={1.5}
                />
              </Button>
            </div>
          </Card>

          {/* Similar events */}
          {relatedEvents.length > 0 && (
            <section className="mt-8" aria-labelledby="similar-events-title">
              <h2 id="similar-events-title" className="text-white mb-4">
                Similar Events
              </h2>
              <div className="flex gap-4 overflow-x-auto scrollbar-hide -mx-6 px-6">
                {relatedEvents.map((relatedEvent) => {
                  const relatedClub = getClub(relatedEvent.clubId);
                  return (
                    <button
                      key={relatedEvent.id}
                      onClick={() => onEventClick(relatedEvent)}
                      className="flex-shrink-0 w-64 bg-dark-700/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/5 hover:border-neon-blue/30 transition-all focus:outline-none focus:ring-2 focus:ring-neon-blue text-left"
                      aria-label={`${relatedEvent.title}, ${formatEventDate(relatedEvent.date)}`}
                    >
                      <div className="relative h-32 overflow-hidden">
                        <ImageWithFallback
                          src={relatedEvent.image}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-dark-700 via-transparent to-transparent" aria-hidden="true" />
                      </div>
                      <div className="p-3">
                        <p className="text-white text-sm mb-1 line-clamp-2">
                          {relatedEvent.title}
                        </p>
                        <p className="text-gray-500 text-xs">
                          <time dateTime={relatedEvent.date}>{formatEventDate(relatedEvent.date)}</time>
                        </p>
                        {relatedClub && (
                          <div className="flex items-center gap-1 mt-2">
                            <span className="text-xs" aria-hidden="true">{relatedClub.logo}</span>
                            <span className="text-xs text-gray-500">{relatedClub.name}</span>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          )}
        </motion.div>
      </main>
    </div>
  );
}