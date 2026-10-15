# SPECIFICATION: 02-SEGMENTATION (ENGINE PHÂN TỪ CJK THÔNG MINH)

> **Mã phân hệ**: `EPIC-02`  
> **Trạng thái**: `PENDING`  
> **Tiêu chuẩn**: `modular-architecture`, `qa-verification`

---

## 1. TỔNG QUAN & USER STORIES
- **Người dùng**: Người học tiếng Trung trên máy tính Windows.
- **Mục tiêu**: Tự động giải mã câu tiếng Trung thành các từ hoặc cụm từ có nghĩa (Morphological Tokenization) giống như trải nghiệm iOS, giúp người dùng không cần bôi đen thủ công từng chữ.
- **User Story**: 
  - Khi tôi nhấp đúp hoặc chọn một phần trong câu `这本书有万页。`, hệ thống phải tự động nhận diện `本书` là một từ ngữ nghĩa, `万` là một từ, và trả về danh sách các token hoàn chỉnh kèm vị trí bắt đầu và kết thúc (`start_idx`, `end_idx`).

---

## 2. RANH GIỚI MÔ-ĐUN & KIẾN TRÚC
- **Thư mục phân hệ**: `src/modules/segmentation/`
- **Tệp xuất công khai**: `src/modules/segmentation/index.ts`
- **Các thành phần nội bộ**:
  - `rules.ts`: Thuật toán tách từ n-gram, chuẩn hóa ký tự CJK, lọc dấu câu.
  - `hooks/useSegmentation.ts`: Hook tương tác với engine phân từ.
  - `components/SentenceSegmentBar.tsx`: Thanh pill chips hiển thị danh sách từ trong câu.
- **Backend Rust**: `src-tauri/src/segmentation.rs` tích hợp `jieba-rs` xử lý thuật toán phân đoạn từ ngữ siêu tốc.

---

## 3. MÔ HÌNH DỮ LIỆU & KIỂU DỮ LIỆU (TYPES)
```typescript
export interface ChineseToken {
  word: string;
  start: number;
  end: number;
  pinyin?: string;
  isPunctuation: boolean;
}

export interface SegmentationResult {
  rawSentence: string;
  tokens: ChineseToken[];
  targetTokenIndex: number;
}
```

---

## 4. ĐẶC TẢ GIAO DIỆN & TRẠNG THÁI UI
- **Thanh Segment Chips**:
  - Dải pill buttons bo tròn `rounded-xl` màu xám nhạt `bg-slate-100 hover:bg-slate-200`.
  - Token đang được tra cứu có viền xanh `bg-blue-600 text-white font-bold shadow-xs`.
  - Nhấp vào token bất kỳ lập tức chuyển từ tra cứu mà không cần đóng popup.

---

## 5. QUY TẮC NGHIỆP VỤ & THUẬT TOÁN
1. **Thuật toán Phân Tách Từ Dài Nhất (Max-Match / HMM Jieba)**:
   - Ưu tiên nhóm từ có nghĩa trong từ điển chuẩn (ví dụ: `北京大学` tách thành `北京大学` hoặc `北京` + `大学` tùy theo độ sâu).
2. **Xử lý Dấu Câu CJK**:
   - Tự động bỏ qua các dấu câu tiếng Trung (`。`, `，`, `！`, `？`, `、`) không đưa vào tra cứu từ vựng.
3. **Fallback Khi Không Có Mạng Hoặc Ngoại Tuyến**:
   - Nếu Rust engine chưa sẵn sàng, frontend sử dụng thuật toán nội bộ `Intl.Segmenter('zh', { granularity: 'word' })` để đảm bảo 100% không bao giờ bị crash.

---

## 6. XỬ LÝ BIÊN & DỮ LIỆU BẨN
- **Câu rỗng hoặc chỉ có khoảng trắng**: Trả về mảng rỗng, không gây lỗi.
- **Văn bản hỗn hợp (Trung - Anh - Số - Emoji)**: Phân tách chính xác phần chữ Hán và giữ nguyên các token khác.
- **Chuỗi văn bản cực dài (> 1000 ký tự)**: Giới hạn cửa sổ phân tích (Windowing) xung quanh vị trí con trỏ chuột trong vòng 50 ký tự trước/sau để duy trì độ phản hồi dưới 1ms.

---

## 7. TIÊU CHÍ NGHIỆM THU (ACCEPTANCE CRITERIA / DOD)
- [ ] Phân tích chính xác các câu mẫu trong Anki (ví dụ: `这本书有万页。` $\rightarrow$ `['这', '本书', '有', '万', '页', '。']`).
- [ ] Thời gian phân đoạn từ đo được dưới 2 mili-giây.
- [ ] 100% Unit test kiểm tra thuật toán trong `tests/` ĐẠT (`PASS`).
