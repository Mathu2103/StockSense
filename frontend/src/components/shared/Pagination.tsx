export interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  itemName?: string;
  className?: string;
}

export default function Pagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  itemName = 'items',
  className = '',
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  if (totalItems === 0) return null;

  const startItem = Math.min((currentPage - 1) * pageSize + 1, totalItems);
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate visible page numbers (sliding window with ellipsis)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 bg-surface-container-lowest border-t border-outline-variant/60 text-xs text-on-surface-variant select-none ${className}`}
    >
      {/* Range Info & Page Size Selector */}
      <div className="flex flex-wrap items-center gap-3">
        <span>
          Showing <strong className="text-on-surface font-black">{startItem}–{endItem}</strong> of{' '}
          <strong className="text-on-surface font-black">{totalItems}</strong> {itemName}
        </span>

        {onPageSizeChange && pageSizeOptions.length > 1 && (
          <div className="flex items-center gap-1.5 pl-2 border-l border-outline-variant/60">
            <span className="text-[11px] text-outline">Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="bg-background border border-outline-variant rounded-md px-2 py-1 text-xs font-bold text-on-surface outline-none focus:border-primary cursor-pointer"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-1 self-end sm:self-auto">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-bold transition-all ${
            currentPage <= 1
              ? 'text-outline-variant cursor-not-allowed opacity-50'
              : 'text-on-surface hover:bg-slate-100 active:scale-95'
          }`}
          aria-label="Previous page"
        >
          <span className="material-symbols-outlined text-[16px]">chevron_left</span>
          <span className="hidden xs:inline text-[11px]">Prev</span>
        </button>

        {/* Page pills */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, idx) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${idx}`} className="px-1.5 py-1 text-outline">
                  ...
                </span>
              );
            }

            const isCurrent = page === currentPage;
            return (
              <button
                key={`page-${page}`}
                type="button"
                onClick={() => onPageChange(page as number)}
                className={`min-w-[28px] h-7 rounded-lg text-xs font-black transition-all flex items-center justify-center ${
                  isCurrent
                    ? 'bg-[#0b8252] text-white shadow-sm'
                    : 'text-on-surface hover:bg-slate-100'
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-bold transition-all ${
            currentPage >= totalPages
              ? 'text-outline-variant cursor-not-allowed opacity-50'
              : 'text-on-surface hover:bg-slate-100 active:scale-95'
          }`}
          aria-label="Next page"
        >
          <span className="hidden xs:inline text-[11px]">Next</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        </button>
      </div>
    </div>
  );
}
