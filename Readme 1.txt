1. Phân Tích Tính Khả Thi & Cơ Chế Kỹ Thuật
Tại sao iPhone làm được mà Windows Anki thì không?
Trên iPhone (iOS): Apple tích hợp sẵn bộ phân tích ngữ pháp ngôn ngữ CJK (CFStringTokenizer / CoreNLP) vào sâu trong hệ điều hành. Khi anh chạm đúp vào một chữ trong câu (ví dụ chữ 这 hoặc 本), iOS tự động nhận diện ranh giới từ ngữ nghĩa (Word Boundary) để bôi đen cả cụm 这本书 và hiện menu dịch thuật (như trong ảnh anh chụp).
Trên Windows Desktop (Anki): Anki chạy trên nền tảng Qt WebEngine (Chromium). Theo mặc định của Chromium đối với chữ Hán (vốn không có khoảng trắng như tiếng Anh hay tiếng Việt), khi anh double-click chuột, trình duyệt chỉ bôi đen duy nhất 1 ký tự đơn lẻ (như chữ 本 trong ảnh 2). Người học thường phải mất công rê chuột kéo từng ký tự rất bất tiện.
Giải pháp kỹ thuật hoàn hảo trên Desktop:
Thuật toán Tự Động Phân Từ Ngữ Nghĩa (Smart CJK Tokenization):
Sử dụng engine phân từ Jieba NLP (Rust jieba-rs) siêu tốc (< 1 mili-giây) hoặc API native Intl.Segmenter(..., { granularity: 'word' }).
Khi anh bấm phím tắt Shift + T (hoặc nhấp đúp qua Anki Add-on), hệ thống sẽ đọc ngữ cảnh cả câu và tự động xác định từ/cụm từ có nghĩa dài nhất bao quanh con trỏ chuột.
Phím tắt toàn cục (Shift + T) & Trích xuất văn bản:
Chạy nền siêu nhẹ bằng Tauri v2 (Rust) (chỉ tốn khoảng 15–25MB RAM, nhẹ gấp 10 lần Electron).
Đăng ký phím tắt hệ thống: Khi bấm Shift + T, ứng dụng tự động lấy đoạn văn bản đang bôi đen hoặc nội dung từ Clipboard.
Cửa sổ Popup Nổi Siêu Tốc (HUD Overlay):
Cửa sổ bán trong suốt, bo tròn hiện đại, tự động mở ngay cạnh con trỏ chuột, luôn nằm trên các ứng dụng khác (Always-on-top), và tự đóng khi ấn Esc hoặc bấm ra ngoài.
Cơ sở dữ liệu Từ Điển & Audio Phát Âm:
Từ điển Offline SQLite FTS5: Chứa đầy đủ Chữ Hán, Pinyin có dấu, Âm Hán Việt, Từ loại, Giải nghĩa chi tiết tiếng Việt và Kho câu ví dụ song ngữ. Tốc độ tra cứu < 2ms hoàn toàn không cần kết nối mạng.
Audio Microsoft Edge TTS: Sử dụng giọng đọc AI tiếng Trung chuẩn bản xứ (như giọng Xiaoxiao / Yunxi) cực kỳ tự nhiên và mượt mà cho cả từ vựng lẫn câu ví dụ.