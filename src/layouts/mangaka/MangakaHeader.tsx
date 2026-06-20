import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router'
import { Bell, MessageSquare, Send, User, Settings, LogOut } from 'lucide-react'
import { mangakaStore, Notification, EditorFeedback } from '@/data/mangakaMockData'
import { rankingService } from '@/services/ranking.service'

const mapType = (backendType: string): "Assistant" | "Editor" | "Board" | "Ranking" | "System" => {
  const t = (backendType || '').toLowerCase();
  if (t.includes('task') || t.includes('submission')) return 'Assistant';
  if (t.includes('editor') || t.includes('feedback')) return 'Editor';
  if (t.includes('review') || t.includes('vote') || t.includes('board') || t.includes('chapter_approved')) return 'Board';
  if (t.includes('ranking')) return 'Ranking';
  return 'System';
};

const mapLink = (backendType: string): string => {
  const t = (backendType || '').toLowerCase();
  if (t.includes('task') || t.includes('submission')) return '/dashboard/mangaka/submission';
  if (t.includes('feedback') || t.includes('editor')) return '/dashboard/mangaka/feedback';
  if (t.includes('ranking')) return '/dashboard/mangaka/ranking';
  return '';
};

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
  } else if (t === 'feedback_created' || lowerTitle.includes('feedback created') || lowerTitle.includes('nhận xét')) {
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

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotif, setShowNotif] = useState(false);

  // Determine breadcrumb based on current path
  const getBreadcrumb = () => {
    const path = location.pathname
    let sectionName = 'Trang Chủ'

    if (path === '/dashboard/mangaka') {
      sectionName = 'Trang Chủ'
    } else if (path === '/dashboard/mangaka/series') {
      sectionName = 'Series của tôi'
    } else if (path === '/dashboard/mangaka/create-series') {
      sectionName = 'Tạo bản thảo'
    } else if (path === '/dashboard/mangaka/submission') {
      sectionName = 'Duyệt kết quả'
    } else if (path === '/dashboard/mangaka/assign-task') {
      sectionName = 'Giao việc trợ lý'
    } else if (path === '/dashboard/mangaka/assistants') {
      sectionName = 'Trợ lý của tôi'
    } else if (path === '/dashboard/mangaka/ranking') {
      sectionName = 'Xếp hạng & Cảnh báo'
    } else if (path === '/dashboard/mangaka/feedback') {
      sectionName = 'Nhận xét từ Editor'
    } else if (path === '/dashboard/mangaka/board-review') {
      sectionName = 'Hội đồng duyệt'
    } else if (path === '/dashboard/mangaka/risk-alerts') {
      sectionName = 'Cảnh báo rủi ro'
    } else if (path === '/dashboard/mangaka/recovery-proposal') {
      sectionName = 'Kế hoạch phục hồi'
    } else if (path === '/dashboard/mangaka/notifications') {
      sectionName = 'Thông báo'
    } else if (path === '/dashboard/mangaka/manuscripts') {
      sectionName = 'Quản lý Chapter'
    } else if (path === '/dashboard/mangaka/profile') {
      sectionName = 'Hồ sơ cá nhân'
    } else if (path === '/dashboard/mangaka/settings') {
      sectionName = 'Cài đặt'
    } else if (path.startsWith('/dashboard/mangaka/page-viewer/')) {
      sectionName = 'Xem bản vẽ'
    } else if (path.includes('/create-chapter')) {
      sectionName = 'Tạo Chapter mới'
    } else if (path.startsWith('/dashboard/mangaka/series/')) {
      sectionName = 'Chi tiết Series'
    }

    return (
      <div className="flex items-center gap-2 text-sm font-sans font-semibold text-gray-500">
        <Link to="/dashboard/mangaka" className="uppercase text-xs font-bold tracking-wider text-gray-400 hover:text-manga-red transition-colors">
          MANGAFLOW
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-900 font-bold">{sectionName}</span>
      </div>
    )
  }
  const [showFeedback, setShowFeedback] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [feedbacks, setFeedbacks] = useState<EditorFeedback[]>([]);

  const [user, setUser] = useState<any>(() => {
    const storedUser = localStorage.getItem('mangaflow_user')
    return storedUser ? JSON.parse(storedUser) : null
  });

  const notifRef = useRef<HTMLDivElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const loadRealNotifications = async () => {
    try {
      const data = await rankingService.getNotifications()
      const mapped = data.map(n => {
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
          link: link || undefined
        };
      });
      setNotifications(mapped);
    } catch (err) {
      console.error('Lỗi tải thông báo của Mangaka:', err);
    }
  };

  useEffect(() => {
    loadRealNotifications();
    setFeedbacks(mangakaStore.getEditorFeedbacks());

    const interval = setInterval(() => {
      loadRealNotifications();
    }, 15000);

    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotif(false);
      }
      if (feedbackRef.current && !feedbackRef.current.contains(event.target as Node)) {
        setShowFeedback(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    const handleProfileUpdate = () => {
      const storedUser = localStorage.getItem('mangaflow_user')
      setUser(storedUser ? JSON.parse(storedUser) : null)
    }
    window.addEventListener('mangaflow_profile_updated', handleProfileUpdate)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener('mangaflow_profile_updated', handleProfileUpdate);
      clearInterval(interval);
    }
  }, []);

  // Reload notifications on navigation
  useEffect(() => {
    loadRealNotifications();
  }, [location.pathname]);

  const displayName = user?.fullName || 'Tokuda Oda'
  const userInitials = displayName === 'Tokuda Oda' ? 'TO' : (displayName.split(' ').pop()?.slice(0, 2).toUpperCase() || 'TO')

  const unreadNotifs = notifications.filter(n => !n.isRead).length;
  const unreadFeedbacks = feedbacks.filter(f => f.status === "Open").length;

  const handleLogout = () => {
    localStorage.removeItem('mangaflow_user');
    navigate('/login');
  };

  const handleNotifClick = async (id: string, link?: string) => {
    try {
      await rankingService.markAsRead(id);
      await loadRealNotifications();
    } catch (err) {
      console.error('Lỗi khi đánh dấu thông báo đã đọc:', err);
    }
    setShowNotif(false);
    if (link) navigate(link);
  };

  return (
    <header className="h-16 bg-white border-b-4 border-manga-ink flex items-center justify-between px-8 sticky top-0 z-30">
      {/* Left Navigation / Breadcrumb */}
      <div className="flex items-center">
        {getBreadcrumb()}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setShowNotif(!showNotif); setShowFeedback(false); setShowProfile(false); }}
            className="relative text-manga-ink hover:text-manga-red transition-colors mt-2"
          >
            <Bell className="w-6 h-6" />
            {unreadNotifs > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-manga-red text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                {unreadNotifs}
              </span>
            )}
          </button>

          {showNotif && (
            <div className="absolute top-12 right-0 w-80 bg-white border-2 border-manga-ink manga-shadow-sm flex flex-col z-50">
              <div className="p-3 border-b-2 border-manga-ink bg-gray-50 flex justify-between items-center">
                <span className="font-bold text-sm uppercase">Thông báo mới ({unreadNotifs})</span>
                <Link to="/dashboard/mangaka/notifications" className="text-xs text-blue-600 hover:underline" onClick={() => setShowNotif(false)}>Xem tất cả</Link>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.slice(0, 5).map(n => (
                  <div
                    key={n.id}
                    onClick={() => handleNotifClick(n.id, n.link)}
                    className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${!n.isRead ? 'bg-red-50/50' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-bold">{n.title}</span>
                      <span className="text-[10px] text-gray-500">{formatRealTime(n.createdAt)}</span>
                    </div>
                    <p className="text-xs text-gray-700 line-clamp-2">{n.message}</p>
                  </div>
                ))}
                {notifications.length === 0 && <div className="p-4 text-center text-sm text-gray-500">Không có thông báo</div>}
              </div>
            </div>
          )}
        </div>

        {/* Feedbacks Dropdown */}
        <div className="relative" ref={feedbackRef}>
          <button
            onClick={() => { setShowFeedback(!showFeedback); setShowNotif(false); setShowProfile(false); }}
            className="relative text-manga-ink hover:text-manga-red transition-colors mt-2"
          >
            <MessageSquare className="w-6 h-6" />
            {unreadFeedbacks > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-manga-red text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                {unreadFeedbacks}
              </span>
            )}
          </button>

          {showFeedback && (
            <div className="absolute top-12 right-0 w-80 bg-white border-2 border-manga-ink manga-shadow-sm flex flex-col z-50">
              <div className="p-3 border-b-2 border-manga-ink bg-gray-50 flex justify-between items-center">
                <span className="font-bold text-sm uppercase">Góp ý chưa xử lý ({unreadFeedbacks})</span>
                <Link to="/dashboard/mangaka/feedback" className="text-xs text-blue-600 hover:underline" onClick={() => setShowFeedback(false)}>Xem tất cả</Link>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {feedbacks.filter(f => f.status === "Open").slice(0, 5).map(f => (
                  <Link
                    key={f.id}
                    to="/dashboard/mangaka/feedback"
                    onClick={() => setShowFeedback(false)}
                    className="block p-3 border-b border-gray-100 hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-bold text-red-600">{f.severity === "Critical" ? "[QUAN TRỌNG]" : ""} Góp ý từ {f.sender}</span>
                      <span className="text-[10px] text-gray-500">{new Date(f.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-gray-700 line-clamp-2">{f.content}</p>
                  </Link>
                ))}
                {feedbacks.filter(f => f.status === "Open").length === 0 && <div className="p-4 text-center text-sm text-gray-500">Tuyệt vời! Không có góp ý nào cần xử lý.</div>}
              </div>
            </div>
          )}
        </div>

        <Link to="/dashboard/mangaka/submission" className="bg-manga-red text-white font-manga font-bold text-sm uppercase px-5 py-2 border-2 border-manga-ink manga-shadow-sm hover:translate-y-0.5 hover:shadow-none transition-all whitespace-nowrap ml-2">
          NỘP BẢN THẢO
        </Link>

        {/* Vertical divider */}
        <div className="h-6 w-px bg-gray-200 ml-2" />

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => { setShowProfile(!showProfile); setShowNotif(false); setShowFeedback(false); }}
            className="w-10 h-10 rounded-full overflow-hidden border-2 border-manga-ink hover:border-manga-red transition-colors ml-2 bg-manga-red flex items-center justify-center text-white font-bold"
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-sm">{userInitials}</span>
            )}
          </button>

          {showProfile && (
            <div className="absolute top-14 right-0 w-48 bg-white border-2 border-manga-ink manga-shadow-sm flex flex-col z-50">
              <Link
                to="/dashboard/mangaka/profile"
                onClick={() => setShowProfile(false)}
                className="flex items-center gap-2 p-3 border-b border-gray-100 hover:bg-gray-50"
              >
                <User className="w-4 h-4" />
                <span className="text-sm font-bold">Hồ sơ cá nhân</span>
              </Link>
              <Link
                to="/dashboard/mangaka/settings"
                onClick={() => setShowProfile(false)}
                className="flex items-center gap-2 p-3 border-b border-gray-100 hover:bg-gray-50"
              >
                <Settings className="w-4 h-4" />
                <span className="text-sm font-bold">Cài đặt</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 p-3 text-red-600 hover:bg-red-50 w-full text-left"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-bold">Đăng xuất</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
