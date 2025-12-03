import { Users } from 'lucide-react';
import { Club, Screen } from '../types';
import { BottomNav } from './BottomNav';
import { ClubModal } from './ClubModal';
import { useState } from 'react';
import { motion } from 'motion/react';

interface DiscoverClubsScreenProps {
  clubs: Club[];
  followedClubs: Set<string>;
  clubNotifications: Map<string, boolean>;
  onNavigate: (screen: Screen) => void;
  onToggleFollowClub: (clubId: string) => void;
  onToggleClubNotifications: (clubId: string) => void;
  onNavigateToClubEvents: (clubId: string) => void;
  darkMode?: boolean;
}

export function DiscoverClubsScreen({
  clubs,
  followedClubs,
  clubNotifications,
  onNavigate,
  onToggleFollowClub,
  onToggleClubNotifications,
  onNavigateToClubEvents,
  darkMode = true
}: DiscoverClubsScreenProps) {
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);

  // Sort clubs to show followed clubs first
  const sortedClubs = [...clubs].sort((a, b) => {
    const aFollowed = followedClubs.has(a.id);
    const bFollowed = followedClubs.has(b.id);
    
    // If one is followed and the other isn't, followed comes first
    if (aFollowed && !bFollowed) return -1;
    if (!aFollowed && bFollowed) return 1;
    
    // Otherwise maintain original order
    return 0;
  });

  return (
    <div className={`min-h-screen pb-28 ${darkMode ? 'bg-dark-900' : 'bg-light-800'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-40 backdrop-blur-xl border-b px-6 pt-8 pb-4 ${
        darkMode 
          ? 'bg-dark-900/95 border-white/5' 
          : 'bg-light-900/95 border-black/5'
      }`}>
        <div className="flex items-center gap-2 mb-2">
          <h1 className={`text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>Discover Clubs</h1>
          <Users className="w-5 h-5 text-neon-cyan" strokeWidth={2} aria-hidden="true" />
        </div>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {clubs.length} club{clubs.length !== 1 ? 's' : ''} available
        </p>
      </header>

      {/* Clubs Grid */}
      <main className="px-6 pt-6">
        <div className="grid grid-cols-2 gap-4">
          {sortedClubs.map((club, index) => {
            const isFollowing = followedClubs.has(club.id);
            
            return (
              <motion.button
                key={club.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                onClick={() => setSelectedClub(club)}
                className="relative bg-dark-700/30 backdrop-blur-sm rounded-3xl p-4 border border-white/5 hover:border-white/10 transition-all shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-neon-blue aspect-square flex flex-col items-center justify-center gap-3"
                aria-label={`${club.name}. ${isFollowing ? 'Following' : 'Not following'}. Tap to view details.`}
              >
                {/* Following indicator */}
                {isFollowing && (
                  <div className="absolute top-3 right-3 w-2 h-2 bg-neon-cyan rounded-full shadow-lg shadow-neon-cyan/50" aria-label="Following" />
                )}

                {/* Club Logo Circle */}
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-lg"
                  style={{ 
                    backgroundColor: `${club.color}20`,
                    boxShadow: `0 8px 16px ${club.color}15`
                  }}
                  aria-hidden="true"
                >
                  {club.logo}
                </div>

                {/* Club Name */}
                <div className="text-center">
                  <h3 className="text-white text-sm line-clamp-2 mb-1">
                    {club.name}
                  </h3>
                  <p className="text-gray-500 text-xs">
                    {club.memberCount.toLocaleString()} members
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </main>

      {/* Club Modal */}
      <ClubModal
        club={selectedClub}
        isOpen={selectedClub !== null}
        onClose={() => setSelectedClub(null)}
        isFollowing={selectedClub ? followedClubs.has(selectedClub.id) : false}
        notificationsEnabled={selectedClub ? clubNotifications.get(selectedClub.id) || false : false}
        onToggleFollow={() => {
          if (selectedClub) {
            onToggleFollowClub(selectedClub.id);
          }
        }}
        onToggleNotifications={() => {
          if (selectedClub) {
            onToggleClubNotifications(selectedClub.id);
          }
        }}
        onViewEvents={() => {
          if (selectedClub) {
            onNavigateToClubEvents(selectedClub.id);
            setSelectedClub(null);
          }
        }}
      />

      {/* Bottom navigation */}
      <BottomNav activeScreen="saved" onNavigate={onNavigate} darkMode={darkMode} />
    </div>
  );
}