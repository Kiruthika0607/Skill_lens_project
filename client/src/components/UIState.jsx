import React from 'react';
import { AlertCircle, CheckCircle, Info, HelpCircle, XCircle } from 'lucide-react';

export function SkeletonLoader({ count = 3, className = "h-12 w-full" }) {
  return (
    <div className="space-y-3 w-full animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`bg-slate-200/80 rounded-xl ${className}`} />
      ))}
    </div>
  );
}

export function EmptyState({ title = "No items found", description = "There are currently no records to display.", icon: Icon = Info, action }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white border border-slate-200 rounded-2xl shadow-sm">
      <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-700 mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-bold text-slate-800">{title}</h3>
      <p className="text-sm text-slate-500 max-w-md mt-1 mb-5">{description}</p>
      {action}
    </div>
  );
}

export function ErrorState({ title = "Something went wrong", message = "Failed to load data. Please retry.", onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-rose-50/50 border border-rose-200 rounded-2xl">
      <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-rose-900">{title}</h3>
      <p className="text-xs sm:text-sm text-rose-700 max-w-md mt-1 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

export function StatusBadge({ status, label, size = 'sm' }) {
  const norm = (status || label || '').toUpperCase();
  let color = 'bg-slate-100 text-slate-700 border-slate-300';
  let dotColor = 'bg-slate-400';
  let displayText = label || status || 'Unknown';

  if (['VERIFIED', 'COMPLETED', 'APPROVED', 'ACTIVE', 'ADVANCED', 'HIGH'].includes(norm)) {
    color = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    dotColor = 'bg-emerald-500';
  } else if (['PENDING', 'IN_PROGRESS', 'INTERMEDIATE', 'MEDIUM'].includes(norm)) {
    color = 'bg-amber-50 text-amber-800 border-amber-200';
    dotColor = 'bg-amber-500';
  } else if (['EXPIRED', 'REJECTED', 'CRITICAL', 'LOW', 'BEGINNER'].includes(norm)) {
    color = 'bg-rose-50 text-rose-800 border-rose-200';
    dotColor = 'bg-rose-500';
  } else if (['SAMPLE', 'DEMO', 'DRAFT', 'EXPERT'].includes(norm)) {
    color = 'bg-blue-50 text-blue-800 border-blue-200';
    dotColor = 'bg-blue-500';
  }

  const padding = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ${color} ${padding}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{displayText}</span>
    </span>
  );
}

export function ConfirmationDialog({ isOpen, title, message, confirmText = "Confirm", cancelText = "Cancel", onConfirm, onCancel, isDanger = false }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <h4 className="text-lg font-bold text-slate-900 mb-2">{title}</h4>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-semibold text-white rounded-xl transition ${
              isDanger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-brand-800 hover:bg-brand-700'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
