# TASKS: 06-ANKI-INTEGRATION (TÍCH HỢP ANKI HAI CHIỀU)

> **Mã phân hệ**: `EPIC-06`  
> **Trạng thái**: `COMPLETED`  
> **Quy ước**: `[ ]` Chưa làm | `[/]` Đang làm | `[x]` Đã hoàn thành

---

## DANH SÁCH CÔNG VIỆC CHI TIẾT

- [x] **TASK-06.1**: Xây dựng service tương tác AnkiConnect tại `src/modules/anki-bridge/hooks/useAnkiConnect.ts`.
  - *Kiểm chứng*: Gửi được request ping `version` và `addNote` thành công tới cổng 8765, cấu trúc JSON phiên bản 6 chuẩn xác.
- [x] **TASK-06.2**: Xây dựng component `AddToAnkiButton.tsx` với đầy đủ 4 trạng thái tương tác và hiệu ứng thông báo.
  - *Kiểm chứng*: Render đẹp mắt, hiển thị spinner khi đang gửi và tick xanh khi hoàn thành, tích hợp vào chân HUD của `App.tsx`.
- [x] **TASK-06.3**: Xây dựng Anki Double-Click Addon (Python script) trong thư mục `anki-addon/` nhúng vào Webview Reviewer của Anki.
  - *Kiểm chứng*: Đã tạo `anki-addon/__init__.py` lắng nghe sự kiện `dblclick` và mở rộng vùng bôi đen tự động với `Intl.Segmenter`.
- [x] **TASK-06.4**: Viết Integration Tests kiểm tra payload và xử lý lỗi rớt kết nối Anki.
  - *Kiểm chứng*: `npm test` xác nhận 62/62 bài test đạt PASS 100%, prebuild gate thành công.
