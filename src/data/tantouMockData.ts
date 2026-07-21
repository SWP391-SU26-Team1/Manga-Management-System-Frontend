export interface TantouSeries {
  id: string;
  title: string;
  mangaka: string;
  genre: string;
  chapter: number;
  status: 'PUBLISHING' | 'IN REVIEW' | 'AT RISK' | 'PAUSED';
  schedule: string;
  ranking: number;
  rankingChange: number;
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  lastMeeting: string;
  isAtRisk?: boolean;
}

export const MOCK_TANTOU_SERIES: TantouSeries[] = [
  {
    id: 's1',
    title: 'Shadow Realm Chronicles',
    mangaka: 'Yamamoto Ren',
    genre: 'Shounen Action',
    chapter: 48,
    status: 'PUBLISHING',
    schedule: 'Hàng tuần',
    ranking: 3,
    rankingChange: 2,
    riskLevel: 'NONE',
    lastMeeting: '26/05/2026',
  },
  {
    id: 's2',
    title: 'Midnight Detective Agency',
    mangaka: 'Nakamura Yuki',
    genre: 'Mystery',
    chapter: 31,
    status: 'PUBLISHING',
    schedule: 'Hàng tháng',
    ranking: 7,
    rankingChange: 1,
    riskLevel: 'LOW',
    lastMeeting: '20/05/2026',
  },
  {
    id: 's3',
    title: "Dragon's Blood Legacy",
    mangaka: 'Tanaka Ryusei',
    genre: 'Fantasy',
    chapter: 12,
    status: 'IN REVIEW',
    schedule: 'Hai tuần/lần',
    ranking: 9,
    rankingChange: -1,
    riskLevel: 'MEDIUM',
    lastMeeting: '22/05/2026',
  },
  {
    id: 's4',
    title: 'Neon City Runners',
    mangaka: 'Inoue Hana',
    genre: 'Sci-Fi Action',
    chapter: 23,
    status: 'AT RISK',
    schedule: 'Hàng tuần',
    ranking: 18,
    rankingChange: -5,
    riskLevel: 'HIGH',
    lastMeeting: '25/05/2026',
    isAtRisk: true,
  },
  {
    id: 's5',
    title: 'Sakura High Chronicles',
    mangaka: 'Fujiwara Mei',
    genre: 'Romance / Slice of Life',
    chapter: 67,
    status: 'PAUSED',
    schedule: '—',
    ranking: 0,
    rankingChange: 0,
    riskLevel: 'NONE',
    lastMeeting: '01/04/2026',
  },
];

export const MOCK_TANTOU_STATS = {
  managingSeries: {
    total: 5,
    publishing: 3,
    atRisk: 1,
    paused: 1,
  },
  pendingReview: {
    total: 5,
    deadlineThisWeek: 2,
  },
  needRevision: {
    total: 3,
  },
  approvedThisMonth: {
    total: 12,
    changeFromLastMonth: 3,
  },
  overdue: {
    total: 2,
  },
  atRiskSeries: {
    total: 1,
    seriesName: 'Neon City Runners',
    ranking: 18,
  },
  todayOverview: {
    chaptersToReview: 5,
    newResubmissions: 1,
    riskAlerts: 2,
    reportsToSend: 1,
  }
};

export const MOCK_STUDIO_TASKS = [
  {
    id: 't1',
    series: 'Shadow Realm Chronicles',
    chapter: 'Ch.49',
    task: 'P.01 - P.05 Storyboard',
    assignee: 'Yamamoto Ren',
    role: 'Mangaka',
    status: 'Chờ review',
    deadline: '01/06/2026',
    progress: 100,
    isLate: false,
  },
  {
    id: 't2',
    series: 'Shadow Realm Chronicles',
    chapter: 'Ch.49',
    task: 'P.06 - P.12 Lineart',
    assignee: 'Sato Kenji',
    role: 'Assistant',
    status: 'Đang làm',
    deadline: '01/06/2026',
    progress: 70,
    isLate: false,
  },
  {
    id: 't3',
    series: 'Shadow Realm Chronicles',
    chapter: 'Ch.49',
    task: 'P.13 - P.20 Tone & Effect',
    assignee: 'Mori Ai',
    role: 'Assistant',
    status: 'Chờ nộp',
    deadline: '01/06/2026',
    progress: 20,
    isLate: false,
  },
  {
    id: 't4',
    series: 'Neon City Runners',
    chapter: 'Ch.23',
    task: 'P.02 Revise - Phối cảnh',
    assignee: 'Inoue Hana',
    role: 'Mangaka',
    status: 'Cần sửa',
    deadline: '30/05/2026',
    progress: 40,
    isLate: false,
  },
  {
    id: 't5',
    series: 'Neon City Runners',
    chapter: 'Ch.23',
    task: 'P.04 Revise - Thoại',
    assignee: 'Inoue Hana',
    role: 'Mangaka',
    status: 'Cần sửa',
    deadline: '30/05/2026',
    progress: 50,
    isLate: false,
  },
  {
    id: 't6',
    series: 'Neon City Runners',
    chapter: 'Ch.23',
    task: 'P.06 Lineart',
    assignee: 'Inoue Hana',
    role: 'Mangaka',
    status: 'Trễ hạn',
    deadline: '28/05/2026',
    progress: 0,
    isLate: true,
  },
  {
    id: 't7',
    series: "Dragon's Blood Legacy",
    chapter: 'Ch.13',
    task: 'P.01 - P.02 Storyboard',
    assignee: 'Tanaka Ryusei',
    role: 'Mangaka',
    status: 'Trễ hạn',
    deadline: '25/05/2026',
    progress: 0,
    isLate: true,
  },
  {
    id: 't8',
    series: "Dragon's Blood Legacy",
    chapter: 'Ch.13',
    task: 'P.03 Sketch',
    assignee: 'Tanaka Ryusei',
    role: 'Mangaka',
    status: 'Nguy cơ trễ',
    deadline: '25/05/2026',
    progress: 30,
    isLate: false,
  },
  {
    id: 't9',
    series: 'Midnight Detective Agency',
    chapter: 'Ch.32',
    task: 'P.03 Lineart',
    assignee: 'Nakamura Yuki',
    role: 'Mangaka',
    status: 'Chờ review',
    deadline: '15/06/2026',
    progress: 100,
    isLate: false,
  },
  {
    id: 't10',
    series: 'Midnight Detective Agency',
    chapter: 'Ch.32',
    task: 'P.01 - P.02 Tone & Background',
    assignee: 'Hayashi Tomo',
    role: 'Assistant',
    status: 'Đã duyệt',
    deadline: '15/06/2026',
    progress: 100,
    isLate: false,
  },
];

export const MOCK_PAGE_PROGRESS = [
  {
    id: 'c1',
    series: 'Shadow Realm Chronicles',
    chapter: 'Ch.49',
    submitDate: '28/05/2026',
    deadline: '01/06/2026',
    approvedCount: 0,
    totalCount: 5,
    progress: 0,
    pages: [
      { page: 'P.01', status: 'SUBMITTED', assignee: 'Yamamoto Ren', meetingDate: '26/05', deadline: '01/06', revisions: 0, notes: 'Cover page' },
      { page: 'P.02', status: 'SUBMITTED', assignee: 'Yamamoto Ren', meetingDate: '26/05', deadline: '01/06', revisions: 0, notes: '' },
      { page: 'P.03', status: 'SUBMITTED', assignee: 'Yamamoto Ren', meetingDate: '26/05', deadline: '01/06', revisions: 0, notes: '' },
      { page: 'P.04', status: 'SUBMITTED', assignee: 'Yamamoto Ren', meetingDate: '26/05', deadline: '01/06', revisions: 0, notes: '' },
      { page: 'P.05', status: 'SUBMITTED', assignee: 'Yamamoto Ren', meetingDate: '26/05', deadline: '01/06', revisions: 0, notes: 'Action sequence' },
    ]
  },
  {
    id: 'c2',
    series: 'Neon City Runners',
    chapter: 'Ch.23',
    submitDate: '25/05/2026',
    deadline: '30/05/2026',
    approvedCount: 2,
    totalCount: 6,
    progress: 33,
    isLate: true,
    latePagesCount: 1,
    pages: []
  },
  {
    id: 'c3',
    series: "Dragon's Blood Legacy",
    chapter: 'Ch.13',
    submitDate: '—',
    deadline: '25/05/2026',
    approvedCount: 0,
    totalCount: 4,
    progress: 0,
    isLate: true,
    latePagesCount: 2,
    pages: []
  },
  {
    id: 'c4',
    series: 'Midnight Detective Agency',
    chapter: 'Ch.32',
    submitDate: '20/05/2026',
    deadline: '15/06/2026',
    approvedCount: 2,
    totalCount: 3,
    progress: 67,
    pages: []
  }
];
