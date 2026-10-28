import React from 'react';

export const Skeleton = ({
  className = '',
  variant = 'rectangular',
  width,
  height,
  lines = 1,
}) => {
  const base = 'bg-slate-200 animate-shimmer rounded';

  if (variant === 'circular') {
    return (
      <div
        className={`${base} rounded-full ${className}`}
        style={{ width: width || 40, height: height || 40 }}
        aria-hidden="true"
      />
    );
  }

  if (lines > 1) {
    return (
      <div className={`space-y-2.5 ${className}`} aria-hidden="true">
        {Array.from({ length: lines }).map((_, idx) => (
          <div
            key={idx}
            className={`${base} h-4 ${idx === lines - 1 ? 'w-4/5' : 'w-full'}`}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${base} ${className}`}
      style={{
        width: width !== undefined ? width : '100%',
        height: height !== undefined ? height : '1rem',
      }}
      aria-hidden="true"
    />
  );
};

export const CardSkeleton = () => (
  <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-card">
    <div className="flex items-center justify-between">
      <Skeleton className="h-5 w-1/3" />
      <Skeleton variant="circular" width={28} height={28} />
    </div>
    <Skeleton lines={3} />
    <div className="pt-2 flex justify-between">
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-8 w-24 rounded-lg" />
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5, cols = 4 }) => (
  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-card p-4 space-y-3">
    <div className="grid grid-cols-4 gap-4 pb-3 border-b border-slate-100">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-3/4" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, r) => (
      <div key={r} className="grid grid-cols-4 gap-4 py-2 border-b border-slate-50 last:border-0">
        {Array.from({ length: cols }).map((_, c) => (
          <Skeleton key={c} className="h-4 w-full" />
        ))}
      </div>
    ))}
  </div>
);

export default Skeleton;
