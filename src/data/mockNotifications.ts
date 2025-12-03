import { Notification } from '../types';

export const mockNotifications: Notification[] = [
  {
    id: 'n1',
    type: 'new_event',
    clubId: 'c1',
    eventId: 'e1',
    title: 'New Event from Tech Club',
    message: 'Tech Club just posted "AI Workshop: Build Your First Model" happening tomorrow!',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
    read: false
  },
  {
    id: 'n2',
    type: 'event_reminder',
    clubId: 'c3',
    eventId: 'e3',
    title: 'Event Starting Soon',
    message: 'Game Night starts in 1 hour at Student Center Room 301',
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
    read: false
  },
  {
    id: 'n3',
    type: 'club_announcement',
    clubId: 'c2',
    title: 'Art Society Update',
    message: 'We just hit 500 members! Thank you for your support. Special event coming next week! 🎨',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
    read: false
  },
  {
    id: 'n4',
    type: 'event_update',
    clubId: 'c1',
    eventId: 'e2',
    title: 'Event Location Changed',
    message: 'Startup Pitch Night has been moved to Engineering Hall Auditorium',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    read: true
  },
  {
    id: 'n5',
    type: 'new_event',
    clubId: 'c4',
    eventId: 'e7',
    title: 'New Event from Dance Collective',
    message: 'Dance Collective just posted "Hip Hop Workshop" happening this Friday!',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    read: true
  },
  {
    id: 'n6',
    type: 'event_reminder',
    clubId: 'c2',
    eventId: 'e4',
    title: 'Tomorrow\'s Event',
    message: 'Don\'t forget: Gallery Opening tomorrow at 6:00 PM',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    read: true
  }
];
