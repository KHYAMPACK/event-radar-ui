import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';
import { OnboardingScreen } from './components/OnboardingScreen';
import { HomeScreen } from './components/HomeScreen';
import { EventDetailScreen } from './components/EventDetailScreen';
import { CalendarScreen } from './components/CalendarScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { DiscoverClubsScreen } from './components/DiscoverClubsScreen';
import { PlaceholderScreen } from './components/PlaceholderScreen';
import { LogoShowcase } from './components/LogoShowcase';
import { NotificationDrawer } from './components/NotificationDrawer';
import { mockEvents } from './data/mockEvents';
import { mockClubs } from './data/mockClubs';
import { mockNotifications } from './data/mockNotifications';
import { Event, Club, Screen, Notification } from './types';

function EventDetailRoute({
  events,
  clubs,
  savedEventIds,
  onBack,
  onToggleSave,
  darkMode,
}: {
  events: Event[];
  clubs: Club[];
  savedEventIds: Set<string>;
  onBack: () => void;
  onToggleSave: (eventId: string) => void;
  darkMode: boolean;
}) {
  const { eventId } = useParams<{ eventId: string }>();
  const event = events.find((e) => e.id === eventId);

  if (!event) {
    return (
      <div className={`max-w-md mx-auto min-h-screen flex items-center justify-center ${darkMode ? 'bg-dark-900 text-white' : 'bg-light-900 text-gray-900'}`}>
        <p>Event not found.</p>
      </div>
    );
  }

  const relatedEvents = events
    .filter((e) => e.clubId === event.clubId && e.id !== event.id)
    .slice(0, 3);

  const club = clubs.find((c) => c.id === event.clubId);

  return (
    <EventDetailScreen
      event={event}
      club={club}
      relatedEvents={relatedEvents}
      clubs={clubs}
      isSaved={savedEventIds.has(event.id)}
      onBack={onBack}
      onEventClick={() => {}}
      onToggleSave={() => onToggleSave(event.id)}
      darkMode={darkMode}
    />
  );
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // Show logo showcase
  const [showLogoShowcase, setShowLogoShowcase] = useState(false);
  
  if (showLogoShowcase) {
    return <LogoShowcase />;
  }
  
  // Navigation helpers
  const [clubFilterId, setClubFilterId] = useState<string | undefined>(undefined);

  // User data state
  const [savedEventIds, setSavedEventIds] = useState<Set<string>>(new Set());
  const [followedClubIds, setFollowedClubIds] = useState<Set<string>>(new Set());
  const [clubNotifications, setClubNotifications] = useState<Map<string, boolean>>(new Map());
  
  // Notification state
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [showNotifications, setShowNotifications] = useState(false);

  // UI state
  const [darkMode, setDarkMode] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  // Load saved data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('eventRadarData');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        setSavedEventIds(new Set(data.savedEventIds || []));
        setFollowedClubIds(new Set(data.followedClubIds || []));
        setClubNotifications(new Map(data.clubNotifications || []));
        if (data.notifications) {
          setNotifications(data.notifications);
        }
        if (data.darkMode !== undefined) {
          setDarkMode(data.darkMode);
        }
        if (data.hasCompletedOnboarding !== undefined) {
          setHasCompletedOnboarding(data.hasCompletedOnboarding);
        }
      } catch (error) {
        console.error('Failed to load saved data:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    const data = {
      savedEventIds: Array.from(savedEventIds),
      followedClubIds: Array.from(followedClubIds),
      clubNotifications: Array.from(clubNotifications.entries()),
      notifications,
      darkMode,
      hasCompletedOnboarding,
    };
    localStorage.setItem('eventRadarData', JSON.stringify(data));
  }, [savedEventIds, followedClubIds, clubNotifications, notifications, darkMode, hasCompletedOnboarding]);

  // Notification handlers
  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const handleNotificationClick = (notification: Notification) => {
    // Navigate to the relevant event if it has an eventId
    if (notification.eventId) {
      const event = mockEvents.find(e => e.id === notification.eventId);
      if (event) {
        handleEventClick(event);
        setShowNotifications(false);
      }
    }
  };

  // Get unread notifications count
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  // Navigation handlers
  const handleNavigate = (screen: Screen) => {
    switch (screen) {
      case 'home':
        setClubFilterId(undefined);
        navigate('/');
        break;
      case 'calendar':
        navigate('/calendar');
        break;
      case 'create':
        navigate('/create');
        break;
      case 'saved':
      case 'discover-clubs':
        navigate('/clubs');
        break;
      case 'profile':
        navigate('/profile');
        break;
      default:
        navigate('/');
        break;
    }
  };

  const handleNavigateToClubEvents = (clubId: string) => {
    setClubFilterId(clubId);
    navigate('/');
  };

  const handleEventClick = (event: Event) => {
    navigate(`/event/${event.id}`);
  };

  const handleBackToHome = () => {
    navigate(-1);
  };

  // Event save handlers
  const handleToggleSaveEvent = (eventId: string) => {
    setSavedEventIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  };

  // Club follow handlers
  const handleToggleFollowClub = (clubId: string) => {
    setFollowedClubIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(clubId)) {
        newSet.delete(clubId);
        // Also remove notifications setting
        setClubNotifications(prevNotifications => {
          const newMap = new Map(prevNotifications);
          newMap.delete(clubId);
          return newMap;
        });
      } else {
        newSet.add(clubId);
        // Enable notifications by default when following
        setClubNotifications(prevNotifications => {
          const newMap = new Map(prevNotifications);
          newMap.set(clubId, true);
          return newMap;
        });
      }
      return newSet;
    });
  };

  const handleUnfollowClub = (clubId: string) => {
    setFollowedClubIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(clubId);
      return newSet;
    });
    setClubNotifications(prev => {
      const newMap = new Map(prev);
      newMap.delete(clubId);
      return newMap;
    });
  };

  const handleToggleClubNotifications = (clubId: string) => {
    setClubNotifications(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(clubId) || false;
      newMap.set(clubId, !current);
      return newMap;
    });
  };

  // Get saved events with full event data
  const getSavedEvents = (): Event[] => {
    return mockEvents.filter((event) => savedEventIds.has(event.id));
  };

  // Get followed clubs with full club data
  const getFollowedClubs = (): Club[] => {
    return mockClubs.filter(club => followedClubIds.has(club.id));
  };

  // Get club by ID
  const getClub = (clubId: string): Club | undefined => {
    return mockClubs.find(c => c.id === clubId);
  };

  return (
    <div className={`max-w-md mx-auto ${darkMode ? 'bg-dark-900' : 'bg-light-900'} min-h-screen`} role="application" aria-label="Event Radar">
      <Routes>
        <Route
          path="/"
          element={
            hasCompletedOnboarding ? (
              <HomeScreen
                events={mockEvents}
                clubs={mockClubs}
                followedClubs={followedClubIds}
                clubNotifications={clubNotifications}
                onEventClick={handleEventClick}
                onNavigate={handleNavigate}
                onToggleFollowClub={handleToggleFollowClub}
                onToggleClubNotifications={handleToggleClubNotifications}
                savedEventIds={savedEventIds}
                onToggleSaveEvent={handleToggleSaveEvent}
                unreadNotifications={unreadNotificationsCount}
                onOpenNotifications={() => setShowNotifications(true)}
                initialClubFilter={clubFilterId}
                darkMode={darkMode}
              />
            ) : (
              <OnboardingScreen
                darkMode={darkMode}
                onContinue={() => {
                  setHasCompletedOnboarding(true);
                }}
              />
            )
          }
        />

        <Route
          path="/event/:eventId"
          element={
            <EventDetailRoute
              events={mockEvents}
              clubs={mockClubs}
              savedEventIds={savedEventIds}
              onBack={handleBackToHome}
              onToggleSave={handleToggleSaveEvent}
              darkMode={darkMode}
            />
          }
        />

        <Route
          path="/calendar"
          element={
            <CalendarScreen
              savedEvents={getSavedEvents()}
              clubs={mockClubs}
              onNavigate={handleNavigate}
              onEventClick={handleEventClick}
              darkMode={darkMode}
            />
          }
        />

        <Route
          path="/clubs"
          element={
            <DiscoverClubsScreen
              clubs={mockClubs}
              followedClubs={followedClubIds}
              clubNotifications={clubNotifications}
              onNavigate={handleNavigate}
              onToggleFollowClub={handleToggleFollowClub}
              onToggleClubNotifications={handleToggleClubNotifications}
              onNavigateToClubEvents={handleNavigateToClubEvents}
              darkMode={darkMode}
            />
          }
        />

        <Route
          path="/profile"
          element={
            <ProfileScreen
              followedClubs={getFollowedClubs()}
              clubNotifications={clubNotifications}
              savedEventsCount={savedEventIds.size}
              onNavigate={handleNavigate}
              onUnfollowClub={handleUnfollowClub}
              onToggleClubNotifications={handleToggleClubNotifications}
              darkMode={darkMode}
              onToggleDarkMode={() => setDarkMode((prev) => !prev)}
            />
          }
        />

        <Route
          path="/create"
          element={<PlaceholderScreen screen="create" onNavigate={handleNavigate} darkMode={darkMode} />}
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <NotificationDrawer
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
        clubs={mockClubs}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onNotificationClick={handleNotificationClick}
      />
    </div>
  );
}
