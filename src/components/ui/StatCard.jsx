import React from 'react';
import { Card, CardBody } from './Card';

export const StatCard = ({ title, value, icon, trend, trendValue }) => {
  return (
    <Card className="stat-card">
      <CardBody style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div 
          style={{ 
            width: '48px', 
            height: '48px', 
            borderRadius: 'var(--radius-lg)', 
            background: 'var(--bg-surface-hover)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'var(--text-secondary)'
          }}
        >
          {icon}
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {title}
          </h3>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginTop: '0.25rem' }}>
            <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              {value}
            </p>
            {trend && (
              <span style={{ 
                fontSize: '0.75rem', 
                fontWeight: 600, 
                color: trend === 'up' ? 'var(--success)' : 'var(--error)' 
              }}>
                {trend === 'up' ? '↑' : '↓'} {trendValue}
              </span>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
