
import React, { useEffect, useState } from "react";
import { Eye, Heart, MessageSquare, Star, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { mangakaStore, RankingStat } from "@/data/mangakaMockData";

export function InteractionStats() {
  const [stat, setStat] = useState<RankingStat | null>(null);

  useEffect(() => {
    const list = mangakaStore.getRankingStats();
    const current = list.find((s) => s.seriesId === "ser_001") || list[0];
    if (current) {
      setStat(current);
    }
  }, []);

  if (!stat) {
    return (
      <div className="bg-white manga-border manga-shadow-sm flex flex-col justify-center p-6 text-center text-gray-400">
        Đang tải chỉ số tương tác...
      </div>
    );
  }

  return (
    <div className="bg-white manga-border manga-shadow-sm flex flex-col">
      {/* Header */}
      <div className="bg-manga-ink text-white p-4">
        <h2 className="font-manga text-2xl font-bold uppercase tracking-wider text-center">
          Chỉ số tương tác
        </h2>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col items-center">
        <h3 className="font-manga text-xl font-bold uppercase tracking-widest text-manga-ink mb-4">
          Xếp hạng tuần
        </h3>

        {/* Rank Badge */}
        <div className="relative mb-4 transform -rotate-3 hover:rotate-0 transition-transform">
          <div className="absolute inset-0 bg-manga-ink translate-x-1 translate-y-1"></div>
          <div className="relative bg-white border-4 border-manga-ink px-8 py-2 flex items-center justify-center">
            <span className="font-manga text-6xl font-bold text-manga-red italic">#{stat.rankWeekly}</span>
          </div>
        </div>

        <div className="text-manga-ink font-bold text-sm text-center mb-6">
          {stat.rankChange > 0 ? (
            <span className="text-green-600 flex items-center gap-0.5 justify-center">
              <ArrowUp className="w-4 h-4" /> Tăng {stat.rankChange} bậc so với tuần trước!
            </span>
          ) : stat.rankChange < 0 ? (
            <span className="text-manga-red flex items-center gap-0.5 justify-center">
              <ArrowDown className="w-4 h-4" /> Giảm {Math.abs(stat.rankChange)} bậc so với tuần trước.
            </span>
          ) : (
            <span className="text-gray-500 flex items-center gap-0.5 justify-center">
              <Minus className="w-4 h-4" /> Giữ nguyên thứ hạng so với tuần trước.
            </span>
          )}
        </div>

        {/* Detailed Stats Grid */}
        <div className="w-full grid grid-cols-2 gap-3 mb-6 border-t-2 border-dashed border-manga-ink pt-4">
          <div className="flex items-center gap-2 border border-manga-ink p-2 bg-gray-50">
            <Eye className="w-4 h-4 text-gray-500" />
            <div>
              <span className="text-[9px] font-bold text-gray-400 block uppercase leading-none">Views</span>
              <span className="font-manga text-sm font-bold text-manga-ink">{stat.views}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 border border-manga-ink p-2 bg-gray-50">
            <Heart className="w-4 h-4 text-manga-red" />
            <div>
              <span className="text-[9px] font-bold text-gray-400 block uppercase leading-none">Likes</span>
              <span className="font-manga text-sm font-bold text-manga-ink">{stat.likes}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 border border-manga-ink p-2 bg-gray-50">
            <MessageSquare className="w-4 h-4 text-blue-500" />
            <div>
              <span className="text-[9px] font-bold text-gray-400 block uppercase leading-none">Comments</span>
              <span className="font-manga text-sm font-bold text-manga-ink">{stat.comments}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 border border-manga-ink p-2 bg-gray-50">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-400" />
            <div>
              <span className="text-[9px] font-bold text-gray-400 block uppercase leading-none">Rating</span>
              <span className="font-manga text-sm font-bold text-manga-ink">{stat.rating}/10</span>
            </div>
          </div>
        </div>

        {/* Mock Bar Chart */}
        <div className="w-full h-24 border-b-4 border-l-4 border-manga-ink flex items-end justify-around pb-0 pt-4 px-2 relative">
          <div className="flex flex-col items-center justify-end h-full w-1/5 gap-1">
            <span className="text-[9px] font-bold">T1</span>
            <div className="w-full bg-manga-ink h-[45%]"></div>
          </div>
          <div className="flex flex-col items-center justify-end h-full w-1/5 gap-1">
            <span className="text-[9px] font-bold">T2</span>
            <div className="w-full bg-manga-ink h-[60%]"></div>
          </div>
          <div className="flex flex-col items-center justify-end h-full w-1/5 gap-1 relative">
            <span className="text-[9px] font-bold text-manga-red absolute -top-5">T3</span>
            <div className="w-full bg-manga-red h-[90%] manga-border"></div>
          </div>
          <div className="flex flex-col items-center justify-end h-full w-1/5 gap-1">
            <span className="text-[9px] font-bold">T4</span>
            <div className="w-full bg-manga-ink h-[75%]"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
