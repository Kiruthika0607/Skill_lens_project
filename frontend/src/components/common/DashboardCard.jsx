import React from 'react';

const DashboardCard = ({ title, value, subtitle, icon: Icon, color = 'var(--accent-primary)', badgeText }) => {
  return (
    <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {title}
          </span>
          <div style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '0.35rem', letterSpacing: '-0.02em' }}>
            {value}
          </div>
          {subtitle && (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              {subtitle}
            </p>
          )}
        </div>

        {Icon && (
          <div style={{
            background: `rgba(99, 102, 241, 0.12)`,
            color: color,
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Icon size={24} />
          </div>
        )}
      </div>

      {badgeText && (
        <div style={{ marginTop: '0.85rem', display: 'flex' }}>
          <span className="badge badge-primary">{badgeText}</span>
        </div>
      )}
    </div>
  );
};

export default DashboardCard;
