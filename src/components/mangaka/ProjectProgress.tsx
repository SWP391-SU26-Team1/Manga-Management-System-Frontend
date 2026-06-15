import React, { useEffect, useState } from 'react'
import { Edit3, X, Save, Loader2 } from 'lucide-react'
import { SeriesAPI } from '@/services/series.service'
import { ChapterAPI } from '@/services/chapter.service'

interface ProjectProgressProps {
  seriesList?: SeriesAPI[]
  allChapters?: ChapterAPI[]
}

interface DisplayData {
  seriesTitle: string
  chapterTitle: string
  deadline: string
  progressPercent: number
}

const CHAPTER_STATUS_WEIGHT: Record<string, number> = {
  completed: 100,
  in_progress: 50,
  draft: 20,
  pending: 10,
}

export function ProjectProgress({ seriesList = [], allChapters = [] }: ProjectProgressProps) {
  const [data, setData] = useState<DisplayData>({
    seriesTitle: '—',
    chapterTitle: '—',
    deadline: 'N/A',
    progressPercent: 0,
  })
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<DisplayData>(data)
  const [isManualOverride, setIsManualOverride] = useState(false)

  useEffect(() => {
    if (isManualOverride) return // User đã tự chỉnh, không override

    if (seriesList.length === 0) return

    // Lấy series đầu tiên đang active
    const activeSeries =
      seriesList.find((s) => s.status === 'ongoing' || s.status === 'in_progress') ||
      seriesList[0]

    if (!activeSeries) return

    // Lấy các chapter của series đó
    const seriesChapters = allChapters.filter((c) => c.series_id === activeSeries._id)

    // Tìm chapter chưa hoàn thành (đang trong tiến độ)
    const activeChapter =
      seriesChapters.find(
        (c) =>
          c.status === 'in_progress' ||
          c.status === 'draft' ||
          c.status === 'pending'
      ) || seriesChapters[seriesChapters.length - 1]

    // Tính % tiến độ dựa trên trạng thái chapter
    const percent = activeChapter
      ? CHAPTER_STATUS_WEIGHT[activeChapter.status] ?? 15
      : 0

    // Deadline từ updated_at của chapter (tạm thời, vì chưa có deadline field)
    let deadlineStr = 'N/A'
    if (activeChapter?.updated_at) {
      const d = new Date(activeChapter.updated_at)
      deadlineStr = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    }

    const newData: DisplayData = {
      seriesTitle: activeSeries.title,
      chapterTitle: activeChapter
        ? `Hoàn thiện Chương ${activeChapter.chapter_number}: ${activeChapter.title}`
        : 'Chưa có chapter',
      deadline: deadlineStr,
      progressPercent: percent,
    }

    setData(newData)
    setEditForm(newData)
  }, [seriesList, allChapters, isManualOverride])

  const handleEditOpen = () => {
    setEditForm(data)
    setIsEditing(true)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setData(editForm)
    setIsManualOverride(true) // Không override sau khi user tự chỉnh
    setIsEditing(false)
  }

  const isLoading = seriesList.length === 0 && !isManualOverride

  return (
    <div className="bg-white manga-border manga-shadow-sm flex flex-col mb-8">
      {/* Header */}
      <div className="bg-manga-ink text-white p-4 flex justify-between items-center">
        <h2 className="font-manga text-2xl font-bold uppercase tracking-wider">
          Tiến độ dự án hiện tại
        </h2>
        <button
          onClick={handleEditOpen}
          className="text-manga-red hover:text-white transition-colors"
          title="Chỉnh sửa tiến độ"
        >
          <Edit3 className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-manga-red" />
          </div>
        ) : seriesList.length === 0 && !isManualOverride ? (
          <div className="text-center py-8 text-gray-400 font-bold">
            Chưa có series nào. Hãy tạo series đầu tiên!
          </div>
        ) : (
          <>
            <div className="flex justify-between items-end border-b-2 border-manga-ink pb-4 mb-6">
              <div>
                <p className="text-sm font-bold uppercase text-gray-500 tracking-widest mb-1">Series</p>
                <h3 className="font-manga text-3xl font-bold uppercase text-manga-red">
                  {data.seriesTitle}
                </h3>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold uppercase text-gray-500 tracking-widest mb-1">
                  Deadline nộp bản thảo
                </p>
                <p className="font-manga text-2xl font-bold">{data.deadline}</p>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-xl">{data.chapterTitle}</span>
                <span className="font-manga text-3xl font-bold text-manga-red">{data.progressPercent}%</span>
              </div>
              <div className="h-6 w-full bg-gray-100 border-2 border-manga-ink flex">
                <div
                  className="h-full bg-manga-red border-r-2 border-manga-ink transition-all duration-500"
                  style={{ width: `${data.progressPercent}%` }}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-manga-ink manga-shadow max-w-md w-full">
            <div className="p-4 border-b-4 border-manga-ink bg-gray-50 flex justify-between items-center">
              <h2 className="font-manga font-bold text-xl uppercase flex items-center gap-2">
                <Edit3 className="w-6 h-6 text-manga-red" /> Sửa Tiến Độ
              </h2>
              <button onClick={() => setIsEditing(false)} className="hover:text-red-500">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Tên Series</label>
                <input
                  type="text"
                  value={editForm.seriesTitle}
                  onChange={(e) => setEditForm({ ...editForm, seriesTitle: e.target.value })}
                  className="w-full border-2 border-manga-ink p-2 font-bold focus:ring-2 focus:ring-manga-red outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Deadline</label>
                <input
                  type="text"
                  value={editForm.deadline}
                  onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })}
                  className="w-full border-2 border-manga-ink p-2 font-bold focus:ring-2 focus:ring-manga-red outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                  Mức tiến độ ({editForm.progressPercent}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={editForm.progressPercent}
                  onChange={(e) => setEditForm({ ...editForm, progressPercent: parseInt(e.target.value) })}
                  className="w-full accent-manga-red"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-manga-ink text-white font-manga font-bold py-3 border-2 border-manga-ink uppercase hover:bg-gray-800 mt-4 flex justify-center items-center gap-2"
              >
                <Save className="w-4 h-4" /> Lưu thay đổi
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
