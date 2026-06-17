import React from 'react'
import { Construction } from 'lucide-react'

interface AdminEmptyStateProps {
  title: string
  description: string
}

export function AdminEmptyState({ title, description }: AdminEmptyStateProps) {
  return (
    <div className="bg-white border-2 border-manga-ink p-10 shadow-[6px_6px_0px_rgba(0,0,0,1)]">
      <Construction className="w-10 h-10 text-manga-red mb-4" />
      <h1 className="font-manga text-4xl font-black uppercase text-manga-ink">
        {title}
      </h1>
      <p className="mt-3 max-w-2xl text-sm font-bold text-gray-500">
        {description}
      </p>
    </div>
  )
}
