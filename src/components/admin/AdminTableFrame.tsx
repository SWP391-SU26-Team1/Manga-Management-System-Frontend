import React from 'react'

interface AdminTableFrameProps {
  children: React.ReactNode
  className?: string
}

export function AdminTableFrame({ children, className = '' }: AdminTableFrameProps) {
  return (
    <div className={`bg-white border-2 border-manga-ink shadow-[6px_6px_0px_rgba(0,0,0,1)] overflow-hidden ${className}`}>
      {children}
    </div>
  )
}
