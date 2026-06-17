import React from 'react'
import { Link, useLocation } from 'react-router'
import { PlusCircle } from 'lucide-react'
import { adminNav } from '@/configs/navigation/adminNav'

const settingsLabel = 'Settings'

export default function AdminSidebar() {
  const location = useLocation()
  const mainItems = adminNav.filter((item) => item.label !== settingsLabel)
  const settingsItem = adminNav.find((item) => item.label === settingsLabel)
  const SettingsIcon = settingsItem?.icon

  const isActive = (path: string, exact?: boolean) => {
    return exact ? location.pathname === path : location.pathname.startsWith(path)
  }

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[300px] flex-col bg-[#282828] text-white shadow-[4px_0_0_rgba(0,0,0,1)]">
      <div className="px-8 py-8">
        <Link to="/dashboard/admin" className="block">
          <h1 className="font-manga text-4xl font-black uppercase tracking-normal text-white drop-shadow-[3px_3px_0_rgba(0,0,0,0.8)]">
            MangaFlow
          </h1>
          <p className="mt-1 text-xs font-black uppercase tracking-[0.28em] text-manga-red">
            Assistant v2.0
          </p>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-5 pb-6">
        <div className="space-y-1">
          {mainItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path, item.exact)

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 border-2 px-5 py-4 text-sm font-black uppercase transition-all ${
                  active
                    ? 'border-manga-ink bg-manga-red text-white shadow-[5px_5px_0_rgba(0,0,0,1)]'
                    : 'border-transparent text-gray-300 hover:border-black hover:bg-[#333] hover:text-white'
                }`}
              >
                {Icon && <Icon className="h-5 w-5 shrink-0" />}
                <span className="leading-none">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      <div className="border-t-2 border-black p-5">
        <Link
          to="/dashboard/admin/series"
          className="mb-5 flex items-center justify-center gap-3 border-2 border-black bg-manga-red px-5 py-4 text-sm font-black uppercase text-white shadow-[5px_5px_0_rgba(0,0,0,1)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[3px_3px_0_rgba(0,0,0,1)]"
        >
          <PlusCircle className="h-5 w-5" />
          New Project
        </Link>

        {settingsItem && (
          <Link
            to={settingsItem.path}
            className={`mb-5 flex items-center gap-4 border-2 px-5 py-4 text-sm font-black uppercase ${
              isActive(settingsItem.path)
                ? 'border-black bg-manga-red text-white shadow-[5px_5px_0_rgba(0,0,0,1)]'
                : 'border-transparent text-gray-300 hover:border-black hover:bg-[#333] hover:text-white'
            }`}
          >
            {SettingsIcon && <SettingsIcon className="h-5 w-5" />}
            <span>{settingsItem.label}</span>
          </Link>
        )}

        <div className="flex items-center gap-3 border border-white/20 bg-white/5 p-3">
          <div className="flex h-10 w-10 items-center justify-center border-2 border-black bg-manga-red text-sm font-black text-white">
            AD
          </div>
          <div>
            <p className="text-sm font-black uppercase leading-none text-white">Admin Portal</p>
            <p className="mt-1 text-xs font-bold text-gray-400">v2.0.4-stable</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
