import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { FileWarning, Send, BarChart2, MessageSquare, AlertTriangle, ArrowLeft } from 'lucide-react'
import { mangakaStore, Series, RecoveryProposal } from '@/data/mangakaMockData'

export default function RecoveryProposalPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const defaultSeriesId = searchParams.get('seriesId') || ''
  
  const [series, setSeries] = useState<Series[]>([])
  const [selectedSeriesId, setSelectedSeriesId] = useState(defaultSeriesId)
  const [proposalText, setProposalText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [proposals, setProposals] = useState<RecoveryProposal[]>([])

  useEffect(() => {
    setSeries(mangakaStore.getSeries())
    setProposals(mangakaStore.getRecoveryProposals())
    
    if (!defaultSeriesId && mangakaStore.getSeries().length > 0) {
      setSelectedSeriesId(mangakaStore.getSeries()[0].id)
    }
  }, [defaultSeriesId])

  const selectedSeries = series.find(s => s.id === selectedSeriesId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSeriesId || !proposalText.trim()) return

    setIsSubmitting(true)
    setTimeout(() => {
      mangakaStore.addRecoveryProposal({
        seriesId: selectedSeriesId,
        proposalText: proposalText
      })
      alert('Đề xuất cứu vãn đã được gửi thành công đến Tantou Editor!');
      setProposalText('');
      setProposals(mangakaStore.getRecoveryProposals());
      setIsSubmitting(false)
    }, 800)
  }

  const seriesProposals = proposals.filter(p => p.seriesId === selectedSeriesId)

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
        {/* Left Column - Form */}
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
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 uppercase mb-2">Nội dung đề xuất khắc phục</label>
                <p className="text-xs text-gray-500 mb-2 italic">Trình bày chi tiết nguyên nhân tụt hạng, hướng giải quyết (ví dụ: thay đổi plot, thêm character mới, tăng pace, v.v.)</p>
                <textarea 
                  value={proposalText}
                  onChange={(e) => setProposalText(e.target.value)}
                  rows={10}
                  className="w-full border-2 border-manga-ink p-4 focus:ring-2 focus:ring-manga-red resize-y"
                  placeholder="Tôi đề xuất đưa nhân vật mới vào arc tiếp theo để giải quyết vấn đề nhịp độ bị chùng xuống..."
                />
              </div>

              <div className="flex justify-end">
                <button 
                  type="submit"
                  disabled={isSubmitting || !proposalText.trim()}
                  className={`flex items-center gap-2 bg-manga-red text-white font-manga font-bold px-8 py-3 border-2 border-manga-ink hover:bg-red-700 transition-colors uppercase text-lg ${
                    (isSubmitting || !proposalText.trim()) ? 'opacity-50 cursor-not-allowed' : 'manga-shadow-sm hover:translate-y-0.5 hover:shadow-none'
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

          {/* Previous Proposals History */}
          <div className="bg-white border-4 border-manga-ink manga-shadow">
             <div className="p-4 border-b-4 border-manga-ink bg-gray-50">
              <h2 className="font-manga font-bold text-xl uppercase">Lịch sử Đề xuất</h2>
            </div>
            <div className="p-6">
              {seriesProposals.length > 0 ? (
                <div className="space-y-4">
                  {seriesProposals.map(p => (
                    <div key={p.id} className="border-2 border-gray-200 p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className={`px-2 py-1 text-xs font-bold uppercase border border-current ${p.status === 'Pending' ? 'text-orange-600 bg-orange-50' : 'text-green-600 bg-green-50'}`}>
                          {p.status}
                        </span>
                        <span className="text-xs text-gray-500 font-bold">{new Date(p.submittedAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-gray-800 line-clamp-3">{p.proposalText}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 font-bold text-center">Chưa có đề xuất nào cho series này.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Context */}
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
                      <span className="text-3xl font-manga font-bold text-red-600">#18</span>
                      <span className="text-sm font-bold text-red-500 mb-1">▼ 3 bậc</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Đánh giá độc giả</p>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-manga font-bold text-orange-600">6.2/10</span>
                      <span className="text-sm font-bold text-orange-500 mb-1">Nguy hiểm</span>
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
              <h3 className="font-bold uppercase">Feedback gần nhất</h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="border-l-4 border-orange-400 pl-3">
                <p className="text-xs font-bold text-gray-500 mb-1">Từ: Tantou Editor</p>
                <p className="text-sm italic">"Cốt truyện đang diễn biến quá chậm. Độc giả đang phàn nàn trên diễn đàn về việc nhân vật chính không có sự phát triển. Cần đưa ra giải pháp gấp trong 2 chapter tới."</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
