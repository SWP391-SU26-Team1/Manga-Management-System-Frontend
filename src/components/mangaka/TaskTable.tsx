import React from "react";
import { Eye, Edit2, Trash2, ClipboardList, X, BellRing, ExternalLink } from "lucide-react";
import { Link } from "react-router";

export interface DisplayTask {
  id: string;
  chapterId: string;
  pageId: string;
  chapterNumber?: number | string;
  pageNumber?: number | string;
  layerType: string;
  assignedTo: string;
  deadline: string;
  status: string;
  note: string;
  priority: "Low" | "Medium" | "High" | "Urgent";
  regions?: any[];
}

interface TaskTableProps {
  tasks: DisplayTask[];
  onDeleteTask?: (taskId: string) => void;
  onEditTask?: (task: DisplayTask) => void;
  onAssignTask?: (taskId: string, chapterId: string, pageId: string) => void | Promise<any>;
}

export function TaskTable({ tasks, onDeleteTask, onEditTask, onAssignTask }: TaskTableProps) {
  const [selectedTask, setSelectedTask] = React.useState<DisplayTask | null>(null);
  const [assigningIds, setAssigningIds] = React.useState<Record<string, boolean>>({});

  const handleAssignClick = async (taskId: string, chapterId: string, pageId: string) => {
    if (assigningIds[taskId]) return;
    setAssigningIds(prev => ({ ...prev, [taskId]: true }));
    try {
      if (onAssignTask) {
        await onAssignTask(taskId, chapterId, pageId);
      }
    } finally {
      setAssigningIds(prev => ({ ...prev, [taskId]: false }));
    }
  };

  const getStatusBadge = (status: string) => {
    const s = (status || "").toLowerCase();
    switch (s) {
      case "approved":
      case "completed":
        return <span className="bg-manga-red text-white border-manga-ink border px-2 py-0.5 text-xs font-bold uppercase">Approved</span>;
      case "submitted":
        return <span className="bg-blue-100 text-blue-800 border-blue-300 border px-2 py-0.5 text-xs font-bold uppercase">Submitted</span>;
      case "doing":
      case "in_progress":
        return <span className="bg-yellow-100 text-yellow-800 border-yellow-300 border px-2 py-0.5 text-xs font-bold uppercase">Đang làm</span>;
      case "assigned":
        return <span className="bg-orange-100 text-orange-800 border-orange-300 border px-2 py-0.5 text-xs font-bold uppercase">Chờ xác nhận</span>;
      case "need fix":
      case "rejected":
        return <span className="bg-red-100 text-red-800 border-red-300 border px-2 py-0.5 text-xs font-bold uppercase">Need Fix</span>;
      case "cancelled":
        return <span className="bg-gray-400 text-white border-gray-500 border px-2 py-0.5 text-xs font-bold uppercase">Cancelled</span>;
      case "pending":
        return <span className="bg-[#FFEEDB] text-[#E65C00] border-[#FFB870] border px-2 py-0.5 text-xs font-bold uppercase">Pending</span>;
      default:
        return <span className="bg-gray-100 text-gray-500 border-gray-300 border px-2 py-0.5 text-xs font-bold uppercase">Not Started</span>;
    }
  };

  const getLayerTypeDisplay = (type: string) => {
    const t = type || "";
    switch (t) {
      case "inking": return "Line Art";
      case "background": return "Background";
      case "lettering": return "Speech Balloon";
      case "coloring": return "Screentone";
      case "sfx": return "Effects / SFX";
      case "cleaning": return "Cleaning";
      default: return t;
    }
  };

  const handleCancel = (taskId: string) => {
    if (confirm("Bạn có chắc chắn muốn hủy công việc này không? Trợ lý sẽ nhận được thông báo dừng vẽ.")) {
      if (onDeleteTask) {
        onDeleteTask(taskId);
      }
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="bg-white border-4 border-manga-ink p-10 text-center manga-shadow-sm my-4">
        <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <h3 className="font-manga text-xl font-bold uppercase text-gray-500 mb-1">Chưa có công việc nào được giao</h3>
        <p className="text-sm font-bold text-gray-400">Hãy điền form phía trên để giao phó công việc đầu tiên cho trợ lý.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white border-4 border-manga-ink manga-shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-manga-ink text-white font-manga text-sm uppercase tracking-wider border-b-4 border-manga-ink">
            <th className="p-4 border-r-2 border-manga-ink">Nhiệm vụ</th>
            <th className="p-4 border-r-2 border-manga-ink">Trợ lý</th>
            <th className="p-4 border-r-2 border-manga-ink">Chapter/Page</th>
            <th className="p-4 border-r-2 border-manga-ink">Lớp (Layer)</th>
            <th className="p-4 border-r-2 border-manga-ink">Hạn chót (Deadline)</th>
            <th className="p-4 border-r-2 border-manga-ink text-center">Trạng thái</th>
            <th className="p-4 text-center">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id} className="border-b-2 border-manga-ink hover:bg-gray-50 font-bold text-sm transition-colors">
              {/* Task detail / notes */}
              <td className="p-4 border-r-2 border-manga-ink max-w-[200px]">
                <div className="truncate text-manga-ink" title={task.note}>
                  {task.note}
                </div>
              </td>

              {/* Assistant */}
              <td className="p-4 border-r-2 border-manga-ink text-manga-ink font-manga text-base">
                {task.assignedTo}
              </td>

              {/* Chapter and Page */}
              <td className="p-4 border-r-2 border-manga-ink">
                <span className="bg-gray-100 text-manga-ink border border-manga-ink px-2 py-0.5 text-xs">
                  Page {task.pageNumber ?? "N/A"} (CH.{task.chapterNumber ?? "N/A"})
                </span>
              </td>

              {/* Layer type */}
              <td className="p-4 border-r-2 border-manga-ink">
                <span className="text-xs uppercase text-gray-500 font-bold">
                  {getLayerTypeDisplay(task.layerType)}
                </span>
              </td>

              {/* Deadline */}
              <td className="p-4 border-r-2 border-manga-ink text-xs font-mono text-gray-600">
                {task.deadline}
              </td>

              {/* Status */}
              <td className="p-4 border-r-2 border-manga-ink text-center">
                {getStatusBadge(task.status)}
              </td>

              {/* Action buttons */}
              <td className="p-4 text-center">
                <div className="flex justify-center gap-1.5 items-center">
                  {task.status === "pending" && onAssignTask && (
                    <button
                      onClick={() => handleAssignClick(task.id, task.chapterId, task.pageId)}
                      disabled={assigningIds[task.id]}
                      className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase border border-manga-ink cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Giao việc cho trợ lý"
                    >
                      {assigningIds[task.id] ? "ĐANG GIAO..." : "GIAO VIỆC"}
                    </button>
                  )}
                  <button 
                    onClick={() => setSelectedTask(task)}
                    className="p-1.5 border border-manga-ink text-manga-ink bg-white hover:bg-gray-100 transition-colors cursor-pointer" 
                    title="Xem chi tiết"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {onEditTask && (
                    <button
                      onClick={() => onEditTask(task)}
                      className="p-1.5 border border-manga-ink text-manga-ink bg-white hover:bg-gray-100 transition-colors cursor-pointer"
                      title="Sửa công việc"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleCancel(task.id)}
                    className="p-1.5 border border-manga-red text-manga-red bg-white hover:bg-red-50 transition-colors cursor-pointer"
                    title="Hủy công việc"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Task Details Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-manga-ink manga-shadow max-w-2xl w-full flex flex-col">
            <div className="p-4 border-b-4 border-manga-ink bg-gray-50 flex justify-between items-center">
              <h2 className="font-manga font-bold text-xl uppercase flex items-center gap-2">
                <ClipboardList className="w-6 h-6 text-manga-red" /> Chi tiết công việc
              </h2>
              <button onClick={() => setSelectedTask(null)} className="hover:text-red-500">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Trợ lý đảm nhận</p>
                  <p className="font-manga text-xl">{selectedTask.assignedTo}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Trạng thái</p>
                  <div className="mt-1">{getStatusBadge(selectedTask.status)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Lớp bản thảo</p>
                  <p className="font-bold">{getLayerTypeDisplay(selectedTask.layerType)}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Hạn chót</p>
                  <p className="font-bold text-red-600">{selectedTask.deadline}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-gray-500 uppercase mb-2">Vị trí (Page ID)</p>
                <div className="font-bold text-sm bg-gray-100 p-2 border border-gray-300">
                  {selectedTask.pageId}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-gray-500 uppercase mb-2">Ghi chú / Yêu cầu công việc</p>
                <div className="p-4 border-2 border-gray-200 bg-gray-50 text-sm whitespace-pre-wrap font-bold">
                  {selectedTask.note}
                </div>
              </div>
            </div>

            <div className="p-4 border-t-4 border-manga-ink bg-gray-50 flex flex-wrap gap-2 justify-end">
              <Link 
                to={`/dashboard/mangaka/page-viewer/${selectedTask.pageId}`}
                className="flex items-center gap-2 px-4 py-2 border-2 border-manga-ink font-bold hover:bg-gray-100 uppercase text-sm bg-white"
              >
                <ExternalLink className="w-4 h-4" /> Mở trang
              </Link>
              <button 
                onClick={() => { alert('Đã gửi thông báo nhắc nhở trợ lý!'); setSelectedTask(null); }}
                className="flex items-center gap-2 px-4 py-2 border-2 border-orange-500 text-orange-600 font-bold hover:bg-orange-50 uppercase text-sm bg-white"
              >
                <BellRing className="w-4 h-4" /> Nhắc nhở
              </button>
              {onEditTask && (
                <button 
                  onClick={() => { onEditTask(selectedTask); setSelectedTask(null); }}
                  className="flex items-center gap-2 px-4 py-2 bg-manga-ink text-white font-bold hover:bg-gray-800 uppercase text-sm border-2 border-manga-ink"
                >
                  <Edit2 className="w-4 h-4" /> Chỉnh sửa
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
