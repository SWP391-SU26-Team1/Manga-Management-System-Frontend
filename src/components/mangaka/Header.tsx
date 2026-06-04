import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router'
import { Bell, MessageSquare, Send, User, Settings, LogOut } from 'lucide-react'
import { mangakaStore, Notification, EditorFeedback } from '@/data/mangakaMockData'

export function Header() {
  const navigate = useNavigate();
  const [showNotif, setShowNotif] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [feedbacks, setFeedbacks] = useState<EditorFeedback[]>([]);

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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      {/* Left Navigation */}
      <nav className="flex items-center gap-8">
        <Link to="/dashboard/mangaka">
          <span className="font-manga text-2xl font-bold uppercase text-manga-red tracking-wide">
            MANGAFLOW
          </span>
        </Link>
        <div className="flex items-center gap-6 text-sm font-manga font-bold uppercase tracking-wide">
          <Link
            to="/dashboard/mangaka/schedule"
            className="text-manga-ink hover:text-manga-red transition-colors"
          >
            Lịch trình
          </Link>
          <Link to="/dashboard/mangaka/assets" className="text-manga-ink hover:text-manga-red transition-colors">
            Kho tư liệu
          </Link>
          <Link to="/dashboard/mangaka/library" className="text-manga-ink hover:text-manga-red transition-colors">
            Thư viện
          </Link>
        </div>
      </nav>

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

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => { setShowProfile(!showProfile); setShowNotif(false); setShowFeedback(false); }}
            className="w-10 h-10 rounded-full overflow-hidden border-2 border-manga-ink hover:border-manga-red transition-colors ml-2"
          >
            <img
              src="https://i.pravatar.cc/150?u=mangaka_sensei"
              alt="Avatar"
              className="w-full h-full object-cover"
            />
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
