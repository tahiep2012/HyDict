use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TtsRequest {
    pub text: String,
    pub voice: Option<String>,
}

pub const DEFAULT_VOICE: &str = "zh-CN-XiaoxiaoNeural";

pub fn generate_cache_filename(text: &str) -> String {
    let sanitized: String = text
        .chars()
        .filter(|c| c.is_alphanumeric())
        .take(20)
        .collect();
    format!("{}_{}.mp3", sanitized, text.len())
}

#[tauri::command]
pub fn get_audio_cache_path(text: String) -> String {
    generate_cache_filename(&text)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_cache_filename_generation() {
        let name = generate_cache_filename("万");
        assert!(name.ends_with(".mp3"));
        assert!(name.contains("万"));
    }
}
