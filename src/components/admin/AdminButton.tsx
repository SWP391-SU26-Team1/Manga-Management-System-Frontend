import React from 'react'
import type { LucideIcon } from 'lucide-react'

interface AdminButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: LucideIcon
  variant?: 'red' | 'dark' | 'white'
}

export function AdminButton({ icon: Icon, variant = 'red', className = '', children, ...props }: AdminButtonProps) {
  const variantClass =
    variant === 'red'
      ? 'bg-manga-red text-white'
      : variant === 'dark'
      ? 'bg-[#262626] text-white'
      : 'bg-white text-manga-ink'

  return (
    <button
      className={`inline-flex items-center justify-center gap-3 border-2 border-manga-ink px-6 py-3 text-sm font-black uppercase shadow-[5px_5px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[3px_3px_0px_rgba(0,0,0,1)] ${variantClass} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-5 h-5" />}
      {children}
    </button>
  )
}
