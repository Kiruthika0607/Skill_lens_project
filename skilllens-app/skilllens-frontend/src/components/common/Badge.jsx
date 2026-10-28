import React from 'react';

/**
 * Accessible status badge: every status uses an explicit text label and icon/dot.
 * Never relies on color alone.
 */
export const Badge = ({
  status,
  label,
  variant,
  size = 'md',
  className = ''
}) => {
  const norm = (status || label || variant || '').toString().toUpperCase();

  let styles = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotColor = 'bg-slate-400';
  let displayLabel = label || status || 'UNKNOWN';

  switch (norm) {
    case 'VERIFIED':
    case 'ACTIVE':
    case 'COMPLETED':
    case 'OFFERED':
    case 'EXPERT':
    case 'SUCCESS':
      styles = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      dotColor = 'bg-emerald-500';
      break;

    case 'IN_PROGRESS':
    case 'APPLIED':
    case 'INTERVIEWING':
    case 'ADVANCED':
    case 'INTERMEDIATE':
      styles = 'bg-blue-50 text-blue-800 border-blue-200';
      dotColor = 'bg-blue-500';
      break;

    case 'PENDING':
    case 'SAVED':
    case 'PARSING':
    case 'BEGINNER':
    case 'WARNING':
      styles = 'bg-amber-50 text-amber-800 border-amber-200';
      dotColor = 'bg-amber-500';
      break;

    case 'EXPIRED':
    case 'REJECTED':
    case 'FAILED':
    case 'NOT_STARTED':
    case 'ERROR':
      styles = 'bg-rose-50 text-rose-800 border-rose-200';
      dotColor = 'bg-rose-500';
      break;

    case 'SAMPLE':
    case 'DEMO':
    case 'DEMO DATA':
      styles = 'bg-purple-50 text-purple-800 border-purple-200';
      dotColor = 'bg-purple-500';
      break;

    case 'NOT_ASSESSED':
      styles = 'bg-slate-100 text-slate-600 border-slate-300 border-dashed';
      dotColor = 'bg-slate-400';
      displayLabel = 'NOT ASSESSED';
      break;

    default:
      styles = 'bg-slate-100 text-slate-700 border-slate-200';
      dotColor = 'bg-slate-400';
  }

  const sizeClasses = size === 'sm'
    ? 'text-xs px-2 py-0.5'
    : 'text-xs px-2.5 py-1 font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${styles} ${sizeClasses} ${className}`}
      role="status"
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} aria-hidden="true" />
      <span>{displayLabel}</span>
    </span>
  );
};

export default Badge;
