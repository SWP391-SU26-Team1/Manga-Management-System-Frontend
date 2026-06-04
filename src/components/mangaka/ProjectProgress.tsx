
import React, { useEffect, useState } from "react";
import { Edit3, X, Save } from "lucide-react";
import { mangakaStore } from "@/data/mangakaMockData";

interface ProjectProgressProps {
  seriesTitle?: string;
  chapterTitle?: string;
  deadline?: string;
  progressPercent?: number;
}

export function ProjectProgress({
  seriesTitle: propSeriesTitle,
  chapterTitle: propChapterTitle,
  deadline: propDeadline,
  progressPercent: propProgressPercent,
}: ProjectProgressProps) {
  const [data, setData] = useState({
    seriesTitle: "Ánh sáng nơi chân trời",
    chapterTitle: "Hoàn thiện Chương 45",
    deadline: "27/05/2026",
    progressPercent: 75,
    seriesId: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(data);

  useEffect(() => {
    // If props are passed, use them
    if (propSeriesTitle || propChapterTitle || propDeadline || propProgressPercent !== undefined) {
      setData({
        seriesTitle: propSeriesTitle || "Ánh sáng nơi chân trời",
        chapterTitle: propChapterTitle || "Hoàn thiện Chương 45",
        deadline: propDeadline || "27/05/2026",
        progressPercent: propProgressPercent !== undefined ? propProgressPercent : 75,
        seriesId: "",
      });
      return;
    }

    // Otherwise, load dynamically from store
    const activeSeries = mangakaStore.getSeries().find(s => s.id === "ser_001") || mangakaStore.getSeries()[0];
    if (activeSeries) {
      const chapters = mangakaStore.getChapters(activeSeries.id);
      const activeChapter = chapters.find(c => c.status !== "Completed") || chapters[chapters.length - 1];
      
      if (activeChapter) {
        // Calculate progress percentage based on page overall statuses
        const pages = mangakaStore.getPages(activeChapter.id);
        const approvedPages = pages.filter(p => p.overallStatus === "Approved").length;
        const total = pages.length || 1;
        const percent = Math.round((approvedPages / total) * 100);
        
        setData({
          seriesTitle: activeSeries.title,
          chapterTitle: `Hoàn thiện Chương ${activeChapter.chapterNumber}: ${activeChapter.title}`,
          deadline: activeChapter.deadline.split("-").reverse().join("/"),
          progressPercent: percent || 15, // fallback minimal
          seriesId: activeSeries.id,
        });
      }
    }
  }, [propSeriesTitle, propChapterTitle, propDeadline, propProgressPercent]);

  const handleEditOpen = () => {
    setEditForm(data);
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setData(editForm);
    if (editForm.seriesId) {
      mangakaStore.updateSeriesProgress(editForm.seriesId, { title: editForm.seriesTitle });
      // We would also update chapter deadline, but keep it simple for mock
    }
    setIsEditing(false);
  };

  return (
    <div className="bg-white manga-border manga-shadow-sm flex flex-col mb-8">
      {/* Header */}
      <div className="bg-manga-ink text-white p-4 flex justify-between items-center">
        <h2 className="font-manga text-2xl font-bold uppercase tracking-wider">
          Tiến độ dự án hiện tại
        </h2>
        <button onClick={handleEditOpen} className="text-manga-red hover:text-white transition-colors" title="Chỉnh sửa tiến độ">
          <Edit3 className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex justify-between items-end border-b-2 border-manga-ink pb-4 mb-6">
          <div>
            <p className="text-sm font-bold uppercase text-gray-500 tracking-widest mb-1">Series</p>
            <h3 className="font-manga text-3xl font-bold uppercase text-manga-red">
              {data.seriesTitle}
            </h3>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold uppercase text-gray-500 tracking-widest mb-1">
              Deadline nộp bản thảo
            </p>
            <p className="font-manga text-2xl font-bold">{data.deadline}</p>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-xl">{data.chapterTitle}</span>
            <span className="font-manga text-3xl font-bold text-manga-red">{data.progressPercent}%</span>
          </div>
          <div className="h-6 w-full bg-gray-100 border-2 border-manga-ink flex">
            <div 
              className="h-full bg-manga-red border-r-2 border-manga-ink transition-all duration-500" 
              style={{ width: `${data.progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {isEditing && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-manga-ink manga-shadow max-w-md w-full">
            <div className="p-4 border-b-4 border-manga-ink bg-gray-50 flex justify-between items-center">
              <h2 className="font-manga font-bold text-xl uppercase flex items-center gap-2">
                <Edit3 className="w-6 h-6 text-manga-red" /> Sửa Tiến Độ
              </h2>
              <button onClick={() => setIsEditing(false)} className="hover:text-red-500"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Tên Series</label>
                <input 
                  type="text" 
                  value={editForm.seriesTitle} 
                  onChange={e => setEditForm({...editForm, seriesTitle: e.target.value})}
                  className="w-full border-2 border-manga-ink p-2 font-bold focus:ring-2 focus:ring-manga-red"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Deadline</label>
                <input 
                  type="text" 
                  value={editForm.deadline} 
                  onChange={e => setEditForm({...editForm, deadline: e.target.value})}
                  className="w-full border-2 border-manga-ink p-2 font-bold focus:ring-2 focus:ring-manga-red"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Mức tiến độ (Tùy chỉnh thủ công)</label>
                <input 
                  type="range" 
                  min="0" max="100"
                  value={editForm.progressPercent} 
                  onChange={e => setEditForm({...editForm, progressPercent: parseInt(e.target.value)})}
                  className="w-full accent-manga-red"
                />
                <div className="text-right text-xs font-bold text-manga-red mt-1">{editForm.progressPercent}%</div>
              </div>
              <button type="submit" className="w-full bg-manga-ink text-white font-manga font-bold py-3 border-2 border-manga-ink uppercase hover:bg-gray-800 mt-4 flex justify-center items-center gap-2">
                <Save className="w-4 h-4" /> Lưu thay đổi
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
