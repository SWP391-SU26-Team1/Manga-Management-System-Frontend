import React, { useState, useEffect } from 'react'
import { CheckSquare, Filter, Clock, CheckCircle2, AlertCircle, Eye } from 'lucide-react'
import { assistantStore, AssistantSubmission } from '@/data/assistantMockData'

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<AssistantSubmission[]>([])

  useEffect(() => {
    setSubmissions(assistantStore.getSubmissions())
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

  return (
    <div className="max-w-6xl mx-auto pb-16">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="font-manga text-4xl font-bold uppercase text-manga-ink leading-none">BẢN VẼ ĐÃ NỘP</h1>
          <div className="h-1.5 w-24 bg-manga-red mt-3" />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border-2 border-manga-ink bg-white font-bold text-sm hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" /> Lọc
          </button>
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
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button className="bg-white text-manga-ink px-4 py-2 font-bold uppercase text-xs flex items-center gap-2 hover:bg-manga-red hover:text-white transition-colors border-2 border-manga-ink">
                    <Eye className="w-4 h-4" /> Xem chi tiết
                  </button>
                </div>
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
