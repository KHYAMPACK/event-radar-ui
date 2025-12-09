import { supabase } from '../lib/supabaseClient';
import type { Event } from '../types';

type EventRow = {
  id: string;
  title: string;
  club_id: string | null;
  date: string;
  time: string | null;
  location: string | null;
  image_url: string | null;
  attendees: number | null;
  tags: string[] | null;
  description: string | null;
  category: string | null;
};

export type EventUpdateInput = {
  title?: string;
  date?: string;
  time?: string;
  location?: string;
  category?: string;
  description?: string;
  image_url?: string;
};

const mapEventRow = (row: EventRow): Event => ({
  id: row.id,
  title: row.title,
  clubId: row.club_id ?? '',
  date: row.date,
  time: row.time ?? '',
  location: row.location ?? '',
  image: row.image_url ?? '',
  attendees: row.attendees ?? 0,
  tags: row.tags ?? [],
  description: row.description ?? '',
  category: row.category ?? 'Other',
});

export async function fetchEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('date', { ascending: true });

  if (error) throw error;
  return (data as EventRow[]).map(mapEventRow);
}

export async function fetchEventById(id: string): Promise<Event | null> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    // not found
    if ((error as any).code === 'PGRST116') return null;
    throw error;
  }

  return mapEventRow(data as EventRow);
}

export async function updateEventById(id: string, updates: EventUpdateInput): Promise<void> {
  const { error } = await supabase
    .from('events')
    .update(updates)
    .eq('id', id);

  if (error) throw error;
}

export async function deleteEventById(id: string): Promise<void> {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
