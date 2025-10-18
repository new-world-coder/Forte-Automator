import React from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Button({ 
  variant = 'primary', 
  onClick, 
  children, 
  disabled = false,
  className = '',
  size = 'md'
}: ButtonProps) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };
  
  const baseClasses = `${sizeClasses[size]} rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2`;
  
  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-blue-600 focus:ring-blue-500 disabled:bg-gray-400',
    secondary: 'bg-secondary text-white hover:bg-gray-600 focus:ring-gray-500 disabled:bg-gray-400'
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      type="button"
    >
      {children}
    </button>
  );
}
