import { useState } from 'react';
import { ArrowLeft, Calendar, MapPin, Users, Bookmark, Share2, Flag } from 'lucide-react';
import { Event, Club } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Textarea } from './ui/textarea';
import { motion, AnimatePresence } from 'motion/react';
import { formatEventDate } from '../utils/dateUtils';
import { hasUserReportedEvent, submitEventReport, EventReportType } from '../api/reports';
import { ClubModal } from './ClubModal';

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
  currentUserId?: string | null;
  isFollowingClub?: boolean;
  clubNotificationsEnabled?: boolean;
  onToggleFollowClubForClub?: () => void;
  onToggleClubNotificationsForClub?: () => void;
  onViewClubEventsFromEvent?: () => void;
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
  darkMode,
  currentUserId,
  isFollowingClub,
  clubNotificationsEnabled,
  onToggleFollowClubForClub,
  onToggleClubNotificationsForClub,
  onViewClubEventsFromEvent,
}: EventDetailScreenProps) {
  const [showReport, setShowReport] = useState(false);
  const [reportType, setReportType] = useState<EventReportType | null>(null);
  const [reportMessage, setReportMessage] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [alreadyReported, setAlreadyReported] = useState(false);
  const [showClubModal, setShowClubModal] = useState(false);

  const handleOpenReport = async () => {
    if (!currentUserId) {
      alert('Please sign in to report events.');
      return;
    }
    setReportError(null);
    setReportSuccess(false);
    setShowReport(true);
    try {
      const exists = await hasUserReportedEvent(event.id, currentUserId);
      setAlreadyReported(exists);
    } catch (err) {
      console.error('Failed to check existing report:', err);
    }
  };

  const handleSubmitReport = async () => {
    if (!currentUserId || !reportType) return;
    setReportSubmitting(true);
    setReportError(null);
    setReportSuccess(false);
    try {
      await submitEventReport({
        eventId: event.id,
        reporterId: currentUserId,
        type: reportType,
        message: reportMessage,
      });
      setReportSuccess(true);
      setAlreadyReported(true);
    } catch (err: any) {
      console.error('Failed to submit report:', err);
      if (err?.code === 'already_reported') {
        setAlreadyReported(true);
        setReportError('You have already reported this event.');
      } else {
        setReportError(err.message ?? 'Failed to submit report.');
      }
    } finally {
      setReportSubmitting(false);
    }
  };
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
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          <Card variant="glass" padding="lg">
            {/* Category badge + Report button */}
            <div className="mb-4 flex items-center justify-between gap-3">
              <Badge variant="custom" customColor={categoryColors[event.category]}>
                {event.category}
              </Badge>
              <button
                type="button"
                onClick={handleOpenReport}
                className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-500/15 border border-red-500/60 hover:bg-red-500/25 transition-colors"
                aria-label="Report this event"
              >
                <Flag
                  className="w-3.5 h-3.5 text-red-500"
                  strokeWidth={1.8}
                />
              </button>
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
                <button
                  type="button"
                  onClick={() => setShowClubModal(true)}
                  className="flex items-center gap-3 pt-3 border-t border-white/5 w-full text-left hover:bg-dark-800/60 rounded-2xl px-2 -mx-2 mt-1 transition-colors"
                  role="listitem"
                  aria-label={`View details for ${club.name}`}
                >
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
                </button>
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
              <Button
                variant={isSaved ? 'secondary' : 'primary'}
                size="lg"
                fullWidth
                className="relative overflow-hidden"
                onClick={onToggleSave}
                aria-label={isSaved ? "You're in for this event" : 'Count me in for this event'}
              >
                <AnimatePresence>
                  {isSaved && (
                    <motion.span
                      key="glow"
                      className="pointer-events-none absolute inset-0 bg-neon-blue/30 blur-xl"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 0.9, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                      aria-hidden="true"
                    />
                  )}
                </AnimatePresence>
                <span className="relative z-10">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={isSaved ? 'in' : 'out'}
                      initial={{ opacity: 0, y: 6, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.98 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      className="inline-flex items-center justify-center gap-2"
                    >
                      {isSaved ? "You're In!" : 'Count Me In'}
                    </motion.span>
                  </AnimatePresence>
                </span>
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

          {/* Club modal from event detail */}
          {club && (
            <ClubModal
              club={club}
              isOpen={showClubModal}
              onClose={() => setShowClubModal(false)}
              isFollowing={!!isFollowingClub}
              notificationsEnabled={!!clubNotificationsEnabled}
              onToggleFollow={onToggleFollowClubForClub || (() => {})}
              onToggleNotifications={onToggleClubNotificationsForClub || (() => {})}
              onViewEvents={onViewClubEventsFromEvent}
            />
          )}

          {/* Report modal */}
          {showReport && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 12 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 12 }}
                className="w-full max-w-md"
              >
                <Card
                  variant="glass"
                  padding="lg"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm text-white font-medium line-clamp-2">Report this event</p>
                      <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">{event.title}</p>
                      {club && (
                        <p className="text-[11px] text-gray-500 line-clamp-1">From {club.name}</p>
                      )}
                    </div>
                    <button
                      onClick={() => setShowReport(false)}
                      className="text-gray-400 text-xs hover:text-gray-200"
                    >
                      Close
                    </button>
                  </div>

                  <p className="text-xs text-gray-500 mb-3">
                    {alreadyReported
                      ? 'You have already reported this event. Thank you for your feedback.'
                      : 'Choose a reason below and optionally add more details. Reports help keep Event Radar clean.'}
                  </p>

                  <div className="space-y-2 mb-3">
                    {[
                      { id: 'false_incorrect_info', label: 'False / incorrect information' },
                      { id: 'spam_irrelevant', label: 'Spam or irrelevant event' },
                      { id: 'inappropriate_harmful', label: 'Inappropriate or harmful content' },
                      { id: 'duplicate', label: 'Duplicate event' },
                      { id: 'suspected_scam', label: 'Suspected scam / misleading intent' },
                      { id: 'other', label: 'Other' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setReportType(opt.id as EventReportType)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs border transition-colors ${
                          reportType === opt.id
                            ? 'border-neon-blue bg-neon-blue/10 text-white shadow-[0_0_15px_rgba(56,189,248,0.35)]'
                            : 'border-white/10 bg-dark-800 text-gray-300 hover:border-neon-blue/40'
                        }`}
                        disabled={alreadyReported}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  <Textarea
                    rows={3}
                    placeholder="Add more details (optional)"
                    value={reportMessage}
                    onChange={(e) => setReportMessage(e.target.value)}
                    className="border-white/10 bg-dark-800 text-sm text-gray-100 placeholder:text-gray-500 focus-visible:border-neon-blue focus-visible:ring-[3px] focus-visible:ring-neon-blue/40"
                  />

                  {reportError && (
                    <p className="mt-2 text-xs text-red-400">{reportError}</p>
                  )}
                  {reportSuccess && (
                    <p className="mt-2 text-xs text-green-400">Report sent. Thank you.</p>
                  )}

                  <div className="mt-4 flex gap-2 justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowReport(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      disabled={!reportType || reportSubmitting || alreadyReported}
                      isLoading={reportSubmitting}
                      onClick={handleSubmitReport}
                    >
                      Submit report
                    </Button>
                  </div>
                </Card>
              </motion.div>
            </div>
          )}
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