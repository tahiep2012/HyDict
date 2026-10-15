# TASKS: 05-AUDIO-STROKE (PHÁT ÂM EDGE-TTS & BÚT THUẬN NÉT VIẾT)

> **Mã phân hệ**: `EPIC-05`  
> **Trạng thái**: `COMPLETED`  
> **Quy ước**: `[ ]` Chưa làm | `[/]` Đang làm | `[x]` Đã hoàn thành

---

## DANH SÁCH CÔNG VIỆC CHI TIẾT

- [x] **TASK-05.1**: Xây dựng module Edge TTS Service trong Rust Backend (`src-tauri/src/tts.rs`) với cơ chế Disk Audio Caching.
  - *Kiểm chứng*: Hàm `get_audio_cache_path` và bộ tạo tên file cache hoạt động chính xác.
- [x] **TASK-05.2**: Xây dựng Hook `useAudioPlayback.ts` tại `src/modules/tts-audio/` điều khiển phát âm từ và câu ví dụ.
  - *Kiểm chứng*: Phát âm tiếng Trung chuẩn bản ngữ qua Web Speech API native `zh-CN`, tự động làm sạch ký tự.
- [x] **TASK-05.3**: Tích hợp thư viện HanziWriter tại `src/modules/stroke-writer/components/HanziWriterCanvas.tsx`.
  - *Kiểm chứng*: Render ô kẻ chữ điền và hoạt họa từng nét chữ theo đúng quy tắc bút thuận, có nút "Xem lại nét viết".
- [x] **TASK-05.4**: Đóng gói Public API cho 2 module và viết Unit/Integration Tests.
  - *Kiểm chứng*: `npm test` xác nhận 55/55 bài test đạt PASS 100%, prebuild gate thành công.
