# SPECIFICATION: 03-DICTIONARY-ENGINE (CSDL TỪ ĐIỂN OFFLINE SQLITE FTS5)

> **Mã phân hệ**: `EPIC-03`  
> **Trạng thái**: `COMPLETED`  
> **Tiêu chuẩn**: `modular-architecture`, `qa-verification`

---

## 1. TỔNG QUAN & USER STORIES
- **Người dùng**: Người học tiếng Trung cần tra từ đầy đủ, sâu sắc và tức thì.
- **Mục tiêu**: Cung cấp kho dữ liệu từ điển Trung - Việt offline lưu trữ bằng SQLite FTS5 (Full-Text Search), tra cứu < 2ms với đầy đủ các trường thông tin: Chữ Hán (Giản - Phồn), Pinyin có dấu, Âm Hán Việt, Từ loại, Giải nghĩa chi tiết và Câu ví dụ song ngữ.
- **Nguồn dữ liệu chuẩn mực**:
  - **Từ điển cốt lõi**: CVDICT (dựa trên CC-CEDICT cập nhật 12/2024, 122.596 mục từ - loại bỏ hoàn toàn các bộ StarDict/MDict cũ).
  - **Phiên âm Hán Việt**: Bảng ánh xạ 10.500+ ký tự Hán Việt chuẩn Thiều Chửu.
  - **Ngữ liệu câu ví dụ song ngữ**: Kho ngữ liệu mở **Tatoeba Project** chọn lọc cho 5.000 từ vựng cốt lõi HSK 1 – 6 (2 – 4 câu ví dụ/từ kèm Pinyin có dấu và bản dịch tiếng Việt).
- **User Story**:
  - Khi tôi tra chữ `万`, tôi muốn thấy: Pinyin `[ wàn ]`, Hán Việt `VẠN`, Từ loại `Số từ (num)`, các lớp nghĩa rõ ràng (1. Muôn, vạn; mười nghìn; 2. Rất nhiều, vô số...), kèm các câu ví dụ thực tế song ngữ chuẩn Tatoeba như `这本书有万页。`.

---

## 2. RANH GIỚI MÔ-ĐUN & KIẾN TRÚC
- **Thư mục phân hệ**: `src/modules/dictionary/`
- **Tệp xuất công khai**: `src/modules/dictionary/index.ts`
- **Các thành phần nội bộ**:
  - `rules.ts`: Thuật toán chuẩn hóa Pinyin (Tone marks sang số và ngược lại), tìm kiếm gần đúng (Fuzzy search).
  - `components/DefinitionCard.tsx`: Thẻ hiển thị định nghĩa chính, Pinyin, Hán Việt.
  - `components/ExampleList.tsx`: Danh sách câu ví dụ song ngữ.
  - `hooks/useDictionaryLookup.ts`: Hook gọi Rust IPC tra cứu từ điển.
- **Backend Rust**: `src-tauri/src/db.rs` quản lý kết nối SQLite, indexing FTS5, và transaction an toàn.

---

## 3. MÔ HÌNH DỮ LIỆU & SCHEMA CSDL (SQLITE FTS5)
```sql
CREATE TABLE IF NOT EXISTS dictionary_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    simplified TEXT NOT NULL,       -- Chữ Hán giản thể (万)
    traditional TEXT,              -- Chữ Hán phồn thể (萬)
    pinyin TEXT NOT NULL,          -- Pinyin chuẩn (wàn)
    pinyin_num TEXT NOT NULL,      -- Pinyin số (wan4)
    han_viet TEXT NOT NULL,        -- Âm Hán Việt (VẠN)
    pos TEXT,                      -- Từ loại (num, noun, verb...)
    definitions TEXT NOT NULL,     -- Mảng JSON định nghĩa tiếng Việt
    examples TEXT                  -- Mảng JSON câu ví dụ song ngữ
);

CREATE VIRTUAL TABLE IF NOT EXISTS dict_fts USING fts5(
    simplified,
    pinyin,
    han_viet,
    content='dictionary_entries',
    content_rowid='id'
);
```

```typescript
export interface ExampleSentence {
  chinese: string;
  pinyin: string;
  vietnamese: string;
  audioUrl?: string;
}

export interface DictionaryEntry {
  id: number;
  simplified: string;
  traditional?: string;
  pinyin: string;
  hanViet: string;
  pos?: string;
  definitions: string[];
  examples: ExampleSentence[];
}
```

---

## 4. ĐẶC TẢ GIAO DIỆN & TRẠNG THÁI UI
- **Khối Tiêu đề (Word Hero)**: Chữ Hán kích thước lớn `text-5xl font-extrabold text-blue-900`.
- **Dải Meta Badge**: 
  - Pinyin: Nền vàng cam `bg-amber-50 text-amber-700 border-amber-200`.
  - Hán Việt: Nền xanh ngọc `bg-emerald-50 text-emerald-700 border-emerald-200 font-bold`.
  - Từ loại: Nền tím nhạt `bg-purple-50 text-purple-700 border-purple-200`.
- **Khối Định nghĩa**: Tách số thứ tự (1, 2, 3...) rõ ràng, font chữ dễ đọc `text-slate-700 leading-relaxed`.
- **Khối Câu ví dụ**: Card viền xanh bên trái `border-l-4 border-blue-600 bg-white rounded-xl p-3 shadow-xs`.

---

## 5. QUY TẮC NGHIỆP VỤ & THUẬT TOÁN
1. **Ưu tiên Tìm kiếm Chính xác (Exact Match First)**: Nếu tra `万`, trả về ngay bản ghi có `simplified = '万'`.
2. **Tìm kiếm Tiền tố (Prefix Match Fallback)**: Nếu không có từ nguyên vẹn, gợi ý các từ ghép bắt đầu bằng chữ đó.
3. **Tra cứu qua Pinyin / Hán Việt**: Hỗ trợ gõ Pinyin không dấu (`wan`) hoặc Hán Việt (`van`) để tìm ngược lại chữ Hán.

---

## 6. XỬ LÝ BIÊN & DỮ LIỆU BẨN
- **Từ chưa có trong từ điển**: Hiển thị trạng thái `Empty State` kèm nút "Dịch trực tuyến nhanh (Fallback)".
- **Ký tự lạ hoặc số**: Không làm crash CSDL, trả về `None` an toàn.
- **Dữ liệu JSON trong CSDL bị hỏng**: Bộ parser có fallback an toàn, không để vỡ UI.

---

## 7. TIÊU CHÍ NGHIỆM THU (ACCEPTANCE CRITERIA / DOD)
- [ ] Schema SQLite FTS5 được khởi tạo hoàn chỉnh kèm index.
- [ ] Tích hợp bộ từ điển dữ liệu gốc (CC-CEDICT + Hán Việt + Ví dụ).
- [ ] Tốc độ truy vấn từ đo được dưới 3 mili-giây.
- [ ] 100% Integration test kiểm tra truy vấn đọc/ghi CSDL đạt `PASS`.
