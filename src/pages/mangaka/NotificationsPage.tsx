import React, { useState, useEffect } from 'react'
import { Bell, Check, Trash2, Filter } from 'lucide-react'
import { Notification } from '@/data/mangakaMockData'
import { useNavigate, Link } from 'react-router'
import { rankingService } from '@/services/ranking.service'

export default function NotificationsPage() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState<"All" | "Unread" | "Assistant" | "Editor" | "Board" | "Ranking">("All")
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const translateNotification = (title: string, content: string, type: string) => {
    const t = (type || '').toLowerCase();
    const lowerTitle = (title || '').toLowerCase();
    const lowerContent = (content || '').toLowerCase();

    let viTitle = title;
    let viContent = content;

    if (t === 'task_assigned' || lowerTitle.includes('new task assigned') || lowerTitle.includes('giao việc')) {
      viTitle = 'Nhiệm vụ mới được giao';
      viContent = content || 'Bạn đã giao một nhiệm vụ mới cho trợ lý.';
    } else if (lowerTitle.includes('task reassigned')) {
      viTitle = 'Nhiệm vụ được giao lại';
    } else if (lowerTitle.includes('task transferred')) {
      viTitle = 'Nhiệm vụ được chuyển giao';
    } else if (
      t === 'task_submitted' || 
      t === 'submission_created' || 
      lowerTitle.includes('task submitted') || 
      lowerTitle.includes('page submission') || 
      lowerTitle.includes('nộp bài') || 
      lowerTitle.includes('nộp bản vẽ')
    ) {
      viTitle = 'Yêu cầu duyệt bản vẽ mới';
      viContent = content || 'Trợ lý đã nộp bản vẽ mới để chờ duyệt.';
    } else if (t === 'task_updated' || lowerTitle.includes('task updated')) {
      viTitle = 'Nhiệm vụ được cập nhật';
      viContent = content || 'Một nhiệm vụ đã được cập nhật trạng thái.';
    } else if (t === 'task_overdue' || lowerTitle.includes('task overdue') || lowerTitle.includes('quá hạn')) {
      viTitle = 'CẢNH BÁO QUÁ HẠN!';
      viContent = content || 'Nhiệm vụ của trợ lý đã quá hạn chót nộp bài.';
    } else if (t === 'feedback_created' || t.startsWith('ms_fb') || lowerTitle.includes('feedback created') || lowerTitle.includes('nhận xét')) {
      viTitle = 'Phản hồi mới từ Editor';
      viContent = content || 'Editor đã gửi nhận xét mới cho bản thảo của bạn.';
    } else if (t === 'user_mentioned' || lowerTitle.includes('user mentioned') || lowerTitle.includes('nhắc đến')) {
      viTitle = 'Bạn được nhắc đến';
      viContent = content || 'Có người nhắc đến bạn trong một thảo luận.';
    } else if (t === 'chapter_published' || lowerTitle.includes('chapter published') || lowerTitle.includes('xuất bản')) {
      viTitle = 'Chapter đã được xuất bản';
      viContent = content || 'Chapter của bạn đã được duyệt và xuất bản thành công.';
    } else if (
      t === 'manuscript_submitted' || 
      lowerTitle.includes('manuscript submitted') || 
      lowerTitle.includes('nộp bản thảo')
    ) {
      viTitle = 'Bản thảo đã được nộp';
      viContent = content || 'Bản thảo chương truyện đã được nộp lên ban biên tập.';
    } else if (t === 'decision_result' || lowerTitle.includes('decision result') || lowerTitle.includes('quyết định') || lowerTitle.includes('series approved') || lowerTitle.includes('series rejected')) {
      viTitle = 'Kết quả duyệt bản thảo';
      viContent = content || 'Ban biên tập đã đưa ra quyết định duyệt cho bản thảo của bạn.';
    } else if (
      t === 'ranking_warning' || 
      lowerTitle.includes('ranking risk') || 
      lowerTitle.includes('ranking warning') || 
      lowerTitle.includes('cảnh báo xếp hạng')
    ) {
      viTitle = 'Cảnh báo xếp hạng series';
      viContent = content || 'Series của bạn đang có biến động thứ hạng thấp hoặc có rủi ro.';
    } else if (lowerTitle.includes('submission approved')) {
      viTitle = 'Bản vẽ đã được phê duyệt';
    } else if (lowerTitle.includes('submission rejected')) {
      viTitle = 'Bản vẽ bị từ chối';
    } else if (lowerTitle.includes('revision requested')) {
      viTitle = 'Yêu cầu chỉnh sửa bản vẽ';
    }

    // Map content
    if (lowerContent.includes('submitted page version')) {
      const match = content.match(/assistant submitted page version\s+(.+?)\s+for review/i);
      if (match) {
        viContent = `Trợ lý đã nộp bản vẽ trang (Phiên bản v${match[1]}) để chờ bạn duyệt.`;
      } else {
        viContent = `Trợ lý đã nộp bản vẽ trang mới để chờ bạn duyệt.`;
      }
    } else if (lowerContent.includes('submitted a submission for task')) {
      const match = content.match(/assistant\s+(.+?)\s+submitted a submission for task\s+(\d+)/i);
      if (match) {
        viContent = `Trợ lý ${match[1]} đã nộp bản vẽ cho Nhiệm vụ #${match[2]}.`;
      }
    } else if (lowerContent.includes('assigned task')) {
      const match = content.match(/assigned task\s+(\d+)\s+to assistant\s+(.+)/i);
      if (match) {
        viContent = `Đã giao Nhiệm vụ #${match[1]} thành công cho Trợ lý ${match[2]}.`;
      }
    } else if (lowerContent.includes('is at risk in ranking') || lowerContent.includes('is at risk due to declining ranking')) {
      const match = content.match(/series\s+(.+?)\s+is at risk/i);
      if (match) {
        viContent = `Truyện "${match[1]}" đang gặp rủi ro rớt hạng hoặc điểm số giảm mạnh.`;
      } else {
        viContent = 'Series truyện của bạn đang gặp rủi ro xếp hạng giảm sút.';
      }
    } else if (lowerContent.includes('manuscript') && lowerContent.includes('has been submitted for review')) {
      const match = content.match(/manuscript\s+"(.+?)"\s+has been submitted/i);
      if (match) {
        viContent = `Bản thảo "${match[1]}" đã được nộp thành công và đang chờ duyệt.`;
      }
    } else if (lowerContent.includes('series decision:')) {
      const match = content.match(/series decision:\s+(.+)/i);
      if (match) {
        const decision = match[1].toLowerCase() === 'approved' ? 'Phê duyệt' : 'Từ chối';
        viContent = `Quyết định duyệt từ Hội đồng: ${decision}.`;
      }
    } else if (lowerContent.includes('your page version') && lowerContent.includes('has been approved')) {
      const match = content.match(/your page version\s+(.+?)\s+has been approved/i);
      if (match) {
        viContent = `Bản vẽ trang (Phiên bản v${match[1]}) của bạn đã được phê duyệt thành công.`;
      }
    } else if (lowerContent.includes('your page version') && lowerContent.includes('has been rejected')) {
      const match = content.match(/your page version\s+(.+?)\s+has been rejected/i);
      if (match) {
        viContent = `Bản vẽ trang (Phiên bản v${match[1]}) của bạn bị từ chối.`;
      }
    } else if (lowerContent.includes('reviewer requested changes on page version')) {
      const match = content.match(/reviewer requested changes on page version\s+(.+?):\s*(.*)/i);
      if (match) {
        viContent = `Người duyệt yêu cầu sửa trang (Phiên bản v${match[1]}): ${match[2]}`;
      }
    } else if (lowerContent.includes('revision requested for your task. feedback:')) {
      const match = content.match(/feedback:\s*(.*)/i);
      if (match) {
        viContent = `Yêu cầu chỉnh sửa lại nhiệm vụ. Phản hồi: ${match[1]}`;
      }
    } else if (lowerContent.includes('reassigned to you')) {
      viContent = 'Nhiệm vụ đã được phân công lại cho bạn.';
    } else if (lowerContent.includes('transferred to you')) {
      viContent = 'Nhiệm vụ đã được chuyển giao cho bạn.';
    }

    viContent = viContent
      .replace(/has been approved/gi, 'đã được phê duyệt')
      .replace(/has been rejected/gi, 'bị từ chối')
      .replace(/needs revision/gi, 'cần sửa chữa')
      .replace(/is overdue/gi, 'đã quá hạn');

    return { title: viTitle, message: viContent };
  };

  const formatRealTime = (dateStr: string) => {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    const pad = (n: number) => n.toString().padStart(2, '0')
    return `${pad(d.getHours())}:${pad(d.getMinutes())} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
  };

  const mapType = (backendType: string): "Assistant" | "Editor" | "Board" | "Ranking" | "System" => {
    const t = (backendType || '').toLowerCase();
    if (t.includes('task') || t.includes('submission')) return 'Assistant';
    if (t.includes('editor') || t.includes('feedback') || t.includes('ms_fb')) return 'Editor';
    if (t.includes('review') || t.includes('vote') || t.includes('board') || t.includes('chapter_approved')) return 'Board';
    if (t.includes('ranking')) return 'Ranking';
    return 'System';
  };

  const mapLink = (backendType: string): string => {
    const t = (backendType || '').toLowerCase();
    if (t.includes('task') || t.includes('submission')) return '/dashboard/mangaka/submission';
    if (t.includes('ms_fb')) return '/dashboard/mangaka/manuscripts';
    if (t.includes('feedback') || t.includes('editor')) return '/dashboard/mangaka/feedback';
    if (t.includes('ranking')) return '/dashboard/mangaka/ranking';
    return '';
  };

  const loadNotifications = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await rankingService.getNotifications()
      const mapped: Notification[] = data.map(n => {
        const type = mapType(n.type);
        const link = mapLink(n.type);
        const { title, message } = translateNotification(n.title, n.content || '', n.type);
        return {
          id: n.notification_id,
          type,
          title,
          message,
          createdAt: n.created_at,
          isRead: n.is_read,
          link: link || undefined,
        };
      })
      setNotifications(mapped)
    } catch (err: any) {
      console.error(err)
      setError('Không thể tải danh sách thông báo.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotifications()
    const interval = setInterval(() => {
      loadNotifications()
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  const handleMarkAllRead = async () => {
    try {
      await rankingService.markAllRead()
      await loadNotifications()
    } catch (err) {
      console.error(err)
      alert('Không thể đánh dấu đã đọc tất cả thông báo.')
    }
  }

  const handleMarkRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await rankingService.markAsRead(id)
      await loadNotifications()
    } catch (err) {
      console.error(err)
      alert('Không thể đánh dấu thông báo đã đọc.')
    }
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Bạn có chắc chắn muốn xóa thông báo này?')) return
    try {
      await rankingService.deleteNotification(id)
      await loadNotifications()
    } catch (err) {
      console.error(err)
      alert('Không thể xóa thông báo.')
    }
  }

  const handleNotifClick = async (notif: Notification) => {
    if (!notif.isRead) {
      try {
        await rankingService.markAsRead(notif.id)
      } catch (err) {
        console.error(err)
      }
    }
    if (notif.link) {
      navigate(notif.link)
    } else {
      await loadNotifications()
    }
  }

  const filteredNotifs = notifications.filter(n => {
    if (filter === "All") return true;
    if (filter === "Unread") return !n.isRead;
    return n.type === filter;
  })

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="font-manga text-4xl font-bold uppercase text-manga-red tracking-wide mb-2 flex items-center gap-3">
            <Bell className="w-8 h-8" />
            THÔNG BÁO
          </h1>
          <p className="text-gray-600 font-bold">Cập nhật tình hình từ trợ lý, biên tập viên và hội đồng</p>
        </div>
        <button 
          onClick={handleMarkAllRead}
          className="bg-white border-2 border-manga-ink text-manga-ink font-bold px-4 py-2 hover:bg-gray-100 uppercase text-sm flex items-center gap-2 manga-shadow-sm hover:translate-y-0.5 hover:shadow-none transition-all"
        >
          <Check className="w-4 h-4" />
          Đánh dấu tất cả đã đọc
        </button>
      </div>

      <div className="bg-white border-4 border-manga-ink manga-shadow flex flex-col md:flex-row">
        {/* Sidebar Filters */}
        <div className="w-full md:w-64 border-b-4 md:border-b-0 md:border-r-4 border-manga-ink bg-gray-50 shrink-0">
          <div className="p-4 border-b-2 border-manga-ink flex items-center gap-2">
            <Filter className="w-5 h-5" />
            <h2 className="font-manga font-bold text-lg uppercase">Bộ lọc</h2>
          </div>
          <div className="p-2 space-y-1">
            {["All", "Unread", "Assistant", "Editor", "Board", "Ranking"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`w-full text-left px-4 py-3 font-bold uppercase text-sm border-2 transition-colors ${
                  filter === f ? 'bg-manga-red text-white border-manga-ink' : 'bg-transparent border-transparent hover:bg-gray-200 text-gray-700'
                }`}
              >
                {f === 'All' ? 'Tất cả' : 
                 f === 'Unread' ? 'Chưa đọc' : 
                 f === 'Assistant' ? 'Từ Trợ lý' :
                 f === 'Editor' ? 'Từ Editor' :
                 f === 'Board' ? 'Từ Hội đồng' : 'Xếp hạng'}
                
                {f === 'Unread' && notifications.filter(n => !n.isRead).length > 0 && (
                  <span className="ml-2 bg-red-600 text-white px-2 py-0.5 rounded-full text-xs">
                    {notifications.filter(n => !n.isRead).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 flex flex-col">
          <div className="divide-y-2 divide-gray-100">
            {loading ? (
              <div className="p-12 text-center text-gray-400 font-bold uppercase text-sm">
                Đang tải dữ liệu thông báo...
              </div>
            ) : error ? (
              <div className="p-12 text-center text-manga-red font-bold text-sm">
                Có lỗi xảy ra: {error}
              </div>
            ) : filteredNotifs.length > 0 ? filteredNotifs.map(n => (
              <div 
                key={n.id}
                onClick={() => handleNotifClick(n)}
                className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer flex gap-4 ${!n.isRead ? 'bg-red-50/30' : ''}`}
              >
                <div className={`w-12 h-12 shrink-0 border-2 border-manga-ink flex items-center justify-center ${
                  n.type === 'Editor' ? 'bg-blue-100 text-blue-600' :
                  n.type === 'Assistant' ? 'bg-green-100 text-green-600' :
                  n.type === 'Ranking' ? 'bg-orange-100 text-orange-600' :
                  n.type === 'Board' ? 'bg-purple-100 text-purple-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  <Bell className="w-6 h-6" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 border border-current ${
                      n.type === 'Editor' ? 'text-blue-600' :
                      n.type === 'Assistant' ? 'text-green-600' :
                      n.type === 'Ranking' ? 'text-orange-600' :
                      n.type === 'Board' ? 'text-purple-600' :
                      'text-gray-600'
                    }`}>{n.type}</span>
                    {!n.isRead && <span className="w-2 h-2 rounded-full bg-red-500"></span>}
                    <span className="text-xs text-gray-400 font-bold ml-auto">{formatRealTime(n.createdAt)}</span>
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 truncate">{n.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                </div>

                <div className="flex flex-col gap-2 shrink-0 border-l-2 border-gray-100 pl-4">
                  {!n.isRead && (
                    <button 
                      onClick={(e) => handleMarkRead(n.id, e)}
                      className="text-xs font-bold text-gray-500 hover:text-manga-ink flex items-center gap-1"
                      title="Đánh dấu đã đọc"
                    >
                      <Check className="w-4 h-4" /> Đọc
                    </button>
                  )}
                  <button 
                    onClick={(e) => handleDelete(n.id, e)}
                    className="text-xs font-bold text-gray-500 hover:text-red-600 flex items-center gap-1"
                    title="Xóa thông báo"
                  >
                    <Trash2 className="w-4 h-4" /> Xóa
                  </button>
                </div>
              </div>
            )) : (
              <div className="p-12 text-center">
                <Bell className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 font-bold uppercase text-lg">Không có thông báo nào</p>
                <p className="text-gray-400 text-sm mt-1">Tất cả đều gọn gàng!</p>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Footer */}
      <footer className="mt-16 pt-8 border-t-2 border-manga-ink flex flex-col md:flex-row items-center justify-between gap-4 text-sm font-bold text-gray-500">
        <div className="font-manga text-2xl text-manga-red">MangaFlow</div>
        <div>© 2026 MangaFlow System. Gangan Press Co. Ltd. All rights reserved.</div>
        <div className="flex items-center gap-6">
          
          <a href="#" className="hover:text-manga-red transition-colors">Quy tắc xuất bản</a>
          <a href="#" className="hover:text-manga-red transition-colors">Hỗ trợ Mangaka</a>
        </div>
      </footer>
    </div>
  )
}
