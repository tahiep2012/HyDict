# ĐẶC TẢ KỸ THUẬT: TRA CỨU NGƯỢC VIỆT - TRUNG & PINYIN KHÔNG DẤU (SPEC-11)

> **Mã phân hệ**: `EPIC-11`  
> **Thư mục lưu trữ**: `docs/specs/features/11-reverse-search/`  
> **Mức độ ưu tiên**: P1 (Quan trọng - Phục vụ công việc dịch thuật & soạn thảo)  
> **Tiêu chuẩn tuân thủ**: `spec-driven-development`, `modular-architecture`, `ui-design-system`, `qa-verification`

---

## 1. TỔNG QUAN & USER STORIES

### 1.1. Bối cảnh
Người học và người làm việc với tiếng Trung thường xuyên rơi vào 2 tình huống phổ biến:
1. **Tìm từ tiếng Trung tương ứng khi chỉ nhớ nghĩa tiếng Việt**: Ví dụ muốn viết câu "Anh ấy bị sa thải", người dùng không nhớ từ "sa thải" tiếng Trung là gì $\rightarrow$ cần gõ "sa thải" để tra ngược ra `解雇` (jiěgù) hoặc `开除` (kāichú).
2. **Gõ Pinyin không dấu bằng bàn phím thông thường**: Ví dụ gõ `gongzuo` hoặc `nihao` $\rightarrow$ ứng dụng tự động gợi ý `工作`, `你好`.

### 1.2. User Stories
- **US-01 (Reverse Lookup)**: Khi nhập một từ hoặc cụm từ tiếng Việt vào thanh tìm kiếm, từ điển hiển thị các từ vựng tiếng Trung có định nghĩa hoặc âm Hán Việt khớp nhất.
- **US-02 (Pinyin Search)**: Khi nhập Pinyin không dấu, hệ thống tự động nhận diện mẫu Pinyin và gợi ý danh sách chữ Hán tương ứng.

---

## 2. KIẾN TRÚC & THUẬT TOÁN TÌM KIẾM CƠ SỞ DỮ LIỆU

```mermaid
flowchart TD
    Q["Chuỗi tìm kiếm (Query)"] --> DETECT{"Nhận diện loại Query"}
    DETECT -->|Chữ Hán CJK| H1["Truy vấn trực tiếp: simplified / traditional"]
    DETECT -->|Pinyin Latinh (vd: nihao)| H2["Truy vấn pinyin không dấu qua chỉ mục SQLite"]
    DETECT -->|Tiếng Việt (vd: sa thải)| H3["Truy vấn Full-Text Search (FTS) trên cột definitions & han_viet"]
    H1 --> RESULT["Trả về danh sách DictionaryEntry"]
    H2 --> RESULT
    H3 --> RESULT
```

- **Mở rộng SQLite Index**:
  - Tạo cột phụ ảo hoặc chỉ mục `pinyin_clean` (Pinyin đã loại bỏ dấu thanh điệu và khoảng trắng).
  - Tối ưu câu lệnh SQLite `LIKE` hoặc `FTS5` để truy vấn ngược trên trường `definitions` trong thời gian `< 10ms`.

---

## 3. MÔ HÌNH DỮ LIỆU & KIỂU DỮ LIỆU (TYPES)

```typescript
export type SearchQueryType = 'chinese' | 'pinyin' | 'vietnamese';

export interface SearchClassificationResult {
  type: SearchQueryType;
  normalizedQuery: string;
}
```

---

## 4. QUY TẮC NGHIỆP VỤ & THUẬT TOÁN (BUSINESS RULES)

### 4.1. Nhận diện loại từ khóa (`classifySearchQuery`)
1. Nếu chuỗi chứa ít nhất 1 ký tự trong dải Unicode CJK (`\u4e00-\u9fa5`) $\rightarrow$ Type: `'chinese'`.
2. Nếu chuỗi chỉ chứa các chữ cái Latinh không có dấu thanh tiếng Việt (ví dụ `a-z`, có thể có số 1-5) và khớp với cấu trúc âm tiết Pinyin $\rightarrow$ Type: `'pinyin'`.
3. Nếu chuỗi chứa các ký tự tiếng Việt có dấu (`à, á, ả, ã, ạ, ă, â, đ, ê, ô, ơ, ư...`) hoặc là từ ngữ Latinh thông thường $\rightarrow$ Type: `'vietnamese'`.

### 4.2. Xử lý kết quả tra ngược tiếng Việt
- Sắp xếp độ ưu tiên kết quả:
  1. Khớp hoàn toàn định nghĩa ngắn gọn.
  2. Khớp âm Hán Việt.
  3. Khớp một phần trong danh sách các định nghĩa chi tiết.

---

## 5. TIÊU CHÍ NGHIỆM THU (DEFINITION OF DONE)
- [ ] Gõ "bảo hiểm" tìm ra từ `保险` trong top 3 kết quả.
- [ ] Gõ "gongzuo" tìm ra từ `工作` trong top 3 kết quả.
- [ ] Thời gian phản hồi tìm kiếm cục bộ không vượt quá 15ms.
- [ ] Giữ nguyên 100% độ chính xác cho tính năng tra cứu chữ Hán truyền thống.
