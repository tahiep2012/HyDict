# SPECIFICATION: 07-QA-PACKAGING (CỔNG QA 5 TẦNG & ĐÓNG GÓI .EXE)

> **Mã phân hệ**: `EPIC-07`  
> **Trạng thái**: `PENDING`  
> **Tiêu chuẩn**: `qa-verification`, `explicit-confirmation-gate`

---

## 1. TỔNG QUAN & USER STORIES
- **Người dùng**: Lập trình viên và người dùng cài đặt ứng dụng.
- **Mục tiêu**: Đảm bảo 100% ứng dụng trước khi build xuất xưởng phải vượt qua Kim tự tháp kiểm thử 5 tầng; đóng gói bộ cài hoàn chỉnh trên Windows (`.msi` / `.exe`) chạy mượt mà, độc lập, không yêu cầu cài đặt môi trường phức tạp.
- **User Story**:
  - Khi tôi tải file cài đặt `.exe` về máy, tôi cài đặt với 1 cú click, ứng dụng chạy nền mượt mà ở System Tray, không chiếm dụng tài nguyên CPU/RAM, và không bao giờ gặp lỗi giật lag hay văng ứng dụng.

---

## 2. KIM TỰ THÁP KIỂM THỬ 5 TẦNG (`tests/test_qa_lifecycle.ts`)
1. **Tầng 0: Cổng Kiến Trúc Mô-Đun (Tier 0 Architecture Gate)**:
   - Quét 100% các module trong `src/modules/` bắt buộc phải có `index.ts`.
   - Quét cấm triệt để việc import sâu xuyên thấu (`deep import scanning`).
2. **Tầng 1: Kiểm Thử Đơn Vị (Tier 1 Unit Tests)**:
   - Kiểm tra thuật toán phân từ Jieba, chuẩn hóa Pinyin, định dạng Hán Việt, lọc dấu câu CJK.
3. **Tầng 2: Kiểm Thử Tích Hợp (Tier 2 Integration Tests)**:
   - Kiểm tra kết nối SQLite FTS5, transaction đọc/ghi, audio cache, AnkiConnect.
4. **Tầng 3: Kiểm Thử Giao Diện & Trạng Thái (Tier 3 Functional UI Tests)**:
   - Kiểm tra 4 trạng thái giao diện (`Loading`, `Empty`, `Error`, `Success`) và các tương tác phím tắt.
5. **Tầng 4: Kiểm Thử Chịu Tải & Dữ Liệu Bẩn (Tier 4 Stress & Boundary Tests)**:
   - Kiểm tra với văn bản tiếng Trung cực dài, ký tự unicode lạ, kiểm tra khi ngắt mạng hoặc Anki tắt.
6. **Tầng 5: Kiểm Thử Hồi Quy & Nghiệm Thu (Tier 5 Zero-Regression & DoD)**:
   - Đảm bảo toàn bộ hệ thống hoạt động ổn định và sẵn sàng đóng gói.

---

## 3. QUY TRÌNH ĐÓNG GÓI BẢN CÀI ĐẶT
- Sử dụng Tauri CLI đóng gói binary native: `npm run tauri build`.
- Tạo file cài đặt:
  - `Hanzii-Dict-Setup.exe` (NSIS Installer)
  - `Hanzii-Dict.msi` (Windows Installer)
- Tích hợp System Tray Icon (biểu tượng khay hệ thống) có menu: "Mở từ điển", "Cài đặt phím tắt", "Thoát".

---

## 4. TIÊU CHÍ NGHIỆM THU (ACCEPTANCE CRITERIA / DOD)
- [ ] 100% Test cases trên cả 5 tầng đạt PASS (`exit code: 0`).
- [ ] Cổng `prebuild` chặn đứng mọi lần build nếu có lỗi test.
- [ ] Đóng gói thành công file `.exe` / `.msi` cài đặt và chạy thử nghiệm mượt mà trên Windows.
