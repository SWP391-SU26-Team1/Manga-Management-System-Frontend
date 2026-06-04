
import React, { useState } from "react";
import { MessageSquare, AlertCircle, CheckCircle, Send, CornerDownRight, ExternalLink } from "lucide-react";
import { EditorFeedback } from "@/data/mangakaMockData";
import { Link } from "react-router";

interface FeedbackCardProps {
  feedback: EditorFeedback;
  onResolve: (id: string) => void;
  onReply: (id: string, reply: string) => void;
}

export function FeedbackCard({ feedback, onResolve, onReply }: FeedbackCardProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");

  const severityStyles = {
    Low: { bg: "bg-slate-50", border: "border-slate-300", text: "text-slate-700", badge: "bg-slate-400 text-white border-2 border-manga-ink font-bold" },
    Medium: { bg: "bg-amber-50/50", border: "border-amber-300", text: "text-amber-700", badge: "bg-amber-500 text-white border-2 border-manga-ink font-bold" },
    High: { bg: "bg-orange-50/50", border: "border-orange-300", text: "text-orange-700", badge: "bg-orange-500 text-white border-2 border-manga-ink font-bold" },
    Critical: { bg: "bg-red-50/50", border: "border-red-300", text: "text-red-700", badge: "bg-manga-red text-white border-2 border-manga-ink font-bold" },
  };

  const style = severityStyles[feedback.severity] || severityStyles.Low;

  const handleResolve = () => {
    if (confirm("Bạn có chắc chắn đánh dấu ý kiến góp ý này đã được xử lý hoàn tất?")) {
      onResolve(feedback.id);
    }
  };

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    onReply(feedback.id, replyText.trim());
    setReplyText("");
    setShowReplyForm(false);
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className={`bg-white border-4 border-manga-ink manga-shadow-sm p-5 flex flex-col justify-between transition-all duration-200 ${feedback.status === 'Resolved' ? 'opacity-70 bg-gray-50' : 'hover:manga-shadow'}`}>
      <div>
        {/* Header row */}
        <div className="flex justify-between items-start gap-4 mb-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 border-2 text-[9px] font-bold uppercase tracking-wider ${style.badge}`}>
              {feedback.severity}
            </span>
            <span className="font-bold text-xs text-gray-500 uppercase tracking-widest">
              Từ: <span className="text-manga-ink">{feedback.sender}</span>
            </span>
          </div>

          <span className="text-[10px] text-gray-400 font-bold font-mono">
            {formatDate(feedback.createdAt)}
          </span>
        </div>

        {/* Content details */}
        <div className="border-b-2 border-dashed border-gray-100 pb-3 mb-3">
          <div className="text-xs font-bold text-gray-500 mb-1 uppercase">Đối tượng góp ý:</div>
          <div className="font-manga text-lg font-bold text-manga-ink">
            {feedback.seriesTitle}{" "}
            {feedback.chapterNumber && (
              <span className="bg-gray-100 border border-manga-ink px-1.5 py-0.2 text-xs font-bold font-sans">
                CH.{feedback.chapterNumber}
              </span>
            )}{" "}
            {feedback.pageNumber && (
              <span className="bg-manga-red text-white border border-manga-ink px-1.5 py-0.2 text-xs font-bold font-sans ml-1">
                Trang {feedback.pageNumber}
              </span>
            )}
          </div>
          {feedback.chapterNumber && feedback.pageNumber && (
            <Link 
              to={`/dashboard/mangaka/page-viewer/p_c_${feedback.seriesId}_${feedback.chapterNumber}_${feedback.pageNumber}`}
              className="mt-2 inline-flex items-center gap-1 text-[10px] uppercase font-bold text-manga-ink hover:text-manga-red hover:underline"
            >
              <ExternalLink className="w-3 h-3" /> Mở trang bản thảo
            </Link>
          )}
        </div>

        {/* Comment block */}
        <div className={`border-2 ${style.border} ${style.bg} p-4 rounded-none mb-4 text-sm font-bold text-manga-ink whitespace-pre-wrap leading-relaxed`}>
          {feedback.content}
        </div>
      </div>

      {/* Footer / Actions */}
      <div className="border-t-2 border-manga-ink pt-4 mt-2 flex flex-col gap-3">
        {feedback.status === "Open" ? (
          <div className="flex gap-2">
            <button
              onClick={handleResolve}
              className="flex-1 flex items-center justify-center gap-1.5 bg-manga-red text-white border-2 border-manga-ink font-bold text-xs uppercase py-2 hover:translate-y-0.5 hover:shadow-none transition-all manga-shadow-sm"
            >
              <CheckCircle className="w-4 h-4" />
              Đánh dấu Đã xử lý
            </button>
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="flex-1 flex items-center justify-center gap-1.5 bg-white text-manga-ink border-2 border-manga-ink font-bold text-xs uppercase py-2 hover:bg-gray-50 transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              Phản hồi
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-green-600 font-bold text-xs uppercase">
            <CheckCircle className="w-4 h-4" /> Đã hoàn thành xử lý góp ý
          </div>
        )}

        {/* Reply form */}
        {showReplyForm && (
          <form onSubmit={handleReplySubmit} className="mt-2 border-2 border-manga-ink p-3 bg-gray-50 flex flex-col gap-2">
            <div className="text-[10px] font-bold uppercase text-gray-500 flex items-center gap-1">
              <CornerDownRight className="w-3 h-3 text-manga-red" /> Trả lời editor:
            </div>
            <textarea
              required
              rows={2}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Nhập nội dung phản hồi (ví dụ: Em đã sửa lại nét mặt trang 3 và vẽ lại rồi ạ...)"
              className="w-full border-2 border-manga-ink p-2 text-xs font-bold focus:outline-none focus:border-manga-red"
            />
            <div className="flex justify-end gap-1.5">
              <button
                type="button"
                onClick={() => setShowReplyForm(false)}
                className="px-2.5 py-1 border border-manga-ink text-[10px] font-bold uppercase bg-white hover:bg-gray-100"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-3 py-1 border border-manga-ink text-[10px] font-bold uppercase bg-manga-ink text-white hover:bg-gray-800 flex items-center gap-1"
              >
                <Send className="w-3 h-3" /> Gửi phản hồi
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
