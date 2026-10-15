# TASKS: 07-QA-PACKAGING (CỔNG QA 5 TẦNG & ĐÓNG GÓI .EXE)

> **Mã phân hệ**: `EPIC-07`  
> **Trạng thái**: `COMPLETED`  
> **Quy ước**: `[ ]` Chưa làm | `[/]` Đang làm | `[x]` Đã hoàn thành

---

## DANH SÁCH CÔNG VIỆC CHI TIẾT

- [x] **TASK-07.1**: Xây dựng kịch bản kiểm thử tự động toàn diện `tests/test_qa_lifecycle.ts` bao quát đủ 5 tầng (Tier 0 đến Tier 5).
  - *Kiểm chứng*: Đã chạy `npm test` với 68 bài test đạt 100% PASS, kiểm định đầy đủ cấu trúc 7 module, Zero Encapsulation Leak, và kịch bản E2E toàn diện.
- [x] **TASK-07.2**: Cấu hình System Tray Icon và menu điều khiển cho ứng dụng chạy nền.
  - *Kiểm chứng*: `tauri.conf.json` và `Cargo.toml` hỗ trợ tray-icon và quản lý cửa sổ nổi không viền.
- [x] **TASK-07.3**: Chạy kiểm thử hồi quy toàn diện, kiểm tra rò rỉ bộ nhớ và chịu tải.
  - *Kiểm chứng*: 100% test cases Tier 4 và Tier 5 chứng minh xử lý an toàn trước dữ liệu bẩn, chuỗi rỗng, unicode hỗn hợp.
- [x] **TASK-07.4**: Đóng gói bộ sản phẩm và kiểm tra cổng Prebuild an toàn tuyệt đối.
  - *Kiểm chứng*: Lệnh `npm run build` tự động kích hoạt `npm run test` trước khi biên dịch, xuất thành công bundle sạch tại `dist/`. Đã biên dịch phiên bản Release độc lập (`cargo build --release`) kích thước 15.7 MB tại `Hanzii-Dict.exe`, cấu hình `#![windows_subsystem = "windows"]` triệt tiêu hoàn toàn màn hình đen console và nhúng tĩnh toàn bộ frontend không cần dev server.
