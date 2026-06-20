import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface AdminPaginationProps {
  page?: number
  totalPages?: number
  onPageChange?: (page: number) => void
  disabled?: boolean
}

const getVisiblePages = (page: number, totalPages: number) => {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const start = Math.max(1, Math.min(page - 2, totalPages - 4))
  return Array.from({ length: 5 }, (_, index) => start + index)
}

export function AdminPagination({
  page = 1,
  totalPages = 3,
  onPageChange,
  disabled = false,
}: AdminPaginationProps) {
  const safeTotalPages = Math.max(1, totalPages)
  const visiblePages = getVisiblePages(page, safeTotalPages)
  const canGoPrevious = page > 1 && !disabled
  const canGoNext = page < safeTotalPages && !disabled

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={!canGoPrevious}
        onClick={() => canGoPrevious && onPageChange?.(page - 1)}
        className={`w-10 h-10 border-2 flex items-center justify-center bg-white ${canGoPrevious ? 'border-manga-ink text-black' : 'border-gray-300 text-gray-400'}`}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      {visiblePages.map((item) => (
        <button
          key={item}
          type="button"
          disabled={disabled}
          onClick={() => onPageChange?.(item)}
          className={`w-10 h-10 border-2 border-manga-ink font-black ${item === page ? 'bg-manga-red text-white shadow-[3px_3px_0px_rgba(0,0,0,1)]' : 'bg-white text-black'}`}
        >
          {item}
        </button>
      ))}
      <button
        type="button"
        disabled={!canGoNext}
        onClick={() => canGoNext && onPageChange?.(page + 1)}
        className={`w-10 h-10 border-2 flex items-center justify-center bg-white ${canGoNext ? 'border-manga-ink text-black' : 'border-gray-300 text-gray-400'}`}
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  )
}
