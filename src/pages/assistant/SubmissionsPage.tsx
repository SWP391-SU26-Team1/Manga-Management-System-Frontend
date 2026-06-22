import React, { useState, useEffect } from 'react'
import { CheckSquare, Filter, Clock, CheckCircle2, AlertCircle, Eye, Loader2 } from 'lucide-react'
import assistantService from '@/services/assistant.service'

interface AssistantSubmission {
  id: string
  taskId: string
  seriesTitle: string
  chapterNumber: number
  pageNumber: number
  layerType: string
  submittedAt: string
  previewUrl: string
  fileName: string
  note: string
  status: 'Pending' | 'Approved' | 'Need Fix'
  feedback?: string
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<AssistantSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const getImageUrl = (url?: string | null) => {
    if (!url) return 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=600&auto=format&fit=crop'
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url
    const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
    return `${apiURL}${url.startsWith('/') ? '' : '/'}${url}`
  }

  const getTaskTypeName = (type: string) => {
    const maps: Record<string, string> = {
      inking: 'Character Lineart',
      coloring: 'Coloring',
      lettering: 'Lettering',
      cleaning: 'Cleaning',
      sfx: 'SFX Design',
      background: 'Background',
    }
    return maps[type] || type.toUpperCase()
  }

  const loadSubmissions = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const tasksRes = await assistantService.listMyTasks({ limit: 100 })
      const tasksList = tasksRes.data || []
      
      const submittedTasks = tasksList.filter((t: any) => 
        ['submitted', 'completed', 'needs_revision', 'rejected'].includes(t.status)
      )

      const fetchedSubs: AssistantSubmission[] = []

      await Promise.all(
        submittedTasks.map(async (t: any) => {
          try {
            const subs = await assistantService.listTaskSubmissions(t.task_id)
            await Promise.all(
              subs.map(async (s: any) => {
                let feedbackText = ''
                if (
                  s.submission_status === 'needs_revision' ||
                  s.submission_status === 'rejected' ||
                  s.submission_status === 'approved'
                ) {
                  try {
                    const feedbacks = await assistantService.listSubmissionFeedbacks(s.submission_id)
                    if (feedbacks && feedbacks.length > 0) {
                      const sortedFeedbacks = [...feedbacks].sort(
                        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                      )
                      feedbackText = sortedFeedbacks[0].content || sortedFeedbacks[0].feedback_content || ''
                    }
                  } catch (e) {
                    console.error('Failed to load feedback for submission', s.submission_id, e)
                  }
                }

                let displayStatus: 'Pending' | 'Approved' | 'Need Fix' = 'Pending'
                if (s.submission_status === 'approved') displayStatus = 'Approved'
                else if (
                  s.submission_status === 'needs_revision' ||
                  s.submission_status === 'rejected'
                ) {
                  displayStatus = 'Need Fix'
                }

                fetchedSubs.push({
                  id: s.submission_id,
                  taskId: t.task_id,
                  seriesTitle: t.page?.chapter?.series?.title || 'Nhiệm vụ lẻ',
                  chapterNumber: t.page?.chapter?.chapter_number || 1,
                  pageNumber: t.page?.page_number || 1,
                  layerType: getTaskTypeName(t.task_type),
                  submittedAt: new Date(s.submitted_at || s.created_at).toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  }),
                  previewUrl: getImageUrl(s.file_url),
                  fileName: `task_${t.task_id.slice(0, 8)}.psd`,
                  note: s.submission_notes || '',
                  status: displayStatus,
                  feedback: feedbackText || undefined,
                })
              })
            )
          } catch (e) {
            console.error('Failed to load submissions for task', t.task_id, e)
          }
        })
      )

      // Sort globally by date
      fetchedSubs.sort((a, b) => {
        // Simple fallback parsing for date sorting
        const dateA = new Date(a.submittedAt.split(' ')[0].split('/').reverse().join('-'))
        const dateB = new Date(b.submittedAt.split(' ')[0].split('/').reverse().join('-'))
        return dateB.getTime() - dateA.getTime()
      })

      setSubmissions(fetchedSubs)
    } catch (err) {
      console.error(err)
      setError('Không thể tải danh sách bản vẽ đã nộp từ backend.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSubmissions()
  }, [])

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      case 'Approved': return 'bg-green-100 text-green-700 border-green-300'
      case 'Need Fix': return 'bg-red-100 text-red-700 border-red-300'
      default: return 'bg-gray-100 text-gray-600 border-gray-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'Pending': return <Clock className="w-4 h-4" />
      case 'Approved': return <CheckCircle2 className="w-4 h-4" />
      case 'Need Fix': return <AlertCircle className="w-4 h-4" />
      default: return null
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto pb-16 text-center pt-12">
        <div className="inline-block bg-white border-4 border-manga-ink p-8 manga-shadow-sm">
          <Loader2 className="w-10 h-10 text-manga-red animate-spin mx-auto mb-4" />
          <h2 className="font-manga text-xl font-bold uppercase">Đang tải bản vẽ đã nộp...</h2>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto pb-16 text-center pt-12">
        <div className="inline-block bg-white border-4 border-manga-red p-8 manga-shadow-sm">
          <AlertCircle className="w-10 h-10 text-manga-red mx-auto mb-4" />
          <h2 className="font-manga text-xl font-bold uppercase text-manga-red">Lỗi tải dữ liệu</h2>
          <p className="text-xs font-bold text-gray-700 mt-2">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto pb-16">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="font-manga text-4xl font-bold uppercase text-manga-ink leading-none">BẢN VẼ ĐÃ NỘP</h1>
          <div className="h-1.5 w-24 bg-manga-red mt-3" />
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="bg-white border-4 border-manga-ink p-12 text-center manga-shadow-sm">
          <CheckSquare className="w-16 h-16 text-gray-300 mx-auto mb-3" />
          <h3 className="font-manga text-2xl font-bold uppercase text-gray-500">Chưa có bản vẽ nào được nộp</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {submissions.map((sub) => (
            <div key={sub.id} className="bg-white border-2 border-manga-ink flex flex-col manga-shadow-sm hover:manga-shadow transition-shadow group relative overflow-hidden">
              <div className="relative aspect-video bg-gray-100 border-b-2 border-manga-ink overflow-hidden">
                <img src={sub.previewUrl} alt={sub.fileName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-white border-2 border-manga-ink shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  {getStatusIcon(sub.status)}
                  <span className={sub.status === 'Approved' ? 'text-green-600' : sub.status === 'Need Fix' ? 'text-red-600' : 'text-yellow-600'}>
                    {sub.status}
                  </span>
                </div>
              </div>
              
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="text-sm font-bold text-manga-ink mb-1 truncate" title={sub.fileName}>{sub.fileName}</h3>
                <p className="text-xs text-gray-500 font-medium mb-3">
                  {sub.seriesTitle} - Ch.{sub.chapterNumber} P.{sub.pageNumber} ({sub.layerType})
                </p>
                <div className="mt-auto">
                  <p className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-1.5">
                    <Clock className="w-3 h-3" /> Nộp lúc: {sub.submittedAt}
                  </p>
                </div>
                {sub.feedback && (
                  <div className={`mt-3 p-2 border-l-4 text-xs font-medium italic ${sub.status === 'Approved' ? 'border-green-500 bg-green-50 text-green-800' : 'border-red-500 bg-red-50 text-red-800'}`}>
                    "{sub.feedback}"
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
