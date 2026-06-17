import React from 'react'
import { CheckCircle2, Edit3, Eye, Layers3, Plus, ShieldOff, XCircle } from 'lucide-react'
import { AdminButton } from '@/components/admin/AdminButton'
import { AdminFilters } from '@/components/admin/AdminFilters'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPagination } from '@/components/admin/AdminPagination'
import { AdminStatCard } from '@/components/admin/AdminStatCard'
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge'
import { AdminTableFrame } from '@/components/admin/AdminTableFrame'
import { adminSeries } from '@/data/adminMockData'

const splitGenres = (genre?: string | null) => {
  return genre ? genre.split(',').map((item) => item.trim()) : []
}

export default function AdminSeriesPage() {
  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Danh sách series"
        description="Quản lý và kiểm duyệt kho lưu trữ truyện tranh hệ thống."
        action={<AdminButton icon={Plus}>Thêm series mới</AdminButton>}
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label="Tổng series" value="1,248" helper="Mục lưu trữ đã xác thực" trend="+12%" icon={Layers3} accent="green" />
        <AdminStatCard label="Chờ duyệt" value="24" helper="Hàng chờ kiểm duyệt khẩn cấp" trend="Khẩn cấp" icon={XCircle} />
        <AdminStatCard label="Đã xuất bản" value="1,180" helper="Danh mục công khai đã duyệt" icon={CheckCircle2} accent="green" />
        <AdminStatCard label="Đã khóa" value="44" helper="Series bị hạn chế" icon={ShieldOff} accent="red" />
      </div>

      <AdminTableFrame>
        <div className="flex flex-col gap-4 border-b-2 border-manga-ink p-6 lg:flex-row lg:items-center lg:justify-between">
          <AdminFilters tabs={['Tất cả (1248)', 'Chờ duyệt (24)', 'Đã duyệt (1180)', 'Bị khóa (44)']} />
          <button className="border-2 border-manga-ink bg-white px-5 py-3 text-sm font-black shadow-[3px_3px_0_rgba(0,0,0,1)]">
            Sắp xếp theo: Mới nhất
          </button>
        </div>
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-gray-100 text-xs font-black uppercase">
              <th className="border-b-2 border-r-2 border-manga-ink px-8 py-5">Bìa</th>
              <th className="border-b-2 border-r-2 border-manga-ink px-7 py-5">Tên series</th>
              <th className="border-b-2 border-r-2 border-manga-ink px-7 py-5">Thể loại</th>
              <th className="border-b-2 border-r-2 border-manga-ink px-7 py-5 text-center">Số chương</th>
              <th className="border-b-2 border-r-2 border-manga-ink px-7 py-5 text-center">Thành viên</th>
              <th className="border-b-2 border-r-2 border-manga-ink px-7 py-5 text-center">Trạng thái</th>
              <th className="border-b-2 border-manga-ink px-7 py-5 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {adminSeries.map((series, index) => (
              <tr key={series.series_id} className="border-b-2 border-manga-ink last:border-b-0">
                <td className="border-r-2 border-manga-ink px-8 py-5">
                  <img src={series.cover_image_url || undefined} alt={series.title} className="h-20 w-16 border-2 border-manga-ink object-cover" />
                </td>
                <td className="border-r-2 border-manga-ink px-7 py-5">
                  <p className="font-black">{series.title}</p>
                  <p className="text-xs font-black uppercase text-gray-500">ID: #{series.series_id}</p>
                </td>
                <td className="border-r-2 border-manga-ink px-7 py-5">
                  <div className="flex flex-wrap gap-2">
                    {splitGenres(series.genre).map((genre) => (
                      <span key={genre} className="border border-manga-ink bg-gray-100 px-3 py-1 text-xs font-black uppercase">
                        {genre}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="border-r-2 border-manga-ink px-7 py-5 text-center font-manga text-2xl font-black">{index === 0 ? 142 : index === 1 ? 24 : index === 2 ? 88 : 51}</td>
                <td className="border-r-2 border-manga-ink px-7 py-5 text-center font-manga text-2xl font-black">{series.view_count?.toLocaleString()}</td>
                <td className="border-r-2 border-manga-ink px-7 py-5 text-center"><AdminStatusBadge status={series.status} /></td>
                <td className="px-7 py-5">
                  <div className="flex justify-end gap-3">
                    <button className="flex h-11 w-11 items-center justify-center border-2 border-manga-ink bg-[#282828] text-white shadow-[3px_3px_0_rgba(0,0,0,1)]"><Eye className="h-5 w-5" /></button>
                    {series.status === 'pending_review' && <button className="border-2 border-manga-ink bg-manga-red px-4 text-xs font-black uppercase text-white shadow-[3px_3px_0_rgba(0,0,0,1)]">Duyệt</button>}
                    <button className="flex h-11 w-11 items-center justify-center border-2 border-manga-ink bg-white"><Edit3 className="h-5 w-5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex flex-col gap-4 border-t-2 border-manga-ink px-8 py-6 md:flex-row md:items-center md:justify-between">
          <p className="text-sm font-black">Hiển thị 1 - 4 trong tổng số 1,248 series</p>
          <AdminPagination />
        </div>
      </AdminTableFrame>
    </div>
  )
}
