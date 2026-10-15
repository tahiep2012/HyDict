# SPECIFICATION: 06-ANKI-INTEGRATION (TÍCH HỢP ANKI HAI CHIỀU)

> **Mã phân hệ**: `EPIC-06`  
> **Trạng thái**: `PENDING`  
> **Tiêu chuẩn**: `modular-architecture`, `ui-design-system`, `qa-verification`

---

## 1. TỔNG QUAN & USER STORIES
- **Người dùng**: Người học tiếng Trung đang sử dụng phần mềm Anki trên Desktop.
- **Mục tiêu**: 
  1. Hỗ trợ **1-Click Thêm vào Anki** thông qua API AnkiConnect (cổng 8765): Tự động tạo thẻ mới có sẵn Hanzi, Pinyin, Hán Việt, Nghĩa, Câu ví dụ và file Audio.
  2. Cung cấp **Anki Add-on thông minh**: Khi học trên Anki, chỉ cần **nhấp đúp chuột** vào bất kỳ từ nào, Add-on tự động bắt sự kiện, mở rộng vùng bôi đen theo từ có nghĩa và kích hoạt popup tra từ ngay lập tức.
- **User Story**:
  - Khi tôi đang ôn bài trên Anki, tôi nhấp đúp vào một từ lạ, popup tự hiện ra giải nghĩa; tôi bấm nút "Thêm vào Anki" $\rightarrow$ Thẻ mới được tạo ngay lập tức vào bộ thẻ `Từ vựng HSK` của tôi.

---

## 2. RANH GIỚI MÔ-ĐUN & KIẾN TRÚC
- **Thư mục phân hệ**: `src/modules/anki-bridge/`
- **Tệp xuất công khai**: `src/modules/anki-bridge/index.ts`
- **Các thành phần nội bộ**:
  - `components/AddToAnkiButton.tsx`: Nút bấm thêm vào Anki kèm trạng thái Loading / Success.
  - `hooks/useAnkiConnect.ts`: Hook tương tác với API AnkiConnect HTTP `http://127.0.0.1:8765`.
  - `rules.ts`: Thuật toán format mẫu Flashcard HTML chuẩn theo chuẩn Anki CSS.
- **Thư mục Anki Add-on**: `anki-addon/` chứa file Python/JS add-on nhúng trực tiếp vào Anki webview reviewer.

---

## 3. MÔ HÌNH DỮ LIỆU & ANKICONNECT PAYLOAD
```typescript
export interface AnkiCardPayload {
  deckName: string;
  modelName: string;
  fields: {
    Hanzi: string;
    Pinyin: string;
    HanViet: string;
    Meaning: string;
    Example: string;
    Audio?: string;
  };
  tags: string[];
}
```

---

## 4. ĐẶC TẢ GIAO DIỆN & TRẠNG THÁI UI
- **Nút "Thêm vào Anki"**:
  - Đặt ở chân Popup HUD (`hud-footer`).
  - Màu xanh lá cây nổi bật `bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl px-4 py-2 shadow-xs`.
  - 4 trạng thái UI:
    - *Default*: Icon `+` và chữ "Thêm vào Anki".
    - *Loading*: Icon spinner xoay tròn, nút bị disable để chống spam click.
    - *Success*: Icon check xanh lá $\checkmark$, thông báo "Đã thêm thành công".
    - *Error*: Icon cảnh báo đỏ kèm tooltip "Hãy mở Anki và cài đặt AnkiConnect".

---

## 5. QUY TẮC NGHIỆP VỤ & THUẬT TOÁN
1. **Kiểm Tra Trạng Thái Kết Nối Anki (Health Check)**:
   - Trước khi gửi, gọi `version` action của AnkiConnect để kiểm tra Anki đang chạy hay đóng.
2. **Chống Trùng Thẻ (Duplicate Guard)**:
   - Sử dụng action `findNotes` với query `Hanzi:"..."` để phát hiện nếu từ vựng đã có trong Anki, cảnh báo người dùng tránh tạo thẻ trùng lặp.
3. **Đính Kèm File Âm Thanh Tự Động**:
   - Sử dụng action `storeMediaFile` để lưu file mp3 phát âm vào thư mục `collection.media` của Anki và chèn cú pháp `[sound:hanzi_audio.mp3]` vào thẻ.

---

## 6. XỬ LÝ BIÊN & DỮ LIỆU BẨN
- **Anki chưa bật**: Thông báo người dùng mở Anki hoặc hướng dẫn cài đặt extension AnkiConnect (mã addon: `2055492159`).
- **Deck hoặc Note Type chưa tồn tại**: Tự động tạo Note Type mặc định nếu phát hiện chưa có.

---

## 7. TIÊU CHÍ NGHIỆM THU (ACCEPTANCE CRITERIA / DOD)
- [ ] Gửi thành công thẻ mới vào Anki qua AnkiConnect với đầy đủ dữ liệu và âm thanh.
- [ ] Xử lý mượt mà khi Anki tắt (báo lỗi thân thiện, không làm sập ứng dụng).
- [ ] Add-on trong Anki bắt được sự kiện nhấp đúp và mở rộng vùng bôi đen từ vựng chính xác.
