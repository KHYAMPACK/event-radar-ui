import { ReactNode, HTMLAttributes, ElementType } from 'react';

interface CardProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  variant?: 'default' | 'glass' | 'gradient';
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  as?: ElementType;
  darkMode?: boolean;
}

export function Card({
  children,
  variant = 'default',
  hoverable = false,
  padding = 'md',
  as: Component = 'div',
  className = '',
  darkMode = true,
  ...props
}: CardProps) {
  const variantStyles = {
    default: darkMode 
      ? 'bg-dark-700/50 backdrop-blur-sm border border-white/5' 
      : 'bg-white backdrop-blur-sm border border-black/5',
    glass: darkMode 
      ? 'bg-dark-700/80 backdrop-blur-xl border border-white/10' 
      : 'bg-white/80 backdrop-blur-xl border border-black/10',
    gradient: darkMode 
      ? 'bg-gradient-to-br from-dark-700/80 to-dark-800/80 backdrop-blur-xl border border-white/10' 
      : 'bg-gradient-to-br from-white/80 to-light-700/80 backdrop-blur-xl border border-black/10'
  };

  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  const hoverStyles = hoverable
    ? 'hover:border-neon-blue/30 hover:shadow-lg hover:shadow-neon-blue/10 transition-all cursor-pointer'
    : 'transition-all';

  return (
    <Component
      className={`rounded-3xl ${variantStyles[variant]} ${paddingStyles[padding]} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}