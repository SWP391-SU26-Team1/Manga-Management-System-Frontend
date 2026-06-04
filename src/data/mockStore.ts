
import { UserProfile } from "./mockUsers";

// --- Types & Interfaces ---

export type SeriesStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "PUBLISHING"
  | "AT_RISK"
  | "CANCELLED"
  | "COMPLETED";

export type PublicationType = "WEEKLY" | "MONTHLY" | "SPECIAL";

export type RiskStatus = "SAFE" | "WATCHLIST" | "AT_RISK" | "CRITICAL" | "CANCELLED";

export interface Series {
  id: string;
  title: string;
  description: string;
  genre: string;
  coverImageUrl: string;
  authorId: string;
  authorName: string;
  editorId: string;
  editorName: string;
  status: SeriesStatus;
  publicationType: PublicationType;
  currentRanking: number;
  previousRanking: number;
  riskStatus: RiskStatus;
  votes: {
    approve: number;
    reject: number;
    votedUsers: string[]; // List of user IDs who voted
  };
  readerVoteScore: number;
  salesScore: number;
  editorScore: number;
  engagementScore: number;
  createdAt: string;
  updatedAt: string;
}

export type ChapterStatus =
  | "PLANNING"
  | "SCRIPTING"
  | "SKETCHING"
  | "IN_PROGRESS"
  | "EDITOR_REVIEW"
  | "BOARD_REVIEW"
  | "READY_TO_PUBLISH"
  | "PUBLISHED"
  | "REVISION_REQUIRED";

export interface Chapter {
  id: string;
  seriesId: string;
  title: string;
  chapterNumber: number;
  status: ChapterStatus;
  deadline: string;
  publishedAt?: string;
  createdAt: string;
}

export type PageStatus =
  | "PENDING"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "MANGAKA_APPROVED"
  | "EDITOR_REVIEWED"
  | "REVISION_REQUIRED"
  | "FINALIZED";

export interface Page {
  id: string;
  chapterId: string;
  pageNumber: number;
  imageUrl: string;
  status: PageStatus;
  createdAt: string;
}

export type TaskType =
  | "BACKGROUND_DRAWING"
  | "SHADING"
  | "INKING"
  | "EFFECT"
  | "SPEECH_BUBBLE"
  | "CLEAN_UP"
  | "TONE_APPLICATION"
  | "COLORING";

export type TaskStatus =
  | "TODO"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "APPROVED"
  | "REVISION_REQUESTED"
  | "REJECTED"
  | "DONE";

export interface Task {
  id: string;
  pageId: string;
  pageNumber: number;
  chapterId: string;
  seriesId: string;
  seriesTitle: string;
  assistantId: string;
  assistantName: string;
  description: string;
  type: TaskType;
  status: TaskStatus;
  region: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  deadline: string;
  resourcesUrl?: string;
  submissionUrl?: string;
  submissionNote?: string;
  createdAt: string;
}

export interface Annotation {
  id: string;
  pageId: string;
  editorId: string;
  editorName: string;
  x: number; // percentage width (0 - 100)
  y: number; // percentage height (0 - 100)
  text: string;
  resolved: boolean;
  createdAt: string;
}

// --- Initial Mock Data ---

const INITIAL_SERIES: Series[] = [
  {
    id: "ser_001",
    title: "Ánh sáng nơi chân trời",
    description: "Một cậu bé mù khám phá ra thế giới kỳ diệu thông qua âm thanh và các sinh vật huyền bí.",
    genre: "Fantasy, Adventure, Drama",
    coverImageUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=800&auto=format&fit=crop",
    authorId: "usr_mangaka_001",
    authorName: "Oda Eiichiro",
    editorId: "usr_editor_001",
    editorName: "Akira Watanabe",
    status: "PUBLISHING",
    publicationType: "WEEKLY",
    currentRanking: 3,
    previousRanking: 5,
    riskStatus: "SAFE",
    votes: { approve: 5, reject: 0, votedUsers: ["usr_board_001"] },
    readerVoteScore: 85,
    salesScore: 78,
    editorScore: 90,
    engagementScore: 82,
    createdAt: "2025-01-10T08:00:00Z",
    updatedAt: "2026-05-20T11:00:00Z",
  },
  {
    id: "ser_002",
    title: "Thành phố tương lai",
    description: "Cuộc chiến sinh tồn trong thế giới Cyberpunk nơi công nghệ điều khiển mọi suy nghĩ.",
    genre: "Sci-Fi, Cyberpunk, Action",
    coverImageUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=800&auto=format&fit=crop",
    authorId: "usr_mangaka_001",
    authorName: "Oda Eiichiro",
    editorId: "usr_editor_001",
    editorName: "Akira Watanabe",
    status: "SUBMITTED",
    publicationType: "MONTHLY",
    currentRanking: 0,
    previousRanking: 0,
    riskStatus: "SAFE",
    votes: { approve: 2, reject: 1, votedUsers: [] },
    readerVoteScore: 0,
    salesScore: 0,
    editorScore: 0,
    engagementScore: 0,
    createdAt: "2026-05-18T10:00:00Z",
    updatedAt: "2026-05-18T10:00:00Z",
  },
  {
    id: "ser_003",
    title: "Cú đập bầu trời",
    description: "Hành trình chinh phục giải bóng chuyền học sinh toàn quốc của một đội bóng bị đánh giá thấp.",
    genre: "Sports, Shonen, Comedy",
    coverImageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop",
    authorId: "usr_mangaka_002", // Một mangaka mock khác
    authorName: "Kishimoto Masashi",
    editorId: "usr_editor_001",
    editorName: "Akira Watanabe",
    status: "PUBLISHING",
    publicationType: "WEEKLY",
    currentRanking: 15,
    previousRanking: 14,
    riskStatus: "AT_RISK",
    votes: { approve: 4, reject: 2, votedUsers: ["usr_board_001"] },
    readerVoteScore: 42,
    salesScore: 35,
    editorScore: 50,
    engagementScore: 38,
    createdAt: "2025-06-20T09:00:00Z",
    updatedAt: "2026-05-20T11:00:00Z",
  },
];

const INITIAL_CHAPTERS: Chapter[] = [
  {
    id: "ch_042",
    seriesId: "ser_001",
    title: "Cuộc đụng độ bất ngờ",
    chapterNumber: 42,
    status: "PUBLISHED",
    deadline: "2026-04-30T17:00:00Z",
    publishedAt: "2026-05-02T08:00:00Z",
    createdAt: "2026-04-20T08:00:00Z",
  },
  {
    id: "ch_043",
    seriesId: "ser_001",
    title: "Bí mật sâu thẳm lộ diện",
    chapterNumber: 43,
    status: "PUBLISHED",
    deadline: "2026-05-10T17:00:00Z",
    publishedAt: "2026-05-12T08:00:00Z",
    createdAt: "2026-05-01T08:00:00Z",
  },
  {
    id: "ch_044",
    seriesId: "ser_001",
    title: "Đồng đội sát cánh",
    chapterNumber: 44,
    status: "EDITOR_REVIEW",
    deadline: "2026-05-20T17:00:00Z",
    createdAt: "2026-05-11T08:00:00Z",
  },
  {
    id: "ch_045",
    seriesId: "ser_001",
    title: "Khai mở phong ấn",
    chapterNumber: 45,
    status: "IN_PROGRESS",
    deadline: "2026-05-27T17:00:00Z",
    createdAt: "2026-05-18T08:00:00Z",
  },
];

const INITIAL_PAGES: Page[] = [
  // Pages for Chapter 45 (In Progress)
  {
    id: "pg_45_01",
    chapterId: "ch_045",
    pageNumber: 1,
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop",
    status: "MANGAKA_APPROVED",
    createdAt: "2026-05-18T09:00:00Z",
  },
  {
    id: "pg_45_02",
    chapterId: "ch_045",
    pageNumber: 2,
    imageUrl: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=800&auto=format&fit=crop",
    status: "ASSIGNED",
    createdAt: "2026-05-18T09:00:00Z",
  },
  {
    id: "pg_45_03",
    chapterId: "ch_045",
    pageNumber: 3,
    imageUrl: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=800&auto=format&fit=crop",
    status: "SUBMITTED",
    createdAt: "2026-05-18T09:00:00Z",
  },
  {
    id: "pg_45_04",
    chapterId: "ch_045",
    pageNumber: 4,
    imageUrl: "https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=800&auto=format&fit=crop",
    status: "PENDING",
    createdAt: "2026-05-18T09:00:00Z",
  },
];

const INITIAL_TASKS: Task[] = [
  {
    id: "tsk_001",
    pageId: "pg_45_02",
    pageNumber: 2,
    chapterId: "ch_045",
    seriesId: "ser_001",
    seriesTitle: "Ánh sáng nơi chân trời",
    assistantId: "usr_assistant_001",
    assistantName: "Kenji Tanaka",
    description: "Vẽ bối cảnh rừng rậm âm u phía sau nhân vật chính ở khung tranh lớn phía dưới.",
    type: "BACKGROUND_DRAWING",
    status: "IN_PROGRESS",
    region: { x: 10, y: 50, width: 80, height: 45 },
    deadline: "2026-05-24T17:00:00Z",
    resourcesUrl: "https://example.com/resources/forest_concept.zip",
    createdAt: "2026-05-19T08:00:00Z",
  },
  {
    id: "tsk_002",
    pageId: "pg_45_03",
    pageNumber: 3,
    chapterId: "ch_045",
    seriesId: "ser_001",
    seriesTitle: "Ánh sáng nơi chân trời",
    assistantId: "usr_assistant_001",
    assistantName: "Kenji Tanaka",
    description: "Phủ screen tones tạo bóng đổ sâu cho nhân vật phản diện đang đứng trong bóng tối.",
    type: "TONE_APPLICATION",
    status: "SUBMITTED",
    region: { x: 30, y: 10, width: 40, height: 40 },
    deadline: "2026-05-23T17:00:00Z",
    resourcesUrl: "https://example.com/resources/shading_guide.pdf",
    submissionUrl: "https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=800&auto=format&fit=crop",
    submissionNote: "Em đã đánh bóng và tạo noise như sensei yêu cầu. Sensei duyệt giúp em nha!",
    createdAt: "2026-05-18T10:00:00Z",
  },
];

const INITIAL_ANNOTATIONS: Annotation[] = [
  {
    id: "ann_001",
    pageId: "pg_45_01",
    editorId: "usr_editor_001",
    editorName: "Akira Watanabe",
    x: 75,
    y: 25,
    text: "Sửa lại hội thoại ở khung này: 'Tôi sẽ không bao giờ bỏ cuộc' sửa thành 'Chúng ta không thể lùi bước ở đây!' để tăng tính kịch tính.",
    resolved: false,
    createdAt: "2026-05-19T14:30:00Z",
  },
  {
    id: "ann_002",
    pageId: "pg_45_01",
    editorId: "usr_editor_001",
    editorName: "Akira Watanabe",
    x: 20,
    y: 65,
    text: "Nét vẽ chỗ này hơi thô, nhờ họa sĩ trau chuốt lại chi tiết thanh kiếm nhé.",
    resolved: false,
    createdAt: "2026-05-19T14:32:00Z",
  },
];

// --- Store Manager Helper Class ---

class MockStore {
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
    return this.getStored("mf_series", INITIAL_SERIES);
  }

  getChapters(): Chapter[] {
    return this.getStored("mf_chapters", INITIAL_CHAPTERS);
  }

  getPages(): Page[] {
    return this.getStored("mf_pages", INITIAL_PAGES);
  }

  getTasks(): Task[] {
    return this.getStored("mf_tasks", INITIAL_TASKS);
  }

  getAnnotations(): Annotation[] {
    return this.getStored("mf_annotations", INITIAL_ANNOTATIONS);
  }

  // --- Setters / Actions ---

  addSeries(seriesData: Omit<Series, "id" | "currentRanking" | "previousRanking" | "riskStatus" | "votes" | "readerVoteScore" | "salesScore" | "editorScore" | "engagementScore" | "createdAt" | "updatedAt">): Series {
    const list = this.getSeries();
    const newSeries: Series = {
      ...seriesData,
      id: `ser_${String(list.length + 1).padStart(3, "0")}`,
      currentRanking: 0,
      previousRanking: 0,
      riskStatus: "SAFE",
      votes: { approve: 0, reject: 0, votedUsers: [] },
      readerVoteScore: 0,
      salesScore: 0,
      editorScore: 0,
      engagementScore: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    list.push(newSeries);
    this.setStored("mf_series", list);
    return newSeries;
  }

  updateSeriesStatus(seriesId: string, status: SeriesStatus): void {
    const list = this.getSeries();
    const item = list.find((s) => s.id === seriesId);
    if (item) {
      item.status = status;
      item.updatedAt = new Date().toISOString();
      this.setStored("mf_series", list);
    }
  }

  voteSeries(seriesId: string, userId: string, vote: "approve" | "reject"): void {
    const list = this.getSeries();
    const item = list.find((s) => s.id === seriesId);
    if (item) {
      if (item.votes.votedUsers.includes(userId)) return; // Already voted
      
      item.votes.votedUsers.push(userId);
      if (vote === "approve") {
        item.votes.approve += 1;
      } else {
        item.votes.reject += 1;
      }
      
      // Auto approve if 3 approve votes
      if (item.votes.approve >= 3 && item.status === "SUBMITTED") {
        item.status = "APPROVED";
      }
      
      item.updatedAt = new Date().toISOString();
      this.setStored("mf_series", list);
    }
  }

  importReaderVotes(seriesId: string, votes: number): void {
    const list = this.getSeries();
    const item = list.find((s) => s.id === seriesId);
    if (item) {
      item.readerVoteScore = votes;
      // Mock other scores to calculate ranking score
      item.salesScore = Math.floor(Math.random() * 40) + 50; // 50-90
      item.editorScore = Math.floor(Math.random() * 30) + 60; // 60-90
      item.engagementScore = Math.floor(Math.random() * 40) + 50; // 50-90
      
      item.updatedAt = new Date().toISOString();
      this.setStored("mf_series", list);
      this.recalculateRankings();
    }
  }

  recalculateRankings(): void {
    const list = this.getSeries().filter((s) => s.status === "PUBLISHING");
    if (list.length === 0) return;

    // Calculate score
    const scoredList = list.map((s) => {
      const score = s.readerVoteScore * 0.5 + s.salesScore * 0.2 + s.editorScore * 0.2 + s.engagementScore * 0.1;
      return { id: s.id, score };
    });

    // Sort by score desc
    scoredList.sort((a, b) => b.score - a.score);

    // Update ranks in main series list
    const allSeries = this.getSeries();
    allSeries.forEach((s) => {
      if (s.status === "PUBLISHING") {
        const rankIndex = scoredList.findIndex((item) => item.id === s.id);
        if (rankIndex !== -1) {
          s.previousRanking = s.currentRanking || rankIndex + 1;
          s.currentRanking = rankIndex + 1;
          
          // Set risk status based on rank
          if (s.currentRanking >= 15) {
            s.riskStatus = "CRITICAL";
            s.status = "AT_RISK";
          } else if (s.currentRanking >= 10) {
            s.riskStatus = "AT_RISK";
          } else if (s.currentRanking >= 7) {
            s.riskStatus = "WATCHLIST";
          } else {
            s.riskStatus = "SAFE";
          }
        }
      }
    });

    this.setStored("mf_series", allSeries);
  }

  addChapter(seriesId: string, title: string, chapterNumber: number, deadline: string): Chapter {
    const list = this.getChapters();
    const newChapter: Chapter = {
      id: `ch_${String(list.length + 1).padStart(3, "0")}`,
      seriesId,
      title,
      chapterNumber,
      status: "PLANNING",
      deadline,
      createdAt: new Date().toISOString(),
    };
    list.push(newChapter);
    this.setStored("mf_chapters", list);

    // Auto create 4 empty pages for this chapter
    const pagesList = this.getPages();
    for (let i = 1; i <= 4; i++) {
      pagesList.push({
        id: `pg_${newChapter.id.split("_")[1]}_0${i}`,
        chapterId: newChapter.id,
        pageNumber: i,
        imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop",
        status: "PENDING",
        createdAt: new Date().toISOString(),
      });
    }
    this.setStored("mf_pages", pagesList);

    return newChapter;
  }

  updateChapterStatus(chapterId: string, status: ChapterStatus): void {
    const list = this.getChapters();
    const item = list.find((c) => c.id === chapterId);
    if (item) {
      item.status = status;
      if (status === "PUBLISHED") {
        item.publishedAt = new Date().toISOString();
      }
      this.setStored("mf_chapters", list);
    }
  }

  addTask(taskData: Omit<Task, "id" | "status" | "createdAt">): Task {
    const list = this.getTasks();
    const newTask: Task = {
      ...taskData,
      id: `tsk_${String(list.length + 1).padStart(3, "0")}`,
      status: "ASSIGNED",
      createdAt: new Date().toISOString(),
    };
    list.push(newTask);
    this.setStored("mf_tasks", list);

    // Update page status to ASSIGNED
    const pages = this.getPages();
    const page = pages.find((p) => p.id === taskData.pageId);
    if (page && page.status === "PENDING") {
      page.status = "ASSIGNED";
      this.setStored("mf_pages", pages);
    }

    return newTask;
  }

  updateTaskStatus(taskId: string, status: TaskStatus): void {
    const list = this.getTasks();
    const item = list.find((t) => t.id === taskId);
    if (item) {
      item.status = status;
      this.setStored("mf_tasks", list);

      // Sync with page status if task is submitted / approved
      const pages = this.getPages();
      const page = pages.find((p) => p.id === item.pageId);
      if (page) {
        if (status === "SUBMITTED") {
          page.status = "SUBMITTED";
        } else if (status === "APPROVED") {
          page.status = "MANGAKA_APPROVED";
        } else if (status === "REVISION_REQUESTED") {
          page.status = "REVISION_REQUIRED";
        }
        this.setStored("mf_pages", pages);
      }
    }
  }

  submitTask(taskId: string, submissionUrl: string, submissionNote: string): void {
    const list = this.getTasks();
    const item = list.find((t) => t.id === taskId);
    if (item) {
      item.status = "SUBMITTED";
      item.submissionUrl = submissionUrl;
      item.submissionNote = submissionNote;
      this.setStored("mf_tasks", list);

      // Update page status
      const pages = this.getPages();
      const page = pages.find((p) => p.id === item.pageId);
      if (page) {
        page.status = "SUBMITTED";
        this.setStored("mf_pages", pages);
      }
    }
  }

  addAnnotation(pageId: string, editorId: string, editorName: string, x: number, y: number, text: string): Annotation {
    const list = this.getAnnotations();
    const newAnn: Annotation = {
      id: `ann_${String(list.length + 1).padStart(3, "0")}`,
      pageId,
      editorId,
      editorName,
      x,
      y,
      text,
      resolved: false,
      createdAt: new Date().toISOString(),
    };
    list.push(newAnn);
    this.setStored("mf_annotations", list);

    // Update page to require revision
    const pages = this.getPages();
    const page = pages.find((p) => p.id === pageId);
    if (page) {
      page.status = "REVISION_REQUIRED";
      this.setStored("mf_pages", pages);
    }

    return newAnn;
  }

  resolveAnnotation(annId: string): void {
    const list = this.getAnnotations();
    const item = list.find((a) => a.id === annId);
    if (item) {
      item.resolved = true;
      this.setStored("mf_annotations", list);
    }
  }

  resetStore(): void {
    if (!this.isClient) return;
    localStorage.removeItem("mf_series");
    localStorage.removeItem("mf_chapters");
    localStorage.removeItem("mf_pages");
    localStorage.removeItem("mf_tasks");
    localStorage.removeItem("mf_annotations");
  }
}

export const mockStore = new MockStore();
