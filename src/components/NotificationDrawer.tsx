import { X, Calendar, Megaphone, Bell, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Notification, Club } from '../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  clubs: Club[];
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
  onNotificationClick: (notification: Notification) => void;
}

export function NotificationDrawer({
  isOpen,
  onClose,
  notifications,
  clubs,
  onMarkAsRead,
  onMarkAllAsRead,
  onNotificationClick
}: NotificationDrawerProps) {
  const getClub = (clubId?: string) => clubs.find(c => c.id === clubId);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'new_event':
        return <Calendar className="w-5 h-5" strokeWidth={2} />;
      case 'event_reminder':
        return <Bell className="w-5 h-5" strokeWidth={2} />;
      case 'club_announcement':
        return <Megaphone className="w-5 h-5" strokeWidth={2} />;
      case 'event_update':
        return <AlertCircle className="w-5 h-5" strokeWidth={2} />;
      default:
        return <Bell className="w-5 h-5" strokeWidth={2} />;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'new_event':
        return 'text-neon-blue';
      case 'event_reminder':
        return 'text-neon-purple';
      case 'club_announcement':
        return 'text-neon-cyan';
      case 'event_update':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-dark-800 z-50 overflow-hidden flex flex-col shadow-2xl"
            role="dialog"
            aria-label="Notifications"
            aria-modal="true"
          >
            {/* Header */}
            <div className="bg-dark-900/95 backdrop-blur-xl border-b border-white/5 px-6 pt-8 pb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl text-white">Notifications</h2>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 bg-neon-blue rounded-full text-xs text-white">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl bg-dark-700/50 text-gray-400 hover:bg-dark-600 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-neon-blue"
                  aria-label="Close notifications"
                >
                  <X className="w-5 h-5" strokeWidth={2} />
                </button>
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={onMarkAllAsRead}
                  className="text-sm text-neon-blue hover:text-neon-cyan transition-colors focus:outline-none focus:ring-2 focus:ring-neon-blue rounded"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* Notifications list */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-6 py-16">
                  <div className="w-16 h-16 rounded-full bg-dark-700/50 flex items-center justify-center mb-4">
                    <Bell className="w-8 h-8 text-gray-500" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-white mb-2">No notifications yet</h3>
                  <p className="text-sm text-gray-500">
                    We'll notify you when events from your followed clubs are posted
                  </p>
                </div>
              ) : (
                <div className="px-6 py-4 space-y-2">
                  {notifications.map((notification) => {
                    const club = getClub(notification.clubId);
                    return (
                      <motion.button
                        key={notification.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => {
                          if (!notification.read) {
                            onMarkAsRead(notification.id);
                          }
                          onNotificationClick(notification);
                        }}
                        className={`w-full p-4 rounded-2xl border transition-all text-left focus:outline-none focus:ring-2 focus:ring-neon-blue ${
                          notification.read
                            ? 'bg-dark-700/30 border-white/5 hover:bg-dark-700/50'
                            : 'bg-dark-700/60 border-neon-blue/20 hover:bg-dark-700/80 shadow-lg shadow-neon-blue/5'
                        }`}
                      >
                        <div className="flex gap-3">
                          {/* Icon */}
                          <div className={`flex-shrink-0 w-10 h-10 rounded-xl bg-dark-600/50 flex items-center justify-center ${getNotificationColor(notification.type)}`}>
                            {getNotificationIcon(notification.type)}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h3 className={`text-sm ${notification.read ? 'text-gray-400' : 'text-white'}`}>
                                {notification.title}
                              </h3>
                              {!notification.read && (
                                <span className="w-2 h-2 bg-neon-blue rounded-full flex-shrink-0 mt-1" aria-label="Unread" />
                              )}
                            </div>
                            <p className={`text-sm mb-2 ${notification.read ? 'text-gray-600' : 'text-gray-400'}`}>
                              {notification.message}
                            </p>
                            
                            {/* Footer */}
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              {club && (
                                <>
                                  <span aria-hidden="true">{club.logo}</span>
                                  <span>{club.name}</span>
                                  <span>•</span>
                                </>
                              )}
                              <time dateTime={notification.timestamp}>
                                {formatTimestamp(notification.timestamp)}
                              </time>
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
