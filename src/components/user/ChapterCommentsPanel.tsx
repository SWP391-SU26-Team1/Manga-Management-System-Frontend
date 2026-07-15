import React, { useState, useEffect } from 'react';
import { X, Send, User } from 'lucide-react';
import { readerService } from '@/services/reader.service';

interface Comment {
  id?: string;
  comment_id?: string;
  user_name?: string;
  content: string;
  created_at?: string;
  avatar_url?: string;
  user?: {
    name?: string;
    username?: string;
    avatar_url?: string;
  };
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  chapterId: string;
  chapterTitle?: string;
}

export default function ChapterCommentsPanel({ isOpen, onClose, chapterId, chapterTitle }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchComments = async () => {
    setLoading(true);
    const data = await readerService.getChapterComments(chapterId);
    setComments(data);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchComments();
    }
  }, [isOpen, chapterId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    const userStr = localStorage.getItem('mangaflow_user') || localStorage.getItem('user');
    if (!userStr) {
      alert('Vui lòng đăng nhập để bình luận!');
      return;
    }

    const success = await readerService.postChapterComment(chapterId, newComment);
    if (success) {
      setNewComment('');
      fetchComments();
    } else {
      alert('Đã có lỗi xảy ra, vui lòng thử lại sau.');
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[100] transition-opacity"
          onClick={onClose}
        ></div>
      )}

      {/* Slide-over Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white dark:bg-zinc-900 shadow-2xl z-[101] transform transition-transform duration-300 ease-in-out flex flex-col border-l-4 border-black dark:border-zinc-800 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-4 border-black dark:border-zinc-800 bg-[#f4f4f4] dark:bg-zinc-950">
          <div>
            <h2 className="font-manga text-xl font-bold uppercase dark:text-white">BÌNH LUẬN</h2>
            {chapterTitle && (
              <p className="text-xs font-bold text-gray-500 uppercase">{chapterTitle}</p>
            )}
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-full transition-colors border-2 border-transparent hover:border-black dark:hover:border-white dark:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-zinc-900">
          {loading ? (
            <div className="text-center py-10 font-bold text-gray-500 uppercase animate-pulse">
              Đang tải bình luận...
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-10 font-bold text-gray-400 uppercase">
              Chưa có bình luận nào.<br/>Hãy là người đầu tiên!
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id || comment.comment_id} className="bg-white dark:bg-zinc-800 border-2 border-black dark:border-zinc-700 p-3 shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#111]">
                <div className="flex items-center gap-2 mb-2">
                  {comment.user?.avatar_url ? (
                    <img src={comment.user.avatar_url} alt="Avatar" className="w-8 h-8 rounded-full border-2 border-manga-red object-cover" />
                  ) : (
                    <div className="w-8 h-8 bg-manga-red dark:bg-zinc-700 rounded-full flex items-center justify-center border-2 border-manga-red text-white font-bold text-xs">
                      {(comment.user?.name || comment.user?.username || 'U')[0]}
                    </div>
                  )}
                  <div>
                    <div className="font-bold text-sm dark:text-white">{comment.user?.name || comment.user?.username || 'Người dùng ẩn danh'}</div>
                    <div className="text-[10px] text-gray-500 uppercase font-bold">{comment.created_at ? new Date(comment.created_at).toLocaleString('vi-VN') : 'Vừa xong'}</div>
                  </div>
                </div>
                <p className="text-sm dark:text-gray-200 leading-relaxed">
                  {comment.content}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white dark:bg-zinc-950 border-t-4 border-black dark:border-zinc-800">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input 
              type="text" 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Nhập bình luận của bạn..."
              className="flex-1 bg-gray-100 dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 px-3 py-2 font-medium text-sm dark:text-white focus:outline-none focus:border-manga-red transition-colors"
            />
            <button 
              type="submit"
              disabled={!newComment.trim()}
              className="bg-manga-red text-white border-2 border-black px-4 py-2 font-bold uppercase hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
