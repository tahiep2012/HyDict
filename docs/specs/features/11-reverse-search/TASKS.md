# LIVING TASK CHECKLIST: TRA CỨU NGƯỢC VIỆT - TRUNG & PINYIN KHÔNG DẤU (EPIC-11)

> **Mã phân hệ**: `EPIC-11`  
> **Trạng thái tổng thể**: `[x] COMPLETED`  
> **Mỏ neo kiểm soát tiến độ**: Lưu trạng thái đĩa cứng theo chuẩn `spec-driven-development`

---

## 1. PHÂN RÃ CÔNG VIỆC CHI TIẾT (TASK BREAKDOWN)

### Giai đoạn 1: Thuật toán Nhận diện & Rust Backend Index
- [x] `TASK-11.1`: Triển khai hàm phân loại loại query `classifySearchQuery` trong `src/modules/dictionary/rules/queryClassifier.ts`
  - [x] Nhận diện tự động: Chinese / Pinyin / Vietnamese
  - [x] Xử lý loại bỏ dấu thanh điệu Pinyin để chuẩn hóa tìm kiếm
- [x] `TASK-11.2`: Nâng cấp truy vấn SQLite trong Rust (`src-tauri/src/db.rs`)
  - [x] Bổ sung hàm `lookup_reverse_vietnamese(query: &str) -> Vec<DictionaryEntry>`
  - [x] Bổ sung hàm `lookup_by_pinyin_tone_free(query: &str) -> Vec<DictionaryEntry>`
  - [x] Tối ưu hóa chỉ mục SQLite (`idx_pinyin_clean`, `idx_pinyin_flat`) đảm bảo tốc độ tra cứu `< 15ms`
  - [x] Khai báo Tauri command `search_dictionary_multi` và đăng ký trong `src-tauri/src/lib.rs`

### Giai đoạn 2: Tích hợp Giao diện & Gợi ý Thông Minh
- [x] `TASK-11.3`: Cập nhật component `DictLookupTab.tsx`
  - [x] Hỗ trợ hiển thị gợi ý thông minh (Auto-suggestions) cho cả 3 chế độ tìm kiếm
  - [x] Hiển thị nhãn chỉ dẫn nguồn kết quả (Khớp Pinyin / Khớp nghĩa tiếng Việt / Khớp Hán tự)
  - [x] Hiển thị danh sách thẻ kết quả đa chiều cho phép chuyển đổi từ vựng kích hoạt
- [x] `TASK-11.4`: Tích hợp vào thanh tìm kiếm của `MainWindowLayout.tsx`

### Giai đoạn 3: QA Gate & Verification
- [x] `TASK-11.5`: Viết test cases kiểm thử tự động cho cả 3 chế độ query trong `tests/test_qa_lifecycle.ts`
- [x] `TASK-11.6`: Chạy `npm test` và `cargo test`, xác nhận 100% PASS (176 tests TS pass, 8 tests Rust pass)
