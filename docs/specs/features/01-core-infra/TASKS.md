# TASKS: 01-CORE-INFRA (KHUNG NỀN TẢNG & ATOMIC UI)

> **Mã phân hệ**: `EPIC-01`  
> **Trạng thái**: `COMPLETED`  
> **Quy ước**: `[ ]` Chưa làm | `[/]` Đang làm | `[x]` Đã hoàn thành

---

## DANH SÁCH CÔNG VIỆC CHI TIẾT

- [x] **TASK-01.1**: Khởi tạo cấu trúc dự án chuẩn Tauri v2 + React + TypeScript + Vite.
  - *Kiểm chứng*: Đã tạo cấu trúc, cài đặt dependencies, `npm run build` thành công xuất xưởng `dist/`.
- [x] **TASK-01.2**: Cấu hình Tailwind CSS và khai báo bộ Design Tokens (Color Palette, Rounded-2xl/3xl, CJK Fonts).
  - *Kiểm chứng*: `tailwind.config.js` và `index.css` tích hợp chuẩn, biên dịch CSS 14.85 kB.
- [x] **TASK-01.3**: Xây dựng thư viện Atomic Components chuẩn tại `src/components/ui/` (`Button`, `Card`, `Badge`).
  - *Kiểm chứng*: Có đầy đủ 5 trạng thái tương tác (`Default`, `Hover`, `Active`, `Focus`, `Disabled`) và loading spinner.
- [x] **TASK-01.4**: Cấu hình bộ khung kiểm thử 5 tầng `tests/test_qa_lifecycle.ts` và tích hợp `prebuild` hook trong `package.json`.
  - *Kiểm chứng*: Chạy `npm test` quét Tầng 0 đến Tầng 5 đạt 100% PASS (18/18 tests passed). Cổng Prebuild khóa lỗi bảo vệ 100%.
