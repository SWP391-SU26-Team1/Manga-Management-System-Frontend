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
  if (!date) return 'Chưa lên lịch'
  return new Date(date).toLocaleDateString('vi-VN', { month: 'short', day: '2-digit', year: 'numeric' })
}

export default function AdminChaptersPage() {
  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Quản lý chương"
        description="Tổ chức, xuất bản và theo dõi tiến độ các chương truyện."
        action={<AdminButton icon={Upload} variant="dark">Tải chương lên</AdminButton>}
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label="Tổng chương" value="1,248" helper="+12 trong tuần này" icon={PlusCircle} />
        <AdminStatCard label="Đã xuất bản" value="1,182" helper="Sẵn sàng hiển thị trong kho truyện" icon={Zap} accent="green" />
        <AdminStatCard label="Đang duyệt" value="24" helper="Ưu tiên cao: 8" accent="purple" />
        <AdminStatCard label="Bản nháp" value="42" helper="5 mục chờ hơn 48 giờ" accent="gray" />
      </div>

      <AdminTableFrame>
        <div className="flex flex-col gap-4 border-b-2 border-manga-ink p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-4">
            <button className="border-2 border-manga-ink bg-white px-6 py-3 text-sm font-black uppercase">Tất cả series</button>
            <button className="border-2 border-manga-ink bg-white px-6 py-3 text-sm font-black uppercase">Tất cả trạng thái</button>
          </div>
          <div className="flex flex-wrap gap-6 text-xs font-black uppercase tracking-widest">
            <button>Sắp xếp: Mới nhất</button>
            <button className="flex items-center gap-2"><Download className="h-4 w-4" /> Xuất CSV</button>
          </div>
        </div>

        <table className="w-full border-collapse text-left">
          <thead className="bg-[#282828] text-white">
            <tr className="text-xs font-black uppercase tracking-widest">
              <th className="px-8 py-5">Ảnh</th>
              <th className="px-7 py-5">Thông tin series & chương</th>
              <th className="px-7 py-5">Ngày tải lên</th>
              <th className="px-7 py-5">Trạng thái</th>
              <th className="px-7 py-5 text-right">Thao tác</th>
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
                  <p className="text-sm font-bold text-gray-500">Chương {chapter.chapter_number}: {chapter.title}</p>
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
                        Duyệt
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
          <p className="text-sm font-black uppercase">Hiển thị 1-4 trong tổng số 1,248 chương</p>
          <AdminPagination />
        </div>
      </AdminTableFrame>

      <div className="fixed bottom-8 right-8 z-50 hidden border-2 border-manga-ink bg-white p-6 shadow-[6px_6px_0_rgba(0,0,0,1)] xl:block">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center border-2 border-manga-ink bg-manga-red text-white">
            <Zap className="h-7 w-7" />
          </div>
          <div>
            <p className="font-black uppercase">Thao tác thành công</p>
            <p className="text-sm font-semibold text-gray-600">Chương đã được cập nhật trong hệ thống.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
