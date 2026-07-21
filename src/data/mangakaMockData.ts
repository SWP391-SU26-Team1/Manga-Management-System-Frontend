
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
  seriesCount: number;
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
  submissionNotes?: string;
  versionNumber?: number | string;
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
  isAcknowledged?: boolean;
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

const INITIAL_SERIES: Series[] = [];
const INITIAL_CHAPTERS: Chapter[] = [];
const INITIAL_PAGES: MangaPage[] = [];
const INITIAL_TASKS: LayerTask[] = [];
const INITIAL_ASSISTANTS: Assistant[] = [];
const INITIAL_SUBMISSIONS: AssistantSubmission[] = [];
const INITIAL_ASSETS: AssetItem[] = [];
const INITIAL_RANKINGS: RankingStat[] = [];
export const INITIAL_FEEDBACKS: EditorFeedback[] = [];
export const INITIAL_BOARD_REVIEWS: BoardReview[] = [];
export const INITIAL_RISK_ALERTS: RiskAlert[] = [];
export const INITIAL_RECOVERY_PROPOSALS: RecoveryProposal[] = [];
export const INITIAL_NOTIFICATIONS: Notification[] = [];

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
