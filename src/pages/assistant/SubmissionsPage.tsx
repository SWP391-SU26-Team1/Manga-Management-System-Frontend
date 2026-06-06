import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { CheckSquare, Clock, AlertTriangle, CheckCircle2, MessageSquare, Eye, X } from 'lucide-react'
import { assistantStore, AssistantSubmission } from '@/data/assistantMockData'

export default function SubmissionsPage() {
  const navigate = useNavigate()
  const [submissions, setSubmissions] = useState<AssistantSubmission[]>([])
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Approved' | 'Need Fix'>('All')
  const [zoomedImage, setZoomedImage] = useState<string | null>(null)

  useEffect(() => {
    setSubmissions(assistantStore.getSubmissions())
  }, [])

  const filteredSubs = submissions.filter((sub) => {
    if (filter === 'All') return true
    return sub.status === filter
  })

  const getStatusStyle = (status: AssistantSubmission['status']) => {
    switch (status) {
      case 'Pending':
        return {
          bg: 'bg-yellow-50 border-yellow-400 text-yellow-800',
          badge: 'bg-yellow-500 text-white',
          icon: <Clock className="w-4 h-4" />,
          label: 'Chờ duyệt',
        }
      case 'Approved':
        return {
          bg: 'bg-green-50 border-green-400 text-green-800',
          badge: 'bg-green-600 text-white',
          icon: <CheckCircle2 className="w-4 h-4" />,
          label: 'Đã duyệt',
        }
      case 'Need Fix':
        return {
          bg: 'bg-red-50 border-red-400 text-red-800',
          badge: 'bg-red-600 text-white',
          icon: <AlertTriangle className="w-4 h-4" />,
          label: 'Yêu cầu sửa lại',
        }
    }
  }

  return (
    <div className="max-w-6xl mx-auto pb-16">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-xs font-extrabold text-[#E63946] hover:text-black transition-colors uppercase mb-3 bg-transparent border-0 p-0 cursor-pointer"
      >
        &larr; Quay lại
      </button>

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="font-manga text-4xl font-bold uppercase text-manga-ink leading-none">BẢN VẼ ĐÃ NỘP</h1>
        <div className="h-1.5 w-24 bg-manga-red mt-3" />
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 border-b-2 border-manga-ink pb-3">
        {[
          { key: 'All', label: 'Tất cả bản vẽ' },
          { key: 'Pending', label: 'Đang chờ duyệt' },
          { key: 'Need Fix', label: 'Yêu cầu sửa lại' },
          { key: 'Approved', label: 'Đã được thông qua' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`px-4 py-2 font-manga text-sm uppercase tracking-wider transition-all manga-border ${filter === tab.key
                ? 'bg-manga-ink text-white font-bold'
                : 'bg-white text-manga-ink hover:bg-gray-100'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Submissions Grid */}
      {filteredSubs.length === 0 ? (
        <div className="bg-white border-4 border-manga-ink p-16 text-center manga-shadow-sm">
          <CheckSquare className="w-16 h-16 text-gray-300 mx-auto mb-3" />
          <h3 className="font-manga text-2xl font-bold uppercase text-gray-500">Chưa nộp bản vẽ nào</h3>
          <p className="text-gray-400 font-sans mt-1 text-sm">Hãy vào trang Nhiệm vụ để bắt đầu nộp các bản vẽ phác thảo của bạn.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubs.map((sub) => {
            const statusConfig = getStatusStyle(sub.status)
            return (
              <div
                key={sub.id}
                className="bg-white border-4 border-manga-ink flex flex-col justify-between manga-shadow-sm hover:translate-y-[-4px] hover:manga-shadow transition-all group overflow-hidden"
              >
                {/* Polaroid-style preview block */}
                <div className="relative border-b-4 border-manga-ink bg-gray-50 h-52 flex items-center justify-center overflow-hidden">
                  <img
                    src={sub.previewUrl}
                    alt={sub.fileName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-manga-ink/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => setZoomedImage(sub.previewUrl)}
                      className="bg-white text-manga-ink p-3 rounded-full hover:bg-manga-red hover:text-white transition-colors manga-shadow-sm"
                      title="Xem phóng to"
                    >
                      <Eye className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Status Overlay Badge */}
                  <span className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-1 uppercase tracking-wider flex items-center gap-1 border-2 border-manga-ink ${statusConfig.badge} shadow`}>
                    {statusConfig.icon} {statusConfig.label}
                  </span>
                </div>

                {/* Details Container */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Header info */}
                    <div className="mb-2">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                        Manga series
                      </span>
                      <h4 className="font-manga text-xl font-bold text-manga-ink uppercase leading-tight line-clamp-1">
                        {sub.seriesTitle}
                      </h4>
                      <div className="flex gap-2 mt-1">
                        <span className="bg-gray-100 text-manga-ink text-[9px] font-bold px-1.5 py-0.5 border border-manga-ink rounded">
                          Chương {sub.chapterNumber}
                        </span>
                        <span className="bg-gray-100 text-manga-ink text-[9px] font-bold px-1.5 py-0.5 border border-manga-ink rounded">
                          Trang {sub.pageNumber}
                        </span>
                        <span className="bg-manga-red/10 text-manga-red text-[9px] font-bold px-1.5 py-0.5 border border-manga-red rounded">
                          {sub.layerType}
                        </span>
                      </div>
                    </div>

                    {/* Submission Metadata */}
                    <div className="text-xs text-gray-500 font-bold mb-3">
                      Gửi ngày: {sub.submittedAt}
                    </div>

                    {/* Submission note */}
                    <div className="bg-gray-50 p-2.5 border border-gray-200 text-xs text-gray-600 rounded font-sans mb-3 min-h-[44px]">
                      <strong className="text-manga-ink font-bold block mb-0.5">Lời nhắn nộp bài:</strong>
                      &ldquo;{sub.note || 'Không có ghi chú'}&rdquo;
                    </div>

                    {/* Feedback block */}
                    {sub.feedback && (
                      <div className={`p-2.5 border-l-4 text-xs font-sans rounded ${sub.status === 'Approved'
                          ? 'bg-green-50 border-green-500 text-green-800'
                          : 'bg-red-50 border-red-500 text-red-800'
                        }`}>
                        <div className="flex items-center gap-1 font-bold mb-0.5">
                          <MessageSquare className="w-3.5 h-3.5" /> Ý kiến Mangaka:
                        </div>
                        <p className="italic">&ldquo;{sub.feedback}&rdquo;</p>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-100 pt-3 mt-4 text-[10px] font-bold text-gray-400 truncate">
                    Tên file: {sub.fileName}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Image Zoom Modal */}
      {zoomedImage && (
        <div className="fixed inset-0 bg-manga-ink/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <button
            onClick={() => setZoomedImage(null)}
            className="absolute top-6 right-6 text-white hover:text-manga-red transition-colors"
          >
            <X className="w-8 h-8" />
          </button>
          <div className="max-w-4xl max-h-[85vh] overflow-hidden border-4 border-white">
            <img src={zoomedImage} alt="Zoomed view" className="max-w-full max-h-[85vh] object-contain" />
          </div>
        </div>
      )}
    </div>
  )
}

