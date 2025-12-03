export interface Event {
  id: string;
  title: string;
  date: string; // ISO format: 2025-12-15
  time: string;
  location: string;
  category: 'Workshops' | 'Parties' | 'Seminars' | 'Sports' | 'Clubs' | 'Music' | 'Tech' | 'Art';
  clubId: string;
  image: string;
  description: string;
  attendees: number;
}

export interface Club {
  id: string;
  name: string;
  logo: string;
  description: string;
  category: string;
  memberCount: number;
  color: string; // For the chip color
}

export type Screen = 'onboarding' | 'home' | 'calendar' | 'create' | 'saved' | 'profile' | 'event-detail';

export interface SavedEvent {
  eventId: string;
  savedAt: string;
}

export interface FollowedClub {
  clubId: string;
  followedAt: string;
  notificationsEnabled: boolean;
}
