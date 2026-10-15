# SPECIFICATION: 04-POPUP-HUD (CỬA SỔ NỔI OVERLAY & PHÍM TẮT TOÀN CỤC)

> **Mã phân hệ**: `EPIC-04`  
> **Trạng thái**: `PENDING`  
> **Tiêu chuẩn**: `modular-architecture`, `ui-design-system`, `qa-verification`

---

## 1. TỔNG QUAN & USER STORIES
- **Người dùng**: Người học tiếng Trung đang mở Anki hoặc bất kỳ ứng dụng nào trên Windows.
- **Mục tiêu**: Khi bấm phím tắt toàn cục `Shift + T`, một cửa sổ nổi Popup HUD trong suốt, bo tròn tinh tế xuất hiện tức thì cạnh con trỏ chuột, hiển thị kết quả tra từ mà không làm gián đoạn luồng học.
- **User Story**:
  - Khi tôi đang xem thẻ Anki, tôi bôi đen hoặc click vào chữ `万` rồi bấm `Shift + T`, một popup nhỏ lập tức hiện ra ngay cạnh con trỏ chuột. Tôi xem nghĩa xong bấm `Esc` hoặc click chuột ra chỗ khác là popup tự biến mất.

---

## 2. RANH GIỚI MÔ-ĐUN & KIẾN TRÚC
- **Thư mục phân hệ**: `src/modules/popup-hud/`
- **Tệp xuất công khai**: `src/modules/popup-hud/index.ts`
- **Các thành phần nội bộ**:
  - `components/HudWindowContainer.tsx`: Khung bao ngoài cửa sổ nổi, xử lý kéo thả (drag), ghim (pin).
  - `components/HudTitlebar.tsx`: Thanh tiêu đề với nút Ghim (`Pin`) và Đóng (`Close`).
  - `hooks/useGlobalHotkey.ts`: Lắng nghe phím tắt và sự kiện trích xuất văn bản.
- **Backend Rust**: `src-tauri/src/hotkey.rs` & `src-tauri/src/window_hud.rs`:
  - Đăng ký Global Shortcut (`tauri-plugin-global-shortcut`).
  - Bắt sự kiện bàn phím toàn cục, điều khiển tọa độ cửa sổ theo vị trí chuột (`mouse_position`).
  - Thiết lập trạng thái cửa sổ: `decorations: false`, `transparent: true`, `always_on_top: true`.

---

## 3. MÔ HÌNH DỮ LIỆU & KIỂU DỮ LIỆU (TYPES)
```typescript
export interface HudState {
  isOpen: boolean;
  isPinned: boolean;
  position: { x: number; y: number };
  activeWord: string;
  sourceSentence?: string;
}

export type DismissReason = 'esc_key' | 'click_outside' | 'manual_close';
```

---

## 4. ĐẶC TẢ GIAO DIỆN & TRẠNG THÁI UI
- **Khung cửa sổ**:
  - Chiều rộng `480px`, bo tròn cực đại `rounded-3xl` (24px).
  - Bóng đổ mềm sâu `shadow-2xl` tạo chiều sâu nổi bật trên mọi nền màn hình.
  - Viền mỏng bán trong suốt `border border-slate-200/90`.
- **Thao tác tương tác**:
  - Nút Pin (Ghim): Khi bật, cửa sổ giữ cố định không tự tắt khi mất focus.
  - Phím `Esc`: Đóng cửa sổ ngay lập tức.
  - Phím `Ctrl + C`: Sao chép nhanh từ vựng đang chọn.

---

## 5. QUY TẮC NGHIỆP VỤ & THUẬT TOÁN
1. **Thuật toán Định vị Thông minh Tránh Tràn Màn Hình (Smart Screen Clamping)**:
   - Cửa sổ xuất hiện cách con trỏ chuột `x + 12px`, `y + 16px`.
   - Nếu vị trí chuột sát mép phải hoặc đáy màn hình, cửa sổ tự động đảo ngược tọa độ để luôn hiển thị 100% trọn vẹn trong vùng làm việc của màn hình (Work Area bounds).
2. **Cơ chế Lấy Văn Bản Đang Chọn (Text Capture Protocol)**:
   - Khi bấm `Shift + T`: Mô phỏng gửi lệnh sao chép `Ctrl + C` hoặc đọc từ Windows UI Automation $\rightarrow$ Đọc clipboard $\rightarrow$ Phân tích và tra cứu.

---

## 6. XỬ LÝ BIÊN & DỮ LIỆU BẨN
- **Người dùng bấm `Shift + T` khi chưa chọn chữ nào**: Tự động lấy từ vựng gần nhất trong clipboard hoặc mở popup ở trạng thái ô tìm kiếm nhanh.
- **Đa màn hình (Multi-monitor setups)**: Tính toán chính xác tọa độ trên màn hình mà con trỏ chuột đang hiện diện.

---

## 7. TIÊU CHÍ NGHIỆM THU (ACCEPTANCE CRITERIA / DOD)
- [ ] Phím tắt `Shift + T` hoạt động toàn cục ngay cả khi cửa sổ Hanzii Dict đang thu nhỏ hoặc ẩn.
- [ ] Cửa sổ Popup bung ra dưới 50 mili-giây, đúng vị trí con trỏ chuột.
- [ ] Tính năng ghim (`Pin`) và đóng nhanh (`Esc` / `Click-outside`) hoạt động chính xác 100%.
