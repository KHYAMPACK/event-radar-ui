import { useState } from 'react';
import { Users, Bell, BellOff, Calendar } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { Club } from '../types';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

interface ClubModalProps {
  club: Club | null;
  isOpen: boolean;
  onClose: () => void;
  isFollowing: boolean;
  notificationsEnabled: boolean;
  onToggleFollow: () => void;
  onToggleNotifications: () => void;
  onViewEvents?: () => void;
}

export function ClubModal({
  club,
  isOpen,
  onClose,
  isFollowing,
  notificationsEnabled,
  onToggleFollow,
  onToggleNotifications,
  onViewEvents
}: ClubModalProps) {
  if (!club) return null;

  const [showQr, setShowQr] = useState(false);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="p-6 space-y-6">
        {/* Club header */}
        <div className="flex items-start gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
            style={{ backgroundColor: `${club.color}20` }}
            aria-hidden="true"
          >
            {club.logo}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-2xl text-white mb-1">{club.name}</h3>
            <p className="text-gray-400 text-sm">{club.category}</p>
          </div>
        </div>

        {/* Members count */}
        <Card variant="glass" padding="md">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${club.color}20` }}
            >
              <Users className="w-5 h-5" style={{ color: club.color }} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-white">
                {club.memberCount.toLocaleString()} members
              </p>
              <p className="text-gray-400 text-xs">Active community</p>
            </div>
          </div>
        </Card>

        {/* Description */}
        <div>
          <h4 className="text-white mb-2">About</h4>
          <p className="text-gray-400 text-sm leading-relaxed">
            {club.description}
          </p>
        </div>

        {/* Action buttons - Fixed at bottom of modal content */}
        <div className="space-y-3 pt-2">
          <Button
            variant={isFollowing ? 'secondary' : 'primary'}
            size="lg"
            fullWidth
            onClick={onToggleFollow}
            aria-pressed={isFollowing}
          >
            {isFollowing ? 'Following' : 'Follow Club'}
          </Button>

          {/* View Events button - always visible */}
          {onViewEvents && (
            <button
              onClick={onViewEvents}
              className="w-full h-12 flex items-center justify-center gap-2 bg-dark-700/30 rounded-2xl text-gray-300 hover:bg-dark-700/50 transition-colors focus:outline-none focus:ring-2 focus:ring-neon-blue"
              aria-label="View events from this club"
            >
              <Calendar className="w-5 h-5 text-neon-blue" strokeWidth={1.5} />
              <span>View Events</span>
            </button>
          )}

          {/* Notifications toggle (only show when following) */}
          {isFollowing && (
            <button
              onClick={onToggleNotifications}
              className="w-full h-12 flex items-center justify-center gap-2 bg-dark-700/30 rounded-2xl text-gray-300 hover:bg-dark-700/50 transition-colors focus:outline-none focus:ring-2 focus:ring-neon-blue"
              aria-pressed={notificationsEnabled}
              aria-label={notificationsEnabled ? 'Disable notifications' : 'Enable notifications'}
            >
              {notificationsEnabled ? (
                <>
                  <Bell className="w-5 h-5 text-neon-cyan" strokeWidth={1.5} />
                  <span>Notifications On</span>
                </>
              ) : (
                <>
                  <BellOff className="w-5 h-5 text-gray-500" strokeWidth={1.5} />
                  <span>Notifications Off</span>
                </>
              )}
            </button>
          )}

          {/* QR code toggle */}
          <Button
            variant="ghost"
            size="lg"
            fullWidth
            onClick={() => setShowQr((prev) => !prev)}
          >
            {showQr ? 'Hide QR Code' : 'Show QR Code'}
          </Button>

          {showQr && (
            <div className="flex flex-col items-center gap-2 pt-1">
              <div className="p-3 rounded-2xl bg-dark-800 border border-white/10">
                <QRCodeCanvas
                  value={`eventradar://club/${club.id}`}
                  size={160}
                  bgColor="#020617"
                  fgColor="#ffffff"
                  level="M"
                  includeMargin={false}
                />
              </div>
              <p className="text-[11px] text-gray-500 text-center">
                Scan to open {club.name} in Event Radar
              </p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}