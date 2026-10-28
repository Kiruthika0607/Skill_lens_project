import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

export const Pagination = ({
  currentPage = 0,
  totalPages = 1,
  totalElements = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  className = '',
}) => {
  if (totalPages <= 1 && totalElements <= pageSize) return null;

  const startItem = totalElements === 0 ? 0 : currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalElements);

  // Generate page numbers
  const pages = [];
  const maxVisiblePages = 5;
  let startPage = Math.max(0, currentPage - 2);
  let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(0, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-3 border-t border-slate-100 ${className}`}>
      <div className="text-xs text-slate-500">
        Showing <span className="font-semibold text-slate-700">{startItem}</span> to{' '}
        <span className="font-semibold text-slate-700">{endItem}</span> of{' '}
        <span className="font-semibold text-slate-700">{totalElements}</span> results
      </div>

      <div className="flex items-center gap-2">
        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 mr-2">
            <span className="text-xs text-slate-500">Show:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}

        <Button
          variant="secondary"
          size="sm"
          disabled={currentPage <= 0}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Previous page"
          className="px-2"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <div className="hidden sm:flex items-center gap-1">
          {startPage > 0 && (
            <>
              <button
                onClick={() => onPageChange(0)}
                className="w-8 h-8 text-xs font-medium rounded-lg text-slate-600 hover:bg-slate-100"
              >
                1
              </button>
              {startPage > 1 && <span className="text-xs text-slate-400 px-1">...</span>}
            </>
          )}

          {pages.map((p) => (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-8 h-8 text-xs font-medium rounded-lg transition-colors ${
                p === currentPage
                  ? 'bg-navy-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              aria-current={p === currentPage ? 'page' : undefined}
            >
              {p + 1}
            </button>
          ))}

          {endPage < totalPages - 1 && (
            <>
              {endPage < totalPages - 2 && <span className="text-xs text-slate-400 px-1">...</span>}
              <button
                onClick={() => onPageChange(totalPages - 1)}
                className="w-8 h-8 text-xs font-medium rounded-lg text-slate-600 hover:bg-slate-100"
              >
                {totalPages}
              </button>
            </>
          )}
        </div>

        <Button
          variant="secondary"
          size="sm"
          disabled={currentPage >= totalPages - 1}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Next page"
          className="px-2"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
