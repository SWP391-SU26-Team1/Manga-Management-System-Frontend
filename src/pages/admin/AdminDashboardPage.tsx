import React from 'react'
import { ArrowRight, ClipboardList, FileStack, Layers3, PlusCircle, Users } from 'lucide-react'
import { Link } from 'react-router'
import { AdminButton } from '@/components/admin/AdminButton'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminStatCard } from '@/components/admin/AdminStatCard'
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge'
import { AdminTableFrame } from '@/components/admin/AdminTableFrame'
import {
  adminActivityLogs,
  adminOverview,
  adminReviewSessions,
  adminTaskStats,
} from '@/data/adminMockData'

const formatCompact = (value: number) => {
  return value >= 1000 ? `${(value / 1000).toFixed(value >= 10000 ? 1 : 0)}k` : value.toLocaleString()
}

export default function AdminDashboardPage() {
  const productionTasks = adminTaskStats.by_status.assigned + adminTaskStats.by_status.in_progress
  const totalDistribution = adminTaskStats.by_status.pending + productionTasks + adminTaskStats.overdue

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="System Overview Admin Pro"
        description="Saturday, May 16, 2026 - Real-time synchronization active."
        action={<AdminButton icon={PlusCircle}>New Project</AdminButton>}
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label="Total Users" value={adminOverview.total_users.toLocaleString()} helper="Active readers & creators" trend="+8.2%" icon={Users} accent="red" />
        <AdminStatCard label="Total Series" value={adminOverview.total_series.toLocaleString()} helper="Verified manga franchises" trend="+12" icon={Layers3} accent="red" />
        <AdminStatCard label="Chapters/Pages" value={formatCompact(adminOverview.total_pages)} helper="High-res assets stored" trend="Stable" icon={FileStack} accent="gray" />
        <AdminStatCard label="Current Tasks" value={adminOverview.total_tasks} helper="Across 14 active projects" trend="28 urgent" icon={ClipboardList} dark />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <AdminTableFrame className="p-7">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
              <h2 className="font-manga text-3xl font-black uppercase">Task Distribution</h2>
              <div className="flex flex-wrap items-center gap-5 text-xs font-black uppercase">
                <span className="flex items-center gap-2"><span className="h-3 w-3 border border-manga-ink bg-[#282828]" /> Pending</span>
                <span className="flex items-center gap-2"><span className="h-3 w-3 border border-manga-ink bg-white" /> In Progress</span>
                <span className="flex items-center gap-2"><span className="h-3 w-3 border border-manga-ink bg-manga-red" /> Overdue</span>
              </div>
            </div>

            <div className="flex h-14 overflow-hidden border-2 border-manga-ink">
              <div className="bg-[#282828]" style={{ width: `${(adminTaskStats.by_status.pending / totalDistribution) * 100}%` }} />
              <div className="bg-white" style={{ width: `${(productionTasks / totalDistribution) * 100}%` }} />
              <div className="bg-manga-red" style={{ width: `${(adminTaskStats.overdue / totalDistribution) * 100}%` }} />
            </div>

            <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
              <div className="border-l-4 border-manga-ink pl-5">
                <p className="font-manga text-5xl font-black leading-none">{adminTaskStats.by_status.pending}</p>
                <p className="text-xs font-black uppercase">Queue Pending</p>
              </div>
              <div className="border-l-4 border-manga-ink pl-5">
                <p className="font-manga text-5xl font-black leading-none">{productionTasks}</p>
                <p className="text-xs font-black uppercase">Production Phase</p>
              </div>
              <div className="border-l-4 border-manga-red pl-5">
                <p className="font-manga text-5xl font-black leading-none">{adminTaskStats.overdue}</p>
                <p className="text-xs font-black uppercase">Exceeded Deadline</p>
              </div>
            </div>
          </AdminTableFrame>

          <AdminTableFrame>
            <div className="flex items-center justify-between bg-[#282828] px-7 py-5 text-white">
              <h2 className="text-sm font-black uppercase">Latest Review Sessions</h2>
              <Link to="/dashboard/admin/review-sessions" className="flex items-center gap-1 text-sm font-black uppercase text-manga-red">
                View All Sessions <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b-2 border-manga-ink text-xs font-black uppercase">
                  <th className="px-7 py-4">Title / Project</th>
                  <th className="px-5 py-4">Type</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {adminReviewSessions.map((session) => (
                  <tr key={session.session_id} className="border-b border-gray-200 last:border-b-0">
                    <td className="px-7 py-5">
                      <p className="font-black">{session.name}</p>
                      <p className="text-xs font-black uppercase text-gray-400">{session.description}</p>
                    </td>
                    <td className="px-5 py-5">
                      <span className="border-2 border-manga-ink px-3 py-1 text-xs font-black uppercase">
                        {session.description?.split(' ')[0] || 'Review'}
                      </span>
                    </td>
                    <td className="px-5 py-5"><AdminStatusBadge status={session.status} /></td>
                    <td className="px-5 py-5 text-right">
                      <Link to="/dashboard/admin/review-sessions" className="font-black uppercase text-manga-red">Open</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AdminTableFrame>
        </div>

        <AdminTableFrame>
          <div className="bg-[#282828] px-7 py-5 text-white">
            <h2 className="text-sm font-black uppercase">Recent Activity</h2>
          </div>
          <div className="space-y-8 p-7">
            {adminActivityLogs.map((log, index) => (
              <div key={log.log_id} className="relative border-l-2 border-manga-ink pl-8">
                <span className={`absolute -left-[9px] top-1 h-4 w-4 border-2 border-manga-ink ${index === 1 ? 'bg-manga-red' : index === 2 ? 'bg-[#282828]' : 'bg-white'}`} />
                <p className="text-xs font-black uppercase text-manga-red">{index === 0 ? '2 minutes ago' : index === 1 ? '14 minutes ago' : index === 2 ? '1 hour ago' : '3 hours ago'}</p>
                <h3 className="mt-2 font-black uppercase">{log.action}</h3>
                <p className="mt-2 text-sm font-semibold leading-relaxed text-gray-600">{log.description}</p>
              </div>
            ))}
          </div>
          <div className="border-t-2 border-manga-ink p-5">
            <button className="w-full border-2 border-manga-ink bg-white py-3 text-xs font-black uppercase tracking-widest">
              Load More Events
            </button>
          </div>
        </AdminTableFrame>
      </div>

      <div className="relative overflow-hidden border-2 border-manga-ink bg-[#3b1016] p-10 text-center text-white shadow-[6px_6px_0_rgba(0,0,0,1)]">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url('/images/hero.png')", backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="relative z-10">
          <h2 className="font-manga text-4xl font-black italic uppercase underline decoration-manga-red decoration-4 underline-offset-4">
            Redefining Digital Manga Distribution
          </h2>
          <p className="mx-auto mt-5 max-w-3xl bg-black/75 px-5 py-3 text-base font-black">
            MangaFlow Pro Assistant v2.0 utilizes neural-assisted QC and automated asset management to reduce production cycles.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-5">
            <AdminButton variant="dark">Documentation</AdminButton>
            <AdminButton>System Health</AdminButton>
          </div>
        </div>
      </div>
    </div>
  )
}
