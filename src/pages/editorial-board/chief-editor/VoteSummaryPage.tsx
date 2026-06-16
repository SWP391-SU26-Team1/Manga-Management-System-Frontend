import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router'
import { ArrowLeft, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react'
import { boardStore } from '@/data/boardMockData'
import { boardService } from '@/services/board.service'

export default function VoteSummaryPage() {
  const { chapterId } = useParams<{ chapterId: string }>()
  const navigate = useNavigate()

  const chapterTitleDisplay = chapterId === 'cyber-ronin' 
    ? 'CYBER RONIN: ZERO' 
    : chapterId === 'crimson-petal' 
    ? 'CRIMSON PETAL' 
    : chapterId === 'pitch-black' 
    ? 'PITCH BLACK' 
    : 'WHISPERS OF MANA'

  const chapterNumberDisplay = chapterId === 'cyber-ronin' ? 65 : chapterId === 'pitch-black' ? 12 : chapterId === 'whispers-of-mana' ? 45 : 1

  // State for expand all votes
  const [expandAll, setExpandAll] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [decisionType, setDecisionType] = useState<'APPROVAL' | 'REVISION' | 'CANCELLATION'>('APPROVAL')

  // Dynamic voters and stats states
  const [votes, setVotes] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalVotes: 0,
    approveCount: 0,
    reviseCount: 0,
    rejectCount: 0,
    approvePercent: 0,
    revisePercent: 0,
    rejectPercent: 0,
    quorumReached: false
  })

  useEffect(() => {
    const fetchSummary = async () => {
      if (!chapterId) return
      try {
        const data = await boardService.getVoteSummary(chapterId)
        if (data && data.voters) {
          updateState(data)
        } else {
          updateState(boardStore.getVoteSummary(chapterId))
        }
      } catch (err) {
        console.warn('API error fetching vote summary, using fallback:', err)
        updateState(boardStore.getVoteSummary(chapterId))
      }
    }

    const updateState = (data: any) => {
      setVotes(data.voters || [])
      const total = data.totalVotes || data.voters?.length || 0
      const approve = data.approveVotes || data.voters?.filter((v: any) => v.vote === 'APPROVE').length || 0
      const revise = data.reviseVotes || data.voters?.filter((v: any) => v.vote === 'REVISE').length || 0
      const reject = data.rejectVotes || data.voters?.filter((v: any) => v.vote === 'REJECT').length || 0
      
      const appPct = total > 0 ? Math.round((approve / total) * 100) : 0
      const revPct = total > 0 ? Math.round((revise / total) * 100) : 0
      const rejPct = total > 0 ? Math.round((reject / total) * 100) : 0

      setStats({
        totalVotes: total,
        approveCount: approve,
        reviseCount: revise,
        rejectCount: reject,
        approvePercent: appPct,
        revisePercent: revPct,
        rejectPercent: rejPct,
        quorumReached: data.quorumReached || total >= 6
      })
    }

    fetchSummary()
  }, [chapterId])

  const displayedVotes = expandAll ? votes : votes.slice(0, 7)

  const handleDecisionClick = (type: 'APPROVAL' | 'REVISION' | 'CANCELLATION') => {
    setDecisionType(type)
    setShowConfirm(true)
  }

  const handleConfirmDecisionSubmit = async () => {
    setShowConfirm(false)
    
    // Determine the status label
    let progressLabel = 'APPROVED'
    let progressPercent = 100
    if (decisionType === 'REVISION') {
      progressLabel = 'REVISE'
      progressPercent = 40
    } else if (decisionType === 'CANCELLATION') {
      progressLabel = 'REJECTED'
      progressPercent = 0
    }
    
    // Call real API with fallback
    if (chapterId) {
      try {
        await boardService.saveChapterDecision(chapterId, progressLabel, progressPercent)
      } catch (err) {
        console.warn('API error saving chapter decision, falling back to local storage:', err)
      }
      boardStore.updateChapterStatus(chapterId, progressLabel, progressPercent)
    }

    // Redirect to Screen 4 (Send Notification) with pre-filled state
    navigate(`/dashboard/editorial-board/review/${chapterId}/decision`, {
      state: {
        templateType: decisionType,
        projectName: `${chapterTitleDisplay} - Chương ${chapterNumberDisplay}`
      }
    })
  }

  return (
    <div className="max-w-6xl mx-auto pb-12 font-sans text-manga-ink">
      
      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border-4 border-manga-ink p-6 shadow-[8px_8px_0px_rgba(0,0,0,1)]">
            <div className="bg-manga-ink text-white p-3 font-manga font-bold text-sm tracking-wide uppercase border-b-2 border-black -mx-6 -mt-6 mb-6">
              Xác nhận phán quyết cuối cùng
            </div>
            
            <p className="text-xs font-bold leading-relaxed text-gray-700 mb-6">
              Bạn đang quyết định ban hành trạng thái chính thức: {' '}
              <strong className="text-manga-red uppercase text-sm">
                {decisionType === 'APPROVAL' ? 'Phê duyệt xuất bản' : decisionType === 'REVISION' ? 'Yêu cầu chỉnh sửa' : 'Hủy bỏ bản thảo'}
              </strong>. 
              Quyết định này sẽ override hoàn toàn phiếu bầu của hội đồng và kích hoạt thông báo gửi tác giả.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 bg-white border-2 border-manga-ink font-manga font-bold text-xs uppercase hover:bg-zinc-50 cursor-pointer"
              >
                HỦY BỎ
              </button>
              <button
                onClick={handleConfirmDecisionSubmit}
                className="flex-1 py-3 bg-manga-red text-white border-2 border-black font-manga font-bold text-xs uppercase shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:bg-red-700 transition-all cursor-pointer"
              >
                XÁC NHẬN SUBMIT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation breadcrumb */}
      <div className="mb-4 flex items-center justify-between">
        <Link 
          to={`/dashboard/editorial-board/review/${chapterId}/draft`}
          className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-manga-ink hover:text-manga-red"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại Bản thảo</span>
        </Link>
        <span className="bg-manga-red text-white font-bold text-[10px] px-2.5 py-1 border-2 border-manga-ink uppercase">
          BƯỚC 3 / 4: TỔNG HỢP VOTE
        </span>
      </div>

      <h1 className="font-manga text-3xl md:text-4xl font-bold uppercase leading-none mb-2 mt-4">
        TỔNG HỢP KẾT QUẢ BIỂU QUYẾT
      </h1>
      <p className="text-xs font-bold text-gray-500 uppercase mb-8">
        Hội đồng biên tập thẩm định: {chapterTitleDisplay} — Chương {chapterNumberDisplay}
      </p>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left column: Voting statistics */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Voting Status Panel */}
          <div className="bg-white border-4 border-manga-ink p-6 shadow-[6px_6px_0px_rgba(15,15,15,1)]">
            <div className="flex justify-between items-center border-b-2 border-manga-ink pb-3 mb-6">
              <h3 className="font-manga text-lg font-black uppercase">Trạng thái biểu quyết</h3>
              <span className="bg-emerald-500 text-white font-manga font-bold text-xs px-3 py-1 border-2 border-manga-ink uppercase shadow-sm">
                HOÀN TẤT
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="border-2 border-manga-ink p-3 bg-zinc-50 shadow-sm text-center">
                <span className="block text-[10px] text-gray-400 font-bold uppercase">Tổng số phiếu</span>
                <strong className="font-manga text-3xl text-manga-ink">{stats.totalVotes} / {stats.totalVotes}</strong>
              </div>
              <div className="border-2 border-manga-ink p-3 bg-[#fff5f5] shadow-sm text-center">
                <span className="block text-[10px] text-gray-400 font-bold uppercase">Tỉ lệ nhất trí</span>
                <strong className="font-manga text-3xl text-manga-red">{stats.approvePercent}%</strong>
              </div>
              <div className="border-2 border-manga-ink p-3 bg-zinc-50 shadow-sm text-center">
                <span className="block text-[10px] text-gray-400 font-bold uppercase">Quorum tối thiểu</span>
                <strong className="font-manga text-3xl text-emerald-600">{stats.quorumReached ? 'ĐẠT' : 'CHƯA ĐẠT'}</strong>
              </div>
            </div>

            {/* Distribution Charts */}
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase text-gray-400">Biểu đồ phân bố phiếu bầu</h4>
              
              {/* Phê duyệt */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-emerald-600">✔ PHÊ DUYỆT XUẤT BẢN</span>
                  <span>{stats.approveCount} phiếu ({stats.approvePercent}%)</span>
                </div>
                <div className="w-full h-4 bg-gray-100 border-2 border-manga-ink rounded-none overflow-hidden relative">
                  <div className="h-full bg-manga-red border-r-2 border-manga-ink" style={{ width: `${stats.approvePercent}%` }} />
                </div>
              </div>

              {/* Chỉnh sửa */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-[#a16207]">📅 CẦN CHỈNH SỬA</span>
                  <span>{stats.reviseCount} phiếu ({stats.revisePercent}%)</span>
                </div>
                <div className="w-full h-4 bg-gray-100 border-2 border-manga-ink rounded-none overflow-hidden relative">
                  <div className="h-full bg-yellow-400 border-r-2 border-manga-ink" style={{ width: `${stats.revisePercent}%` }} />
                </div>
              </div>

              {/* Hủy bỏ */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-zinc-500">✖ HỦY BỎ BẢN THẢO</span>
                  <span>{stats.rejectCount} phiếu ({stats.rejectPercent}%)</span>
                </div>
                <div className="w-full h-4 bg-gray-100 border-2 border-manga-ink rounded-none overflow-hidden relative">
                  <div className="h-full bg-zinc-900 border-r-2 border-manga-ink" style={{ width: `${stats.rejectPercent}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Action block for Chief */}
          <div className="bg-[#fff1f2] border-4 border-manga-ink p-6 shadow-[6px_6px_0px_rgba(15,15,15,1)] relative">
            <h3 className="font-manga text-lg font-black uppercase text-manga-red border-b-2 border-manga-ink pb-2 mb-4">
              QUYẾT ĐỊNH CUỐI CÙNG CỦA TRƯỞNG BAN
            </h3>
            
            <p className="text-xs font-bold leading-relaxed text-gray-700 mb-6">
              Bạn có quyền quyết định cuối cùng bất chấp phân bố vote của hội đồng. Hãy bấm chọn quyết định và soạn thông báo chính thức gửi tác giả.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => handleDecisionClick('APPROVAL')}
                className="py-3 bg-manga-red text-white border-2 border-black font-manga font-bold text-xs uppercase tracking-wider shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:bg-red-700 transition-all cursor-pointer"
              >
                PHÊ DUYỆT XUẤT BẢN
              </button>
              <button
                onClick={() => handleDecisionClick('REVISION')}
                className="py-3 bg-white border-2 border-manga-ink font-manga font-bold text-xs uppercase hover:bg-zinc-50 transition-all cursor-pointer"
              >
                YÊU CẦU CHỈNH SỬA
              </button>
              <button
                onClick={() => handleDecisionClick('CANCELLATION')}
                className="py-3 bg-manga-ink text-white border-2 border-manga-ink font-manga font-bold text-xs uppercase hover:bg-zinc-800 transition-all cursor-pointer"
              >
                HỦY BỎ BẢN THẢO
              </button>
            </div>
          </div>
        </div>

        {/* Right column: Detailed voter remarks */}
        <div className="bg-white border-4 border-manga-ink p-5 shadow-[6px_6px_0px_rgba(15,15,15,1)]">
          <h3 className="font-manga text-md font-black uppercase border-b-2 border-manga-ink pb-3 mb-4">
            CHI TIẾT PHIẾU BẦU HỘI ĐỒNG
          </h3>

          <div className="space-y-4">
            {displayedVotes.map((v, i) => (
              <div key={i} className="border-b-2 border-dashed border-gray-100 pb-3">
                <div className="flex justify-between items-baseline mb-1">
                  <div>
                    <strong className="text-xs font-extrabold text-manga-ink uppercase">{v.name}</strong>
                    <span className="text-[9px] text-gray-400 font-bold ml-1.5 uppercase">({v.role})</span>
                  </div>
                  <span className={`text-[9px] font-black border-2 px-1.5 py-0.2 uppercase ${
                    v.vote === 'APPROVE' 
                      ? 'border-emerald-500 text-emerald-600 bg-emerald-50' 
                      : v.vote === 'REVISE' 
                      ? 'border-yellow-500 text-yellow-600 bg-yellow-50' 
                      : 'border-manga-red text-manga-red bg-red-50'
                  }`}>
                    {v.vote === 'APPROVE' ? 'Duyệt' : v.vote === 'REVISE' ? 'Sửa' : 'Hủy'}
                  </span>
                </div>
                <p className="text-[11px] font-medium text-gray-600 leading-snug">
                  "{v.quote}"
                </p>
              </div>
            ))}
          </div>

          <button
            onClick={() => setExpandAll(!expandAll)}
            className="w-full mt-4 py-2 bg-zinc-100 hover:bg-zinc-200 border-2 border-manga-ink text-manga-ink font-manga font-bold text-xs uppercase transition-colors"
          >
            {expandAll ? 'ẨN BỚT PHIẾU BẦU' : `XEM TẤT CẢ ${votes.length} PHIẾU`}
          </button>
        </div>
      </div>
    </div>
  )
}
