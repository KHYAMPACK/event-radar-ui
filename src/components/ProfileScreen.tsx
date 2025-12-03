import { Settings, Calendar, Bookmark, TrendingUp, Users, Bell, X, Moon, Sun } from 'lucide-react';
import { BottomNav } from './BottomNav';
import { Club, Screen } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { motion } from 'motion/react';

interface ProfileScreenProps {
  followedClubs: Club[];
  clubNotifications: Map<string, boolean>;
  savedEventsCount: number;
  onNavigate: (screen: Screen) => void;
  onUnfollowClub: (clubId: string) => void;
  onToggleClubNotifications: (clubId: string) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export function ProfileScreen({
  followedClubs,
  clubNotifications,
  savedEventsCount,
  onNavigate,
  onUnfollowClub,
  onToggleClubNotifications,
  darkMode,
  onToggleDarkMode
}: ProfileScreenProps) {
  const stats = [
    { label: 'Events Attended', value: '23', icon: Calendar, color: 'text-neon-blue' },
    { label: 'Events Saved', value: savedEventsCount.toString(), icon: Bookmark, color: 'text-neon-purple' },
    { label: 'Clubs Following', value: followedClubs.length.toString(), icon: TrendingUp, color: 'text-neon-cyan' },
  ];

  return (
    <div className={`min-h-screen pb-28 ${darkMode ? 'bg-dark-900' : 'bg-light-800'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-40 backdrop-blur-xl border-b px-6 pt-8 pb-4 ${
        darkMode 
          ? 'bg-dark-900/95 border-white/5' 
          : 'bg-light-900/95 border-black/5'
      }`}>
        <div className="flex items-center justify-between">
          <h1 className={`text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>Profile</h1>
          <button
            className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors focus:outline-none focus:ring-2 focus:ring-neon-blue ${
              darkMode
                ? 'bg-dark-700/50 border-white/5 hover:border-neon-blue/30'
                : 'bg-white border-black/5 hover:border-neon-blue/30 shadow-sm'
            }`}
            aria-label="Settings"
          >
            <Settings className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} strokeWidth={1.5} />
          </button>
        </div>
      </header>

      <main className="px-6 pt-6">
        {/* Profile card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className={`rounded-3xl p-6 mb-6 border ${
            darkMode
              ? 'bg-gradient-to-br from-dark-700/80 to-dark-800/80 backdrop-blur-xl border-white/10'
              : 'bg-gradient-to-br from-white to-light-700/50 border-black/5 shadow-lg'
          }`}>
            {/* Profile photo and info */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-neon-blue to-neon-purple rounded-2xl flex items-center justify-center text-3xl" aria-hidden="true">
                  👤
                </div>
                <div className={`absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 ${
                  darkMode ? 'border-dark-700' : 'border-white'
                }`} aria-label="Online" />
              </div>
              
              <div className="flex-1">
                <h2 className={`text-xl mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Alex Johnson</h2>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>@alexj • Bilkent University</p>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-3" role="list">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                    className={`backdrop-blur-sm rounded-2xl p-3 text-center border ${
                      darkMode
                        ? 'bg-dark-900/40 border-white/5'
                        : 'bg-white/60 border-black/5'
                    }`}
                    role="listitem"
                  >
                    <Icon className={`w-5 h-5 ${stat.color} mx-auto mb-2`} strokeWidth={1.5} aria-hidden="true" />
                    <p className={`mb-0.5 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
                    <p className={`text-[10px] leading-tight ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>{stat.label}</p>
                  </motion.div>
                );
              })}</div>
          </div>
        </motion.div>

        {/* Followed Clubs Section */}
        <section aria-labelledby="followed-clubs-title" className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 id="followed-clubs-title" className={darkMode ? 'text-white' : 'text-gray-900'}>
              Following {followedClubs.length > 0 && `(${followedClubs.length})`}
            </h2>
          </div>

          {followedClubs.length === 0 ? (
            <div className={`rounded-3xl p-6 border text-center ${
              darkMode
                ? 'bg-dark-700/80 backdrop-blur-xl border-white/10'
                : 'bg-white border-black/5 shadow-sm'
            }`}>
              <Users className={`w-12 h-12 mx-auto mb-3 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} strokeWidth={1.5} aria-hidden="true" />
              <p className={`mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>You're not following any clubs yet</p>
              <Button variant="outline" size="sm" onClick={() => onNavigate('home')}>
                Discover Clubs
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {followedClubs.map((club, index) => {
                const notificationsEnabled = clubNotifications.get(club.id) || false;
                return (
                  <motion.div
                    key={club.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 + 0.3 }}
                  >
                    <div className={`rounded-3xl p-4 border transition-all ${
                      darkMode
                        ? 'bg-dark-700/50 backdrop-blur-sm border-white/5 hover:border-neon-blue/30'
                        : 'bg-white border-black/5 hover:border-neon-blue/30 shadow-sm'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                            style={{ backgroundColor: `${club.color}20` }}
                            aria-hidden="true"
                          >
                            {club.logo}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>{club.name}</p>
                            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>{club.memberCount.toLocaleString()} members</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => onToggleClubNotifications(club.id)}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-neon-blue ${
                              darkMode ? 'hover:bg-dark-700' : 'hover:bg-light-700'
                            }`}
                            aria-label={notificationsEnabled ? `Disable notifications for ${club.name}` : `Enable notifications for ${club.name}`}
                            aria-pressed={notificationsEnabled}
                          >
                            <Bell
                              className={`w-4 h-4 ${notificationsEnabled ? 'text-neon-cyan' : darkMode ? 'text-gray-600' : 'text-gray-400'}`}
                              strokeWidth={1.5}
                              fill={notificationsEnabled ? 'currentColor' : 'none'}
                            />
                          </button>
                          <button
                            onClick={() => onUnfollowClub(club.id)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/10 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                            aria-label={`Unfollow ${club.name}`}
                          >
                            <X className={`w-4 h-4 hover:text-red-400 ${darkMode ? 'text-gray-600' : 'text-gray-500'}`} strokeWidth={2} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        {/* Settings section */}
        <section aria-labelledby="settings-title" className="space-y-2 mb-6">
          <h3 id="settings-title" className={`text-sm mb-3 px-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Settings</h3>
          
          {/* Dark Mode Toggle */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className={`w-full backdrop-blur-sm rounded-xl p-4 border focus-within:ring-2 focus-within:ring-neon-blue ${
              darkMode
                ? 'bg-dark-700/30 border-white/5'
                : 'bg-white border-black/5 shadow-sm'
            }`}
          >
            <button
              onClick={onToggleDarkMode}
              className="w-full flex items-center justify-between focus:outline-none"
              aria-pressed={darkMode}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <span className={darkMode ? 'text-gray-300' : 'text-gray-900'}>Dark Mode</span>
              <div className="flex items-center gap-2">
                <div className={`relative w-12 h-6 rounded-full transition-colors ${darkMode ? 'bg-neon-blue' : 'bg-gray-300'}`}>
                  <motion.div
                    className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md flex items-center justify-center"
                    animate={{ x: darkMode ? 24 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  >
                    {darkMode ? (
                      <Moon className="w-3 h-3 text-neon-blue" strokeWidth={2} />
                    ) : (
                      <Sun className="w-3 h-3 text-orange-500" strokeWidth={2} />
                    )}
                  </motion.div>
                </div>
              </div>
            </button>
          </motion.div>
          
          {['Notifications', 'Privacy', 'Preferences', 'Help & Support'].map((item, index) => (
            <motion.button
              key={item}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 + 0.85 }}
              className={`w-full backdrop-blur-sm rounded-xl p-4 border hover:border-neon-blue/30 transition-all text-left focus:outline-none focus:ring-2 focus:ring-neon-blue ${
                darkMode
                  ? 'bg-dark-700/30 border-white/5'
                  : 'bg-white border-black/5 shadow-sm'
              }`}
            >
              <span className={darkMode ? 'text-gray-300' : 'text-gray-900'}>{item}</span>
            </motion.button>
          ))}
        </section>

        {/* Sign out button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <Button
            variant="ghost"
            size="lg"
            fullWidth
            className={`border hover:border-red-500/30 hover:text-red-500 ${
              darkMode ? 'border-white/5' : 'border-black/5'
            }`}
          >
            Sign Out
          </Button>
        </motion.div>
      </main>

      {/* Bottom navigation */}
      <BottomNav activeScreen="profile" onNavigate={onNavigate} darkMode={darkMode} />
    </div>
  );
}