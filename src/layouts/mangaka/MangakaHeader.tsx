import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router'
import { Bell, MessageSquare, Send, User, Settings, LogOut } from 'lucide-react'
import { mangakaStore, Notification, EditorFeedback } from '@/data/mangakaMockData'

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

  useEffect(() => {
    setNotifications(mangakaStore.getNotifications());
    setFeedbacks(mangakaStore.getEditorFeedbacks());

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
    }
  }, []);

  const displayName = user?.fullName || 'Tokuda Oda'
  const userInitials = displayName === 'Tokuda Oda' ? 'TO' : (displayName.split(' ').pop()?.slice(0, 2).toUpperCase() || 'TO')

  const unreadNotifs = notifications.filter(n => !n.isRead).length;
  const unreadFeedbacks = feedbacks.filter(f => f.status === "Open").length;

  const handleLogout = () => {
    localStorage.removeItem('mangaflow_user');
    navigate('/login');
  };

  const handleNotifClick = (id: string, link?: string) => {
    mangakaStore.markNotificationRead(id);
    setNotifications(mangakaStore.getNotifications());
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
                      <span className="text-[10px] text-gray-500">{new Date(n.createdAt).toLocaleDateString()}</span>
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
