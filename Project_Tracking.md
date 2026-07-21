# 📊 Bảng Theo Dõi Tiến Độ Dự Án (Project Tracking)

Tài liệu này được tự động chuyển đổi từ file `Template1_Project Tracking.xlsx - Project.tsv` ở thư mục Downloads để bạn dễ dàng theo dõi.

### 📈 Thống Kê Tiến Độ Chung
- **Tổng số tính năng:** 60
- **Hoàn thành (Done):** ✅ 55 (91.7%)
- **Đang thực hiện (Doing):** ⏳ 1 (1.7%)
- **Chưa bắt đầu (To Do):** 📋 4 (6.7%)

### 👥 Phân Chia Công Việc Theo Developer
- **Lê Hồ Gia Bảo:** 18/19 hoàn thành (95%)
- **Trần Tấn Phát:** 8/9 hoàn thành (89%)
- **Huỳnh Ngọc Công Luân:** 14/14 hoàn thành (100%)
- **Trương Tam Phong:** 10/12 hoàn thành (83%)
- **A:** 0/1 hoàn thành (0%)
- **Nguyễn Minh Phúc:** 5/5 hoàn thành (100%)

---

## 🗓️ Bảng Phân Công Chi Tiết (Master Table)

| # | Màn hình / Chức năng | Vai Trò (Actor) | Người Phụ Trách | Trạng Thái | Độ Phức Tạp |
|:-:|:---|:---|:---|:---:|:---:|
| 1 | [Mangaka Dashboard](#1-mangaka-dashboard) | Mangaka | Lê Hồ Gia Bảo | ✅ **Done** | 🟡 Medium |
| 2 | [Series Management](#2-series-management) | Mangaka | Lê Hồ Gia Bảo | ✅ **Done** | 🔴 Complex |
| 3 | [Manuscript & Page Management](#3-manuscript-page-management) | Mangaka | Lê Hồ Gia Bảo | ✅ **Done** | 🔴 Complex |
| 4 | [Submission & Editorial Review](#4-submission-editorial-review) | Mangaka | Lê Hồ Gia Bảo | ✅ **Done** | 🔴 Complex |
| 5 | [Assistant & Task Management](#5-assistant-task-management) | Mangaka | Lê Hồ Gia Bảo | ✅ **Done** | 🔴 Complex |
| 6 | [Feedback & Communication](#6-feedback-communication) | Mangaka | Lê Hồ Gia Bảo | ✅ **Done** | 🟡 Medium |
| 7 | [Feedback & Communication](#7-feedback-communication) | Mangaka | Lê Hồ Gia Bảo | ✅ **Done** | 🟡 Medium |
| 8 | [Workflow Risk & Recovery](#8-workflow-risk-recovery) | Mangaka | Lê Hồ Gia Bảo | ✅ **Done** | 🟢 Simple |
| 9 | [Notifications Center](#9-notifications-center) | Mangaka | Lê Hồ Gia Bảo | ✅ **Done** | 🟢 Simple |
| 10 | [Profile](#10-profile) | Mangaka | Lê Hồ Gia Bảo | 📋 **To Do** | 🟢 Simple |
| 11 | [Assistant Dashboard](#11-assistant-dashboard) | Assitant | Lê Hồ Gia Bảo | ✅ **Done** | 🟢  |
| 12 | [Task Management & Submissions](#12-task-management-submissions) | Assistant | Lê Hồ Gia Bảo | ✅ **Done** | 🔴 Complex |
| 13 | [Canvas & Drawing Studio](#13-canvas-drawing-studio) | Assistant | Lê Hồ Gia Bảo | ✅ **Done** | 🔴 Complex |
| 14 | [AI Manga Workspace](#14-ai-manga-workspace) | Assistant | Lê Hồ Gia Bảo | ✅ **Done** | 🔴 Complex |
| 15 | [Task Feedback & Annotations](#15-task-feedback-annotations) | Assistant | Lê Hồ Gia Bảo | ✅ **Done** | 🟡 Medium |
| 16 | [Income & Performance Reports](#16-income-performance-reports) | Assistant | Lê Hồ Gia Bảo | ✅ **Done** | 🟡 Medium |
| 17 | [Notifications Center](#17-notifications-center) | Assistant | Lê Hồ Gia Bảo | ✅ **Done** | 🟢 Simple |
| 18 | [Profile](#18-profile) | Assistant | Lê Hồ Gia Bảo | ✅ **Done** | 🟢 Simple |
| 19 | [User Login](#19-user-login) | User | Lê Hồ Gia Bảo | ✅ **Done** | 🔴 Complex |
| 20 | [Basic CURD API](#20-basic-curd-api) | All role | Trần Tấn Phát | ✅ **Done** | 🟢 Simple |
| 21 | [Access token and refresh token](#21-access-token-and-refresh-token) | All role | Trần Tấn Phát | ✅ **Done** | 🟢 Simple |
| 22 | [Implemment AI](#22-implemment-ai) | User | Trần Tấn Phát | ⏳ **Doing** | 🔴 Complex |
| 23 | [Mamgement vote public manga screen](#23-mamgement-vote-public-manga-screen) | Amin | Trần Tấn Phát | ✅ **Done** | 🟡 Medium |
| 24 | [Mamgement Series, Chapter & Tasks screen](#24-mamgement-series-chapter-tasks-screen) | Amin | Trần Tấn Phát | ✅ **Done** | 🟢 Simple |
| 25 | [User Management screen](#25-user-management-screen) | Amin | Trần Tấn Phát | ✅ **Done** | 🟢 Simple |
| 26 | [Page Task API](#26-page-task-api) | Mangaka | Trần Tấn Phát | ✅ **Done** | 🟢 Simple |
| 27 | [Hostting backend and Database](#27-hostting-backend-and-database) | Assistant | Trần Tấn Phát | ✅ **Done** | 🔴 Complex |
| 28 | [Sync Notifications & Status](#28-sync-notifications-status) | All role | Trần Tấn Phát | ✅ **Done** | 🟢 Simple |
| 29 | [Editorial Board Dashboard](#29-editorial-board-dashboard) | Editorial Board | Huỳnh Ngọc Công Luân | ✅ **Done** | 🟡 Medium |
| 30 | [Proposals List](#30-proposals-list) | Editorial Board | Huỳnh Ngọc Công Luân | ✅ **Done** | 🟡 Medium |
| 31 | [Series Approval](#31-series-approval) | Editorial Board | Huỳnh Ngọc Công Luân | ✅ **Done** | 🟡 Medium |
| 32 | [Series Review Detail](#32-series-review-detail) | Editorial Board | Huỳnh Ngọc Công Luân | ✅ **Done** | 🔴 Complex |
| 33 | [Read Draft](#33-read-draft) | Editorial Board | Huỳnh Ngọc Công Luân | ✅ **Done** | 🔴 Complex |
| 34 | [Score Page](#34-score-page) | Editorial Board | Huỳnh Ngọc Công Luân | ✅ **Done** | 🟡 Medium |
| 35 | [Vote Page](#35-vote-page) | Editorial Board | Huỳnh Ngọc Công Luân | ✅ **Done** | 🟡 Medium |
| 36 | [Rankings](#36-rankings) | Editorial Board | Huỳnh Ngọc Công Luân | ✅ **Done** | 🟡 Medium |
| 37 | [History](#37-history) | Editorial Board | Huỳnh Ngọc Công Luân | ✅ **Done** | 🔴 Complex |
| 38 | [User Home Page](#38-user-home-page) | User | Trương Tam Phong | ✅ **Done** | 🟡 Medium |
| 39 | [Search & Filter](#39-search-filter) | User | Trương Tam Phong | ✅ **Done** | 🟡 Medium |
| 40 | [Series Detail](#40-series-detail) | User | Trương Tam Phong | ✅ **Done** | 🔴 Complex |
| 41 | [Chapter Reader](#41-chapter-reader) | User | Trương Tam Phong | ✅ **Done** | 🔴 Complex |
| 42 | [Rankings](#42-rankings) | User | Trương Tam Phong | ✅ **Done** | 🔴 Complex |
| 43 | [Reading History](#43-reading-history) | User | Trương Tam Phong | ✅ **Done** | 🔴 Complex |
| 44 | [User Profile](#44-user-profile) | User | Trương Tam Phong | ✅ **Done** | 🟡 Medium |
| 45 | [User Settings](#45-user-settings) | User | Trương Tam Phong | 📋 **To Do** | 🟢 Simple |
| 46 | [Web Preferences](#46-web-preferences) | User | Trương Tam Phong | ✅ **Done** | 🔴 Complex |
| 47 | [Notifications New Series](#47-notifications-new-series) | User | Trương Tam Phong | ✅ **Done** | 🟢 Simple |
| 48 | [Manga List](#48-manga-list) | User | Trương Tam Phong | ✅ **Done** | 🟢 Simple |
| 49 | [Request Update Role](#49-request-update-role) | User | Trương Tam Phong | 📋 **To Do** | 🔴 Complex |
| 50 | [User Login](#50-user-login) | User | A | 📋 **To Do** | 🔴 Complex |
| 51 | [Add Api Draft](#51-add-api-draft) | Assitant | Nguyễn Minh Phúc | ✅ **Done** | 🟢 Simple |
| 52 | [Add Api Chapter Grade](#52-add-api-chapter-grade) | Editor Board | Huỳnh Ngọc Công Luân | ✅ **Done** | 🟢 Simple |
| 53 | [Add Api Chapter Vote](#53-add-api-chapter-vote) | Editor Board | Huỳnh Ngọc Công Luân | ✅ **Done** | 🟢 Simple |
| 54 | [Add Api Comminication Risk Alters Page](#54-add-api-comminication-risk-alters-page) | Mangaka | Nguyễn Minh Phúc | ✅ **Done** | 🟢 Simple |
| 55 | [Add Api User Reading History & Bookmark](#55-add-api-user-reading-history-bookmark) | Reader | Nguyễn Minh Phúc | ✅ **Done** | 🟢 Simple |
| 56 | [Add Api User Authentication & Login](#56-add-api-user-authentication-login) | User | Nguyễn Minh Phúc | ✅ **Done** | 🟢 Simple |
| 57 | [Add Api User Authentication & Login](#57-add-api-user-authentication-login) | User | Nguyễn Minh Phúc | ✅ **Done** | 🟢 Simple |
| 58 | [Page Progress Page](#58-page-progress-page) | Editorial Board | Huỳnh Ngọc Công Luân | ✅ **Done** | 🟡 Medium |
| 59 | [Series Defense & Risk Alerts](#59-series-defense-risk-alerts) | Editorial Board | Huỳnh Ngọc Công Luân | ✅ **Done** | 🔴 Complex |
| 60 | [Add Api Alert & Recovery Management](#60-add-api-alert-recovery-management) | Editorial Board | Huỳnh Ngọc Công Luân | ✅ **Done** | 🟢 Simple |

---

## 🎭 Phân Loại Theo Vai Trò (Actors)

### 👤 Vai Trò: Mangaka

| # | Màn hình / Chức năng | Phụ trách | Trạng Thái |
|:-:|:---|:---|:---:|
| 1 | [Mangaka Dashboard](#1-mangaka-dashboard) | Lê Hồ Gia Bảo | ✅ **Done** |
| 2 | [Series Management](#2-series-management) | Lê Hồ Gia Bảo | ✅ **Done** |
| 3 | [Manuscript & Page Management](#3-manuscript-page-management) | Lê Hồ Gia Bảo | ✅ **Done** |
| 4 | [Submission & Editorial Review](#4-submission-editorial-review) | Lê Hồ Gia Bảo | ✅ **Done** |
| 5 | [Assistant & Task Management](#5-assistant-task-management) | Lê Hồ Gia Bảo | ✅ **Done** |
| 6 | [Feedback & Communication](#6-feedback-communication) | Lê Hồ Gia Bảo | ✅ **Done** |
| 7 | [Feedback & Communication](#7-feedback-communication) | Lê Hồ Gia Bảo | ✅ **Done** |
| 8 | [Workflow Risk & Recovery](#8-workflow-risk-recovery) | Lê Hồ Gia Bảo | ✅ **Done** |
| 9 | [Notifications Center](#9-notifications-center) | Lê Hồ Gia Bảo | ✅ **Done** |
| 10 | [Profile](#10-profile) | Lê Hồ Gia Bảo | 📋 **To Do** |
| 26 | [Page Task API](#26-page-task-api) | Trần Tấn Phát | ✅ **Done** |
| 54 | [Add Api Comminication Risk Alters Page](#54-add-api-comminication-risk-alters-page) | Nguyễn Minh Phúc | ✅ **Done** |

### 👤 Vai Trò: Assitant

| # | Màn hình / Chức năng | Phụ trách | Trạng Thái |
|:-:|:---|:---|:---:|
| 11 | [Assistant Dashboard](#11-assistant-dashboard) | Lê Hồ Gia Bảo | ✅ **Done** |
| 51 | [Add Api Draft](#51-add-api-draft) | Nguyễn Minh Phúc | ✅ **Done** |

### 👤 Vai Trò: Assistant

| # | Màn hình / Chức năng | Phụ trách | Trạng Thái |
|:-:|:---|:---|:---:|
| 12 | [Task Management & Submissions](#12-task-management-submissions) | Lê Hồ Gia Bảo | ✅ **Done** |
| 13 | [Canvas & Drawing Studio](#13-canvas-drawing-studio) | Lê Hồ Gia Bảo | ✅ **Done** |
| 14 | [AI Manga Workspace](#14-ai-manga-workspace) | Lê Hồ Gia Bảo | ✅ **Done** |
| 15 | [Task Feedback & Annotations](#15-task-feedback-annotations) | Lê Hồ Gia Bảo | ✅ **Done** |
| 16 | [Income & Performance Reports](#16-income-performance-reports) | Lê Hồ Gia Bảo | ✅ **Done** |
| 17 | [Notifications Center](#17-notifications-center) | Lê Hồ Gia Bảo | ✅ **Done** |
| 18 | [Profile](#18-profile) | Lê Hồ Gia Bảo | ✅ **Done** |
| 27 | [Hostting backend and Database](#27-hostting-backend-and-database) | Trần Tấn Phát | ✅ **Done** |

### 👤 Vai Trò: User

| # | Màn hình / Chức năng | Phụ trách | Trạng Thái |
|:-:|:---|:---|:---:|
| 19 | [User Login](#19-user-login) | Lê Hồ Gia Bảo | ✅ **Done** |
| 22 | [Implemment AI](#22-implemment-ai) | Trần Tấn Phát | ⏳ **Doing** |
| 38 | [User Home Page](#38-user-home-page) | Trương Tam Phong | ✅ **Done** |
| 39 | [Search & Filter](#39-search-filter) | Trương Tam Phong | ✅ **Done** |
| 40 | [Series Detail](#40-series-detail) | Trương Tam Phong | ✅ **Done** |
| 41 | [Chapter Reader](#41-chapter-reader) | Trương Tam Phong | ✅ **Done** |
| 42 | [Rankings](#42-rankings) | Trương Tam Phong | ✅ **Done** |
| 43 | [Reading History](#43-reading-history) | Trương Tam Phong | ✅ **Done** |
| 44 | [User Profile](#44-user-profile) | Trương Tam Phong | ✅ **Done** |
| 45 | [User Settings](#45-user-settings) | Trương Tam Phong | 📋 **To Do** |
| 46 | [Web Preferences](#46-web-preferences) | Trương Tam Phong | ✅ **Done** |
| 47 | [Notifications New Series](#47-notifications-new-series) | Trương Tam Phong | ✅ **Done** |
| 48 | [Manga List](#48-manga-list) | Trương Tam Phong | ✅ **Done** |
| 49 | [Request Update Role](#49-request-update-role) | Trương Tam Phong | 📋 **To Do** |
| 50 | [User Login](#50-user-login) | A | 📋 **To Do** |
| 56 | [Add Api User Authentication & Login](#56-add-api-user-authentication-login) | Nguyễn Minh Phúc | ✅ **Done** |
| 57 | [Add Api User Authentication & Login](#57-add-api-user-authentication-login) | Nguyễn Minh Phúc | ✅ **Done** |

### 👤 Vai Trò: All role

| # | Màn hình / Chức năng | Phụ trách | Trạng Thái |
|:-:|:---|:---|:---:|
| 20 | [Basic CURD API](#20-basic-curd-api) | Trần Tấn Phát | ✅ **Done** |
| 21 | [Access token and refresh token](#21-access-token-and-refresh-token) | Trần Tấn Phát | ✅ **Done** |
| 28 | [Sync Notifications & Status](#28-sync-notifications-status) | Trần Tấn Phát | ✅ **Done** |

### 👤 Vai Trò: Amin

| # | Màn hình / Chức năng | Phụ trách | Trạng Thái |
|:-:|:---|:---|:---:|
| 23 | [Mamgement vote public manga screen](#23-mamgement-vote-public-manga-screen) | Trần Tấn Phát | ✅ **Done** |
| 24 | [Mamgement Series, Chapter & Tasks screen](#24-mamgement-series-chapter-tasks-screen) | Trần Tấn Phát | ✅ **Done** |
| 25 | [User Management screen](#25-user-management-screen) | Trần Tấn Phát | ✅ **Done** |

### 👤 Vai Trò: Editorial Board

| # | Màn hình / Chức năng | Phụ trách | Trạng Thái |
|:-:|:---|:---|:---:|
| 29 | [Editorial Board Dashboard](#29-editorial-board-dashboard) | Huỳnh Ngọc Công Luân | ✅ **Done** |
| 30 | [Proposals List](#30-proposals-list) | Huỳnh Ngọc Công Luân | ✅ **Done** |
| 31 | [Series Approval](#31-series-approval) | Huỳnh Ngọc Công Luân | ✅ **Done** |
| 32 | [Series Review Detail](#32-series-review-detail) | Huỳnh Ngọc Công Luân | ✅ **Done** |
| 33 | [Read Draft](#33-read-draft) | Huỳnh Ngọc Công Luân | ✅ **Done** |
| 34 | [Score Page](#34-score-page) | Huỳnh Ngọc Công Luân | ✅ **Done** |
| 35 | [Vote Page](#35-vote-page) | Huỳnh Ngọc Công Luân | ✅ **Done** |
| 36 | [Rankings](#36-rankings) | Huỳnh Ngọc Công Luân | ✅ **Done** |
| 37 | [History](#37-history) | Huỳnh Ngọc Công Luân | ✅ **Done** |
| 58 | [Page Progress Page](#58-page-progress-page) | Huỳnh Ngọc Công Luân | ✅ **Done** |
| 59 | [Series Defense & Risk Alerts](#59-series-defense-risk-alerts) | Huỳnh Ngọc Công Luân | ✅ **Done** |
| 60 | [Add Api Alert & Recovery Management](#60-add-api-alert-recovery-management) | Huỳnh Ngọc Công Luân | ✅ **Done** |

### 👤 Vai Trò: Editor Board

| # | Màn hình / Chức năng | Phụ trách | Trạng Thái |
|:-:|:---|:---|:---:|
| 52 | [Add Api Chapter Grade](#52-add-api-chapter-grade) | Huỳnh Ngọc Công Luân | ✅ **Done** |
| 53 | [Add Api Chapter Vote](#53-add-api-chapter-vote) | Huỳnh Ngọc Công Luân | ✅ **Done** |

### 👤 Vai Trò: Reader

| # | Màn hình / Chức năng | Phụ trách | Trạng Thái |
|:-:|:---|:---|:---:|
| 55 | [Add Api User Reading History & Bookmark](#55-add-api-user-reading-history-bookmark) | Nguyễn Minh Phúc | ✅ **Done** |


---

## 🔍 Chi Tiết Từng Hạng Mục (Detailed View)

### 1. Mangaka Dashboard
> **Tính năng:** Dashboard & Overview
- **Đối tượng (Actor):** Mangaka
- **Độ phức tạp:** 🟡 Medium
- **Người phụ trách:** Lê Hồ Gia Bảo
- **Trạng thái:** ✅ **Done**
- **Mô tả:** Displays overview statistics for series, work progress, to-do lists, and the latest notifications. Provides quick access shortcuts to features for creating works and managing assistants.

---

### 2. Series Management
> **Tính năng:** Series Management
- **Đối tượng (Actor):** Mangaka
- **Độ phức tạp:** 🔴 Complex
- **Người phụ trách:** Lê Hồ Gia Bảo
- **Trạng thái:** ✅ **Done**
- **Chi tiết cập nhật:** *Combine Create Manuscript, Manuscripts, Drafts, Page Viewer*
- **Mô tả:** The module for managing the author's manga projects comprises the series list screen (Series List), the form for initiating a new series (Create Series), and the interface for managing series details and chapter lists (Series Details).

---

### 3. Manuscript & Page Management
> **Tính năng:** Manuscript Management
- **Đối tượng (Actor):** Mangaka
- **Độ phức tạp:** 🔴 Complex
- **Người phụ trách:** Lê Hồ Gia Bảo
- **Trạng thái:** ✅ **Done**
- **Chi tiết cập nhật:** *Combine Create Manuscript, Manuscripts, Drafts, Page Viewer*
- **Mô tả:** The manuscript processing module comprises the following components: creating new manuscripts (Create Manuscript), managing the manuscript list (Manuscripts Page), managing drafts (Drafts), and the detailed page view screen (Page Viewer).

---

### 4. Submission & Editorial Review
> **Tính năng:** Submission & Workflow
- **Đối tượng (Actor):** Mangaka
- **Độ phức tạp:** 🔴 Complex
- **Người phụ trách:** Lê Hồ Gia Bảo
- **Trạng thái:** ✅ **Done**
- **Chi tiết cập nhật:** *Combine Submission, Board Review*
- **Mô tả:** Manage the manuscript submission process and track detailed review and approval outcomes from the Editorial Board.

---

### 5. Assistant & Task Management
> **Tính năng:** Assistant & Task Management
- **Đối tượng (Actor):** Mangaka
- **Độ phức tạp:** 🔴 Complex
- **Người phụ trách:** Lê Hồ Gia Bảo
- **Trạng thái:** ✅ **Done**
- **Chi tiết cập nhật:** *Combine Assign Task, Assistants List*
- **Mô tả:** Manage the team of assistants (Assistants List) and the studio for creating and assigning detailed tasks to each assistant based on drawing pages (Assign Task Studio), and track task completion progress.

---

### 6. Feedback & Communication
> **Tính năng:** Communication & Feedback
- **Đối tượng (Actor):** Mangaka
- **Độ phức tạp:** 🟡 Medium
- **Người phụ trách:** Lê Hồ Gia Bảo
- **Trạng thái:** ✅ **Done**
- **Mô tả:** A management interface for notes, comments, and editing feedback from editors and assistants, organized by comic page or panel.

---

### 7. Feedback & Communication
> **Tính năng:** Common
- **Đối tượng (Actor):** Mangaka
- **Độ phức tạp:** 🟡 Medium
- **Người phụ trách:** Lê Hồ Gia Bảo
- **Trạng thái:** ✅ **Done**
- **Chi tiết cập nhật:** *Combine Risk Alerts, Recovery Proposal*
- **Mô tả:** A dashboard for monitoring schedule-delay risk alerts and formulating recovery proposals to adjust plans or restore deadlines and make up for lost time.

---

### 8. Workflow Risk & Recovery
> **Tính năng:** Progress & Risk Management
- **Đối tượng (Actor):** Mangaka
- **Độ phức tạp:** 🟢 Simple
- **Người phụ trách:** Lê Hồ Gia Bảo
- **Trạng thái:** ✅ **Done**
- **Mô tả:** This is a pop-up screen which allows the user to enter email & password to login; on this page, there are also links for user to register new information or reset the password for the case s/he forget it

---

### 9. Notifications Center
> **Tính năng:** System Notification
- **Đối tượng (Actor):** Mangaka
- **Độ phức tạp:** 🟢 Simple
- **Người phụ trách:** Lê Hồ Gia Bảo
- **Trạng thái:** ✅ **Done**
- **Mô tả:** A management screen that displays a list of all system notifications, content approval notifications, assistant task assignments, and deadline reminders.

---

### 10. Profile
> **Tính năng:** Account & Profile
- **Đối tượng (Actor):** Mangaka
- **Độ phức tạp:** 🟢 Simple
- **Người phụ trách:** Lê Hồ Gia Bảo
- **Trạng thái:** 📋 **To Do**
- **Mô tả:** Functions for managing the artist's personal information (Profile) and account configuration settings (Settings), such as password changes, notifications, and system customizations.

---

### 11. Assistant Dashboard
> **Tính năng:** Dashboard & Overview
- **Đối tượng (Actor):** Assitant
- **Độ phức tạp:** 🟢 Simple
- **Người phụ trách:** Lê Hồ Gia Bảo
- **Trạng thái:** ✅ **Done**
- **Mô tả:** An overview dashboard for the Assistant, displaying the day's task list, upcoming deadlines, completion progress, and the latest notifications.

---

### 12. Task Management & Submissions
> **Tính năng:** Task Management
- **Đối tượng (Actor):** Assistant
- **Độ phức tạp:** 🔴 Complex
- **Người phụ trách:** Lê Hồ Gia Bảo
- **Trạng thái:** ✅ **Done**
- **Mô tả:** Task processing module: view assigned tasks (Tasks List), save in-progress drafts (Drafts), and submit completed work to the Mangaka (Submissions).

---

### 13. Canvas & Drawing Studio
> **Tính năng:** Canvas & Drawing Studio
- **Đối tượng (Actor):** Assistant
- **Độ phức tạp:** 🔴 Complex
- **Người phụ trách:** Lê Hồ Gia Bảo
- **Trạng thái:** ✅ **Done**
- **Chi tiết cập nhật:** *Combine Drawing View, Drawing Studio*
- **Mô tả:** A web-based Canvas drawing toolkit for assistants, featuring a basic Drawing View and an advanced Drawing Studio equipped with brushes, layers, coloring tools, and speech bubble insertion.

---

### 14. AI Manga Workspace
> **Tính năng:** AI Assistance Tools
- **Đối tượng (Actor):** Assistant
- **Độ phức tạp:** 🔴 Complex
- **Người phụ trách:** Lê Hồ Gia Bảo
- **Trạng thái:** ✅ **Done**
- **Mô tả:** The workspace integrates AI tools that assist with background removal, line art cleanup, and automatic effect suggestions, thereby accelerating the manga drawing process.

---

### 15. Task Feedback & Annotations
> **Tính năng:** Communication & Feedback
- **Đối tượng (Actor):** Assistant
- **Độ phức tạp:** 🟡 Medium
- **Người phụ trách:** Lê Hồ Gia Bảo
- **Trạng thái:** ✅ **Done**
- **Mô tả:** A screen for viewing note details and areas marked with revision instructions from the Mangaka on submitted work, enabling assistants to carry out the edits.

---

### 16. Income & Performance Reports
> **Tính năng:** Financial & Analytics
- **Đối tượng (Actor):** Assistant
- **Độ phức tạp:** 🟡 Medium
- **Người phụ trách:** Lê Hồ Gia Bảo
- **Trạng thái:** ✅ **Done**
- **Chi tiết cập nhật:** *Combine Income, Reports*
- **Mô tả:** Financial management and performance module: tracks remuneration per task (Income) and generates reports on productivity and task completion rates (Reports).

---

### 17. Notifications Center
> **Tính năng:** System Notification
- **Đối tượng (Actor):** Assistant
- **Độ phức tạp:** 🟢 Simple
- **Người phụ trách:** Lê Hồ Gia Bảo
- **Trạng thái:** ✅ **Done**
- **Mô tả:** The screen displays system notifications, new task assignments, urgent revision requests, and payment approval notifications.

---

### 18. Profile
> **Tính năng:** Profile
- **Đối tượng (Actor):** Assistant
- **Độ phức tạp:** 🟢 Simple
- **Người phụ trách:** Lê Hồ Gia Bảo
- **Trạng thái:** ✅ **Done**
- **Mô tả:** Personal Profile/Skills Portfolio Management

---

### 19. User Login
> **Tính năng:** Common
- **Đối tượng (Actor):** User
- **Độ phức tạp:** 🔴 Complex
- **Người phụ trách:** Lê Hồ Gia Bảo
- **Trạng thái:** ✅ **Done**
- **Mô tả:** This is a pop-up screen which allows the user to enter email & password to login; on this page, there are also links for user to register new information or reset the password for the case s/he forget it

---

### 20. Basic CURD API
> **Tính năng:** Common
- **Đối tượng (Actor):** All role
- **Độ phức tạp:** 🟢 Simple
- **Người phụ trách:** Trần Tấn Phát
- **Trạng thái:** ✅ **Done**
- **Mô tả:** Provide common RESTful APIs (Create, Read, Update, Delete) for all core entities in the system. These APIs support data management, validation, filtering, pagination, sorting, and standardized response formats for frontend integration.

---

### 21. Access token and refresh token
> **Tính năng:** Common
- **Đối tượng (Actor):** All role
- **Độ phức tạp:** 🟢 Simple
- **Người phụ trách:** Trần Tấn Phát
- **Trạng thái:** ✅ **Done**
- **Mô tả:** Implement JWT-based authentication using Access Token and Refresh Token. The system authenticates users, issues secure tokens, automatically refreshes expired access tokens, supports logout by revoking refresh tokens, and protects all authorized APIs through authentication middleware.

---

### 22. Implemment AI
> **Tính năng:** AI Assistance Tools
- **Đối tượng (Actor):** User
- **Độ phức tạp:** 🔴 Complex
- **Người phụ trách:** Trần Tấn Phát
- **Trạng thái:** ⏳ **Doing**
- **Mô tả:** Integrate AI assistance services for Manga production, including automatic panel detection, smart coloring suggestions, and AI-generated recommendations. The system manages AI requests asynchronously, stores processing history, and allows users to review, apply, or discard AI-generated results.

---

### 23. Mamgement vote public manga screen
> **Tính năng:** review vote session
- **Đối tượng (Actor):** Amin
- **Độ phức tạp:** 🟡 Medium
- **Người phụ trách:** Trần Tấn Phát
- **Trạng thái:** ✅ **Done**
- **Mô tả:** Provide an administration interface for managing public manga voting sessions. Administrators can monitor voting activities, review results, manage voting periods, analyze statistics, and maintain fairness of public voting campaigns.

---

### 24. Mamgement Series, Chapter & Tasks screen
> **Tính năng:** Admin mangament
- **Đối tượng (Actor):** Amin
- **Độ phức tạp:** 🟢 Simple
- **Người phụ trách:** Trần Tấn Phát
- **Trạng thái:** ✅ **Done**
- **Mô tả:** Provide an administration dashboard for managing manga series, chapters, pages, and production tasks. Administrators can view, create, edit, assign, update, hide, or archive project data while monitoring the production workflow.

---

### 25. User Management screen
> **Tính năng:** Admin mangament
- **Đối tượng (Actor):** Amin
- **Độ phức tạp:** 🟢 Simple
- **Người phụ trách:** Trần Tấn Phát
- **Trạng thái:** ✅ **Done**
- **Mô tả:** Provide an administration interface for managing user accounts, roles, permissions, and account statuses. Administrators can create, update, activate, deactivate, or remove users and monitor user activities within the system.

---

### 26. Page Task API
> **Tính năng:** Canvas & Drawing Studio
- **Đối tượng (Actor):** Mangaka
- **Độ phức tạp:** 🟢 Simple
- **Người phụ trách:** Trần Tấn Phát
- **Trạng thái:** ✅ **Done**
- **Mô tả:** Provide backend APIs for managing page production tasks, including task creation, assignment, status updates, submissions, reviews, version tracking, and workflow management between Mangaka, Assistants, and Editors.

---

### 27. Hostting backend and Database
> **Tính năng:** Hostting
- **Đối tượng (Actor):** Assistant
- **Độ phức tạp:** 🔴 Complex
- **Người phụ trách:** Trần Tấn Phát
- **Trạng thái:** ✅ **Done**
- **Mô tả:** Deploy and configure the backend API server and PostgreSQL database in a production environment. Set up environment variables, database connection, security configurations, API hosting, file storage integration, and monitoring to ensure stable, secure, and scalable system operation.

---

### 28. Sync Notifications & Status
> **Tính năng:** Nontification
- **Đối tượng (Actor):** All role
- **Độ phức tạp:** 🟢 Simple
- **Người phụ trách:** Trần Tấn Phát
- **Trạng thái:** ✅ **Done**
- **Mô tả:** Synchronize task status changes and notification events across all user roles. The system automatically delivers real-time notifications for assignments, submissions, reviews, approvals, deadlines, AI processing results, and workflow updates.Synchronize task status changes and notification events across all user roles. The system automatically delivers real-time notifications for assignments, submissions, reviews, approvals, deadlines, AI processing results, and workflow updates.

---

### 29. Editorial Board Dashboard
> **Tính năng:** Dashboard & Overview
- **Đối tượng (Actor):** Editorial Board
- **Độ phức tạp:** 🟡 Medium
- **Người phụ trách:** Huỳnh Ngọc Công Luân
- **Trạng thái:** ✅ **Done**
- **Mô tả:** The editor activity overview includes: 4 statistical boxes (Approval Flag, Proposed, Approved, Rejected) taken from real data, a Top View/Top Like Ranking table from the API series validation, and a table of recently approved series. It also provides a quick access button to the "Enter Review Room".

---

### 30. Proposals List
> **Tính năng:** Review Session Management
- **Đối tượng (Actor):** Editorial Board
- **Độ phức tạp:** 🟡 Medium
- **Người phụ trách:** Huỳnh Ngọc Công Luân
- **Trạng thái:** ✅ **Done**
- **Mô tả:** Displays a list of review sessions currently in "pending" status that the Admin has opened for reviewing Series or Chapters. Each session displays series/chapter information along with its status. Allows clicking on each session to proceed with a detailed review.

---

### 31. Series Approval
> **Tính năng:** Series Review & Voting
- **Đối tượng (Actor):** Editorial Board
- **Độ phức tạp:** 🟡 Medium
- **Người phụ trách:** Huỳnh Ngọc Công Luân
- **Trạng thái:** ✅ **Done**
- **Mô tả:** Displays a list of series awaiting approval (filters only series proposals, not chapters). Each series shows the cover, title, genre, creation date, and current user voting status. Allows clicking to view details and vote.

---

### 32. Series Review Detail
> **Tính năng:** Series Voting & Decision
- **Đối tượng (Actor):** Editorial Board
- **Độ phức tạp:** 🔴 Complex
- **Người phụ trách:** Huỳnh Ngọc Công Luân
- **Trạng thái:** ✅ **Done**
- **Mô tả:** The details page allows browsing a specific series. It displays full series information (cover, title, genre, submission date), voting statistics and scores from council members (Approve/Reject ratio), a section for entering personal comments (notes), decision selection (APPROVE/REJECT), and a vote submission button. It also supports comment exchange between members.

---

### 33. Read Draft
> **Tính năng:** Chapter Review - Step 1
- **Đối tượng (Actor):** Editorial Board
- **Độ phức tạp:** 🔴 Complex
- **Người phụ trách:** Huỳnh Ngọc Công Luân
- **Trạng thái:** ✅ **Done**
- **Mô tả:** Step 1 in the chapter review process. Displays chapter draft pages in full-screen reading mode with zoom and full-screen zoom capabilities, as well as plain reading mode. Supports page turning, direct commenting on each page, and a button to proceed to the grading step.

---

### 34. Score Page
> **Tính năng:** Chapter Review - Step 2
- **Đối tượng (Actor):** Editorial Board
- **Độ phức tạp:** 🟡 Medium
- **Người phụ trách:** Huỳnh Ngọc Công Luân
- **Trạng thái:** ✅ **Done**
- **Mô tả:** Step 2 in the chapter review process: Allows committee members to score the manuscript based on criteria (content, drawing quality, composition, etc.) after reviewing the manuscript in Step 1.

---

### 35. Vote Page
> **Tính năng:** Chapter Review - Step 3
- **Đối tượng (Actor):** Editorial Board
- **Độ phức tạp:** 🟡 Medium
- **Người phụ trách:** Huỳnh Ngọc Công Luân
- **Trạng thái:** ✅ **Done**
- **Mô tả:** Step 3 (the final step) in the chapter review process: Allow council members to make a formal decision (Approve/Reject/Revise) with comments, completing the voting process for the chapter.

---

### 36. Rankings
> **Tính năng:** Ranking Data & Analytics
- **Đối tượng (Actor):** Editorial Board
- **Độ phức tạp:** 🟡 Medium
- **Người phụ trách:** Huỳnh Ngọc Công Luân
- **Trạng thái:** ✅ **Done**
- **Mô tả:** Displays series rankings by period. Supports switching between rankings by Views and Likes. Data is retrieved from the ranking-periods API and actual series, displaying rankings, scores, series names, and cover art.

---

### 37. History
> **Tính năng:** Review History & Audit Trail
- **Đối tượng (Actor):** Editorial Board
- **Độ phức tạp:** 🔴 Complex
- **Người phụ trách:** Huỳnh Ngọc Công Luân
- **Trạng thái:** ✅ **Done**
- **Mô tả:** Displays the entire history of review sessions (approved, rejected, and in progress). The interface is divided into two columns: the left column lists the sessions (with search function), and the right column displays the details of the selected session, including series/chapter information, cover image, start/end time, and the voting history of each member.

---

### 38. User Home Page
> **Tính năng:** Homepage & Discovery
- **Đối tượng (Actor):** User
- **Độ phức tạp:** 🟡 Medium
- **Người phụ trách:** Trương Tam Phong
- **Trạng thái:** ✅ **Done**
- **Mô tả:** The homepage is for readers, displaying an introduction to the MangaFlow system with a hero section featuring an animated slide-up. It includes an introduction to the manga creation process (Creation → Collaboration → Publication). It displays dynamic manga sections: Featured Manga (slider carousel with left/right navigation buttons), Latest Updates, Top Views, and Top Likes. Each section displays a list of manga in SeriesCard format with cover art, title, and genre. Dark Mode is supported.

---

### 39. Search & Filter
> **Tính năng:** Search & Genre Filter
- **Đối tượng (Actor):** User
- **Độ phức tạp:** 🟡 Medium
- **Người phụ trách:** Trương Tam Phong
- **Trạng thái:** ✅ **Done**
- **Mô tả:** The search screen for stories features a search bar that allows you to enter keywords such as story title or author name. Results are filtered by genre using clickable tags (Action, Adventure, Fantasy, Romance, Comedy, Drama, Horror, Sci-Fi, Slice of Life, Mystery, etc.), with the "All" tag resetting the filters. Results are displayed as a list of search series cards with pagination—supporting previous/next page buttons and displaying the current page number. URLs are synchronized with query params (?q=, ?genre=, ?page=) allowing for sharing and bookmarking of search results.

---

### 40. Series Detail
> **Tính năng:** Series Information & Interaction
- **Đối tượng (Actor):** User
- **Độ phức tạp:** 🔴 Complex
- **Người phụ trách:** Trương Tam Phong
- **Trạng thái:** ✅ **Done**
- **Mô tả:** The series details screen displays all the information for a manga series. The Hero section includes: a 3D cover image with a rotating perspective effect (hover to flatten), the title of the series, publication status (Ongoing / Completed), genre, author and editor information (clickable to view profile popup). Statistics: number of chapters, reads, star rating (automatically calculated from views & likes), number of followers. Action buttons: "Read from the beginning" and "Read next" (bookmark the most recently read chapter). 3 content tabs: (1) Introduction — description and synopsis of the series; (2) Chapter list — lists all published chapters with read/unread status, "New" label, follow (like) button for each chapter; (3) Comments — displays a comment tree with nested replies, allowing direct replies. Right sidebar: displays author information (popup profile card), other works by the author. Dark Mode is supported.

---

### 41. Chapter Reader
> **Tính năng:** Manga Reading Experience
- **Đối tượng (Actor):** User
- **Độ phức tạp:** 🔴 Complex
- **Người phụ trách:** Trương Tam Phong
- **Trạng thái:** ✅ **Done**
- **Mô tả:** The full-screen reader displays manga pages vertically (vertical scroll). The top/bottom navigation bar (auto-hide when clicked): the top bar displays chapter title, series return button, menu and settings; the bottom bar displays "Previous Chapter / Next Chapter" buttons, a Follow (Like) button with toggle status (liked/unliked), and a Comments button that opens a slide-in comment panel from the right (ChapterCommentsPanel). The system automatically logs views and saves reading progress when a chapter is opened. At the end of each chapter, a "End of Chapter" section is displayed with buttons to navigate to the previous/next chapter. Page images support lazy loading for optimized performance. Supports synchronization of like status with the backend API. Dark theme interface (background #121212).

---

### 42. Rankings
> **Tính năng:** Manga Ranking & Leaderboard
- **Đối tượng (Actor):** User
- **Độ phức tạp:** 🔴 Complex
- **Người phụ trách:** Trương Tam Phong
- **Trạng thái:** ✅ **Done**
- **Mô tả:** This is a manga ranking screen on the platform. It displays a title banner with overall platform statistics (total series, total views, total followers). Users can switch ranking types: by Views or by Likes, and time periods: Weekly or Monthly. The top 3 are prominently displayed as a special podium/card (positions 1, 2, 3). Top 4 and beyond are displayed as a detailed list with: ranking, cover art, title, genre, author name, and score (views or votes). Data is retrieved from the API backend with ranking periods (weekly/monthly) and sorted according to selected criteria. Genre filtering is supported.

---

### 43. Reading History
> **Tính năng:** Reading History & Progress Tracking
- **Đối tượng (Actor):** User
- **Độ phức tạp:** 🔴 Complex
- **Người phụ trách:** Trương Tam Phong
- **Trạng thái:** ✅ **Done**
- **Mô tả:** Personal reading history screen. Header with filter tabs: "All", "Currently Reading", "Completed", "Favorites". Featured: most recently read stories displayed as large cards with 3D cover art (book perspective effect rotates when hovered), reading progress bar, current chapter information, and a "Continue Reading" button. History list: previously read stories displayed as smaller cards with cover art, title, current chapter, progress bar, and last read time (x minutes/hours/days ago). Right sidebar: displays "Upcoming Chapters" with a list of upcoming chapters. When there is no history, it shows an empty state with a "Explore Stories" button leading to the search page. Dark Mode supported.

---

### 44. User Profile
> **Tính năng:** Profile Management
- **Đối tượng (Actor):** User
- **Độ phức tạp:** 🟡 Medium
- **Người phụ trách:** Trương Tam Phong
- **Trạng thái:** ✅ **Done**
- **Mô tả:** User profile screen. Displays avatar (profile picture), full name, email, bio, and favorite genres. Supports Edit Mode: users can update their bio, change their avatar by uploading a new image (integrated cloud upload service), and select/deselect favorite genres from a predefined list (Action, Adventure, Fantasy, Romance, Comedy, Drama, Horror, Sci-Fi, Slice of Life, Mystery, Psychological, Sports). Displays activity history (Activity Feed) based on actual reading data — each activity shows the title of the story, the chapter read, and the time (x minutes/hours/days ago). Synchronizes profile data with backend API and localStorage.

---

### 45. User Settings
> **Tính năng:** Account Settings & Preferences
- **Đối tượng (Actor):** User
- **Độ phức tạp:** 🟢 Simple
- **Người phụ trách:** Trương Tam Phong
- **Trạng thái:** 📋 **To Do**
- **Mô tả:** The system settings screen allows users to change basic account information: Full name, contact email, and bio. The notification options section allows enabling/disabling notifications via a toggle switch. The form has a "Save settings" button with a save notification effect (displayed for 3 seconds). When saved, the system dispatches a custom event (mangaflow_profile_updated) to update the information in real-time on the sidebar/header without reloading the page.

---

### 46. Web Preferences
> **Tính năng:** Theme & Display Settings
- **Đối tượng (Actor):** User
- **Độ phức tạp:** 🔴 Complex
- **Người phụ trách:** Trương Tam Phong
- **Trạng thái:** ✅ **Done**
- **Mô tả:** The website interface settings screen allows users to choose between three display modes: Light, Dark, and System (automatically based on OS settings). Each option is displayed as a card with a corresponding icon (Sun / Moon / Monitor); the currently selected card will have a red border (manga-red) and a prominent shadow effect. ThemeContext integration allows for instant application-wide theme application upon change.

---

### 47. Notifications New Series
> **Tính năng:** Notification Center
- **Đối tượng (Actor):** User
- **Độ phức tạp:** 🟢 Simple
- **Người phụ trách:** Trương Tam Phong
- **Trạng thái:** ✅ **Done**
- **Mô tả:** The central notification screen displays a list of the most recently published manga series (up to 20 items). Each notification shows: a thumbnail cover image, a "Newly Published" label, the title of the series, a short description, and the time (x minutes/hours/days ago). Clicking on a notification will navigate to the corresponding series details page. When the page opens, the system automatically marks the time the last notification was read (mangaflow_last_read_notifications) to remove the red dot in the header. A loading status (spinner) is displayed when loading and an empty state when there are no new notifications.

---

### 48. Manga List
> **Tính năng:** Manga Catalog (Placeholder)
- **Đối tượng (Actor):** User
- **Độ phức tạp:** 🟢 Simple
- **Người phụ trách:** Trương Tam Phong
- **Trạng thái:** ✅ **Done**
- **Mô tả:** This is the comprehensive manga list screen on the MangaFlow platform. Currently in placeholder mode, it displays the title "Manga List," a red accent bar, the description "Explore manga works on the MangaFlow platform," and the message "This feature will be updated soon" with a BookOpen icon. It is expected to display the entire manga catalog on the platform with advanced filters and sorting options.

---

### 49. Request Update Role
> **Tính năng:** Common
- **Đối tượng (Actor):** User
- **Độ phức tạp:** 🔴 Complex
- **Người phụ trách:** Trương Tam Phong
- **Trạng thái:** 📋 **To Do**
- **Mô tả:** This is a pop-up screen which allows the user to enter email & password to login; on this page, there are also links for user to register new information or reset the password for the case s/he forget it

---

### 50. User Login
> **Tính năng:** Common
- **Đối tượng (Actor):** User
- **Độ phức tạp:** 🔴 Complex
- **Người phụ trách:** A
- **Trạng thái:** 📋 **To Do**
- **Mô tả:** This is a pop-up screen which allows the user to enter email & password to login; on this page, there are also links for user to register new information or reset the password for the case s/he forget it

---

### 51. Add Api Draft
> **Tính năng:** Canvas & Drawing Studio
- **Đối tượng (Actor):** Assitant
- **Độ phức tạp:** 🟢 Simple
- **Người phụ trách:** Nguyễn Minh Phúc
- **Trạng thái:** ✅ **Done**
- **Mô tả:** This role involves developing APIs (Application Programming Interfaces)—interfaces that facilitate data connection and transmission between the backend system (server) and the frontend (user interface or mobile application).

---

### 52. Add Api Chapter Grade
> **Tính năng:** Dashboard & Overview
- **Đối tượng (Actor):** Editor Board
- **Độ phức tạp:** 🟢 Simple
- **Người phụ trách:** Huỳnh Ngọc Công Luân
- **Trạng thái:** ✅ **Done**
- **Mô tả:** Provides an API for the Editor Board to assign and submit quality grades or review scores for a specific chapter directly from the Dashboard. Updates the chapter evaluation status upon successful submission.

---

### 53. Add Api Chapter Vote
> **Tính năng:** Series Review & Voting
- **Đối tượng (Actor):** Editor Board
- **Độ phức tạp:** 🟢 Simple
- **Người phụ trách:** Huỳnh Ngọc Công Luân
- **Trạng thái:** ✅ **Done**
- **Mô tả:** Provides an API for the Editor Board to submit their vote (Approve/Reject) and personal comments/notes for a specific chapter during the review process. Updates voting statistics and council member review statuses upon successful submission.

---

### 54. Add Api Comminication Risk Alters Page
> **Tính năng:** Common
- **Đối tượng (Actor):** Mangaka
- **Độ phức tạp:** 🟢 Simple
- **Người phụ trách:** Nguyễn Minh Phúc
- **Trạng thái:** ✅ **Done**
- **Mô tả:** Provides an API for Mangaka to retrieve schedule-delay risk alerts on RiskAlertsPage and submit recovery proposals to the Tantou Editor via RecoveryProposalPage.

---

### 55. Add Api User Reading History & Bookmark
> **Tính năng:** Reading History & Bookmark
- **Đối tượng (Actor):** Reader
- **Độ phức tạp:** 🟢 Simple
- **Người phụ trách:** Nguyễn Minh Phúc
- **Trạng thái:** ✅ **Done**
- **Mô tả:** Provides APIs for readers to save their reading progress/last read chapter (POST /api/bookmarks) and retrieve a list of currently reading series (GET /api/bookmarks) joined with full series and chapter details.

---

### 56. Add Api User Authentication & Login
> **Tính năng:** Authentication & Authorization
- **Đối tượng (Actor):** User
- **Độ phức tạp:** 🟢 Simple
- **Người phụ trách:** Nguyễn Minh Phúc
- **Trạng thái:** ✅ **Done**
- **Mô tả:** Provides an API (POST /api/auth/login) for authenticating users via email and password. Validates credentials, checks account status, generates JWT tokens (Access Token & Refresh Token), and returns user profile data along with authentication cookies/tokens.

---

### 57. Add Api User Authentication & Login
> **Tính năng:** Authentication & Authorization
- **Đối tượng (Actor):** User
- **Độ phức tạp:** 🟢 Simple
- **Người phụ trách:** Nguyễn Minh Phúc
- **Trạng thái:** ✅ **Done**
- **Mô tả:** Provides an API (POST /api/auth/login) supporting the login pop-up screen. Authenticates user credentials (email & password), validates user account status, generates access tokens, and provides responses necessary for user session handling, including access points for navigation to registration and password reset flows.

---

### 58. Page Progress Page
> **Tính năng:** Progress Tracking
- **Đối tượng (Actor):** Editorial Board
- **Độ phức tạp:** 🟡 Medium
- **Người phụ trách:** Huỳnh Ngọc Công Luân
- **Trạng thái:** ✅ **Done**
- **Chi tiết cập nhật:** *Chỉnh sửa đổi tên cột Hạn Chót thành Dự Kiến Ra Mắt và tích hợp hiển thị Chương Ảo*
- **Mô tả:** Theo dõi tiến độ chi tiết của từng chapter thuộc các series được phụ trách. Hiển thị số trang, tiến độ hoàn thành (%), ngày dự kiến ra mắt, trạng thái (Đã Hoàn Thành, Đang Vẽ, Chờ Vẽ) và cảnh báo Trễ Hạn (bao gồm cả Chương ảo dự kiến cho series đã xuất bản).

---

### 59. Series Defense & Risk Alerts
> **Tính năng:** Progress & Risk Management
- **Đối tượng (Actor):** Editorial Board
- **Độ phức tạp:** 🔴 Complex
- **Người phụ trách:** Huỳnh Ngọc Công Luân
- **Trạng thái:** ✅ **Done**
- **Chi tiết cập nhật:** *Đồng bộ luồng nhắc deadline, tự động duyệt và dọn dẹp cảnh báo sau khi giải quyết*
- **Mô tả:** Trang quản lý cảnh báo rủi ro của Biên tập viên (Tantou). Hiển thị danh sách cảnh báo trễ hạn bản thảo, cảnh báo tụt hạng. Cho phép gửi yêu cầu nhắc deadline, gia hạn hoặc phục hồi gửi tới Mangaka, và duyệt các đề xuất điều chỉnh kế hoạch.

---

### 60. Add Api Alert & Recovery Management
> **Tính năng:** Common
- **Đối tượng (Actor):** Editorial Board
- **Độ phức tạp:** 🟢 Simple
- **Người phụ trách:** Huỳnh Ngọc Công Luân
- **Trạng thái:** ✅ **Done**
- **Mô tả:** Cung cấp hệ thống API hỗ trợ tạo và cập nhật các cảnh báo rủi ro tiến độ, đề xuất phục hồi kế hoạch (Recovery Proposal), tự động gia hạn deadline công việc cho trợ lý và đồng bộ thông báo nhắc nhở giữa Tantou và Mangaka.

---

## 📝 Hướng Dẫn Thêm Mới & Chỉnh Sửa

Nếu bạn cần thêm mới hoặc thay đổi, hãy làm theo định dạng sau và điền các cột:
1. **STT:** Số thứ tự tiếp theo.
2. **Screen/Function:** Tên màn hình/chức năng/API.
3. **Feature:** Nhóm tính năng.
4. **Actor:** Người dùng sử dụng.
5. **Description:** Mô tả hành vi tính năng.
6. **Complexity:** Mức độ phức tạp (`Simple`, `Medium`, `Complex`).
7. **In Charge:** Lập trình viên.
8. **Status:** Trạng thái (`Todo`, `Doing`, `Done`).
9. **Update Details:** Cập nhật thay đổi.

