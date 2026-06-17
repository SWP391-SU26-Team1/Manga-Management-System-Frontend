import React from 'react'

interface AdminPageHeaderProps {
  title: string
  description: string
  action?: React.ReactNode
  eyebrow?: string
}

export function AdminPageHeader({ title, description, action, eyebrow }: AdminPageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
      <div>
        {eyebrow && (
          <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-manga-red">
            {eyebrow}
          </p>
        )}
        <h1 className="font-manga text-4xl md:text-5xl font-black uppercase leading-none tracking-normal text-manga-ink">
          {title}
        </h1>
        <p className="mt-3 max-w-3xl text-base font-bold text-gray-600">
          {description}
        </p>
      </div>
      {action}
    </div>
  )
}
