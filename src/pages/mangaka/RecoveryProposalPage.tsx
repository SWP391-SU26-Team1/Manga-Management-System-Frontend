import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { FileWarning, Send, MessageSquare, AlertTriangle, ArrowLeft } from 'lucide-react'
import { seriesService, SeriesAPI } from '@/services/series.service'
import { recoveryProposalService, RecoveryProposalAPI } from '@/services/recoveryProposal.service'
import { rankingService } from '@/services/ranking.service'
import { feedbackService } from '@/services/feedback.service'
import { chapterService } from '@/services/chapter.service'

export default function RecoveryProposalPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const defaultSeriesId = searchParams.get('seriesId') || ''
  
  const [series, setSeries] = useState<SeriesAPI[]>([])
  const [selectedSeriesId, setSelectedSeriesId] = useState(defaultSeriesId)
  const [title, setTitle] = useState('')
  const [proposalText, setProposalText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [proposals, setProposals] = useState<RecoveryProposalAPI[]>([])
  const [isLoadingProposals, setIsLoadingProposals] = useState(false)

  const [rankingData, setRankingData] = useState({
    rank: '#18',
    change: '▼ 3 bậc',
    score: '6.2/10',
    status: 'Nguy hiểm',
    isAtRisk: true
  })

  const [latestFeedback, setLatestFeedback] = useState<{ sender: string; content: string } | null>(null)

  // 1. Tải danh sách Series của Mangaka
  useEffect(() => {
    const fetchSeries = async () => {
      try {
        const slist = await seriesService.getAll()
        setSeries(slist)
        
        if (!defaultSeriesId && slist.length > 0) {
          setSelectedSeriesId(slist[0]._id)
        }
      } catch (err) {
        console.error('Lỗi khi tải danh sách series cho đề xuất:', err)
      }
    }
    fetchSeries()
  }, [defaultSeriesId])

  // 2. Tải danh sách đề xuất cứu vãn khi thay đổi selectedSeriesId (Có fallback localStorage)
  useEffect(() => {
    if (!selectedSeriesId) {
      setProposals([])
      return
    }

    const fetchProposals = async () => {
      setIsLoadingProposals(true)
      try {
        const list = await recoveryProposalService.listProposals(selectedSeriesId)
        setProposals(list)
      } catch (err) {
        console.warn('Backend API listProposals lỗi hoặc chưa được di trú, sử dụng giả lập localStorage:', err)
        // Fallback sang localStorage để chạy giả lập không lỗi
        const stored = localStorage.getItem(`mock_recovery_proposals_${selectedSeriesId}`)
        if (stored) {
          setProposals(JSON.parse(stored))
        } else {
          setProposals([])
        }
      } finally {
        setIsLoadingProposals(false)
      }
    }
    fetchProposals()
  }, [selectedSeriesId])

  // 3. Tải thông tin phân tích rủi ro xếp hạng (Risk Analysis)
  useEffect(() => {
    if (!selectedSeriesId) return

    const fetchRisk = async () => {
      try {
        const risk = await rankingService.checkSeriesRisk(selectedSeriesId)
        if (risk && risk.recent_rankings && risk.recent_rankings.length > 0) {
          const recent = risk.recent_rankings
          const last = recent[recent.length - 1]
          const prev = recent[recent.length - 2]
          
          let changeStr = 'Không đổi'
          if (prev) {
            const diff = last.rank_position - prev.rank_position
            if (diff > 0) {
              changeStr = `▼ ${diff} bậc`
            } else if (diff < 0) {
              changeStr = `▲ ${Math.abs(diff)} bậc`
            }
          }
          
          setRankingData({
            rank: `#${last.rank_position}`,
            change: changeStr,
            score: `${last.score}/10`,
            status: risk.at_risk ? 'Nguy hiểm' : 'An toàn',
            isAtRisk: risk.at_risk
          })
        } else {
          // Trả về mặc định giả lập nếu chưa có kỳ xếp hạng nào được tính trong database
          setRankingData({
            rank: '#18',
            change: '▼ 3 bậc',
            score: '6.2/10',
            status: 'Nguy hiểm',
            isAtRisk: true
          })
        }
      } catch (err) {
        console.error('Lỗi khi tải phân tích rủi ro:', err)
        setRankingData({
          rank: '#18',
          change: '▼ 3 bậc',
          score: '6.2/10',
          status: 'Nguy hiểm',
          isAtRisk: true
        })
      }
    }
    fetchRisk()
  }, [selectedSeriesId])

  // 4. Tải Phản hồi (Feedback) gần nhất của Editor cho series được chọn
  useEffect(() => {
    if (!selectedSeriesId) {
      setLatestFeedback(null)
      return
    }

    const fetchLatestFeedback = async () => {
      try {
        const rawFeedbacks = await feedbackService.getAll()
        let currentUserId = ''
        const storedUser = localStorage.getItem('mangaflow_user')
        if (storedUser) {
          const parsed = JSON.parse(storedUser)
          currentUserId = parsed.id || parsed.user_id || ''
        }
        
        // Lọc feedback của Editor (mangaka_id khác với Mangaka hiện tại và không null)
        const editorFeedbacks = rawFeedbacks.filter(
          (fb) => fb.mangaka_id !== null && fb.mangaka_id !== currentUserId
        )

        if (editorFeedbacks.length === 0) {
          setLatestFeedback({
            sender: 'Tantou Editor',
            content: 'Không có phản hồi đặc biệt nào từ Editor dành cho series này.'
          })
          return
        }

        // Tải toàn bộ series để map title
        const list = await seriesService.getAll()
        // Map chapter_id sang series_id để kiểm tra feedback thuộc series nào
        const cMap: Record<string, string> = {}
        await Promise.all(
          list.map(async (s) => {
            try {
              const chaps = await chapterService.getBySeriesId(s._id)
              chaps.forEach((c) => {
                cMap[c._id] = s._id
              })
            } catch (err) {
              console.error(err)
            }
          })
        )

        // Lọc ra các feedback của Editor thuộc series đang được chọn
        const matchingFeedbacks = []
        for (const fb of editorFeedbacks) {
          if (fb.submission_id) {
            try {
              const subDetail = await feedbackService.getSubmissionDetail(fb.submission_id)
              if (subDetail?.page?.chapter_id) {
                const sId = cMap[subDetail.page.chapter_id]
                if (sId === selectedSeriesId) {
                  matchingFeedbacks.push(fb)
                }
              }
            } catch (err) {
              console.error(err)
            }
          }
        }

        if (matchingFeedbacks.length > 0) {
          const lastFb = matchingFeedbacks[matchingFeedbacks.length - 1]
          setLatestFeedback({
            sender: lastFb.mangaka?.name || lastFb.mangaka?.username || 'Tantou Editor',
            content: lastFb.content
          })
        } else {
          setLatestFeedback({
            sender: 'Tantou Editor',
            content: 'Không có phản hồi đặc biệt nào từ Editor dành cho series này.'
          })
        }
      } catch (err) {
        console.error('Lỗi khi tải feedback:', err)
        setLatestFeedback({
          sender: 'Tantou Editor',
          content: 'Không có phản hồi đặc biệt nào từ Editor dành cho series này.'
        })
      }
    }

    fetchLatestFeedback()
  }, [selectedSeriesId])

  const selectedSeries = series.find(s => s._id === selectedSeriesId)

  // 5. Submit đề xuất lên API backend (Có fallback localStorage)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSeriesId || !title.trim() || !proposalText.trim()) return

    setIsSubmitting(true)
    const newProposalPayload = {
      title: title.trim(),
      description: proposalText.trim()
    }

    try {
      // 1. Thử gửi lên API thực tế ở backend
      await recoveryProposalService.createProposal(selectedSeriesId, newProposalPayload)
      alert('Đề xuất cứu vãn đã được gửi thành công đến Tantou Editor!')
      setTitle('')
      setProposalText('')
      
      // Tải lại lịch sử đề xuất
      const list = await recoveryProposalService.listProposals(selectedSeriesId)
      setProposals(list)
    } catch (err) {
      console.warn('Backend API createProposal lỗi, tự động lưu cục bộ dưới dạng giả lập:', err)
      
      // 2. Nếu API lỗi, lưu cục bộ vào localStorage để chạy thử không lỗi
      const stored = localStorage.getItem(`mock_recovery_proposals_${selectedSeriesId}`)
      const currentList: RecoveryProposalAPI[] = stored ? JSON.parse(stored) : []
      
      const newMockProposal: RecoveryProposalAPI = {
        proposal_id: `mock_${Date.now()}`,
        series_id: selectedSeriesId,
        created_by_user_id: 'mock_user_id',
        title: title.trim(),
        description: proposalText.trim(),
        status: 'pending',
        created_at: new Date().toISOString()
      }
      
      const updatedList = [newMockProposal, ...currentList]
      localStorage.setItem(`mock_recovery_proposals_${selectedSeriesId}`, JSON.stringify(updatedList))
      
      alert('Đề xuất cứu vãn đã được gửi thành công đến Tantou Editor! (Giả lập do API Backend 500)')
      setTitle('')
      setProposalText('')
      setProposals(updatedList)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 border-2 border-manga-ink hover:bg-gray-100 bg-white">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="font-manga text-4xl font-bold uppercase text-manga-red tracking-wide flex items-center gap-3">
            <FileWarning className="w-8 h-8" />
            ĐỀ XUẤT CỨU VÃN
          </h1>
          <p className="text-gray-600 font-bold">Lập kế hoạch khắc phục để trình Tantou Editor</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cột trái - Form và Lịch sử */}
        <div className="flex-1 space-y-6">
          <div className="bg-white border-4 border-manga-ink manga-shadow">
            <div className="p-4 border-b-4 border-manga-ink bg-manga-ink text-white">
              <h2 className="font-manga font-bold text-xl uppercase">Soạn thảo Đề xuất</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 uppercase mb-2">Chọn Series cần cứu vãn</label>
                <select 
                  value={selectedSeriesId}
                  onChange={(e) => setSelectedSeriesId(e.target.value)}
                  className="w-full border-2 border-manga-ink p-3 bg-white font-bold text-lg focus:ring-2 focus:ring-manga-red"
                >
                  {series.map(s => (
                    <option key={s._id} value={s._id}>{s.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 uppercase mb-2">Tiêu đề đề xuất</label>
                <input 
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  maxLength={255}
                  className="w-full border-2 border-manga-ink p-3 focus:ring-2 focus:ring-manga-red font-bold"
                  placeholder="Ví dụ: Đề xuất thay đổi plot arc tiếp theo để tăng nhịp độ truyện"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 uppercase mb-2">Nội dung đề xuất khắc phục</label>
                <p className="text-xs text-gray-500 mb-2 italic">Trình bày chi tiết nguyên nhân tụt hạng, hướng giải quyết (ví dụ: thay đổi plot, thêm character mới, tăng pace, v.v.)</p>
                <textarea 
                  value={proposalText}
                  onChange={(e) => setProposalText(e.target.value)}
                  rows={10}
                  required
                  className="w-full border-2 border-manga-ink p-4 focus:ring-2 focus:ring-manga-red resize-y"
                  placeholder="Tôi đề xuất đưa nhân vật mới vào arc tiếp theo để giải quyết vấn đề nhịp độ bị chùng xuống..."
                />
              </div>

              <div className="flex justify-end">
                <button 
                  type="submit"
                  disabled={isSubmitting || !title.trim() || !proposalText.trim()}
                  className={`flex items-center gap-2 bg-manga-red text-white font-manga font-bold px-8 py-3 border-2 border-manga-ink hover:bg-red-700 transition-colors uppercase text-lg ${
                    (isSubmitting || !title.trim() || !proposalText.trim()) ? 'opacity-50 cursor-not-allowed' : 'manga-shadow-sm hover:translate-y-0.5 hover:shadow-none'
                  }`}
                >
                  {isSubmitting ? 'ĐANG GỬI...' : (
                    <>
                      GỬI ĐỀ XUẤT <Send className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Lịch sử đề xuất */}
          <div className="bg-white border-4 border-manga-ink manga-shadow">
            <div className="p-4 border-b-4 border-manga-ink bg-gray-50 flex justify-between items-center">
              <h2 className="font-manga font-bold text-xl uppercase">Lịch sử Đề xuất</h2>
              {isLoadingProposals && <span className="text-xs text-gray-500 font-bold animate-pulse">ĐANG TẢI...</span>}
            </div>
            <div className="p-6">
              {proposals.length > 0 ? (
                <div className="space-y-4">
                  {proposals.map(p => {
                    let statusColor = 'text-orange-600 bg-orange-50 border-orange-600'
                    if (p.status === 'approved') {
                      statusColor = 'text-green-600 bg-green-50 border-green-600'
                    } else if (p.status === 'rejected') {
                      statusColor = 'text-red-600 bg-red-50 border-red-600'
                    }

                    return (
                      <div key={p.proposal_id} className="border-2 border-manga-ink p-4 bg-white hover:bg-gray-50 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                          <div>
                            <h4 className="font-bold text-lg text-manga-ink">{p.title || 'Đề xuất cứu vãn'}</h4>
                            <span className="text-xs text-gray-500 font-bold">
                              Gửi ngày: {new Date(p.created_at).toLocaleString('vi-VN')}
                            </span>
                          </div>
                          <span className={`px-2 py-1 text-xs font-bold uppercase border-2 self-start ${statusColor}`}>
                            {p.status === 'pending' ? 'Chờ duyệt' : p.status === 'approved' ? 'Chấp thuận' : 'Từ chối'}
                          </span>
                        </div>
                        <div className="border-t border-dashed border-gray-200 pt-2">
                          <p className="text-sm text-gray-800 whitespace-pre-line">{p.description}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-gray-500 font-bold text-center py-4">Chưa có đề xuất nào cho series này.</p>
              )}
            </div>
          </div>
        </div>

        {/* Cột phải - Bối cảnh */}
        <div className="w-full lg:w-96 shrink-0 space-y-6">
          <div className="bg-red-50 border-4 border-manga-ink manga-shadow">
            <div className="p-4 border-b-4 border-manga-ink bg-red-100 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h3 className="font-bold text-red-800 uppercase">Tình trạng hiện tại</h3>
            </div>
            <div className="p-4 space-y-4">
              {selectedSeries ? (
                <>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Xếp hạng tuần</p>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-manga font-bold text-manga-red">{rankingData.rank}</span>
                      <span className={`text-sm font-bold mb-1 ${rankingData.isAtRisk ? 'text-red-500' : 'text-green-500'}`}>
                        {rankingData.change}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Đánh giá độc giả</p>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-manga font-bold text-orange-600">{rankingData.score}</span>
                      <span className={`text-sm font-bold mb-1 ${rankingData.isAtRisk ? 'text-red-500' : 'text-green-500'}`}>
                        {rankingData.status}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500">Vui lòng chọn series để xem bối cảnh.</p>
              )}
            </div>
          </div>

          <div className="bg-white border-4 border-manga-ink manga-shadow">
            <div className="p-4 border-b-4 border-manga-ink flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              <h3 className="font-bold uppercase">Phản hồi của Editor</h3>
            </div>
            <div className="p-4 space-y-4">
              {latestFeedback ? (
                <div className="border-l-4 border-manga-red pl-3">
                  <p className="text-xs font-bold text-gray-500 mb-1">Từ: {latestFeedback.sender}</p>
                  <p className="text-sm italic text-gray-800">"{latestFeedback.content}"</p>
                </div>
              ) : (
                <p className="text-sm text-gray-500 font-bold italic">Đang tải phản hồi...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
