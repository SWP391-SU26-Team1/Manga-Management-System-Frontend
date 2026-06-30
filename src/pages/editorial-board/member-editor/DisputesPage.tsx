import React, { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router'
import { AlertTriangle, Download, Lock, CheckCircle, Send, Eye } from 'lucide-react'
import { DisputeCase } from '@/types/board.types'
import { disputeService } from '@/services/dispute.service'
// Helper to load current user
const getStoredUser = () => {
  const data = localStorage.getItem('mangaflow_user')
  return data ? JSON.parse(data) : { fullName: 'Minamoto Shizuka', role: 'BOARD' }
}

// ==========================================
// 1. DISPUTES LIST PAGE
// ==========================================
export function DisputesListPage() {
  const [cases, setCases] = useState<any[]>([])

  useEffect(() => {
    const loadCases = async () => {
      try {
        const res = await disputeService.getAll()
        if (res && res.length > 0) {
          // Adapt fields if needed
          setCases(res.map((c: any) => ({
            id: c.id || c.case_id || 'MF-8492',
            projectTitle: c.projectTitle || c.project_title,
            issue: c.issue,
            authorName: c.authorName || c.author_name,
            authorAvatar: c.authorAvatar || c.author_avatar,
            authorOpinion: c.authorOpinion || c.author_opinion,
            authorSketches: c.authorSketches || [],
            editorName: c.editorName || c.editor_name,
            editorAvatar: c.editorAvatar || c.editor_avatar,
            editorOpinion: c.editorOpinion || c.editor_opinion,
            editorMetricLabel: c.editorMetricLabel || '',
            editorMetricValue: c.editorMetricValue || 0,
            editorMetricTarget: c.editorMetricTarget || 80,
            status: c.status,
            memberOpinion: c.memberOpinion ? {
              leaning: c.memberOpinion.leaning,
              reason: c.memberOpinion.reason,
              submittedAt: c.memberOpinion.submitted_at || c.memberOpinion.submittedAt
            } : undefined
          })))
        } else {
          setCases([])
        }
      } catch (err) {
        console.warn('API error fetching disputes:', err)
        setCases([])
      }
    }
    loadCases()
  }, [])

  return (
    <div className="max-w-5xl mx-auto pb-12 font-sans">
      <h1 className="font-manga text-3xl md:text-4xl font-bold uppercase text-manga-ink mb-2">
        BÁO CÁO TRANH CÃI
      </h1>
      <div className="h-1.5 w-24 bg-manga-red mb-3" />
      <p className="text-xs font-bold text-gray-500 uppercase mb-8">
        Các phiên tranh chấp giữa Họa sĩ và Biên tập viên cần hội đồng thẩm định và tham mưu
      </p>

      {/* Disputes list grid */}
      <div className="space-y-6">
        {cases.map((c) => (
          <div 
            key={c.id}
            className="bg-white border-4 border-manga-ink p-6 shadow-[6px_6px_0px_rgba(15,15,15,1)] flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="bg-manga-red text-white text-[10px] font-extrabold px-2.5 py-0.5 border-2 border-manga-ink uppercase">
                  Mức độ cao
                </span>
                <span className="text-xs font-bold text-gray-500 uppercase">CASE #{c.id}</span>
              </div>
              <h3 className="font-manga text-2xl font-bold text-manga-ink uppercase leading-none">
                Dự án: "{c.projectTitle}"
              </h3>
              <p className="text-sm font-bold text-gray-600">
                Vấn đề: {c.issue}
              </p>
              <div className="flex gap-4 text-xs font-bold text-gray-400">
                <span>Mangaka: {c.authorName}</span>
                <span>•</span>
                <span>Biên tập: {c.editorName}</span>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-3">
              {c.memberOpinion ? (
                <span className="text-xs font-bold text-emerald-600 border-2 border-emerald-500 bg-emerald-50 px-3 py-1.5 uppercase">
                  ✓ Đã gửi tham mưu
                </span>
              ) : (
                <span className="text-xs font-bold text-manga-red border-2 border-manga-red bg-red-50/50 px-3 py-1.5 uppercase">
                  Chờ tham mưu
                </span>
              )}
              
              <Link 
                to={`/dashboard/editorial-board/disputes/${c.id}`}
                className="bg-manga-ink text-white font-manga font-bold text-xs uppercase px-5 py-2.5 border-2 border-manga-ink shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:bg-manga-red hover:shadow-[1px_1px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] transition-all"
              >
                GIẢI QUYẾT
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ==========================================
// 2. DISPUTE DETAILS PAGE
// ==========================================
export function DisputeDetailsPage() {
  const { caseId } = useParams<{ caseId: string }>()
  const [caseItem, setCaseItem] = useState<DisputeCase | undefined>(undefined)
  const [leaning, setLeaning] = useState<'AUTHOR' | 'EDITOR' | 'COMPROMISE'>('COMPROMISE')
  const [reason, setReason] = useState('')
  const [showSavedToast, setShowSavedToast] = useState(false)
  const [showLightbox, setShowLightbox] = useState(false)
  
  const [comments, setComments] = useState<any[]>([
    { id: 1, author: 'MINH K. (ART DIRECTOR)', text: 'Nên cho tác giả thêm 1 chương để triển khai tâm lý nhân vật.', time: '10 phút trước' },
    { id: 2, author: 'LAN PHƯƠNG (EDITOR)', text: 'Đồng ý, nhịp truyện nếu thay đổi đột ngột quá sẽ phản tác dụng.', time: '30 phút trước' }
  ])
  const [newComment, setNewComment] = useState('')

  useEffect(() => {
    const loadDetail = async () => {
      if (!caseId) return
      try {
        const res = await disputeService.getById(caseId)
        if (res) {
          setCaseItem({
            id: res.id || caseId,
            projectTitle: res.projectTitle,
            issue: res.issue,
            authorName: res.authorName,
            authorAvatar: res.authorAvatar,
            authorOpinion: res.authorOpinion,
            authorSketches: res.authorSketches,
            editorName: res.editorName,
            editorAvatar: res.editorAvatar,
            editorOpinion: res.editorOpinion,
            editorMetricLabel: res.editorMetricLabel,
            editorMetricValue: res.editorMetricValue,
            editorMetricTarget: res.editorMetricTarget,
            status: res.status,
            chiefDecision: res.chiefDecision,
            chiefCompromise: res.chiefCompromise,
            chiefNextActions: res.chiefNextActions,
            memberOpinion: res.memberOpinion ? {
              leaning: res.memberOpinion.leaning,
              reason: res.memberOpinion.reason,
              submittedAt: res.memberOpinion.submitted_at || (res.memberOpinion as any).submittedAt
            } : undefined
          })
          if (res.memberOpinion) {
            setLeaning(res.memberOpinion.leaning)
            setReason(res.memberOpinion.reason)
          }
        } else {
          setCaseItem(undefined)
        }
      } catch (err) {
        console.warn('API error fetching dispute details:', err)
        setCaseItem(undefined)
      }
    }
    loadDetail()
  }, [caseId])

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return
    const currentUser = getStoredUser()
    setComments([...comments, {
      id: Date.now(),
      author: currentUser.fullName.toUpperCase() + ' (MEMBER EDITOR)',
      text: newComment,
      time: 'Vừa xong'
    }])
    setNewComment('')
  }

  const handleSubmitOpinion = async () => {
    if (!caseId) return
    try {
      await disputeService.saveOpinion(caseId, leaning, reason)
    } catch (err) {
      console.warn('API error saving dispute opinion:', err)
    }
    setShowSavedToast(true)
    setTimeout(() => setShowSavedToast(false), 3000)
  }

  if (!caseItem) {
    return <div className="p-8 text-center text-red-500 font-bold">Không tìm thấy báo cáo tranh cãi.</div>
  }

  return (
    <div className="max-w-6xl mx-auto pb-12 font-sans relative">
      {/* Lightbox for sketches */}
      {showLightbox && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 cursor-pointer"
          onClick={() => setShowLightbox(false)}
        >
          <div className="max-w-2xl bg-white p-4 border-4 border-manga-ink shadow-2xl relative">
            <img 
              src={caseItem.authorSketches[0]} 
              alt="Manga sketch full" 
              className="max-h-[80vh] object-contain"
            />
            <p className="text-center font-bold text-xs uppercase mt-3 text-manga-ink">Phác thảo biểu cảm chương 45 (Bản nháp gốc)</p>
          </div>
        </div>
      )}

      {/* Header section */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex gap-2 mb-2">
            <span className="bg-manga-red text-white font-bold text-[9px] px-2 py-0.5 border-2 border-manga-ink uppercase">
              MỨC ĐỘ CAO
            </span>
            <span className="bg-manga-ink text-white font-bold text-[9px] px-2 py-0.5 border-2 border-manga-ink uppercase">
              CASE #{caseItem.id}
            </span>
          </div>
          <h1 className="font-manga text-3xl md:text-4xl font-bold uppercase text-manga-ink">
            XÉT DUYỆT BÁO CÁO TRANH CÃI
          </h1>
          <p className="text-xs font-bold text-gray-500 uppercase mt-1">
            Dự án: "{caseItem.projectTitle}" — Vấn đề: {caseItem.issue}
          </p>
        </div>
        <button 
          onClick={() => alert('Xuất báo cáo tranh chấp thành PDF...')}
          className="flex items-center justify-center gap-1.5 bg-white border-3 border-manga-ink px-4 py-2 text-xs font-bold uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-zinc-50 active:translate-y-[1px] cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>XUẤT PDF</span>
        </button>
      </div>

      {/* Main split-screen panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch mb-8">
        {/* Author Position */}
        <div className="bg-white border-4 border-manga-ink p-6 shadow-[6px_6px_0px_rgba(15,15,15,1)] flex flex-col justify-between">
          <div>
            <div className="inline-block px-3 py-1 bg-manga-ink text-white font-bold uppercase text-[9px] border-2 border-manga-ink shadow-sm mb-4">
              LẬP TRƯỜNG TÁC GIẢ
            </div>
            
            <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-dashed border-gray-200">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-manga-ink">
                <img src={caseItem.authorAvatar} alt={caseItem.authorName} className="w-full h-full object-cover" />
              </div>
              <div>
                <h4 className="font-manga text-base font-bold text-manga-ink leading-tight">{caseItem.authorName}</h4>
                <span className="text-[10px] text-gray-400 font-bold uppercase">MANGAKA CHÍNH</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h5 className="text-[10px] font-black uppercase text-gray-400 mb-1.5">Lập luận chính</h5>
                <blockquote className="border-l-4 border-manga-red bg-zinc-50 p-3 text-xs font-bold text-zinc-700 leading-relaxed italic">
                  "{caseItem.authorOpinion}"
                </blockquote>
              </div>

              <div>
                <h5 className="text-[10px] font-black uppercase text-gray-400 mb-2">Bằng chứng / Phác thảo kèm theo</h5>
                <div className="flex gap-4">
                  <div 
                    onClick={() => setShowLightbox(true)}
                    className="w-28 h-20 border-2 border-manga-ink overflow-hidden bg-zinc-100 shadow-[2px_2px_0px_rgba(0,0,0,1)] relative group cursor-pointer"
                  >
                    <img src={caseItem.authorSketches[0] || 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=400&auto=format&fit=crop'} alt="Sketch thumbnail" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Eye className="w-4 h-4 text-white" />
                    </div>
                    <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[8px] font-bold text-center uppercase py-0.5">Bản nháp gốc</span>
                  </div>
                  <div className="w-28 h-20 border-2 border-dashed border-gray-300 flex items-center justify-center bg-zinc-50/50">
                    <span className="text-[18px] text-gray-300 font-bold">👁</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Editor Position */}
        <div className="bg-white border-4 border-manga-ink p-6 shadow-[6px_6px_0px_rgba(15,15,15,1)] flex flex-col justify-between">
          <div>
            <div className="inline-block px-3 py-1 bg-manga-ink text-white font-bold uppercase text-[9px] border-2 border-manga-ink shadow-sm mb-4">
              LẬP TRƯỜNG BIÊN TẬP
            </div>
            
            <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-dashed border-gray-200">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-manga-ink">
                <img src={caseItem.editorAvatar} alt={caseItem.editorName} className="w-full h-full object-cover" />
              </div>
              <div>
                <h4 className="font-manga text-base font-bold text-manga-ink leading-tight">{caseItem.editorName}</h4>
                <span className="text-[10px] text-gray-400 font-bold uppercase">BIÊN TẬP VIÊN PHỤ TRÁCH</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h5 className="text-[10px] font-black uppercase text-gray-400 mb-1.5">Lập luận chính</h5>
                <blockquote className="border-l-4 border-manga-ink bg-zinc-50 p-3 text-xs font-bold text-zinc-700 leading-relaxed italic">
                  "{caseItem.editorOpinion}"
                </blockquote>
              </div>

              <div>
                <h5 className="text-[10px] font-black uppercase text-gray-400 mb-1.5">Dữ liệu hỗ trợ</h5>
                <div className="bg-[#fff5f5] border-2 border-manga-ink p-3 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-[10px] font-black uppercase text-manga-ink leading-none">{caseItem.editorMetricLabel}</span>
                    <span className="text-manga-red font-manga text-sm font-black">-15%</span>
                  </div>
                  <div className="w-full h-3 bg-white border-2 border-manga-ink rounded-none overflow-hidden relative mb-2">
                    <div className="h-full bg-manga-red" style={{ width: '45%' }} />
                    <div className="absolute top-0 bottom-0 left-[80%] w-0.5 bg-manga-ink" title="Mục tiêu 80%" />
                  </div>
                  <div className="flex justify-between text-[8px] font-bold text-gray-500">
                    <span>HIỆN TẠI: 45%</span>
                    <span>MỤC TIÊU: 80%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Consultation & Council Decision (Bottom Area) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mb-8">
        {/* Left Bottom: Member Opinion Form */}
        <div className="lg:col-span-2 bg-white border-4 border-manga-ink p-6 shadow-[6px_6px_0px_rgba(15,15,15,1)]">
          <div className="inline-block px-3 py-1 bg-manga-red text-white font-bold uppercase text-[9px] border-2 border-manga-ink shadow-sm mb-4">
            Ý KIẾN THAM MƯU CỦA BẠN
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Bạn nghiêng về lập trường nào?</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  onClick={() => setLeaning('AUTHOR')}
                  className={`py-2 px-3 border-2 font-bold text-xs uppercase transition-all cursor-pointer ${
                    leaning === 'AUTHOR'
                      ? 'bg-zinc-100 border-manga-ink shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                      : 'bg-white border-gray-300 hover:bg-zinc-50'
                  }`}
                >
                  Nghiêng về Tác giả
                </button>
                <button
                  onClick={() => setLeaning('EDITOR')}
                  className={`py-2 px-3 border-2 font-bold text-xs uppercase transition-all cursor-pointer ${
                    leaning === 'EDITOR'
                      ? 'bg-zinc-100 border-manga-ink shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                      : 'bg-white border-gray-300 hover:bg-zinc-50'
                  }`}
                >
                  Nghiêng về Biên tập
                </button>
                <button
                  onClick={() => setLeaning('COMPROMISE')}
                  className={`py-2 px-3 border-2 font-bold text-xs uppercase transition-all cursor-pointer ${
                    leaning === 'COMPROMISE'
                      ? 'bg-zinc-100 border-manga-ink shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                      : 'bg-white border-gray-300 hover:bg-zinc-50'
                  }`}
                >
                  Thỏa hiệp bắt buộc
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-1.5">Lý do / Luận điểm đóng góp ý kiến (Tham mưu)</label>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Nhập lập luận hoặc phương hướng giải quyết đề xuất của bạn..."
                className="w-full border-2 border-manga-ink p-3 text-xs font-bold outline-none focus:border-manga-red bg-zinc-50 h-24"
              />
            </div>

            <div className="flex justify-between items-center border-t-2 border-dashed border-gray-300 pt-4">
              <div>
                {caseItem.memberOpinion ? (
                  <span className="text-[10px] font-bold text-emerald-600">
                    ✓ Đã lưu tham mưu (Có thể thay đổi trước khi Chief đóng phiên)
                  </span>
                ) : (
                  showSavedToast && (
                    <span className="text-[10px] font-bold text-emerald-600 animate-fade-in flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Ý kiến tham mưu đã được ghi nhận.</span>
                    </span>
                  )
                )}
              </div>
              
              <button
                onClick={handleSubmitOpinion}
                className="bg-manga-ink text-white font-manga font-bold text-xs uppercase px-5 py-2.5 border-2 border-manga-ink shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-manga-red hover:shadow-[1px_1px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
              >
                {caseItem.memberOpinion ? 'CẬP NHẬT Ý KIẾN' : 'GỬI Ý KIẾN THAM MƯU'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Bottom: Official Board Decision (Chief Only - LOCKED) */}
        <div className="bg-white border-4 border-manga-ink p-6 shadow-[6px_6px_0px_rgba(15,15,15,1)] relative h-full flex flex-col justify-between">
          {/* Locked Overlay block */}
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[1.5px] z-20 flex flex-col items-center justify-center p-4 text-center">
            <div className="bg-manga-ink text-white p-3 border-2 border-manga-ink shadow-md mb-2">
              <Lock className="w-6 h-6" />
            </div>
            <h4 className="font-manga text-xl font-bold uppercase text-manga-ink">CHIEF EDITOR ONLY</h4>
            <p className="text-[9px] text-gray-500 font-extrabold uppercase mt-1 leading-tight max-w-[150px]">
              Chỉ Trưởng ban Biên tập mới có quyền ban hành phán quyết.
            </p>
          </div>

          {/* Dummy visual layout of locked panel */}
          <div className="opacity-40 select-none">
            <h3 className="font-manga text-base font-black uppercase mb-3">Quyết định phán quyết</h3>
            
            <div className="space-y-3">
              <div className="border-2 border-gray-300 p-2">
                <span className="block text-[8px] font-bold text-gray-400">GIẢI PHÁP ĐỀ XUẤT</span>
                <p className="text-[10px] font-bold truncate">{caseItem.chiefCompromise || 'Đang chờ nhập...'}</p>
              </div>
              <div className="border-2 border-gray-300 p-2">
                <span className="block text-[8px] font-bold text-gray-400">HÀNH ĐỘNG TIẾP THEO</span>
                <p className="text-[10px] font-bold truncate">{caseItem.chiefNextActions || 'Đang chờ nhập...'}</p>
              </div>
              <div className="py-2.5 bg-manga-red border-2 border-manga-ink text-center text-white text-[10px] font-manga font-bold uppercase">
                BAN HÀNH PHÁN QUYẾT
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Board comments thread section */}
      <div className="bg-white border-4 border-manga-ink p-6 shadow-[6px_6px_0px_rgba(15,15,15,1)]">
        <h3 className="font-manga text-xl font-black uppercase border-b-4 border-manga-ink pb-3 mb-6">
          THẢO LUẬN HỘI ĐỒNG (DISPUTE DISCUSSION)
        </h3>

        <div className="space-y-4 mb-6">
          {comments.map((comment) => (
            <div key={comment.id} className="border-l-4 border-manga-red pl-4 py-1 bg-zinc-50/50">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-[10px] font-black uppercase text-manga-ink">{comment.author}</span>
                <span className="text-[8px] text-gray-400 font-bold uppercase">{comment.time}</span>
              </div>
              <p className="text-xs font-bold text-zinc-700 leading-normal">{comment.text}</p>
            </div>
          ))}
        </div>

        <form onSubmit={handleSendComment} className="flex gap-2 border-t-2 border-manga-ink pt-4">
          <input
            type="text"
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Nhập bình luận tham gia thảo luận vụ việc tranh chấp..."
            className="flex-1 border-2 border-manga-ink px-4 py-2.5 text-xs font-bold outline-none focus:border-manga-red bg-zinc-50"
          />
          <button 
            type="submit" 
            className="bg-manga-ink text-white border-2 border-manga-ink px-5 py-2.5 shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-manga-red hover:shadow-[1px_1px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  )
}
