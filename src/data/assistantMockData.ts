// --- Types & Interfaces for Assistant ---

export interface AssistantTask {
  id: string;
  seriesTitle: string;
  chapterNumber: number;
  pageNumber: number;
  layerType: string;
  assignedBy: string; // Họa sĩ chính (Mangaka)
  deadline: string;
  status: 'Not Started' | 'In Progress' | 'Submitted' | 'Need Fix' | 'Approved';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  note: string;
  referenceUrl?: string; // Link ảnh/tài liệu tham khảo
  regionId?: string; // Bounding box region ID
  createdAt?: string;
  assignedById?: string;
  assignedByAvatar?: string;
}

export interface AssistantSubmission {
  id: string;
  taskId: string;
  seriesTitle: string;
  chapterNumber: number;
  pageNumber: number;
  layerType: string;
  submittedAt: string;
  previewUrl: string;
  fileName: string;
  note: string;
  status: 'Pending' | 'Approved' | 'Need Fix';
  feedback?: string; // Nhận xét từ Mangaka
}

// --- Login Credentials Info ---
export const ASSISTANT_LOGIN_CREDENTIALS = {
  email: 'assistant@mangaflow.com',
  username: 'assistant_ken',
  password: 'Password123!',
  fullName: 'Kenji Tanaka',
  role: 'ASSISTANT',
};

// --- Initial Mock Data for Assistant Panel ---

export const ASSISTANT_TASKS: AssistantTask[] = [
  {
    id: '1042',
    seriesTitle: 'Sakura High',
    chapterNumber: 3,
    pageNumber: 1,
    layerType: 'Character Lineart',
    assignedBy: 'Akira Tanaka',
    deadline: '2026-05-24',
    status: 'Need Fix', // REVISION
    priority: 'High',
    note: 'Biểu cảm nhân vật cần mạnh hơn ở panel 3-5. Đặc biệt ánh mắt của Hiroshi khi đối đầu với kẻ địch cần thể hiện sự giận dữ và kiên quyết hơn.'
  },
  {
    id: '1040',
    seriesTitle: 'Cyber Ronin',
    chapterNumber: 2,
    pageNumber: 1,
    layerType: 'Character Design Sheet',
    assignedBy: 'Akira Tanaka',
    deadline: '2026-05-19',
    status: 'Need Fix', // REVISION
    priority: 'Medium',
    note: 'Nếp gấp quần áo của nhân vật chính trong tư thế chiến đấu trông hơi cứng. Cần làm cho nó mềm mại và tự nhiên hơn.'
  },
  {
    id: '1051',
    seriesTitle: 'Dark Rising Chronicles',
    chapterNumber: 15,
    pageNumber: 1,
    layerType: 'SFX Design',
    assignedBy: 'Akira Tanaka',
    deadline: '2026-05-21',
    status: 'Need Fix', // REVISION
    priority: 'Urgent',
    note: 'Hiệu ứng chữ \'BOOM\' cần nét vẽ gai góc và sắc nhọn hơn để thể hiện uy lực của cú đấm.'
  },
  {
    id: '1041',
    seriesTitle: 'Dark Rising Chronicles',
    chapterNumber: 14,
    pageNumber: 1,
    layerType: 'Tone & Effect',
    assignedBy: 'Akira Tanaka',
    deadline: '2026-05-23',
    status: 'Submitted', // REVIEW
    priority: 'Medium',
    note: 'Độ phân giải hiệu ứng lưới sàng (screentone) ở trang 14 bị moiré. Hãy xuất file ảnh chất lượng cao hơn hoặc đổi kiểu screentone khác.'
  },
  {
    id: '1045',
    seriesTitle: 'Phantom Guild',
    chapterNumber: 9,
    pageNumber: 1,
    layerType: 'Action Sequence Lineart',
    assignedBy: 'Akira Tanaka',
    deadline: '2026-05-19',
    status: 'Submitted', // REVIEW
    priority: 'High',
    note: 'Đi nét phân cảnh hành động chiến đấu trên nóc tòa nhà. Tốc độ di chuyển của nhân vật chưa được lột tả rõ.'
  },
  {
    id: '1039',
    seriesTitle: 'Moonlight Academy',
    chapterNumber: 7,
    pageNumber: 1,
    layerType: 'Thêm Nền',
    assignedBy: 'Akira Tanaka',
    deadline: '2026-05-20',
    status: 'In Progress', // PENDING
    priority: 'Medium',
    note: 'Cảnh nền phòng học đang hơi trống trải. Hãy thêm một vài quyển sách trên bàn và một bức tranh vẽ trên bảng đen.'
  },
  {
    id: '1032',
    seriesTitle: 'Phantom Guild',
    chapterNumber: 1,
    pageNumber: 1,
    layerType: 'Background',
    assignedBy: 'Akira Tanaka',
    deadline: '2026-04-28',
    status: 'Approved',
    priority: 'Low',
    note: 'Thiết kế chi tiết nhân vật chính (Character Sheet Vol.1). Đi nét rõ ràng, phân bổ chiều cao hợp lý.'
  },
  {
    id: '1033',
    seriesTitle: 'Sakura High',
    chapterNumber: 2,
    pageNumber: 1,
    layerType: 'Coloring',
    assignedBy: 'Akira Tanaka',
    deadline: '2026-05-05',
    status: 'Approved',
    priority: 'High',
    note: 'Tô màu trang bìa Tập 2 (Cover Vol.2). Sử dụng gam màu hồng pastel tươi sáng.'
  },
  {
    id: '1034',
    seriesTitle: 'Moonlight Academy',
    chapterNumber: 8,
    pageNumber: 4,
    layerType: 'Background',
    assignedBy: 'Akira Tanaka',
    deadline: '2026-05-08',
    status: 'Approved',
    priority: 'Medium',
    note: 'Vẽ bối cảnh hành lang lớp học buổi tối (Background Ch.8). Chú ý đổ bóng cửa sổ.'
  },
  {
    id: '1035',
    seriesTitle: 'Steel Warriors',
    chapterNumber: 11,
    pageNumber: 2,
    layerType: 'Line Art',
    assignedBy: 'Akira Tanaka',
    deadline: '2026-05-10',
    status: 'Approved',
    priority: 'High',
    note: 'Đi nét chi tiết robot chiến đấu (Lineart Ch.11). Đường nét sắc sảo, dứt khoát.'
  },
  {
    id: '1036',
    seriesTitle: 'Dark Rising Chronicles',
    chapterNumber: 5,
    pageNumber: 1,
    layerType: 'Background',
    assignedBy: 'Akira Tanaka',
    deadline: '2026-05-14',
    status: 'Approved',
    priority: 'Medium',
    note: 'Đi nét bối cảnh thành phố hoang tàn sau trận chiến (Background Lineart).'
  },
  {
    id: '1037',
    seriesTitle: 'Steel Warriors',
    chapterNumber: 3,
    pageNumber: 1,
    layerType: 'Coloring',
    assignedBy: 'Akira Tanaka',
    deadline: '2026-05-16',
    status: 'Approved',
    priority: 'High',
    note: 'Tô màu poster quảng bá chương mới (Cover Art). Dùng màu tương phản cao.'
  },
  {
    id: '1046',
    seriesTitle: 'Moonlight Academy',
    chapterNumber: 8,
    pageNumber: 5,
    layerType: 'Background',
    assignedBy: 'Akira Tanaka',
    deadline: '2026-05-20',
    status: 'In Progress',
    priority: 'Medium',
    note: 'Vẽ bối cảnh thư viện trường học.'
  },
  {
    id: '1047',
    seriesTitle: 'Sakura High',
    chapterNumber: 3,
    pageNumber: 12,
    layerType: 'Speech Balloon',
    assignedBy: 'Akira Tanaka',
    deadline: '2026-05-21',
    status: 'In Progress',
    priority: 'Low',
    note: 'Chèn và căn chỉnh bong bóng thoại cho trang 12.'
  },
  {
    id: '1048',
    seriesTitle: 'Dark Rising Chronicles',
    chapterNumber: 6,
    pageNumber: 8,
    layerType: 'SFX',
    assignedBy: 'Akira Tanaka',
    deadline: '2026-05-22',
    status: 'In Progress',
    priority: 'High',
    note: 'Vẽ hiệu ứng vụ nổ năng lượng.'
  },
  {
    id: '1049',
    seriesTitle: 'Phantom Guild',
    chapterNumber: 13,
    pageNumber: 2,
    layerType: 'Line Art',
    assignedBy: 'Akira Tanaka',
    deadline: '2026-05-25',
    status: 'Submitted',
    priority: 'High',
    note: 'Đi nét phác thảo phòng họp hội kín.'
  },
  {
    id: '1050',
    seriesTitle: 'Steel Warriors',
    chapterNumber: 12,
    pageNumber: 7,
    layerType: 'Background',
    assignedBy: 'Akira Tanaka',
    deadline: '2026-05-26',
    status: 'Submitted',
    priority: 'Medium',
    note: 'Vẽ nền khoang lái robot.'
  },
  {
    id: '1052',
    seriesTitle: 'Steel Warriors',
    chapterNumber: 13,
    pageNumber: 4,
    layerType: 'SFX',
    assignedBy: 'Akira Tanaka',
    deadline: '2026-05-30',
    status: 'Need Fix',
    priority: 'High',
    note: 'Chỉnh lại hiệu ứng tia lửa điện. Đang bị thưa quá.'
  },
  {
    id: '1053',
    seriesTitle: 'Sakura High',
    chapterNumber: 4,
    pageNumber: 2,
    layerType: 'Coloring',
    assignedBy: 'Akira Tanaka',
    deadline: '2026-05-31',
    status: 'Need Fix',
    priority: 'Medium',
    note: 'Sửa lại tông màu da của nhân vật phụ dưới nắng chiều.'
  },
  {
    id: '1054',
    seriesTitle: 'Phantom Guild',
    chapterNumber: 14,
    pageNumber: 1,
    layerType: 'Panel Frame',
    assignedBy: 'Akira Tanaka',
    deadline: '2026-06-02',
    status: 'Not Started',
    priority: 'Low',
    note: 'Kẻ khung tranh cơ bản cho chương mới.'
  },
  {
    id: '1055',
    seriesTitle: 'Moonlight Academy',
    chapterNumber: 10,
    pageNumber: 3,
    layerType: 'Speech Balloon',
    assignedBy: 'Akira Tanaka',
    deadline: '2026-06-04',
    status: 'Not Started',
    priority: 'Low',
    note: 'Gõ chữ thoại cho các phân cảnh của Sensei.'
  },
  {
    id: '1056',
    seriesTitle: 'Steel Warriors',
    chapterNumber: 14,
    pageNumber: 10,
    layerType: 'Background',
    assignedBy: 'Akira Tanaka',
    deadline: '2026-06-05',
    status: 'Not Started',
    priority: 'Medium',
    note: 'Vẽ bối cảnh thành phố tương lai nhìn từ xa.'
  }
];

export const ASSISTANT_SUBMISSIONS: AssistantSubmission[] = [
  {
    id: 'sub_ast_001',
    taskId: '1032',
    seriesTitle: 'Phantom Guild',
    chapterNumber: 1,
    pageNumber: 1,
    layerType: 'Background',
    submittedAt: '2026-04-27 14:30',
    previewUrl: 'https://images.unsplash.com/photo-1568667256549-094345857637?q=80&w=600&auto=format&fit=crop',
    fileName: 'bg_ch1_page1_guild_v2.png',
    note: 'Em đã vẽ xong nền Phantom Guild và đi nét chi tiết. Nhờ Sensei duyệt giúp em!',
    status: 'Approved',
    feedback: 'Nền vẽ rất tốt, đúng tinh thần Phantom. Tốt lắm!',
  },
  {
    id: 'sub_ast_002',
    taskId: '1051',
    seriesTitle: 'Moonlight Academy',
    chapterNumber: 9,
    pageNumber: 1,
    layerType: 'Line Art',
    submittedAt: '2026-06-03 09:15',
    previewUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=600&auto=format&fit=crop',
    fileName: 'lineart_moon_ch9_p1.png',
    note: 'Em nộp nét vẽ nhân vật trang 1 ạ.',
    status: 'Need Fix',
    feedback: 'Sửa lại cơ mặt nhân vật chính lúc ngạc nhiên. Nét vẽ hiện tại chưa đủ lực.',
  }
];

class AssistantStore {
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

  getTasks(): AssistantTask[] {
    return this.getStored('assistant_tasks', ASSISTANT_TASKS);
  }

  getSubmissions(): AssistantSubmission[] {
    return this.getStored('assistant_submissions', ASSISTANT_SUBMISSIONS);
  }

  updateTaskStatus(taskId: string, status: AssistantTask['status']): void {
    const list = this.getTasks();
    const task = list.find(t => t.id === taskId);
    if (task) {
      task.status = status;
      this.setStored('assistant_tasks', list);
    }
  }

  addSubmission(submission: Omit<AssistantSubmission, 'id' | 'submittedAt' | 'status'>): AssistantSubmission {
    const list = this.getSubmissions();
    const newSub: AssistantSubmission = {
      ...submission,
      id: `sub_ast_${String(list.length + 1).padStart(3, '0')}`,
      submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'Pending',
    };
    list.push(newSub);
    this.setStored('assistant_submissions', list);

    // Also update the corresponding task's status
    this.updateTaskStatus(submission.taskId, 'Submitted');

    return newSub;
  }

  resetStore(): void {
    if (!this.isClient) return;
    localStorage.removeItem('assistant_tasks');
    localStorage.removeItem('assistant_submissions');
  }
}

export const assistantStore = new AssistantStore();

