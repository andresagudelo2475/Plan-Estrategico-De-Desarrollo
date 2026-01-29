"use client";

import React from 'react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down';
  trendValue?: string;
  color?: string;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, subtitle, icon, trend, trendValue, color }) => {
  return (
    <div className="card kpi-card">
      <div className="kpi-header">
        <span className="kpi-title">{title}</span>
        {icon && <div className="kpi-icon" style={{ color }}>{icon}</div>}
      </div>
      <div className="kpi-body">
        <h3 className="kpi-value">{value}</h3>
        {trend && (
          <div className={`kpi-trend ${trend}`}>
            {trend === 'up' ? '▲' : '▼'} {trendValue}
          </div>
        )}
      </div>
      {subtitle && <div className="kpi-subtitle">{subtitle}</div>}

      <style jsx>{`
        .kpi-card {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          min-width: 140px;
          padding: 1rem !important;
          border-left: 4px solid ${color || 'var(--color-primary-main)'};
        }

        .kpi-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .kpi-title {
          font-size: 0.75rem;
          font-weight: 600;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }

        .kpi-value {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--color-primary-dark);
          margin: 0.1rem 0;
          white-space: nowrap;
        }

        .kpi-trend {
          font-size: 0.8rem;
          font-weight: 700;
          display: inline-block;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .kpi-trend.up {
          color: var(--color-success);
          background: rgba(13, 202, 97, 0.1);
        }

        .kpi-trend.down {
          color: var(--color-error);
          background: rgba(219, 31, 81, 0.1);
        }

        .kpi-subtitle {
          font-size: 0.75rem;
          color: #888;
        }
      `}</style>
    </div>
  );
};

export default KPICard;
