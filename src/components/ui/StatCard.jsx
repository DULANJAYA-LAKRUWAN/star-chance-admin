import React from 'react';
import { Card, CardBody } from './Card';

export const StatCard = ({ title, value, icon, trend, trendValue }) => {
  return (
    <Card className="stat-card">
      <CardBody className="stat-card-body">
        <div className="stat-card-icon">{icon}</div>
        <div>
          <h3 className="stat-card-title">{title}</h3>
          <div className="stat-card-value-row">
            <p className="stat-card-value">{value}</p>
            {trend && (
              <span className={`stat-card-trend ${trend === 'up' ? 'trend-up' : 'trend-down'}`}>
                {trend === 'up' ? '↑' : '↓'} {trendValue}
              </span>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
