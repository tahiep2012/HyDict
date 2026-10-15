# LIVING TASK CHECKLIST: CHỤP MÀN HÌNH NHẬN DIỆN CHỮ HÁN - SCREEN CAPTURE OCR (EPIC-12)

> **Mã phân hệ**: `EPIC-12`  
> **Trạng thái tổng thể**: `[ ] PENDING`  
> **Mỏ neo kiểm soát tiến độ**: Lưu trạng thái đĩa cứng theo chuẩn `spec-driven-development`

---

## 1. PHÂN RÃ CÔNG VIỆC CHI TIẾT (TASK BREAKDOWN)

### Giai đoạn 1: Backend Snipping & OCR Integration (Rust)
- [ ] `TASK-12.1`: Đăng ký phím tắt toàn cục `alt+s` trong `src-tauri/src/lib.rs` (non-blocking thread)
- [ ] `TASK-12.2`: Xây dựng module chụp màn hình `src-tauri/src/screen_capture.rs`
  - [ ] Chụp ảnh bitmap vùng chọn sử dụng Win32 `BitBlt` hoặc `windows-capture`
- [ ] `TASK-12.3`: Xây dựng module OCR `src-tauri/src/ocr.rs`
  - [ ] Gọi `Windows.Media.Ocr` API của Windows 10/11 để nhận diện chữ Hán
  - [ ] Trả về chuỗi văn bản nhận diện được sang frontend

### Giai đoạn 2: Snipping Overlay Window (Frontend UI)
- [ ] `TASK-12.4`: Tạo cửa sổ Snipping Overlay trong `tauri.conf.json`
- [ ] `TASK-12.5`: Xây dựng component `ScreenSnipper.tsx`
  - [ ] Hiển thị lớp phủ mờ toàn màn hình
  - [ ] Cho phép vẽ khung chữ nhật chọn vùng
  - [ ] Bắt sự kiện phím `Escape` để hủy bỏ

### Giai đoạn 3: Tích hợp HUD & QA Gate
- [ ] `TASK-12.6`: Nối sự kiện nhận diện OCR thành công sang HUD Quick Lookup
- [ ] `TASK-12.7`: Viết integration tests kiểm thử quy trình chụp và xử lý kết quả OCR
- [ ] `TASK-12.8`: Chạy toàn bộ 5 tầng test `npm test` và `cargo test`, cam kết 100% PASS
