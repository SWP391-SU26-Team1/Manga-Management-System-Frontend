
// --- Types & Interfaces ---

export interface Series {
  id: string;
  title: string;
  description: string;
  tags: string[];
  coverUrl: string | null;
  status: "Draft" | "In Production" | "Waiting Review" | "Published";
  createdAt: string;
  nextDeadline: string;
}

export interface Chapter {
  id: string;
  seriesId: string;
  chapterNumber: number;
  title: string;
  deadline: string;
  totalPages: number;
  status: "Draft" | "Sketching" | "Drawing" | "Waiting Review" | "Completed";
}

export interface MangaPage {
  id: string;
  chapterId: string;
  pageNumber: number;
  thumbnailUrl: string;
  panelFrameStatus: "Not Started" | "Doing" | "Submitted" | "Need Fix" | "Approved";
  lineArtStatus: "Not Started" | "Doing" | "Submitted" | "Need Fix" | "Approved";
  speechBalloonStatus: "Not Started" | "Doing" | "Submitted" | "Need Fix" | "Approved";
  backgroundStatus: "Not Started" | "Doing" | "Submitted" | "Need Fix" | "Approved";
  assetStatus: "Not Started" | "Doing" | "Submitted" | "Need Fix" | "Approved";
  assistantSubmissionStatus: "Not Started" | "Doing" | "Submitted" | "Need Fix" | "Approved";
  overallStatus: "Not Started" | "Doing" | "Submitted" | "Need Fix" | "Approved";
}

export interface LayerTask {
  id: string;
  chapterId: string;
  pageId: string;
  layerType: "Panel Frame" | "Line Art" | "Speech Balloon" | "Background" | "Reference Asset" | "SFX" | "Assistant Submission";
  assignedTo: string; // Assistant name
  deadline: string;
  status: "Not Started" | "Doing" | "Submitted" | "Need Fix" | "Approved";
  note: string;
  priority: "Low" | "Medium" | "High" | "Urgent";
  regions?: any[];
}

export interface Assistant {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
  currentTasksCount: number;
  pendingSubmissionsCount: number;
  status: "Đang làm" | "Chờ duyệt" | "Nghỉ ngơi";
}

export interface AssistantSubmission {
  id: string;
  submissionId?: string;
  assistantName: string;
  chapterTitle: string;
  pageNumber: number;
  layerType: string;
  submittedAt: string;
  fileName: string;
  previewUrl: string;
  note: string;
  status: "Pending" | "Need Fix" | "Approved";
  originalImageUrl?: string;
}

export interface AssetItem {
  id: string;
  name: string;
  type: "Character" | "Background" | "Props" | "SFX" | "Tone" | "Style Guide";
  seriesId: string;
  uploadedBy: string;
  uploadedAt: string;
  fileUrl: string;
  note: string;
}

export interface RankingStat {
  id: string;
  seriesId: string;
  seriesTitle: string;
  rankWeekly: number;
  views: string;
  likes: string;
  comments: string;
  followers: string;
  rating: number;
  performanceStats?: { tasksCompleted: number; onTimeRate: number; averageRating: number };
  rankChange: number; // positive = up, negative = down, 0 = same
  hotChapter: string;
}

export interface EditorFeedback {
  id: string;
  sender: string;
  seriesId: string;
  seriesTitle: string;
  chapterNumber?: number;
  pageNumber?: number;
  pageId?: string;
  isAnnotation?: boolean;
  isNotification?: boolean;
  content: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  status: "Open" | "Resolved";
  createdAt: string;
}


export interface BoardReview {
  id: string;
  seriesId: string;
  chapterId: string;
  submittedAt: string;
  status: "Waiting" | "Approved" | "Need Fix";
  feedback?: string;
}

export interface RiskAlert {
  id: string;
  seriesId: string;
  level: "High" | "Medium" | "Low";
  message: string;
  createdAt: string;
  isRead: boolean;
}

export interface RecoveryProposal {
  id: string;
  seriesId: string;
  proposalText: string;
  submittedAt: string;
  status: "Pending" | "Reviewed";
}

export interface Notification {
  id: string;
  type: "Assistant" | "Editor" | "Board" | "Ranking" | "System";
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  link?: string;
}

export interface SubmissionComment {
  id: string;
  x: number;
  y: number;
  text: string;
  createdAt: string;
}

// --- Initial Mock Data ---

const INITIAL_SERIES: Series[] = [
  {
    id: "ser_001",
    title: "Ánh sáng nơi chân trời",
    description: "Một cậu bé khám phá ra thế giới kỳ diệu thông qua âm thanh và các sinh vật huyền bí trong rừng thẳm.",
    tags: ["Action", "Fantasy", "Shonen"],
    coverUrl: "https://images.unsplash.com/photo-1601850494422-3cf14624b0b3?q=80&w=400&auto=format&fit=crop",
    status: "In Production",
    createdAt: "2026-01-10",
    nextDeadline: "2026-05-27",
  },
  {
    id: "ser_002",
    title: "Huyền thoại rồng đen",
    description: "Hành trình phục thù của hiệp sĩ rồng cuối cùng chống lại đế chế bóng tối cổ xưa.",
    tags: ["Adventure", "Martial Arts", "Seinen"],
    coverUrl: "https://images.unsplash.com/photo-1635805737707-575885ab0820?q=80&w=400&auto=format&fit=crop",
    status: "Published",
    createdAt: "2025-05-15",
    nextDeadline: "Hoàn thành",
  },
  {
    id: "ser_003",
    title: "Đường phố đêm",
    description: "Những vụ án bí ẩn và đầy kịch tính diễn ra dưới ánh đèn neon của thành phố tương lai.",
    tags: ["Mystery", "Sci-Fi", "Drama"],
    coverUrl: null,
    status: "Draft",
    createdAt: "2026-05-18",
    nextDeadline: "2026-05-30",
  },
  {
    id: "ser_004",
    title: "Bí mật học đường",
    description: "Chuyện tình cảm ấm áp xen lẫn yếu tố trinh thám học đường đầy bất ngờ.",
    tags: ["Comedy", "School Life", "Romance"],
    coverUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=400&auto=format&fit=crop",
    status: "In Production",
    createdAt: "2026-02-20",
    nextDeadline: "2026-06-05",
  },
  {
    id: "ser_005",
    title: "Tiến Sĩ Đá (Dr. Stone)",
    description: "Một ngày nọ, toàn bộ nhân loại bị hóa đá bởi một ánh sáng kỳ lạ. Hàng ngàn năm sau, cậu học sinh thiên tài Senku thức tỉnh và quyết định dùng khoa học để khôi phục văn minh nhân loại.",
    tags: ["Sci-Fi", "Adventure", "Shonen"],
    coverUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=400&auto=format&fit=crop",
    status: "In Production",
    createdAt: "2025-10-10",
    nextDeadline: "2026-06-15",
  },
];

const INITIAL_CHAPTERS: Chapter[] = [
  {
    id: "ch_042",
    seriesId: "ser_001",
    chapterNumber: 42,
    title: "Cuộc đụng độ",
    deadline: "2026-04-30",
    totalPages: 24,
    status: "Completed",
  },
  {
    id: "ch_043",
    seriesId: "ser_001",
    chapterNumber: 43,
    title: "Bí mật lộ diện",
    deadline: "2026-05-10",
    totalPages: 20,
    status: "Drawing",
  },
  {
    id: "ch_044",
    seriesId: "ser_001",
    chapterNumber: 44,
    title: "Khai mở phong ấn",
    deadline: "2026-05-20",
    totalPages: 22,
    status: "Drawing",
  },
  {
    id: "ch_045",
    seriesId: "ser_001",
    chapterNumber: 45,
    title: "Hắc phong hành",
    deadline: "2026-05-27",
    totalPages: 18,
    status: "Sketching",
  },
];

const INITIAL_PAGES: MangaPage[] = [
  {
    id: "pg_001",
    chapterId: "ch_043",
    pageNumber: 1,
    thumbnailUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&auto=format&fit=crop",
    panelFrameStatus: "Approved",
    lineArtStatus: "Approved",
    speechBalloonStatus: "Approved",
    backgroundStatus: "Approved",
    assetStatus: "Approved",
    assistantSubmissionStatus: "Approved",
    overallStatus: "Approved",
  },
  {
    id: "pg_002",
    chapterId: "ch_043",
    pageNumber: 2,
    thumbnailUrl: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=200&auto=format&fit=crop",
    panelFrameStatus: "Approved",
    lineArtStatus: "Doing",
    speechBalloonStatus: "Not Started",
    backgroundStatus: "Not Started",
    assetStatus: "Not Started",
    assistantSubmissionStatus: "Not Started",
    overallStatus: "Doing",
  },
  {
    id: "pg_003",
    chapterId: "ch_044",
    pageNumber: 1,
    thumbnailUrl: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=200&auto=format&fit=crop",
    panelFrameStatus: "Approved",
    lineArtStatus: "Approved",
    speechBalloonStatus: "Approved",
    backgroundStatus: "Submitted",
    assetStatus: "Approved",
    assistantSubmissionStatus: "Submitted",
    overallStatus: "Submitted",
  },
  {
    id: "pg_004",
    chapterId: "ch_045",
    pageNumber: 1,
    thumbnailUrl: "https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=200&auto=format&fit=crop",
    panelFrameStatus: "Doing",
    lineArtStatus: "Not Started",
    speechBalloonStatus: "Not Started",
    backgroundStatus: "Not Started",
    assetStatus: "Not Started",
    assistantSubmissionStatus: "Not Started",
    overallStatus: "Not Started",
  },
];

const INITIAL_TASKS: LayerTask[] = [
  {
    id: "task_001",
    chapterId: "ch_044",
    pageId: "pg_003",
    layerType: "Background",
    assignedTo: "Sato",
    deadline: "2026-05-18",
    status: "Submitted",
    note: "Vẽ nền thành cổ đổ nát sau làn khói bụi.",
    priority: "High",
  },
  {
    id: "task_002",
    chapterId: "ch_043",
    pageId: "pg_002",
    layerType: "Line Art",
    assignedTo: "Tanaka",
    deadline: "2026-05-22",
    status: "Doing",
    note: "Đi nét chi tiết bộ giáp của nhân vật chính.",
    priority: "Medium",
  },
  {
    id: "task_003",
    chapterId: "ch_045",
    pageId: "pg_004",
    layerType: "Panel Frame",
    assignedTo: "Kenji",
    deadline: "2026-05-25",
    status: "Not Started",
    note: "Chia khung trang 1 theo kịch bản phân cảnh.",
    priority: "Low",
  },
];

const INITIAL_ASSISTANTS: Assistant[] = [
  {
    id: "as_001",
    name: "Tanaka",
    role: "Line Art",
    avatarUrl: "https://i.pravatar.cc/150?u=assistant_ken",
    currentTasksCount: 1,
    pendingSubmissionsCount: 0,
    status: "Đang làm",
  },
  {
    id: "as_002",
    name: "Sato",
    role: "Background",
    avatarUrl: "https://i.pravatar.cc/150?u=assistant_2",
    currentTasksCount: 1,
    pendingSubmissionsCount: 1,
    status: "Chờ duyệt",
  },
  {
    id: "as_003",
    name: "Kenji",
    role: "Effects & SFX",
    avatarUrl: "https://i.pravatar.cc/150?u=assistant_3",
    currentTasksCount: 1,
    pendingSubmissionsCount: 0,
    status: "Nghỉ ngơi",
  },
];

const INITIAL_SUBMISSIONS: AssistantSubmission[] = [
  {
    id: "sub_001",
    assistantName: "Sato",
    chapterTitle: "Khai mở phong ấn (CH.44)",
    pageNumber: 1,
    layerType: "Background",
    submittedAt: "2026-05-19T10:00:00Z",
    fileName: "bg_ch44_page1_final.png",
    previewUrl: "https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=600&auto=format&fit=crop",
    note: "Gửi Sensei nền vẽ thành cổ đã hoàn thiện nét và đánh bóng nhẹ. Nhờ Sensei duyệt giúp em!",
    status: "Pending",
  },
  {
    id: "sub_002",
    assistantName: "Tanaka",
    chapterTitle: "Bí mật lộ diện (CH.43)",
    pageNumber: 1,
    layerType: "Line Art",
    submittedAt: "2026-05-15T14:30:00Z",
    fileName: "lineart_ch43_p1.png",
    previewUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=600&auto=format&fit=crop",
    note: "Em gửi line-art trang 1 ạ.",
    status: "Approved",
  },
];

const INITIAL_ASSETS: AssetItem[] = [
  {
    id: "asset_001",
    name: "Tạo hình nhân vật Haru",
    type: "Character",
    seriesId: "ser_001",
    uploadedBy: "Mangaka",
    uploadedAt: "2026-01-12",
    fileUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop",
    note: "Thiết kế xoay 3 góc của nhân vật chính Haru.",
  },
  {
    id: "asset_002",
    name: "Concept thành cổ đổ nát",
    type: "Background",
    seriesId: "ser_001",
    uploadedBy: "Mangaka",
    uploadedAt: "2026-02-15",
    fileUrl: "https://images.unsplash.com/photo-1601850494422-3cf14624b0b3?q=80&w=600&auto=format&fit=crop",
    note: "Tham khảo kiến trúc thành trì trung cổ.",
  },
  {
    id: "asset_003",
    name: "Sách hướng dẫn vẽ hiệu ứng gió",
    type: "Style Guide",
    seriesId: "ser_001",
    uploadedBy: "Mangaka",
    uploadedAt: "2026-03-01",
    fileUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&auto=format&fit=crop",
    note: "Hướng dẫn vẽ nét chuyển động gió giật mạnh và SFX tương ứng.",
  },
];

const INITIAL_RANKINGS: RankingStat[] = [
  {
    id: "rank_001",
    seriesId: "ser_001",
    seriesTitle: "Ánh sáng nơi chân trời",
    rankWeekly: 3,
    views: "1.2M",
    likes: "45K",
    comments: "12K",
    followers: "50K",
    rating: 9.2,
    rankChange: 2, // Tăng 2 bậc
    hotChapter: "CH.43",
  },
  {
    id: "rank_002",
    seriesId: "ser_002",
    seriesTitle: "Huyền thoại rồng đen",
    rankWeekly: 1,
    views: "2.5M",
    likes: "110K",
    comments: "35K",
    followers: "120K",
    rating: 9.6,
    rankChange: 0,
    hotChapter: "CH.100",
  },
  {
    id: "rank_004",
    seriesId: "ser_004",
    seriesTitle: "Bí mật học đường",
    rankWeekly: 8,
    views: "800K",
    likes: "28K",
    comments: "8.5K",
    followers: "30K",
    rating: 8.1,
    rankChange: -2, // Giảm 2 bậc
    hotChapter: "CH.20",
  },
];

const INITIAL_FEEDBACKS: EditorFeedback[] = [
  {
    id: "fb_001",
    sender: "EDITOR MINH TRÍ",
    seriesId: "ser_005",
    seriesTitle: "Tiến Sĩ Đá (Dr. Stone)",
    chapterNumber: 185,
    pageNumber: 5,
    content: "Nét vẽ khuôn mặt của nhân vật Senku ở khung tranh cuối chưa thể hiện rõ sự tức giận khi phát hiện ra kẻ thù. Đường nét mắt nên vẽ dày hơn một chút để làm nổi bật cảm xúc nhân vật. Hãy chỉnh sửa lại ở lớp Lineart.",
    severity: "Critical",
    status: "Open",
    createdAt: "2026-05-30T10:15:00Z",
  },
  {
    id: "fb_002",
    sender: "EDITOR LAN ANH",
    seriesId: "ser_005",
    seriesTitle: "Tiến Sĩ Đá (Dr. Stone)",
    chapterNumber: 185,
    content: "Lỗi chính tả ở bong bóng thoại thứ hai: 'Hải tặc' chứ không phải 'Hải tọc'. Font chữ thoại ở ô này cũng đang bị lệch nhẹ sang bên phải, bạn cần chỉnh lại nhé.",
    severity: "Medium",
    status: "Open",
    createdAt: "2026-05-28T14:20:00Z",
  },
  {
    id: "fb_003",
    sender: "EDITOR MINH TRÍ",
    seriesId: "ser_005",
    seriesTitle: "Tiến Sĩ Đá (Dr. Stone)",
    chapterNumber: 184,
    pageNumber: 2,
    content: "Lớp Screentone (tạo bóng hạt) ở hiệu sách trang 2 hơi mờ khi xuất bản thử. Cần tăng độ tương phản của lớp screentone lên khoảng 10% để in rõ nét hơn.",
    severity: "Low",
    status: "Resolved",
    createdAt: "2026-05-25T14:00:00Z",
  },
];


export const INITIAL_BOARD_REVIEWS: BoardReview[] = [
  { id: "br_001", seriesId: "s_001", chapterId: "c_001_001", submittedAt: "2026-06-03", status: "Approved" },
  { id: "br_002", seriesId: "s_002", chapterId: "c_002_002", submittedAt: "2026-06-04", status: "Waiting" },
];

export const INITIAL_RISK_ALERTS: RiskAlert[] = [
  { id: "ra_001", seriesId: "s_001", level: "Low", message: "Ranking dropped by 1 place.", createdAt: "2026-06-04T10:00:00Z", isRead: false },
  { id: "ra_002", seriesId: "s_003", level: "High", message: "Rating fell below 6.5! Immediate action required.", createdAt: "2026-06-03T15:00:00Z", isRead: false },
];

export const INITIAL_RECOVERY_PROPOSALS: RecoveryProposal[] = [];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: "n_001", type: "Assistant", title: "Nộp bài", message: "Trợ lý Yuko đã nộp bản thảo Line Art trang 5.", createdAt: "2026-06-04T14:30:00Z", isRead: false, link: "/dashboard/mangaka/submissions/s_001" },
  { id: "n_002", type: "Editor", title: "Phản hồi mới", message: "Biên tập viên đã thêm phản hồi cho Dr. Stone.", createdAt: "2026-06-04T09:00:00Z", isRead: false, link: "/dashboard/mangaka/feedback" },
  { id: "n_003", type: "Ranking", title: "Cảnh báo rủi ro", message: "Jujutsu Kaisen đang có dấu hiệu giảm hạng.", createdAt: "2026-06-03T18:00:00Z", isRead: true, link: "/dashboard/mangaka/risk-alerts" },
];

// --- Local Storage Management Class ---

class MangakaStore {
  private isClient = typeof window !== "undefined";

  private getStored<T>(key: string, defaultValue: T): T {
    if (!this.isClient) return defaultValue;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  }

  private setStored<T>(key: string, value: T): void {
    if (!this.isClient) return;
    localStorage.setItem(key, JSON.stringify(value));
  }

  // --- Getters ---
  getSeries(): Series[] {
    return this.getStored("mangaka_series", INITIAL_SERIES);
  }

  getChapters(seriesId?: string): Chapter[] {
    const all = this.getStored("mangaka_chapters", INITIAL_CHAPTERS);
    if (seriesId) return all.filter((c) => c.seriesId === seriesId);
    return all;
  }

  getPages(chapterId?: string): MangaPage[] {
    const all = this.getStored("mangaka_pages", INITIAL_PAGES);
    if (chapterId) return all.filter((p) => p.chapterId === chapterId);
    return all;
  }

  getTasks(): LayerTask[] {
    return this.getStored("mangaka_tasks", INITIAL_TASKS);
  }

  getAssistants(): Assistant[] {
    return this.getStored("mangaka_assistants", INITIAL_ASSISTANTS);
  }

  getSubmissions(): AssistantSubmission[] {
    return this.getStored("mangaka_submissions", INITIAL_SUBMISSIONS);
  }

  getAssets(seriesId?: string): AssetItem[] {
    const all = this.getStored("mangaka_assets", INITIAL_ASSETS);
    if (seriesId) return all.filter((a) => a.seriesId === seriesId);
    return all;
  }

  getRankingStats(): RankingStat[] {
    return this.getStored("mangaka_rankings", INITIAL_RANKINGS);
  }

  getEditorFeedbacks(): EditorFeedback[] {
    return this.getStored("mangaka_feedbacks", INITIAL_FEEDBACKS);
  }

  // --- Actions ---

  addSeries(seriesData: Omit<Series, "id" | "createdAt">): Series {
    const list = this.getSeries();
    const newSeries: Series = {
      ...seriesData,
      id: `ser_${String(list.length + 1).padStart(3, "0")}`,
      createdAt: new Date().toISOString().split("T")[0],
    };
    list.push(newSeries);
    this.setStored("mangaka_series", list);

    // Auto create a ranking stat for this series
    const rankings = this.getRankingStats();
    rankings.push({
      id: `rank_${newSeries.id}`,
      seriesId: newSeries.id,
      seriesTitle: newSeries.title,
      rankWeekly: rankings.length + 1,
      views: "0",
      likes: "0",
      comments: "0",
      followers: "0",
      rating: 0,
      rankChange: 0,
      hotChapter: "N/A",
    });
    this.setStored("mangaka_rankings", rankings);

    return newSeries;
  }

  addChapter(chapterData: Omit<Chapter, "id">): Chapter {
    const list = this.getChapters();
    const newChapter: Chapter = {
      ...chapterData,
      id: `ch_${String(list.length + 1).padStart(3, "0")}`,
    };
    list.push(newChapter);
    this.setStored("mangaka_chapters", list);

    // Auto create pages for the chapter
    const pages = this.getPages();
    for (let i = 1; i <= Math.min(chapterData.totalPages, 4); i++) {
      pages.push({
        id: `pg_${newChapter.id}_${String(i).padStart(3, "0")}`,
        chapterId: newChapter.id,
        pageNumber: i,
        thumbnailUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&auto=format&fit=crop",
        panelFrameStatus: "Not Started",
        lineArtStatus: "Not Started",
        speechBalloonStatus: "Not Started",
        backgroundStatus: "Not Started",
        assetStatus: "Not Started",
        assistantSubmissionStatus: "Not Started",
        overallStatus: "Not Started",
      });
    }
    this.setStored("mangaka_pages", pages);

    return newChapter;
  }

  addTask(taskData: Omit<LayerTask, "id" | "status">): LayerTask {
    const list = this.getTasks();
    const newTask: LayerTask = {
      ...taskData,
      id: `task_${String(list.length + 1).padStart(3, "0")}`,
      status: "Not Started",
    };
    list.push(newTask);
    this.setStored("mangaka_tasks", list);

    // Increment assistant's tasks count
    const assistants = this.getAssistants();
    const assistant = assistants.find((a) => a.name === taskData.assignedTo);
    if (assistant) {
      assistant.currentTasksCount += 1;
      assistant.status = "Đang làm";
      this.setStored("mangaka_assistants", assistants);
    }

    // Update the status on the page
    const pages = this.getPages();
    const page = pages.find((p) => p.id === taskData.pageId);
    if (page) {
      const type = taskData.layerType;
      if (type === "Panel Frame") page.panelFrameStatus = "Doing";
      else if (type === "Line Art") page.lineArtStatus = "Doing";
      else if (type === "Speech Balloon") page.speechBalloonStatus = "Doing";
      else if (type === "Background") page.backgroundStatus = "Doing";
      else if (type === "Reference Asset") page.assetStatus = "Doing";
      else if (type === "Assistant Submission" || type === "SFX") page.assistantSubmissionStatus = "Doing";
      
      page.overallStatus = "Doing";
      this.setStored("mangaka_pages", pages);
    }

    return newTask;
  }

  deleteTask(taskId: string): void {
    let list = this.getTasks();
    const task = list.find((t) => t.id === taskId);
    if (task) {
      list = list.filter((t) => t.id !== taskId);
      this.setStored("mangaka_tasks", list);

      // Decrement assistant's tasks count
      const assistants = this.getAssistants();
      const assistant = assistants.find((a) => a.name === task.assignedTo);
      if (assistant) {
        assistant.currentTasksCount = Math.max(0, assistant.currentTasksCount - 1);
        if (assistant.currentTasksCount === 0 && assistant.pendingSubmissionsCount === 0) {
          assistant.status = "Nghỉ ngơi";
        }
        this.setStored("mangaka_assistants", assistants);
      }
    }
  }

  approveSubmission(submissionId: string): void {
    const list = this.getSubmissions();
    const sub = list.find((s) => s.id === submissionId);
    if (sub) {
      sub.status = "Approved";
      this.setStored("mangaka_submissions", list);

      // Decrement assistant pending count
      const assistants = this.getAssistants();
      const assistant = assistants.find((a) => a.name === sub.assistantName);
      if (assistant) {
        assistant.pendingSubmissionsCount = Math.max(0, assistant.pendingSubmissionsCount - 1);
        assistant.currentTasksCount = Math.max(0, assistant.currentTasksCount - 1);
        if (assistant.pendingSubmissionsCount === 0 && assistant.currentTasksCount === 0) {
          assistant.status = "Nghỉ ngơi";
        }
        this.setStored("mangaka_assistants", assistants);
      }

      // Find task corresponding and set to Approved
      const tasks = this.getTasks();
      const task = tasks.find(
        (t) =>
          t.assignedTo === sub.assistantName &&
          t.layerType === sub.layerType &&
          t.status === "Submitted"
      );
      if (task) {
        task.status = "Approved";
        this.setStored("mangaka_tasks", tasks);

        // Update manga page layer status to Approved
        const pages = this.getPages();
        const page = pages.find((p) => p.id === task.pageId);
        if (page) {
          const type = task.layerType;
          if (type === "Panel Frame") page.panelFrameStatus = "Approved";
          else if (type === "Line Art") page.lineArtStatus = "Approved";
          else if (type === "Speech Balloon") page.speechBalloonStatus = "Approved";
          else if (type === "Background") page.backgroundStatus = "Approved";
          else if (type === "Reference Asset") page.assetStatus = "Approved";
          else if (type === "Assistant Submission" || type === "SFX") page.assistantSubmissionStatus = "Approved";

          // If all main layers approved, overall Approved
          if (
            (page.panelFrameStatus === "Approved" || page.panelFrameStatus === "Not Started") &&
            (page.lineArtStatus === "Approved" || page.lineArtStatus === "Not Started") &&
            (page.backgroundStatus === "Approved" || page.backgroundStatus === "Not Started")
          ) {
            page.overallStatus = "Approved";
          }
          this.setStored("mangaka_pages", pages);
        }
      }
    }
  }

  rejectSubmission(submissionId: string, note: string): void {
    const list = this.getSubmissions();
    const sub = list.find((s) => s.id === submissionId);
    if (sub) {
      sub.status = "Need Fix";
      sub.note = note ? `Ý kiến của tác giả: ${note}. (${sub.note})` : sub.note;
      this.setStored("mangaka_submissions", list);

      // Decrement assistant pending count, but keep active task
      const assistants = this.getAssistants();
      const assistant = assistants.find((a) => a.name === sub.assistantName);
      if (assistant) {
        assistant.pendingSubmissionsCount = Math.max(0, assistant.pendingSubmissionsCount - 1);
        assistant.status = "Đang làm";
        this.setStored("mangaka_assistants", assistants);
      }

      // Update task status
      const tasks = this.getTasks();
      const task = tasks.find(
        (t) =>
          t.assignedTo === sub.assistantName &&
          t.layerType === sub.layerType &&
          t.status === "Submitted"
      );
      if (task) {
        task.status = "Need Fix";
        task.note = note;
        this.setStored("mangaka_tasks", tasks);

        // Update page
        const pages = this.getPages();
        const page = pages.find((p) => p.id === task.pageId);
        if (page) {
          const type = task.layerType;
          if (type === "Panel Frame") page.panelFrameStatus = "Need Fix";
          else if (type === "Line Art") page.lineArtStatus = "Need Fix";
          else if (type === "Speech Balloon") page.speechBalloonStatus = "Need Fix";
          else if (type === "Background") page.backgroundStatus = "Need Fix";
          else if (type === "Reference Asset") page.assetStatus = "Need Fix";
          else if (type === "Assistant Submission" || type === "SFX") page.assistantSubmissionStatus = "Need Fix";
          
          page.overallStatus = "Need Fix";
          this.setStored("mangaka_pages", pages);
        }
      }
    }
  }

  resolveFeedback(feedbackId: string): void {
    const list = this.getEditorFeedbacks();
    const fb = list.find((f) => f.id === feedbackId);
    if (fb) {
      fb.status = "Resolved";
      this.setStored("mangaka_feedbacks", list);
    }
  }

  replyFeedback(feedbackId: string, replyContent: string): void {
    const list = this.getEditorFeedbacks();
    const fb = list.find((f) => f.id === feedbackId);
    if (fb) {
      fb.content = `${fb.content}\n--- Phản hồi từ Mangaka: ${replyContent} ---`;
      this.setStored("mangaka_feedbacks", list);
    }
  }

  updateChapterStatus(chapterId: string, status: Chapter["status"]): void {
    const list = this.getChapters();
    const chapter = list.find((c) => c.id === chapterId);
    if (chapter) {
      chapter.status = status;
      this.setStored("mangaka_chapters", list);
    }
  }

  updateFeedbackStatus(feedbackId: string, status: "Open" | "Resolved"): void {
    if (status === "Resolved") {
      this.resolveFeedback(feedbackId);
    } else {
      const list = this.getEditorFeedbacks();
      const fb = list.find((f) => f.id === feedbackId);
      if (fb) {
        fb.status = "Open";
        this.setStored("mangaka_feedbacks", list);
      }
    }
  }

  updateSubmissionStatus(submissionId: string, status: "Approved" | "Need Fix", reason?: string): void {
    if (status === "Approved") {
      this.approveSubmission(submissionId);
    } else {
      this.rejectSubmission(submissionId, reason || "");
    }
  }

  addAsset(assetData: Omit<AssetItem, "id" | "uploadedAt" | "uploadedBy">): AssetItem {
    const list = this.getStored("mangaka_assets", INITIAL_ASSETS);
    const newAsset: AssetItem = {
      ...assetData,
      id: `asset_${String(list.length + 1).padStart(3, "0")}`,
      uploadedAt: new Date().toISOString().split("T")[0],
      uploadedBy: "Mangaka (Tác giả)",
    };
    list.push(newAsset);
    this.setStored("mangaka_assets", list);
    return newAsset;
  }


  getBoardReviews(): BoardReview[] {
    return this.getStored("mangaka_board_reviews", INITIAL_BOARD_REVIEWS);
  }

  getRiskAlerts(): RiskAlert[] {
    return this.getStored("mangaka_risk_alerts", INITIAL_RISK_ALERTS);
  }

  markRiskAlertRead(id: string): void {
    const list = this.getRiskAlerts();
    const alert = list.find((a) => a.id === id);
    if (alert) {
      alert.isRead = true;
      this.setStored("mangaka_risk_alerts", list);
    }
  }

  getRecoveryProposals(): RecoveryProposal[] {
    return this.getStored("mangaka_recovery_proposals", INITIAL_RECOVERY_PROPOSALS);
  }

  getNotifications(): Notification[] {
    return this.getStored("mangaka_notifications", INITIAL_NOTIFICATIONS);
  }

  addRecoveryProposal(proposal: Omit<RecoveryProposal, "id" | "submittedAt" | "status">): RecoveryProposal {
    const list = this.getRecoveryProposals();
    const newProp: RecoveryProposal = {
      ...proposal,
      id: `rp_${Date.now()}`,
      submittedAt: new Date().toISOString(),
      status: "Pending"
    };
    list.push(newProp);
    this.setStored("mangaka_recovery_proposals", list);
    return newProp;
  }

  markNotificationRead(id: string): void {
    const list = this.getNotifications();
    const notif = list.find(n => n.id === id);
    if (notif) {
      notif.isRead = true;
      this.setStored("mangaka_notifications", list);
    }
  }

  markAllNotificationsRead(): void {
    const list = this.getNotifications();
    list.forEach(n => n.isRead = true);
    this.setStored("mangaka_notifications", list);
  }

  updateTask(taskId: string, updates: Partial<LayerTask>): void {
    const list = this.getTasks();
    const index = list.findIndex(t => t.id === taskId);
    if (index !== -1) {
      list[index] = { ...list[index], ...updates };
      this.setStored("mangaka_tasks", list);
    }
  }



  updateSeriesProgress(seriesId: string, updates: Partial<Series>): void {
    const list = this.getSeries();
    const idx = list.findIndex(s => s.id === seriesId);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates };
      this.setStored("mangaka_series", list);
    }
  }

  addAssistant(assistant: Omit<Assistant, "id" | "currentTasksCount" | "pendingSubmissionsCount" | "status">): Assistant {
    const list = this.getAssistants();
    const newAssistant: Assistant = {
      ...assistant,
      id: `ast_${Date.now()}`,
      currentTasksCount: 0,
      pendingSubmissionsCount: 0,
      status: "Nghỉ ngơi"
    };
    list.push(newAssistant);
    this.setStored("mangaka_assistants", list);
    return newAssistant;
  }

  reset(): void {
    if (!this.isClient) return;
    localStorage.removeItem("mangaka_series");
    localStorage.removeItem("mangaka_chapters");
    localStorage.removeItem("mangaka_pages");
    localStorage.removeItem("mangaka_tasks");
    localStorage.removeItem("mangaka_assistants");
    localStorage.removeItem("mangaka_submissions");
    localStorage.removeItem("mangaka_assets");
    localStorage.removeItem("mangaka_rankings");
    localStorage.removeItem("mangaka_feedbacks");
  }
}

export const mangakaStore = new MangakaStore();
