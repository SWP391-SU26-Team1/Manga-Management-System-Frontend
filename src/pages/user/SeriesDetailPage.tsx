import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router'
import { Star, Heart, Award, User, Mail, Users, Briefcase, BookOpen, Trash2, MessageSquare } from 'lucide-react'
import { readerService } from '@/services/reader.service'
import { SeriesDetail, PublishedChapter } from '@/types/reader.types'
import { useToast } from '@/contexts/ToastContext'
import { calculateMangakaAverageRating, calculateMangakaLevel, calculateSeriesRating } from '@/utils/ratingUtils'

const getLikeKey = () => {
  try {
    const userStr = localStorage.getItem('mangaflow_user') || localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.id) return `mangaflow_liked_chapters_${user.id}`;
    }
  } catch (e) {}
  return 'mangaflow_liked_chapters_guest';
}

export default function SeriesDetailPage() {
  const { seriesId } = useParams()
  const { showToast } = useToast()
  const [series, setSeries] = useState<SeriesDetail | null>(null)
  const [chapters, setChapters] = useState<PublishedChapter[]>([])
  const [comments, setComments] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'info' | 'chapters' | 'comments'>('chapters')
  const [lastReadChapterId, setLastReadChapterId] = useState<string | null>(null)
  const [authorWorks, setAuthorWorks] = useState<any[]>([])
  const [localTotalLikes, setLocalTotalLikes] = useState(0)
  const [likedChapters, setLikedChapters] = useState<Record<string, boolean>>({})
  const [selectedUser, setSelectedUser] = useState<any | null>(null)
  const [replyingTo, setReplyingTo] = useState<{id: string, name: string, chapterId?: string} | null>(null)
  const [commentToDelete, setCommentToDelete] = useState<{chapterId: string, commentId: string} | null>(null)
  const [replyContent, setReplyContent] = useState('')

  const handleChapterLike = async (e: React.MouseEvent, chapterId: string) => {
    e.preventDefault();
    const userStr = localStorage.getItem('mangaflow_user') || localStorage.getItem('user');
    if (!userStr) {
      showToast('Vui lòng đăng nhập để theo dõi!', 'error');
      return;
    }
    const isCurrentlyLiked = !!likedChapters[chapterId];
    const newIsLiked = !isCurrentlyLiked;
    
    try {
      // Đọc trạng thái cũ từ localStorage
      const stored = localStorage.getItem(getLikeKey());
      const parsed = stored ? JSON.parse(stored) : {};
      
      // Kiểm tra xem trước khi click, user đã like chapter nào của truyện này chưa
      const wasLikingAny = chapters.some(c => parsed[c.id]);
      
      if (newIsLiked) {
        parsed[chapterId] = true;
      } else {
        delete parsed[chapterId];
      }
      
      // Lưu vào localStorage
      localStorage.setItem(getLikeKey(), JSON.stringify(parsed));
      setLikedChapters(parsed);
      
      // Kiểm tra xem sau khi click, user CÒN like chapter nào không
      const isLikingAnyNow = chapters.some(c => parsed[c.id]);
      
      // Chỉ tăng/giảm Tổng Like nếu trạng thái "1 user = 1 like" thay đổi (từ 0 lên 1 hoặc từ 1 về 0)
      if (!wasLikingAny && isLikingAnyNow) {
        setLocalTotalLikes(prev => prev + 1);
      } else if (wasLikingAny && !isLikingAnyNow) {
        setLocalTotalLikes(prev => prev - 1);
      }
      
      window.dispatchEvent(new Event('mangaflow_like_update'));
      
      // Gọi API backend lưu Like
      await readerService.toggleChapterLike(chapterId);
    } catch (err) {}
  }

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !replyingTo) return;

    const userStr = localStorage.getItem('mangaflow_user') || localStorage.getItem('user');
    if (!userStr) {
      showToast('Vui lòng đăng nhập để bình luận!', 'error');
      return;
    }

    if (!replyingTo.chapterId) {
      showToast('Không thể xác định chương để bình luận.', 'error');
      return;
    }

    const success = await readerService.postChapterComment(replyingTo.chapterId, replyContent, replyingTo.id);
    if (success) {
      setReplyContent('');
      setReplyingTo(null);
      if (seriesId) {
        readerService.getSeriesComments(seriesId).then(setComments);
      }
    } else {
      showToast('Đã có lỗi xảy ra, vui lòng thử lại sau.', 'error');
    }
  };

  const confirmDeleteComment = (chapterId: string, commentId: string) => {
    setCommentToDelete({chapterId, commentId});
  };

  const executeDeleteComment = async () => {
    if (!commentToDelete) return;
    const { chapterId, commentId } = commentToDelete;
    const success = await readerService.deleteChapterComment(chapterId, commentId);
    if (success) {
      setComments(prev => prev.filter(c => (c.comment_id || c.id) !== commentId));
      showToast('Đã xóa bình luận', 'success');
      // readerService.getSeriesComments(seriesId).then(setComments); // API doesn't return replies, avoid fetching
    } else {
      showToast('Xóa bình luận thất bại', 'error');
    }
    setCommentToDelete(null);
  };

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const stored = localStorage.getItem(getLikeKey());
        if (stored) setLikedChapters(JSON.parse(stored));
      } catch (err) {}
    };
    handleStorageChange(); // Run once on mount to ensure fresh data
    window.addEventListener('focus', handleStorageChange);
    window.addEventListener('pageshow', handleStorageChange);
    window.addEventListener('mangaflow_like_update', handleStorageChange);
    return () => {
      window.removeEventListener('focus', handleStorageChange);
      window.removeEventListener('pageshow', handleStorageChange);
      window.removeEventListener('mangaflow_like_update', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    if (seriesId) {
      Promise.all([
        readerService.getSeriesDetail(seriesId),
        readerService.getPublishedChapters(seriesId)
      ]).then(([seriesData, chaps]) => {
        setSeries(seriesData);
        setChapters(chaps);
        
        let backendLikes = seriesData ? seriesData.totalLikes || 0 : 0;
        
        // Đồng bộ đếm Like từ localStorage và API
        try {
          const stored = localStorage.getItem(getLikeKey());
          const parsed = stored ? JSON.parse(stored) : {};
          
          // Sync with API
          const userStr = localStorage.getItem('mangaflow_user') || localStorage.getItem('user');
          let updated = false;
          if (userStr && seriesData && seriesData.chaptersData) {
            const user = JSON.parse(userStr);
            if (user.id) {
              seriesData.chaptersData.forEach((c: any) => {
                if (c.chapter_like && c.chapter_like.includes(user.id)) {
                  parsed[c.chapter_id] = true;
                  updated = true;
                } else if (c.chapter_like && !c.chapter_like.includes(user.id)) {
                  if (parsed[c.chapter_id]) {
                    delete parsed[c.chapter_id];
                    updated = true;
                  }
                }
              });
              if (updated) {
                localStorage.setItem(getLikeKey(), JSON.stringify(parsed));
                window.dispatchEvent(new Event('mangaflow_like_update'));
              }
            }
          }

          // Dùng trực tiếp backendLikes vì API getSeriesDetail đã lọc uniqueUsers rất chính xác
          setLocalTotalLikes(backendLikes);
        } catch (err) {
          setLocalTotalLikes(backendLikes);
        }
      });
      readerService.getSeriesComments(seriesId).then(setComments)
      
      const fetchHistory = () => {
        readerService.getReadingHistory().then(history => {
          const bookmark = history.find(h => h.seriesId === seriesId)
          if (bookmark && bookmark.lastChapterId) {
            setLastReadChapterId(bookmark.lastChapterId)
          }
        })
      };
      
      fetchHistory();
      
      window.addEventListener('focus', fetchHistory);
      window.addEventListener('pageshow', fetchHistory);
      window.addEventListener('mangaflow_history_update', fetchHistory);
      
      return () => {
        window.removeEventListener('focus', fetchHistory);
        window.removeEventListener('pageshow', fetchHistory);
        window.removeEventListener('mangaflow_history_update', fetchHistory);
      };
    }
  }, [seriesId])

  useEffect(() => {
    if (selectedUser) {
      if (selectedUser.userId) {
        readerService.getSeriesByUser(selectedUser.userId, 10).then(works => setAuthorWorks(works));
      } else {
        // Fallback for mock/unknown users without ID
        readerService.getLatestUpdates(10).then(works => setAuthorWorks(works));
      }
    }
  }, [selectedUser])

  if (!series) return (
    <div className="min-h-[60vh] flex items-center justify-center bg-[#F5F5F5] dark:bg-zinc-900 transition-colors">
      <div className="font-manga text-2xl animate-pulse text-manga-ink uppercase dark:text-white">Đang tải dữ liệu...</div>
    </div>
  )

  // Build comment tree
  const commentMap = new Map();
  comments.forEach(c => {
    commentMap.set(c.id || c.comment_id, { ...c, replies: [] });
  });
  const commentTree: any[] = [];
  comments.forEach(c => {
    const parentId = c.parent_comment_id || c.parent_id; // Support both just in case
    if (parentId && commentMap.has(parentId)) {
      commentMap.get(parentId).replies.push(commentMap.get(c.id || c.comment_id));
    } else {
      commentTree.push(commentMap.get(c.id || c.comment_id));
    }
  });

  const getTimeAgo = (dateStr: string) => {
    if (!dateStr) return 'Không xác định'
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return 'Không xác định'
    
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
    if (seconds < 60) return 'Vừa xong'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes} phút trước`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} giờ trước`
    const days = Math.floor(hours / 24)
    if (days < 30) return `${days} ngày trước`
    const months = Math.floor(days / 30)
    if (months < 12) return `${months} tháng trước`
    return `${Math.floor(months / 12)} năm trước`
  }

  const activities: any[] = [];
  
  if (selectedUser) {
    authorWorks.forEach(work => {
      if (work.latestChapterNumber > 0 && work.latestChapterDate) {
        activities.push({
          id: `chap-${work.id}`,
          title: `Vừa ra mắt chương ${work.latestChapterNumber} của "${work.title}"`,
          date: new Date(work.latestChapterDate),
          dateStr: work.latestChapterDate
        });
      }
      
      if (work.viewCount >= 100) {
        let milestone = 100;
        if (work.viewCount >= 1000000) milestone = 1000000;
        else if (work.viewCount >= 100000) milestone = 100000;
        else if (work.viewCount >= 10000) milestone = 10000;
        else if (work.viewCount >= 1000) milestone = 1000;
        
        activities.push({
          id: `view-${work.id}-${milestone}`,
          title: `Tác phẩm "${work.title}" đạt mốc ${milestone.toLocaleString('vi-VN')} lượt đọc`,
          date: new Date(work.updatedAt || work.createdAt || Date.now()),
          dateStr: work.updatedAt || work.createdAt || new Date().toISOString()
        });
      }

      if (work.createdAt) {
        activities.push({
          id: `series-${work.id}`,
          title: `Đã ra mắt tác phẩm mới "${work.title}"`,
          date: new Date(work.createdAt),
          dateStr: work.createdAt
        });
      }
    });
  }

  activities.sort((a, b) => b.date.getTime() - a.date.getTime());
  const topActivities = activities.slice(0, 5);

  return (
    <div className="min-h-screen bg-[#F5F5F5] py-8 px-4 sm:px-6 lg:px-8 relative dark:bg-zinc-900 transition-colors"
         style={{ backgroundImage: 'radial-gradient(#d1d5db 2px, transparent 2px)', backgroundSize: '32px 32px' }}>
      <div className="max-w-[1400px] mx-auto relative z-10">
        
        {/* Top Banner (Hero) */}
        <div className="bg-white border-[4px] border-black mb-8 relative overflow-hidden dark:bg-zinc-800 dark:border-black">
          <div 
            className="absolute inset-0 opacity-10 bg-cover bg-center filter blur-xl"
            style={{ backgroundImage: `url(${series.coverImageUrl})` }}
          />

          <div className="relative p-8 md:p-12 flex flex-col md:flex-row gap-8 lg:gap-16 items-center md:items-start z-10">
            {/* Slanted Cover Image (Cuốn truyện) */}
            <div className="w-[200px] md:w-[240px] flex-shrink-0 relative" style={{ perspective: '1000px' }}>
              <div 
                className="relative transition-transform duration-500 ease-out"
                style={{ 
                  transformStyle: 'preserve-3d',
                  transform: 'rotateY(15deg) rotateX(5deg)',
                  boxShadow: '-15px 20px 15px rgba(0,0,0,0.3)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'rotateY(0deg) rotateX(0deg)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'rotateY(15deg) rotateX(5deg)'}
              >
                <div 
                  className="absolute top-0 left-0 bottom-0 w-6 bg-[#e0e0e0] border-y-[3px] border-l-[3px] border-black flex items-center justify-center overflow-hidden dark:bg-zinc-700 dark:border-black"
                  style={{
                    transformOrigin: 'left center',
                    transform: 'rotateY(-90deg) translateX(-100%)'
                  }}
                >
                  <span className="text-[10px] font-bold text-gray-500 -rotate-90 whitespace-nowrap dark:text-gray-300">MANGAFLOW</span>
                </div>
                
                <img 
                  src={series.coverImageUrl || ''} 
                  alt={series.title} 
                  className="w-full h-auto aspect-[3/4] object-cover border-[3px] border-black relative z-10 bg-white dark:border-black" 
                  style={{ transform: 'translateZ(1px)' }}
                />
              </div>
            </div>

            {/* Series Info */}
            <div className="flex-1 w-full">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-manga-red text-white font-bold uppercase px-2 py-0.5 text-xs border-2 border-manga-red">
                  {series.status === 'PUBLISHING' ? 'Đang xuất bản' : 'Hoàn thành'}
                </span>
                <span className="font-bold text-gray-700 uppercase tracking-widest text-xs dark:text-gray-300">
                  {series.genres.slice(0, 2).join(' / ')}
                </span>
              </div>

              <h1 className="font-manga text-5xl md:text-6xl font-bold uppercase text-black mb-4 leading-none dark:text-white">
                {series.title}
              </h1>
              
              <div className="flex flex-col gap-3 mb-6">
                {/* Tác giả */}
                <div 
                  className="flex items-center gap-3 cursor-pointer group w-fit"
                  onClick={() => {
                    const mangaka = series.teamMembers?.find(m => m.roleInSeries === 'mangaka' || m.roleInSeries === 'owner');
                    setSelectedUser({
                      ...(mangaka || { name: series.authorName, avatarUrl: series.authorAvatarUrl, roleInSeries: 'Mangaka' }),
                      isEditor: false
                    });
                  }}
                >
                  <p className="font-bold text-gray-700 text-sm dark:text-gray-300">
                    Tác giả: 
                  </p>
                  <div className="flex items-center gap-2 bg-[#1a1a1a] text-white border-2 border-black px-3 py-1.5 group-hover:-translate-y-1 group-hover:-translate-x-1 group-hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all dark:shadow-[2px_2px_0px_#000]">
                    <div className="w-5 h-5 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center shrink-0">
                      {series.authorAvatarUrl ? (
                        <img src={series.authorAvatarUrl} alt={series.authorName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] font-bold text-gray-300">{series.authorName?.charAt(0)}</span>
                      )}
                    </div>
                    <span className="font-bold text-sm">{series.authorName}</span>
                  </div>
                </div>

                {/* Biên tập viên */}
                {(series.editorName || series.teamMembers?.some(m => ['editor', 'tantou_editor', 'tantou'].includes(m.roleInSeries))) && (
                  <div 
                    className="flex items-center gap-3 cursor-pointer group w-fit"
                    onClick={() => {
                      const editor = series.teamMembers?.find(m => ['editor', 'tantou_editor', 'tantou'].includes(m.roleInSeries));
                      setSelectedUser({
                        ...(editor || { name: series.editorName, avatarUrl: series.editorAvatarUrl, roleInSeries: 'Biên tập viên' }),
                        isEditor: true
                      });
                    }}
                  >
                    <p className="font-bold text-gray-700 text-sm dark:text-gray-300">
                      Biên tập viên: 
                    </p>
                    <div className="flex items-center gap-2 bg-[#1a1a1a] text-white border-2 border-black px-3 py-1.5 group-hover:-translate-y-1 group-hover:-translate-x-1 group-hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all dark:shadow-[2px_2px_0px_#000]">
                      <div className="w-5 h-5 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center shrink-0">
                        {series.editorAvatarUrl ? (
                          <img src={series.editorAvatarUrl || undefined} alt={series.editorName || undefined} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[10px] font-bold text-gray-300">{series.editorName?.charAt(0)}</span>
                        )}
                      </div>
                      <span className="font-bold text-sm">{series.editorName || series.teamMembers?.find(m => ['editor', 'tantou_editor', 'tantou'].includes(m.roleInSeries))?.name}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t-2 border-gray-300 w-full mb-6 dark:border-zinc-700"></div>

              <div className="flex flex-wrap gap-8 mb-8">
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1 dark:text-gray-400">Chương</p>
                  <p className="font-manga text-3xl font-bold dark:text-white">{series.totalChapters}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1 dark:text-gray-400">Lượt đọc</p>
                  <p className="font-manga text-3xl font-bold dark:text-white">
                    {(series.totalViews || series.viewCount || 0) < 1000 
                      ? (series.totalViews || series.viewCount || 0) 
                      : `${Math.floor((series.totalViews || series.viewCount || 0) / 1000)}K${Math.floor(((series.totalViews || series.viewCount || 0) % 1000) / 100) > 0 ? Math.floor(((series.totalViews || series.viewCount || 0) % 1000) / 100) : ''}`}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1 dark:text-gray-400">Đánh giá</p>
                  <p className="font-manga text-3xl font-bold flex items-center dark:text-white">
                    {calculateSeriesRating(series.totalViews || series.viewCount || 0, localTotalLikes).toFixed(1)} <Star className="w-5 h-5 fill-manga-red text-manga-red ml-1 -mt-1" />
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1 dark:text-gray-400">Theo dõi</p>
                  <p className="font-manga text-3xl font-bold dark:text-white">
                    {localTotalLikes.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link 
                  to={`/series/${series.id}/chapter/${chapters.length > 0 ? chapters[chapters.length - 1].id : ''}`}
                  className="bg-manga-red text-white font-bold uppercase text-lg px-8 py-3 border-[3px] border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all dark:border-black dark:shadow-[4px_4px_0px_#000]"
                >
                  ĐỌC TỪ ĐẦU
                </Link>
                <Link 
                  to={`/series/${series.id}/chapter/${lastReadChapterId ? lastReadChapterId : (chapters.length > 0 ? chapters[chapters.length - 1].id : '')}`}
                  className="bg-black text-white font-bold uppercase text-lg px-8 py-3 border-[3px] border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all dark:bg-white dark:text-black dark:border-black dark:shadow-[4px_4px_0px_#000]"
                >
                  ĐỌC TIẾP
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Layout: 2 Columns */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Column: Chapters / Tabs */}
          <div className="lg:w-2/3">
            {/* Tabs */}
            <div className="flex border-b-[3px] border-black mb-6">
              <button 
                onClick={() => setActiveTab('info')}
                className={`px-6 py-3 font-manga text-xl font-bold uppercase transition-colors ${activeTab === 'info' ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white'}`}
              >
                Giới thiệu
              </button>
              <button 
                onClick={() => setActiveTab('chapters')}
                className={`px-6 py-3 font-manga text-xl font-bold uppercase transition-colors ${activeTab === 'chapters' ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white'}`}
              >
                Danh sách chương
              </button>
              <button 
                onClick={() => setActiveTab('comments')}
                className={`px-6 py-3 font-manga text-xl font-bold uppercase transition-colors ${activeTab === 'comments' ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white'}`}
              >
                Bình luận
              </button>
            </div>

            {/* Tab Content: Chapters */}
            {activeTab === 'chapters' && (
              <div className="space-y-4 max-h-[440px] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
                {chapters.map((chapter, index) => (
                  <Link 
                    key={chapter.id}
                    to={`/series/${series.id}/chapter/${chapter.id}`}
                    className="flex items-center justify-between gap-4 bg-white border-[3px] border-black p-4 hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all group dark:bg-zinc-800 dark:border-black dark:shadow-[4px_4px_0px_#000]"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-manga text-xl font-bold uppercase text-black truncate dark:text-white">
                          CHƯƠNG {chapter.chapterNumber} - {chapter.title}
                        </h4>
                        {chapter.isNew && (
                          <span className="bg-manga-red text-white text-[10px] font-bold px-1.5 py-0.5 uppercase">Mới</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 truncate dark:text-gray-400">Khởi đầu của sự kết thúc</p>
                      <p className="text-xs text-gray-400 font-bold mt-1">
                        {index === 0 ? 'Hôm nay' : index === 1 ? '3 ngày trước' : '1 tuần trước'}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Read Status Badge */}
                      {lastReadChapterId && chapters.findIndex(c => c.id === lastReadChapterId) !== -1 && index >= chapters.findIndex(c => c.id === lastReadChapterId) && (
                        <div className="hidden sm:block px-3 py-1 border-[2px] border-green-500 text-green-500 text-xs font-bold uppercase mr-2">
                          Đã đọc
                        </div>
                      )}
                      {/* Follow Button */}
                      <button
                        onClick={(e) => handleChapterLike(e, chapter.id)}
                        className={`font-bold uppercase text-sm px-4 py-2 border-[2px] shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-2 dark:shadow-[2px_2px_0px_#000] ${likedChapters[chapter.id] ? 'bg-manga-red text-white border-manga-red' : 'bg-white text-black border-black dark:bg-zinc-700 dark:text-white'}`}
                      >
                        <Heart className={`w-4 h-4 ${likedChapters[chapter.id] ? 'fill-white text-white' : ''}`} />
                        <span className={likedChapters[chapter.id] ? 'text-white' : ''}>{likedChapters[chapter.id] ? 'ĐÃ THEO DÕI' : 'THEO DÕI'}</span>
                      </button>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {activeTab === 'info' && (
              <div className="bg-white border-[3px] border-black p-6 font-bold dark:bg-zinc-800 dark:border-black dark:text-white">
                {series.description || 'Chưa có mô tả chi tiết.'}
              </div>
            )}

            {activeTab === 'comments' && (
              <div className="space-y-4">
                {replyingTo && (
                  <div className="bg-white border-[3px] border-black p-4 dark:bg-zinc-800 dark:border-black flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs font-bold bg-gray-100 dark:bg-zinc-700 p-2 border-2 border-black dark:border-zinc-600">
                      <span className="dark:text-gray-300">Đang trả lời: <span className="text-manga-red">{replyingTo.name}</span></span>
                      <button type="button" onClick={() => setReplyingTo(null)} className="hover:text-red-500 transition-colors">
                        HUỶ
                      </button>
                    </div>
                    <form onSubmit={handleReplySubmit} className="flex gap-2">
                      <input 
                        type="text" 
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Nhập bình luận của bạn..."
                        className="flex-1 bg-gray-50 dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 px-3 py-2 font-medium text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-manga-red transition-colors"
                      />
                      <button 
                        type="submit"
                        disabled={!replyContent.trim()}
                        className="bg-manga-red text-white border-2 border-black px-4 py-2 font-bold uppercase hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[2px_2px_0px_#000]"
                      >
                        GỬI
                      </button>
                    </form>
                  </div>
                )}
                {commentTree.length > 0 ? (
                  commentTree.map((comment, index) => {
                    const renderComment = (c: any, depth: number = 0) => (
                      <div key={c.comment_id || c.id || index} className={`mt-2 ${depth > 0 ? 'ml-4 sm:ml-8 border-l-[3px] border-gray-300 dark:border-zinc-700 pl-3 sm:pl-4' : ''}`}>
                        <div className="bg-white border-[3px] border-black p-4 dark:bg-zinc-800 dark:border-black">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-manga-red overflow-hidden dark:border-manga-red flex-shrink-0">
                                {c.user?.avatar_url ? (
                                  <img src={c.user.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full bg-manga-red flex items-center justify-center text-white font-bold text-xs uppercase">
                                    {(c.user?.name || c.user?.username || 'U')[0]}
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-bold text-sm text-zinc-900 dark:text-white">{c.user?.name || c.user?.username || 'Người dùng ẩn danh'}</p>
                                  {c.chapter?.chapter_number && (
                                    <span className="bg-manga-red text-white text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider rounded-sm shadow-[2px_2px_0px_#000]">
                                      Chương {c.chapter.chapter_number}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-gray-500 font-bold uppercase dark:text-gray-400 mt-0.5">
                                  {c.created_at ? new Date(c.created_at).toLocaleString('vi-VN') : 'Vừa xong'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => setReplyingTo({id: c.comment_id || c.id || '', name: c.user?.name || c.user?.username || 'Người dùng ẩn danh', chapterId: c.chapter_id})}
                                className="text-[10px] sm:text-xs font-bold uppercase bg-gray-200 dark:bg-zinc-700 hover:bg-manga-red hover:text-white dark:hover:bg-manga-red px-2 py-1 transition-colors border border-black dark:border-zinc-600 shadow-[2px_2px_0px_#000] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-none flex items-center justify-center"
                                title="Trả lời"
                              >
                                <MessageSquare className="w-4 h-4" />
                              </button>
                              {(() => {
                                const userStr = localStorage.getItem('mangaflow_user');
                                const currentUser = userStr ? JSON.parse(userStr) : null;
                                const isOwner = currentUser && (c.user_id === currentUser.id || c.user?.name === currentUser.name || c.user?.username === currentUser.username);
                                return isOwner ? (
                                  <button 
                                    onClick={() => confirmDeleteComment(c.chapter_id, c.comment_id || c.id || '')}
                                    className="text-[10px] sm:text-xs font-bold uppercase text-manga-red hover:text-white bg-white hover:bg-manga-red px-2 py-1 transition-colors border border-black dark:border-zinc-600 dark:bg-zinc-800 dark:hover:bg-manga-red shadow-[2px_2px_0px_#000] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-none flex items-center justify-center"
                                    title="Xóa"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                ) : null;
                              })()}
                            </div>
                          </div>
                          <p className="text-sm text-zinc-800 dark:text-gray-200 leading-relaxed mt-2">
                            {c.content}
                          </p>
                        </div>
                        {c.replies && c.replies.length > 0 && (
                          <div className="mt-2">
                            {c.replies.map((reply: any) => renderComment(reply, depth + 1))}
                          </div>
                        )}
                      </div>
                    );
                    return renderComment(comment, 0);
                  })
                ) : (
                  <div className="bg-white border-[3px] border-black p-6 font-bold text-gray-500 text-center dark:bg-zinc-800 dark:border-black dark:text-gray-400">
                    Chưa có bình luận nào.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: About Series & Support */}
          <div className="lg:w-1/3 space-y-6">
            
            {/* Box 1: Về Series Này */}
            <div className="bg-white border-[4px] border-black p-6 dark:bg-zinc-800 dark:border-black">
              <h3 className="font-manga text-2xl font-bold uppercase mb-4 dark:text-white">Về Series Này</h3>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {series.genres.map(g => (
                  <span key={g} className="px-2 py-1 border-[2px] border-black text-xs font-bold uppercase bg-gray-50 dark:bg-zinc-700 dark:text-white dark:border-black">
                    {g}
                  </span>
                ))}
              </div>

              <div className="border-t-[2px] border-dashed border-gray-300 mb-4 dark:border-zinc-600"></div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 text-xs font-bold uppercase mb-1 dark:text-gray-400">Tác giả</p>
                  <p className="font-bold text-black dark:text-white">{series.authorName || 'Chưa cập nhật'}</p>
                </div>
                {(series.editorName || series.teamMembers?.some(m => ['editor', 'tantou_editor', 'tantou'].includes(m.roleInSeries))) && (
                  <div>
                    <p className="text-gray-500 text-xs font-bold uppercase mb-1 dark:text-gray-400">Biên tập viên</p>
                    <p className="font-bold text-black dark:text-white">{series.editorName || series.teamMembers?.find(m => ['editor', 'tantou_editor', 'tantou'].includes(m.roleInSeries))?.name || 'Chưa cập nhật'}</p>
                  </div>
                )}
                <div className="col-span-2">
                  <p className="text-gray-500 text-xs font-bold uppercase mb-1 dark:text-gray-400">Phát hành</p>
                  <p className="font-bold text-black dark:text-white">Thứ 3 hàng tuần</p>
                </div>
              </div>
            </div>

            {/* Box 2: Ủng hộ tác giả */}
            <div className="bg-manga-ink border-[4px] border-black p-8 text-center text-white dark:bg-zinc-950 dark:border-black">
              <Award className="w-12 h-12 text-manga-red mx-auto mb-4" />
              <h3 className="font-manga text-3xl font-bold uppercase mb-2">Ủng Hộ Tác Giả</h3>
              <p className="text-sm font-bold text-gray-400 mb-6 px-4">
                Mở khóa chương sớm và đọc không quảng cáo với gói Premium.
              </p>
              <button className="w-full bg-manga-red text-white font-bold uppercase py-3 border-[2px] border-manga-red hover:bg-white hover:text-manga-red transition-colors tracking-widest">
                Đăng Ký Ngay
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* User Profile Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto" onClick={() => setSelectedUser(null)}>
          <div 
            className="bg-[#F5F5F5] border-4 border-manga-ink shadow-[8px_8px_0px_rgba(0,0,0,1)] max-w-5xl w-full mx-auto my-8 relative dark:bg-zinc-900 dark:border-black font-sans"
            style={{ backgroundImage: 'radial-gradient(#d1d5db 2px, transparent 2px)', backgroundSize: '32px 32px' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Close button */}
            <button 
              onClick={() => setSelectedUser(null)}
              className="absolute -top-4 -right-4 w-10 h-10 bg-manga-red text-white border-2 border-black flex items-center justify-center font-bold text-xl hover:bg-black hover:text-manga-red transition-colors z-20 shadow-[4px_4px_0px_rgba(0,0,0,1)]"
            >
              X
            </button>

            <div className="p-8 h-full max-h-[85vh] overflow-y-auto relative z-10">
               {/* Header */}
               <div className="mb-8 flex justify-between items-end border-b-4 border-manga-ink pb-4 dark:border-zinc-700">
                 <div>
                   <h1 className="font-manga text-4xl md:text-5xl font-bold uppercase text-manga-ink leading-none dark:text-white">
                     HỒ SƠ CÁ NHÂN
                   </h1>
                   <div className="h-1.5 w-24 bg-manga-red mt-3 mb-2" />
                 </div>
               </div>

               {/* Grid Layout inside modal */}
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column: Avatar & Basic Info */}
                  <div className="lg:col-span-1">
                     <div className="bg-white border-4 border-manga-ink p-6 relative dark:bg-zinc-800 dark:border-black">
                        <div className="absolute top-0 right-0 bg-manga-red text-white text-xs font-bold uppercase px-3 py-1 border-b-4 border-l-4 border-manga-ink dark:border-black">
                          {selectedUser.roleInSeries === 'mangaka' || selectedUser.roleInSeries === 'owner' ? 'Mangaka' : 'Biên tập viên'}
                        </div>
                        <div className="w-32 h-32 mx-auto rounded-full border-4 border-manga-ink overflow-hidden mb-6 mt-4 dark:border-manga-red">
                          {selectedUser.avatarUrl ? (
                            <img src={selectedUser.avatarUrl} alt={selectedUser.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-4xl font-bold text-gray-400">
                              {selectedUser.name?.charAt(0)}
                            </div>
                          )}
                        </div>
                        <h2 className="text-2xl font-bold text-center mb-1 dark:text-white">{selectedUser.name}</h2>
                        <p className="text-gray-500 text-center text-sm font-bold uppercase tracking-wider mb-6 dark:text-gray-400">@{selectedUser.username || selectedUser.name?.toLowerCase().replace(/\s/g, '')}</p>
                        
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 font-bold border-b-2 border-dashed border-gray-300 pb-2 dark:border-zinc-700">
                            <Mail className="w-4 h-4 text-manga-red" />
                            <span>{selectedUser.email || 'Ẩn danh'}</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 font-bold border-b-2 border-dashed border-gray-300 pb-2 dark:border-zinc-700">
                            <Briefcase className="w-4 h-4 text-manga-red" />
                            <span>Gia nhập: {new Date().getFullYear()}</span>
                          </div>
                        </div>

                        <button className="w-full mt-6 bg-manga-ink text-white font-bold uppercase py-3 border-[2px] border-black hover:bg-manga-red transition-colors dark:bg-white dark:text-black dark:border-white dark:hover:bg-manga-red dark:hover:text-white dark:hover:border-manga-red">
                          Nhắn tin
                        </button>
                     </div>
                  </div>

                  {/* Right Column: Stats & Content */}
                  <div className="lg:col-span-2 space-y-8">
                      {/* Stats Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white border-[3px] border-black p-4 text-center dark:bg-zinc-800 dark:border-black hover:-translate-y-1 hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all">
                          <BookOpen className="w-6 h-6 text-manga-red mx-auto mb-2" />
                          <p className="text-xs text-gray-500 font-bold uppercase mb-1">Tác phẩm</p>
                          <p className="text-xl font-manga font-bold dark:text-white">{authorWorks.length}</p>
                        </div>
                        <div className="bg-white border-[3px] border-black p-4 text-center dark:bg-zinc-800 dark:border-black hover:-translate-y-1 hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all">
                          <Award className="w-6 h-6 text-manga-red mx-auto mb-2" />
                          <p className="text-xs text-gray-500 font-bold uppercase mb-1">Cấp độ</p>
                          <p className="text-xl font-manga font-bold dark:text-white">
                            Lv.{calculateMangakaLevel(
                              authorWorks.reduce((acc, w) => acc + (w.viewCount || 0), 0), 
                              authorWorks.reduce((acc, w) => acc + (w.totalLikes || w.likeCount || 0), 0), 
                              authorWorks.length
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Bio */}
                      <div className="bg-white border-[3px] border-black p-6 dark:bg-zinc-800 dark:border-black">
                        <h3 className="font-manga text-xl font-bold uppercase mb-3 dark:text-white flex items-center gap-2">
                          <User className="w-5 h-5 text-manga-red" /> Giới thiệu
                        </h3>
                        <p className="text-sm font-bold text-gray-700 leading-relaxed dark:text-gray-300">
                          {selectedUser.bio || 'Người dùng này chưa có dòng giới thiệu nào. Nhưng chắc chắn họ là một người đam mê manga!'}
                        </p>
                      </div>

                      {/* Tác phẩm nổi bật */}
                      <div className="bg-white border-[3px] border-black p-6 dark:bg-zinc-800 dark:border-black">
                        <h3 className="font-manga text-xl font-bold uppercase mb-4 dark:text-white flex items-center gap-2">
                          <BookOpen className="w-5 h-5 text-manga-red" /> Tác phẩm nổi bật
                        </h3>
                        <div className="flex gap-4 overflow-x-auto pb-4 snap-x relative" style={{ scrollbarWidth: 'thin', scrollbarColor: '#E53935 transparent' }}>
                          {[series, ...authorWorks.filter(w => w.id !== series.id)].map((work, index) => (
                            <Link 
                              key={work.id || index}
                              to={`/series/${work.id}`}
                              onClick={() => setSelectedUser(null)}
                              className="min-w-[120px] max-w-[120px] snap-start group cursor-pointer shrink-0"
                            >
                              <div className="w-full aspect-[3/4] border-[3px] border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_#000] overflow-hidden mb-3 relative group-hover:-translate-y-1 group-hover:-translate-x-1 transition-all">
                                <img src={work.coverImageUrl || series.coverImageUrl || ''} alt="cover" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                {index === 0 && (
                                  <div className="absolute top-0 right-0 bg-manga-red text-white text-[9px] font-bold uppercase px-1.5 py-0.5 border-b-2 border-l-2 border-black">
                                    Nổi bật
                                  </div>
                                )}
                              </div>
                              <p className="text-xs font-bold text-black dark:text-white truncate text-center group-hover:text-manga-red transition-colors">{work.title}</p>
                            </Link>
                          ))}
                        </div>
                      </div>

                      {/* Hoạt động gần đây */}
                      <div className="bg-white border-[3px] border-black p-6 dark:bg-zinc-800 dark:border-black">
                        <h3 className="font-manga text-xl font-bold uppercase mb-4 dark:text-white flex items-center gap-2">
                          <Heart className="w-5 h-5 text-manga-red" /> Hoạt động gần đây
                        </h3>
                        <div className="space-y-4">
                          {topActivities.length > 0 ? topActivities.map((act, index) => (
                            <div key={act.id} className={`flex items-start gap-4 border-l-4 ${index === 0 ? 'border-manga-red' : 'border-gray-300 dark:border-zinc-600'} pl-4 py-1`}>
                              <div className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-manga-red' : 'bg-gray-300 dark:bg-zinc-600'} mt-1.5 -ml-[23px]`}></div>
                              <div>
                                <p className={`font-bold text-sm ${index === 0 ? 'text-gray-800 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>{act.title}</p>
                                <span className="text-xs text-gray-500 font-bold uppercase dark:text-gray-400">{getTimeAgo(act.dateStr)}</span>
                              </div>
                            </div>
                          )) : (
                            <div className="text-sm font-bold text-gray-500 italic">Chưa có hoạt động nào gần đây.</div>
                          )}
                        </div>
                      </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {commentToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-zinc-800 border-4 border-black p-6 shadow-[8px_8px_0px_#000] w-full max-w-sm">
            <h3 className="text-xl font-manga font-bold uppercase mb-4 text-zinc-900 dark:text-white">Xóa bình luận</h3>
            <p className="text-sm font-bold text-gray-600 dark:text-gray-300 mb-6">Bạn có chắc chắn muốn xóa bình luận này không? Hành động này không thể hoàn tác.</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setCommentToDelete(null)}
                className="px-4 py-2 bg-gray-200 dark:bg-zinc-700 text-black dark:text-white font-bold uppercase text-xs border-2 border-black hover:bg-gray-300 shadow-[2px_2px_0px_#000] transition-transform hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-none"
              >
                Hủy
              </button>
              <button 
                onClick={executeDeleteComment}
                className="px-4 py-2 bg-manga-red text-white font-bold uppercase text-xs border-2 border-black shadow-[2px_2px_0px_#000] transition-transform hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-none"
              >
                Đồng ý xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
