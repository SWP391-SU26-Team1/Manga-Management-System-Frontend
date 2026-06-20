import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type PaginationProps = {
  page: number
  totalPages: number
  disabled?: boolean
  onPageChange: (page: number) => void
}

const visiblePages = (page: number, totalPages: number) => {
  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, index) => index + 1)
  const start = Math.max(1, Math.min(page - 2, totalPages - 4))
  return Array.from({ length: 5 }, (_, index) => start + index)
}

export function Pagination({ page, totalPages, disabled = false, onPageChange }: PaginationProps) {
  const safeTotalPages = Math.max(1, totalPages)
  const canPrev = page > 1 && !disabled
  const canNext = page < safeTotalPages && !disabled

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={!canPrev}
        onClick={() => canPrev && onPageChange(page - 1)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {visiblePages(page, safeTotalPages).map((item) => (
        <button
          key={item}
          type="button"
          disabled={disabled}
          onClick={() => onPageChange(item)}
          className={`h-9 min-w-9 rounded-md border px-3 text-sm font-semibold ${
            item === page
              ? 'border-blue-600 bg-blue-600 text-white'
              : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
          } disabled:cursor-not-allowed disabled:opacity-45`}
        >
          {item}
        </button>
      ))}
      <button
        type="button"
        disabled={!canNext}
        onClick={() => canNext && onPageChange(page + 1)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}
