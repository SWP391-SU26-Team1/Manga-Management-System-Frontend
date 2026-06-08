import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { FileEdit, Clock, ArrowRight, Trash2 } from 'lucide-react';

export default function DraftsPage() {
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState<any[]>([]);

  useEffect(() => {
    const allDraftsStr = localStorage.getItem('mangaflow_all_drafts');
    if (allDraftsStr) {
      try {
        setDrafts(JSON.parse(allDraftsStr));
      } catch (e) {}
    }
  }, []);

  const handleDelete = (taskId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bản nháp này?')) {
      const updated = drafts.filter(d => d.taskId !== taskId);
      setDrafts(updated);
      localStorage.setItem('mangaflow_all_drafts', JSON.stringify(updated));
      localStorage.removeItem(`mangaflow_drawing_draft_${taskId.replace('#', '')}`);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString('vi-VN');
  };

  return (
    <div className="max-w-7xl mx-auto pb-16 font-sans text-gray-900">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 uppercase">
          BẢN NHÁP CỦA TÔI
        </h1>
        <p className="text-sm font-medium text-gray-500 mt-1">
          Quản lý các bản vẽ và annotation đang lưu nháp
        </p>
      </div>

      {drafts.length === 0 ? (
        <div className="bg-white border-2 border-black p-12 text-center shadow-sm">
          <FileEdit className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-bold">Bạn chưa có bản nháp nào.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drafts.map((draft, idx) => (
            <div key={idx} className="bg-white border-2 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col overflow-hidden hover:-translate-y-1 transition-transform">
              <div className="h-40 bg-zinc-800 border-b-2 border-black relative overflow-hidden flex items-center justify-center">
                {draft.bgImage ? (
                  <img src={draft.bgImage} alt="Draft Preview" className="w-full h-full object-cover opacity-70" />
                ) : (
                  <span className="text-zinc-600 font-bold">No Image</span>
                )}
                <div className="absolute top-2 left-2 bg-[#E63946] text-white text-[10px] font-black px-2 py-1 border border-black uppercase">
                  {draft.taskId}
                </div>
              </div>
              
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-extrabold text-lg uppercase leading-tight mb-1">{draft.series}</h3>
                <p className="text-xs font-bold text-gray-500 mb-3">{draft.chapter} - {draft.page}</p>
                
                <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-1">
                  <span className="font-bold border border-gray-300 px-1.5 py-0.5 rounded bg-gray-50">{draft.type}</span>
                </div>
                
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 mt-auto pt-4">
                  <Clock className="w-3.5 h-3.5" /> 
                  Cập nhật: {formatDate(draft.updatedAt)}
                </div>
              </div>

              <div className="border-t-2 border-black flex">
                <button 
                  onClick={() => handleDelete(draft.taskId)}
                  className="p-3 text-red-500 hover:bg-red-50 flex items-center justify-center border-r-2 border-black transition cursor-pointer"
                  title="Xóa nháp"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => navigate('/dashboard/assistant/drawing')}
                  className="flex-1 p-3 bg-manga-ink text-white font-bold text-xs uppercase flex items-center justify-center gap-2 hover:bg-gray-800 transition cursor-pointer"
                >
                  Tiếp tục vẽ <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
