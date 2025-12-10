import { motion } from 'motion/react';
import { Radar, Sparkles } from 'lucide-react';
import { Button } from './ui/Button';

interface OnboardingScreenProps {
  onContinue: () => void;
  darkMode?: boolean;
}

export function OnboardingScreen({ onContinue, darkMode = true }: OnboardingScreenProps) {
  return (
    <div className={`min-h-screen flex flex-col items-center justify-between px-8 py-16 ${darkMode ? 'bg-dark-900' : 'bg-light-900'}`}>
      {/* Top spacing */}
      <div />
      
      {/* Main content */}
      <main className="flex flex-col items-center text-center">
        {/* Animated icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: "spring",
            stiffness: 200,
            damping: 15,
            duration: 0.8
          }}
          className="relative mb-12"
          aria-hidden="true"
        >
          {/* Glow effect */}
          <div className="absolute inset-0 bg-neon-blue/30 blur-3xl rounded-full scale-150" />
          
          {/* Icon container */}
          <div className="relative w-32 h-32 bg-gradient-to-br from-neon-blue to-neon-purple rounded-[32px] flex items-center justify-center shadow-2xl">
            <Radar className="w-16 h-16 text-white" strokeWidth={1.5} />
            
            {/* Floating sparkles */}
            <motion.div
              animate={{ 
                y: [-5, -15, -5],
                x: [10, 15, 10],
              }}
              transition={{ 
                repeat: Infinity,
                duration: 3,
                ease: "easeInOut"
              }}
              className="absolute -top-2 -right-2"
            >
              <Sparkles className="w-6 h-6 text-neon-cyan" fill="currentColor" />
            </motion.div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-5xl mb-2 bg-gradient-to-r from-white via-neon-blue to-neon-purple bg-clip-text text-transparent"
        >
          MES
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-gray-400 text-lg max-w-sm"
        >
          Meet&Event System for Bilkent
        </motion.p>

        {/* Features list */}
        <motion.ul
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-8 space-y-2 text-gray-400 text-left"
        >
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-neon-blue rounded-full" aria-hidden="true" />
            <span>Discover campus events instantly</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-neon-purple rounded-full" aria-hidden="true" />
            <span>Follow clubs and get notifications</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-neon-cyan rounded-full" aria-hidden="true" />
            <span>Save events to your calendar</span>
          </li>
        </motion.ul>
      </main>

      {/* Continue button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="w-full max-w-sm"
      >
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={onContinue}
        >
          Continue
        </Button>
      </motion.div>
    </div>
  );
}