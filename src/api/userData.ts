import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

// Ensure profile row exists for this user
export async function ensureProfile(user: User): Promise<void> {
  const { error } = await supabase.from('profiles').upsert({
    id: user.id,
    display_name: user.email ?? null,
  });

  if (error) throw error;
}

export type ProfileRole = 'student' | 'club_admin';

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  role: ProfileRole | null;
  club_id: string | null;
}

export async function loadProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_url, role, club_id')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id as string,
    display_name: (data.display_name as string | null) ?? null,
    avatar_url: (data.avatar_url as string | null) ?? null,
    role: (data.role as ProfileRole | null) ?? null,
    club_id: (data.club_id as string | null) ?? null,
  };
}

// ----- Saved events -----

export async function loadUserSavedEventIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('user_saved_events')
    .select('event_id')
    .eq('user_id', userId);

  if (error) throw error;
  return (data ?? []).map((row) => row.event_id as string);
}

export async function addSavedEvent(userId: string, eventId: string): Promise<void> {
  const { error } = await supabase
    .from('user_saved_events')
    .insert({ user_id: userId, event_id: eventId });

  // Ignore duplicate primary key errors (already saved)
  if (error && error.code !== '23505') {
    throw error;
  }
}

export async function removeSavedEvent(userId: string, eventId: string): Promise<void> {
  const { error } = await supabase
    .from('user_saved_events')
    .delete()
    .eq('user_id', userId)
    .eq('event_id', eventId);

  if (error) throw error;
}

// ----- Followed clubs -----

export interface FollowedClubRow {
  clubId: string;
  notificationsEnabled: boolean;
}

export async function loadUserFollowedClubs(userId: string): Promise<FollowedClubRow[]> {
  const { data, error } = await supabase
    .from('user_followed_clubs')
    .select('club_id, notifications_enabled')
    .eq('user_id', userId);

  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    clubId: row.club_id as string,
    notificationsEnabled: (row.notifications_enabled as boolean | null) ?? true,
  }));
}

export async function followClub(userId: string, clubId: string, notificationsEnabled: boolean = true): Promise<void> {
  const { error } = await supabase
    .from('user_followed_clubs')
    .upsert({ user_id: userId, club_id: clubId, notifications_enabled: notificationsEnabled });

  if (error) throw error;
}

export async function unfollowClub(userId: string, clubId: string): Promise<void> {
  const { error } = await supabase
    .from('user_followed_clubs')
    .delete()
    .eq('user_id', userId)
    .eq('club_id', clubId);

  if (error) throw error;
}

export async function setClubNotificationsEnabled(userId: string, clubId: string, enabled: boolean): Promise<void> {
  const { error } = await supabase
    .from('user_followed_clubs')
    .update({ notifications_enabled: enabled })
    .eq('user_id', userId)
    .eq('club_id', clubId);

  if (error) throw error;
}
