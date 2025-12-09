import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { Calendar as CalendarIcon, MapPin, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Club, Screen } from '../types';
import { Profile, ProfileRole, loadProfile } from '../api/userData';
import { Input } from './ui/Input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { motion } from 'motion/react';
import { createNewEventNotificationsForClub } from '../api/notifications';

interface CreateEventScreenProps {
  user: User | null;
  clubs: Club[];
  darkMode?: boolean;
  onNavigate: (screen: Screen) => void;
  onEventCreated: (eventId: string) => void;
}

type CreateEventStatus =
  | 'loading-profile'
  | 'not-logged-in'
  | 'student'
  | 'club-admin'
  | 'invalid-profile';

const DEFAULT_IMAGES: Record<string, string> = {
  Sports: 'https://images.unsplash.com/photo-1762860799648-0a957a2e51a6?auto=format&fit=crop&w=1080&q=80',
  Parties: 'https://images.unsplash.com/photo-1650584997985-e713a869ee77?auto=format&fit=crop&w=1080&q=80',
  Music: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=1080&q=80',
  Workshops: 'https://images.unsplash.com/photo-1700616270774-c49913d89a3c?auto=format&fit=crop&w=1080&q=80',
  Seminars: 'https://images.unsplash.com/photo-1762968269894-1d7e1ce8894e?auto=format&fit=crop&w=1080&q=80',
  Tech: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1080&q=80',
  Art: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=1080&q=80',
  Clubs: 'https://images.unsplash.com/photo-1719281652529-014d03a4f0e7?auto=format&fit=crop&w=1080&q=80',
  Career: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1080&q=80',
  Social: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1080&q=80',
};

const EVENT_CATEGORIES = [
  'Workshops',
  'Parties',
  'Seminars',
  'Sports',
  'Clubs',
  'Music',
  'Tech',
  'Art',
  'Career',
  'Social',
];

export function CreateEventScreen({
  user,
  clubs,
  darkMode = true,
  onNavigate,
  onEventCreated,
}: CreateEventScreenProps) {
  const routerNavigate = useNavigate();
  const [status, setStatus] = useState<CreateEventStatus>('loading-profile');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState<string>('Workshops');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const todayStr = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    const init = async () => {
      if (!user) {
        setStatus('not-logged-in');
        return;
      }

      try {
        const p = await loadProfile(user.id);
        setProfile(p);

        if (!p || !p.role) {
          setStatus('invalid-profile');
          setError('Your profile does not have a valid role configured.');
          return;
        }

        if (p.role === 'student') {
          setStatus('student');
          return;
        }

        // club_admin
        if (p.role === 'club_admin' && p.club_id) {
          const club = clubs.find(c => c.id === p.club_id);
          if (!club) {
            setStatus('invalid-profile');
            setError('Your club admin profile is linked to an unknown club.');
            return;
          }
          setStatus('club-admin');
          return;
        }

        setStatus('invalid-profile');
        setError('Your club admin information is not configured correctly.');
      } catch (err: any) {
        console.error('Failed to load profile for create-event:', err);
        setStatus('invalid-profile');
        setError('Failed to load your profile. Please try again later.');
      }
    };

    init();
  }, [user, clubs]);

  const resolveClub = () => {
    if (!profile || !profile.club_id) return null;
    return clubs.find(c => c.id === profile.club_id) ?? null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile || profile.role !== 'club_admin' || !profile.club_id) return;

    if (!title || !date || !startTime || !endTime || !location || !category || !description) {
      setError('Please fill in all required fields.');
      return;
    }

    // Prevent creating events in the past (by date)
    if (date < todayStr) {
      setError('Event date cannot be in the past.');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const timeString = `${startTime} - ${endTime}`;
      const defaultImage = DEFAULT_IMAGES[category] ?? DEFAULT_IMAGES['Social'];
      const finalImageUrl = imageUrl.trim() || defaultImage;

      const { data, error: insertError } = await supabase
        .from('events')
        .insert({
          title,
          date,
          time: timeString,
          location,
          category,
          description,
          image_url: finalImageUrl,
          club_id: profile.club_id,
          creator_id: profile.id,
        })
        .select('id')
        .single();

      if (insertError) throw insertError;
      if (!data || !data.id) {
        throw new Error('Event was created but no ID was returned.');
      }

      const newEventId = data.id as string;

      // Create notifications for followers of this club
      try {
        if (profile.club_id) {
          await createNewEventNotificationsForClub(
            profile.club_id,
            newEventId,
            `New event from ${resolveClub()?.name ?? 'your club'}`,
            title,
          );
        }
      } catch (notifErr) {
        console.error('Failed to create notifications for new event:', notifErr);
        // Don't block event creation if notifications fail
      }

      onEventCreated(newEventId);
    } catch (err: any) {
      console.error('Failed to create event:', err);
      setError(err.message ?? 'Failed to create event. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const containerBg = darkMode ? 'bg-dark-900' : 'bg-light-800';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-600';

  // Not logged in: show simple info
  if (status === 'not-logged-in') {
    return (
      <div className={`min-h-screen pb-28 ${containerBg} px-6 pt-8`}
           aria-label="Create event – sign in required">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card padding="lg" variant="glass" darkMode={darkMode}>
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-neon-blue mt-0.5" />
              <div>
                <h1 className={`text-xl mb-2 ${textPrimary}`}>Sign in to create events</h1>
                <p className={textSecondary}>
                  Only verified club admins can create events. Please sign in with your club admin account from the
                  Profile tab, then return here.
                </p>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" onClick={() => onNavigate('profile')}>Go to Profile</Button>
                  <Button size="sm" variant="outline" onClick={() => onNavigate('home')}>Back to Home</Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Student: coming soon message
  if (status === 'student') {
    return (
      <div className={`min-h-screen pb-28 ${containerBg} px-6 pt-8`}
           aria-label="Create event – students">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card padding="lg" variant="glass" darkMode={darkMode}>
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-neon-blue mt-0.5" />
              <div>
                <h1 className={`text-xl mb-2 ${textPrimary}`}>Student-created events are coming soon</h1>
                <p className={textSecondary}>
                  Right now, only official club admins can create events. In the future, you&apos;ll be able to submit
                  your own events directly from Event Radar.
                </p>
                <div className="mt-4">
                  <Button size="sm" variant="outline" onClick={() => onNavigate('home')}>
                    Back to Home
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Invalid profile or error
  if (status === 'invalid-profile') {
    return (
      <div className={`min-h-screen pb-28 ${containerBg} px-6 pt-8`}
           aria-label="Create event – profile error">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card padding="lg" variant="glass" darkMode={darkMode}>
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
              <div>
                <h1 className={`text-xl mb-2 ${textPrimary}`}>Can&apos;t create events with this account</h1>
                <p className={textSecondary}>
                  {error || 'Your club admin information is not configured correctly. Please contact the Event Radar team or your club administrator.'}
                </p>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" onClick={() => onNavigate('home')}>Back to Home</Button>
                  <Button size="sm" variant="outline" onClick={() => onNavigate('profile')}>Go to Profile</Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Still loading profile
  if (status === 'loading-profile') {
    return (
      <div className={`min-h-screen pb-28 ${containerBg} flex items-center justify-center`}
           aria-label="Loading create event screen">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={textSecondary}
        >
          Loading your profile…
        </motion.p>
      </div>
    );
  }

  // Club admin form
  const club = resolveClub();

  return (
    <div className={`min-h-screen pb-28 ${containerBg} px-6 pt-8`}
         aria-label="Create event – club admin">
      <motion.header
        className="mb-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className={`text-2xl mb-1 ${textPrimary}`}>Create New Event</h1>
        {club && (
          <p className={textSecondary}>
            Creating event for <span className="font-medium">{club.name}</span>
          </p>
        )}
      </motion.header>

      <motion.form
        onSubmit={handleSubmit}
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-2 text-sm text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <Card padding="lg" variant="glass" darkMode={darkMode}>
          <div className="space-y-4">
            <Input
              label="Event title"
              placeholder="e.g. AI & Machine Learning Workshop"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              darkMode={darkMode}
            />

            <div className="grid grid-cols-1 gap-3">
              <div className="flex flex-col gap-1">
                <label className={`text-sm ${textSecondary}`}>Date</label>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-neon-blue" />
                  <Input
                    type="date"
                    value={date}
                    min={todayStr}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    darkMode={darkMode}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Start time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                  darkMode={darkMode}
                />
                <Input
                  label="End time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                  darkMode={darkMode}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className={`text-sm ${textSecondary}`}>Location</label>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-neon-purple" />
                <Input
                  placeholder="e.g. Bilkent – Main Campus, EA Building"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  darkMode={darkMode}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className={`text-sm mb-1 block ${textSecondary}`}>Event type</label>
                <select
                  className={`w-full rounded-xl px-3 py-2 text-sm outline-none border ${
                    darkMode
                      ? 'bg-dark-800 border-white/10 text-white'
                      : 'bg-white border-black/10 text-gray-900'
                  }`}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  {EVENT_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`text-sm mb-1 block ${textSecondary}`}>
                  Image URL (optional)
                </label>
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-neon-cyan" />
                  <Input
                    placeholder="Paste an image URL or leave empty for a default image"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    darkMode={darkMode}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className={`text-sm mb-1 block ${textSecondary}`}>Description</label>
              <Textarea
                placeholder="Describe what will happen at this event, who it is for, and any important details."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                darkMode={darkMode}
              />
            </div>
          </div>
        </Card>

        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <Button type="submit" size="lg" fullWidth disabled={submitting}>
              {submitting ? 'Creating…' : 'Create Event'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => onNavigate('home')}
            >
              Cancel
            </Button>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="lg"
            fullWidth
            onClick={() => routerNavigate('/manage-events')}
          >
            Manage Events
          </Button>
        </div>
      </motion.form>
    </div>
  );
}
