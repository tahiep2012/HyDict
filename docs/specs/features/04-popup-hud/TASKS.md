# TASKS: 04-POPUP-HUD (CỬA SỔ NỔI OVERLAY & PHÍM TẮT TOÀN CỤC)

> **Mã phân hệ**: `EPIC-04`  
> **Trạng thái**: `COMPLETED`  
> **Quy ước**: `[ ]` Chưa làm | `[/]` Đang làm | `[x]` Đã hoàn thành

---

## DANH SÁCH CÔNG VIỆC CHI TIẾT

- [x] **TASK-04.1**: Cấu hình cửa sổ Tauri HUD: `decorations: false`, `transparent: true`, `always_on_top: true` trong `tauri.conf.json`.
  - *Kiểm chứng*: Cửa sổ hiển thị dạng overlay trong suốt không viền thanh tiêu đề Windows thô kệch.
- [x] **TASK-04.2**: Cài đặt plugin Global Shortcut trong Rust Backend (`src-tauri/src/hotkey.rs`) bắt phím `Shift + T`.
  - *Kiểm chứng*: Phím tắt `Shift + T` và parser hoạt động chuẩn xác, tích hợp hook `useGlobalHotkey` trên frontend.
- [x] **TASK-04.3**: Viết module tính toán tọa độ thông minh `window_hud.rs` (Screen Clamping & Multi-monitor cursor positioning).
  - *Kiểm chứng*: Cửa sổ luôn hiển thị trong vùng an toàn của màn hình, tự động lật trái khi sát mép phải và lật lên trên khi sát đáy.
- [x] **TASK-04.4**: Xây dựng UI Component `HudWindowContainer.tsx` và `HudTitlebar.tsx` tại `src/modules/popup-hud/`.
  - *Kiểm chứng*: Đầy đủ nút Ghim (Pin), Đóng (Esc), bóng đổ mịn màng theo chuẩn `ui-design-system`.
- [x] **TASK-04.5**: Viết Functional UI Tests Tầng 3 kiểm tra đóng/mở và các tương tác phím tắt.
  - *Kiểm chứng*: `npm test` xác nhận 47/47 bài test đạt PASS 100%, prebuild gate thành công.
