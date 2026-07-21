import React, { useEffect, useState } from "react";
import { Flame, Hourglass, Moon, Loader2 } from "lucide-react";
import { SeriesAPI, seriesService } from "@/services/series.service";
import { Assistant } from "@/data/mangakaMockData";

export interface TeamListProps {
  seriesList?: SeriesAPI[];
}

export function TeamList({ seriesList = [] }: TeamListProps) {
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTeam = async () => {
      if (seriesList.length === 0) return;
      setLoading(true);
      try {
        const authUserStr = sessionStorage.getItem('mangaflow_user') || '{}';
        const authUser = JSON.parse(authUserStr);
        const currentUserId = authUser.user_id || authUser.id;

        const allMembersPromises = seriesList.map(s => seriesService.getMembers(s._id));
        const membersArrays = await Promise.all(allMembersPromises);
        
        const memberMap = new Map<string, any>();
        
        membersArrays.flat().forEach(m => {
          if (!m.users || m.users.user_id === currentUserId) return;
          
          const uid = m.users.user_id;
          if (memberMap.has(uid)) {
            memberMap.get(uid).seriesCount += 1;
          } else {
            let roleDisplay = m.role_in_series || m.users.role || 'Assistant';
            if (roleDisplay.toLowerCase() === 'owner') roleDisplay = 'Co-Mangaka';
            if (roleDisplay.toLowerCase() === 'editor') roleDisplay = 'Tantou Editor';

            memberMap.set(uid, {
              id: uid,
              name: m.users.name || m.users.username || 'Unknown',
              role: roleDisplay,
              avatarUrl: m.users.avatar_url || '',
              seriesCount: 1,
              currentTasksCount: 0,
              pendingSubmissionsCount: 0,
              status: 'Nghỉ ngơi'
            });
          }
        });

        const sortedMembers = Array.from(memberMap.values())
          .sort((a, b) => b.seriesCount - a.seriesCount)
          .slice(0, 3)
          .map((m, idx) => ({
            ...m,
            currentTasksCount: m.role.toLowerCase().includes('assistant') ? 1 : 0,
            status: idx === 0 ? 'Đang làm' : idx === 1 ? 'Chờ duyệt' : 'Nghỉ ngơi'
          }));

        setAssistants(sortedMembers as Assistant[]);
      } catch (err) {
        console.error("Error fetching team members:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, [seriesList]);

  const getStatusIcon = (status: Assistant["status"]) => {
    switch (status) {
      case "Đang làm":
        return { Icon: Flame, color: "text-manga-red", bg: "bg-white border-manga-ink" };
      case "Chờ duyệt":
        return { Icon: Hourglass, color: "text-manga-ink", bg: "bg-gray-50 border-manga-ink" };
      default:
        return { Icon: Moon, color: "text-gray-500", bg: "bg-gray-100 border-gray-300 opacity-50" };
    }
  };

  return (
    <div className="bg-white manga-border manga-shadow-sm flex flex-col mb-8">
      {/* Header */}
      <div className="bg-manga-red text-white p-4">
        <h2 className="font-manga text-2xl font-bold uppercase tracking-wider text-center">
          Đội ngũ cộng tác
        </h2>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col gap-4">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-manga-red" />
          </div>
        ) : assistants.length === 0 ? (
          <div className="text-center py-4 text-gray-400 font-bold text-sm">
            Chưa có thành viên nào.
          </div>
        ) : (
          assistants.map((assistant) => {
            const { Icon: StatusIcon, color: iconColor, bg: bgStyle } = getStatusIcon(assistant.status);

            return (
              <div
                key={assistant.id}
                className={`flex items-center justify-between border-2 p-3 hover:manga-shadow-sm transition-shadow ${bgStyle}`}
              >
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-gray-200 border-2 border-manga-ink overflow-hidden relative flex-shrink-0">
                    {assistant.avatarUrl ? (
                      <img
                        src={assistant.avatarUrl}
                        alt={assistant.name}
                        className="w-full h-full object-cover grayscale"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-xl text-gray-500">
                        {assistant.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  {/* Name & Role */}
                  <div>
                    <h4 className="font-bold text-xl leading-none mb-1 text-manga-ink">
                      {assistant.name}
                    </h4>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      {assistant.role}
                    </p>

                    {/* Active Tasks stats */}
                    <div className="flex gap-2 mt-1.5 text-[9px] text-gray-400 font-bold uppercase">
                      <span>Cộng tác: <strong className="text-manga-ink">{assistant.seriesCount || 0} Series</strong></span>
                      <span>•</span>
                      <span>Task đang vẽ: <strong className="text-manga-ink">{assistant.currentTasksCount}</strong></span>
                      <span>•</span>
                      <span>Chờ duyệt: <strong className="text-manga-ink">{assistant.pendingSubmissionsCount}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className={`flex flex-col items-center gap-1 ${iconColor}`}>
                  <StatusIcon className="w-5 h-5" />
                  <span className="text-[9px] font-bold uppercase leading-none">{assistant.status}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
