import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { Pencil, Trash2, Calendar as CalendarIcon, MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import { Event, Club, Screen } from '../types';
import { loadProfile, Profile } from '../api/userData';
import { fetchEvents, updateEventById, deleteEventById, EventUpdateInput } from '../api/events';
import { createEventUpdateNotificationsForSavedUsers } from '../api/notifications';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface ManageEventsScreenProps {
  user: User | null;
  clubs: Club[];
  darkMode?: boolean;
  onNavigate: (screen: Screen) => void;
}

export function ManageEventsScreen({ user, darkMode = true, onNavigate }: ManageEventsScreenProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [status, setStatus] = useState<'loading' | 'not-logged-in' | 'not-admin' | 'ok'>('loading');
  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (!user) {
        setStatus('not-logged-in');
        return;
      }

      try {
        const p = await loadProfile(user.id);
        setProfile(p);

        if (!p || p.role !== 'club_admin' || !p.club_id) {
          setStatus('not-admin');
          return;
        }

        setStatus('ok');

        // Load events for this club
        setLoadingEvents(true);
        const all = await fetchEvents();
        const clubEvents = all.filter((e) => e.clubId === p.club_id);
        setEvents(clubEvents);
      } catch (err: any) {
        console.error('Failed to load profile/events for manage screen:', err);
        setError('Failed to load your events. Please try again later.');
        setStatus('not-admin');
      } finally {
        setLoadingEvents(false);
      }
    };

    void init();
  }, [user]);

  const containerBg = darkMode ? 'bg-dark-900' : 'bg-light-800';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-600';

  const startEdit = (event: Event) => {
    setEditingId(event.id);
    setEditDate(event.date);
    const [start, end] = event.time.split(' - ');
    setEditStartTime(start || '');
    setEditEndTime(end || '');
    setEditLocation(event.location);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDate('');
    setEditStartTime('');
    setEditEndTime('');
    setEditLocation('');
  };

  const handleSave = async (event: Event) => {
    if (!profile || profile.role !== 'club_admin' || !profile.club_id) return;

    if (!editDate || !editStartTime || !editEndTime || !editLocation) {
      setError('Please fill in date, start/end time and location.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const oldDate = event.date;
      const oldTime = event.time;
      const oldLocation = event.location;

      const newTime = `${editStartTime} - ${editEndTime}`;

      const updates: EventUpdateInput = {
        date: editDate,
        time: newTime,
        location: editLocation,
      };

      await updateEventById(event.id, updates);

      const changed =
        oldDate !== editDate ||
        oldTime !== newTime ||
        oldLocation !== editLocation;

      if (changed) {
        try {
          await createEventUpdateNotificationsForSavedUsers(
            event.id,
            event.clubId,
            'Event updated',
            `"${event.title}" has updated date/time or location.`,
          );
        } catch (notifErr) {
          console.error('Failed to create event_update notifications:', notifErr);
        }
      }

      setEvents((prev) =>
        prev.map((e) =>
          e.id === event.id ? { ...e, date: editDate, time: newTime, location: editLocation } : e,
        ),
      );
      cancelEdit();
    } catch (err: any) {
      console.error('Failed to update event:', err);
      setError(err.message ?? 'Failed to update event.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      await deleteEventById(eventId);
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
    } catch (err: any) {
      console.error('Failed to delete event:', err);
      setError(err.message ?? 'Failed to delete event.');
    }
  };

  if (status === 'not-logged-in') {
    return (
      <div className={`min-h-screen pb-28 ${containerBg} px-6 pt-8`}>
        <Card padding="lg" variant="glass" darkMode={darkMode}>
          <h1 className={`text-xl mb-2 ${textPrimary}`}>Sign in to manage events</h1>
          <p className={textSecondary}>Only club admins can manage events.</p>
          <div className="mt-4 flex gap-2">
            <Button size="sm" onClick={() => onNavigate('profile')}>
              Go to Profile
            </Button>
            <Button size="sm" variant="outline" onClick={() => onNavigate('home')}>
              Back to Home
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (status === 'not-admin') {
    return (
      <div className={`min-h-screen pb-28 ${containerBg} px-6 pt-8`}>
        <Card padding="lg" variant="glass" darkMode={darkMode}>
          <h1 className={`text-xl mb-2 ${textPrimary}`}>
            You can't manage events with this account
          </h1>
          <p className={textSecondary}>
            Your account is not configured as a club admin. Please contact the Event Radar team if you think this is a
            mistake.
          </p>
          <div className="mt-4 flex gap-2">
            <Button size="sm" onClick={() => onNavigate('home')}>
              Back to Home
            </Button>
            <Button size="sm" variant="outline" onClick={() => onNavigate('profile')}>
              Go to Profile
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pb-28 ${containerBg} px-6 pt-8`}>
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h1 className={`text-2xl mb-1 ${textPrimary}`}>Manage Events</h1>
          <p className={textSecondary}>Edit or delete upcoming events for your club.</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => onNavigate('create')}>
          Back to Create
        </Button>
      </header>

      {error && <div className="mb-4 text-sm text-red-400">{error}</div>}

      {loadingEvents ? (
        <p className={textSecondary}>Loading events…</p>
      ) : events.length === 0 ? (
        <Card padding="lg" variant="glass" darkMode={darkMode}>
          <p className={textSecondary}>No events found for your club.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {events.map((event) => {
            const isEditing = editingId === event.id;
            const [start] = event.time.split(' - ');

            return (
              <motion.div key={event.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card padding="md" variant="glass" darkMode={darkMode}>
                  {!isEditing ? (
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h2 className={`text-sm font-medium mb-1 ${textPrimary}`}>{event.title}</h2>
                        <div className={`flex items-center gap-2 text-xs mb-1 ${textSecondary}`}>
                          <CalendarIcon className="w-3 h-3" />
                          <span>{event.date}</span>
                          <span>•</span>
                          <span>{start}</span>
                        </div>
                        <div className={`flex items-center gap-1.5 text-xs ${textSecondary}`}>
                          <MapPin className="w-3 h-3" />
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <button
                          onClick={() => startEdit(event)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-dark-700/50 hover:bg-dark-700 text-gray-300"
                          aria-label="Edit event"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(event.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400"
                          aria-label="Delete event"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className={`text-sm font-medium ${textPrimary}`}>{event.title}</p>
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          label="Date"
                          type="date"
                          value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
                          darkMode={darkMode}
                        />
                        <Input
                          label="Start time"
                          type="time"
                          value={editStartTime}
                          onChange={(e) => setEditStartTime(e.target.value)}
                          darkMode={darkMode}
                        />
                        <Input
                          label="End time"
                          type="time"
                          value={editEndTime}
                          onChange={(e) => setEditEndTime(e.target.value)}
                          darkMode={darkMode}
                        />
                        <Input
                          label="Location"
                          value={editLocation}
                          onChange={(e) => setEditLocation(e.target.value)}
                          darkMode={darkMode}
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button type="button" variant="outline" size="sm" onClick={cancelEdit}>
                          Cancel
                        </Button>
                        <Button type="button" size="sm" disabled={saving} onClick={() => handleSave(event)}>
                          {saving ? 'Saving…' : 'Save'}
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
