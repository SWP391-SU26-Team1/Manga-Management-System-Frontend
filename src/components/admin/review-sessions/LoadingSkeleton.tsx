import React from 'react'

type LoadingSkeletonProps = {
  rows?: number
}

export function LoadingSkeleton({ rows = 6 }: LoadingSkeletonProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="grid gap-4 border-b border-slate-100 p-5 last:border-b-0 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="space-y-3">
            <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
          </div>
          <div className="h-4 animate-pulse rounded bg-slate-100" />
          <div className="h-7 w-24 animate-pulse rounded-full bg-slate-100" />
          <div className="h-9 animate-pulse rounded bg-slate-100" />
        </div>
      ))}
    </div>
  )
}
