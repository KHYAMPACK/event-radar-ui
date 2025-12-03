import { Plus, LucideIcon } from 'lucide-react';
import { BottomNav } from './BottomNav';
import { Screen } from '../types';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { motion } from 'motion/react';

interface PlaceholderScreenProps {
  screen: Screen;
  onNavigate: (screen: Screen) => void;
  darkMode?: boolean;
}

const screenConfig: Record<string, { title: string; subtitle: string; icon: LucideIcon; gradient: string }> = {
  create: {
    title: 'Create Event',
    subtitle: 'Share your event with the campus',
    icon: Plus,
    gradient: 'from-neon-purple to-neon-cyan',
  },
  saved: {
    title: 'Saved Events',
    subtitle: 'Events you want to attend',
    icon: Plus,
    gradient: 'from-neon-cyan to-neon-blue',
  },
};

export function PlaceholderScreen({ screen, onNavigate, darkMode = true }: PlaceholderScreenProps) {
  const config = screenConfig[screen];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <div className={`min-h-screen pb-28 ${darkMode ? 'bg-dark-900' : 'bg-light-800'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-40 backdrop-blur-xl border-b px-6 pt-8 pb-4 ${
        darkMode 
          ? 'bg-dark-900/95 border-white/5' 
          : 'bg-light-900/95 border-black/5'
      }`}>
        <h1 className={`text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>{config.title}</h1>
      </header>

      {/* Content */}
      <main className="flex flex-col items-center justify-center px-6 pt-32">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="relative mb-8"
        >
          <div className="absolute inset-0 bg-neon-blue/20 blur-3xl rounded-full" aria-hidden="true" />
          <div className={`relative w-24 h-24 bg-gradient-to-br ${config.gradient} rounded-3xl flex items-center justify-center`}>
            <Icon className="w-12 h-12 text-white" strokeWidth={1.5} />
          </div>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`text-xl mb-2 text-center ${darkMode ? 'text-white' : 'text-gray-900'}`}
        >
          {config.title}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`text-center mb-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
        >
          {config.subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-sm"
        >
          <Card variant="glass" padding="lg" className="text-center mb-6">
            <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              This feature is coming soon. In the meantime, explore events on the Home screen.
            </p>
          </Card>

          <Button variant="primary" size="lg" fullWidth onClick={() => onNavigate('home')}>
            Go to Home
          </Button>
        </motion.div>
      </main>

      {/* Bottom navigation */}
      <BottomNav activeScreen={screen} onNavigate={onNavigate} darkMode={darkMode} />
    </div>
  );
}