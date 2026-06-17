import React from 'react'
import { Bell, HelpCircle, Search } from 'lucide-react'
import { useLocation } from 'react-router'

const labelByPath: Record<string, string> = {
  '/dashboard/admin': 'Dashboard',
  '/dashboard/admin/users': 'Users',
  '/dashboard/admin/series': 'Series',
  '/dashboard/admin/chapters': 'Chapters',
  '/dashboard/admin/pages': 'Pages',
  '/dashboard/admin/tasks': 'Tasks',
  '/dashboard/admin/review-sessions': 'Review Sessions',
  '/dashboard/admin/votes': 'Votes',
  '/dashboard/admin/rankings': 'Rankings',
  '/dashboard/admin/notifications': 'Notifications',
  '/dashboard/admin/settings': 'Settings',
}

export default function AdminHeader() {
  const location = useLocation()
  const currentLabel = labelByPath[location.pathname] || 'Admin'

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b-2 border-manga-ink bg-white px-8">
      <div className="flex items-center gap-3 text-sm font-black uppercase tracking-widest">
        <span className="text-gray-500">MangaFlow</span>
        <span className="text-gray-400">›</span>
        <span className="text-manga-red">{currentLabel}</span>
      </div>

      <div className="flex items-center gap-5">
        <label className="relative hidden w-[360px] items-center lg:flex">
          <Search className="pointer-events-none absolute left-4 h-5 w-5 text-manga-ink" />
          <input
            type="search"
            placeholder="Search admin workspace..."
            className="h-12 w-full border-2 border-manga-ink bg-white pl-12 pr-4 text-sm font-bold outline-none focus:shadow-[4px_4px_0_rgba(0,0,0,1)]"
          />
        </label>

        <button className="relative flex h-12 w-12 items-center justify-center border-2 border-manga-ink bg-white">
          <Bell className="h-5 w-5" />
          <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center border-2 border-manga-ink bg-manga-red text-[10px] font-black text-white">
            5
          </span>
        </button>

        <button className="hidden h-12 w-12 items-center justify-center border-2 border-manga-ink bg-white lg:flex">
          <HelpCircle className="h-5 w-5" />
        </button>

        <div className="h-10 w-px bg-manga-ink" />

        <div className="flex items-center gap-3">
          <div className="hidden text-right md:block">
            <p className="text-sm font-black uppercase leading-none">Nguyen M. Khoi</p>
            <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-gray-500">Admin Access</p>
          </div>
          <img
            src="https://i.pravatar.cc/80?u=mangaflow-admin"
            alt="Admin profile"
            className="h-11 w-11 border-2 border-manga-ink object-cover"
          />
        </div>
      </div>
    </header>
  )
}
