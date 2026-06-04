
import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowRight, CheckCircle2, Edit2, ListOrdered, Clock, BookOpen } from "lucide-react";
import { mangakaStore, Chapter } from "@/data/mangakaMockData";

export function ManuscriptManager() {
  const [chapters, setChapters] = useState<Chapter[]>([]);

  useEffect(() => {
    // Fetch chapters for the main series (ser_001)
    const list = mangakaStore.getChapters("ser_001");
    // Sort by chapter number descending, take last 3
    const sorted = [...list].sort((a, b) => b.chapterNumber - a.chapterNumber).slice(0, 3);
    setChapters(sorted.reverse()); // reverse to keep chronological in rendering
  }, []);

  const getStatusDetails = (status: Chapter["status"]) => {
    switch (status) {
      case "Completed":
        return { label: "Hoàn thiện", icon: CheckCircle2, color: "text-manga-red", badgeStyle: "text-manga-red border-manga-ink font-bold" };
      case "Waiting Review":
        return { label: "Chờ duyệt", icon: Clock, color: "text-blue-600", badgeStyle: "bg-blue-50 text-blue-600 border-blue-300" };
      case "Drawing":
        return { label: "Đang vẽ", icon: Edit2, color: "text-manga-ink", badgeStyle: "bg-white border-2 border-manga-ink" };
      case "Sketching":
        return { label: "Phác thảo", icon: ListOrdered, color: "text-gray-500", badgeStyle: "bg-gray-100 text-gray-500 border-gray-300" };
      default:
        return { label: "Phác thảo", icon: ListOrdered, color: "text-gray-400", badgeStyle: "bg-gray-50 text-gray-400 border-gray-200" };
    }
  };

  // Mock static preview images for pages to maintain manga style
  const coverImages = [
    "https://images.unsplash.com/photo-1601850494422-3cf14624b0b3?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop"
  ];

  return (
    <div className="bg-white manga-border manga-shadow-sm flex flex-col mb-8">
      {/* Header */}
      <div className="bg-manga-ink text-white p-4 flex justify-between items-center">
        <h2 className="font-manga text-2xl font-bold uppercase tracking-wider">
          Quản lý bản thảo
        </h2>
        <Link 
          to="/dashboard/mangaka/series" 
          className="text-manga-red text-sm font-bold uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1"
        >
          Xem tất cả <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Grid Content */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {chapters.length === 0 ? (
          <div className="col-span-3 text-center py-8 text-gray-400 font-bold">
            Chưa có bản thảo chương nào.
          </div>
        ) : (
          chapters.map((chapter, idx) => {
            const { label: statusLabel, icon: StatusIcon, color: iconColor, badgeStyle } = getStatusDetails(chapter.status);
            const coverImg = coverImages[idx % coverImages.length];

            return (
              <div key={chapter.id} className="flex flex-col group">
                <div className="flex justify-between items-center mb-3">
                  <span className="bg-manga-ink text-white px-3 py-1 font-manga font-bold text-sm">
                    CH.{chapter.chapterNumber}
                  </span>
                  <StatusIcon className={`w-5 h-5 ${iconColor}`} />
                </div>
                
                {/* Visual Preview */}
                <div className="aspect-[4/3] bg-gray-200 border-2 border-manga-ink mb-4 relative overflow-hidden group-hover:manga-shadow-sm transition-shadow">
                  {chapter.status === "Completed" || chapter.status === "Drawing" ? (
                    <img 
                      src={coverImg} 
                      alt={`Chương ${chapter.chapterNumber}`} 
                      className="w-full h-full object-cover grayscale contrast-125" 
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300">
                      <BookOpen className="w-8 h-8 text-gray-300 mb-1" />
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Bản phác thảo</span>
                    </div>
                  )}
                </div>

                <h3 className="font-bold text-xl mb-3 truncate" title={chapter.title}>
                  {chapter.title}
                </h3>
                
                <div className="border-t-2 border-dashed border-manga-ink pt-3 flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Trạng thái</span>
                  <span className={`px-2 py-0.5 border font-bold text-sm uppercase ${badgeStyle}`}>
                    {statusLabel}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
