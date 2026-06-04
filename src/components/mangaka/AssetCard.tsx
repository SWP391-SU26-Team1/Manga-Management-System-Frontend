
import React from "react";
import { Folder, Send, FileText, Calendar, User, X } from "lucide-react";
import { AssetItem } from "@/data/mangakaMockData";

interface AssetCardProps {
  asset: AssetItem;
  seriesTitle: string;
  onSendToAssistant?: (assetId: string) => void;
}

export function AssetCard({ asset, seriesTitle, onSendToAssistant }: AssetCardProps) {
  const assetTypes: Record<AssetItem["type"], { label: string; bg: string; text: string }> = {
    Character: { label: "Character Art", bg: "bg-red-50", text: "text-manga-red" },
    Background: { label: "Background", bg: "bg-blue-50", text: "text-blue-600" },
    Props: { label: "Props & Items", bg: "bg-green-50", text: "text-green-600" },
    SFX: { label: "SFX Speedline", bg: "bg-purple-50", text: "text-purple-600" },
    Tone: { label: "Screentone", bg: "bg-orange-50", text: "text-orange-600" },
    "Style Guide": { label: "Style Guide", bg: "bg-gray-100", text: "text-gray-700" },
  };

  const currentType = assetTypes[asset.type] || { label: asset.type, bg: "bg-gray-50", text: "text-manga-ink" };

  const [showViewModal, setShowViewModal] = React.useState(false);
  const [showSendModal, setShowSendModal] = React.useState(false);

  const handleSend = () => {
    if (onSendToAssistant) {
      onSendToAssistant(asset.id);
    } else {
      setShowSendModal(true);
    }
  };

  const handleConfirmSend = () => {
    alert(`Đã gửi tư liệu "${asset.name}" cho tất cả trợ lý của bộ truyện "${seriesTitle}"!`);
    setShowSendModal(false);
  }

  return (
    <div className="bg-white border-2 border-manga-ink manga-shadow-sm flex flex-col justify-between hover:translate-y-[-2px] transition-transform duration-200">
      <div>
        {/* Preview image */}
        <div className="aspect-[4/3] w-full border-b-2 border-manga-ink bg-gray-100 relative overflow-hidden flex items-center justify-center">
          {asset.fileUrl ? (
            <img
              src={asset.fileUrl}
              alt={asset.name}
              className="w-full h-full object-cover grayscale contrast-125"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-4">
              <Folder className="w-12 h-12 text-gray-300" />
              <span className="text-xs font-bold text-gray-400 mt-2 uppercase">File tư liệu</span>
            </div>
          )}
          <span className={`absolute top-2 right-2 border-2 border-manga-ink px-2 py-0.5 text-[9px] font-bold uppercase ${currentType.bg} ${currentType.text}`}>
            {currentType.label}
          </span>
        </div>

        {/* Content Body */}
        <div className="p-4">
          <h4 className="font-manga text-xl font-bold uppercase text-manga-ink leading-tight mb-2 truncate" title={asset.name}>
            {asset.name}
          </h4>
          <p className="text-xs text-gray-500 font-bold mb-3 truncate">
            Series: <span className="text-manga-ink">{seriesTitle}</span>
          </p>
          <p className="text-xs text-gray-600 line-clamp-2 min-h-[2rem] leading-relaxed mb-4">
            {asset.note || "Không có ghi chú thêm cho tư liệu này."}
          </p>

          {/* Upload info details */}
          <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between text-[10px] text-gray-400 font-bold">
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" /> By: {asset.uploadedBy}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {asset.uploadedAt}
            </span>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="border-t-2 border-manga-ink p-3 bg-gray-50 flex gap-2">
        <button 
          onClick={() => setShowViewModal(true)}
          className="flex-1 flex items-center justify-center gap-1 bg-white hover:bg-gray-100 text-manga-ink font-bold text-xs uppercase py-2 border border-manga-ink transition-colors"
        >
          <FileText className="w-3.5 h-3.5" />
          Chi tiết
        </button>
        <button
          onClick={handleSend}
          className="flex-1 flex items-center justify-center gap-1 bg-manga-ink text-white hover:bg-gray-800 font-bold text-xs uppercase py-2 border border-manga-ink transition-colors"
        >
          <Send className="w-3 h-3" />
          Gửi trợ lý
        </button>
      </div>

      {/* View Modal */}
      {showViewModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-manga-ink manga-shadow max-w-2xl w-full flex flex-col">
            <div className="p-4 border-b-4 border-manga-ink bg-gray-50 flex justify-between items-center">
              <h2 className="font-manga font-bold text-xl uppercase flex items-center gap-2">
                <FileText className="w-6 h-6 text-manga-red" /> Chi tiết Tư liệu
              </h2>
              <button onClick={() => setShowViewModal(false)} className="hover:text-red-500">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="aspect-[3/4] border-2 border-manga-ink bg-gray-100 flex items-center justify-center">
                 {asset.fileUrl ? (
                    <img src={asset.fileUrl} alt={asset.name} className="w-full h-full object-contain" />
                  ) : (
                    <Folder className="w-16 h-16 text-gray-300" />
                  )}
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-manga text-2xl font-bold uppercase">{asset.name}</h3>
                  <span className={`inline-block mt-1 border-2 border-manga-ink px-2 py-0.5 text-xs font-bold uppercase ${currentType.bg} ${currentType.text}`}>
                    {currentType.label}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Ghi chú</p>
                  <p className="text-sm font-semibold p-2 bg-gray-50 border border-gray-200 mt-1 whitespace-pre-wrap">
                    {asset.note || "Không có ghi chú"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Thông tin tải lên</p>
                  <ul className="text-sm font-semibold mt-1 space-y-1">
                    <li><span className="text-gray-400">Bởi:</span> {asset.uploadedBy}</li>
                    <li><span className="text-gray-400">Ngày:</span> {asset.uploadedAt}</li>
                    <li><span className="text-gray-400">ID:</span> {asset.id}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Send Modal */}
      {showSendModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-manga-ink manga-shadow max-w-sm w-full flex flex-col">
            <div className="p-4 border-b-4 border-manga-ink bg-gray-50 flex justify-between items-center">
              <h2 className="font-manga font-bold text-xl uppercase flex items-center gap-2">
                <Send className="w-6 h-6 text-manga-red" /> Gửi Trợ Lý
              </h2>
              <button onClick={() => setShowSendModal(false)} className="hover:text-red-500">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-sm font-bold text-center mb-6">
                Bạn có chắc chắn muốn gửi tư liệu <span className="text-manga-red uppercase">"{asset.name}"</span> cho tất cả trợ lý của bộ truyện <span className="text-manga-ink uppercase">"{seriesTitle}"</span> không?
              </p>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowSendModal(false)}
                  className="flex-1 py-2 font-bold uppercase text-sm border-2 border-manga-ink hover:bg-gray-100"
                >
                  Hủy
                </button>
                <button 
                  onClick={handleConfirmSend}
                  className="flex-1 py-2 font-bold uppercase text-sm border-2 border-manga-ink bg-manga-red text-white hover:bg-red-700"
                >
                  Xác nhận gửi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
