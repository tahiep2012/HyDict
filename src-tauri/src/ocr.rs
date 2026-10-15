use windows::core::{HSTRING, Result as WinResult};
use windows::Globalization::Language;
use windows::Graphics::Imaging::{BitmapPixelFormat, SoftwareBitmap};
use windows::Media::Ocr::OcrEngine;
use windows::Storage::Streams::{Buffer, IBuffer};

pub struct OcrService {
    engine: OcrEngine,
}

impl OcrService {
    pub fn new() -> WinResult<Self> {
        // Ưu tiên tiếng Trung giản thể zh-Hans-CN, fallback zh-Hant-TW hoặc ngôn ngữ OCR mặc định
        let engine = if let Ok(lang) = Language::CreateLanguage(&HSTRING::from("zh-Hans-CN")) {
            if OcrEngine::IsLanguageSupported(&lang).unwrap_or(false) {
                OcrEngine::TryCreateFromLanguage(&lang)?
            } else {
                OcrEngine::TryCreateFromUserProfileLanguages()?
            }
        } else {
            OcrEngine::TryCreateFromUserProfileLanguages()?
        };

        Ok(Self { engine })
    }

    pub fn recognize_bgra(&self, width: u32, height: u32, bgra_data: &[u8]) -> WinResult<String> {
        // Tạo IBuffer từ byte array
        let buffer = Buffer::Create(bgra_data.len() as u32)?;
        buffer.SetLength(bgra_data.len() as u32)?;

        // Copy bytes vào IBuffer qua COM interface hoặc DataWriter
        use windows::Storage::Streams::DataWriter;
        let writer = DataWriter::new()?;
        writer.WriteBytes(bgra_data)?;
        let ibuffer: IBuffer = writer.DetachBuffer()?;

        // Tạo SoftwareBitmap chuẩn Bgra8 từ IBuffer
        let software_bitmap = SoftwareBitmap::CreateCopyFromBuffer(
            &ibuffer,
            BitmapPixelFormat::Bgra8,
            width as i32,
            height as i32,
        )?;

        // Nhận diện OCR qua RecognizeAsync
        let async_op = self.engine.RecognizeAsync(&software_bitmap)?;
        let result = async_op.join()?;
        let text = result.Text()?.to_string();

        Ok(text)
    }
}

pub fn recognize_chinese_text(width: u32, height: u32, bgra_data: &[u8]) -> Result<String, String> {
    let service = OcrService::new().map_err(|e| format!("Không thể khởi tạo OCR Engine: {:?}", e))?;
    let raw_text = service
        .recognize_bgra(width, height, bgra_data)
        .map_err(|e| format!("Lỗi nhận diện OCR: {:?}", e))?;

    // Chuẩn hóa văn bản nhận diện được
    let cleaned = raw_text
        .replace("\r\n", " ")
        .replace('\n', " ")
        .trim()
        .to_string();

    Ok(cleaned)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_ocr_engine_initialization() {
        let service = OcrService::new();
        assert!(service.is_ok(), "Khởi tạo OCR Service trên Windows 10/11 phải thành công");
    }

    #[test]
    fn test_recognize_captured_screen_region() {
        let capture = crate::screen_capture::capture_screen_rect(0, 0, 100, 100).expect("Chụp 100x100 màn hình phải thành công");
        let result = recognize_chinese_text(capture.width, capture.height, &capture.bgra);
        assert!(result.is_ok(), "Nhận diện OCR trên ảnh màn hình không được trả về lỗi: {:?}", result.err());
    }
}
