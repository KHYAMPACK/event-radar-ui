import { supabase } from '../lib/supabaseClient';
import type { Club } from '../types';

type ClubRow = {
  id: string;
  name: string;
  logo: string | null;
  color: string | null;
  member_count: number | null;
  description: string | null;
  category: string | null;
};

const mapClubRow = (row: ClubRow): Club => ({
  id: row.id,
  name: row.name,
  logo: row.logo ?? '',
  color: row.color ?? '#000000',
  memberCount: row.member_count ?? 0,
  description: row.description ?? '',
  category: row.category ?? '',
});

export async function fetchClubs(): Promise<Club[]> {
  const { data, error } = await supabase
    .from('clubs')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return (data as ClubRow[]).map(mapClubRow);
}