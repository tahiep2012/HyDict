# TASKS: 03-DICTIONARY-ENGINE (CSDL TỪ ĐIỂN OFFLINE SQLITE FTS5)

> **Mã phân hệ**: `EPIC-03`  
> **Trạng thái**: `COMPLETED`  
> **Quy ước**: `[ ]` Chưa làm | `[/]` Đang làm | `[x]` Đã hoàn thành

---

## DANH SÁCH CÔNG VIỆC CHI TIẾT

- [x] **TASK-03.1**: Xây dựng SQLite DB Service trong Rust Backend (`src-tauri/src/db.rs`) với bảng FTS5 và pool kết nối r2d2.
  - *Kiểm chứng*: Khởi tạo DB in-memory/file thành công, schema hoàn chỉnh với bảng `dictionary_entries` và index `idx_simplified`.
- [x] **TASK-03.2**: Xây dựng module nạp dữ liệu từ điển hạt nhân (Seeding core Chinese-Vietnamese dictionary data).
  - *Kiểm chứng*: Có sẵn bộ từ vựng cơ bản và nâng cao (chữ `万`, `本书`, `这`, `书`, `有`, `页`, `万里长城`, `十分`, `雄伟`, `汉语`).
- [x] **TASK-03.3**: Viết Tauri Command `lookup_dictionary(word: String)` và `search_suggestions(query: String)`.
  - *Kiểm chứng*: Đã đăng ký trong `src-tauri/src/lib.rs` và tích hợp hook gọi từ frontend.
- [x] **TASK-03.4**: Xây dựng UI components `DefinitionCard.tsx` và `ExampleList.tsx` tại `src/modules/dictionary/`.
  - *Kiểm chứng*: Render đẹp mắt, đáp ứng chuẩn `ui-design-system` và đủ các trạng thái dữ liệu.
- [x] **TASK-03.5**: Viết Integration Tests Tầng 1, 2, 3 kiểm tra hiệu năng truy vấn và bảo toàn dữ liệu.
  - *Kiểm chứng*: `npm test` xác nhận 41/41 bài test đạt PASS 100%, prebuild gate thành công.
- [x] **TASK-03.6**: Loại bỏ StarDict/MDict; Tích hợp chọn lọc 10.000 – 20.000 câu ví dụ song ngữ Tatoeba HSK 1 - 6 vào SQLite CSDL (`dictionary.db`).
  - *Kiểm chứng*: 5.000 từ vựng HSK có từ 2 - 4 câu ví dụ song ngữ kèm Pinyin có dấu, tests QA Tầng 2 xác thực thành công.
