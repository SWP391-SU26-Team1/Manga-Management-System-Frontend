import React, { useState, useEffect } from 'react'
import { MessageSquare, User, AlertCircle, Clock, Loader2 } from 'lucide-react'
import assistantService, { PageTaskFeedback } from '@/services/assistant.service'

interface FeedbackListProps {
  submissionId: string
  initialFeedbacks?: PageTaskFeedback[]
  onFeedbackAdded?: () => void
}

export default function FeedbackList({ submissionId, initialFeedbacks }: FeedbackListProps) {
  const [feedbacks, setFeedbacks] = useState<PageTaskFeedback[]>(initialFeedbacks || [])
  const [isLoading, setIsLoading] = useState<boolean>(!initialFeedbacks)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!initialFeedbacks) {
      loadFeedbacks()
    } else {
      setFeedbacks(initialFeedbacks)
    }
  }, [submissionId, initialFeedbacks])

  const loadFeedbacks = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await assistantService.listSubmissionFeedbacks(submissionId)
      setFeedbacks(data || [])
    } catch (err: any) {
      console.error('Lỗi tải feedback:', err)
      setError('Không thể tải danh sách phản hồi.')
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (timeStr: string) => {
    try {
      const date = new Date(timeStr)
      return date.toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    } catch {
      return timeStr
    }
  }

  return (
    <div className="bg-white border-4 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] w-full flex flex-col h-[500px] font-sans">
      {/* Header */}
      <div className="bg-[#1A1A1A] text-white p-4 border-b-4 border-black flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-manga-red stroke-[2.5]" />
        <h3 className="font-manga font-bold text-sm uppercase tracking-wider">
          Ý KIẾN PHẢN HỒI BẢN VẼ
        </h3>
        <span className="bg-white text-black text-[10px] font-black px-2 py-0.5 rounded-sm uppercase ml-auto">
          {feedbacks.length} BÌNH LUẬN
        </span>
      </div>

      {/* Comment list body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50">
        {isLoading ? (
          <div className="h-full flex items-center justify-center flex-col gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-[#E63946]" />
            <span className="text-xs font-bold text-gray-400 uppercase">Đang tải phản hồi...</span>
          </div>
        ) : error ? (
          <div className="h-full flex items-center justify-center flex-col gap-2 text-[#E63946] p-4 text-center">
            <AlertCircle className="w-8 h-8 stroke-[2.5]" />
            <p className="text-xs font-bold uppercase">{error}</p>
            <button
              onClick={loadFeedbacks}
              className="mt-2 text-xs font-black underline hover:text-black uppercase"
            >
              Thử lại
            </button>
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="h-full flex items-center justify-center flex-col gap-2 text-gray-400 text-center py-12">
            <MessageSquare className="w-12 h-12 stroke-[1.5]" />
            <p className="text-xs font-bold uppercase tracking-wider">Chưa có phản hồi nào trên bản vẽ này</p>
            <p className="text-[10px] font-semibold text-gray-400">Hãy là người đầu tiên thảo luận!</p>
          </div>
        ) : (
          feedbacks.map((item) => {
            const isMe = !item.mangaka_id
            const authorUser = isMe ? (item as any).assistant : (item as any).mangaka
            const authorName = authorUser?.name || authorUser?.username || (isMe ? 'Tôi (Trợ lý)' : 'Họa sĩ / Biên tập viên')
            const initials = authorName.substring(0, 2).toUpperCase()
            const avatarUrl = authorUser?.avatar_url
            
            const getImageUrl = (url?: string | null) => {
              if (!url) return ''
              if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url
              const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
              return `${apiURL}${url.startsWith('/') ? '' : '/'}${url}`
            }

            return (
              <div
                key={item.feedback_id}
                className={`flex flex-col max-w-[85%] ${
                  isMe ? 'ml-auto items-end' : 'mr-auto items-start'
                }`}
              >
                {/* Author tag */}
                <div className="flex items-center gap-1.5 mb-1">
                  {avatarUrl ? (
                    <img
                      src={getImageUrl(avatarUrl)}
                      alt={authorName}
                      className="w-5 h-5 rounded-full object-cover shrink-0 border border-zinc-350"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center text-white text-[9px] font-black uppercase">
                      {initials}
                    </div>
                  )}
                  <span className="text-[10px] font-black uppercase text-black">
                    {authorName}
                  </span>
                  <span className="text-[9px] text-gray-400 font-bold">
                    {formatTime(item.created_at)}
                  </span>
                </div>

                {/* Bubble content */}
                <div
                  className={`border-2 border-black p-3 text-xs leading-relaxed font-medium shadow-[2px_2px_0px_rgba(0,0,0,1)] break-words w-full ${
                    isMe
                      ? 'bg-[#FFEBEB] text-black rounded-tl-xl rounded-tr-sm rounded-br-sm rounded-bl-xl'
                      : 'bg-white text-black rounded-tl-sm rounded-tr-xl rounded-br-xl rounded-bl-sm'
                  }`}
                >
                  {item.content || item.feedback_content}
                </div>
              </div>
            )
          })
        )}
      </div>

    </div>
  )
}
