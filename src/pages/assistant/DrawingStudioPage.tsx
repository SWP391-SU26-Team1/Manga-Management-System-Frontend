import React, { useState, useEffect, useRef, MouseEvent as ReactMouseEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useToast } from '@/contexts/ToastContext';
import {
  Pen, Eraser, MousePointer2, Square, Circle, ArrowUpRight, Type, 
  MapPin, Undo2, Redo2, Trash2, Hand, ZoomIn, ZoomOut, Maximize, 
  FileDown, Save, Upload, Send, CheckCircle2, X, AlertTriangle, 
  Layers, MessageSquare, ListTodo, FileImage, Grid, ImagePlus, Loader2,
  ArrowLeft
} from 'lucide-react';
import assistantService from '@/services/assistant.service';
import uploadService from '@/services/upload.service';
import api from '@/services/api';

// --- Types ---
type Point = { x: number; y: number };
type ToolType = 'select' | 'pen' | 'eraser' | 'rect' | 'circle' | 'arrow' | 'text' | 'pin' | 'hand';
type Stroke = {
  id: string;
  tool: ToolType;
  color: string;
  size: number;
  points: Point[];
  text?: string;
};

interface MappedRegion {
  id: string;
  name: string;
  type: string;
  status: 'Chưa làm' | 'Đang làm' | 'Đã xong' | string;
  x: number;
  y: number;
  w: number;
  h: number;
  desc: string;
}

interface MappedFeedback {
  id: string;
  region: string;
  text: string;
  date: string;
  resolved: boolean;
}

const COLORS = ['#000000', '#E63946', '#3B82F6', '#10B981', '#F59E0B', '#FFFFFF'];

export default function DrawingStudioPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pageId = searchParams.get('pageId') || '';
  const { showToast } = useToast();

  // Loading States
  const [loading, setLoading] = useState(true);
  const [pageDetail, setPageDetail] = useState<any>(null);
  const [activeTask, setActiveTask] = useState<any>(null);
  
  // Workspace layout states
  const [activeTab, setActiveTab] = useState<'regions' | 'layers' | 'feedback' | 'submit'>('regions');
  
  // Canvas & Drawing states
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [scale, setScale] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPan, setLastPan] = useState({ x: 0, y: 0 });
  
  const [tool, setTool] = useState<ToolType>('pen');
  const [color, setColor] = useState('#E63946');
  const [brushSize, setBrushSize] = useState(3);
  const [showGrid, setShowGrid] = useState(false);
  const [bgImage, setBgImage] = useState<string>("https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=600&auto=format&fit=crop");
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 850 });
  
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [history, setHistory] = useState<Stroke[][]>([]);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // Dynamic features state
  const [regions, setRegions] = useState<MappedRegion[]>([]);
  const [activeRegionId, setActiveRegionId] = useState<string | null>(null);
  const [regionFilter, setRegionFilter] = useState('Tất cả');
  
  const [layers, setLayers] = useState({
    original: true,
    mangaka: true,
    assistantQuickEdit: true,
    assistantNotes: true,
  });

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [submitNote, setSubmitNote] = useState('');
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Feedbacks
  const [feedbacks, setFeedbacks] = useState<MappedFeedback[]>([]);

  // Selector lists states
  const [selectorSeriesList, setSelectorSeriesList] = useState<any[]>([]);
  const [selectorChaptersMap, setSelectorChaptersMap] = useState<Record<string, any[]>>({}); // series_id -> chapters
  const [selectorPagesMap, setSelectorPagesMap] = useState<Record<string, any[]>>({}); // chapter_id -> pages
  
  // Selected IDs states
  const [selSeriesId, setSelSeriesId] = useState<string>('');
  const [selChapterId, setSelChapterId] = useState<string>('');
  const [selPageId, setSelPageId] = useState<string>('');

  // Load selectors data on mount
  useEffect(() => {
    loadSelectorsData();
  }, []);

  const loadSelectorsData = async () => {
    try {
      const res = await assistantService.listMyTasks({ limit: 100 });
      if (res && res.success && Array.isArray(res.data)) {
        const seriesMap: Record<string, { series_id: string; title: string }> = {};
        const chaptersMap: Record<string, Record<string, { chapter_id: string; title: string; chapter_number: number }>> = {};
        const pagesMap: Record<string, Record<string, { page_id: string; page_number: number }>> = {};
        
        res.data.forEach((task: any) => {
          const page = task.page;
          if (!page) return;
          const chapter = page.chapter;
          if (!chapter) return;
          const series = chapter.series;
          if (!series) return;
          
          seriesMap[series.series_id] = {
            series_id: series.series_id,
            title: series.title
          };
          
          if (!chaptersMap[series.series_id]) {
            chaptersMap[series.series_id] = {};
          }
          chaptersMap[series.series_id][chapter.chapter_id] = {
            chapter_id: chapter.chapter_id,
            title: chapter.title,
            chapter_number: chapter.chapter_number || 0
          };
          
          if (!pagesMap[chapter.chapter_id]) {
            pagesMap[chapter.chapter_id] = {};
          }
          pagesMap[chapter.chapter_id][page.page_id] = {
            page_id: page.page_id,
            page_number: page.page_number
          };
        });
        
        const seriesList = Object.values(seriesMap);
        
        const finalChaptersMap: Record<string, any[]> = {};
        Object.keys(chaptersMap).forEach(seriesId => {
          finalChaptersMap[seriesId] = Object.values(chaptersMap[seriesId]).sort((a, b) => a.chapter_number - b.chapter_number);
        });
        
        const finalPagesMap: Record<string, any[]> = {};
        Object.keys(pagesMap).forEach(chapterId => {
          finalPagesMap[chapterId] = Object.values(pagesMap[chapterId]).sort((a, b) => a.page_number - b.page_number);
        });
        
        setSelectorSeriesList(seriesList);
        setSelectorChaptersMap(finalChaptersMap);
        setSelectorPagesMap(finalPagesMap);

        // Auto-redirect if pageId is missing!
        if (!pageId) {
          let firstPageId = '';
          for (const series of seriesList) {
            const chapters = finalChaptersMap[series.series_id] || [];
            for (const ch of chapters) {
              const pgs = finalPagesMap[ch.chapter_id] || [];
              if (pgs.length > 0) {
                firstPageId = pgs[0].page_id;
                break;
              }
            }
            if (firstPageId) break;
          }
          if (firstPageId) {
            navigate(`/dashboard/assistant/drawing-studio?pageId=${firstPageId}`, { replace: true });
          } else {
            setLoading(false);
          }
        }
      } else {
        if (!pageId) setLoading(false);
      }
    } catch (e) {
      console.error('Lỗi khi tải danh sách nhiệm vụ làm bộ chọn:', e);
      if (!pageId) setLoading(false);
    }
  };

  const checkUnsavedStrokes = (): boolean => {
    if (strokes.length === 0) return false;
    const draftStr = localStorage.getItem(`mangaflow_drawing_draft_${pageId}`);
    if (!draftStr) {
      return strokes.length > 0;
    }
    try {
      const parsed = JSON.parse(draftStr);
      const savedStrokes = parsed.strokes || [];
      if (savedStrokes.length !== strokes.length) return true;
      return JSON.stringify(savedStrokes) !== JSON.stringify(strokes);
    } catch (e) {
      return true;
    }
  };

  const handlePageSwitch = (newPageId: string) => {
    if (!newPageId || newPageId === pageId) return;
    
    if (checkUnsavedStrokes()) {
      const confirmLeave = window.confirm(
        'Bạn có nét vẽ chưa lưu trên Canvas của trang hiện tại. Nếu chuyển trang, các thay đổi chưa lưu này sẽ bị mất.\n\nBạn có chắc chắn muốn chuyển trang không?'
      );
      if (!confirmLeave) {
        setSelPageId(pageId);
        return;
      }
    }
    
    setStrokes([]);
    setHistory([]);
    navigate(`/dashboard/assistant/drawing-studio?pageId=${newPageId}`);
  };

  const handleSeriesChange = (seriesId: string) => {
    setSelSeriesId(seriesId);
    const chapters = selectorChaptersMap[seriesId] || [];
    if (chapters.length > 0) {
      const firstChapterId = chapters[0].chapter_id;
      setSelChapterId(firstChapterId);
      
      const pages = selectorPagesMap[firstChapterId] || [];
      if (pages.length > 0) {
        const firstPageId = pages[0].page_id;
        setSelPageId(firstPageId);
        handlePageSwitch(firstPageId);
      } else {
        setSelChapterId('');
        setSelPageId('');
      }
    } else {
      setSelChapterId('');
      setSelPageId('');
    }
  };

  const handleChapterChange = (chapterId: string) => {
    setSelChapterId(chapterId);
    const pages = selectorPagesMap[chapterId] || [];
    if (pages.length > 0) {
      const firstPageId = pages[0].page_id;
      setSelPageId(firstPageId);
      handlePageSwitch(firstPageId);
    } else {
      setSelPageId('');
    }
  };

  const handlePageChange = (pId: string) => {
    setSelPageId(pId);
    handlePageSwitch(pId);
  };

  const getSeriesOptions = () => {
    const list = [...selectorSeriesList];
    const currentSeriesId = pageDetail?.chapter?.series_id;
    const currentSeriesTitle = pageDetail?.chapter?.series?.title || 'Bộ truyện hiện tại';
    
    if (currentSeriesId && !list.some(s => s.series_id === currentSeriesId)) {
      list.push({ series_id: currentSeriesId, title: currentSeriesTitle });
    }
    return list;
  };

  const getChapterOptions = () => {
    const list = selectorChaptersMap[selSeriesId] ? [...selectorChaptersMap[selSeriesId]] : [];
    const currentChapterId = pageDetail?.chapter_id;
    const currentChapterTitle = pageDetail?.chapter?.title || 'Chương hiện tại';
    const currentChapterNumber = pageDetail?.chapter?.chapter_number || 0;
    
    if (currentChapterId && !list.some(c => c.chapter_id === currentChapterId)) {
      list.push({ chapter_id: currentChapterId, title: currentChapterTitle, chapter_number: currentChapterNumber });
    }
    return list.sort((a, b) => a.chapter_number - b.chapter_number);
  };

  const getPageOptions = () => {
    const list = selectorPagesMap[selChapterId] ? [...selectorPagesMap[selChapterId]] : [];
    const currentPageId = pageDetail?.page_id;
    const currentPageNumber = pageDetail?.page_number || 0;
    
    if (currentPageId && !list.some(p => p.page_id === currentPageId)) {
      list.push({ page_id: currentPageId, page_number: currentPageNumber });
    }
    return list.sort((a, b) => a.page_number - b.page_number);
  };

  // 1. Fetch Page Detail & Set Up Workspace
  useEffect(() => {
    if (!pageId) {
      return;
    }
    loadPageData();
  }, [pageId]);

  const loadPageData = async () => {
    setLoading(true);
    try {
      // Automatically enable Mangaka Annotation layer (Vùng được giao) when page loads/switches
      setLayers(prev => ({
        ...prev,
        mangaka: true
      }));

      // Get detail
      const detail = await assistantService.getDrawingPageDetail(pageId);
      setPageDetail(detail);

      // Find active assistant task
      const stored = localStorage.getItem('mangaflow_user');
      const user = stored ? JSON.parse(stored) : null;
      const myTask = detail.page_task?.find((t: any) => t.assistant_id === user?.user_id && t.status !== 'completed')
        || detail.page_task?.[0];
      setActiveTask(myTask);

      // Map regions and associate with task details
      const mappedRegs = (detail.page_region || []).map((r: any, idx: number) => {
        const regionLabel = `Vùng ${idx + 1}`;
        const linkedTask = detail.page_task?.find((t: any) => {
          const isMine = t.assistant_id === user?.user_id;
          const matchId = t.region_id && t.region_id === r.region_id;
          const matchText = t.content && t.content.toLowerCase().includes(regionLabel.toLowerCase());
          return isMine && (matchId || matchText);
        }) || detail.page_task?.find((t: any) => {
          const matchId = t.region_id && t.region_id === r.region_id;
          const matchText = t.content && t.content.toLowerCase().includes(regionLabel.toLowerCase());
          return matchId || matchText;
        });
        
        // Việt hóa trạng thái nhiệm vụ tương ứng của vùng vẽ
        const getStatusLabel = (status?: string) => {
          if (!status) return 'Chưa làm';
          const s = status.toLowerCase();
          if (s === 'approved' || s === 'completed') return 'Đã xong';
          if (s === 'in_progress' || s === 'doing') return 'Đang làm';
          return 'Chưa làm';
        };

        return {
          id: r.region_id,
          name: regionLabel,
          type: linkedTask ? linkedTask.task_type.toUpperCase() : 'KHUNG HÌNH',
          status: getStatusLabel(linkedTask?.status),
          x: r.x || 0,
          y: r.y || 0,
          w: r.width || 100,
          h: r.height || 100,
          desc: linkedTask ? (linkedTask.content || linkedTask.description || '') : 'Khung được tác giả phân rã trên trang.'
        };
      });
      setRegions(mappedRegs);

      // Auto-focus and highlight the region assigned to the assistant's active task
      if (myTask?.region_id) {
        setActiveRegionId(myTask.region_id);
        const targetReg = mappedRegs.find((r: any) => r.id === myTask.region_id);
        if (targetReg) {
          setTimeout(() => {
            zoomToRegion(targetReg);
          }, 400);
        }
      } else if (mappedRegs.length > 0) {
        setActiveRegionId(mappedRegs[0].id);
        setTimeout(() => {
          zoomToRegion(mappedRegs[0]);
        }, 400);
      }

      // Resolve latest image url as background
      const sortedVersions = [...(detail.page_version || [])].sort(
        (a: any, b: any) => b.version_number - a.version_number
      );
      const latestImg = sortedVersions[0]?.image_url || detail.image_url || '';
      if (latestImg) {
        setBgImage(latestImg);
        const img = new Image();
        img.onload = () => setCanvasSize({ width: img.naturalWidth || 600, height: img.naturalHeight || 850 });
        img.src = getImageUrl(latestImg);
      } else {
        const fallbackUrl = "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=600&auto=format&fit=crop";
        setBgImage(fallbackUrl);
        setCanvasSize({ width: 600, height: 850 });
      }

      // Map feedbacks from annotations or feedbacks list
      const fbList = (detail.annotation || []).map((ann: any, idx: number) => {
        let regionName = 'Phản hồi chung';
        if (ann.region_id) {
          regionName = mappedRegs.find((reg: any) => reg.id === ann.region_id)?.name || 'Vùng chỉ định';
        } else if (ann.x !== undefined && ann.y !== undefined) {
          regionName = `Điểm số ${idx + 1} (vị trí: ${ann.x}%, ${ann.y}%)`;
        }
        return {
          id: ann.annotation_id || `fb-${idx}`,
          region: regionName,
          text: ann.content || '',
          date: new Date(ann.created_at).toLocaleDateString('vi-VN'),
          resolved: ann.status === 'resolved'
        };
      });
      setFeedbacks(fbList);

      // Sync selector dropdown selections to current page
      if (detail.chapter) {
        setSelSeriesId(detail.chapter.series_id || '');
        setSelChapterId(detail.chapter_id || '');
        setSelPageId(detail.page_id || '');
      }

      // Load draft strokes from LocalStorage for this specific page
      const draft = localStorage.getItem(`mangaflow_drawing_draft_${pageId}`);
      if (draft) {
        try {
          const parsed = JSON.parse(draft);
          if (parsed.strokes) setStrokes(parsed.strokes);
        } catch (e) {
          console.error('Lỗi đọc bản nháp nét vẽ:', e);
        }
      }

    } catch (err: any) {
      console.error(err);
      showToast('Không thể tải thông tin phòng vẽ.');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (url?: string | null) => {
    if (!url) return 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=600&auto=format&fit=crop';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
    const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    return `${apiURL}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  // --- Canvas Logic ---
  
  const getMousePos = (e: ReactMouseEvent | MouseEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / scale,
      y: (e.clientY - rect.top) / scale,
    };
  };

  const startDrawing = (e: ReactMouseEvent) => {
    if (tool === 'hand' || tool === 'select') {
      if (tool === 'hand') {
        setIsPanning(true);
        setLastPan({ x: e.clientX, y: e.clientY });
      } else if (tool === 'select') {
        // Find clicked region
        const pos = getMousePos(e);
        const canvas = canvasRef.current;
        const canvasW = canvas?.width || 600;
        const canvasH = canvas?.height || 850;

        const clickedRegion = regions.find(r => {
          const rx = (r.x / 100) * canvasW;
          const ry = (r.y / 100) * canvasH;
          const rw = (r.w / 100) * canvasW;
          const rh = (r.h / 100) * canvasH;
          return pos.x >= rx && pos.x <= rx + rw &&
                 pos.y >= ry && pos.y <= ry + rh;
        });
        if (clickedRegion) {
          setActiveRegionId(clickedRegion.id);
          setActiveTab('regions');
        } else {
          setActiveRegionId(null);
        }
      }
      return;
    }

    if (!layers.assistantQuickEdit) return; // Cannot draw if layer hidden

    const pos = getMousePos(e);

    if (tool === 'eraser') {
      setIsDrawing(true);
      setHistory([...history, strokes]); // Save history before erasing
      eraseStrokesNear(pos);
      return;
    }

    // Xử lý vẽ nhãn chữ (Text) và Ghim bình luận (Pin)
    if (tool === 'text') {
      const textVal = prompt('Nhập văn bản ghi chú:');
      if (!textVal) return;
      const newStroke: Stroke = {
        id: Date.now().toString(),
        tool: 'text',
        color,
        size: brushSize,
        points: [pos],
        text: textVal
      };
      setStrokes([...strokes, newStroke]);
      setHistory([...history, strokes]);
      return;
    }

    if (tool === 'pin') {
      const pinNote = prompt('Nhập nội dung ghim chú thích:');
      if (!pinNote) return;
      const newStroke: Stroke = {
        id: Date.now().toString(),
        tool: 'pin',
        color: '#E63946', // Ghim có màu đỏ nổi bật
        size: brushSize,
        points: [pos],
        text: pinNote
      };
      setStrokes([...strokes, newStroke]);
      setHistory([...history, strokes]);
      return;
    }

    setIsDrawing(true);
    const newStroke: Stroke = {
      id: Date.now().toString(),
      tool,
      color, 
      size: brushSize,
      points: [pos],
    };
    setCurrentStroke(newStroke);
  };

  const eraseStrokesNear = (pos: Point) => {
    const eraseRadius = Math.max(20, brushSize * 6); // forgiving erase radius
    const remainingStrokes = strokes.filter(stroke => {
      if (stroke.points.length === 0) return false;
      
      // For pen: check distance to any segment/point
      if (stroke.tool === 'pen') {
        const isNear = stroke.points.some(pt => {
          const dist = Math.sqrt((pt.x - pos.x) ** 2 + (pt.y - pos.y) ** 2);
          return dist <= eraseRadius;
        });
        return !isNear;
      }
      
      // For text, pin, rect, circle, arrow: check bounding box or start/end points
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      stroke.points.forEach(pt => {
        if (pt.x < minX) minX = pt.x;
        if (pt.x > maxX) maxX = pt.x;
        if (pt.y < minY) minY = pt.y;
        if (pt.y > maxY) maxY = pt.y;
      });

      // Pad the bounding box slightly
      const padding = eraseRadius;
      const insideBox = pos.x >= minX - padding && pos.x <= maxX + padding &&
                         pos.y >= minY - padding && pos.y <= maxY + padding;
                         
      return !insideBox;
    });

    if (remainingStrokes.length !== strokes.length) {
      setStrokes(remainingStrokes);
    }
  };

  const draw = (e: ReactMouseEvent) => {
    if (isPanning && containerRef.current) {
      const dx = e.clientX - lastPan.x;
      const dy = e.clientY - lastPan.y;
      containerRef.current.scrollLeft -= dx;
      containerRef.current.scrollTop -= dy;
      setLastPan({ x: e.clientX, y: e.clientY });
      return;
    }

    if (!isDrawing) return;

    if (tool === 'eraser') {
      const pos = getMousePos(e);
      eraseStrokesNear(pos);
      return;
    }

    if (!currentStroke) return;
    
    const pos = getMousePos(e);

    // Vẽ trực tiếp nét vẽ phân đoạn lên canvas ở thời gian thực (Zero-latency drawing feedback)
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && currentStroke.points.length > 0) {
      const prevPos = currentStroke.points[currentStroke.points.length - 1];
      ctx.beginPath();
      ctx.strokeStyle = currentStroke.color;
      ctx.lineWidth = currentStroke.size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      if (currentStroke.tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = currentStroke.size * 2;
      } else {
        ctx.globalCompositeOperation = 'source-over';
      }
      
      if (currentStroke.tool === 'pen' || currentStroke.tool === 'eraser') {
        ctx.moveTo(prevPos.x, prevPos.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      }
      ctx.globalCompositeOperation = 'source-over';
    }

    // Mutate trong mảng points để giữ hiệu năng cực cao mà không bắt React re-render liên tục khi rê chuột
    currentStroke.points.push(pos);
  };

  const stopDrawing = () => {
    setIsPanning(false);
    if (!isDrawing) return;
    
    setIsDrawing(false);
    if (tool === 'eraser') return;

    if (!currentStroke) return;
    
    const newStrokes = [...strokes, currentStroke];
    setStrokes(newStrokes);
    setHistory([...history, strokes]); // Lưu trạng thái phục vụ Undo
    setCurrentStroke(null);
  };

  // --- Touch Event Handlers cho thiết bị di động/máy tính bảng ---
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const simulatedEvent = {
        clientX: touch.clientX,
        clientY: touch.clientY,
      } as any;
      startDrawing(simulatedEvent);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const simulatedEvent = {
        clientX: touch.clientX,
        clientY: touch.clientY,
      } as any;
      draw(simulatedEvent);
    }
  };

  const handleTouchEnd = () => {
    stopDrawing();
  };

  const undo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setStrokes(previous);
    setHistory(history.slice(0, -1));
  };

  const clearCanvas = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ nét vẽ chỉnh sửa nhanh?')) {
      setHistory([...history, strokes]);
      setStrokes([]);
      showToast('Đã xóa nét vẽ chỉnh sửa nhanh.');
    }
  };

  // Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid if active
    if (showGrid) {
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      const gridSize = 50;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }
    }

    // Draw Manga Annotations (Regions)
    if (layers.mangaka) {
      regions.forEach(r => {
        // Convert percentage coordinates (0-100) to actual canvas pixels
        const rx = (r.x / 100) * canvas.width;
        const ry = (r.y / 100) * canvas.height;
        const rw = (r.w / 100) * canvas.width;
        const rh = (r.h / 100) * canvas.height;

        ctx.strokeStyle = r.id === activeRegionId ? '#E63946' : 'rgba(230, 57, 70, 0.5)';
        ctx.lineWidth = r.id === activeRegionId ? 4 : 2;
        ctx.setLineDash(r.id === activeRegionId ? [] : [5, 5]);
        
        ctx.strokeRect(rx, ry, rw, rh);
        
        // Background for active
        if (r.id === activeRegionId) {
          ctx.fillStyle = 'rgba(230, 57, 70, 0.1)';
          ctx.fillRect(rx, ry, rw, rh);
        }

        ctx.setLineDash([]);
        // Label
        ctx.fillStyle = r.id === activeRegionId ? '#E63946' : 'rgba(230, 57, 70, 0.7)';
        ctx.font = 'bold 12px Inter';
        const labelY = ry < 15 ? ry + 14 : ry - 6;
        ctx.fillText(r.name, rx, labelY);
      });
    }

    // Draw Assistant Quick Edits (Strokes)
    if (layers.assistantQuickEdit) {
      const allStrokes = currentStroke ? [...strokes, currentStroke] : strokes;
      
      allStrokes.forEach(stroke => {
        if (stroke.points.length === 0) return;
        
        ctx.beginPath();
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.size;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (stroke.tool === 'eraser') {
          ctx.globalCompositeOperation = 'destination-out';
          ctx.lineWidth = stroke.size * 2; // Eraser is bigger
        } else {
          ctx.globalCompositeOperation = 'source-over';
        }

        if (stroke.tool === 'pen' || stroke.tool === 'eraser') {
          ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
          for (let i = 1; i < stroke.points.length; i++) {
            ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
          }
          ctx.stroke();
        } else if (stroke.tool === 'rect') {
          const start = stroke.points[0];
          const end = stroke.points[stroke.points.length - 1];
          ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
        } else if (stroke.tool === 'circle') {
          const start = stroke.points[0];
          const end = stroke.points[stroke.points.length - 1];
          const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
          ctx.beginPath();
          ctx.arc(start.x, start.y, radius, 0, 2 * Math.PI);
          ctx.stroke();
        } else if (stroke.tool === 'arrow') {
          const start = stroke.points[0];
          const end = stroke.points[stroke.points.length - 1];
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(end.x, end.y);
          ctx.stroke();
          // Arrow head
          const angle = Math.atan2(end.y - start.y, end.x - start.x);
          ctx.beginPath();
          ctx.moveTo(end.x, end.y);
          ctx.lineTo(end.x - 10 * Math.cos(angle - Math.PI / 6), end.y - 10 * Math.sin(angle - Math.PI / 6));
          ctx.lineTo(end.x - 10 * Math.cos(angle + Math.PI / 6), end.y - 10 * Math.sin(angle + Math.PI / 6));
          ctx.lineTo(end.x, end.y);
          ctx.fillStyle = stroke.color;
          ctx.fill();
        } else if (stroke.tool === 'text') {
          const start = stroke.points[0];
          ctx.fillStyle = stroke.color;
          ctx.font = `bold ${stroke.size * 2 + 12}px sans-serif`;
          ctx.fillText(stroke.text || '', start.x, start.y);
        } else if (stroke.tool === 'pin') {
          const start = stroke.points[0];
          ctx.beginPath();
          ctx.arc(start.x, start.y, 10, 0, 2 * Math.PI);
          ctx.fillStyle = '#E63946';
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 11px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('!', start.x, start.y);

          ctx.fillStyle = '#18181b';
          ctx.font = 'bold 9px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(stroke.text || '', start.x, start.y + 18);
        }
        ctx.globalCompositeOperation = 'source-over';
      });
    }

  }, [strokes, currentStroke, regions, activeRegionId, layers, showGrid, pageDetail]);

  // --- Handlers ---
  const handleSaveDraft = () => {
    const draftData = {
      pageId,
      updatedAt: new Date().toISOString(),
      strokes
    };
    
    // Save draft strokes to localStorage
    localStorage.setItem(`mangaflow_drawing_draft_${pageId}`, JSON.stringify(draftData));
    showToast('Đã lưu nét vẽ nháp thành công!');
  };

  const drawStrokesToCtx = (ctx: CanvasRenderingContext2D) => {
    const allStrokes = strokes;
    allStrokes.forEach(stroke => {
      if (stroke.points.length === 0) return;
      
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (stroke.tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = stroke.size * 2;
      } else {
        ctx.globalCompositeOperation = 'source-over';
      }

      if (stroke.tool === 'pen' || stroke.tool === 'eraser') {
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (let i = 1; i < stroke.points.length; i++) {
          ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }
        ctx.stroke();
      } else if (stroke.tool === 'rect') {
        const start = stroke.points[0];
        const end = stroke.points[stroke.points.length - 1];
        ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
      } else if (stroke.tool === 'circle') {
        const start = stroke.points[0];
        const end = stroke.points[stroke.points.length - 1];
        const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
        ctx.beginPath();
        ctx.arc(start.x, start.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (stroke.tool === 'arrow') {
        const start = stroke.points[0];
        const end = stroke.points[stroke.points.length - 1];
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
        const angle = Math.atan2(end.y - start.y, end.x - start.x);
        ctx.beginPath();
        ctx.moveTo(end.x, end.y);
        ctx.lineTo(end.x - 10 * Math.cos(angle - Math.PI / 6), end.y - 10 * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(end.x - 10 * Math.cos(angle + Math.PI / 6), end.y - 10 * Math.sin(angle + Math.PI / 6));
        ctx.lineTo(end.x, end.y);
        ctx.fillStyle = stroke.color;
        ctx.fill();
      } else if (stroke.tool === 'text') {
        const start = stroke.points[0];
        ctx.fillStyle = stroke.color;
        ctx.font = `bold ${stroke.size * 2 + 12}px sans-serif`;
        ctx.fillText(stroke.text || '', start.x, start.y);
      } else if (stroke.tool === 'pin') {
        const start = stroke.points[0];
        ctx.beginPath();
        ctx.arc(start.x, start.y, 10, 0, 2 * Math.PI);
        ctx.fillStyle = '#E63946';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('!', start.x, start.y);

        ctx.fillStyle = '#18181b';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(stroke.text || '', start.x, start.y + 18);
      }
      ctx.globalCompositeOperation = 'source-over';
    });
  };

  const handleDownloadEditedImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    showToast('Đang xử lý hình ảnh ghép...');

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvasSize.width;
    tempCanvas.height = canvasSize.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        tempCtx.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height);
        drawStrokesToCtx(tempCtx);
        
        const dataURL = tempCanvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `page_${pageDetail?.page_number || 'draft'}_edited.png`;
        link.href = dataURL;
        link.click();
        showToast('Đã tải hình ảnh đã chỉnh sửa về máy!');
      } catch (err) {
        console.error('CORS or security error saving canvas:', err);
        // Fallback: download just the drawing strokes
        const fallbackCanvas = document.createElement('canvas');
        fallbackCanvas.width = canvasSize.width;
        fallbackCanvas.height = canvasSize.height;
        const fallbackCtx = fallbackCanvas.getContext('2d');
        if (fallbackCtx) {
          drawStrokesToCtx(fallbackCtx);
          const dataURL = fallbackCanvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.download = `page_${pageDetail?.page_number || 'draft'}_strokes_only.png`;
          link.href = dataURL;
          link.click();
          showToast('Tải ảnh vẽ thành công (chỉ có nét vẽ do giới hạn bảo mật ảnh nền).');
        }
      }
    };
    img.onerror = () => {
      // Fallback: download just the drawing strokes
      const fallbackCanvas = document.createElement('canvas');
      fallbackCanvas.width = canvasSize.width;
      fallbackCanvas.height = canvasSize.height;
      const fallbackCtx = fallbackCanvas.getContext('2d');
      if (fallbackCtx) {
        drawStrokesToCtx(fallbackCtx);
        const dataURL = fallbackCanvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `page_${pageDetail?.page_number || 'draft'}_strokes_only.png`;
        link.href = dataURL;
        link.click();
        showToast('Tải ảnh vẽ thành công (chỉ có nét vẽ).');
      }
    };
    img.src = getImageUrl(bgImage);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile(file);
      setIsUploading(true);
      try {
        const result = await uploadService.uploadSingle(file, 'submissions');
        setUploadedFileUrl(result.secure_url);
        setActiveTab('submit');
        showToast('Tải file vẽ lên máy chủ thành công!');
      } catch (err: any) {
        console.error(err);
        showToast('Không thể tải file vẽ lên server.');
        setUploadedFile(null);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSubmit = () => {
    if (!uploadedFileUrl) {
      showToast('Vui lòng tải lên file chỉnh sửa trước khi nộp!');
      return;
    }
    setShowSubmitModal(true);
  };

  const confirmSubmit = async () => {
    if (!activeTask) {
      showToast('Không có nhiệm vụ hoạt động để nộp kết quả.');
      return;
    }
    setIsSubmitting(true);
    try {
      await assistantService.createSubmission(activeTask.task_id, {
        file_url: uploadedFileUrl,
        submission_notes: submitNote
      });
      showToast('Nộp bản vẽ thành công!');
      setShowSubmitModal(false);
      setTimeout(() => {
        navigate('/dashboard/assistant/drawing');
      }, 1500);
    } catch (err: any) {
      console.error(err);
      showToast(`Gửi bài thất bại: ${err?.message || 'Lỗi hệ thống'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredRegions = regions.filter(r => regionFilter === 'Tất cả' || r.status === regionFilter);

  // Zoom to fit
  const fitToScreen = () => {
    setScale(1);
    if (containerRef.current) {
      containerRef.current.scrollLeft = 0;
      containerRef.current.scrollTop = 0;
    }
  };

  // Zoom to region
  const zoomToRegion = (r: MappedRegion) => {
    setActiveRegionId(r.id);
    // Center the region
    setScale(1.5);
    setTimeout(() => {
      if (containerRef.current && canvasRef.current) {
        const canvasW = canvasRef.current.width;
        const canvasH = canvasRef.current.height;
        const rx = (r.x / 100) * canvasW;
        const ry = (r.y / 100) * canvasH;
        const rw = (r.w / 100) * canvasW;
        const rh = (r.h / 100) * canvasH;

        const cx = (rx + rw / 2) * 1.5;
        const cy = (ry + rh / 2) * 1.5;
        containerRef.current.scrollLeft = cx - containerRef.current.clientWidth / 2;
        containerRef.current.scrollTop = cy - containerRef.current.clientHeight / 2;
      }
    }, 50);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-manga-red" />
        <p className="font-bold uppercase text-gray-500">Đang khởi tạo không gian vẽ...</p>
      </div>
    );
  }

  if (!pageId) {
    return (
      <div className="flex-1 bg-white border-4 border-manga-ink p-12 text-center shadow-[6px_6px_0px_rgba(0,0,0,1)] my-8 max-w-[800px] mx-auto flex flex-col items-center justify-center min-h-[300px]">
        <Pen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="font-manga text-2xl font-bold uppercase text-manga-ink">Không có phân công vẽ</h3>
        <p className="text-sm font-semibold text-gray-500 mt-2 max-w-md mx-auto">
          Hiện tại bạn chưa được giao bất kỳ vùng vẽ nào từ tác giả (Mangaka). Vui lòng đợi tác giả giao nhiệm vụ vẽ hoặc chỉnh sửa phác thảo.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full font-sans overflow-hidden">
      
      {/* Top Banner Note */}
      <div className="bg-amber-50 border-b border-amber-200 p-2 text-center text-xs font-bold text-amber-700 flex justify-center items-center gap-2 shrink-0">
        <AlertTriangle className="w-4 h-4" />
        Chỉnh sửa trên web chỉ dùng cho annotation và chỉnh sửa nhanh. Assistant có thể tải file về chỉnh sửa chuyên sâu bằng Clip Studio Paint rồi upload kết quả lại.
      </div>

      {/* Top Toolbar */}
      <div className="bg-white border-b-4 border-manga-ink p-4 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 shrink-0">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pb-1">
            {/* Quay lại Button */}
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 px-2.5 py-1 bg-white border-2 border-black font-black uppercase text-[10px] shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-[1px_1px_0px_rgba(0,0,0,1)] transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Quay lại
            </button>

            <span className="font-manga text-xl font-bold uppercase text-manga-red tracking-wide shrink-0">
              KHÔNG GIAN LÀM VIỆC —
            </span>
            
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm font-bold text-manga-ink">
              {/* Series Select */}
              <select
                value={selSeriesId}
                onChange={(e) => handleSeriesChange(e.target.value)}
                className="border-b-2 border-black border-t-0 border-l-0 border-r-0 pb-0.5 font-bold text-sm bg-transparent uppercase focus:outline-none cursor-pointer max-w-[200px] truncate"
              >
                {getSeriesOptions().map(s => (
                  <option key={s.series_id} value={s.series_id}>{s.title}</option>
                ))}
              </select>
              
              <span className="text-gray-400 font-bold shrink-0">/</span>
              
              {/* Chapter Select */}
              <select
                value={selChapterId}
                onChange={(e) => handleChapterChange(e.target.value)}
                disabled={getChapterOptions().length === 0}
                className="border-b-2 border-black border-t-0 border-l-0 border-r-0 pb-0.5 font-bold text-sm bg-transparent uppercase focus:outline-none disabled:opacity-50 cursor-pointer max-w-[200px] truncate"
              >
                {getChapterOptions().map(c => (
                  <option key={c.chapter_id} value={c.chapter_id}>CH.{c.chapter_number}: {c.title}</option>
                ))}
              </select>
              
              <span className="text-gray-400 font-bold shrink-0">/</span>
              
              {/* Page Select */}
              <select
                value={selPageId}
                onChange={(e) => handlePageChange(e.target.value)}
                disabled={getPageOptions().length === 0}
                className="border-b-2 border-black border-t-0 border-l-0 border-r-0 pb-0.5 font-bold text-sm bg-transparent uppercase focus:outline-none disabled:opacity-50 cursor-pointer"
              >
                {getPageOptions().map(p => (
                  <option key={p.page_id} value={p.page_id}>Trang {p.page_number}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-gray-500 mt-1">
            <span className="text-[#3b82f6] uppercase border border-[#3b82f6] px-1.5 py-0.5 rounded shrink-0">
              {activeTask ? activeTask.task_type.toUpperCase() : 'DRAWING'}
            </span>
            <span className="text-[#E63946] shrink-0">Hạn: {activeTask?.deadline ? new Date(activeTask.deadline).toLocaleDateString() : 'N/A'}</span>
          </div>
        </div>

        <div className="flex flex-wrap xl:flex-nowrap items-center justify-start xl:justify-end gap-2 shrink-0">
          <label className="flex items-center gap-1.5 px-3 py-2 bg-white border-2 border-manga-ink text-manga-ink font-bold text-xs uppercase hover:bg-gray-100 transition cursor-pointer animate-pulse" title="Tải ảnh máy bạn lên Canvas">
            <ImagePlus className="w-4 h-4" /> Đổi hình nền
            <input type="file" className="hidden" accept="image/*" onChange={(e) => {
              if(e.target.files?.[0]) {
                const url = URL.createObjectURL(e.target.files[0]);
                setBgImage(url);
                showToast('Đã đổi hình nền tạm thời.');
              }
            }} />
          </label>

          <a 
            href={getImageUrl(bgImage)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 bg-white border-2 border-manga-ink text-manga-ink font-bold text-xs uppercase hover:bg-gray-100 transition cursor-pointer"
          >
            <FileDown className="w-4 h-4" /> Tải file gốc
          </a>
          
          <button 
            onClick={handleSaveDraft}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border-2 border-manga-ink text-manga-ink font-bold text-xs uppercase hover:bg-gray-100 transition cursor-pointer"
          >
            <Save className="w-4 h-4" /> Lưu bản nháp nét vẽ
          </button>

          <button 
            onClick={handleDownloadEditedImage}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#457B9D] border-2 border-black text-white font-bold text-xs uppercase hover:bg-[#356280] transition cursor-pointer shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-[1px_1px_0px_rgba(0,0,0,1)]"
          >
            <FileImage className="w-4 h-4" /> Tải ảnh đã sửa
          </button>

          <label className={`flex items-center gap-1.5 px-3 py-2 bg-manga-ink border-2 border-manga-ink text-white font-bold text-xs uppercase hover:bg-gray-800 transition cursor-pointer ${isUploading ? 'opacity-50' : ''}`}>
            {isUploading ? 'Đang tải...' : 'Upload file sửa'}
            <input type="file" disabled={isUploading} className="hidden" accept="image/*,.psd" onChange={handleFileUpload} />
          </label>

          <button 
            onClick={handleSubmit}
            disabled={!uploadedFileUrl}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#E63946] border-2 border-black text-white font-bold text-xs uppercase hover:bg-red-600 transition shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Send className="w-4 h-4" /> Nộp cho Mangaka
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Toolbar */}
        <div className="w-16 bg-[#18181b] border-r-4 border-black flex flex-col items-center py-4 shrink-0 gap-2 z-10 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {/* Tools */}
          {[
            { id: 'select', icon: MousePointer2, title: 'Select/Move' },
            { id: 'hand', icon: Hand, title: 'Pan Canvas' },
            { id: 'pen', icon: Pen, title: 'Bút vẽ' },
            { id: 'eraser', icon: Eraser, title: 'Tẩy' },
            { id: 'rect', icon: Square, title: 'Vẽ hình chữ nhật' },
            { id: 'circle', icon: Circle, title: 'Vẽ hình tròn' },
            { id: 'arrow', icon: ArrowUpRight, title: 'Vẽ mũi tên' },
            { id: 'text', icon: Type, title: 'Ghi chú văn bản' },
            { id: 'pin', icon: MapPin, title: 'Ghim bình luận' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTool(t.id as ToolType)}
              title={t.title}
              className={`p-2.5 rounded transition cursor-pointer border-none ${tool === t.id ? 'bg-[#E63946] text-white' : 'text-gray-400 hover:text-white hover:bg-zinc-800'}`}
            >
              <t.icon className="w-5 h-5" />
            </button>
          ))}

          <div className="w-10 h-px bg-zinc-700 my-2" />

          {/* Color Picker */}
          {COLORS.map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-6 h-6 rounded-full border-2 transition cursor-pointer ${color === c ? 'border-white scale-110' : 'border-transparent'}`}
              style={{ backgroundColor: c }}
            />
          ))}

          <div className="w-10 h-px bg-zinc-700 my-2" />

          {/* Actions */}
          <button onClick={undo} title="Undo" className="p-2 text-gray-400 hover:text-white hover:bg-zinc-800 rounded cursor-pointer border-none bg-transparent">
            <Undo2 className="w-5 h-5" />
          </button>
          <button onClick={clearCanvas} title="Xóa tất cả nét vẽ" className="p-2 text-red-400 hover:text-red-300 hover:bg-zinc-800 rounded mt-auto cursor-pointer border-none bg-transparent">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        {/* Center Canvas */}
        <div className="flex-1 bg-[#27272a] relative flex flex-col min-w-0">
          
          {/* Zoom Controls Overlay (Fixed relative to the canvas area) */}
          <div className="absolute bottom-4 left-4 bg-zinc-900 border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-white flex items-center z-30">
            <button onClick={() => setScale(s => Math.max(0.5, s - 0.2))} className="p-2 hover:bg-zinc-800 border-r border-zinc-700 cursor-pointer bg-transparent text-white border-none"><ZoomOut className="w-4 h-4" /></button>
            <span className="text-xs font-bold px-3">{Math.round(scale * 100)}%</span>
            <button onClick={() => setScale(s => Math.min(3, s + 0.2))} className="p-2 hover:bg-zinc-800 border-l border-zinc-700 cursor-pointer bg-transparent text-white border-none"><ZoomIn className="w-4 h-4" /></button>
            <button onClick={fitToScreen} title="Fit to screen" className="p-2 hover:bg-zinc-800 border-l border-zinc-700 cursor-pointer bg-transparent text-white border-none"><Maximize className="w-4 h-4" /></button>
            <button onClick={() => setShowGrid(!showGrid)} title="Toggle Grid" className={`p-2 hover:bg-zinc-800 border-l border-zinc-700 cursor-pointer bg-transparent border-none ${showGrid ? 'text-[#E63946]' : 'text-white'}`}><Grid className="w-4 h-4" /></button>
          </div>

          {/* Scrollable Container */}
          <div 
            className={`flex-1 overflow-auto outline-none ${tool === 'hand' ? (isPanning ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-crosshair'}`}
            ref={containerRef}
            onWheel={(e) => {
              if (e.ctrlKey) {
                e.preventDefault();
                setScale(s => Math.min(Math.max(0.5, s - e.deltaY * 0.01), 3));
              }
            }}
          >
            {/* Wrapper to ensure scaling has padding and triggers scrollbars */}
            <div className="min-w-full min-h-full flex items-center justify-center p-12">
              
              {/* Sized container that matches the scaled canvas size */}
              <div 
                style={{ width: canvasSize.width * scale, height: canvasSize.height * scale }} 
                className="relative shadow-[0_0_20px_rgba(0,0,0,0.5)] bg-white"
              >
                {/* Inner element that applies the CSS scale transform */}
                <div 
                  className="absolute top-0 left-0 origin-top-left"
                  style={{ transform: `scale(${scale})`, width: canvasSize.width, height: canvasSize.height }}
                >
                  {/* Manga Page Background */}
                  {layers.original && (
                    <img 
                      src={getImageUrl(bgImage)} 
                      alt="Manga Page"
                      className="absolute inset-0 w-full h-full object-contain opacity-80 select-none pointer-events-none grayscale"
                    />
                  )}

                  {/* Interactive Canvas */}
                   <canvas
                    ref={canvasRef}
                    width={canvasSize.width}
                    height={canvasSize.height}
                    className="absolute inset-0 z-10 w-full h-full"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onTouchCancel={handleTouchEnd}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-80 bg-white border-l-4 border-black flex flex-col shrink-0 z-20">
          
          {/* Tabs */}
          <div className="flex border-b-2 border-gray-200 bg-white">
            <button onClick={() => setActiveTab('regions')} className={`flex-1 py-3 text-[10px] font-black uppercase flex flex-col items-center justify-center gap-1 cursor-pointer border-none transition ${activeTab === 'regions' ? 'bg-manga-ink text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
              <ListTodo className="w-4 h-4" /> Vùng của tôi
            </button>
            <button onClick={() => setActiveTab('layers')} className={`flex-1 py-3 text-[10px] font-black uppercase flex flex-col items-center justify-center gap-1 cursor-pointer border-none transition ${activeTab === 'layers' ? 'bg-manga-ink text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
              <Layers className="w-4 h-4" /> Lớp hiển thị
            </button>
            <button onClick={() => setActiveTab('feedback')} className={`flex-1 py-3 text-[10px] font-black uppercase flex flex-col items-center justify-center gap-1 relative cursor-pointer border-none transition ${activeTab === 'feedback' ? 'bg-manga-ink text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
              <MessageSquare className="w-4 h-4" /> Phản hồi
              {feedbacks.length > 0 && <span className="absolute top-2 right-4 w-2 h-2 bg-[#E63946] rounded-full"></span>}
            </button>
            <button onClick={() => setActiveTab('submit')} className={`flex-1 py-3 text-[10px] font-black uppercase flex flex-col items-center justify-center gap-1 cursor-pointer border-none transition ${activeTab === 'submit' ? 'bg-manga-ink text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
              <FileImage className="w-4 h-4" /> Nộp bài
            </button>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            
            {/* --- REGIONS TAB --- */}
            {activeTab === 'regions' && (
              <div className="space-y-4">
                <select 
                  className="w-full border-2 border-black p-2 text-xs font-bold uppercase cursor-pointer focus:outline-none focus:border-[#E63946]"
                  value={regionFilter}
                  onChange={(e) => setRegionFilter(e.target.value)}
                >
                  <option>Tất cả</option>
                  <option>Chưa làm</option>
                  <option>Đang làm</option>
                  <option>Đã xong</option>
                </select>

                <div className="space-y-3">
                  {filteredRegions.map(r => (
                    <div 
                      key={r.id} 
                      className={`border-2 p-3 bg-white cursor-pointer transition ${activeRegionId === r.id ? 'border-[#E63946] shadow-[2px_2px_0px_0px_#E63946]' : 'border-black hover:border-gray-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'}`}
                      onClick={() => zoomToRegion(r)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-extrabold text-xs text-manga-ink uppercase leading-tight">{r.name}</h4>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 border ${
                          r.status === 'Đã xong' ? 'bg-emerald-100 text-emerald-700 border-emerald-300' :
                          r.status === 'Đang làm' ? 'bg-blue-100 text-blue-700 border-blue-300' :
                          'bg-amber-100 text-amber-700 border-amber-300'
                        }`}>{r.status}</span>
                      </div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase mb-2 border-b border-gray-100 pb-2">{r.type}</p>
                      <p className="text-xs text-gray-700 mb-3 leading-snug">{r.desc}</p>
                      
                      {/* Change Status */}
                      <select 
                        className="w-full border border-gray-300 p-1.5 text-xs font-bold cursor-pointer hover:border-[#E63946] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        value={r.status}
                        disabled={r.status === 'Đã xong'}
                        onChange={async (e) => {
                          const newStatus = e.target.value;
                          const newRegions = regions.map(reg => reg.id === r.id ? { ...reg, status: newStatus as any } : reg);
                          setRegions(newRegions);

                          // Find matching task and update status in database
                          const regionLabel = r.name;
                          const task = pageDetail?.page_task?.find((t: any) => {
                            if (t.region_id && t.region_id === r.id) return true;
                            if (t.content && t.content.toLowerCase().includes(regionLabel.toLowerCase())) return true;
                            return false;
                          });

                          if (task) {
                            try {
                              if (newStatus === 'Đang làm') {
                                await assistantService.startTask(task.task_id);
                                showToast(`Đã bắt đầu làm nhiệm vụ [${regionLabel}]!`);
                              } else if (newStatus === 'Chưa làm') {
                                await assistantService.holdTaskWorkflow(task.task_id);
                                showToast(`Đã tạm dừng nhiệm vụ [${regionLabel}].`);
                              }
                              // Refresh details to sync all states
                              const detail = await assistantService.getDrawingPageDetail(pageId);
                              setPageDetail(detail);
                            } catch (err: any) {
                              console.error(err);
                              showToast('Không thể cập nhật trạng thái nhiệm vụ lên máy chủ.');
                            }
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {r.status === 'Đã xong' && <option value="Đã xong">Đã xong</option>}
                        <option value="Chưa làm" disabled={r.status === 'Đang làm'}>Chưa làm</option>
                        <option value="Đang làm">Đang làm</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* --- LAYERS TAB --- */}
            {activeTab === 'layers' && (
              <div className="space-y-3">
                <div className="border-2 border-black bg-white p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex justify-between items-center hover:border-gray-600 transition">
                  <div>
                    <h4 className="font-bold text-sm uppercase">Bản thảo truyện gốc</h4>
                    <p className="text-[10px] text-gray-500">Original Manuscript</p>
                  </div>
                  <input type="checkbox" checked={layers.original} onChange={(e) => setLayers({...layers, original: e.target.checked})} className="w-4 h-4 accent-[#E63946] cursor-pointer" />
                </div>
                
                <div className="border-2 border-black bg-white p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex justify-between items-center hover:border-gray-600 transition">
                  <div>
                    <h4 className="font-bold text-sm uppercase text-[#E63946]">Vùng được giao</h4>
                    <p className="text-[10px] text-gray-500">Mangaka Annotation</p>
                  </div>
                  <input type="checkbox" checked={layers.mangaka} onChange={(e) => setLayers({...layers, mangaka: e.target.checked})} className="w-4 h-4 accent-[#E63946] cursor-pointer" />
                </div>

                <div className="border-2 border-black bg-white p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex justify-between items-center hover:border-gray-600 transition">
                  <div>
                    <h4 className="font-bold text-sm uppercase text-[#3B82F6]">Nét vẽ chỉnh sửa</h4>
                    <p className="text-[10px] text-gray-500">Assistant Quick Edit</p>
                  </div>
                  <input type="checkbox" checked={layers.assistantQuickEdit} onChange={(e) => setLayers({...layers, assistantQuickEdit: e.target.checked})} className="w-4 h-4 accent-[#E63946] cursor-pointer" />
                </div>
                
                <div className="border-2 border-black bg-white p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex justify-between items-center opacity-50">
                  <div>
                    <h4 className="font-bold text-sm uppercase text-[#F59E0B]">Ghi chú Pin</h4>
                    <p className="text-[10px] text-gray-500">Assistant Notes</p>
                  </div>
                  <input type="checkbox" disabled checked={layers.assistantNotes} onChange={(e) => setLayers({...layers, assistantNotes: e.target.checked})} className="w-4 h-4 accent-[#E63946] cursor-not-allowed" />
                </div>
              </div>
            )}

            {/* --- FEEDBACK TAB --- */}
            {activeTab === 'feedback' && (
              <div className="space-y-4">
                {feedbacks.length === 0 ? (
                  <p className="text-xs font-bold text-gray-400 text-center">Chưa có phản hồi hay chỉnh sửa nào.</p>
                ) : (
                  feedbacks.map(f => (
                    <div key={f.id} className={`border-2 border-black p-4 bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition ${f.resolved ? 'opacity-60 resolved grayscale' : 'border-l-4 border-l-[#E63946]'}`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-black uppercase text-[#E63946]">Ý kiến từ Mangaka</span>
                        <span className="text-[10px] font-bold text-gray-400">{f.date}</span>
                      </div>
                      <h4 className="font-bold text-xs uppercase mb-2">Vùng: {f.region}</h4>
                      <p className="text-sm italic text-gray-700 bg-gray-50 p-2 border border-gray-200 mb-3">{f.text}</p>
                      <button 
                        onClick={async () => {
                          try {
                            if (!f.id.startsWith('fb-')) {
                              await api.patch(`/api/annotations/${f.id}/status`, { status: 'resolved' })
                            }
                            setFeedbacks(feedbacks.map(fb => fb.id === f.id ? {...fb, resolved: true} : fb))
                          } catch (err) {
                            console.error('Failed to resolve annotation status:', err)
                          }
                        }}
                        disabled={f.resolved}
                        className="w-full text-xs font-bold border-2 border-black p-2 uppercase hover:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-400 cursor-pointer disabled:cursor-not-allowed transition"
                      >
                        {f.resolved ? 'Đã xử lý' : 'Đánh dấu đã xử lý'}
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* --- SUBMIT TAB --- */}
            {activeTab === 'submit' && (
              <div className="space-y-4">
                <div className="bg-white border-2 border-black p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <h3 className="font-bold text-sm uppercase mb-3 border-b-2 border-manga-ink pb-2">File Chỉnh Sửa</h3>
                  
                  {uploadedFileUrl ? (
                    <div className="mb-4">
                      <div className="border border-dashed border-gray-300 bg-gray-50 h-32 flex items-center justify-center text-xs text-gray-500 mb-2 overflow-hidden">
                         <img src={getImageUrl(uploadedFileUrl)} alt="preview" className="max-w-full max-h-full object-contain" />
                      </div>
                      <p className="text-[10px] font-bold text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> {uploadedFile?.name || 'file_edit.psd'}</p>
                      <button onClick={() => {
                        setUploadedFile(null);
                        setUploadedFileUrl('');
                      }} className="text-[10px] text-[#E63946] underline mt-1 cursor-pointer font-bold border-none bg-transparent">Xóa file</button>
                    </div>
                  ) : (
                    <div className="mb-4 text-center border-2 border-dashed border-gray-300 p-4">
                      <p className="text-xs text-gray-500 mb-2">Bạn chưa tải lên file chỉnh sửa ngoài (Clip Studio Paint).</p>
                      <label className="inline-block text-[10px] uppercase font-bold bg-manga-ink text-white px-3 py-1.5 cursor-pointer hover:bg-gray-800 transition">
                        Chọn File Upload
                        <input type="file" className="hidden" accept="image/*,.psd" onChange={handleFileUpload} />
                      </label>
                      <p className="text-[10px] text-gray-400 mt-2 font-bold italic">Hoặc bạn có thể nộp trực tiếp các thay đổi vẽ trên Web!</p>
                    </div>
                  )}

                  <h3 className="font-bold text-sm uppercase mb-2">Ghi chú gửi Sensei</h3>
                  <textarea 
                    value={submitNote}
                    onChange={(e) => setSubmitNote(e.target.value)}
                    className="w-full border-2 border-black p-2 text-sm h-24 mb-3 focus:outline-none focus:border-[#E63946] font-sans"
                    placeholder="Mô tả các phần đã làm (Ví dụ: Em đã chỉnh phần nét đứt trên tường đá...)"
                  />

                  <label className="flex items-start gap-2 mb-4 cursor-pointer">
                    <input type="checkbox" checked={confirmChecked} onChange={(e) => setConfirmChecked(e.target.checked)} className="mt-1 w-4 h-4 accent-[#E63946]" />
                    <span className="text-xs font-bold text-gray-600 leading-tight">Tôi xác nhận đã hoàn thành các vùng được giao và kiểm tra kỹ chất lượng.</span>
                  </label>

                  <button 
                    onClick={handleSubmit}
                    disabled={!confirmChecked || !uploadedFileUrl}
                    className="w-full bg-[#E63946] text-white border-2 border-black font-black uppercase py-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                  >
                    Nộp kết quả
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white border-4 border-black w-full max-w-md shadow-[8px_8px_0px_0px_rgba(230,57,70,1)] animate-zoom-in">
            <div className="bg-manga-ink p-4 text-white flex justify-between items-center">
              <h3 className="font-manga text-xl uppercase font-bold tracking-wide">Xác nhận Nộp Bài</h3>
              <button onClick={() => setShowSubmitModal(false)} className="hover:text-[#E63946] transition cursor-pointer bg-transparent border-none text-white"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-6">
              <p className="font-bold mb-4 text-gray-800">Bạn sắp nộp bài cho nhiệm vụ này.</p>
              <div className="bg-gray-50 p-4 text-sm mb-6 border border-gray-200 shadow-inner">
                <p className="mb-2"><strong className="text-gray-900 uppercase text-xs">Phân cảnh:</strong> <span className="font-bold text-gray-700">Trang {pageDetail?.page_number}</span></p>
                <p className="mb-2"><strong className="text-gray-900 uppercase text-xs">Vùng nhiệm vụ:</strong> <span className="font-bold text-emerald-600">{regions.filter(r => r.status === 'Đã xong').length} / {regions.length} hoàn thành</span></p>
                <p><strong className="text-gray-900 uppercase text-xs block mb-1">Ghi chú:</strong> <span className="italic text-gray-600">{submitNote || '(Không có ghi chú)'}</span></p>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setShowSubmitModal(false)} className="flex-1 py-3 border-2 border-black font-bold text-xs uppercase hover:bg-gray-150 transition">Hủy</button>
                <button 
                  onClick={confirmSubmit} 
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-[#E63946] text-white border-2 border-black font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-red-600 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isSubmitting ? 'Đang gửi...' : 'Xác nhận nộp'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
