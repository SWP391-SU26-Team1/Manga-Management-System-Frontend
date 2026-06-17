import React, { useEffect, useState } from 'react'
import { Link } from 'react-router'
import {
  BookOpen,
  Clock,
  Layers,
  ClipboardList,
  CheckSquare,
  Sparkles,
  Loader2,
} from 'lucide-react'
import { ProjectProgress } from '@/components/mangaka/ProjectProgress'
import { ManuscriptManager } from '@/components/mangaka/ManuscriptManager'
import { TeamList } from '@/components/mangaka/TeamList'
import { InteractionStats } from '@/components/mangaka/InteractionStats'
import { seriesService, SeriesAPI } from '@/services/series.service'
import { chapterService, ChapterAPI } from '@/services/chapter.service'
import { taskService } from '@/services/task.service'

export default function MangakaDashboardPage() {
  const [user, setUser] = useState<{ fullName: string } | null>(null)
  const [loading, setLoading] = useState(true)

  // Stats state
  const [stats, setStats] = useState({
    activeSeriesCount: 0,
    drawingChaptersCount: 0,
    pendingSubmissionsCount: 0,
    assignedTasksCount: 0,
    nearestDeadline: 'N/A',
  })

  // Data for child components
  const [seriesList, setSeriesList] = useState<SeriesAPI[]>([])
  const [allChapters, setAllChapters] = useState<ChapterAPI[]>([])

  useEffect(() => {
    // Load user from localStorage
    const stored = localStorage.getItem('mangaflow_user')
    if (stored) {
      const parsed = JSON.parse(stored)
      setUser({ fullName: parsed.fullName || parsed.username || 'Mangaka' })
    }

    const fetchDashboard = async () => {
      setLoading(true)
      try {
        // 1. Fetch all series
        const series = await seriesService.getAll()
        setSeriesList(series)

        const activeSeries = series.filter(
          (s) => s.status === 'ongoing' || s.status === 'draft' || s.status === 'in_progress'
        )

        // 2. Fetch chapters for all series (parallel)
        const chapterResults = await Promise.allSettled(
          series.map((s) => chapterService.getBySeriesId(s._id))
        )
        const chapters: ChapterAPI[] = chapterResults.flatMap((r) =>
          r.status === 'fulfilled' ? r.value : []
        )
        setAllChapters(chapters)

        // 3. Count drawing chapters (pending/in_progress)
        const drawingChapters = chapters.filter(
          (c) => c.status === 'in_progress' || c.status === 'draft' || c.status === 'pending'
        )

        // 4. Find nearest deadline — chapters that have deadline-like updated_at
        let nearestDeadline = 'N/A'
        const withDeadline = chapters
          .filter((c) => c.status !== 'completed' && c.updated_at)
          .map((c) => c.updated_at!)
          .sort()
        if (withDeadline.length > 0) {
          const d = new Date(withDeadline[0])
          nearestDeadline = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
        }

        // 5. Fetch tasks for assigned task count
        let assignedTaskCount = 0
        let pendingSubsCount = 0
        try {
          const tasks = await taskService.getAllTasks({ limit: 200 })
          assignedTaskCount = tasks.filter(
            (t: any) => t.status === 'assigned' || t.status === 'in_progress' || t.status === 'pending'
          ).length
          pendingSubsCount = tasks.filter(
            (t: any) => t.status === 'submitted' || t.status === 'pending_review'
          ).length
        } catch {
          // task API may fail if no data
        }

        setStats({
          activeSeriesCount: activeSeries.length,
          drawingChaptersCount: drawingChapters.length,
          pendingSubmissionsCount: pendingSubsCount,
          assignedTasksCount: assignedTaskCount,
          nearestDeadline,
        })
      } catch (err) {
        console.error('Dashboard fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  const displayName = user?.fullName?.toUpperCase() || 'MANGAKA'

  return (
    <div className="max-w-6xl mx-auto pb-12">
      {/* Hero Banner */}
      <div className="bg-[#fcf5f5] border-4 border-manga-ink p-8 mb-8 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between manga-shadow">
        <div className="absolute top-0 right-0 w-64 h-full bg-manga-red/5 skew-x-12 translate-x-20 pointer-events-none" />

        <div className="relative z-10 mb-6 md:mb-0">
          <div className="inline-block bg-manga-ink text-white font-manga font-bold tracking-wider px-4 py-1 text-xs uppercase -rotate-2 mb-4">
            Bảng điều khiển tác giả
          </div>
          <h1 className="font-manga text-4xl md:text-5xl font-bold uppercase text-manga-ink leading-none mb-3">
            CHÀO MỪNG,<br />
            <span className="text-manga-red flex items-center gap-2 mt-1">
              {displayName} <Sparkles className="w-8 h-8 inline" />
            </span>
          </h1>
          <p className="text-base font-bold text-gray-700">
            Hãy sáng tạo ra những phân cảnh bùng nổ và trang bản thảo ấn tượng hôm nay!
          </p>
        </div>

        {/* Circular Badge — nearest deadline */}
        <div className="relative z-10 w-36 h-36 bg-white rounded-full flex flex-col items-center justify-center manga-shadow border-4 border-manga-ink rotate-6 hover:rotate-0 transition-transform flex-shrink-0">
          <Clock className="w-5 h-5 text-manga-red mb-1" />
          <p className="font-manga font-bold text-lg text-manga-ink text-center uppercase leading-none">
            Hạn chót<br />
            <span className="text-manga-red text-xl block mt-1">
              {loading ? '...' : stats.nearestDeadline}
            </span>
          </p>
          <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-gray-200 rotate-45 border-r-2 border-b-2 border-transparent" />
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {loading ? (
          <div className="col-span-4 flex justify-center py-6">
            <Loader2 className="w-8 h-8 animate-spin text-manga-red" />
          </div>
        ) : (
          [
            { label: 'Series đang vẽ', value: stats.activeSeriesCount, icon: BookOpen, href: '/dashboard/mangaka/series' },
            { label: 'Bản thảo đang vẽ', value: stats.drawingChaptersCount, icon: Layers, href: '/dashboard/mangaka/series' },
            { label: 'Submission chờ duyệt', value: stats.pendingSubmissionsCount, icon: CheckSquare, href: '/dashboard/mangaka/submission', alert: stats.pendingSubmissionsCount > 0 },
            { label: 'Task đã giao', value: stats.assignedTasksCount, icon: ClipboardList, href: '/dashboard/mangaka/assign-task' },
          ].map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.label}
                to={item.href}
                className={`bg-white border-2 border-manga-ink p-4 flex items-center justify-between manga-shadow-sm hover:translate-y-[-2px] hover:manga-shadow transition-all ${
                  item.alert ? 'border-manga-red bg-red-50/10' : ''
                }`}
              >
                <div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">{item.label}</span>
                  <span className={`font-manga text-3xl font-bold ${item.alert ? 'text-manga-red' : 'text-manga-ink'}`}>
                    {item.value}
                  </span>
                </div>
                <div className={`p-2 border-2 border-manga-ink ${item.alert ? 'bg-manga-red text-white' : 'bg-gray-100 text-manga-ink'}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </Link>
            )
          })
        )}
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Larger) */}
        <div className="lg:col-span-2 flex flex-col">
          <ProjectProgress seriesList={seriesList} allChapters={allChapters} />
          <ManuscriptManager seriesList={seriesList} allChapters={allChapters} />
        </div>

        {/* Right Column (Smaller) */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <TeamList />
          <InteractionStats seriesList={seriesList} />
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 pt-8 border-t-2 border-manga-ink flex flex-col md:flex-row items-center justify-between gap-4 text-sm font-bold text-gray-500">
        <div className="font-manga text-2xl text-manga-red">MangaFlow</div>
        <div>© 2026 MangaFlow System. Gangan Press Co. Ltd. All rights reserved.</div>
        <div className="flex items-center gap-6">
          
          <a href="#" className="hover:text-manga-red transition-colors">Quy tắc xuất bản</a>
          <a href="#" className="hover:text-manga-red transition-colors">Hỗ trợ Mangaka</a>
        </div>
      </footer>
    </div>
  )
}
