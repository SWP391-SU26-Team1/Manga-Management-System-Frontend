import React, { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router'
import { AlertTriangle, Download, Lock, CheckCircle, Send, Eye, FileText, ChevronRight } from 'lucide-react'
import { boardStore, DisputeCase } from '@/data/boardMockData'
import { disputeService } from '@/services/dispute.service'

export function ChiefDisputesListPage() {
  const [cases, setCases] = useState<DisputeCase[]>([])

  useEffect(() => {
    const loadCases = async () => {
      try {
        const res = await disputeService.getAll()
        if (res && res.length > 0) {
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
          setCases(boardStore.getDisputeCases())
        }
      } catch (err) {
        setCases(boardStore.getDisputeCases())
      }
    }
    loadCases()
  }, [])

  return (
    <div className="max-w-5xl mx-auto pb-12 font-sans text-manga-ink">
      <h1 className="font-manga text-3xl md:text-4xl font-bold uppercase mb-2">
        XÉT DUYỆT BÁO CÁO TRANH CÃI (CHIEF)
      </h1>
      <div className="h-1.5 w-24 bg-manga-red mb-3" />
      <p className="text-xs font-bold text-gray-500 uppercase mb-8">
        Hồ sơ mâu thuẫn biên tập leo thang lên Trưởng ban biên tập đưa ra phán quyết cuối cùng
      </p>

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
                <span className={`text-[9px] font-black border-2 px-2 py-0.2 uppercase ${c.status === 'DECIDED' ? 'border-emerald-500 text-emerald-600 bg-emerald-50' : 'border-manga-red text-manga-red bg-red-50'}`}>
                  {c.status === 'DECIDED' ? 'Đã phán quyết' : 'Đang xử lý'}
                </span>
              </div>
              <h3 className="font-manga text-2xl font-bold uppercase leading-none">
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
              <Link 
                to={`/dashboard/editorial-board/disputes/${c.id}`}
                className="bg-manga-ink text-white font-manga font-bold text-xs uppercase px-5 py-2.5 border-2 border-manga-ink shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:bg-manga-red hover:shadow-[1px_1px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] transition-all"
              >
                {c.status === 'DECIDED' ? 'XEM PHÁN QUYẾT' : 'BAN HÀNH PHÁN QUYẾT'}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ChiefDisputeDetailsPage() {
  const { caseId } = useParams<{ caseId: string }>()
  const navigate = useNavigate()
  const [caseItem, setCaseItem] = useState<DisputeCase | undefined>(undefined)
  
  // Verdict states
  const [verdict, setVerdict] = useState<'AUTHOR' | 'EDITOR' | 'COMPROMISE'>('COMPROMISE')
  const [compromiseText, setCompromiseText] = useState('')
  const [nextActions, setNextActions] = useState('')
  
  // Modals state
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmStep, setConfirmStep] = useState(1)
  const [showPdfModal, setShowPdfModal] = useState(false)
  const [showLightbox, setShowLightbox] = useState(false)

  const [comments, setComments] = useState<any[]>([
    { id: 1, author: 'MINH K. (ART DIRECTOR)', text: 'Nên cho tác giả thêm 1 chương để triển khai tâm lý nhân vật.', time: '10 phút trước', isChief: false },
    { id: 2, author: 'LAN PHƯƠNG (EDITOR)', text: 'Đồng ý, nhịp truyện nếu thay đổi đột ngột quá sẽ phản tác dụng.', time: '30 phút trước', isChief: false },
    { id: 3, author: 'TRẦN K. (CHIEF EDITOR)', text: 'Tôi sẽ thẩm định kỹ phác thảo trang 12-15 và đưa ra phán quyết trưa nay.', time: '5 phút trước', isChief: true }
  ])
  const [newComment, setNewComment] = useState('')

  useEffect(() => {
    const loadDetail = async () => {
      if (!caseId) return
      try {
        const res = await disputeService.getById(caseId)
        if (res) {
          setCaseItem(res as any)
          if (res.chiefDecision) setVerdict(res.chiefDecision)
          if (res.chiefCompromise) setCompromiseText(res.chiefCompromise)
          if (res.chiefNextActions) setNextActions(res.chiefNextActions)
          return
        }
      } catch (err) {
        console.warn('API error fetching dispute details, falling back to local storage:', err)
      }
      
      const mockItem = boardStore.getDisputeCase(caseId)
      if (mockItem) {
        setCaseItem(mockItem)
        if (mockItem.chiefDecision) setVerdict(mockItem.chiefDecision)
        if (mockItem.chiefCompromise) setCompromiseText(mockItem.chiefCompromise)
        if (mockItem.chiefNextActions) setNextActions(mockItem.chiefNextActions)
      }
    }
    loadDetail()
  }, [caseId])

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return
    setComments([...comments, {
      id: Date.now(),
      author: 'TRẦN K. (CHIEF EDITOR)',
      text: newComment,
      time: 'Vừa xong',
      isChief: true
    }])
    setNewComment('')
  }

  const handleDeleteComment = (commentId: number) => {
    setComments(comments.filter(c => c.id !== commentId))
  }

  const handlePublishVerdict = () => {
    if (compromiseText.length < 50) return
    setShowConfirmModal(true)
    setConfirmStep(1)
  }

  const confirmVerdictPublish = async () => {
    if (confirmStep === 1) {
      setConfirmStep(2)
    } else {
      // Call real API with fallback
      if (caseId) {
        try {
          await disputeService.saveVerdict(caseId, verdict, compromiseText, nextActions)
        } catch (err) {
          console.warn('API error saving dispute verdict, falling back to local storage:', err)
        }
        
        // Local storage fallback
        const list = boardStore.getDisputeCases()
        const updated = list.map(c => {
          if (c.id === caseId) {
            return {
              ...c,
              status: 'DECIDED' as const,
              chiefDecision: verdict,
              chiefCompromise: compromiseText,
              chiefNextActions: nextActions
            }
          }
          return c
        })
        localStorage.setItem('board_disputes', JSON.stringify(updated))
      }
      setShowConfirmModal(false)
      // Redirect to Screen 4 (Send Notification) with Dispute context
      navigate(`/dashboard/editorial-board/review/dispute-${caseId}/decision`, {
        state: {
          templateType: 'CANCELLATION', // Dispute resolution maps close to schedule/cancellation type
          projectName: caseItem?.projectTitle,
          verdictType: verdict,
          resolution: compromiseText
        }
      })
    }
  }

  if (!caseItem) {
    return <div className="p-8 text-center text-red-500 font-bold">Không tìm thấy báo cáo tranh cãi.</div>
  }

  return (
    <div className="max-w-6xl mx-auto pb-12 font-sans text-manga-ink relative">
      
      {/* Lightbox sketch preview */}
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
            <p className="text-center font-bold text-xs uppercase mt-3">Phác thảo biểu cảm chương 45 (Bản nháp gốc)</p>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border-4 border-manga-ink p-6 shadow-[8px_8px_0px_rgba(0,0,0,1)]">
            <div className="bg-manga-ink text-white p-3 font-manga font-bold text-sm tracking-wide uppercase border-b-2 border-black -mx-6 -mt-6 mb-6">
              {confirmStep === 1 ? 'XÁC NHẬN PHÁN QUYẾT: BƯỚC 1/2' : 'XÁC NHẬN CHÍNH THỨC: BƯỚC 2/2'}
            </div>

            {confirmStep === 1 ? (
              <div className="space-y-4">
                <p className="text-xs font-bold leading-relaxed text-gray-700">
                  Bạn đang chuẩn bị ban hành phán quyết chính thức cho <strong className="text-manga-ink">CASE #{caseItem.id}</strong>. Phán quyết này có giá trị ràng buộc trực tiếp và gửi thông báo tới Tác giả/Biên tập viên.
                </p>
                <div className="bg-zinc-50 border-2 border-manga-ink p-3 text-xs font-semibold">
                  <span className="block text-[10px] text-gray-400 font-bold uppercase">Phương thức phán quyết:</span>
                  <strong className="text-manga-red">
                    {verdict === 'AUTHOR' ? 'Nghiêng về Tác giả' : verdict === 'EDITOR' ? 'Nghiêng về Biên tập' : 'Thỏa hiệp bắt buộc'}
                  </strong>
                </div>
                <button
                  onClick={confirmVerdictPublish}
                  className="w-full py-3 bg-manga-ink text-white border-2 border-black font-manga font-bold text-xs uppercase tracking-wider shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-manga-red transition-all cursor-pointer"
                >
                  TÔI XÁC NHẬN QUYẾT ĐỊNH NÀY &gt;
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs font-bold leading-relaxed text-manga-red uppercase tracking-wider">
                  ⚠️ CẢNH BÁO: HÀNH ĐỘNG KHÔNG THỂ HOÀN TÁC.
                </p>
                <p className="text-xs font-bold leading-relaxed text-gray-700">
                  Hệ thống sẽ lưu vĩnh viễn phán quyết này vào hồ sơ Serialization và tự động chuyển bạn sang màn hình soạn thảo thông báo chính thức.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="flex-1 py-3 bg-white border-2 border-manga-ink font-manga font-bold text-xs uppercase hover:bg-zinc-50 cursor-pointer"
                  >
                    HỦY BỎ
                  </button>
                  <button
                    onClick={confirmVerdictPublish}
                    className="flex-1 py-3 bg-manga-red text-white border-2 border-black font-manga font-bold text-xs uppercase shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:bg-red-700 transition-all cursor-pointer"
                  >
                    BAN HÀNH NGAY
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PDF Export Modal */}
      {showPdfModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white border-4 border-manga-ink p-6 shadow-[8px_8px_0px_rgba(0,0,0,1)] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b-4 border-manga-ink pb-3 mb-6">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-manga-red" />
                <h3 className="font-manga text-xl font-black uppercase">Xem trước PDF Dispute Report</h3>
              </div>
              <button 
                onClick={() => setShowPdfModal(false)}
                className="text-gray-500 hover:text-manga-red font-bold text-sm cursor-pointer"
              >
                ĐÓNG [X]
              </button>
            </div>

            {/* Document Body */}
            <div className="border-2 border-dashed border-gray-300 p-8 font-serif bg-zinc-50 text-xs text-zinc-800 space-y-6 shadow-inner">
              <div className="text-center border-b-2 border-manga-ink pb-4">
                <h2 className="font-sans font-black text-lg tracking-widest text-manga-ink uppercase">MANGAFLOW EDITORIAL BOARD</h2>
                <p className="font-sans text-[9px] font-bold text-gray-500 uppercase mt-1">OFFICIAL DISPUTE CASE REPORT — CONFIDENTIAL</p>
              </div>

              <div className="grid grid-cols-2 gap-4 font-sans text-[10px] font-bold border-b border-gray-200 pb-4">
                <div>
                  <p className="text-gray-400">MÃ VỤ VIỆC:</p>
                  <p className="text-manga-ink">CASE #MF-8492</p>
                  <p className="text-gray-400 mt-2">DỰ ÁN SERIALIZATION:</p>
                  <p className="text-manga-ink">Bóng Đêm Vô Tận (Ch. 45)</p>
                </div>
                <div>
                  <p className="text-gray-400">NGƯỜI QUYẾT ĐỊNH:</p>
                  <p className="text-manga-ink">Trần K. (Trưởng ban Biên tập)</p>
                  <p className="text-gray-400 mt-2">NGÀY BAN HÀNH PHÁN QUYẾT:</p>
                  <p className="text-manga-ink">{new Date().toLocaleDateString('vi-VN')}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-sans font-bold uppercase text-manga-ink border-b border-gray-200 pb-1">1. LẬP TRƯỜNG CÁC BÊN</h4>
                <p><strong>Tác giả (Nguyễn Văn A):</strong> "{caseItem.authorOpinion}"</p>
                <p><strong>Biên tập viên phụ trách (Trần Thị B):</strong> "{caseItem.editorOpinion}"</p>
              </div>

              <div className="space-y-3 bg-white p-4 border border-manga-ink font-sans">
                <h4 className="font-bold uppercase text-manga-red border-b border-gray-100 pb-1">2. PHÁN QUYẾT TỪ TRƯỞNG BAN BIÊN TẬP</h4>
                <p className="text-xs font-black text-manga-ink uppercase">
                  Hình thức: {verdict === 'AUTHOR' ? 'Ủng hộ Mangaka' : verdict === 'EDITOR' ? 'Ủng hộ Biên tập viên' : 'Thỏa hiệp bắt buộc'}
                </p>
                <p className="italic leading-relaxed">
                  " {compromiseText || 'Chưa nhập chi tiết giải pháp đề xuất.'} "
                </p>
                <p className="text-[10px] font-bold text-gray-500 mt-2">
                  Hành động tiếp theo: {nextActions || 'Không có.'}
                </p>
              </div>

              <div className="pt-8 flex justify-between items-center font-sans text-[9px] font-bold">
                <div className="text-center">
                  <p className="text-gray-400">TRƯỞNG BAN BIÊN TẬP</p>
                  <div className="h-12 w-28 border border-dashed border-gray-300 my-2 flex items-center justify-center text-gray-300">Chữ ký điện tử</div>
                  <p className="text-manga-ink">Trần K.</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400">ĐẠI DIỆN HỘI ĐỒNG THẨM ĐỊNH</p>
                  <div className="h-12 w-28 border border-dashed border-gray-300 my-2 flex items-center justify-center text-gray-300">Đã kiểm chứng</div>
                  <p className="text-manga-ink">Minamoto Shizuka</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button 
                onClick={() => setShowPdfModal(false)}
                className="px-5 py-2.5 bg-white border-2 border-manga-ink font-bold text-xs uppercase cursor-pointer"
              >
                QUAY LẠI
              </button>
              <button 
                onClick={() => { alert('Tải tệp tin CASE_REPORT_MF-8492.pdf thành công!'); setShowPdfModal(false); }}
                className="px-5 py-2.5 bg-manga-ink text-white border-2 border-manga-ink font-bold text-xs uppercase flex items-center gap-1.5 shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:bg-manga-red transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>TẢI PDF XUỐNG</span>
              </button>
            </div>
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
          <h1 className="font-manga text-3xl md:text-4xl font-bold uppercase">
            XÉT DUYỆT BÁO CÁO TRANH CÃI (CHIEF)
          </h1>
          <p className="text-xs font-bold text-gray-500 uppercase mt-1">
            Dự án: "{caseItem.projectTitle}" — Vấn đề: {caseItem.issue}
          </p>
        </div>
        <button 
          onClick={() => setShowPdfModal(true)}
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
                <h4 className="font-manga text-base font-bold leading-tight">{caseItem.authorName}</h4>
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
                <h4 className="font-manga text-base font-bold leading-tight">{caseItem.editorName}</h4>
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

      {/* Consultation & Verdict Section (Chief Unlocked) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mb-8">
        
        {/* Left Bottom: Member Opinions Breakdown (Chief Only widget) */}
        <div className="bg-white border-4 border-manga-ink p-6 shadow-[6px_6px_0px_rgba(15,15,15,1)]">
          <div className="inline-block px-3 py-1 bg-manga-ink text-white font-bold uppercase text-[9px] border-2 border-manga-ink shadow-sm mb-4">
            Ý KIẾN HỘI ĐỒNG BIÊN TẬP
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                <span>Khảo sát ý kiến (7 thành viên)</span>
                <span className="text-manga-red">86% ĐÃ SUBMIT</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold bg-zinc-50 border border-manga-ink p-2">
                  <span>Nghiêng về Tác giả</span>
                  <span className="bg-gray-200 px-2 py-0.5 border text-[10px]">2 phiếu</span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold bg-zinc-50 border border-manga-ink p-2">
                  <span>Nghiêng về Biên tập viên</span>
                  <span className="bg-gray-200 px-2 py-0.5 border text-[10px]">1 phiếu</span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold bg-[#fffdf0] border-2 border-manga-ink p-2">
                  <span>Thỏa hiệp bắt buộc</span>
                  <span className="bg-manga-red text-white px-2 py-0.5 border border-manga-ink text-[10px]">4 phiếu</span>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 font-semibold leading-relaxed">
              *Hội đồng thẩm định nghiêng về phương án **Thỏa hiệp**. Chief nên xem xét giải pháp kết hợp để giữ nguyên tính nghệ thuật của tác giả và nhịp truyện của biên tập.
            </p>
          </div>
        </div>

        {/* Right Bottom Verdict Form: Unlocked for Chief */}
        <div className="lg:col-span-2 bg-white border-4 border-manga-ink p-6 shadow-[6px_6px_0px_rgba(15,15,15,1)] flex flex-col justify-between">
          <div>
            <div className="inline-block px-3 py-1 bg-manga-red text-white font-bold uppercase text-[9px] border-2 border-manga-ink shadow-sm mb-4">
              QUYẾT ĐỊNH PHÁN QUYẾT CỦA TRƯỞNG BAN
            </div>
            
            <div className="space-y-4">
              {/* Leaning Selector */}
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-500 mb-2">1. CHỌN PHÁN ĐỊNH PHÙ HỢP</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    onClick={() => setVerdict('AUTHOR')}
                    className={`py-2 px-3 border-2 font-bold text-xs uppercase transition-all cursor-pointer ${
                      verdict === 'AUTHOR'
                        ? 'bg-manga-red text-white border-manga-ink shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                        : 'bg-white border-gray-300 hover:bg-zinc-50'
                    }`}
                  >
                    Nghiêng về Tác giả
                  </button>
                  <button
                    onClick={() => setVerdict('EDITOR')}
                    className={`py-2 px-3 border-2 font-bold text-xs uppercase transition-all cursor-pointer ${
                      verdict === 'EDITOR'
                        ? 'bg-manga-red text-white border-manga-ink shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                        : 'bg-white border-gray-300 hover:bg-zinc-50'
                    }`}
                  >
                    Nghiêng về Biên tập
                  </button>
                  <button
                    onClick={() => setVerdict('COMPROMISE')}
                    className={`py-2 px-3 border-2 font-bold text-xs uppercase transition-all cursor-pointer ${
                      verdict === 'COMPROMISE'
                        ? 'bg-manga-red text-white border-manga-ink shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                        : 'bg-white border-gray-300 hover:bg-zinc-50'
                    }`}
                  >
                    Thỏa hiệp bắt buộc
                  </button>
                </div>
              </div>

              {/* Solution Textarea with Character Counter */}
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-500 mb-1.5 flex justify-between">
                  <span>2. GIẢI PHÁP ĐỀ XUẤT (TỐI THIỂU 50 KÝ TỰ)</span>
                  <span className={compromiseText.length >= 50 ? 'text-emerald-600' : 'text-manga-red'}>
                    {compromiseText.length}/50 ký tự
                  </span>
                </label>
                <textarea
                  value={compromiseText}
                  onChange={e => setCompromiseText(e.target.value)}
                  placeholder="Ví dụ: Cho phép nhân vật chính có 1-2 trang độc thoại nội tâm dữ dội trước khi xuống tay, nhằm thỏa mãn tính logic phát triển nhân vật của tác giả, nhưng đồng thời nhịp hành động bạo lực vẫn xảy ra nhanh gọn ở cuối chương..."
                  className="w-full border-2 border-manga-ink p-3 text-xs font-bold outline-none focus:border-manga-red bg-zinc-50 h-24"
                />
              </div>

              {/* Next Actions */}
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-500 mb-1.5">3. HÀNH ĐỘNG TIẾP THEO</label>
                <input
                  type="text"
                  value={nextActions}
                  onChange={e => setNextActions(e.target.value)}
                  placeholder="Ví dụ: Yêu cầu vẽ lại storyboard trang 12-15"
                  className="w-full border-2 border-manga-ink px-3 py-2.5 text-xs font-bold outline-none focus:border-manga-red bg-zinc-50"
                />
              </div>

              <div className="flex justify-end border-t-2 border-dashed border-gray-300 pt-4 mt-2">
                <button
                  onClick={handlePublishVerdict}
                  disabled={compromiseText.length < 50}
                  className="bg-manga-ink text-white font-manga font-bold text-xs uppercase px-8 py-3 border-2 border-manga-ink shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:bg-manga-red hover:shadow-[1px_1px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] active:translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-manga-ink disabled:shadow-[3px_3px_0px_rgba(0,0,0,1)] disabled:translate-y-0 transition-all cursor-pointer"
                >
                  BAN HÀNH PHÁN QUYẾT
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Board comments discussion section (Chief comment style, pin and delete action) */}
      <div className="bg-white border-4 border-manga-ink p-6 shadow-[6px_6px_0px_rgba(15,15,15,1)]">
        <h3 className="font-manga text-xl font-black uppercase border-b-4 border-manga-ink pb-3 mb-6">
          THẢO LUẬN HỘI ĐỒNG (DISPUTE DISCUSSION)
        </h3>

        <div className="space-y-4 mb-6">
          {comments.map((comment) => (
            <div 
              key={comment.id} 
              className={`pl-4 py-2 bg-zinc-50/50 flex justify-between items-start border-l-4 ${
                comment.isChief ? 'border-manga-red bg-[#fff5f5]' : 'border-manga-ink'
              }`}
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-black uppercase ${comment.isChief ? 'text-manga-red' : 'text-manga-ink'}`}>
                    {comment.isChief ? '★ ' : ''}{comment.author}
                  </span>
                  <span className="text-[8px] text-gray-400 font-bold uppercase">{comment.time}</span>
                </div>
                <p className="text-xs font-bold text-zinc-700 leading-normal">{comment.text}</p>
              </div>

              {/* Chief comment actions: pin & delete */}
              <div className="flex gap-2">
                <button
                  onClick={() => alert('Đã ghim bình luận này lên đầu!')}
                  className="text-gray-400 hover:text-manga-ink text-[10px] font-bold uppercase cursor-pointer"
                  title="Ghim bình luận"
                >
                  📌 Ghim
                </button>
                <button
                  onClick={() => handleDeleteComment(comment.id)}
                  className="text-gray-400 hover:text-manga-red text-[10px] font-bold uppercase cursor-pointer"
                  title="Xóa bình luận"
                >
                  ✕ Xóa
                </button>
              </div>
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
