import React, { forwardRef } from 'react';

export const Input = forwardRef(({
  label,
  error,
  icon: Icon,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || Math.random().toString(36).substr(2, 9);

  return (
    <div className={`input-wrapper ${className}`} style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', width: '100%' }}>
      {label && (
        <label htmlFor={inputId} style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {Icon && (
          <div style={{ position: 'absolute', left: '1rem', color: 'var(--text-muted)', pointerEvents: 'none', display: 'flex' }}>
            <Icon size={18} />
          </div>
        )}
        <input
          id={inputId}
          ref={ref}
          className="input-field"
          style={{ paddingLeft: Icon ? '2.75rem' : '1rem', borderColor: error ? 'var(--error)' : undefined }}
          {...props}
        />
      </div>
      {error && (
        <span style={{ fontSize: '0.75rem', color: 'var(--error)', fontWeight: 500, marginTop: '2px' }}>
          {error}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';
