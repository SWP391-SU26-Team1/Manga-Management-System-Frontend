import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Lock, ArrowLeft, History, Check, AlertTriangle, ShieldCheck, X } from 'lucide-react'
import { boardService } from '@/services/board.service'

// Helper to load current user
const getStoredUser = () => {
  const data = localStorage.getItem('mangaflow_user')
  return data ? JSON.parse(data) : { fullName: 'Minamoto Shizuka', role: 'BOARD' }
}

export default function RecoveryPage() {
  const navigate = useNavigate()
  const currentUser = getStoredUser()
  const isChief = currentUser?.isChief || currentUser?.email === 'chiefeditor@mangaflow.com'

  // Mock Recovery dossiers
  const [dossiers, setDossiers] = useState([
    {
      id: 'rec_001',
      title: 'SHADOW PROTOCOL',
      genre: 'Action / Cyberpunk',
      avatar: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=200&auto=format&fit=crop',
      warningReason: '3 tuần liên tiếp dưới hạng 40 (Rank trung bình: 42.3)',
      authorPledge: 'Tôi cam kết sẽ thay đổi cấu trúc khung tranh từ chương 105, bổ sung thêm 2 cảnh đại chiến hoành tráng để đẩy nhanh cao trào, và rút ngắn hội thoại thừa.',
      editorPledge: 'Chúng tôi sẽ tăng tần suất review storyboard lên 2 lần/tuần, trực tiếp kiểm tra tiến độ phác thảo bối cảnh nền và hỗ trợ Mangaka tinh chỉnh lời thoại ngắn gọn.',
      ranks: ['Tuần 7: Hạng 38', 'Tuần 8: Hạng 42', 'Tuần 9: Hạng 45'],
      status: 'PENDING'
    },
    {
      id: 'rec_002',
      title: 'INK & DAGGERS',
      genre: 'Historical / Martial Arts',
      avatar: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=200&auto=format&fit=crop',
      warningReason: 'Chương 104 trì hoãn phát hành quá hạn quy định 48h',
      authorPledge: 'Cam kết tối ưu hóa quy trình inking bằng trợ lý vẽ nét phụ bối cảnh để tránh tắc nghẽn sản xuất. Đảm bảo chương 105-110 nộp đúng hạn.',
      editorPledge: 'Đã thiết lập liên lạc trực tiếp hàng ngày với studio sáng tác để cảnh báo deadline sớm 24 giờ trước thời điểm đóng bản thảo.',
      ranks: ['Tuần 7: Hạng 12', 'Tuần 8: Hạng 15', 'Tuần 9: Delayed (Trì hoãn)'],
      status: 'PENDING'
    }
  ])

  const [toastMessage, setToastMessage] = useState('')

  const handleApproveRecovery = async (id: string, title: string) => {
    try {
      // await boardService.evaluateRecoveryPlan(id, 'APPROVED', 'Duyệt hồ sơ cam kết phục hồi.')
    } catch (err) {
      console.warn('API error approving recovery plan:', err)
    }

    setDossiers(dossiers.map(d => d.id === id ? { ...d, status: 'APPROVED' } : d))
    setToastMessage(`✓ Đã duyệt hồ sơ phục hồi cho '${title}'. Thời gian thử thách 4 tuần được kích hoạt.`)
    setTimeout(() => setToastMessage(''), 3000)
  }

  const handleRejectRecovery = async (id: string, title: string) => {
    try {
      // await boardService.evaluateRecoveryPlan(id, 'REJECTED', 'Từ chối hồ sơ cam kết phục hồi.')
    } catch (err) {
      console.warn('API error rejecting recovery plan:', err)
    }

    setDossiers(dossiers.filter(d => d.id !== id))
    // Redirect to Screen 4 (Send Notification) to cancel the series
    navigate('/dashboard/editorial-board/send-notification', {
      state: {
        templateType: 'CANCELLATION',
        projectName: `${title} (Series)`,
        resolution: `Từ chối hồ sơ cam kết phục hồi. Chính thức đình chỉ Serialization và thu hồi slot tạp chí phát hành.`
      }
    })
  }

  // 1. LOCKED VIEW FOR MEMBERS (Original content)
  if (!isChief) {
    return (
      <div className="max-w-md mx-auto py-16 text-center font-sans">
        <div className="bg-white border-4 border-manga-ink p-8 shadow-[8px_8px_0px_rgba(15,15,15,1)] flex flex-col items-center">
          <div className="w-16 h-16 bg-manga-red text-white flex items-center justify-center rounded-full border-4 border-manga-ink shadow-md mb-6 animate-bounce">
            <Lock className="w-8 h-8" />
          </div>

          <h2 className="font-manga text-3xl font-black uppercase text-manga-ink leading-none mb-3">
            CHIEF EDITOR ONLY
          </h2>
          <div className="h-1.5 w-16 bg-manga-red mb-4" />
          
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-6 leading-relaxed">
            Tính năng <strong>Hồ sơ phục hồi</strong> chỉ dành riêng cho vai trò Trưởng ban Biên tập (Chief Editor). Bạn không có quyền truy cập trang này.
          </p>

          <Link 
            to="/dashboard/editorial-board"
            className="flex items-center justify-center gap-1.5 bg-manga-ink text-white font-manga font-bold text-xs uppercase px-6 py-3 border-2 border-manga-ink shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-manga-red hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>VỀ TRANG CHỦ</span>
          </Link>
        </div>
      </div>
    )
  }

  // 2. UNLOCKED COCKPIT FOR CHIEF EDITOR
  return (
    <div className="max-w-5xl mx-auto pb-12 font-sans text-manga-ink relative">
      
      {/* Dynamic Success Toast */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-500 text-white font-sans font-bold border-4 border-manga-ink p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)] animate-fade-in flex items-center gap-2">
          <ShieldCheck className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header breadcrumbs */}
      <div className="mb-4 flex items-center justify-between">
        <Link 
          to="/dashboard/editorial-board"
          className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-manga-ink hover:text-manga-red"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về trang chủ</span>
        </Link>
        <span className="bg-manga-ink text-white font-bold text-[10px] px-2.5 py-1 border-2 border-manga-ink uppercase">
          CHIEF CONSOLE
        </span>
      </div>

      <h1 className="font-manga text-3xl md:text-4xl font-bold uppercase mb-2 flex items-center gap-2.5">
        <History className="w-8 h-8 text-manga-red" />
        <span>HỒ SƠ PHỤC HỒI (AT RISK DOSSIERS)</span>
      </h1>
      <div className="h-1.5 w-24 bg-manga-red mb-3" />
      <p className="text-xs font-bold text-gray-500 uppercase mb-8">
        Xem xét đơn cam kết và lộ trình khắc phục của các tác phẩm nằm trong diện sụt giảm nghiêm trọng
      </p>

      {/* Dossier Grid list */}
      <div className="space-y-8">
        {dossiers.map((d) => (
          <div 
            key={d.id}
            className="bg-white border-4 border-manga-ink p-6 shadow-[8px_8px_0px_rgba(15,15,15,1)] flex flex-col gap-6"
          >
            {/* Header info bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-dashed border-gray-200 pb-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-16 border-2 border-manga-ink shadow-sm overflow-hidden bg-zinc-50 shrink-0">
                  <img src={d.avatar} alt={d.title} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-manga text-2xl font-bold uppercase text-manga-ink leading-none">{d.title}</h3>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1 block">{d.genre}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="bg-[#fff1f2] border-2 border-manga-ink text-[#e11d48] text-[9px] font-black px-2.5 py-1 uppercase tracking-wider">
                  {d.warningReason}
                </span>
              </div>
            </div>

            {/* Content description */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Column 1: Mangaka Commitment */}
              <div className="space-y-2 bg-[#fdfdfd] border-2 border-manga-ink p-4 shadow-sm">
                <h4 className="text-[10px] font-black uppercase text-manga-red">✍ CAM KẾT HỌA SĨ (MANGAKA)</h4>
                <p className="text-xs font-bold text-zinc-700 italic leading-relaxed">
                  "{d.authorPledge}"
                </p>
              </div>

              {/* Column 2: Editor Coordination */}
              <div className="space-y-2 bg-[#fdfdfd] border-2 border-manga-ink p-4 shadow-sm">
                <h4 className="text-[10px] font-black uppercase text-manga-ink">📂 CAM KẾT BIÊN TẬP (TANTOU)</h4>
                <p className="text-xs font-bold text-zinc-700 italic leading-relaxed">
                  "{d.editorPledge}"
                </p>
              </div>

              {/* Column 3: Stats history & Actions */}
              <div className="space-y-4 flex flex-col justify-between">
                <div>
                  <h4 className="text-[10px] font-black uppercase text-gray-400 mb-2">LỊCH SỬ THỨ HẠNG GẦN NHẤT</h4>
                  <div className="flex flex-col gap-1 text-[11px] font-black">
                    {d.ranks.map((r, i) => (
                      <span key={i} className="bg-zinc-50 border border-gray-200 px-2.5 py-1 uppercase">{r}</span>
                    ))}
                  </div>
                </div>

                {d.status === 'APPROVED' ? (
                  <div className="bg-emerald-50 border-2 border-emerald-500 p-2.5 text-center text-emerald-700 text-xs font-black uppercase flex items-center justify-center gap-1">
                    <Check className="w-4 h-4" />
                    <span>Hồ sơ đã được duyệt phục hồi</span>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRejectRecovery(d.id, d.title)}
                      className="flex-1 py-2 bg-manga-ink hover:bg-manga-red text-white border-2 border-manga-ink font-manga font-bold text-xs uppercase transition-colors shadow-sm cursor-pointer"
                    >
                      HỦY BỎ SERIES
                    </button>
                    <button
                      onClick={() => handleApproveRecovery(d.id, d.title)}
                      className="flex-1 py-2 bg-manga-red text-white border-2 border-black font-manga font-bold text-xs uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-red-700 transition-all cursor-pointer"
                    >
                      DUYỆT PHỤC HỒI
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        ))}

        {dossiers.length === 0 && (
          <div className="text-center border-4 border-dashed border-gray-200 py-12">
            <p className="text-xs font-bold text-gray-400 uppercase">Không còn hồ sơ phục hồi nào đang chờ xét duyệt.</p>
          </div>
        )}
      </div>
    </div>
  )
}
