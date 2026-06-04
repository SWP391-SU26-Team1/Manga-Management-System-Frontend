export type UserRole = 'MANGAKA' | 'ASSISTANT' | 'EDITOR' | 'BOARD';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  password: string; // Chỉ dùng cho mock login, thực tế không lưu plain text
  role: UserRole;
  fullName: string;
  avatarUrl: string;
  bio: string;
  // Các trường dữ liệu để phục vụ thiết kế giao diện hồ sơ (Profile)
  stats: {
    followers?: number;
    projectsCompleted?: number;
    activeProjects?: number;
    rating?: number;
  };
  skills?: string[]; // Dành cho Trợ lý (Assistant)
  publications?: string[]; // Dành cho Mangaka/Editor
}

export const MOCK_USERS: UserProfile[] = [
  {
    id: 'usr_mangaka_001',
    username: 'mangaka_sensei',
    email: 'mangaka@mangaflow.com',
    password: 'Password123!',
    role: 'MANGAKA',
    fullName: 'Tokuda Oda',
    avatarUrl: 'https://i.pravatar.cc/150?u=mangaka_sensei',
    bio: 'Mangaka với hơn 10 năm kinh nghiệm. Đam mê xây dựng thế giới giả tưởng và phát triển nhân vật sâu sắc.',
    stats: {
      followers: 125000,
      projectsCompleted: 8,
      activeProjects: 2,
      rating: 4.9
    },
    publications: ['Biển Xanh Phiêu Lưu Ký', 'Hiệp Sĩ Lưu Ban']
  },
  {
    id: 'usr_assistant_001',
    username: 'assistant_ken',
    email: 'assistant@mangaflow.com',
    password: 'Password123!',
    role: 'ASSISTANT',
    fullName: 'Kenji Tanaka',
    avatarUrl: 'https://i.pravatar.cc/150?u=assistant_ken',
    bio: 'Trợ lý họa sĩ chuyên về vẽ bối cảnh (background) và đánh bóng (toning). Tốc độ cao, tỉ mỉ và đúng deadline.',
    stats: {
      projectsCompleted: 45,
      activeProjects: 4,
      rating: 4.8
    },
    skills: ['Backgrounds', 'Inking', 'Screen Tones', 'Clip Studio Paint Pro']
  },
  {
    id: 'usr_editor_001',
    username: 'editor_akira',
    email: 'editor@mangaflow.com',
    password: 'Password123!',
    role: 'EDITOR',
    fullName: 'Akira Watanabe',
    avatarUrl: 'https://i.pravatar.cc/150?u=editor_akira',
    bio: 'Biên tập viên kỳ cựu. Chuyên mài giũa kịch bản, tối ưu hóa nhịp truyện (pacing) và định hướng thị trường.',
    stats: {
      projectsCompleted: 120,
      activeProjects: 15,
      rating: 5.0
    },
    publications: ['Tuyển tập Manga Hàng Tuần', 'Shonen Jump (Quản lý dự án)']
  },
  {
    id: 'usr_board_001',
    username: 'board_member',
    email: 'board@mangaflow.com',
    password: 'Password123!',
    role: 'BOARD',
    fullName: 'Minamoto Shizuka',
    avatarUrl: 'https://i.pravatar.cc/150?u=board_member',
    bio: 'Trưởng ban biên tập và thẩm định dự án mới với hơn 15 năm kinh nghiệm tại Gangan Press.',
    stats: {
      projectsCompleted: 240,
      activeProjects: 32,
      rating: 4.9
    },
    publications: ['Báo cáo Xuất bản Thường niên', 'Hội đồng Duyệt Serialization']
  }
];

// Hàm giả lập (mock) để kiểm tra đăng nhập
export const mockAuthenticate = (identifier: string, pass: string): UserProfile | null => {
  const user = MOCK_USERS.find(
    (u) => (u.username === identifier || u.email === identifier) && u.password === pass
  );
  return user || null;
};
