# LIVING TASK CHECKLIST: SỔ TAY TỪ YÊU THÍCH & LỊCH SỬ TRA CỨU (EPIC-10)

> **Mã phân hệ**: `EPIC-10`  
> **Trạng thái tổng thể**: `[x] COMPLETED`  
> **Mỏ neo kiểm soát tiến độ**: Lưu trạng thái đĩa cứng theo chuẩn `spec-driven-development`

---

## 1. PHÂN RÃ CÔNG VIỆC CHI TIẾT (TASK BREAKDOWN)

### Giai đoạn 1: Scaffold Module & Business Logic
- [x] `TASK-10.1`: Khởi tạo cấu trúc thư mục `src/modules/notebook/`
  - [x] Khai báo `types.ts` với các interface `FavoriteWordItem`, `SearchHistoryItem`
  - [x] Viết các hàm logic thuần túy trong `rules.ts`: `addFavorite`, `removeFavorite`, `addHistoryItem`, `filterFavorites`
  - [x] Viết unit test Tầng 1 kiểm tra logic thêm/bớt và giới hạn 100 mục lịch sử

### Giai đoạn 2: Hook & Atomic Components
- [x] `TASK-10.2`: Triển khai hook `useNotebook.ts`
  - [x] Đồng bộ hóa dữ liệu với `localStorage`
  - [x] Phát sự kiện `window` event để đồng bộ tức thì giữa các cửa sổ (HUD và Main Window)
- [x] `TASK-10.3`: Tạo Atomic Component `BookmarkButton.tsx`
  - [x] Hỗ trợ các trạng thái: idle, bookmarked, hovering
  - [x] Tích hợp vào `HudTitlebar.tsx` và `DictLookupTab.tsx`

### Giai đoạn 3: Giao Diện Quản Trị Main Window
- [x] `TASK-10.4`: Tạo component `NotebookTab.tsx`
  - [x] Hiển thị danh sách từ yêu thích dạng lưới / danh sách thẻ
  - [x] Cung cấp ô tìm kiếm nhanh từ trong sổ tay
  - [x] Hiển thị danh sách Lịch sử tra cứu theo dòng thời gian
- [x] `TASK-10.5`: Cập nhật `MainWindowLayout.tsx` để thêm tab điều hướng "Sổ từ & Lịch sử" (icon Bookmark)

### Giai đoạn 4: QA Gate & Verification
- [x] `TASK-10.6`: Bổ sung test cases vào `tests/test_qa_lifecycle.ts` (Tầng 1 & Tầng 3)
- [x] `TASK-10.7`: Chạy trọn vẹn `npm test` và `cargo test`, cam kết 100% tests PASS
