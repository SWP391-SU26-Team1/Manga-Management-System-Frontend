import React, { FormEvent, useEffect, useMemo, useState } from 'react'
import { Check, Loader2, Save, Search, X } from 'lucide-react'
import type { ReviewSession } from '@/services/admin/admin.types'
import { reviewSessionApi } from '@/services/admin/reviewSessionApi'
import { AdminButton } from '@/components/admin/AdminButton'
import {
  getChapterLabel,
  getChapterOptionId,
  getChapterOptionLabel,
  getChapterSeriesOptionId,
  getSeriesLabel,
  getSeriesOptionId,
  getSessionName,
} from './helpers'
import type { ChapterOption, ReviewSessionFormValues, SeriesOption } from './types'

type ReviewSessionFormModalProps = {
  open: boolean
  mode: 'create' | 'edit'
  values: ReviewSessionFormValues
  session?: ReviewSession | null
  loading?: boolean
  onChange: (field: keyof ReviewSessionFormValues, value: string) => void
  onClose: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

const inputClass =
  'h-11 w-full border-2 border-manga-ink bg-white px-3 text-sm text-manga-ink font-bold outline-none focus:bg-amber-50 disabled:bg-gray-100 disabled:opacity-70'
const labelClass = 'mb-2 block text-sm font-black uppercase text-manga-ink'

const extractItems = <T,>(payload: T[] | { data?: T[]; items?: T[]; results?: T[] } | undefined): T[] => {
  if (Array.isArray(payload)) return payload
  return payload?.data || payload?.items || payload?.results || []
}

export function ReviewSessionFormModal({
  open,
  mode,
  values,
  session,
  loading = false,
  onChange,
  onClose,
  onSubmit,
}: ReviewSessionFormModalProps) {
  const [seriesOptions, setSeriesOptions] = useState<SeriesOption[]>([])
  const [chapterOptions, setChapterOptions] = useState<ChapterOption[]>([])
  const [seriesLoading, setSeriesLoading] = useState(false)
  const [chapterLoading, setChapterLoading] = useState(false)
  const [seriesOpen, setSeriesOpen] = useState(false)
  const [chapterOpen, setChapterOpen] = useState(false)
  const isCreate = mode === 'create'

  const selectedSeriesName = useMemo(() => {
    if (isCreate) return values.series_query || ''
    return session ? getSeriesLabel(session) : ''
  }, [isCreate, session, values.series_query])

  const selectedChapterName = useMemo(() => {
    if (isCreate) return values.chapter_query || ''
    return session ? getChapterLabel(session) : ''
  }, [isCreate, session, values.chapter_query])

  useEffect(() => {
    if (!open || !isCreate) return

    let active = true
    setSeriesLoading(true)
    const timer = window.setTimeout(async () => {
      try {
        const response = await reviewSessionApi.searchSeries(values.series_query)
        if (active) setSeriesOptions(extractItems<SeriesOption>(response))
      } catch {
        if (active) setSeriesOptions([])
      } finally {
        if (active) setSeriesLoading(false)
      }
    }, 250)

    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [isCreate, open, values.series_query])

  useEffect(() => {
    if (!open || !isCreate) return
    if (!values.series_id) {
      setChapterOptions([])
      return
    }

    let active = true
    setChapterLoading(true)
    const timer = window.setTimeout(async () => {
      try {
        const response = await reviewSessionApi.searchChapters(values.chapter_query, values.series_id)
        const chapters = extractItems<ChapterOption>(response).filter((chapter) => {
          const chapterSeriesId = getChapterSeriesOptionId(chapter)
          const isCorrectSeries = !chapterSeriesId || chapterSeriesId === values.series_id
          const isNotPublished = chapter.status !== 'published'
          return isCorrectSeries && isNotPublished
        })
        if (active) setChapterOptions(chapters)
      } catch {
        if (active) setChapterOptions([])
      } finally {
        if (active) setChapterLoading(false)
      }
    }, 250)

    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [isCreate, open, values.chapter_query, values.series_id])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto border-2 border-manga-ink bg-white shadow-[8px_8px_0_rgba(0,0,0,1)]">
        <div className="flex items-start justify-between border-b-2 border-manga-ink p-6">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-manga-red">Phiên đánh giá</p>
            <h2 className="font-manga text-3xl font-black uppercase text-manga-ink mt-1">
              {isCreate ? 'Tạo phiên đánh giá' : `Chỉnh sửa: ${session ? getSessionName(session) : 'phiên đánh giá'}`}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 shrink-0 items-center justify-center border-2 border-manga-ink bg-white shadow-[2px_2px_0_rgba(0,0,0,1)] hover:bg-gray-100"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-5 p-6">
          <label className="block">
            <span className={labelClass}>Tên phiên đánh giá</span>
            <input
              value={values.name}
              onChange={(event) => onChange('name', event.target.value)}
              className={inputClass}
              placeholder="Ví dụ: Đánh giá Chương 1"
              required
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="relative">
              <span className={labelClass}>Bộ truyện</span>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={selectedSeriesName}
                  onFocus={() => isCreate && setSeriesOpen(true)}
                  onChange={(event) => {
                    onChange('series_query', event.target.value)
                    onChange('series_id', '')
                    onChange('chapter_query', '')
                    onChange('chapter_id', '')
                    setSeriesOpen(true)
                  }}
                  className={`${inputClass} pl-10`}
                  placeholder="Tìm kiếm và chọn bộ truyện"
                  disabled={!isCreate}
                  required={isCreate}
                />
                {seriesLoading && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" />}
              </div>
              {isCreate && seriesOpen && (
                <div className="absolute z-20 mt-2 max-h-64 w-full overflow-y-auto border-2 border-manga-ink bg-white shadow-[4px_4px_0_rgba(0,0,0,1)]">
                  {seriesOptions.length === 0 ? (
                    <p className="px-3 py-3 text-sm font-bold text-slate-500">Không tìm thấy bộ truyện nào</p>
                  ) : (
                    seriesOptions.map((series) => {
                      const seriesId = getSeriesOptionId(series)
                      const selected = values.series_id === seriesId
                      const selectable = Boolean(seriesId)

                      return (
                        <button
                          key={seriesId || series.title}
                          type="button"
                          disabled={!selectable}
                          onClick={() => {
                            if (!selectable) return
                            onChange('series_id', seriesId)
                            onChange('series_query', series.title)
                            onChange('chapter_id', '')
                            onChange('chapter_query', '')
                            setSeriesOpen(false)
                            setChapterOpen(true)
                          }}
                          className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <span className="font-bold">
                            <span className="text-slate-900">{series.title}</span>
                            {series.status && <span className="ml-2 text-xs uppercase text-slate-500">{series.status.replace(/_/g, ' ')}</span>}
                            {!selectable && <span className="ml-2 text-xs text-red-500">(Không thể chọn)</span>}
                          </span>
                          {selected && <Check className="h-4 w-4 text-emerald-600 shrink-0" />}
                        </button>
                      )
                    })
                  )}
                </div>
              )}
            </div>

            <div className="relative">
              <span className={labelClass}>Chương</span>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={selectedChapterName}
                  onFocus={() => isCreate && setChapterOpen(true)}
                  onChange={(event) => {
                    onChange('chapter_query', event.target.value)
                    onChange('chapter_id', '')
                    setChapterOpen(true)
                  }}
                  className={`${inputClass} pl-10`}
                  placeholder={values.series_id ? 'Tìm kiếm chương trong bộ truyện' : 'Vui lòng chọn bộ truyện trước'}
                  disabled={!isCreate || !values.series_id}
                />
                {chapterLoading && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" />}
              </div>
              {isCreate && chapterOpen && (
                <div className="absolute z-20 mt-2 max-h-64 w-full overflow-y-auto border-2 border-manga-ink bg-white shadow-[4px_4px_0_rgba(0,0,0,1)]">
                  {!values.series_id && (
                    <p className="px-3 py-3 text-sm font-bold text-slate-500">Vui lòng chọn bộ truyện trước khi chọn chương</p>
                  )}
                  {values.series_id && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          onChange('chapter_id', '')
                          onChange('chapter_query', '')
                          setChapterOpen(false)
                        }}
                        className="w-full px-3 py-2 text-left text-sm font-black text-slate-700 hover:bg-amber-100"
                      >
                        Không đính kèm chương
                      </button>
                      {chapterOptions.length === 0 ? (
                        <p className="border-t-2 border-manga-ink px-3 py-3 text-sm font-bold text-slate-500">Không tìm thấy chương nào</p>
                      ) : (
                        chapterOptions.map((chapter) => {
                          const chapterId = getChapterOptionId(chapter)
                          const selected = values.chapter_id === chapterId
                          const label = getChapterOptionLabel(chapter)
                          const selectable = Boolean(chapterId)

                          return (
                            <button
                              key={chapterId || label}
                              type="button"
                              disabled={!selectable}
                              onClick={() => {
                                if (!selectable) return
                                onChange('chapter_id', chapterId)
                                onChange('chapter_query', label)
                                setChapterOpen(false)
                              }}
                              className="flex w-full items-center justify-between gap-3 border-t-2 border-manga-ink px-3 py-2 text-left text-sm hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <span className="font-bold">
                                <span className="text-slate-900">{label}</span>
                                {chapter.status && <span className="ml-2 text-xs uppercase text-slate-500">{chapter.status.replace(/_/g, ' ')}</span>}
                                {!selectable && <span className="ml-2 text-xs text-red-500">(Không thể chọn)</span>}
                              </span>
                              {selected && <Check className="h-4 w-4 text-emerald-600 shrink-0" />}
                            </button>
                          )
                        })
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <label className="block">
            <span className={labelClass}>Mô tả</span>
            <textarea
              value={values.description}
              onChange={(event) => onChange('description', event.target.value)}
              className={`${inputClass} min-h-28 py-3`}
              placeholder="Nhập phạm vi đánh giá, ghi chú hoặc kết quả mong đợi..."
            />
          </label>

          <div className="flex justify-end gap-3 border-t-2 border-manga-ink pt-5 bg-gray-50 -mx-6 -mb-6 p-6">
            <AdminButton
              type="button"
              variant="white"
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </AdminButton>
            <AdminButton
              type="submit"
              variant="red"
              icon={Save}
              disabled={loading}
            >
              {loading ? 'Đang lưu...' : isCreate ? 'Tạo phiên' : 'Lưu thay đổi'}
            </AdminButton>
          </div>
        </form>
      </div>
    </div>
  )
}

