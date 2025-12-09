import { supabase } from '../lib/supabaseClient';
import type { Notification } from '../types';

interface UserNotificationRow {
  read: boolean;
  notifications: {
    id: string;
    type: string;
    club_id: string | null;
    event_id: string | null;
    title: string;
    message: string;
    created_at: string;
  };
}

export async function loadUserNotifications(userId: string): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('user_notifications')
    .select('read, notifications ( id, type, club_id, event_id, title, message, created_at )')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  const rows = (data ?? []) as unknown as UserNotificationRow[];

  return rows.map((row) => ({
    id: row.notifications.id,
    type: row.notifications.type as Notification['type'],
    clubId: row.notifications.club_id ?? undefined,
    eventId: row.notifications.event_id ?? undefined,
    title: row.notifications.title,
    message: row.notifications.message,
    timestamp: row.notifications.created_at,
    read: row.read,
  }));
}

export async function markNotificationRead(userId: string, notificationId: string): Promise<void> {
  const now = new Date().toISOString();
  const { error } = await supabase
    .from('user_notifications')
    .update({ read: true, read_at: now })
    .eq('user_id', userId)
    .eq('notification_id', notificationId);

  if (error) throw error;
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  const now = new Date().toISOString();
  const { error } = await supabase
    .from('user_notifications')
    .update({
      read: true,
      read_at: now,
    })
    .eq('user_id', userId)
    .eq('read', false);

  if (error) throw error;
}

// Create a "new_event" notification for followers of a club
export async function createNewEventNotificationsForClub(
  clubId: string,
  eventId: string,
  title: string,
  message: string
): Promise<void> {
  // 1) Create the base notification
  const { data: notif, error: notifError } = await supabase
    .from('notifications')
    .insert({
      type: 'new_event',
      club_id: clubId,
      event_id: eventId,
      title,
      message,
    })
    .select('id')
    .single();

  if (notifError) throw notifError;
  if (!notif || !notif.id) throw new Error('Failed to create notification');

  const notificationId = notif.id as string;

  // 2) Find followers of this club with notifications enabled
  const { data: followers, error: followersError } = await supabase
    .from('user_followed_clubs')
    .select('user_id')
    .eq('club_id', clubId)
    .eq('notifications_enabled', true);

  if (followersError) throw followersError;
  if (!followers || followers.length === 0) return; // nobody to notify

  const rows = (followers as { user_id: string }[]).map((f) => ({
    user_id: f.user_id,
    notification_id: notificationId,
    read: false,
  }));

  const { error: linkError } = await supabase
    .from('user_notifications')
    .insert(rows);

  if (linkError) throw linkError;
}

// Create an "event_update" notification for all users who saved this event
export async function createEventUpdateNotificationsForSavedUsers(
  eventId: string,
  clubId: string,
  title: string,
  message: string,
): Promise<void> {
  // Find users who saved this event
  const { data: saved, error: savedError } = await supabase
    .from('user_saved_events')
    .select('user_id')
    .eq('event_id', eventId);

  if (savedError) throw savedError;
  if (!saved || saved.length === 0) return; // nobody to notify

  // Create base notification
  const { data: notif, error: notifError } = await supabase
    .from('notifications')
    .insert({
      type: 'event_update',
      club_id: clubId,
      event_id: eventId,
      title,
      message,
    })
    .select('id')
    .single();

  if (notifError) throw notifError;
  if (!notif || !notif.id) throw new Error('Failed to create event_update notification');

  const notificationId = notif.id as string;

  const rows = (saved as { user_id: string }[]).map((s) => ({
    user_id: s.user_id,
    notification_id: notificationId,
    read: false,
  }));

  const { error: linkError2 } = await supabase
    .from('user_notifications')
    .insert(rows);

  if (linkError2) throw linkError2;
}
