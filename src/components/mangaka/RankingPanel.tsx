
import React, { useState } from "react";
import { Trophy, Eye, Heart, MessageSquare, Users, Star, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { RankingStat } from "@/data/mangakaMockData";

interface RankingPanelProps {
  stats: RankingStat[];
}

export function RankingPanel({ stats }: RankingPanelProps) {
  const [selectedSeriesId, setSelectedSeriesId] = useState<string>(stats[0]?.seriesId || "");
  const [timeFilter, setTimeFilter] = useState<"week" | "month" | "year">("week");

  const currentStat = stats.find((s) => s.seriesId === selectedSeriesId) || stats[0];

  if (!currentStat) {
    return (
      <div className="bg-white border-4 border-manga-ink p-8 text-center manga-shadow-sm">
        <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-2" />
        <p className="font-manga text-xl font-bold uppercase text-gray-500">Chưa có dữ liệu xếp hạng</p>
      </div>
    );
  }

  // Generate mock history values based on the rating/rank
  const chartData = timeFilter === "week" 
    ? [ { label: "Tuần 1", value: 35 }, { label: "Tuần 2", value: 50 }, { label: "Tuần 3", value: 70 }, { label: "Tuần này", value: 90 } ]
    : timeFilter === "month"
    ? [ { label: "Tháng 2", value: 40 }, { label: "Tháng 3", value: 55 }, { label: "Tháng 4", value: 85 }, { label: "Tháng 5", value: 90 } ]
    : [ { label: "Q1", value: 60 }, { label: "Q2", value: 75 }, { label: "Q3", value: 80 }, { label: "Q4", value: 95 } ];

  return (
    <div className="bg-white border-4 border-manga-ink manga-shadow p-6 flex flex-col gap-6">
      {/* Header with filters */}
      <div className="flex justify-between items-center gap-4 flex-wrap border-b-2 border-manga-ink pb-4">
        <div>
          <h2 className="font-manga text-3xl font-bold uppercase text-manga-ink flex items-center gap-2">
            <Trophy className="w-8 h-8 text-manga-red" />
            Bảng Xếp Hạng Series
          </h2>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Đồng bộ từ BXH Reader</p>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <select
            value={selectedSeriesId}
            onChange={(e) => setSelectedSeriesId(e.target.value)}
            className="border-2 border-manga-ink px-3 py-1.5 font-bold text-xs bg-white uppercase focus:outline-none"
          >
            {stats.map((s) => (
              <option key={s.seriesId} value={s.seriesId}>
                {s.seriesTitle}
              </option>
            ))}
          </select>
          <div className="flex border-2 border-manga-ink font-bold text-xs uppercase overflow-hidden">
            {(["week", "month", "year"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setTimeFilter(filter)}
                className={`px-3 py-1.5 transition-colors border-r border-manga-ink last:border-none ${
                  timeFilter === filter ? "bg-manga-ink text-white" : "bg-white text-manga-ink hover:bg-gray-100"
                }`}
              >
                {filter === "week" ? "Tuần" : filter === "month" ? "Tháng" : "Năm"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Info Cards + Chart */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Rank Badge + Quick Stats */}
        <div className="flex flex-col items-center justify-center bg-red-50/50 border-2 border-manga-ink p-6 relative">
          <h3 className="font-manga text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Thứ Hạng Hiện Tại</h3>
          <div className="relative mb-3 transform -rotate-3 hover:rotate-0 transition-transform">
            <div className="absolute inset-0 bg-manga-ink translate-x-1.5 translate-y-1.5"></div>
            <div className="relative bg-white border-4 border-manga-ink px-8 py-3 flex items-center justify-center">
              <span className="font-manga text-6xl font-bold text-manga-red italic">#{currentStat.rankWeekly}</span>
            </div>
          </div>

          {/* Movement Indicator */}
          <div className="flex items-center gap-1 font-bold text-sm mb-4">
            {currentStat.rankChange > 0 ? (
              <span className="text-green-600 flex items-center">
                <ArrowUp className="w-4 h-4 mr-0.5" /> Tăng {currentStat.rankChange} bậc
              </span>
            ) : currentStat.rankChange < 0 ? (
              <span className="text-manga-red flex items-center">
                <ArrowDown className="w-4 h-4 mr-0.5" /> Giảm {Math.abs(currentStat.rankChange)} bậc
              </span>
            ) : (
              <span className="text-gray-500 flex items-center">
                <Minus className="w-4 h-4 mr-0.5" /> Không đổi
              </span>
            )}
            <span className="text-gray-400">so với kỳ trước</span>
          </div>

          <div className="w-full text-center border-t border-dashed border-manga-ink pt-3 font-bold text-xs">
            <span className="text-gray-500 uppercase block mb-0.5">Chapter HOT Nhất:</span>
            <span className="text-manga-red font-manga text-lg uppercase">{currentStat.hotChapter}</span>
          </div>
        </div>

        {/* Middle: Grid of Stats */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Lượt xem", value: currentStat.views, icon: Eye, color: "text-manga-ink" },
            { label: "Lượt thích", value: currentStat.likes, icon: Heart, color: "text-manga-red" },
            { label: "Bình luận", value: currentStat.comments, icon: MessageSquare, color: "text-blue-500" },
            { label: "Theo dõi", value: currentStat.followers, icon: Users, color: "text-purple-500" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="bg-white border-2 border-manga-ink p-4 flex flex-col justify-between manga-shadow-sm">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{item.label}</span>
                  <Icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <div className="font-manga text-2xl font-bold text-manga-ink">{item.value}</div>
              </div>
            );
          })}

          <div className="col-span-2 bg-white border-2 border-manga-ink p-4 flex justify-between items-center manga-shadow-sm">
            <div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Đánh giá trung bình</span>
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-manga text-2xl font-bold text-manga-ink">{currentStat.rating}</span>
                <span className="text-xs text-gray-400 font-bold">/10</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Phản hồi</span>
              <span className="text-green-600 font-bold text-sm">Cực kỳ tích cực</span>
            </div>
          </div>
        </div>

        {/* Right: Div-based CSS Bar Chart */}
        <div className="bg-white border-2 border-manga-ink p-5 flex flex-col justify-between manga-shadow-sm">
          <div>
            <h4 className="font-manga text-sm font-bold uppercase text-manga-ink mb-1">Biến Động Tương Tác</h4>
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-4">Điểm số tổng hợp theo thời gian</p>
          </div>

          {/* Graph bars */}
          <div className="h-32 border-b-2 border-l-2 border-manga-ink flex items-end justify-around pb-0.5 pt-4 px-2 relative mb-2">
            {chartData.map((bar, idx) => (
              <div key={bar.label} className="flex flex-col items-center justify-end h-full w-[18%] gap-1.5 relative group">
                <span className="text-[8px] font-bold text-gray-400 absolute -top-5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-manga-ink text-white px-1 font-mono">
                  {bar.value}%
                </span>
                <div 
                  className={`w-full border-t border-x border-manga-ink transition-all duration-500 ${
                    idx === chartData.length - 1 ? "bg-manga-red" : "bg-manga-ink"
                  }`} 
                  style={{ height: `${bar.value}%` }} 
                />
                <span className="text-[8px] font-bold uppercase tracking-tighter truncate w-full text-center leading-none">
                  {bar.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
