export type Screen = 
  | 'onboarding'
  | 'home'
  | 'calendar'
  | 'create'
  | 'saved'
  | 'profile'
  | 'event-detail'
  | 'discover-clubs';

export interface Event {
  id: string;
  title: string;
  clubId: string;
  date: string;
  time: string;
  location: string;
  image: string;
  attendees: number;
  tags: string[];
  description: string;
}

export interface Club {
  id: string;
  name: string;
  logo: string;
  color: string;
  members: number;
  description: string;
  category: string;
}

export interface Notification {
  id: string;
  type: 'new_event' | 'event_reminder' | 'club_announcement' | 'event_update';
  clubId?: string;
  eventId?: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}
