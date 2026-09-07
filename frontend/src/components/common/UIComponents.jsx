import React from 'react';

export const ProgressBar = ({ percentage, color = 'primary', height = 8, showLabel = false }) => {
  const cleanPct = Math.min(100, Math.max(0, percentage || 0));

  let fillClass = 'fill-primary';
  if (color === 'success' || cleanPct >= 75) fillClass = 'fill-success';
  else if (color === 'warning' || cleanPct >= 40) fillClass = 'fill-warning';

  return (
    <div style={{ width: '100%' }}>
      {showLabel && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.35rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Progress</span>
          <span style={{ color: 'var(--text-primary)' }}>{cleanPct}%</span>
        </div>
      )}
      <div className="progress-bar-container" style={{ height: `${height}px` }}>
        <div className={`progress-bar-fill ${fillClass}`} style={{ width: `${cleanPct}%` }} />
      </div>
    </div>
  );
};

export const EmptyState = ({ icon: Icon, title, message, actionLabel, onAction }) => {
  return (
    <div className="empty-state">
      {Icon && (
        <div className="empty-state-icon">
          <Icon size={44} />
        </div>
      )}
      <h3 className="empty-state-title">{title}</h3>
      <p style={{ maxWidth: '420px', margin: '0 auto 1.25rem', fontSize: '0.9rem' }}>{message}</p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn btn-primary btn-sm">
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export const Modal = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ fontSize: '1.15rem', fontWeight: '700' }}>{title}</h3>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '1.25rem',
              cursor: 'pointer',
              lineHeight: 1
            }}
          >
            &times;
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
};
