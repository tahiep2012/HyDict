# ĐẶC TẢ KỸ THUẬT: SỔ TAY TỪ YÊU THÍCH & LỊCH SỬ TRA CỨU (SPEC-10)

> **Mã phân hệ**: `EPIC-10`  
> **Thư mục lưu trữ**: `docs/specs/features/10-favorites-history/`  
> **Mức độ ưu tiên**: P1 (Quan trọng - Tăng tỷ lệ giữ chân người học)  
> **Tiêu chuẩn tuân thủ**: `spec-driven-development`, `modular-architecture`, `ui-design-system`, `qa-verification`

---

## 1. TỔNG QUAN & USER STORIES

### 1.1. Bối cảnh
Người dùng khi đọc sách báo, lướt web hoặc ôn tập Anki thường xuyên bắt gặp những từ vựng mới khó nhớ hoặc những câu ví dụ hay. Hiện tại, họ có thể gửi thẻ sang Anki, nhưng trong nhiều tình huống làm việc văn phòng, họ muốn:
1. Đánh dấu nhanh (Bookmark ⭐) để cuối ngày xem lại 1 danh sách gọn gàng ngay trong Hanzii Dict mà không cần khởi động Anki.
2. Xem lại lịch sử các từ đã tra trong phiên làm việc để không bị quên từ vừa tra 5 phút trước.

### 1.2. User Stories
- **US-01 (Bookmark)**: Khi tra từ trên HUD hoặc Main Window, tôi có thể bấm vào icon Ngôi sao ⭐ để thêm/xóa từ khỏi Sổ tay từ yêu thích.
- **US-02 (History)**: Mỗi khi tôi tra cứu một từ thành công, từ đó sẽ tự động được lưu vào Lịch sử tra cứu (tối đa 100 từ gần nhất).
- **US-03 (Management UI)**: Trên cửa sổ chính, tôi có 1 tab riêng biệt để duyệt danh sách từ yêu thích và lịch sử, có thể tìm kiếm, xóa từng từ hoặc xóa toàn bộ lịch sử.

---

## 2. RANH GIỚI MÔ-ĐUN & KIẾN TRÚC (MODULAR ARCHITECTURE)

- **Mô-đun mới**: `src/modules/notebook/` (tuân thủ ranh giới không xâm lấn `modular-architecture`):
  - `src/modules/notebook/types.ts`: Kiểu dữ liệu Bookmark và History.
  - `src/modules/notebook/rules.ts`: Các hàm lọc, tìm kiếm và giới hạn kích thước lịch sử.
  - `src/modules/notebook/hooks/useNotebook.ts`: Hook quản lý trạng thái lưu trữ cục bộ.
  - `src/modules/notebook/components/NotebookTab.tsx`: Tab quản trị trên Cửa sổ chính.
  - `src/modules/notebook/components/BookmarkButton.tsx`: Nút bấm ngôi sao dùng chung trên HUD và Main Window.

---

## 3. MÔ HÌNH DỮ LIỆU & KIỂU DỮ LIỆU (DATA SCHEMA & TYPES)

### 3.1. TypeScript Types (`src/modules/notebook/types.ts`)
```typescript
export interface FavoriteWordItem {
  id: string;               // UUID hoặc simplified word
  word: string;             // Chữ Hán: "报销"
  pinyin: string;           // Pinyin: "[ bào xiāo ]"
  hanViet: string;          // Hán Việt: "BÁO TIÊU"
  definition: string;       // Định nghĩa tóm tắt
  createdAt: number;        // Timestamp thời điểm lưu
  tags?: string[];          // Nhãn phân loại (vd: "HSK 4", "Kinh tế")
}

export interface SearchHistoryItem {
  word: string;
  pinyin: string;
  hanViet: string;
  searchedAt: number;
}
```

### 3.2. Cơ chế Lưu trữ Cục bộ
- Sử dụng `localStorage` (với key `hanzii_favorites` và `hanzii_search_history`) hoặc đồng bộ qua bảng SQLite nội bộ của Rust để đảm bảo dữ liệu không bao giờ bị mất khi khởi động lại máy tính.

---

## 4. ĐẶC TẢ GIAO DIỆN & TRẠNG THÁI UI (UI STATES)

### 4.1. Nút Bookmark ⭐ trên HUD Titlebar
- Trạng thái chưa lưu: Icon `Star` viền xám mờ (`text-slate-400 hover:text-amber-500`).
- Trạng thái đã lưu: Icon `Star` màu vàng kim đục (`fill-amber-400 text-amber-500 scale-110`).
- Hiệu ứng: Animation chuyển động nhấp nháy nhẹ (pop/bounce) khi người dùng bấm lưu.

### 4.2. Tab Sổ Tay & Lịch Sử trên Main Window
- Layout 2 cột hoặc segmented control chuyển đổi giữa:
  - **Sổ từ yêu thích ⭐ (Favorites)**: Hiển thị số lượng từ đã lưu, danh sách thẻ từ có nút phát âm, xóa, và nút "Xuất sang CSV / Anki".
  - **Lịch sử tra cứu 🕒 (History)**: Danh sách dòng thời gian (timeline) các từ đã tra, nút "Xóa lịch sử".

---

## 5. QUY TẮC NGHIỆP VỤ & XỬ LÝ BIÊN (BUSINESS RULES & EDGE CASES)
1. **Chống trùng lặp**: Lưu một từ nhiều lần chỉ cập nhật thời gian `createdAt` hoặc `searchedAt`, không tạo bản ghi rác.
2. **Giới hạn bộ nhớ lịch sử**: Tối đa 100 mục lịch sử gần nhất theo cơ chế FIFO (First In, First Out).
3. **Độ an toàn dữ liệu**: Khi xóa bộ nhớ cache trình duyệt, cơ chế fallback vẫn giữ lại dữ liệu an toàn.

---

## 6. TIÊU CHÍ NGHIỆM THU (DEFINITION OF DONE)
- [ ] Bấm icon ngôi sao trên HUD lưu từ thành công và chuyển trạng thái tức thì.
- [ ] Mở tab "Sổ từ" trên Main Window hiển thị chính xác toàn bộ danh sách từ đã bookmark.
- [ ] Tra từ mới bất kỳ tự động nạp vào Lịch sử tra cứu.
- [ ] 100% test cases cho module `notebook` đạt chuẩn QA Gate.
