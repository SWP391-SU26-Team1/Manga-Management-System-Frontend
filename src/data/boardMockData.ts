// --- Types & Interfaces for Board Panel ---

export interface QueueChapter {
  id: string;
  title: string;
  chapterNumber?: number;
  genre: string;
  progressLabel: string;
  progressPercent: number;
  timeLeftLabel: string;
  isUrgent: boolean;
  isNewSeries: boolean;
  coverUrl: string;
}

export interface TodayTask {
  id: string;
  content: string;
  done: boolean;
  urgent?: boolean;
}

export interface WeeklyRanking {
  rank: number;
  title: string;
  votes: number;
  changePercent: number;
  trend: 'up' | 'down';
}

export interface BoardComment {
  id: string;
  author: string;
  role: string;
  isChief?: boolean;
  time: string;
  content: string;
}

export interface DisputeCase {
  id: string;
  projectTitle: string;
  issue: string;
  authorName: string;
  authorAvatar: string;
  authorOpinion: string;
  authorSketches: string[];
  editorName: string;
  editorAvatar: string;
  editorOpinion: string;
  editorMetricLabel: string;
  editorMetricValue: number;
  editorMetricTarget: number;
  status: 'PENDING' | 'DECIDED';
  chiefDecision?: 'AUTHOR' | 'EDITOR' | 'COMPROMISE';
  chiefCompromise?: string;
  chiefNextActions?: string;
  memberOpinion?: {
    leaning: 'AUTHOR' | 'EDITOR' | 'COMPROMISE';
    reason: string;
    submittedAt: string;
  };
}

export interface ChapterGrade {
  chapterId: string;
  drawing: number;
  pacing: number;
  layout: number;
  dialogue: number;
  finish: number;
  note: string;
}

export interface ChapterVote {
  chapterId: string;
  decision: 'APPROVE' | 'REJECT' | 'REVISE';
  note: string;
}

export interface ReviewedSeries {
  id: string;
  title: string;
  authorName: string;
  coverUrl: string;
  genre: string;
  synopsis: string;
  submittedAt: string;
  tantouName: string;
  tantouOpinion: string;
  vote?: {
    decision: 'APPROVE' | 'REJECT';
    note: string;
    submittedAt: string;
  };
}

export const INITIAL_REVIEWED_SERIES: ReviewedSeries[] = [
  {
    id: 'phoenix-legend',
    title: 'Huyền Thoại Phượng Hoàng',
    authorName: 'Trần Văn Tuyển',
    coverUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=300&auto=format&fit=crop',
    genre: 'Cổ Trang / Võ Thuật / Drama',
    synopsis: 'Câu chuyện kể về hành trình phục sinh của dòng tộc Phượng Hoàng lửa sau biến cố diệt môn 10 năm trước. Một võ sĩ trẻ ẩn tính danh tìm cách báo thù cho gia tộc và tái thiết lại giang sơn.',
    submittedAt: '2026-06-12T08:30:00Z',
    tantouName: 'Phạm Thế Vinh (Tantou)',
    tantouOpinion: 'Ý tưởng thế giới cổ trang xây dựng rất chi tiết, tạo hình nhân vật có nét đột phá cao. Storyboard 3 chương đầu vẽ tay nét rất chắc chắn. Khuyến nghị duyệt phát hành thí điểm (Pilot) để đo lường phản ứng độc giả.'
  },
  {
    id: 'road-to-glory',
    title: 'Đường Đến Vinh Quang',
    authorName: 'Lê Minh Thành',
    coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=300&auto=format&fit=crop',
    genre: 'Thể Thao / Đời Thường',
    synopsis: 'Hành trình vượt qua chấn thương đầu gối để tìm lại giấc mơ chạy điền kinh cự ly dài của một nam sinh trung học. Câu chuyện khơi dậy động lực phấn đấu mạnh mẽ.',
    submittedAt: '2026-06-13T14:20:00Z',
    tantouName: 'Nguyễn Thị Hương (Tantou)',
    tantouOpinion: 'Mạch truyện thể thao giàu cảm xúc, cốt truyện tuy cổ điển nhưng lối triển khai tâm lý nhân vật cực kỳ xuất sắc. Tuy nhiên, nét vẽ thể thao cần được làm nổi bật hơn ở các phân đoạn chuyển động tốc độ.'
  }
];

// --- Initial Mock Data ---

export const INITIAL_QUEUE_CHAPTERS: QueueChapter[] = [
  {
    id: 'cyber-ronin',
    title: 'CYBER RONIN: ZERO',
    chapterNumber: 65,
    genre: 'ACTION / SCI-FI',
    progressLabel: 'EDIT',
    progressPercent: 75,
    timeLeftLabel: '4h left',
    isUrgent: false,
    isNewSeries: false,
    coverUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=300&auto=format&fit=crop'
  },
  {
    id: 'crimson-petal',
    title: 'CRIMSON PETAL',
    genre: 'ROMANCE / DRAMA',
    progressLabel: 'PILOT',
    progressPercent: 100,
    timeLeftLabel: 'URGENT',
    isUrgent: true,
    isNewSeries: true,
    coverUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=300&auto=format&fit=crop'
  },
  {
    id: 'pitch-black',
    title: 'PITCH BLACK',
    chapterNumber: 12,
    genre: 'SPORTS / SHONEN',
    progressLabel: 'FINAL POLISH',
    progressPercent: 96,
    timeLeftLabel: '12h left',
    isUrgent: false,
    isNewSeries: false,
    coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=300&auto=format&fit=crop'
  },
  {
    id: 'whispers-of-mana',
    title: 'WHISPERS OF MANA',
    chapterNumber: 45,
    genre: 'FANTASY / MAGIC',
    progressLabel: 'DRAFT',
    progressPercent: 40,
    timeLeftLabel: '2d left',
    isUrgent: false,
    isNewSeries: false,
    coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=300&auto=format&fit=crop'
  }
];

export const INITIAL_TODAY_TASKS: TodayTask[] = [
  {
    id: 't1',
    content: "Hoàn tất tóm tắt bản bìa hóa cho 'Cyber Ronin'",
    done: false
  },
  {
    id: 't2',
    content: 'Duyệt trang màu cho CH. 89',
    done: false,
    urgent: true
  },
  {
    id: 't3',
    content: 'Họp điều phối sản xuất buổi sáng với Studio X',
    done: true
  }
];

export const INITIAL_WEEKLY_RANKINGS: WeeklyRanking[] = [
  {
    rank: 1,
    title: 'SHADOW PROTOCOL',
    votes: 12450,
    changePercent: 12,
    trend: 'up'
  },
  {
    rank: 2,
    title: 'NEON SAMURAI',
    votes: 11920,
    changePercent: 2,
    trend: 'down'
  },
  {
    rank: 3,
    title: 'PITCH BLACK',
    votes: 10105,
    changePercent: 5,
    trend: 'up'
  }
];

export const INITIAL_BOARD_COMMENTS: BoardComment[] = [
  {
    id: 'c1',
    author: 'MINH K. (ART DIRECTOR)',
    role: 'Art Director',
    time: '10:42 AM',
    content: 'Tỷ lệ cơ thể ở khung thứ 3 hơi lệch. Cần check lại anatomy trước khi pass bước lineart cuối.'
  },
  {
    id: 'c2',
    author: 'TRƯỞNG BAN BIÊN TẬP',
    role: 'Chief Editor',
    isChief: true,
    time: '11:05 AM',
    content: 'Đồng ý với lý giải của nhóm vẽ. Cảnh này shading như vậy là hợp lý, giữ nguyên tính thô ráp để tăng drama.'
  },
  {
    id: 'c3',
    author: 'LAN PHƯƠNG (EDITOR)',
    role: 'Editor',
    time: '11:15 AM',
    content: 'Thoại ở bubble cuối hơi dài, sợ che mất background chi tiết phía sau. Có thể cắt bớt 1 câu không?'
  }
];

export const INITIAL_DISPUTE_CASES: DisputeCase[] = [
  {
    id: 'MF-8492',
    projectTitle: 'Bóng Đêm Vô Tận',
    issue: 'Hướng phát triển cốt truyện chương 45.',
    authorName: 'NGUYỄN VĂN A',
    authorAvatar: 'https://i.pravatar.cc/150?u=author_a',
    authorOpinion: 'Việc thay đổi tính cách nhân vật nam chính đột ngột ở chương 45 sẽ phá vỡ toàn bộ cấu trúc phát triển tâm lý đã xây dựng từ chương 1. Độc giả cần thấy sự giằng xé nội tâm trước khi đưa ra quyết định tàn nhẫn đó.',
    authorSketches: [
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=400&auto=format&fit=crop',
    ],
    editorName: 'TRẦN THỊ B',
    editorAvatar: 'https://i.pravatar.cc/150?u=editor_b',
    editorOpinion: 'Nhịp biến truyện đang quá chậm. Dữ liệu độc giả cho thấy tỷ lệ drop ở 3 chương gần nhất tăng 15%. Cần một cú twist mạnh mẽ (hành động tàn nhẫn của nam chính) ngay lập tức để kéo lại sự chú ý của độc giả khi tập truyện xuất bản.',
    editorMetricLabel: 'Tỷ lệ giữ chân độc giả (Ch. 42-44)',
    editorMetricValue: 45,
    editorMetricTarget: 80,
    status: 'DECIDED', // To simulate Image 9 where decisions are made but locked for editing
    chiefDecision: 'COMPROMISE',
    chiefCompromise: 'Cho phép nhân vật chính có 1-2 trang độc thoại nội tâm dữ dội trước khi xuống tay, nhằm thỏa mãn tính logic phát triển nhân vật của tác giả, nhưng đồng thời nhịp hành động bạo lực vẫn xảy ra nhanh gọn ở cuối chương để tạo cú sốc (twist) theo mong muốn của biên tập viên.',
    chiefNextActions: 'Yêu cầu vẽ lại storyboard trang 12-15 để diễn tả cảnh đấu tranh tâm lý.'
  }
];

export const RETENTION_CHART_DATA = [45, 62, 55, 71, 85, 50, 58]; // daily 7 days

// --- Board Store Manager class ---

class BoardStore {
  private isClient = typeof window !== 'undefined';

  private getStored<T>(key: string, defaultValue: T): T {
    if (!this.isClient) return defaultValue;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  }

  private setStored<T>(key: string, value: T): void {
    if (!this.isClient) return;
    localStorage.setItem(key, JSON.stringify(value));
  }

  // --- Queue Chapters ---
  getQueueChapters(): QueueChapter[] {
    return this.getStored('board_queue_chapters', INITIAL_QUEUE_CHAPTERS);
  }

  // --- Today Tasks ---
  getTodayTasks(): TodayTask[] {
    return this.getStored('board_today_tasks', INITIAL_TODAY_TASKS);
  }

  setTodayTasks(tasks: TodayTask[]): void {
    this.setStored('board_today_tasks', tasks);
  }

  toggleTask(taskId: string): void {
    const list = this.getTodayTasks();
    const item = list.find(t => t.id === taskId);
    if (item) {
      item.done = !item.done;
      this.setTodayTasks(list);
    }
  }

  // --- Weekly Rankings ---
  getWeeklyRankings(): WeeklyRanking[] {
    return this.getStored('board_weekly_rankings', INITIAL_WEEKLY_RANKINGS);
  }

  // --- Board Comments ---
  getComments(chapterId: string): BoardComment[] {
    return this.getStored(`board_comments_${chapterId}`, INITIAL_BOARD_COMMENTS);
  }

  addComment(chapterId: string, content: string, user: any): BoardComment {
    const list = this.getComments(chapterId);
    const newComment: BoardComment = {
      id: `comment_${Date.now()}`,
      author: user?.fullName?.toUpperCase() || 'MEMBER EDITOR',
      role: user?.role === 'BOARD' ? 'Member Editor' : 'User',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content
    };
    list.push(newComment);
    this.setStored(`board_comments_${chapterId}`, list);
    return newComment;
  }

  // --- Chapter Grading ---
  getGrade(chapterId: string): ChapterGrade {
    const defaultGrade: ChapterGrade = {
      chapterId,
      drawing: 0,
      pacing: 0,
      layout: 0,
      dialogue: 0,
      finish: 0,
      note: ''
    };
    return this.getStored(`board_grade_${chapterId}`, defaultGrade);
  }

  saveGrade(grade: ChapterGrade): void {
    this.setStored(`board_grade_${grade.chapterId}`, grade);
  }

  // --- Chapter Voting ---
  getVote(chapterId: string): ChapterVote {
    const defaultVote: ChapterVote = {
      chapterId,
      decision: 'APPROVE',
      note: ''
    };
    return this.getStored(`board_vote_${chapterId}`, defaultVote);
  }

  saveVote(vote: ChapterVote): void {
    this.setStored(`board_vote_${vote.chapterId}`, vote);
    
    // Dispatch custom event to notify update
    if (this.isClient) {
      window.dispatchEvent(new Event('mangaflow_vote_submitted'));
    }
  }

  // --- Dispute Cases ---
  getDisputeCases(): DisputeCase[] {
    return this.getStored('board_disputes', INITIAL_DISPUTE_CASES);
  }

  getDisputeCase(caseId: string): DisputeCase | undefined {
    return this.getDisputeCases().find(c => c.id === caseId);
  }

  saveMemberDisputeOpinion(caseId: string, leaning: 'AUTHOR' | 'EDITOR' | 'COMPROMISE', reason: string): void {
    const list = this.getDisputeCases();
    const item = list.find(c => c.id === caseId);
    if (item) {
      item.memberOpinion = {
        leaning,
        reason,
        submittedAt: new Date().toISOString()
      };
      this.setStored('board_disputes', list);
    }
  }

  // --- Reviewed Series ---
  getReviewedSeries(): ReviewedSeries[] {
    return this.getStored('board_reviewed_series', INITIAL_REVIEWED_SERIES);
  }

  getReviewedSeriesById(id: string): ReviewedSeries | undefined {
    return this.getReviewedSeries().find(s => s.id === id);
  }

  saveSeriesVote(seriesId: string, decision: 'APPROVE' | 'REJECT', note: string): void {
    const list = this.getReviewedSeries();
    const item = list.find(s => s.id === seriesId);
    if (item) {
      item.vote = {
        decision,
        note,
        submittedAt: new Date().toISOString()
      };
      this.setStored('board_reviewed_series', list);
    }
  }

  resetStore(): void {
    if (!this.isClient) return;
    localStorage.removeItem('board_queue_chapters');
    localStorage.removeItem('board_today_tasks');
    localStorage.removeItem('board_weekly_rankings');
    localStorage.removeItem('board_disputes');
    localStorage.removeItem('board_reviewed_series');
  }
}

export const boardStore = new BoardStore();
