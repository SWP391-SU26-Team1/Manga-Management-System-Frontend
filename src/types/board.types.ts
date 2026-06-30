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
  isPinned?: boolean;
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
