import React from 'react';

export const Badge = ({ children, variant = 'neutral', className = '', ...props }) => {
  const variantClass = `badge-${variant}`; // success, error, warning, info, neutral
  
  return (
    <span className={`badge ${variantClass} ${className}`} {...props}>
      {children}
    </span>
  );
};
