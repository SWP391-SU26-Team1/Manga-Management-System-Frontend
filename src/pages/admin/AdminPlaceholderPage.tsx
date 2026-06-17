import React from 'react'
import { Link } from 'react-router'
import { AdminEmptyState } from '@/components/admin/AdminEmptyState'

interface AdminPlaceholderPageProps {
  title: string
  description: string
}

export default function AdminPlaceholderPage({ title, description }: AdminPlaceholderPageProps) {
  return (
    <div className="space-y-6">
      <AdminEmptyState title={title} description={description} />
      <div className="border-2 border-manga-ink bg-white p-6 shadow-[6px_6px_0_rgba(0,0,0,1)]">
        <p className="text-sm font-black uppercase text-gray-500">
          Operational controls are staged for live data and approval workflows.
        </p>
        <Link to="/dashboard/admin" className="mt-4 inline-block font-black uppercase text-manga-red underline decoration-2 underline-offset-4">
          Back to dashboard
        </Link>
      </div>
    </div>
  )
}
