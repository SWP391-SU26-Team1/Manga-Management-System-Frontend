
import React from "react";
import { Link } from "react-router";
import { BookOpen, Clock, Tag, PlusCircle, Eye } from "lucide-react";
import { Series } from "@/data/mangakaMockData";

interface SeriesCardProps {
  series: Series;
  chapterCount: number;
  onCreateChapter?: (seriesId: string) => void;
}

export function SeriesCard({ series, chapterCount, onCreateChapter }: SeriesCardProps) {
  const statusKey = (series.status || "").toLowerCase();
  
  const statusColors: Record<string, string> = {
    "draft": "bg-gray-100 text-gray-700 border-gray-400",
    "in_production": "bg-yellow-100 text-yellow-800 border-yellow-300",
    "under_review": "bg-blue-100 text-blue-800 border-blue-300",
    "pending_review": "bg-blue-100 text-blue-800 border-blue-300",
    "approved": "bg-green-100 text-green-800 border-green-300",
    "published": "bg-manga-red text-white border-manga-ink",
    // Fallbacks for mock data
    "in production": "bg-yellow-100 text-yellow-800 border-yellow-300",
    "waiting review": "bg-blue-100 text-blue-800 border-blue-300",
  };

  return (
    <div className="bg-white border-4 border-manga-ink manga-shadow p-5 flex flex-col justify-between hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-200">
      <div>
        {/* Badge & Meta */}
        <div className="flex justify-between items-center mb-3">
          <span
            className={`px-3 py-1 font-manga font-bold text-xs uppercase border-2 ${
              statusColors[statusKey] || "bg-white text-manga-ink border-manga-ink"
            }`}
          >
            {(statusKey === "in_production" || statusKey === "in production") ? "ĐANG VẼ" : 
             statusKey === "published" ? "ĐÃ XUẤT BẢN" :
             statusKey === "approved" ? "ĐÃ DUYỆT" :
             (statusKey === "under_review" || statusKey === "pending_review" || statusKey === "waiting review") ? "CHỜ DUYỆT" : "BẢN NHÁP"}
          </span>
          <div className="flex items-center gap-1 text-xs text-gray-500 font-bold">
            <Clock className="w-3.5 h-3.5 text-manga-ink" />
            <span>Hạn: {series.nextDeadline}</span>
          </div>
        </div>

        {/* Layout details */}
        <div className="flex gap-4">
          {/* Cover */}
          <div className="w-24 h-32 border-2 border-manga-ink overflow-hidden bg-gray-100 flex-shrink-0 relative">
            {series.coverUrl ? (
              <img
                src={series.coverUrl}
                alt={series.title}
                className="w-full h-full object-cover grayscale contrast-125"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center">
                <BookOpen className="w-8 h-8 text-gray-400 mb-1" />
                <span className="text-[9px] font-bold text-gray-400 uppercase leading-tight">Chưa có bìa</span>
              </div>
            )}
            <div className="absolute top-0 left-0 bg-manga-ink text-white font-manga font-bold text-xs px-1.5 py-0.5 border-r border-b border-manga-ink">
              {chapterCount} CH
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              <h3 className="font-manga text-2xl font-bold uppercase text-manga-ink leading-tight mb-2 break-all">
                {series.title}
              </h3>
              <p className="text-xs text-gray-600 line-clamp-2 mb-3 break-all">
                {series.description || "Chưa có mô tả chi tiết cho tác phẩm này."}
              </p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1">
              {series.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-0.5 bg-gray-100 text-manga-ink border border-manga-ink font-bold text-[9px] px-1.5 py-0.5 uppercase"
                >
                  <Tag className="w-2 h-2 text-manga-red" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="border-t-2 border-manga-ink pt-4 mt-4 flex gap-2">
        <Link
          to={`/dashboard/mangaka/series/${series.id}`}
          className="flex-1 flex items-center justify-center gap-1.5 bg-white text-manga-ink font-bold text-xs uppercase py-2 px-3 border-2 border-manga-ink hover:bg-gray-100 transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          Chi tiết
        </Link>
        {onCreateChapter ? (
          <button
            onClick={() => onCreateChapter(series.id)}
            className="flex-1 flex items-center justify-center gap-1.5 bg-manga-red text-white font-bold text-xs uppercase py-2 px-3 border-2 border-manga-ink manga-shadow-sm hover:translate-y-0.5 hover:shadow-none transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Tạo Chapter
          </button>
        ) : (
          <Link
            to={`/dashboard/mangaka/series/${series.id}/create-chapter`}
            className="flex-1 flex items-center justify-center gap-1.5 bg-manga-red text-white font-bold text-xs uppercase py-2 px-3 border-2 border-manga-ink manga-shadow-sm hover:translate-y-0.5 hover:shadow-none transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Tạo Chapter
          </Link>
        )}
      </div>
    </div>
  );
}
