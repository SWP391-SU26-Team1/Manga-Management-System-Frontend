# MangaFlow - Hệ thống Quản lý Quy trình Sáng tác và Xuất bản Manga (Frontend)

MangaFlow là hệ thống hỗ trợ quản lý quy trình khép kín từ phác thảo kịch bản, vẽ bản thảo, phân công trợ lý đến kiểm duyệt của Biên tập viên và phê duyệt xuất bản của Hội đồng.

## 🛠 Công nghệ Sử dụng
Hệ thống Frontend được xây dựng dựa trên các công nghệ hiện đại:
* **Framework**: React JS (phiên bản 18+)
* **Build Tool**: Vite (cho tốc độ khởi động và HMR cực nhanh)
* **Ngôn ngữ**: TypeScript (đảm bảo an toàn kiểu dữ liệu)
* **Styling**: Tailwind CSS
* **Kết nối API**: Axios
* **Real-time**: Socket.io Client (nhận thông báo thời gian thực)
* **Icons**: Lucide React

---

## 👥 Các Vai trò trong Hệ thống (Roles)
Hệ thống phân quyền chi tiết cho 4 nhóm người dùng chính:

1. **Tác giả (Mangaka)**
   * Tạo và quản lý tác phẩm (Series), chương truyện (Chapter).
   * Soạn thảo và nộp kịch bản, bản thảo lên Biên tập viên (Tantou).
   * Phân công nhiệm vụ (inking, coloring, SFX, background...) và giao tài nguyên cho Trợ lý.
   * Duyệt bản vẽ của Trợ lý gửi lên, chấm điểm vùng lỗi cần sửa.
   * Nhận phản hồi/cảnh báo thứ hạng từ Hội đồng.

2. **Trợ lý (Assistant)**
   * Xem và nhận nhiệm vụ được giao bởi Mangaka.
   * Giao diện vẽ chi tiết có đánh dấu khoanh vùng nhiệm vụ.
   * Tải tài nguyên, báo cáo tiến độ và nộp kết quả vẽ lên cho tác giả.

3. **Biên tập viên trực tiếp (Tantou Editor)**
   * Quản lý các Series được giao theo dõi.
   * Phản hồi kịch bản, duyệt và đưa ra ý kiến chỉnh sửa bản thảo của Mangaka.

4. **Hội đồng biên tập (Editorial Board) & Admin**
   * Đọc bản thảo chương mới, chấm điểm chất lượng và thảo luận.
   * Thực hiện quy trình bỏ phiếu biểu quyết phê duyệt xuất bản.
   * Đưa ra quyết định xuất bản chính thức hoặc cảnh báo/tạm ngưng tác phẩm.

---

## 📂 Cấu trúc Thư mục Chính
```bash
src/
├── components/          # Các Component dùng chung (ví dụ: Toast, Sidebar...)
├── contexts/            # Context API quản lý trạng thái toàn cục (Auth, Notifications...)
├── data/                # Dữ liệu Mock ban đầu phục vụ phát triển giao diện
├── layouts/             # Giao diện khung (Layout) tương ứng với từng nhóm vai trò
├── pages/               # Các trang giao diện chính
│   ├── auth/            # Đăng nhập, Đăng ký
│   ├── assistant/       # Giao diện của Trợ lý vẽ
│   ├── mangaka/          # Giao diện của Tác giả truyện
│   ├── tantou-editor/   # Giao diện của Biên tập viên trực tiếp
│   └── editorial-board/ # Giao diện của Ban biên tập/Hội đồng chấm điểm
├── routes/              # Cấu hình phân tuyến định tuyến (React Router)
└── services/            # Các lớp gọi REST API và Websocket kết nối Backend
```

---

## 🚀 Hướng dẫn Khởi chạy Cục bộ (Local setup)

### 1. Cài đặt các thư viện phụ thuộc
Di chuyển vào thư mục dự án `frontend` và chạy:
```bash
npm install
```

### 2. Cấu hình biến môi trường
Tạo file `.env` ở thư mục gốc của frontend (nếu chưa có) và trỏ API về server backend:
```env
VITE_API_URL=http://localhost:5000
```

### 3. Khởi chạy Server Phát triển (Development)
Chạy lệnh sau để bật dự án ở chế độ local:
```bash
npm run dev
```
Trình duyệt sẽ tự động mở hoặc bạn có thể truy cập qua địa chỉ: **[http://localhost:5173](http://localhost:5173)**.

---

## 📡 Kết nối Real-time (Socket.io)
Dự án sử dụng Socket.io để đẩy thông báo trực tiếp từ Backend tới Client. Cấu hình được tập trung xử lý tại `src/contexts/NotificationContext.tsx`:
* Kết nối được bảo mật thông qua việc gửi kèm mã JWT token của người dùng đăng nhập trong phần `auth`.
* Lắng nghe sự kiện `notification:new` để hiển thị popup toast thời gian thực.
