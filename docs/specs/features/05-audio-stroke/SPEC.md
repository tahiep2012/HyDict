# SPECIFICATION: 05-AUDIO-STROKE (PHÁT ÂM EDGE-TTS & BÚT THUẬN NÉT VIẾT)

> **Mã phân hệ**: `EPIC-05`  
> **Trạng thái**: `PENDING`  
> **Tiêu chuẩn**: `modular-architecture`, `ui-design-system`, `qa-verification`

---

## 1. TỔNG QUAN & USER STORIES
- **Người dùng**: Người học tiếng Trung cần nghe phát âm chuẩn và xem cách viết chữ Hán.
- **Mục tiêu**: Tích hợp công nghệ tổng hợp giọng nói Microsoft Edge TTS (giọng bản ngữ tiếng Trung cực chuẩn, tự nhiên) cho cả từ vựng và câu ví dụ; tích hợp HanziWriter để hiển thị hoạt họa từng nét chữ theo quy tắc bút thuận.
- **User Story**:
  - Khi tôi xem từ `万`, tôi bấm nút loa để nghe giọng đọc bản ngữ `[wàn]`; tôi bấm nút loa ở câu ví dụ `这本书有万页。` để nghe đọc cả câu với ngữ điệu hoàn hảo; và tôi có thể bấm xem cách viết từng nét chữ `万` theo thứ tự chuẩn.

---

## 2. RANH GIỚI MÔ-ĐUN & KIẾN TRÚC
- **Thư mục phân hệ**:
  - `src/modules/tts-audio/` (Xử lý âm thanh phát âm)
  - `src/modules/stroke-writer/` (Xử lý hoạt họa nét chữ)
- **Tệp xuất công khai**:
  - `src/modules/tts-audio/index.ts`
  - `src/modules/stroke-writer/index.ts`
- **Backend Rust**: `src-tauri/src/tts.rs` kết nối dịch vụ Edge TTS tạo file mp3 hoặc base64 stream, tự động lưu cache đĩa cứng để những lần sau phát tức thì (< 5ms).

---

## 3. MÔ HÌNH DỮ LIỆU & KIỂU DỮ LIỆU (TYPES)
```typescript
export interface AudioPlaybackState {
  isPlaying: boolean;
  activeAudioId: string | null;
  error: string | null;
}

export interface StrokeWriterConfig {
  character: string;
  width: number;
  height: number;
  strokeColor: string;
  radicalColor: string;
  strokeAnimationSpeed: number;
  delayBetweenStrokes: number;
}
```

---

## 4. ĐẶC TẢ GIAO DIỆN & TRẠNG THÁI UI
- **Nút Audio (Loa)**:
  - Nút tròn `w-8 h-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all`.
  - Có hiệu ứng sóng âm (Wave animation) nhẹ khi đang phát âm thanh.
  - Xử lý trạng thái Loading nếu mạng chậm khi tải audio lần đầu.
- **Khung Nét Viết (HanziWriter Canvas)**:
  - Khung ô vuông chữ điền (`米` hoặc `田` grid) kích thước chuẩn `120x120px`.
  - Nút "Xem lại bút thuận" và nút "Tập viết chữ" (Practice mode) hiển thị trực quan.

---

## 5. QUY TẮC NGHIỆP VỤ & THUẬT TOÁN
1. **Bộ Đệm Âm Thanh Thông Minh (Disk Audio Cache)**:
   - File mp3 phát âm sau khi sinh được lưu vào thư mục cache của ứng dụng (`%APPDATA%/HanziiDict/audio_cache/`).
   - Lần bấm tiếp theo sẽ phát trực tiếp từ đĩa cứng mà không cần gửi request qua mạng.
2. **Quy Tắc Bút Thuận (Stroke Order Rules)**:
   - Dữ liệu nét viết dựa trên bộ ký tự HanziWriter SVG chuẩn (Từ trên xuống dưới, từ trái sang phải, ngang trước sổ sau, vào trước đóng sau).

---

## 6. XỬ LÝ BIÊN & DỮ LIỆU BẨN
- **Mất mạng khi gọi TTS lần đầu**: Fallback sang bộ đọc TTS có sẵn trên Windows (Windows SAPI / OneCore Chinese Voices) để đảm bảo luôn phát ra âm thanh.
- **Ký tự chữ Hán hiếm không có trong HanziWriter**: Hiển thị chữ Hán tĩnh dạng font lớn, không làm hỏng giao diện.

---

## 7. TIÊU CHÍ NGHIỆM THU (ACCEPTANCE CRITERIA / DOD)
- [ ] Phát âm rõ ràng chữ đơn và câu ví dụ với giọng đọc AI tự nhiên.
- [ ] Cơ chế audio cache hoạt động: Lần phát thứ 2 phản hồi tức thì < 5ms.
- [ ] Canvas nét viết hiển thị chuẩn xác hoạt họa thứ tự từng nét chữ.
