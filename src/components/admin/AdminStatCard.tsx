import React from 'react'
import type { LucideIcon } from 'lucide-react'

interface AdminStatCardProps {
  label: string
  value: string | number
  helper?: string
  trend?: string
  icon?: LucideIcon
  dark?: boolean
  accent?: 'red' | 'green' | 'purple' | 'gray'
}

const accentClasses = {
  red: 'text-manga-red',
  green: 'text-emerald-600',
  purple: 'text-purple-500',
  gray: 'text-gray-500',
}

export function AdminStatCard({
  label,
  value,
  helper,
  trend,
  icon: Icon,
  dark = false,
  accent = 'red',
}: AdminStatCardProps) {
  return (
    <div className={`${dark ? 'bg-[#262626] text-white' : 'bg-white text-manga-ink'} border-2 border-manga-ink p-6 shadow-[6px_6px_0px_rgba(0,0,0,1)] min-h-[150px] flex flex-col justify-between`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={`text-xs font-black uppercase tracking-widest ${dark ? 'text-gray-400' : 'text-gray-700'}`}>
            {label}
          </p>
          <div className="mt-5 flex items-end gap-3">
            <span className="font-manga text-5xl font-black leading-none tracking-normal">
              {value}
            </span>
            {trend && <span className={`mb-1 text-xs font-black uppercase ${accentClasses[accent]}`}>{trend}</span>}
          </div>
        </div>
        {Icon && <Icon className={`w-7 h-7 ${accentClasses[accent]}`} />}
      </div>
      {helper && (
        <p className={`mt-4 text-xs font-black uppercase tracking-tight ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
          {helper}
        </p>
      )}
    </div>
  )
}
