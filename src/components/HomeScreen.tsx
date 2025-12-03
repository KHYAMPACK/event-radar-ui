import { useState } from 'react';
import { Search, TrendingUp, UserPlus, UserCheck, ArrowUpDown, Bell } from 'lucide-react';
import { Event, Club, Screen } from '../types';
import { EventCard } from './EventCard';
import { BottomNav } from './BottomNav';
import { ClubModal } from './ClubModal';
import { SortSheet, SortOption } from './SortSheet';
import { Input } from './ui/Input';
import { motion } from 'motion/react';

interface HomeScreenProps {
  events: Event[];
  clubs: Club[];
  followedClubs: Set<string>;
  clubNotifications: Map<string, boolean>;
  onEventClick: (event: Event) => void;
  onNavigate: (screen: Screen) => void;
  onToggleFollowClub: (clubId: string) => void;
  onToggleClubNotifications: (clubId: string) => void;
  savedEventIds: Set<string>;
  onToggleSaveEvent: (eventId: string) => void;
  unreadNotifications: number;
  onOpenNotifications: () => void;
  initialClubFilter?: string;
  darkMode?: boolean;
}

export function HomeScreen({
  events,
  clubs,
  followedClubs,
  clubNotifications,
  onEventClick,
  onNavigate,
  onToggleFollowClub,
  onToggleClubNotifications,
  savedEventIds,
  onToggleSaveEvent,
  unreadNotifications,
  onOpenNotifications,
  initialClubFilter,
  darkMode = true
}: HomeScreenProps) {
  const [selectedClubFilter, setSelectedClubFilter] = useState(initialClubFilter || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClubModal, setSelectedClubModal] = useState<Club | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('date');
  const [showSortSheet, setShowSortSheet] = useState(false);

  const getClub = (clubId: string) => clubs.find(c => c.id === clubId);

  const filteredEvents = events.filter((event) => {
    const matchesClub = selectedClubFilter === 'all' || event.clubId === selectedClubFilter;
    const club = getClub(event.clubId);
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (club?.name.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    return matchesClub && matchesSearch;
  });

  // Sort events based on selected option
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    switch (sortOption) {
      case 'date':
        return a.date.localeCompare(b.date);
      case 'popular':
        return b.attendees - a.attendees;
      case 'recent':
        // Assuming events are already in order, reverse for recent
        return events.indexOf(b) - events.indexOf(a);
      default:
        return 0;
    }
  });

  const handleClubChipClick = (club: Club) => {
    setSelectedClubModal(club);
  };

  return (
    <div className={`min-h-screen pb-28 ${darkMode ? 'bg-dark-900' : 'bg-light-800'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-40 backdrop-blur-xl border-b px-6 pt-8 pb-4 ${
        darkMode 
          ? 'bg-dark-900/95 border-white/5' 
          : 'bg-light-900/95 border-black/5'
      }`}>
        {/* Title */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h1 className={`text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>Discover Events</h1>
            <TrendingUp className="w-5 h-5 text-neon-cyan" strokeWidth={2} aria-hidden="true" />
          </div>
          
          {/* Notification button */}
          <button
            onClick={onOpenNotifications}
            className={`relative p-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-neon-blue ${
              darkMode
                ? 'bg-dark-700/50 text-gray-400 hover:bg-dark-600 hover:text-white'
                : 'bg-white text-gray-600 hover:bg-light-700 hover:text-gray-900 shadow-sm border border-black/5'
            }`}
            aria-label={`Notifications${unreadNotifications > 0 ? `, ${unreadNotifications} unread` : ''}`}
          >
            <Bell className="w-5 h-5" strokeWidth={2} />
            {unreadNotifications > 0 && (
              <>
                <span className="absolute top-1 right-1 w-2 h-2 bg-neon-blue rounded-full" aria-hidden="true" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-neon-blue rounded-full animate-ping" aria-hidden="true" />
              </>
            )}
          </button>
        </div>

        {/* Search bar */}
        <Input
          type="search"
          placeholder="Search events or clubs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={<Search className="w-5 h-5" strokeWidth={1.5} />}
          aria-label="Search events"
          darkMode={darkMode}
        />

        {/* Club filter chips */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide mt-4 -mx-6 px-6">
          <button
            onClick={() => setSelectedClubFilter('all')}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-neon-blue ${
              selectedClubFilter === 'all'
                ? 'bg-neon-blue text-white shadow-lg shadow-neon-blue/20'
                : darkMode 
                  ? 'bg-dark-700/50 text-gray-400 hover:bg-dark-600 border border-white/5'
                  : 'bg-white text-gray-600 hover:bg-light-700 border border-black/5 shadow-sm'
            }`}
            aria-pressed={selectedClubFilter === 'all'}
          >
            All Clubs
          </button>
          {clubs.map((club) => (
            <button
              key={club.id}
              onClick={() => {
                if (selectedClubFilter === club.id) {
                  handleClubChipClick(club);
                } else {
                  setSelectedClubFilter(club.id);
                }
              }}
              onDoubleClick={() => handleClubChipClick(club)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all flex-shrink-0 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-neon-blue ${
                selectedClubFilter === club.id
                  ? 'text-white shadow-lg'
                  : darkMode
                    ? 'bg-dark-700/50 text-gray-400 hover:bg-dark-600 border border-white/5'
                    : 'bg-white text-gray-600 hover:bg-light-700 border border-black/5 shadow-sm'
              }`}
              style={
                selectedClubFilter === club.id
                  ? { backgroundColor: club.color }
                  : undefined
              }
              aria-pressed={selectedClubFilter === club.id}
              aria-label={`Filter by ${club.name}. ${followedClubs.has(club.id) ? 'Following' : 'Not following'}. Double tap to view club details.`}
            >
              <span aria-hidden="true">{club.logo}</span>
              <span>{club.name}</span>
              {followedClubs.has(club.id) && (
                <span className="w-2 h-2 bg-white rounded-full" aria-label="Following" />
              )}
            </button>
          ))}
        </div>
      </header>

      {/* Events list */}
      <main className="px-6 pt-6">
        {/* Section header */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <h2 className={darkMode ? 'text-white' : 'text-gray-900'}>
                {selectedClubFilter === 'all'
                  ? 'All Events'
                  : getClub(selectedClubFilter)?.name}
              </h2>
              {selectedClubFilter !== 'all' && getClub(selectedClubFilter) && (
                <button
                  onClick={() => onToggleFollowClub(selectedClubFilter)}
                  className={`px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all focus:outline-none focus:ring-2 focus:ring-neon-blue ${
                    followedClubs.has(selectedClubFilter)
                      ? darkMode
                        ? 'bg-dark-700/50 text-gray-400 hover:bg-dark-700 border border-white/5'
                        : 'bg-white text-gray-600 hover:bg-light-700 border border-black/5 shadow-sm'
                      : 'bg-neon-blue/10 text-neon-blue hover:bg-neon-blue/20 border border-neon-blue/20'
                  }`}
                  aria-pressed={followedClubs.has(selectedClubFilter)}
                  aria-label={followedClubs.has(selectedClubFilter) ? 'Unfollow club' : 'Follow club'}
                >
                  {followedClubs.has(selectedClubFilter) ? (
                    <>
                      <UserCheck className="w-3.5 h-3.5" strokeWidth={2} />
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" strokeWidth={2} />
                      <span>Follow</span>
                    </>
                  )}
                </button>
              )}
            </div>
            
            {/* Sort button */}
            <button
              onClick={() => setShowSortSheet(true)}
              className={`flex items-center gap-2 px-3 py-1.5 backdrop-blur-sm rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-neon-blue ${
                darkMode
                  ? 'bg-dark-700/50 border border-white/5 hover:border-neon-blue/30'
                  : 'bg-white border border-black/5 hover:border-neon-blue/30 shadow-sm'
              }`}
              aria-label="Sort events"
            >
              <ArrowUpDown className="w-4 h-4 text-neon-blue" strokeWidth={2} />
              <span className={`text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>Sort</span>
            </button>
          </div>
          <div className="text-center">
            <span className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-600'}`} aria-live="polite">
              {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Events grid */}
        <motion.div layout className="grid grid-cols-1 gap-4">
          {sortedEvents.map((event, index) => (
            <motion.div
              key={event.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              <EventCard 
                event={event} 
                club={getClub(event.clubId)} 
                onClick={() => onEventClick(event)} 
                isSaved={savedEventIds.has(event.id)} 
                onToggleSave={(e) => {
                  e.stopPropagation();
                  onToggleSaveEvent(event.id);
                }}
                darkMode={darkMode}
              />
            </motion.div>
          ))}
        </motion.div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-16" role="status">
            <p className={darkMode ? 'text-gray-500' : 'text-gray-600'}>No events found</p>
          </div>
        )}
      </main>

      {/* Club modal */}
      <ClubModal
        club={selectedClubModal}
        isOpen={selectedClubModal !== null}
        onClose={() => setSelectedClubModal(null)}
        isFollowing={selectedClubModal ? followedClubs.has(selectedClubModal.id) : false}
        notificationsEnabled={selectedClubModal ? clubNotifications.get(selectedClubModal.id) || false : false}
        onToggleFollow={() => {
          if (selectedClubModal) {
            onToggleFollowClub(selectedClubModal.id);
          }
        }}
        onToggleNotifications={() => {
          if (selectedClubModal) {
            onToggleClubNotifications(selectedClubModal.id);
          }
        }}
        onViewEvents={() => {
          if (selectedClubModal) {
            setSelectedClubFilter(selectedClubModal.id);
            setSelectedClubModal(null);
          }
        }}
      />

      {/* Sort sheet */}
      <SortSheet
        isOpen={showSortSheet}
        onClose={() => setShowSortSheet(false)}
        currentSort={sortOption}
        onSortChange={setSortOption}
      />

      {/* Bottom navigation */}
      <BottomNav activeScreen="home" onNavigate={onNavigate} darkMode={darkMode} />
    </div>
  );
}