import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import { FileText, ArrowRight, User, Calendar, Tag, CheckCircle, Clock } from 'lucide-react'
import { boardService } from '@/services/board.service'

export default function ProposalsListPage() {
  const navigate = useNavigate()
  const [proposals, setProposals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const res = await boardService.getProposals(1, 50)
        let data = res?.data || res
        if (!Array.isArray(data)) data = []
        setProposals(data)
      } catch (err) {
        console.error('Failed to load proposals', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProposals()
  }, [])

  return (
    <div className="max-w-6xl mx-auto pb-12 font-sans">
      <div className="mb-8">
        <h1 className="font-manga text-4xl md:text-5xl font-black uppercase tracking-tight text-manga-ink flex items-center gap-3">
          <FileText className="w-10 h-10 text-manga-red" />
          HỘP THƯ CÔNG VIỆC (PROPOSALS)
        </h1>
        <p className="text-sm font-bold text-gray-500 uppercase mt-2">
          Danh sách các bản thảo / tác phẩm đang chờ Hội đồng biên tập xét duyệt
        </p>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center border-4 border-manga-ink bg-white shadow-[8px_8px_0px_rgba(0,0,0,1)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-manga-red"></div>
        </div>
      ) : proposals.length === 0 ? (
        <div className="text-center py-16 border-4 border-manga-ink bg-white shadow-[8px_8px_0px_rgba(0,0,0,1)]">
          <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h3 className="text-xl font-black uppercase text-gray-400">Không có công việc nào cần xử lý</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {proposals.map(proposal => {
            const isSeries = !proposal.chapter_id
            const title = proposal.series?.title || 'Unknown Title'
            const targetUrl = isSeries 
              ? `/dashboard/editorial-board/series-approval/${proposal.series_id}?sessionId=${proposal.session_id}`
              : `/dashboard/editorial-board/review/${proposal.chapter_id}/draft?sessionId=${proposal.session_id}`

            return (
              <div 
                key={proposal.session_id || proposal.id}
                className="bg-white border-4 border-manga-ink p-6 shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-y-1 transition-all flex flex-col"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase px-2 py-1 border-2 border-manga-ink text-white ${isSeries ? 'bg-manga-red' : 'bg-manga-ink'}`}>
                      {isSeries ? 'DUYỆT SERIES' : 'DUYỆT CHAPTER'}
                    </span>
                    <span className="text-[10px] font-black uppercase px-2 py-1 bg-yellow-100 text-yellow-700 border-2 border-yellow-500">
                      {proposal.status || 'PENDING'}
                    </span>
                  </div>
                  <time className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(proposal.created_at).toLocaleDateString()}
                  </time>
                </div>

                <h3 className="font-manga text-xl font-bold uppercase text-manga-ink line-clamp-2 mb-4 flex-1">
                  {title} {proposal.chapter_id && `- Chapter ${proposal.chapter?.chapter_number || ''}`}
                </h3>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-600 uppercase">
                    <User className="w-4 h-4" />
                    <span>Tác giả: <span className="text-manga-ink">{proposal.series?.author || 'N/A'}</span></span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-600 uppercase">
                    <Tag className="w-4 h-4" />
                    <span>Mã phiên: <span className="text-manga-red">{(proposal.session_id || '').substring(0, 8)}</span></span>
                  </div>
                </div>

                <Link
                  to={targetUrl}
                  className="w-full bg-manga-ink text-white font-manga font-bold text-xs uppercase py-3 border-2 border-manga-ink shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-white hover:text-manga-ink hover:shadow-none transition-all flex items-center justify-center gap-2 text-center"
                >
                  TIẾN HÀNH DUYỆT BẢN THẢO <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
