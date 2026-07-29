import React, { useState, useEffect } from 'react'
import { GitBranch, Check, Clock, X, Loader2, AlertCircle } from 'lucide-react'
import { editorService } from '@/services/editor.service'

export default function ApprovalWorkflowPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Series workflows state
  const [seriesWorkflows, setSeriesWorkflows] = useState<any[]>([])
  const [selectedSeries, setSelectedSeries] = useState<any | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch editor's series, chapters, and review sessions in parallel
      const [seriesRes, chaptersRes, sessionsRes] = await Promise.all([
        editorService.getSeries({ limit: 100 }),
        editorService.getChapters({ limit: 1000 }),
        editorService.getReviewSessions({ limit: 1000 })
      ])

      // Managed series list
      const seriesData = seriesRes.data || seriesRes
      const seriesList = Array.isArray(seriesData) ? seriesData : (seriesData.series || seriesData.items || [])
      const managedSeriesIds = new Set(seriesList.map((s: any) => s.series_id || s.id))

      // Process chapters to see which series has chapters/approved chapters
      const chaptersData = chaptersRes.data || chaptersRes
      const chaptersList = Array.isArray(chaptersData) ? chaptersData : (chaptersData.chapters || chaptersData.items || [])

      const seriesWithApprovedChapters = new Set(
        chaptersList
          .filter((ch: any) => ['pending_review', 'under_review', 'approved', 'completed', 'published'].includes(ch.status?.toLowerCase()))
          .map((ch: any) => ch.series_id)
      );

      const seriesWithChapters = new Set(
        chaptersList.map((ch: any) => ch.series_id)
      );

      const seriesWithRejectedChapters = new Set(
        chaptersList
          .filter((ch: any) => ['rejected', 'needs_revision', 'needs_change'].includes(ch.status?.toLowerCase()))
          .map((ch: any) => ch.series_id)
      );

      // Map chapter_id to series_id for sessions resolution
      const chapterToSeriesMap = new Map();
      chaptersList.forEach((ch: any) => {
        if (ch.chapter_id && ch.series_id) {
          chapterToSeriesMap.set(ch.chapter_id, ch.series_id);
        }
      });

      // Process review sessions
      const sessionsData = sessionsRes.data || sessionsRes;
      const sessionsList = Array.isArray(sessionsData) ? sessionsData : (sessionsData.sessions || sessionsData.items || []);

      const getSessionSeriesId = (s: any) => {
        if (s.series_id) return s.series_id;
        if (s.series?.series_id || s.series?.id) return s.series.series_id || s.series.id;
        if (s.chapter?.series_id) return s.chapter.series_id;
        if (s.chapter_id && chapterToSeriesMap.has(s.chapter_id)) {
          return chapterToSeriesMap.get(s.chapter_id);
        }
        return null;
      };

      const seriesWithActiveSessions = new Set(
        sessionsList
          .filter((s: any) => ['active', 'completed', 'finished', 'in_progress', 'started'].includes(s.status?.toLowerCase()))
          .map((s: any) => getSessionSeriesId(s))
          .filter(Boolean)
      );

      const mappedSeriesWorkflows = seriesList.map((s: any) => {
        const sId = s.series_id || s.id;
        return {
          id: sId,
          series: s.title,
          submitDate: s.created_at ? new Date(s.created_at).toLocaleDateString('vi-VN') : '—',
          seriesStatus: s.status,
          hasApprovedChapters: seriesWithApprovedChapters.has(sId) || s.status === 'published',
          hasRejectedChapters: seriesWithRejectedChapters.has(sId),
          hasChapters: (seriesWithApprovedChapters.has(sId) && seriesWithChapters.has(sId)) || s.status === 'published',
          hasActiveSessions: (seriesWithApprovedChapters.has(sId) && seriesWithActiveSessions.has(sId)) || s.status === 'published'
        };
      })

      setSeriesWorkflows(mappedSeriesWorkflows)

      if (mappedSeriesWorkflows.length > 0) {
        setSelectedSeries(mappedSeriesWorkflows[0])
      }
    } catch (err: any) {
      console.error('Failed to load workflow data:', err)
      setError('Không thể tải dữ liệu quy trình duyệt.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto pb-12 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-manga-red mx-auto mb-3" />
          <p className="text-sm font-bold text-gray-500">Đang tải dữ liệu quy trình duyệt...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto pb-12 flex items-center justify-center min-h-[400px]">
        <div className="text-center border-4 border-red-500 p-8 bg-white">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
          <p className="text-sm font-bold text-red-600 mb-4">{error}</p>
          <button onClick={fetchData} className="bg-manga-ink text-white font-bold text-xs uppercase px-4 py-2 hover:bg-black transition-colors">Thử lại</button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto pb-12 relative">
      {/* Header */}
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="font-manga text-3xl font-bold uppercase text-manga-ink leading-none">
            QUY TRÌNH DUYỆT (WORKFLOW)
          </h1>
          <p className="text-sm font-bold text-gray-500 mt-2">
            Theo dõi tiến trình duyệt Series của Ban Biên Tập
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left Column: List of series workflows */}
        <div className="lg:col-span-1 bg-white border-4 border-manga-ink flex flex-col h-[580px] overflow-hidden">
          <div className="border-b-4 border-manga-ink bg-manga-ink text-white p-3 text-center">
            <h2 className="text-xs font-bold uppercase tracking-wider">Tiến độ Series</h2>
          </div>

          <div className="flex-1 overflow-y-auto bg-gray-50 p-2 space-y-2">
            {seriesWorkflows.length > 0 ? seriesWorkflows.map((item) => (
              <div 
                key={item.id}
                onClick={() => setSelectedSeries(item)}
                className={`p-4 border-2 cursor-pointer transition-all flex gap-3 ${
                  selectedSeries?.id === item.id 
                    ? 'border-manga-ink bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-y-1 -translate-x-1' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-manga-ink truncate">{item.series}</h3>
                  <div className="text-xs font-bold text-gray-500 mb-2 truncate">Quy trình bộ truyện</div>
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase">
                    <span className="text-gray-500">Nộp: {item.submitDate}</span>
                    <span className={`px-2 py-0.5 border ${
                      item.seriesStatus === 'published' ? 'bg-green-100 text-green-700 border-green-700' :
                      ['approved', 'in_production'].includes(item.seriesStatus) ? 'bg-purple-100 text-purple-700 border-purple-700' :
                      item.seriesStatus === 'rejected' ? 'bg-red-100 text-red-700 border-red-700' :
                      'bg-orange-100 text-orange-700 border-orange-700'
                    }`}>
                      {item.seriesStatus === 'published' ? 'ĐÃ CÔNG BỐ' :
                       ['approved', 'in_production'].includes(item.seriesStatus) ? 'ĐANG VẼ' :
                       item.seriesStatus === 'rejected' ? 'BỊ TỪ CHỐI' : 'CHỜ DUYỆT'}
                    </span>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-400 text-sm font-bold">Không có series nào</div>
            )}
          </div>
        </div>

        {/* Middle/Right: Detail containing the step diagram */}
        <div className="lg:col-span-2 bg-white border-4 border-manga-ink p-6 min-h-[580px] flex flex-col justify-between">
          {selectedSeries ? (
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="border-b-2 border-gray-150 pb-4 mb-6">
                  <h2 className="font-manga text-2xl font-bold uppercase text-manga-ink">{selectedSeries.series}</h2>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs font-bold text-gray-400">Ngày đề xuất: {selectedSeries.submitDate}</span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold border ${
                      selectedSeries.seriesStatus === 'published' ? 'bg-green-100 text-green-700 border-green-700' :
                      ['approved', 'in_production'].includes(selectedSeries.seriesStatus) ? 'bg-purple-100 text-purple-700 border-purple-700' :
                      selectedSeries.seriesStatus === 'rejected' ? 'bg-red-100 text-red-700 border-red-700' :
                      'bg-orange-100 text-orange-700 border-orange-700'
                    }`}>
                      {selectedSeries.seriesStatus === 'published' ? 'ĐÃ CÔNG BỐ' :
                       ['approved', 'in_production'].includes(selectedSeries.seriesStatus) ? 'ĐANG VẼ' :
                       selectedSeries.seriesStatus === 'rejected' ? 'BỊ TỪ CHỐI' : 'CHỜ DUYỆT'}
                    </span>
                  </div>
                </div>

                {/* Sơ đồ quy trình phê duyệt Series */}
                <div className="bg-gray-50 border-2 border-manga-ink p-6 mb-6 shadow-sm">
                  <h3 className="text-xs font-bold uppercase text-manga-ink mb-4 flex items-center gap-1.5">
                    <GitBranch className="w-4 h-4 text-manga-red" /> Sơ đồ quy trình phê duyệt Series
                  </h3>
                  
                  <div className="flex flex-col relative mt-2 pl-4">
                    {/* Step 1: Phê duyệt Dự án (Tantou Editor) */}
                    <div className="flex items-start gap-4 relative min-w-0">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] z-10 ${
                          ['approved', 'published', 'in_production'].includes(selectedSeries.seriesStatus)
                            ? 'border-green-500 bg-green-50 text-green-600'
                            : 'border-gray-300 bg-gray-50 text-gray-400'
                        }`}>
                          {['approved', 'published', 'in_production'].includes(selectedSeries.seriesStatus) ? <Check className="w-4 h-4 text-green-655" /> : <Clock className="w-4 h-4 text-gray-400" />}
                        </div>
                        <div className="w-0.5 h-12 bg-gray-200"></div>
                      </div>
                      <div className="flex flex-col min-w-0 pt-1.5 pb-2">
                        <span className={`text-sm font-bold ${['approved', 'published', 'in_production'].includes(selectedSeries.seriesStatus) ? 'text-green-600' : 'text-gray-400'}`}>
                          1. Phê duyệt Dự án (Tantou Editor)
                        </span>
                        <span className="text-[11px] text-gray-500 font-medium">
                          Biên tập viên (Tantou) duyệt đề xuất và đưa Series vào sản xuất
                        </span>
                        <span className="text-[10px] text-gray-400 font-bold mt-0.5">{selectedSeries.submitDate}</span>
                      </div>
                    </div>

                    {/* Step 2: Duyệt phân cảnh & Kịch bản (Tantou Editor) */}
                    <div className="flex items-start gap-4 relative min-w-0">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] z-10 ${
                          selectedSeries.hasApprovedChapters
                            ? 'border-green-500 bg-green-50 text-green-600'
                            : selectedSeries.hasRejectedChapters
                            ? 'border-red-500 bg-red-50 text-red-600'
                            : 'border-gray-300 bg-gray-50 text-gray-400'
                        }`}>
                          {selectedSeries.hasApprovedChapters ? (
                            <Check className="w-4 h-4 text-green-655" />
                          ) : selectedSeries.hasRejectedChapters ? (
                            <X className="w-4 h-4 text-red-655" />
                          ) : (
                            <Clock className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        <div className="w-0.5 h-12 bg-gray-200"></div>
                      </div>
                      <div className="flex flex-col min-w-0 pt-1.5 pb-2">
                        <span className={`text-sm font-bold ${
                          selectedSeries.hasApprovedChapters ? 'text-green-600' :
                          selectedSeries.hasRejectedChapters ? 'text-red-600' :
                          'text-gray-400'
                        }`}>
                          2. Duyệt phân cảnh & Kịch bản (Tantou Editor)
                        </span>
                        <span className="text-[11px] text-gray-500 font-medium">Biên tập viên duyệt kịch bản phân cảnh và khởi tạo chương mới</span>
                      </div>
                    </div>

                    {/* Step 3: Khởi họa & Chế tác (Mangaka) */}
                    <div className="flex items-start gap-4 relative min-w-0">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] z-10 ${
                          selectedSeries.hasChapters
                            ? 'border-green-500 bg-green-50 text-green-600'
                            : 'border-gray-300 bg-gray-50 text-gray-400'
                        }`}>
                          {selectedSeries.hasChapters ? <Check className="w-4 h-4 text-green-655" /> : <Clock className="w-4 h-4 text-gray-400" />}
                        </div>
                        <div className="w-0.5 h-12 bg-gray-200"></div>
                      </div>
                      <div className="flex flex-col min-w-0 pt-1.5 pb-2">
                        <span className={`text-sm font-bold ${selectedSeries.hasChapters ? 'text-green-600' : 'text-gray-400'}`}>
                          3. Khởi họa & Chế tác (Mangaka)
                        </span>
                        <span className="text-[11px] text-gray-500 font-medium">Tác giả tiến hành vẽ các trang bản thảo chính thức đầu tiên của chương mới</span>
                      </div>
                    </div>

                    {/* Step 4: Thành lập Hội đồng bỏ phiếu (Admin) */}
                    <div className="flex items-start gap-4 relative min-w-0">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] z-10 ${
                          selectedSeries.hasActiveSessions
                            ? 'border-green-500 bg-green-50 text-green-600'
                            : 'border-gray-300 bg-gray-50 text-gray-400'
                        }`}>
                          {selectedSeries.hasActiveSessions ? <Check className="w-4 h-4 text-green-655" /> : <Clock className="w-4 h-4 text-gray-400" />}
                        </div>
                        <div className="w-0.5 h-12 bg-gray-200"></div>
                      </div>
                      <div className="flex flex-col min-w-0 pt-1.5 pb-2">
                        <span className={`text-sm font-bold ${selectedSeries.hasActiveSessions ? 'text-green-600' : 'text-gray-400'}`}>
                          4. Thành lập Hội đồng bỏ phiếu (Admin)
                        </span>
                        <span className="text-[11px] text-gray-500 font-medium font-sans">Admin lập cuộc họp bỏ phiếu thẩm định chất lượng để chuẩn bị phát hành</span>
                      </div>
                    </div>

                    {/* Step 5: Công bố tác phẩm (Public) */}
                    <div className="flex items-start gap-4 relative min-w-0">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] z-10 ${
                          selectedSeries.seriesStatus === 'published' ? 'border-green-500 bg-green-50 text-green-600' :
                          'border-gray-300 bg-gray-55 text-gray-400'
                        }`}>
                          {selectedSeries.seriesStatus === 'published' ? <Check className="w-4 h-4 text-green-655" /> : <Clock className="w-4 h-4 text-gray-400" />}
                        </div>
                      </div>
                      <div className="flex flex-col min-w-0 pt-1.5 pb-2">
                        <span className={`text-sm font-bold ${selectedSeries.seriesStatus === 'published' ? 'text-green-600' : 'text-gray-400'}`}>
                          5. Công bố tác phẩm (Public)
                        </span>
                        <span className="text-[11px] text-gray-500 font-medium font-sans">Admin cập nhật trạng thái Public, chính thức đưa tác phẩm tiếp cận độc giả</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400 text-sm font-bold uppercase">
              Chọn một series bên danh sách để xem tiến độ
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
