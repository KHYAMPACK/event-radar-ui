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
import { CreateEventScreen } from './components/CreateEventScreen';
import { NotificationDrawer } from './components/NotificationDrawer';
import { Event, Club, Screen, Notification } from './types';
import { fetchEvents, fetchEventById } from './api/events';
import { ManageEventsScreen } from './components/ManageEventsScreen';
import { fetchClubs } from './api/clubs';
import type { User } from '@supabase/supabase-js';
import { supabase } from './lib/supabaseClient';
import { getCurrentUser, signInWithEmail, signUpWithEmail, signOut as supabaseSignOut } from './api/auth';
import { ensureProfile, loadUserSavedEventIds, addSavedEvent, removeSavedEvent, loadUserFollowedClubs, followClub, unfollowClub, setClubNotificationsEnabled } from './api/userData';
import { loadUserNotifications, markNotificationRead, markAllNotificationsRead } from './api/notifications';

function EventDetailRoute({
  events,
  clubs,
  savedEventIds,
  onBack,
  onToggleSave,
  darkMode,
  currentUserId,
  followedClubIds,
  clubNotifications,
  onToggleFollowClub,
  onToggleClubNotifications,
  onNavigateToClubEvents,
}: {
  events: Event[];
  clubs: Club[];
  savedEventIds: Set<string>;
  onBack: () => void;
  onToggleSave: (eventId: string) => void;
  darkMode: boolean;
  currentUserId: string | null;
  followedClubIds: Set<string>;
  clubNotifications: Map<string, boolean>;
  onToggleFollowClub: (clubId: string) => void;
  onToggleClubNotifications: (clubId: string) => void;
  onNavigateToClubEvents: (clubId: string) => void;
}) {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loadingEvent, setLoadingEvent] = useState(true);

  useEffect(() => {
    if (!eventId) return;

    const existing = events.find((e) => e.id === eventId);
    if (existing) {
      setEvent(existing);
      setLoadingEvent(false);
      return;
    }

    let cancelled = false;
    const load = async () => {
      try {
        setLoadingEvent(true);
        const fetched = await fetchEventById(eventId);
        if (!cancelled) {
          setEvent(fetched);
        }
      } catch (err) {
        console.error('Failed to load event by id:', err);
        if (!cancelled) setEvent(null);
      } finally {
        if (!cancelled) setLoadingEvent(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [eventId, events]);

  if (loadingEvent) {
    return (
      <div className={`max-w-md mx-auto min-h-screen flex items-center justify-center ${darkMode ? 'bg-dark-900 text-white' : 'bg-light-900 text-gray-900'}`}>
        <p>Loading event…</p>
      </div>
    );
  }

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

  const isFollowingClub = club ? followedClubIds.has(club.id) : false;
  const clubNotificationsEnabled = club ? !!clubNotifications.get(club.id) : false;

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
      currentUserId={currentUserId}
      isFollowingClub={isFollowingClub}
      clubNotificationsEnabled={clubNotificationsEnabled}
      onToggleFollowClubForClub={club ? () => onToggleFollowClub(club.id) : undefined}
      onToggleClubNotificationsForClub={club ? () => onToggleClubNotifications(club.id) : undefined}
      onViewClubEventsFromEvent={club ? () => onNavigateToClubEvents(club.id) : undefined}
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

  // Core data from Supabase
  const [events, setEvents] = useState<Event[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  // User data state
  const [savedEventIds, setSavedEventIds] = useState<Set<string>>(new Set());
  const [followedClubIds, setFollowedClubIds] = useState<Set<string>>(new Set());
  const [clubNotifications, setClubNotifications] = useState<Map<string, boolean>>(new Map());
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Notification state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // UI state (dark mode is always enabled now)
  const darkMode = true;
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
      hasCompletedOnboarding,
    };
    localStorage.setItem('eventRadarData', JSON.stringify(data));
  }, [savedEventIds, followedClubIds, clubNotifications, notifications, hasCompletedOnboarding]);

  // Load core data (events, clubs) from Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true);
        setDataError(null);
        const [eventsRes, clubsRes] = await Promise.all([
          fetchEvents(),
          fetchClubs(),
        ]);
        setEvents(eventsRes);
        setClubs(clubsRes);
      } catch (error) {
        console.error('Failed to load events/clubs:', error);
        setDataError('Failed to load events and clubs. Please try again.');
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, []);

  // Auth state listener and get current user on mount
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const current = await getCurrentUser();
        if (mounted) {
          setUser(current);
        }
      } catch (err: any) {
        console.error('Failed to get current user:', err);
        if (mounted) setAuthError(err.message ?? 'Auth error');
      } finally {
        if (mounted) setAuthLoading(false);
      }
    };

    init();

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  // Notification handlers
  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );

    if (user) {
      markNotificationRead(user.id, notificationId).catch(err =>
        console.error('Failed to mark notification as read:', err)
      );
    }
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

    if (user) {
      markAllNotificationsRead(user.id).catch(err =>
        console.error('Failed to mark all notifications as read:', err)
      );
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Navigate to the relevant event if it has an eventId
    if (notification.eventId) {
      const event = events.find(e => e.id === notification.eventId);
      if (event) {
        handleEventClick(event);
        setShowNotifications(false);
      }
    }
  };
  // When a user logs in, ensure profile exists and sync their saved events, followed clubs & notifications from Supabase
  useEffect(() => {
    if (!user) return;

    const syncUserData = async () => {
      try {
        await ensureProfile(user);

        // Saved events
        const savedIds = await loadUserSavedEventIds(user.id);
        setSavedEventIds(prev => {
          const merged = new Set(prev);
          savedIds.forEach(id => merged.add(id));
          return merged;
        });

        // Followed clubs + notifications preferences
        const followed = await loadUserFollowedClubs(user.id);
        setFollowedClubIds(new Set(followed.map((f) => f.clubId)));
        setClubNotifications(prev => {
          const next = new Map(prev);
          followed.forEach(f => {
            next.set(f.clubId, f.notificationsEnabled);
          });
          return next;
        });

        // Notifications
        const notifs = await loadUserNotifications(user.id);
        setNotifications(notifs);
      } catch (err) {
        console.error('Failed to load user data:', err);
      }
    };

    syncUserData();
  }, [user]);

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

  // Auth handlers
  const handleSignIn = async (email: string, password: string) => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      await signInWithEmail(email, password);
      // onAuthStateChange will update user
    } catch (err: any) {
      console.error('Sign in failed:', err);
      setAuthError(err.message ?? 'Failed to sign in');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignUp = async (email: string, password: string) => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      await signUpWithEmail(email, password);
      // user may need email confirmation depending on settings
    } catch (err: any) {
      console.error('Sign up failed:', err);
      setAuthError(err.message ?? 'Failed to sign up');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      await supabaseSignOut();
      // Clear local saved/followed state on explicit sign-out; auth listener will clear user
      setSavedEventIds(new Set());
      setFollowedClubIds(new Set());
      setClubNotifications(new Map());
    } catch (err: any) {
      console.error('Sign out failed:', err);
      setAuthError(err.message ?? 'Failed to sign out');
    } finally {
      setAuthLoading(false);
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
    // If there is navigation history within the app, go back; otherwise go to home.
    const historyState = window.history.state as { idx?: number } | null;
    const hasInternalHistory = historyState && typeof historyState.idx === 'number' && historyState.idx > 0;

    if (hasInternalHistory) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  // Event save handlers
  const handleToggleSaveEvent = (eventId: string) => {
    // If no logged-in user, keep local-only behavior
    if (!user) {
      setSavedEventIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(eventId)) {
          newSet.delete(eventId);
        } else {
          newSet.add(eventId);
        }
        return newSet;
      });
      return;
    }

    // Logged-in user: optimistic update + sync to Supabase
    setSavedEventIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
        removeSavedEvent(user.id, eventId).catch((err) =>
          console.error('Failed to remove saved event:', err)
        );
      } else {
        newSet.add(eventId);
        addSavedEvent(user.id, eventId).catch((err) =>
          console.error('Failed to add saved event:', err)
        );
      }
      return newSet;
    });
  };

  // Club follow handlers
  const handleToggleFollowClub = (clubId: string) => {
    // If no logged-in user, keep local-only behavior
    if (!user) {
      setFollowedClubIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(clubId)) {
          newSet.delete(clubId);
          setClubNotifications(prevNotifications => {
            const newMap = new Map(prevNotifications);
            newMap.delete(clubId);
            return newMap;
          });
        } else {
          newSet.add(clubId);
          setClubNotifications(prevNotifications => {
            const newMap = new Map(prevNotifications);
            newMap.set(clubId, true);
            return newMap;
          });
        }
        return newSet;
      });
      return;
    }

    // Logged-in user: optimistic update + sync to Supabase
    setFollowedClubIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(clubId)) {
        newSet.delete(clubId);
        setClubNotifications(prevNotifications => {
          const newMap = new Map(prevNotifications);
          newMap.delete(clubId);
          return newMap;
        });
        unfollowClub(user.id, clubId).catch(err =>
          console.error('Failed to unfollow club:', err)
        );
      } else {
        newSet.add(clubId);
        setClubNotifications(prevNotifications => {
          const newMap = new Map(prevNotifications);
          newMap.set(clubId, true);
          return newMap;
        });
        followClub(user.id, clubId, true).catch(err =>
          console.error('Failed to follow club:', err)
        );
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

    if (user) {
      unfollowClub(user.id, clubId).catch(err =>
        console.error('Failed to unfollow club via handler:', err)
      );
    }
  };

  const handleToggleClubNotifications = (clubId: string) => {
    setClubNotifications(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(clubId) || false;
      const next = !current;
      newMap.set(clubId, next);

      if (user) {
        setClubNotificationsEnabled(user.id, clubId, next).catch(err =>
          console.error('Failed to update club notifications:', err)
        );
      }

      return newMap;
    });
  };

  // Get saved events with full event data
  const getSavedEvents = (): Event[] => {
    return events.filter((event) => savedEventIds.has(event.id));
  };

  // Get followed clubs with full club data
  const getFollowedClubs = (): Club[] => {
    return clubs.filter(club => followedClubIds.has(club.id));
  };

  // Get club by ID
  const getClub = (clubId: string): Club | undefined => {
    return clubs.find(c => c.id === clubId);
  };

  if (loadingData) {
    return (
      <div className={`max-w-md mx-auto min-h-screen flex items-center justify-center ${darkMode ? 'bg-dark-900 text-white' : 'bg-light-900 text-gray-900'}`}>
        <p>Loading events…</p>
      </div>
    );
  }

  if (dataError) {
    return (
      <div className={`max-w-md mx-auto min-h-screen flex items-center justify-center ${darkMode ? 'bg-dark-900 text-white' : 'bg-light-900 text-gray-900'}`}>
        <p>{dataError}</p>
      </div>
    );
  }

  return (
    <div className={`max-w-md mx-auto ${darkMode ? 'bg-dark-900' : 'bg-light-900'} min-h-screen`} role="application" aria-label="Event Radar">
      <Routes>
        <Route
          path="/"
          element={
            hasCompletedOnboarding ? (
              <HomeScreen
                events={events}
                clubs={clubs}
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
              events={events}
              clubs={clubs}
              savedEventIds={savedEventIds}
              onBack={handleBackToHome}
              onToggleSave={handleToggleSaveEvent}
              darkMode={darkMode}
              currentUserId={user ? user.id : null}
              followedClubIds={followedClubIds}
              clubNotifications={clubNotifications}
              onToggleFollowClub={handleToggleFollowClub}
              onToggleClubNotifications={handleToggleClubNotifications}
              onNavigateToClubEvents={handleNavigateToClubEvents}
            />
          }
        />

        <Route
          path="/calendar"
          element={
            <CalendarScreen
              savedEvents={getSavedEvents()}
              clubs={clubs}
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
              clubs={clubs}
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
              eventsAttendedCount={Array.from(new Set(notifications.filter(n => n.type === 'event_reminder' && n.eventId).map(n => n.eventId))).length}
              onNavigate={handleNavigate}
              onUnfollowClub={handleUnfollowClub}
              onToggleClubNotifications={handleToggleClubNotifications}
              darkMode={darkMode}
              user={user}
              authLoading={authLoading}
              authError={authError}
              onSignIn={handleSignIn}
              onSignUp={handleSignUp}
              onSignOut={handleSignOut}
            />
          }
        />

        <Route
          path="/create"
          element={
            <CreateEventScreen
              user={user}
              clubs={clubs}
              darkMode={darkMode}
              onNavigate={handleNavigate}
              onEventCreated={(eventId) => navigate(`/event/${eventId}`)}
            />
          }
        />

        <Route
          path="/manage-events"
          element={
            <ManageEventsScreen
              user={user}
              clubs={clubs}
              darkMode={darkMode}
              onNavigate={handleNavigate}
            />
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <NotificationDrawer
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
        clubs={clubs}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onNotificationClick={handleNotificationClick}
      />
    </div>
  );
}
