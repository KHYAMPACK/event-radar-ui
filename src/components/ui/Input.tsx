import { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
  label?: string;
  error?: string;
  darkMode?: boolean;
}

export function Input({ icon, label, error, className = '', id, darkMode = true, ...props }: InputProps) {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className={`block text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className={`absolute left-4 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`} aria-hidden="true">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={`w-full h-12 backdrop-blur-sm border ${
            error ? 'border-red-500' : darkMode ? 'border-white/5' : 'border-black/5'
          } rounded-2xl ${
            icon ? 'pl-12' : 'pl-4'
          } pr-4 ${
            darkMode 
              ? 'bg-dark-700/50 text-white placeholder:text-gray-500' 
              : 'bg-white text-gray-900 placeholder:text-gray-500'
          } focus:outline-none focus:border-neon-blue/50 focus:shadow-lg focus:shadow-neon-blue/5 transition-all ${className}`}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
      </div>
      {error && (
        <p id={`${inputId}-error`} className="mt-2 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}