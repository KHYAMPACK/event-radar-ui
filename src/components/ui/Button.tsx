import { ButtonHTMLAttributes, ReactNode } from 'react';
import { motion } from 'motion/react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: ReactNode;
  isLoading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  isLoading = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-2xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-900 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantStyles = {
    primary: 'bg-gradient-to-r from-neon-blue to-neon-purple text-white hover:shadow-lg hover:shadow-neon-blue/30 focus:ring-neon-blue',
    secondary: 'bg-dark-700/50 backdrop-blur-sm text-white border border-white/5 hover:border-neon-blue/30 focus:ring-neon-blue',
    ghost: 'text-gray-300 hover:bg-dark-700/30 focus:ring-neon-blue',
    outline: 'border border-neon-blue/30 text-neon-blue hover:bg-neon-blue/10 focus:ring-neon-blue'
  };

  const sizeStyles = {
    sm: 'h-10 px-4 text-sm',
    md: 'h-12 px-6',
    lg: 'h-14 px-8 text-lg'
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <motion.button
      whileHover={!disabled && !isLoading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !isLoading ? { scale: 0.98 } : {}}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="sr-only">Loading...</span>
          <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
        </>
      ) : (
        children
      )}
    </motion.button>
  );
}
