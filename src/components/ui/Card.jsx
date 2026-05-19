import React from 'react';

export const Card = ({ children, className = '', ...props }) => (
  <div className={`card ${className}`} {...props}>
    {children}
  </div>
);

export const CardHeader = ({ title, action, className = '' }) => (
  <div className={`card-header ${className}`}>
    {title && <h3 className="card-title">{title}</h3>}
    {action && <div>{action}</div>}
  </div>
);

export const CardBody = ({ children, className = '', ...props }) => (
  <div className={`card-body ${className}`} {...props}>
    {children}
  </div>
);
