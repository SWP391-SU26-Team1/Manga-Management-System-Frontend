import React, { useState, useEffect } from 'react';
import { X, Send, User } from 'lucide-react';
import { readerService } from '@/services/reader.service';
import { useToast } from '@/contexts/ToastContext';

interface Comment {
  id?: string;
  comment_id?: string;
  parent_comment_id?: string;
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

interface CommentNode extends Comment {
  replies: CommentNode[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  chapterId: string;
  chapterTitle?: string;
}

const CommentItem = ({ comment, depth = 0, onReply }: { comment: CommentNode, depth?: number, onReply: (id: string, name: string) => void }) => {
  return (
    <div className={`mt-2 ${depth > 0 ? 'ml-4 sm:ml-8 border-l-[3px] border-gray-300 dark:border-zinc-700 pl-3 sm:pl-4' : ''}`}>
      <div className="bg-white dark:bg-zinc-800 border-2 border-black dark:border-zinc-700 p-3 shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#111]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {comment.user?.avatar_url ? (
              <img src={comment.user.avatar_url} alt="Avatar" className="w-8 h-8 rounded-full border-2 border-manga-red object-cover" />
            ) : (
              <div className="w-8 h-8 bg-manga-red dark:bg-zinc-700 rounded-full flex items-center justify-center border-2 border-manga-red text-white font-bold text-xs uppercase">
                {(comment.user?.name || comment.user?.username || 'U')[0]}
              </div>
            )}
            <div>
              <div className="font-bold text-sm text-zinc-900 dark:text-white">{comment.user?.name || comment.user?.username || 'Người dùng ẩn danh'}</div>
              <div className="text-[10px] text-gray-500 uppercase font-bold">{comment.created_at ? new Date(comment.created_at).toLocaleString('vi-VN') : 'Vừa xong'}</div>
            </div>
          </div>
          <button 
            onClick={() => onReply(comment.comment_id || comment.id || '', comment.user?.name || comment.user?.username || 'Người dùng ẩn danh')}
            className="text-[10px] sm:text-xs font-bold uppercase bg-gray-200 dark:bg-zinc-700 hover:bg-manga-red hover:text-white dark:hover:bg-manga-red px-2 py-1 transition-colors border border-black dark:border-zinc-600 shadow-[2px_2px_0px_#000] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-none"
          >
            Trả lời
          </button>
        </div>
        <p className="text-sm text-zinc-800 dark:text-gray-200 leading-relaxed">
          {comment.content}
        </p>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2">
          {comment.replies.map(reply => (
            <CommentItem key={reply.id || reply.comment_id} comment={reply} depth={depth + 1} onReply={onReply} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function ChapterCommentsPanel({ isOpen, onClose, chapterId, chapterTitle }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState<{id: string, name: string} | null>(null);
  const { showToast } = useToast();

  const fetchComments = async () => {
    setLoading(true);
    const data = await readerService.getChapterComments(chapterId);
    setComments(data);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchComments();
      setReplyingTo(null);
    }
  }, [isOpen, chapterId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    const userStr = localStorage.getItem('mangaflow_user') || localStorage.getItem('user');
    if (!userStr) {
      showToast('Vui lòng đăng nhập để bình luận!', 'error');
      return;
    }

    const parentId = replyingTo?.id;
    const success = await readerService.postChapterComment(chapterId, newComment, parentId);
    if (success) {
      setNewComment('');
      setReplyingTo(null);
      fetchComments();
    } else {
      showToast('Đã có lỗi xảy ra, vui lòng thử lại sau.', 'error');
    }
  };

  const handleReply = (id: string, name: string) => {
    setReplyingTo({ id, name });
  };

  const buildCommentTree = (flatComments: Comment[]): CommentNode[] => {
    const map = new Map<string, CommentNode>();
    const roots: CommentNode[] = [];

    // First pass: create node objects
    flatComments.forEach(c => {
      map.set(c.comment_id || c.id || '', { ...c, replies: [] });
    });

    // Second pass: link parents and children
    flatComments.forEach(c => {
      const id = c.comment_id || c.id || '';
      const node = map.get(id)!;
      if (c.parent_comment_id) {
        const parent = map.get(c.parent_comment_id);
        if (parent) {
          parent.replies.push(node);
        } else {
          roots.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    return roots;
  };

  const commentTree = buildCommentTree(comments);

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
        className={`fixed top-0 right-0 h-full w-full sm:w-[450px] bg-white dark:bg-zinc-900 shadow-2xl z-[101] transform transition-transform duration-300 ease-in-out flex flex-col border-l-4 border-black dark:border-zinc-800 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
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
          ) : commentTree.length === 0 ? (
            <div className="text-center py-10 font-bold text-gray-400 uppercase">
              Chưa có bình luận nào.<br/>Hãy là người đầu tiên!
            </div>
          ) : (
            commentTree.map((comment) => (
              <CommentItem key={comment.id || comment.comment_id} comment={comment} onReply={handleReply} />
            ))
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white dark:bg-zinc-950 border-t-4 border-black dark:border-zinc-800 flex flex-col">
          {replyingTo && (
            <div className="mb-2 bg-gray-100 dark:bg-zinc-800 border-2 border-black dark:border-zinc-700 px-3 py-2 flex justify-between items-center text-xs font-bold shadow-[2px_2px_0px_#000]">
              <span className="dark:text-gray-300">Đang trả lời: <span className="text-manga-red">{replyingTo.name}</span></span>
              <button type="button" onClick={() => setReplyingTo(null)} className="hover:text-red-500 dark:text-gray-400 transition-colors">
                <X className="w-4 h-4"/>
              </button>
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input 
              type="text" 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Nhập bình luận của bạn..."
              className="flex-1 bg-gray-100 dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 px-3 py-2 font-medium text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-manga-red transition-colors"
            />
            <button 
              type="submit"
              disabled={!newComment.trim()}
              className="bg-manga-red text-white border-2 border-black px-4 py-2 font-bold uppercase hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 shadow-[2px_2px_0px_#000]"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
