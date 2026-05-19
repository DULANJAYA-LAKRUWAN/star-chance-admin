import React from 'react';
import { Loader } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary', // primary, secondary, danger, ghost
  size = 'md', // sm, md, lg
  isLoading = false,
  disabled = false,
  icon,
  className = '',
  ...props
}) => {
  const baseClass = 'btn';
  const variantClass = `btn-${variant}`;
  
  // Custom sizes inline for simplicity, relying on standard padding in CSS for 'md'
  const sizeStyles = {
    sm: { padding: '0.375rem 0.75rem', fontSize: '0.75rem' },
    md: {}, // Uses CSS defaults
    lg: { padding: '0.75rem 1.5rem', fontSize: '1rem' },
  };

  return (
    <button
      className={`${baseClass} ${variantClass} ${className}`}
      disabled={isLoading || disabled}
      style={sizeStyles[size]}
      {...props}
    >
      {isLoading ? (
        <Loader className="animate-spin" size={size === 'sm' ? 14 : 18} />
      ) : icon ? (
        icon
      ) : null}
      {children}
    </button>
  );
};
