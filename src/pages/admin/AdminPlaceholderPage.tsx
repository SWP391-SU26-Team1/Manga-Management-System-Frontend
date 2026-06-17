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
          Các công cụ vận hành đang được chuẩn bị cho dữ liệu thật và quy trình phê duyệt.
        </p>
        <Link to="/dashboard/admin" className="mt-4 inline-block font-black uppercase text-manga-red underline decoration-2 underline-offset-4">
          Quay lại tổng quan
        </Link>
      </div>
    </div>
  )
}
