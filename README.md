# HyDict Desktop ⚡

> **Từ điển tiếng Trung thông minh tra cứu siêu tốc chuẩn Lingoes trên Windows & Tích hợp Anki**

HyDict là phần mềm từ điển tiếng Trung để bàn thế hệ mới được xây dựng trên nền tảng **Tauri v2 (Rust)** kết hợp **React 18 + TypeScript + TailwindCSS**. Ứng dụng mang lại trải nghiệm tra từ tức thì ngay tại con trỏ chuột, tương tự Lingoes / Babelfish huyền thoại nhưng sở hữu giao diện hiện đại, công nghệ phân đoạn ngữ nghĩa NLP và hệ thống giọng đọc AI Microsoft Edge.

---

## 🌟 Tính Năng Nổi Bật

- **⚡ Quick Lookup HUD (Chuẩn Lingoes)**:
  - Bấm phím tắt toàn cục `Ctrl + Q` hoặc `Alt + Q` để tự động bôi từ, phân tích câu và hiển thị popup giải nghĩa ngay cạnh con trỏ chuột.
  - Tự động đóng khi click chuột ra ngoài (Auto-blur) hoặc ghim cố định trên màn hình (Pinning).
- **🧠 Phân từ ngữ nghĩa thông minh (Jieba NLP Tokenization)**:
  - Tự động tách câu tiếng Trung thành các từ ngữ pháp hoàn chỉnh, cho phép nhấp chọn từng từ để tra cứu chuyên sâu.
- **🎨 Pinyin đổi màu theo thanh điệu (Pleco Tone Colors)**:
  - Thanh 1 (Đỏ), Thanh 2 (Vàng), Thanh 3 (Xanh lục), Thanh 4 (Xanh lam), Thanh nhẹ (Xám).
- **🏆 Phân loại cấp độ HSK 1 – HSK 6**:
  - Gắn nhãn badge cấp độ chuẩn cho gần 5.000 từ vựng cốt lõi.
- **📖 CSDL Cục Bộ Offline 122.596 Từ + Kho Ví Dụ Tatoeba**:
  - Tích hợp sẵn CSDL SQLite cục bộ tốc độ tra cứu < 2ms không cần Internet.
  - Hàng nghìn câu ví dụ song ngữ Trung – Việt có sẵn phiên âm Pinyin.
- **🔊 Hệ thống giọng đọc Neural Voices (Microsoft Edge Read Aloud)**:
  - Giọng đọc nơ-ron tự nhiên bản xứ chuẩn Bắc Kinh (Xiaoxiao, Yunxi, Xiaoyi).
- **🎴 Cầu nối Anki 1-Click (AnkiConnect Integration)**:
  - Tạo flashcard từ vựng phong phú (Hanzi, Pinyin, Hán Việt, Định nghĩa, Ví dụ) trực tiếp sang Anki Desktop.
- **🛡️ Chống xung đột bộ gõ tiếng Việt (VCKey / UniKey / EVKey)**:
  - Gắn cờ hệ thống độc quyền `HYDICT_EXTRA_INFO (0x11A011A0)` để các bộ gõ tiếng Việt không bao giờ bị nghẽn hook bàn phím.

---

## 🛠️ Công Nghệ Sử Dụng

| Thành phần | Công nghệ |
| :--- | :--- |
| **Backend Core** | Rust 2021, Tauri v2, SQLite (`rusqlite`), Jieba NLP (`jieba-rs`) |
| **Frontend UI** | React 18, TypeScript, Vite, TailwindCSS, Lucide Icons |
| **Audio & TTS** | Microsoft Edge Neural Speech Service |
| **Kiểm thử tự động** | 5-Tier QA Test Pyramid (148+ tests, Zero-Regression Gate) |

---

## 🚀 Cài Đặt & Phát Triển

### Yêu cầu môi trường
- [Node.js](https://nodejs.org/) (v18+)
- [Rust](https://rustup.rs/) (v1.75+)
- WebView2 Runtime (có sẵn trên Windows 10/11)

### Khởi chạy chế độ lập trình (Dev Mode)
```bash
# Cài đặt thư viện npm
npm install

# Chạy kiểm thử chất lượng 5 tầng
npm test

# Chạy ứng dụng chế độ dev
npm run dev
```

### Đóng gói bản cài đặt Release
```bash
# Build binary độc lập (.exe)
npx tauri build --no-bundle
```

---

## ⌨️ Phím Tắt Mặc Định

- `Ctrl + Q` hoặc `Alt + Q`: Tra nhanh từ đang bôi đen hoặc vị trí chuột (Quick Lookup HUD).
- `Esc`: Đóng nhanh cửa sổ Quick Lookup HUD khi chưa ghim.
- Click Icon Khay Hệ Thống (System Tray): Ẩn / Hiện Cửa sổ quản lý chính (Main Window).

---

## 📄 Bản Quyền & Giấy Phép

Phát triển bởi **HyDict Team**. Giấy phép mã nguồn mở MIT.
