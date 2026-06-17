import React from 'react'
import { CalendarDays, Download, Edit3, Eye, MoreVertical, PlusCircle, Upload, Zap } from 'lucide-react'
import { AdminButton } from '@/components/admin/AdminButton'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPagination } from '@/components/admin/AdminPagination'
import { AdminStatCard } from '@/components/admin/AdminStatCard'
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge'
import { AdminTableFrame } from '@/components/admin/AdminTableFrame'
import { adminChapters } from '@/data/adminMockData'

const formatDate = (date?: string | null) => {
  if (!date) return 'Unscheduled'
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
}

export default function AdminChaptersPage() {
  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Chapter Management"
        description="Organize, publish, and track progress of your serializations."
        action={<AdminButton icon={Upload} variant="dark">Upload Chapter</AdminButton>}
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label="Total Chapters" value="1,248" helper="+12 this week" icon={PlusCircle} />
        <AdminStatCard label="Published" value="1,182" helper="Catalog-ready releases" icon={Zap} accent="green" />
        <AdminStatCard label="In Review" value="24" helper="Priority: 8 high" accent="purple" />
        <AdminStatCard label="Drafts" value="42" helper="5 pending over 48h" accent="gray" />
      </div>

      <AdminTableFrame>
        <div className="flex flex-col gap-4 border-b-2 border-manga-ink p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-4">
            <button className="border-2 border-manga-ink bg-white px-6 py-3 text-sm font-black uppercase">All Series</button>
            <button className="border-2 border-manga-ink bg-white px-6 py-3 text-sm font-black uppercase">All Status</button>
          </div>
          <div className="flex flex-wrap gap-6 text-xs font-black uppercase tracking-widest">
            <button>Sort: Newest</button>
            <button className="flex items-center gap-2"><Download className="h-4 w-4" /> Export CSV</button>
          </div>
        </div>

        <table className="w-full border-collapse text-left">
          <thead className="bg-[#282828] text-white">
            <tr className="text-xs font-black uppercase tracking-widest">
              <th className="px-8 py-5">Thumb</th>
              <th className="px-7 py-5">Series & Chapter Details</th>
              <th className="px-7 py-5">Upload Date</th>
              <th className="px-7 py-5">Status</th>
              <th className="px-7 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {adminChapters.map((chapter) => (
              <tr key={chapter.chapter_id} className="border-b-2 border-manga-ink last:border-b-0">
                <td className="px-8 py-6">
                  <img src={chapter.thumbnail_image_url || undefined} alt={chapter.title || chapter.chapter_id} className="h-20 w-16 border-2 border-manga-ink object-cover grayscale" />
                </td>
                <td className="px-7 py-6">
                  <p className="font-black uppercase">{chapter.series_id.replace(/-/g, ' ')}</p>
                  <p className="text-sm font-bold text-gray-500">Ch {chapter.chapter_number}: {chapter.title}</p>
                </td>
                <td className="px-7 py-6">
                  <span className="inline-flex items-center gap-2 font-black uppercase">
                    <CalendarDays className="h-4 w-4" />
                    {formatDate(chapter.publish_date)}
                  </span>
                </td>
                <td className="px-7 py-6"><AdminStatusBadge status={chapter.status} /></td>
                <td className="px-7 py-6">
                  <div className="flex justify-end gap-3">
                    {chapter.status === 'pending_review' ? (
                      <button className="border-2 border-manga-ink bg-manga-red px-6 py-3 text-xs font-black uppercase text-white shadow-[3px_3px_0_rgba(0,0,0,1)]">
                        Approve
                      </button>
                    ) : (
                      <>
                        <button className="flex h-11 w-11 items-center justify-center border-2 border-manga-ink bg-white"><Eye className="h-5 w-5" /></button>
                        <button className="flex h-11 w-11 items-center justify-center border-2 border-manga-ink bg-white"><Edit3 className="h-5 w-5" /></button>
                      </>
                    )}
                    <button className="flex h-11 w-11 items-center justify-center border-2 border-manga-ink bg-white"><MoreVertical className="h-5 w-5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex flex-col gap-4 border-t-2 border-manga-ink px-8 py-6 md:flex-row md:items-center md:justify-between">
          <p className="text-sm font-black uppercase">Showing 1-4 of 1,248 chapters</p>
          <AdminPagination />
        </div>
      </AdminTableFrame>

      <div className="fixed bottom-8 right-8 z-50 hidden border-2 border-manga-ink bg-white p-6 shadow-[6px_6px_0_rgba(0,0,0,1)] xl:block">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center border-2 border-manga-ink bg-manga-red text-white">
            <Zap className="h-7 w-7" />
          </div>
          <div>
            <p className="font-black uppercase">Action Successful</p>
            <p className="text-sm font-semibold text-gray-600">Chapter was updated in the system.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
