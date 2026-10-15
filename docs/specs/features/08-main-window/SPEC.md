# ĐẶC TẢ CHI TIẾT: 08-MAIN-WINDOW (CỬA SỔ QUẢN TRỊ & CÀI ĐẶT CHUẨN LINGOES)

> **Mã phân hệ**: `EPIC-08`  
> **Tên phân hệ**: Giao diện Quản trị & Cài đặt Đa Cửa sổ (Lingoes-Style Main Window & Settings Hub)  
> **Mức độ ưu tiên**: `P0 (Bắt buộc)`  
> **Kiến trúc áp dụng**: `modular-architecture`, `ui-design-system`  

---

## 1. MỤC TIÊU NGHIỆP VỤ

Khắc phục hoàn toàn vấn đề ứng dụng chỉ có khung pop-up nhỏ hẹp, thiếu chuyên nghiệp và không có chỗ tắt/cài đặt.
Xây dựng **Cửa sổ Chính (Main Window)** kích thước chuẩn Desktop (860 x 640px) có đầy đủ thanh viền Windows 11, chia thành 4 phân hệ tab rõ ràng:
1. **Tra Từ & Lịch Sử (Dictionary & Search Hub)**: Tra cứu từ điển tiếng Trung offline chuyên sâu (Hán tự, Pinyin, Hán Việt, Nghĩa, Câu ví dụ, Hoạt họa nét viết), lưu lịch sử tra cứu gần đây.
2. **Bắt Từ & Phím Tắt (Screen Capture & Hotkeys)**: Tùy biến phím tắt toàn cục (`Shift+T`, `Alt+Q`), chọn chế độ bắt chuột (hiện bong bóng nhỏ hoặc hiện thẳng HUD), bộ lọc ký tự CJK thông minh.
3. **Cấu Hình Anki (AnkiConnect Integration)**: Cài đặt URL AnkiConnect, kiểm tra kết nối hai chiều (Live connection badge), chọn Deck mặc định (Tiếng Trung), sơ đồ ánh xạ trường thẻ Anki.
4. **Giọng Đọc & Hệ Thống (TTS & General Settings)**: Chọn giọng đọc Microsoft Edge-TTS (Xiaoxiao nữ / Yunxi nam), tùy chọn tự động phát âm khi tra từ, tùy chọn khởi động cùng Windows.

---

## 2. QUY CHUẨN KIẾN TRÚC MÔ-ĐUN (`src/modules/main-window/`)

Module được đóng gói độc lập theo tiêu chuẩn `modular-architecture`:
```text
src/modules/main-window/
├── index.ts                     # Public API duy nhất
├── types.ts                     # Type definitions cho Settings & Tabs
├── components/
│   ├── MainWindowLayout.tsx     # Khung layout tổng thể (Sidebar trái + Content phải)
│   ├── DictLookupTab.tsx        # Tab 1: Tra từ & lịch sử
│   ├── HotkeyCaptureTab.tsx     # Tab 2: Cài đặt phím tắt & bắt chuột
│   ├── AnkiConfigTab.tsx        # Tab 3: Cấu hình AnkiConnect
│   ├── SystemSettingsTab.tsx    # Tab 4: Giọng đọc & khởi động
│   └── SystemTrayModal.tsx      # Modal mô phỏng menu Khay hệ thống
└── hooks/
    └── useMainWindowState.ts    # Quản lý state chuyển tab, từ khóa tra cứu, cấu hình lưu trữ
```

---

## 3. THIẾT KẾ GIAO DIỆN & TRẢI NGHIỆM NGƯỜI DÙNG (UI/UX)

- Sử dụng Atomic Components chuẩn (`Button`, `Card`, `Badge`).
- Đủ 5 trạng thái tương tác (`Default`, `Hover`, `Active`, `Focus-Visible`, `Disabled`).
- Đủ 4 trạng thái giao diện (`Loading`, `Empty`, `Error`, `Success`).
- Kích thước cửa sổ Windows: 860 x 640px, hỗ trợ thay đổi kích thước (`resizable: true`), có khung viền và nút điều khiển chuẩn (`decorations: true`).
