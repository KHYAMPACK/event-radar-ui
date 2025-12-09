import { supabase } from '../lib/supabaseClient';

export type EventReportType =
  | 'false_incorrect_info'
  | 'spam_irrelevant'
  | 'inappropriate_harmful'
  | 'duplicate'
  | 'suspected_scam'
  | 'other';

export interface SubmitEventReportParams {
  eventId: string;
  reporterId: string;
  type: EventReportType;
  message?: string;
}

export async function hasUserReportedEvent(eventId: string, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('event_reports')
    .select('id')
    .eq('event_id', eventId)
    .eq('reporter_id', userId)
    .limit(1)
    .maybeSingle();

  if (error && (error as any).code !== 'PGRST116') {
    // PGRST116 = no rows found; treat that as "not reported"
    throw error;
  }

  return !!data;
}

export async function submitEventReport(params: SubmitEventReportParams): Promise<void> {
  const { eventId, reporterId, type, message } = params;

  const { error } = await supabase
    .from('event_reports')
    .insert({
      event_id: eventId,
      reporter_id: reporterId,
      type,
      message: message?.trim() || null,
    });

  if (error) {
    // 23505 = unique_violation (user already reported this event)
    if ((error as any).code === '23505') {
      const already = new Error('already_reported');
      (already as any).code = 'already_reported';
      throw already;
    }
    throw error;
  }
}
