import React, { useState, useEffect } from 'react'
import {
  CheckCircle,
  AlertTriangle,
  Download,
  Layers,
  Sparkles,
  RefreshCw,
} from 'lucide-react'
import { mangakaStore, AssistantSubmission } from '@/data/mangakaMockData'

const filters = ['Tất cả', 'Chờ duyệt', 'Cần chỉnh sửa', 'Đã duyệt & Đóng gói', 'Quá hạn']

export default function SubmissionPage() {
  const [submissionsList, setSubmissionsList] = useState<AssistantSubmission[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [activeFilter, setActiveFilter] = useState('Tất cả')
  const [comment, setComment] = useState('')
  const [isMerging, setIsMerging] = useState(false)
  const [mergeStep, setMergeStep] = useState('')
  const [markers, setMarkers] = useState<{x: number, y: number, text: string, id: string}[]>([])
  const [activeMarkerId, setActiveMarkerId] = useState<string | null>(null)

  const refreshSubmissions = () => {
    const list = mangakaStore.getSubmissions()
    setSubmissionsList(list)

    const currentValid = list.some((s) => s.id === selectedId)
    if (!currentValid && list.length > 0) {
      setSelectedId(list[0].id)
    }
    setMarkers([])
    setActiveMarkerId(null)
  }

  useEffect(() => {
    refreshSubmissions()
  }, [selectedId])

  const selected = submissionsList.find((s) => s.id === selectedId) || submissionsList[0]

  const handleMergeLayer = () => {
    if (!selected) return

    setIsMerging(true)
    setMergeStep("Trích xuất layer 'Assistant submission'...")

    setTimeout(() => {
      setMergeStep('Đang khử nhiễu & căn chỉnh tọa độ ô khung...')

      setTimeout(() => {
        setMergeStep('Đang hòa trộn layer vào bản thảo gốc (Speech balloon & Panel Frame)...')

        setTimeout(() => {
          mangakaStore.updateSubmissionStatus(selected.id, 'Approved')

          setIsMerging(false)
          setMergeStep('')
          setComment('')
          alert(`Đã kết hợp layer thành công cho submission của ${selected.assistantName}! Bản thảo chính đã được cập nhật.`)
          refreshSubmissions()
        }, 800)
      }, 800)
    }, 800)
  }

  const handleReject = () => {
    if (!selected) return
    if (!comment.trim()) {
      alert('Vui lòng nhập nhận xét / yêu cầu sửa chữa cho Assistant!')
      return
    }

    mangakaStore.updateSubmissionStatus(selected.id, 'Need Fix', comment.trim())
    alert(`Đã gửi yêu cầu chỉnh sửa cho ${selected.assistantName}.`)
    setComment('')
    setMarkers([])
    refreshSubmissions()
  }

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (selected?.status === 'Approved') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    const newMarker = { x, y, text: '', id: `marker-${Date.now()}` };
    setMarkers([...markers, newMarker]);
    setActiveMarkerId(newMarker.id);
  }

  const updateMarkerText = (id: string, text: string) => {
    setMarkers(markers.map(m => m.id === id ? { ...m, text } : m));
  }

  const deleteMarker = (id: string) => {
    setMarkers(markers.filter(m => m.id !== id));
    if (activeMarkerId === id) setActiveMarkerId(null);
  }

  const filteredSubmissions = submissionsList.filter((sub) => {
    if (activeFilter === 'Tất cả') return true
    if (activeFilter === 'Chờ duyệt') return sub.status === 'Pending'
    if (activeFilter === 'Cần chỉnh sửa') return sub.status === 'Need Fix'
    if (activeFilter === 'Đã duyệt & Đóng gói') return sub.status === 'Approved'
    if (activeFilter === 'Quá hạn') return false
    return true
  })

  const getStatusBadge = (status: AssistantSubmission['status']) => {
    switch (status) {
      case 'Approved':
        return <span className="bg-manga-ink text-white border-manga-ink border px-2 py-0.5 text-[9px] font-bold uppercase whitespace-nowrap">Đã duyệt</span>
      case 'Need Fix':
        return <span className="bg-manga-red text-white border-manga-ink border px-2 py-0.5 text-[9px] font-bold uppercase whitespace-nowrap">Cần sửa</span>
      default:
        return <span className="bg-white text-manga-ink border-manga-ink border px-2 py-0.5 text-[9px] font-bold uppercase whitespace-nowrap">Chờ duyệt</span>
    }
  }

  return (
    <div className="max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-manga text-5xl font-bold uppercase text-manga-ink leading-none">
            SUBMISSION CHỜ DUYỆT
          </h1>
          <div className="h-1.5 w-24 bg-manga-red mt-3 mb-2" />
          <p className="text-sm font-bold text-gray-500">
            Kiểm tra kết quả vẽ thô/background của trợ lý gửi lên, nhận xét và phê duyệt (Merge Layer) trực tiếp vào bản thảo.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Chờ duyệt', value: submissionsList.filter((s) => s.status === 'Pending').length, key: 'pending' },
          { label: 'Cần chỉnh sửa', value: submissionsList.filter((s) => s.status === 'Need Fix').length, key: 'revision', red: submissionsList.filter((s) => s.status === 'Need Fix').length > 0 },
          { label: 'Đã duyệt & Ghép', value: submissionsList.filter((s) => s.status === 'Approved').length, key: 'approved' },
          { label: 'Tổng số bản vẽ', value: submissionsList.length, key: 'total' },
        ].map((s) => (
          <div
            key={s.key}
            className={`bg-white border-2 border-manga-ink p-4 flex flex-col items-center manga-shadow-sm ${
              s.red ? 'border-manga-red bg-red-50/10' : ''
            }`}
          >
            <span className={`font-manga text-4xl font-bold ${s.red ? 'text-manga-red' : 'text-manga-ink'}`}>
              {s.value}
            </span>
            <span className="text-[10px] font-bold text-gray-500 uppercase text-center mt-1">
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-4 py-2 font-bold text-xs uppercase border-2 transition-all ${
              activeFilter === f
                ? 'bg-manga-ink text-white border-manga-ink'
                : 'bg-white text-manga-ink border-manga-ink hover:bg-gray-100'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Three Columns Workspace Layout */}
      {selected ? (
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-5">
          {/* Left: Submission List */}
          <div className="lg:col-span-2">
            <div className="bg-white border-2 border-manga-ink manga-shadow-sm">
              <div className="bg-manga-ink text-white px-4 py-3">
                <h2 className="font-manga text-base font-bold uppercase">Danh sách submission</h2>
              </div>
              <div className="divide-y-2 divide-manga-ink max-h-[500px] overflow-y-auto">
                {filteredSubmissions.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => setSelectedId(s.id)}
                    className={`p-3 cursor-pointer transition-colors ${
                      selected.id === s.id ? 'bg-red-50 border-l-4 border-l-manga-red' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-bold text-sm leading-tight text-manga-ink">{s.chapterTitle}</p>
                      {getStatusBadge(s.status)}
                    </div>
                    <p className="text-xs font-bold text-gray-500">
                      {s.assistantName} · Trang {s.pageNumber}
                    </p>
                    <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase">
                      Lớp: {s.layerType} · {new Date(s.submittedAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                ))}
                {filteredSubmissions.length === 0 && (
                  <div className="p-8 text-center text-gray-400 font-bold text-sm">
                    Không có submission nào phù hợp.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Center: Interactive Image Preview */}
          <div className="lg:col-span-3">
            <div className="bg-white border-2 border-manga-ink manga-shadow-sm">
              <div className="bg-manga-red text-white px-4 py-3 flex items-center justify-between">
                <h2 className="font-manga text-base font-bold uppercase">Xem bản vẽ chi tiết</h2>
                {selected.status === 'Approved' && (
                  <span className="bg-white text-manga-red font-manga font-bold text-[10px] px-2 py-0.5 border border-white">
                    ĐÃ KẾT HỢP LAYER
                  </span>
                )}
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase text-gray-500 mb-1.5">Bản Phác Thảo Gốc</p>
                    <div className="border-2 border-manga-ink aspect-[3/4] bg-gray-100 relative overflow-hidden">
                      <img
                        src="https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=400&auto=format&fit=crop"
                        alt="Original Outline"
                        className="w-full h-full object-cover grayscale contrast-125"
                      />
                      <div className="absolute inset-0 bg-black/15" />
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-gray-500 mb-1.5">
                      {selected.status === 'Approved' ? 'Bản thảo đã hòa trộn' : 'Bản vẽ Trợ lý gửi'}
                    </p>
                    <div 
                      className={`border-2 aspect-[3/4] bg-gray-100 relative overflow-hidden ${selected.status === 'Approved' ? 'border-green-500' : 'border-manga-red cursor-crosshair'}`}
                      onClick={handleImageClick}
                    >
                      <img
                        src={selected.previewUrl}
                        alt="Submitted Layer"
                        className="w-full h-full object-cover grayscale contrast-110 pointer-events-none"
                      />
                      {selected.status !== 'Approved' && (
                        <div className="absolute border-2 border-manga-red bg-red-500/10 pointer-events-none" style={{ top: '15%', left: '10%', width: '80%', height: '70%' }}>
                          <span className="absolute -top-4 left-0 text-[8px] font-bold bg-manga-red text-white px-1 uppercase">
                            {selected.layerType} Layer
                          </span>
                        </div>
                      )}
                      {markers.map((marker, index) => (
                        <div 
                          key={marker.id}
                          className="absolute z-20"
                          style={{ left: `${marker.x}%`, top: `${marker.y}%`, transform: 'translate(-50%, -50%)' }}
                          onClick={(e) => { e.stopPropagation(); setActiveMarkerId(marker.id); }}
                        >
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 cursor-pointer transition-colors ${
                            activeMarkerId === marker.id ? 'bg-manga-red border-white text-white scale-110' : 'bg-white border-manga-red text-manga-red'
                          }`}>
                            {index + 1}
                          </div>
                          {activeMarkerId === marker.id && (
                            <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-white border-2 border-manga-ink manga-shadow-sm p-2 w-48 z-30" onClick={e => e.stopPropagation()}>
                              <textarea 
                                autoFocus
                                value={marker.text}
                                onChange={(e) => updateMarkerText(marker.id, e.target.value)}
                                placeholder="Nhập lỗi cần sửa..."
                                className="w-full text-xs font-bold border border-gray-300 p-1 mb-1 focus:outline-none"
                                rows={2}
                              />
                              <div className="flex justify-between">
                                <button className="text-[10px] text-red-600 font-bold uppercase hover:underline" onClick={() => deleteMarker(marker.id)}>Xóa</button>
                                <button className="text-[10px] text-manga-ink font-bold uppercase hover:underline" onClick={() => setActiveMarkerId(null)}>Xong</button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {selected.status === 'Approved' && (
                  <div className="bg-green-50 border-2 border-green-500 p-3 text-green-800 text-xs font-bold flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="uppercase text-[10px] text-green-700 font-black">Trạng thái hoàn thành</p>
                      <p className="leading-tight mt-0.5">
                        Layer <code className="bg-white px-1 border border-green-300 font-mono">[{selected.layerType}]</code> từ file của {selected.assistantName} đã được hòa trộn thành công đè lên bản thảo chính.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Actions / Comments Review Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white border-2 border-manga-ink manga-shadow-sm">
              <div className="bg-manga-ink text-white px-4 py-3">
                <h2 className="font-manga text-base font-bold uppercase">Hành động phê duyệt</h2>
              </div>
              <div className="p-4 flex flex-col gap-3">
                {[
                  { label: 'Trợ lý', value: selected.assistantName },
                  { label: 'Nhiệm vụ', value: `${selected.chapterTitle} - Trang ${selected.pageNumber}` },
                  { label: 'Lớp vẽ', value: selected.layerType },
                  { label: 'Thời điểm nộp', value: new Date(selected.submittedAt).toLocaleDateString('vi-VN') },
                  { label: 'Tên File PSD', value: selected.fileName },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex flex-col gap-0.5 border-b border-dashed border-gray-200 pb-2 last:border-0"
                  >
                    <span className="text-[10px] font-bold uppercase text-gray-400">{row.label}</span>
                    <span className="font-bold text-sm text-manga-ink leading-tight">{row.value}</span>
                  </div>
                ))}

                {selected.status === 'Pending' && (
                  <div className="mt-2">
                    <span className="text-[10px] font-bold uppercase text-gray-400 block mb-1">
                      Nhận xét / Yêu cầu chỉnh sửa
                    </span>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={3}
                      placeholder="Nếu có yêu cầu chỉnh sửa, hãy điền lý do tại đây trước khi chọn 'Yêu cầu chỉnh sửa'..."
                      className="w-full border-2 border-manga-ink px-3 py-2 text-sm font-bold resize-none focus:outline-none focus:border-manga-red bg-white"
                    />
                    {markers.length > 0 && (
                      <div className="mt-2 text-xs text-manga-red font-bold">
                        * Đã đánh dấu {markers.length} điểm lỗi trên ảnh. 
                        Nội dung comment sẽ tự động đính kèm các điểm lỗi này.
                      </div>
                    )}
                  </div>
                )}

                {isMerging ? (
                  <div className="bg-red-50 border-2 border-manga-red p-3 flex flex-col items-center justify-center text-center gap-2">
                    <RefreshCw className="w-5 h-5 text-manga-red animate-spin" />
                    <span className="text-[10px] font-manga font-black text-manga-red uppercase tracking-wider">
                      {mergeStep}
                    </span>
                  </div>
                ) : selected.status === 'Approved' ? (
                  <div className="bg-manga-ink text-white p-3 font-manga font-bold text-center border-2 border-manga-ink uppercase">
                    BẢN VẼ ĐÃ ĐƯỢC PHÊ DUYỆT
                  </div>
                ) : selected.status === 'Need Fix' ? (
                  <div className="bg-red-50 border-2 border-manga-red text-manga-red p-3 font-bold text-center text-xs uppercase">
                    Yêu cầu chỉnh sửa đã gửi
                  </div>
                ) : (
                  <>
                    <button
                      onClick={handleMergeLayer}
                      className="w-full bg-manga-red text-white font-manga font-bold text-sm uppercase py-2.5 border-2 border-manga-ink manga-shadow-sm hover:translate-y-0.5 hover:shadow-none transition-all flex items-center justify-center gap-2"
                    >
                      <Layers className="w-4 h-4" /> Ghép file & Phê duyệt
                    </button>
                    <button
                      onClick={handleReject}
                      className="w-full bg-white text-manga-ink font-bold text-xs uppercase py-2 border-2 border-manga-ink hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" /> Yêu cầu chỉnh sửa
                    </button>
                  </>
                )}

                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => alert(`Bắt đầu tải file PSD: ${selected.fileName}`)}
                    className="flex-1 bg-white text-manga-ink font-bold text-xs uppercase py-2 border border-manga-ink hover:bg-gray-100 transition-colors flex items-center justify-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" /> Tải file PSD
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border-4 border-manga-ink p-12 text-center manga-shadow-sm">
          <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-2" />
          <h3 className="font-manga text-2xl font-bold uppercase text-gray-500">Tuyệt vời! Không có submission nào</h3>
          <p className="text-sm font-bold text-gray-400 mt-1">
            Không có bản vẽ nào từ trợ lý đang đợi bạn phê duyệt lúc này.
          </p>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-12 bg-manga-ink text-white py-6 px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm font-bold">
        <div className="font-manga text-2xl text-manga-red">MangaFlow</div>
        <div className="text-gray-400">© 2026 MangaFlow System. Gangan Press Co. Ltd.</div>
      </footer>
    </div>
  )
}
