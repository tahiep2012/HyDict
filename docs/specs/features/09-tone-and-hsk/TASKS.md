# LIVING TASK CHECKLIST: TÔ MÀU THANH ĐIỆU PINYIN & HUY HIỆU HSK (EPIC-09)

> **Mã phân hệ**: `EPIC-09`  
> **Trạng thái tổng thể**: `[x] COMPLETED`  
> **Mỏ neo kiểm soát tiến độ**: Lưu trạng thái đĩa cứng theo chuẩn `spec-driven-development`

---

## 1. PHÂN RÃ CÔNG VIỆC CHI TIẾT (TASK BREAKDOWN)

### Giai đoạn 1: Lõi Thuật toán & Data Rules (Backend / Business Rules)
- [x] `TASK-09.1`: Xây dựng module `src/modules/dictionary/rules/pinyinTone.ts`
  - [x] Triển khai hàm `getToneFromPinyinSyllable(syllable: string): ToneNumber`
  - [x] Triển khai hàm `parsePinyinToTokens(pinyinStr: string): PinyinSyllableToken[]`
  - [x] Viết unit tests kiểm thử độ chính xác cho cả 5 thanh điệu và các trường hợp có dấu ngoặc `[ ... ]`
- [x] `TASK-09.2`: Xây dựng module phân loại cấp độ `src/modules/dictionary/rules/hskClassifier.ts`
  - [x] Nạp bảng dữ liệu tra cứu HSK 1 - 6 (4.991 từ vựng cốt lõi `hskData.json`)
  - [x] Triển khai hàm `getHskLevel(simplified: string): HskLevel`
  - [x] Viết unit test xác thực cấp độ của các từ mẫu (`爱` -> HSK 1, `万` -> HSK 3, `报销` -> HSK 6)

### Giai đoạn 2: Phát Triển Atomic Components (Frontend UI)
- [x] `TASK-09.3`: Tạo Atomic Component `src/modules/dictionary/components/ToneColoredPinyin.tsx`
  - [x] Render màu sắc chuẩn Pleco: Thanh 1 đỏ, Thanh 2 vàng, Thanh 3 xanh lá, Thanh 4 xanh dương, Khinh thanh xám
  - [x] Tích hợp prop `enabled?: boolean` để hỗ trợ bật/tắt theo cấu hình người dùng
- [x] `TASK-09.4`: Tạo Atomic Component `src/modules/dictionary/components/HskLevelBadge.tsx`
  - [x] Thiết kế badge bo góc mềm mại, phân màu nền pastel theo từng cấp độ
  - [x] Tự động ẩn nếu cấp độ là `null`

### Giai đoạn 3: Tích Hợp Vào Cửa Sổ HUD & Main Window
- [x] `TASK-09.5`: Cập nhật `HudLingoesContent.tsx` trong module `popup-hud`
  - [x] Tích hợp `ToneColoredPinyin` thay thế thẻ `<p>` Pinyin cũ
  - [x] Gắn `HskLevelBadge` cạnh chữ Hán tiêu đề
  - [x] Tích hợp `ToneColoredPinyin` cho toàn bộ các câu ví dụ song ngữ
- [x] `TASK-09.6`: Cập nhật `DefinitionCard.tsx` và `ExampleList.tsx` trong module `dictionary` (Cửa sổ chính)
  - [x] Đồng bộ hiển thị Pinyin đổi màu và nhãn HSK cho từ vựng và câu ví dụ

### Giai đoạn 4: QA Gate & Pre-Build Verification
- [x] `TASK-09.7`: Bổ sung test cases vào `tests/test_qa_lifecycle.ts` (Tầng 1 & Tầng 3)
- [x] `TASK-09.8`: Chạy `npm test` (148/148 PASS) và `cargo test` (6/6 PASS), đóng gói binary `Hanzii-Dict.exe`
