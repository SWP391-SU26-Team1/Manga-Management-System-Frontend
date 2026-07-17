import React, { useState, useEffect } from 'react'
import { History, Search, ArrowRight, User, CheckCircle, XCircle, AlertCircle, Calendar, Clock, Book } from 'lucide-react'
import { boardService } from '@/services/board.service'

export default function HistoryPage() {
  const [proposals, setProposals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  
  const [sessionDetail, setSessionDetail] = useState<any>(null)
  const [sessionVotes, setSessionVotes] = useState<any[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const res = await boardService.getProposals(1, 100)
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

  const handleSelectSession = async (sessionId: string) => {
    if (activeSessionId === sessionId) {
      setActiveSessionId(null)
      setSessionDetail(null)
      setSessionVotes([])
      return
    }
    setActiveSessionId(sessionId)
    setLoadingHistory(true)
    try {
      const [detail, votes] = await Promise.all([
        boardService.getProposalById(sessionId).catch(() => null),
        boardService.getVote(sessionId).catch(() => [])
      ])
      
      // Lấy thêm thông tin series từ API thật để đảm bảo có ảnh bìa (cover)
      const seriesId = detail?.series_id || detail?.series?.series_id || detail?.series?.id;
      if (seriesId) {
        try {
          const realSeriesDetail = await boardService.getSeriesById(seriesId);
          if (realSeriesDetail) {
            if (!detail.series) detail.series = {};
            detail.series = { ...detail.series, ...realSeriesDetail };
          }
        } catch (e) {
          console.error('Lỗi khi tải series_id', e);
        }
      }

      setSessionDetail(detail)
      setSessionVotes(votes || [])
    } catch (err) {
      console.error('Failed to load history', err)
      setSessionDetail(null)
      setSessionVotes([])
    } finally {
      setLoadingHistory(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto pb-12 font-sans">
      <div className="mb-8">
        <h1 className="font-manga text-4xl md:text-5xl font-black uppercase tracking-tight text-manga-ink flex items-center gap-3">
          <History className="w-10 h-10 text-manga-red" />
          LỊCH SỬ
        </h1>
        <p className="text-sm font-bold text-gray-500 uppercase mt-2">
          Theo dõi tiến trình và lịch sử biểu quyết của tất cả các Phiên duyệt
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Col: List of Sessions */}
        <div className="lg:col-span-1 border-4 border-manga-ink bg-white shadow-[6px_6px_0px_rgba(0,0,0,1)] flex flex-col h-[600px]">
          <div className="p-4 border-b-4 border-manga-ink bg-zinc-50">
            <h3 className="font-manga text-lg font-black uppercase">CHỌN PHIÊN DUYỆT</h3>
            <div className="relative mt-3">
              <input 
                type="text" 
                placeholder="Tìm kiếm mã phiên..."
                className="w-full border-2 border-manga-ink px-3 py-2 text-xs font-bold outline-none focus:border-manga-red"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-zinc-100">
            {loading ? (
              <div className="p-4 text-center text-xs font-bold text-gray-500">Đang tải...</div>
            ) : proposals.length === 0 ? (
              <div className="p-4 text-center text-xs font-bold text-gray-500">Không có dữ liệu</div>
            ) : (
              proposals.map(p => (
                <button
                  key={p.session_id || p.id}
                  onClick={() => handleSelectSession(p.session_id || p.id)}
                  className={`w-full text-left p-3 border-2 transition-colors flex items-center justify-between ${
                    activeSessionId === (p.session_id || p.id)
                      ? 'bg-manga-ink text-white border-manga-ink shadow-sm'
                      : 'bg-white text-manga-ink border-manga-ink hover:bg-gray-50 shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                  }`}
                >
                  <div>
                    <div className="text-[10px] font-black uppercase opacity-80">
                      ID: {(p.session_id || p.id).substring(0, 8)}...
                    </div>
                    <div className="text-xs font-bold truncate pr-2 mt-0.5">
                      {p.chapter_id ? `Review Chapter` : `Review Series`}
                    </div>
                  </div>
                  <ArrowRight className={`w-4 h-4 shrink-0 ${activeSessionId === (p.session_id || p.id) ? 'text-white' : 'text-manga-red'}`} />
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Col: Timeline History */}
        <div className="lg:col-span-2 border-4 border-manga-ink bg-white shadow-[6px_6px_0px_rgba(0,0,0,1)] min-h-[600px] p-6 relative">
          {!activeSessionId ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
              <History className="w-16 h-16 mb-4 opacity-50" />
              <p className="font-manga text-xl font-bold uppercase">CHỌN MỘT PHIÊN ĐỂ XEM LỊCH SỬ</p>
            </div>
          ) : loadingHistory ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-manga-red"></div>
            </div>
          ) : (
            <div>
              <h2 className="font-manga text-2xl font-black uppercase text-manga-ink mb-6 border-b-4 border-manga-ink pb-3 flex justify-between items-end">
                <span>CHI TIẾT PHIÊN DUYỆT</span>
                <span className="text-[10px] bg-manga-red text-white px-2 py-1 font-bold">SESSION ID: {activeSessionId.substring(0, 8)}</span>
              </h2>

              {/* Session Info Section */}
              {sessionDetail && (
                <div className="flex gap-4 mb-8 bg-zinc-50 p-4 border-2 border-manga-ink shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                  <div className="w-24 h-32 bg-gray-200 border-2 border-manga-ink shrink-0 overflow-hidden relative flex items-center justify-center">
                    {(() => {
                      const coverUrl = sessionDetail.series?.cover_image_url || sessionDetail.series?.coverImageUrl || sessionDetail.series?.coverUrl || sessionDetail.cover_image_url || sessionDetail.coverImageUrl || sessionDetail.coverUrl || 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=300&auto=format&fit=crop';
                      return <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />;
                    })()}
                  </div>
                  <div className="flex flex-col justify-between py-1">
                    <div>
                      <h3 className="font-manga text-xl font-black uppercase text-manga-red mb-1">
                        {sessionDetail.series?.title || sessionDetail.title || 'Chưa rõ tên tác phẩm'}
                      </h3>
                      <p className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1 mb-1">
                        Loại phiên: {sessionDetail.chapter_id ? 'Duyệt Bản Thảo (Chapter)' : 'Duyệt Dự Án (Series)'}
                      </p>
                    </div>
                    <div className="text-xs font-bold text-gray-600 space-y-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gray-400" /> Bắt đầu: {sessionDetail.started_at ? new Date(sessionDetail.started_at).toLocaleString() : 'Chưa xác định'}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-400" /> Kết thúc: {sessionDetail.ended_at ? new Date(sessionDetail.ended_at).toLocaleString() : 'Đang diễn ra'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <h3 className="font-manga text-xl font-black uppercase text-manga-ink mb-6 border-b-2 border-dashed border-gray-300 pb-2">
                LỊCH SỬ PHÁN QUYẾT (VOTES)
              </h3>

              {sessionVotes.length === 0 ? (
                <div className="text-center py-10 text-gray-500 font-bold text-sm uppercase">
                  Phiên duyệt này chưa có lượt bỏ phiếu nào được ghi nhận.
                </div>
              ) : (
                <div className="relative pl-6 space-y-8 before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-1 before:bg-gradient-to-b before:from-transparent before:via-gray-300 before:to-transparent">
                  {sessionVotes.map((vote, idx) => {
                    let Icon = User
                    let iconBg = 'bg-gray-200'
                    let iconColor = 'text-gray-600'
                    
                    const action = (vote.decision || '').toUpperCase()
                    if (action === 'APPROVE') {
                      Icon = CheckCircle
                      iconBg = 'bg-emerald-100'
                      iconColor = 'text-emerald-600'
                    } else if (action === 'REJECT') {
                      Icon = XCircle
                      iconBg = 'bg-red-100'
                      iconColor = 'text-red-600'
                    } else if (action === 'REVISE') {
                      Icon = AlertCircle
                      iconBg = 'bg-yellow-100'
                      iconColor = 'text-yellow-600'
                    }

                    const voterName = vote.users?.fullName || vote.users?.username || vote.users?.name || 'Hội đồng'
                    const voterAvatar = vote.users?.avatar_url || vote.users?.avatarUrl

                    return (
                      <div key={vote.vote_id || idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        {/* Icon */}
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 border-manga-ink ${iconBg} ${iconColor} shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 absolute left-[-32px] md:static overflow-hidden`}>
                          {voterAvatar ? (
                             <img src={voterAvatar} alt={voterName} className="w-full h-full object-cover rounded-full" />
                          ) : (
                             <Icon className="w-4 h-4" />
                          )}
                        </div>
                        
                        {/* Card */}
                        <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-2.5rem)] bg-white border-2 border-manga-ink p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                          <div className="flex items-center justify-between mb-1">
                            <span className={`font-manga font-bold text-sm uppercase ${action === 'APPROVE' ? 'text-emerald-600' : action === 'REJECT' ? 'text-red-600' : action === 'REVISE' ? 'text-yellow-600' : 'text-manga-red'}`}>
                              {action || 'Đã Vote'}
                            </span>
                            <time className="text-[9px] font-black text-gray-400">{vote.created_at ? new Date(vote.created_at).toLocaleString() : ''}</time>
                          </div>
                          <div className="text-xs font-bold text-manga-ink mb-2">
                            Thành viên: <span className="text-manga-red">{voterName}</span>
                          </div>
                          <p className="text-[11px] font-medium text-gray-600 border-t-2 border-dashed border-gray-200 pt-2">
                            {vote.note || 'Không có ghi chú'}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
