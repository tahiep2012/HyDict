# TASKS: 02-SEGMENTATION (ENGINE PHÂN TỪ CJK THÔNG MINH)

> **Mã phân hệ**: `EPIC-02`  
> **Trạng thái**: `COMPLETED`  
> **Quy ước**: `[ ]` Chưa làm | `[/]` Đang làm | `[x]` Đã hoàn thành

---

## DANH SÁCH CÔNG VIỆC CHI TIẾT

- [x] **TASK-02.1**: Cài đặt và cấu hình thư viện `jieba-rs` trong Rust Backend (`src-tauri/src/segmentation.rs`).
  - *Kiểm chứng*: Hàm `segment_sentence(text)` và cấu trúc `ChineseToken` được thiết lập và đăng ký vào `tauri::generate_handler![]`.
- [x] **TASK-02.2**: Xây dựng thuật toán thuần túy (Pure Rules) tại `src/modules/segmentation/rules.ts` hỗ trợ Fallback với `Intl.Segmenter`.
  - *Kiểm chứng*: 100% Unit test cho các câu CJK phức tạp đạt Pass (phân tách chuẩn xác `这本书有万页。`, `万里长城十分雄伟。`).
- [x] **TASK-02.3**: Xây dựng React component `SentenceSegmentBar.tsx` hiển thị dải pill chips có thể nhấp chọn.
  - *Kiểm chứng*: Hỗ trợ render dải pill chips ngữ nghĩa, highlight token active, gọi callback chuyển từ mượt mà.
- [x] **TASK-02.4**: Đóng gói Public API tại `src/modules/segmentation/index.ts` và viết kiểm thử đơn vị Tầng 1 và Tầng 4.
  - *Kiểm chứng*: `npm test` xác nhận 31/31 bài test đạt PASS 100%, prebuild gate thành công.
