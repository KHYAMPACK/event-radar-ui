import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'custom';
  customColor?: string;
  className?: string;
}

export function Badge({ children, variant = 'primary', customColor, className = '' }: BadgeProps) {
  const variantStyles = {
    primary: 'bg-neon-blue/20 text-neon-blue border-neon-blue/30',
    secondary: 'bg-neon-purple/20 text-neon-purple border-neon-purple/30',
    success: 'bg-green-500/20 text-green-400 border-green-500/30',
    warning: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    custom: ''
  };

  const customStyles = customColor
    ? `border`
    : '';

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs border backdrop-blur-md ${
        variant === 'custom' ? customStyles : variantStyles[variant]
      } ${className}`}
      style={
        customColor
          ? {
              backgroundColor: `${customColor}20`,
              color: customColor,
              borderColor: `${customColor}30`
            }
          : undefined
      }
    >
      {children}
    </span>
  );
}
