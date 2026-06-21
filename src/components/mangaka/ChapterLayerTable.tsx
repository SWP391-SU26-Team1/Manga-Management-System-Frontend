
import React from "react";
import { Link } from "react-router";
import { Eye, Edit3, Upload, CheckSquare, Layers } from "lucide-react";
import { MangaPage } from "@/data/mangakaMockData";

interface ChapterLayerTableProps {
  pages: MangaPage[];
  seriesId: string;
  chapterId: string;
  chapterNumber: number;
}

export function ChapterLayerTable({ pages, seriesId, chapterId, chapterNumber }: ChapterLayerTableProps) {
  const getStatusBadge = (status: MangaPage["overallStatus"]) => {
    switch (status) {
      case "Approved":
        return <span className="bg-manga-red text-white border-manga-ink border px-2 py-0.5 text-[10px] font-bold uppercase whitespace-nowrap">Đã duyệt</span>;
      case "Submitted":
        return <span className="bg-blue-100 text-blue-800 border-blue-300 border px-2 py-0.5 text-[10px] font-bold uppercase whitespace-nowrap">Chờ duyệt</span>;
      case "Doing":
        return <span className="bg-yellow-100 text-yellow-800 border-yellow-300 border px-2 py-0.5 text-[10px] font-bold uppercase whitespace-nowrap">Đang làm</span>;
      case "Need Fix":
        return <span className="bg-red-100 text-red-800 border-red-300 border px-2 py-0.5 text-[10px] font-bold uppercase whitespace-nowrap">Cần sửa</span>;
      default:
        return <span className="bg-gray-100 text-gray-500 border-gray-300 border px-2 py-0.5 text-[10px] font-bold uppercase whitespace-nowrap">Chưa bắt đầu</span>;
    }
  };

  const getLayerIndicator = (status: MangaPage["overallStatus"]) => {
    switch (status) {
      case "Approved":
        return <span className="w-3.5 h-3.5 rounded-full bg-manga-red border border-manga-ink inline-block" title="Approved" />;
      case "Submitted":
        return <span className="w-3.5 h-3.5 rounded-full bg-blue-500 border border-manga-ink inline-block animate-pulse" title="Submitted" />;
      case "Doing":
        return <span className="w-3.5 h-3.5 rounded-full bg-yellow-500 border border-manga-ink inline-block" title="Doing" />;
      case "Need Fix":
        return <span className="w-3.5 h-3.5 rounded-full bg-red-600 border border-manga-ink inline-block" title="Need Fix" />;
      default:
        return <span className="w-3.5 h-3.5 rounded-full bg-gray-200 border border-gray-400 inline-block" title="Not Started" />;
    }
  };

  if (pages.length === 0) {
    return (
      <div className="bg-white border-4 border-manga-ink p-8 text-center manga-shadow-sm my-6">
        <Layers className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <h3 className="font-manga text-xl font-bold uppercase text-gray-500 mb-1">Chưa có trang nào</h3>
        <p className="text-sm font-bold text-gray-400">Hãy liên hệ ban biên tập để tạo phân rã trang cho chapter này.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white border-4 border-manga-ink manga-shadow-sm my-6">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-manga-ink text-white font-manga text-sm uppercase tracking-wider border-b-4 border-manga-ink">
            <th className="p-4 border-r-2 border-manga-ink">Trang</th>
            <th className="p-4 text-center border-r-2 border-manga-ink">Panel Frame</th>
            <th className="p-4 text-center border-r-2 border-manga-ink">Line Art</th>
            <th className="p-4 text-center border-r-2 border-manga-ink">Speech Balloon</th>
            <th className="p-4 text-center border-r-2 border-manga-ink">Background</th>
            <th className="p-4 text-center border-r-2 border-manga-ink">Ref / Asset</th>
            <th className="p-4 text-center border-r-2 border-manga-ink">Submissions</th>
            <th className="p-4 text-center border-r-2 border-manga-ink">Overall</th>
            <th className="p-4 text-center">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {pages.map((page) => (
            <tr key={page.id} className="border-b-2 border-manga-ink hover:bg-gray-50 font-bold transition-colors">
              {/* Page Number & Thumbnail */}
              <td className="p-4 border-r-2 border-manga-ink flex items-center gap-3">
                <div className="w-10 h-14 border border-manga-ink bg-gray-100 overflow-hidden flex-shrink-0">
                  <img src={page.thumbnailUrl} alt={`Trang ${page.pageNumber}`} className="w-full h-full object-cover grayscale contrast-125" />
                </div>
                <span className="font-manga text-lg text-manga-ink">Trang {page.pageNumber}</span>
              </td>

              {/* Panel Frame Layer */}
              <td className="p-4 text-center border-r-2 border-manga-ink">
                <div className="flex flex-col items-center justify-center gap-1">
                  {getLayerIndicator(page.panelFrameStatus)}
                  <span className="text-[9px] uppercase text-gray-500 font-bold leading-none">{page.panelFrameStatus}</span>
                </div>
              </td>

              {/* Line Art Layer */}
              <td className="p-4 text-center border-r-2 border-manga-ink">
                <div className="flex flex-col items-center justify-center gap-1">
                  {getLayerIndicator(page.lineArtStatus)}
                  <span className="text-[9px] uppercase text-gray-500 font-bold leading-none">{page.lineArtStatus}</span>
                </div>
              </td>

              {/* Speech Balloon Layer */}
              <td className="p-4 text-center border-r-2 border-manga-ink">
                <div className="flex flex-col items-center justify-center gap-1">
                  {getLayerIndicator(page.speechBalloonStatus)}
                  <span className="text-[9px] uppercase text-gray-500 font-bold leading-none">{page.speechBalloonStatus}</span>
                </div>
              </td>

              {/* Background Layer */}
              <td className="p-4 text-center border-r-2 border-manga-ink">
                <div className="flex flex-col items-center justify-center gap-1">
                  {getLayerIndicator(page.backgroundStatus)}
                  <span className="text-[9px] uppercase text-gray-500 font-bold leading-none">{page.backgroundStatus}</span>
                </div>
              </td>

              {/* Asset Status */}
              <td className="p-4 text-center border-r-2 border-manga-ink">
                <div className="flex flex-col items-center justify-center gap-1">
                  {getLayerIndicator(page.assetStatus)}
                  <span className="text-[9px] uppercase text-gray-500 font-bold leading-none">{page.assetStatus}</span>
                </div>
              </td>

              {/* Assistant Submission Status */}
              <td className="p-4 text-center border-r-2 border-manga-ink">
                <div className="flex flex-col items-center justify-center gap-1">
                  {getLayerIndicator(page.assistantSubmissionStatus)}
                  <span className="text-[9px] uppercase text-gray-500 font-bold leading-none">{page.assistantSubmissionStatus}</span>
                </div>
              </td>

              {/* Overall Status */}
              <td className="p-4 text-center border-r-2 border-manga-ink">
                {getStatusBadge(page.overallStatus)}
              </td>

              {/* Actions */}
              <td className="p-4">
                <div className="flex justify-center gap-2">
                  <Link 
                    to={`/dashboard/mangaka/page-viewer/${page.id}`}
                    className="p-2 border border-manga-ink text-manga-ink bg-white hover:bg-gray-100 hover:manga-shadow-sm transition-all" 
                    title="Xem Trang"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  <Link
                    to={`/dashboard/mangaka/assign-task?seriesId=${seriesId}&chapterId=${chapterId}&pageId=${page.id}&pageNumber=${page.pageNumber}`}
                    className="p-2 border border-manga-ink text-manga-ink bg-white hover:bg-gray-100 hover:manga-shadow-sm transition-all"
                    title="Giao Task Trợ Lý"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Link>
                  <Link
                    to={`/dashboard/mangaka/submission?seriesId=${seriesId}&chapterId=${chapterId}&pageId=${page.id}`}
                    className="p-2 border border-manga-ink text-white bg-manga-red hover:bg-red-700 hover:manga-shadow-sm transition-all"
                    title="Nộp Bản Thảo"
                  >
                    <Upload className="w-4 h-4" />
                  </Link>
                  <Link
                    to={`/dashboard/mangaka/submission?seriesId=${seriesId}&chapterId=${chapterId}&pageId=${page.id}`}
                    className="p-2 border border-manga-ink text-white bg-manga-ink hover:bg-gray-800 hover:manga-shadow-sm transition-all"
                    title="Duyệt Submission"
                  >
                    <CheckSquare className="w-4 h-4" />
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
