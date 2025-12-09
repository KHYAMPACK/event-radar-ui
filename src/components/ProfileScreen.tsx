import { Settings, Calendar, Bookmark, TrendingUp, Users, Bell, X } from 'lucide-react';
import { BottomNav } from './BottomNav';
import { Club, Screen } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { motion } from 'motion/react';
import type { User } from '@supabase/supabase-js';
import { useState } from 'react';

interface ProfileScreenProps {
  followedClubs: Club[];
  clubNotifications: Map<string, boolean>;
  savedEventsCount: number;
  eventsAttendedCount: number;
  onNavigate: (screen: Screen) => void;
  onUnfollowClub: (clubId: string) => void;
  onToggleClubNotifications: (clubId: string) => void;
  darkMode: boolean;

  user: User | null;
  authLoading: boolean;
  authError: string | null;
  onSignIn: (email: string, password: string) => void;
  onSignUp: (email: string, password: string) => void;
  onSignOut: () => void;  
}

export function ProfileScreen({
  followedClubs,
  clubNotifications,
  savedEventsCount,
  eventsAttendedCount,
  onNavigate,
  onUnfollowClub,
  onToggleClubNotifications,
  darkMode,
  user,
  authLoading,
  authError,
  onSignIn,
  onSignUp,
  onSignOut,
}: ProfileScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const allNotificationsEnabled =
    followedClubs.length > 0 &&
    followedClubs.every((club) => clubNotifications.get(club.id));

  const handleToggleAllNotifications = () => {
    const target = !allNotificationsEnabled;
    followedClubs.forEach((club) => {
      const current = clubNotifications.get(club.id) || false;
      if (current !== target) {
        onToggleClubNotifications(club.id);
      }
    });
  };

  const stats = [
    { label: 'Events Attended', value: eventsAttendedCount.toString(), icon: Calendar, color: 'text-neon-blue' },
    { label: 'Events Saved', value: savedEventsCount.toString(), icon: Bookmark, color: 'text-neon-purple' },
    { label: 'Clubs Following', value: followedClubs.length.toString(), icon: TrendingUp, color: 'text-neon-cyan' },
  ];

  return (
    <div className="min-h-screen pb-28 bg-dark-900">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl border-b px-6 pt-8 pb-4 bg-dark-900/95 border-white/5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl text-white">Profile</h1>
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
                {/* Auth card when logged out */}
        {!user && (
          <div className="rounded-3xl p-6 mb-6 border bg-dark-700/80 backdrop-blur-xl border-white/10">
            <h2 className="text-white mb-3">
              Sign in to save your events
            </h2>
            <div className="space-y-3">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-transparent border border-gray-600 text-sm"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-transparent border border-gray-600 text-sm"
              />
              {authError && <p className="text-xs text-red-400">{authError}</p>}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => onSignIn(email, password)}
                  disabled={authLoading}
                >
                  Sign In
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onSignUp(email, password)}
                  disabled={authLoading}
                >
                  Sign Up
                </Button>
              </div>
            </div>
          </div>
        )}
        {/* Profile card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="rounded-3xl p-6 mb-6 border bg-gradient-to-br from-dark-700/80 to-dark-800/80 backdrop-blur-xl border-white/10">
            {/* Profile photo and info */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-neon-blue to-neon-purple rounded-2xl flex items-center justify-center text-3xl" aria-hidden="true">
                  👤
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-dark-700" aria-label="Online" />
              </div>
              
              <div className="flex-1">
                <h2 className="text-xl mb-1 text-white">Alex Johnson</h2>
                <p className="text-sm text-gray-400">@alexj • Bilkent University</p>
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
                    className="backdrop-blur-sm rounded-2xl p-3 text-center border bg-dark-900/40 border-white/5"
                    role="listitem"
                  >
                    <Icon className={`w-5 h-5 ${stat.color} mx-auto mb-2`} strokeWidth={1.5} aria-hidden="true" />
                    <p className="mb-0.5 text-white">{stat.value}</p>
                    <p className="text-[10px] leading-tight text-gray-500">{stat.label}</p>
                  </motion.div>
                );
              })}</div>
          </div>
        </motion.div>

        {/* Followed Clubs Section */}
        <section aria-labelledby="followed-clubs-title" className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 id="followed-clubs-title" className="text-white">
              Following {followedClubs.length > 0 && `(${followedClubs.length})`}
            </h2>
          </div>

          {followedClubs.length === 0 ? (
            <div className="rounded-3xl p-6 border text-center bg-dark-700/80 backdrop-blur-xl border-white/10">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-600" strokeWidth={1.5} aria-hidden="true" />
              <p className="mb-4 text-gray-400">You're not following any clubs yet</p>
              <Button variant="outline" size="sm" onClick={() => onNavigate('discover-clubs')}>
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
                    <div className="rounded-3xl p-4 border transition-all bg-dark-700/50 backdrop-blur-sm border-white/5 hover:border-neon-blue/30">
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
                            <p className="text-sm truncate text-white">{club.name}</p>
                            <p className="text-xs text-gray-500">{club.memberCount.toLocaleString()} members</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => onToggleClubNotifications(club.id)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-neon-blue hover:bg-dark-700"
                            aria-label={notificationsEnabled ? `Disable notifications for ${club.name}` : `Enable notifications for ${club.name}`}
                            aria-pressed={notificationsEnabled}
                          >
                            <Bell
                              className={`w-4 h-4 ${notificationsEnabled ? 'text-neon-cyan' : 'text-gray-600'}`}
                              strokeWidth={1.5}
                              fill={notificationsEnabled ? 'currentColor' : 'none'}
                            />
                          </button>
                          <button
                            onClick={() => onUnfollowClub(club.id)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/10 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                            aria-label={`Unfollow ${club.name}`}
                          >
                            <X className="w-4 h-4 hover:text-red-400 text-gray-600" strokeWidth={2} />
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
          <h3 id="settings-title" className="text-sm mb-3 px-2 text-gray-400">Settings</h3>

          {/* Global notifications toggle */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="w-full backdrop-blur-sm rounded-xl p-4 border bg-dark-700/30 border-white/5 focus-within:ring-2 focus-within:ring-neon-blue"
          >
            <button
              type="button"
              onClick={handleToggleAllNotifications}
              className="w-full flex items-center justify-between focus:outline-none"
              aria-pressed={allNotificationsEnabled}
              aria-label={allNotificationsEnabled ? 'Turn off all notifications' : 'Turn on all notifications'}
            >
              <span className="text-gray-300">Notifications</span>
              <div className="flex items-center gap-2">
                <div
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    allNotificationsEnabled ? 'bg-neon-blue' : 'bg-gray-600'
                  }`}
                >
                  <motion.div
                    className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md flex items-center justify-center"
                    animate={{ x: allNotificationsEnabled ? 24 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  >
                    <Bell
                      className={`w-3.5 h-3.5 ${allNotificationsEnabled ? 'text-neon-blue' : 'text-gray-500'}`}
                      strokeWidth={1.8}
                    />
                  </motion.div>
                </div>
              </div>
            </button>
          </motion.div>

          {['Privacy', 'Preferences', 'Help & Support'].map((item, index) => (
            <motion.button
              key={item}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 + 0.9 }}
              className="w-full backdrop-blur-sm rounded-xl p-4 border hover:border-neon-blue/30 transition-all text-left focus:outline-none focus:ring-2 focus:ring-neon-blue bg-dark-700/30 border-white/5"
            >
              <span className="text-gray-300">{item}</span>
            </motion.button>
          ))}
        </section>
                {/* Sign out button (only when logged in) */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <Button
              variant="ghost"
              size="lg"
              fullWidth
              onClick={onSignOut}
              className="border hover:border-red-500/30 hover:text-red-500 border-white/5"
            >
              Sign Out
            </Button>
          </motion.div>
        )}
      </main>

      {/* Bottom navigation */}
      <BottomNav activeScreen="profile" onNavigate={onNavigate} darkMode={darkMode} />
    </div>
  );
}