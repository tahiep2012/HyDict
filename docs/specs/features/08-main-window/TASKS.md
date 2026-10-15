# TASKS: 08-MAIN-WINDOW (CỬA SỔ QUẢN TRỊ & CÀI ĐẶT CHUẨN LINGOES)

> **Mã phân hệ**: `EPIC-08`  
> **Trạng thái**: `COMPLETED`  
> **Quy ước**: `[ ]` Chưa làm | `[/]` Đang làm | `[x]` Đã hoàn thành

---

## DANH SÁCH CÔNG VIỆC CHI TIẾT

- [x] **TASK-08.1**: Khởi tạo cấu trúc module độc lập `src/modules/main-window/` gồm `index.ts`, `types.ts`, `components/`, `hooks/`.
  - *Kiểm chứng*: Đã tạo trọn vẹn 8 tệp thành phần, đóng gói ranh giới qua `index.ts`.
- [x] **TASK-08.2**: Xây dựng các UI Tab độc lập: `DictLookupTab`, `HotkeyCaptureTab`, `AnkiConfigTab`, `SystemSettingsTab`, và `SystemTrayModal`.
  - *Kiểm chứng*: Tái sử dụng trọn vẹn Design Tokens và Atomic Components (`@/components/ui`), hỗ trợ đầy đủ các trạng thái tương tác.
- [x] **TASK-08.3**: Xây dựng component `MainWindowLayout` hỗ trợ chuyển tab mượt mà, tích hợp xem trước Quick HUD.
  - *Kiểm chứng*: Tích hợp sidebar điều hướng 4 tab, hộp trạng thái phím tắt và nút gọi nhanh HUD.
- [x] **TASK-08.4**: Cập nhật `src/App.tsx` và cấu hình cửa sổ trong `src-tauri/tauri.conf.json` thành 860x640px, `decorations: true`.
  - *Kiểm chứng*: Cửa sổ Windows tiêu chuẩn 860x640px có thanh viền Windows 11, nút thu nhỏ/phóng to/đóng.
- [x] **TASK-08.5**: Mở rộng bộ kiểm thử tự động 5 tầng `tests/test_qa_lifecycle.ts` bao quát toàn bộ module `main-window`.
  - *Kiểm chứng*: Đạt 80/80 test cases PASS (100%) tại cả 5 tầng kiểm thử.
- [x] **TASK-08.6**: Chạy cổng QA đạt 100% PASS và biên dịch bản Release `.exe` chuẩn Lingoes.
  - *Kiểm chứng*: Đã biên dịch thành công `Hanzii-Dict.exe` (15.8 MB), nhúng tĩnh toàn bộ giao diện, kiểm thử khởi chạy với tiêu đề `Hanzii Dict Desktop` và trạng thái `Responding: True`.
- [x] **TASK-08.7**: Đổi phím tắt mặc định toàn cục từ `Shift + T` thành `Alt + Q`.
  - *Kiểm chứng*: Cập nhật đồng bộ trong `core-infra`, `hotkey.rs`, `useGlobalHotkey.ts`, `main-window`, và bộ test 80/80 test cases 100% PASS. Đã build lại và cập nhật file `Hanzii-Dict.exe`.
