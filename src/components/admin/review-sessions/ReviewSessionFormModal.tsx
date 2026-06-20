import React, { FormEvent, useEffect, useMemo, useState } from 'react'
import { Check, Loader2, Save, Search, X } from 'lucide-react'
import type { ReviewSession } from '@/services/admin/admin.types'
import { reviewSessionApi } from '@/services/admin/reviewSessionApi'
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
  'h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100'
const labelClass = 'mb-2 block text-sm font-semibold text-slate-700'

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
          return !chapterSeriesId || chapterSeriesId === values.series_id
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-2xl ring-1 ring-slate-200">
        <div className="flex items-start justify-between border-b border-slate-200 p-6">
          <div>
            <p className="text-sm font-semibold text-blue-600">Review Session</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-950">
              {isCreate ? 'Create review session' : `Edit ${session ? getSessionName(session) : 'review session'}`}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-5 p-6">
          <label>
            <span className={labelClass}>Session name</span>
            <input
              value={values.name}
              onChange={(event) => onChange('name', event.target.value)}
              className={inputClass}
              placeholder="Review Chapter 1"
              required
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="relative">
              <span className={labelClass}>Series</span>
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
                  placeholder="Search and select a series"
                  disabled={!isCreate}
                  required={isCreate}
                />
                {seriesLoading && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" />}
              </div>
              {isCreate && seriesOpen && (
                <div className="absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-md border border-slate-200 bg-white shadow-xl">
                  {seriesOptions.length === 0 ? (
                    <p className="px-3 py-3 text-sm text-slate-500">No series found</p>
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
                          className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <span>
                            <span className="font-semibold text-slate-900">{series.title}</span>
                            {series.status && <span className="ml-2 text-xs capitalize text-slate-500">{series.status.replace(/_/g, ' ')}</span>}
                            {!selectable && <span className="ml-2 text-xs text-red-500">Cannot select</span>}
                          </span>
                          {selected && <Check className="h-4 w-4 text-blue-600" />}
                        </button>
                      )
                    })
                  )}
                </div>
              )}
            </div>

            <div className="relative">
              <span className={labelClass}>Chapter</span>
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
                  placeholder={values.series_id ? 'Search chapter in selected series' : 'Select a series first'}
                  disabled={!isCreate || !values.series_id}
                />
                {chapterLoading && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" />}
              </div>
              {isCreate && chapterOpen && (
                <div className="absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-md border border-slate-200 bg-white shadow-xl">
                  {!values.series_id && (
                    <p className="px-3 py-3 text-sm text-slate-500">Select a series before choosing chapter</p>
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
                    className="w-full px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    No chapter attached
                  </button>
                  {chapterOptions.length === 0 ? (
                    <p className="border-t border-slate-100 px-3 py-3 text-sm text-slate-500">No chapters found</p>
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
                          className="flex w-full items-center justify-between gap-3 border-t border-slate-100 px-3 py-2 text-left text-sm hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <span>
                            <span className="font-semibold text-slate-900">{label}</span>
                            {chapter.status && <span className="ml-2 text-xs capitalize text-slate-500">{chapter.status.replace(/_/g, ' ')}</span>}
                            {!selectable && <span className="ml-2 text-xs text-red-500">Cannot select</span>}
                          </span>
                          {selected && <Check className="h-4 w-4 text-blue-600" />}
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

          <label>
            <span className={labelClass}>Description</span>
            <textarea
              value={values.description}
              onChange={(event) => onChange('description', event.target.value)}
              className={`${inputClass} min-h-28 py-3`}
              placeholder="Review scope, notes, or expected outcome"
            />
          </label>

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {loading ? 'Saving...' : isCreate ? 'Create session' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
