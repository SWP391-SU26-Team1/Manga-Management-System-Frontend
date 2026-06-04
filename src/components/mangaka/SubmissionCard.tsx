
import React, { useState } from "react";
import { Check, AlertTriangle, Clock, CornerDownRight } from "lucide-react";
import { AssistantSubmission } from "@/data/mangakaMockData";

interface SubmissionCardProps {
  submission: AssistantSubmission;
  onApprove: (id: string) => void;
  onRequestChanges: (id: string, reason: string) => void;
}

export function SubmissionCard({ submission, onApprove, onRequestChanges }: SubmissionCardProps) {
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedback, setFeedback] = useState("");

  const handleApprove = () => {
    if (confirm(`Bạn có đồng ý phê duyệt lớp vẽ "${submission.layerType}" của trợ lý ${submission.assistantName}?`)) {
      onApprove(submission.id);
    }
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) {
      alert("Vui lòng nhập lý do chỉnh sửa!");
      return;
    }
    onRequestChanges(submission.id, feedback.trim());
    setFeedback("");
    setShowFeedbackForm(false);
  };

  const getStatusColor = (status: AssistantSubmission["status"]) => {
    switch (status) {
      case "Approved":
        return "border-manga-red bg-red-50 text-manga-red";
      case "Need Fix":
        return "border-red-600 bg-red-50 text-red-600";
      default:
        return "border-manga-ink bg-yellow-50 text-manga-ink";
    }
  };

  return (
    <div className={`bg-white border-4 border-manga-ink manga-shadow-sm flex flex-col md:flex-row gap-6 p-6 transition-all duration-200 ${submission.status === 'Pending' ? 'hover:manga-shadow' : 'opacity-85'}`}>
      
      {/* File Preview */}
      <div className="w-full md:w-64 aspect-[4/3] md:aspect-[3/4] border-2 border-manga-ink bg-gray-100 flex-shrink-0 relative overflow-hidden group">
        {submission.previewUrl ? (
          <img
            src={submission.previewUrl}
            alt={`Preview ${submission.fileName}`}
            className="w-full h-full object-cover grayscale contrast-125 group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
            <AlertTriangle className="w-8 h-8 text-gray-400 mb-1" />
            <span className="text-xs font-bold text-gray-500 uppercase">Không có ảnh xem trước</span>
          </div>
        )}
        <div className="absolute bottom-0 inset-x-0 bg-manga-ink/90 text-white p-2 text-xs truncate font-mono">
          {submission.fileName}
        </div>
      </div>

      {/* Info Details */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Header row */}
          <div className="flex justify-between items-start gap-4 flex-wrap mb-3">
            <div>
              <span className={`inline-block border-2 font-manga font-bold text-[10px] uppercase px-2 py-0.5 tracking-wider ${getStatusColor(submission.status)}`}>
                {submission.status === "Approved" ? "ĐÃ DUYỆT" :
                 submission.status === "Need Fix" ? "CẦN CHỈNH SỬA" : "CHỜ PHÊ DUYỆT"}
              </span>
              <h3 className="font-manga text-2xl font-bold uppercase text-manga-ink mt-1.5 leading-none">
                {submission.assistantName}
              </h3>
            </div>
            <div className="text-right text-xs font-bold text-gray-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span>Nộp lúc: {new Date(submission.submittedAt).toLocaleDateString("vi-VN")}</span>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-4 text-xs font-bold text-gray-500 border-y-2 border-dashed border-gray-200 py-3 mb-4">
            <div>
              Tác phẩm / Chương:
              <p className="text-sm text-manga-ink mt-0.5">{submission.chapterTitle}</p>
            </div>
            <div>
              Trang & Lớp vẽ:
              <p className="text-sm text-manga-ink mt-0.5">
                Trang {submission.pageNumber} - <span className="text-manga-red uppercase">{submission.layerType}</span>
              </p>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-gray-50 border border-manga-ink p-3 text-xs mb-4">
            <span className="font-bold text-gray-500 block uppercase mb-1">Ghi chú của trợ lý:</span>
            <p className="text-manga-ink italic leading-relaxed">
              "{submission.note || "Không có ghi chú nào được đính kèm."}"
            </p>
          </div>
        </div>

        {/* Action Panel */}
        <div>
          {submission.status === "Pending" && !showFeedbackForm && (
            <div className="flex gap-2">
              <button
                onClick={handleApprove}
                className="flex-1 flex items-center justify-center gap-1.5 bg-manga-red text-white border-2 border-manga-ink font-bold text-sm uppercase py-2.5 manga-shadow-sm hover:translate-y-0.5 hover:shadow-none transition-all"
              >
                <Check className="w-4 h-4" />
                Duyệt bản thảo
              </button>
              <button
                onClick={() => setShowFeedbackForm(true)}
                className="flex-1 flex items-center justify-center gap-1.5 bg-white text-manga-ink border-2 border-manga-ink font-bold text-sm uppercase py-2.5 hover:bg-gray-50 transition-all"
              >
                <AlertTriangle className="w-4 h-4" />
                Yêu cầu sửa
              </button>
            </div>
          )}

          {/* Reject Input Form */}
          {showFeedbackForm && (
            <form onSubmit={handleRejectSubmit} className="bg-red-50 border-2 border-manga-red p-4">
              <label className="block font-bold text-xs uppercase text-manga-red mb-1 flex items-center gap-1">
                <CornerDownRight className="w-3.5 h-3.5" /> Góp ý chi tiết cho trợ lý sửa:
              </label>
              <textarea
                required
                rows={2}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Ví dụ: Vẽ nét thanh hơn, đổ bóng background tối lại một chút..."
                className="w-full border-2 border-manga-ink px-3 py-2 font-bold text-sm focus:outline-none focus:border-manga-red mb-3"
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowFeedbackForm(false)}
                  className="px-3 py-1.5 border border-manga-ink font-bold text-xs uppercase bg-white hover:bg-gray-100 text-manga-ink"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 border border-manga-ink font-bold text-xs uppercase bg-manga-red hover:bg-red-700 text-white"
                >
                  Gửi yêu cầu
                </button>
              </div>
            </form>
          )}

          {submission.status !== "Pending" && (
            <div className="text-xs font-bold text-gray-400 uppercase italic">
              Bản thảo này đã được xử lý xong.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
