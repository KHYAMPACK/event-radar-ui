import { Home, Calendar, Plus, Bookmark, User } from 'lucide-react';
import { Screen } from '../types';
//sa

interface BottomNavProps {
  activeScreen: Screen;
  onNavigate: (screen: Screen) => void;
  darkMode?: boolean;
}

export function BottomNav({ activeScreen, onNavigate, darkMode = true }: BottomNavProps) {
  const navItems = [
    { id: 'home' as Screen, icon: Home, label: 'Home' },
    { id: 'calendar' as Screen, icon: Calendar, label: 'Calendar' },
    { id: 'create' as Screen, icon: Plus, label: 'Create' },
    { id: 'saved' as Screen, icon: Bookmark, label: 'Clubs' },
    { id: 'profile' as Screen, icon: User, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto">
      {/* Glassmorphism background */}
      <div className={`backdrop-blur-xl border-t px-4 pb-6 pt-3 ${
        darkMode 
          ? 'bg-dark-800/80 border-white/5' 
          : 'bg-light-900/95 border-black/5 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]'
      }`}>
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeScreen === item.id;
            const isCreate = item.id === 'create';

            if (isCreate) {
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className="flex flex-col items-center gap-1 -mt-8"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-neon-blue to-neon-purple rounded-2xl flex items-center justify-center shadow-lg shadow-neon-blue/30">
                    <Icon className="w-6 h-6 text-white" strokeWidth={2} />
                  </div>
                </button>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="flex flex-col items-center gap-1 min-w-[60px] transition-colors"
              >
                <Icon
                  className={`w-6 h-6 transition-colors ${
                    isActive ? 'text-neon-blue' : darkMode ? 'text-gray-500' : 'text-gray-400'
                  }`}
                  strokeWidth={isActive ? 2 : 1.5}
                />
                <span
                  className={`text-[10px] transition-colors ${
                    isActive ? 'text-neon-blue' : darkMode ? 'text-gray-500' : 'text-gray-400'
                  }`}
                >
                  {item.label}
                </span>
                {isActive && (
                  <div className="w-1 h-1 bg-neon-blue rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}