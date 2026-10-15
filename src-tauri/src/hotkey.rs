use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HotkeyEvent {
    pub hotkey: String,
    pub timestamp: u64,
}

pub const DEFAULT_HOTKEY: &str = "Alt+Q";

pub fn parse_hotkey_string(hotkey: &str) -> bool {
    let parts: Vec<&str> = hotkey.split('+').collect();
    parts.len() >= 2 && !parts.iter().any(|p| p.trim().is_empty())
}
