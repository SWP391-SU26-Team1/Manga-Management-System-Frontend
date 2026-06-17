import React from 'react'

interface AdminFiltersProps {
  tabs: string[]
  activeTab?: string
}

export function AdminFilters({ tabs, activeTab }: AdminFiltersProps) {
  const selectedTab = activeTab || tabs[0]

  return (
    <div className="flex flex-wrap gap-3">
      {tabs.map((tab) => (
        <button
          key={tab}
          className={`border-2 border-manga-ink px-5 py-3 text-xs font-black uppercase ${tab === selectedTab ? 'bg-manga-red text-white shadow-[3px_3px_0px_rgba(0,0,0,1)]' : 'bg-white text-manga-ink'}`}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}
