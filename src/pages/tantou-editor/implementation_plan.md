# Kế hoạch triển khai Tantou Editor Dashboard

Dựa trên 15 màn hình Figma và yêu cầu hệ thống Manga Creation Workflow, tôi sẽ xây dựng toàn bộ chức năng cho Tantou Editor.

## Proposed Changes

### 1. Dữ liệu giả lập (Mock Data)
#### [NEW] [tantouMockData.ts](file:///c:/Users/admin/Documents/Manga-Management-System-Frontend-main/Manga-Management-System-Frontend-main/src/data/tantouMockData.ts)
- Tạo file chứa toàn bộ dữ liệu mẫu: Danh sách series, thông báo, tiến độ chapter/page, dữ liệu review, ranking, báo cáo, team members, v.v.

### 2. Các thành phần dùng chung (Shared Components)
#### [NEW] [TantouComponents.tsx](file:///c:/Users/admin/Documents/Manga-Management-System-Frontend-main/Manga-Management-System-Frontend-main/src/components/tantou/TantouComponents.tsx)
- Các component dùng chung như thẻ (Card), nhãn trạng thái (Badge), thanh tiến độ (ProgressBar) theo phong cách Neo-brutalist (viền đen, bóng đổ cứng).

### 3. Cập nhật Routing
#### [MODIFY] [TantouRoutes.tsx](file:///c:/Users/admin/Documents/Manga-Management-System-Frontend-main/Manga-Management-System-Frontend-main/src/routes/tantou/TantouRoutes.tsx)
- Đăng ký toàn bộ 13 route (Trang chủ, Series, Chapters, Studio Progress, Review, Feedback, Workflow, Alerts, Ranking, Reports, Series Defense, Team, Settings).

### 4. Triển khai các trang (Pages)
#### [MODIFY] [TantouDashboardPage.tsx](file:///c:/Users/admin/Documents/Manga-Management-System-Frontend-main/Manga-Management-System-Frontend-main/src/pages/tantou-editor/TantouDashboardPage.tsx)
- Rebuild Trang Chủ: Thống kê tổng quan (6 cards), Thông báo gần đây, Deadline sắp tới, Truy cập nhanh, Tổng quan hôm nay.

#### [NEW] [SeriesManagementPage.tsx](file:///c:/Users/admin/Documents/Manga-Management-System-Frontend-main/Manga-Management-System-Frontend-main/src/pages/tantou-editor/SeriesManagementPage.tsx)
- Bảng danh sách Series phụ trách, có thể mở rộng hàng để xem chi tiết và hành động nhanh.

#### [NEW] [PageProgressPage.tsx](file:///c:/Users/admin/Documents/Manga-Management-System-Frontend-main/Manga-Management-System-Frontend-main/src/pages/tantou-editor/PageProgressPage.tsx)
- Accordion danh sách Chapter/Page, hiển thị trạng thái từng trang (Submitted, Approved, etc.) và nút Sửa/Duyệt.

#### [MODIFY] [StudioProgressPage.tsx](file:///c:/Users/admin/Documents/Manga-Management-System-Frontend-main/Manga-Management-System-Frontend-main/src/pages/tantou-editor/StudioProgressPage.tsx)
- Rebuild bảng tiến độ Studio: Lọc theo tab, hiển thị % tiến độ từng Task, ai đang phụ trách.

#### [MODIFY] [ManuscriptReviewPage.tsx](file:///c:/Users/admin/Documents/Manga-Management-System-Frontend-main/Manga-Management-System-Frontend-main/src/pages/tantou-editor/ManuscriptReviewPage.tsx)
- Rebuild công cụ Review: Giao diện 3 cột (Danh sách - Viewer - Hành động), hỗ trợ vẽ vùng đánh dấu (Annotation), nút Approve/Reject.

#### [NEW] [FeedbackResubmitPage.tsx](file:///c:/Users/admin/Documents/Manga-Management-System-Frontend-main/Manga-Management-System-Frontend-main/src/pages/tantou-editor/FeedbackResubmitPage.tsx)
- Quản lý các bản thảo có feedback, xem chi tiết và so sánh bản cũ/mới.

#### [NEW] [ApprovalWorkflowPage.tsx](file:///c:/Users/admin/Documents/Manga-Management-System-Frontend-main/Manga-Management-System-Frontend-main/src/pages/tantou-editor/ApprovalWorkflowPage.tsx)
- Timeline duyệt đa giai đoạn và quản lý đề xuất lên Ban Biên Tập.

#### [NEW] [AlertsPage.tsx](file:///c:/Users/admin/Documents/Manga-Management-System-Frontend-main/Manga-Management-System-Frontend-main/src/pages/tantou-editor/AlertsPage.tsx)
- Quản lý Cảnh báo rủi ro (Nghiêm trọng, Cao, Trung bình).

#### [NEW] [RankingPerformancePage.tsx](file:///c:/Users/admin/Documents/Manga-Management-System-Frontend-main/Manga-Management-System-Frontend-main/src/pages/tantou-editor/RankingPerformancePage.tsx)
- Giao diện thống kê xếp hạng, biểu đồ, và bình luận nổi bật.

#### [NEW] [EditorialReportsPage.tsx](file:///c:/Users/admin/Documents/Manga-Management-System-Frontend-main/Manga-Management-System-Frontend-main/src/pages/tantou-editor/EditorialReportsPage.tsx)
- Quản lý báo cáo bản thảo, có tính năng tạo mới báo cáo.

#### [MODIFY] [RecoveryProposalPage.tsx](file:///c:/Users/admin/Documents/Manga-Management-System-Frontend-main/Manga-Management-System-Frontend-main/src/pages/tantou-editor/RecoveryProposalPage.tsx)
- Rebuild trang Đề xuất phục hồi: Form tạo đề xuất và danh sách các đề xuất.

#### [NEW] [TeamManagementPage.tsx](file:///c:/Users/admin/Documents/Manga-Management-System-Frontend-main/Manga-Management-System-Frontend-main/src/pages/tantou-editor/TeamManagementPage.tsx)
- Hiển thị danh sách Nhóm làm việc (dạng thẻ lưới) với khối lượng công việc.

#### [NEW] [TantouSettingsPage.tsx](file:///c:/Users/admin/Documents/Manga-Management-System-Frontend-main/Manga-Management-System-Frontend-main/src/pages/tantou-editor/TantouSettingsPage.tsx)
- Giao diện cài đặt cơ bản.

## User Review Required
> [!IMPORTANT]
> Do số lượng trang khá lớn (12 trang), tôi dự định sẽ làm theo các đợt (batches):
> - **Đợt 1**: Mock Data, Cập nhật Router, Trang Chủ, Series Phụ Trách.
> - **Đợt 2**: Chapter / Page, Tiến Độ Studio, Review Bản Thảo.
> - **Đợt 3**: Các trang còn lại (Phản hồi, Workflow, Alerts, Ranking, Reports, Defense, Team).

Bạn có đồng ý với kế hoạch và cách phân chia này không để tôi tiến hành Đợt 1 ngay bây giờ?
