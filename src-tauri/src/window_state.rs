use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WindowState {
    pub width: f64,
    pub height: f64,
    pub x: Option<i32>,
    pub y: Option<i32>,
    pub is_maximized: bool,
}

impl Default for WindowState {
    fn default() -> Self {
        Self {
            width: 860.0,
            height: 640.0,
            x: None,
            y: None,
            is_maximized: false,
        }
    }
}

static CACHED_STATE: Mutex<Option<WindowState>> = Mutex::new(None);
static DIRTY: Mutex<bool> = Mutex::new(false);

/// Xác định đường dẫn lưu trữ window_state.json
/// Ưu tiên 1: Cùng thư mục với file exe (chế độ Portable)
/// Ưu tiên 2: %APPDATA%/HyDict/window_state.json
pub fn get_window_state_path() -> PathBuf {
    if let Ok(exe_path) = std::env::current_exe() {
        if let Some(parent) = exe_path.parent() {
            let portable_path = parent.join("window_state.json");
            if portable_path.exists() {
                return portable_path;
            }
            // Thử kiểm tra quyền ghi vào thư mục exe
            if let Ok(file) = fs::OpenOptions::new()
                .create(true)
                .write(true)
                .open(&portable_path)
            {
                drop(file);
                return portable_path;
            }
        }
    }

    if let Some(user_dirs) = std::env::var_os("APPDATA") {
        let app_dir = PathBuf::from(user_dirs).join("HyDict");
        let _ = fs::create_dir_all(&app_dir);
        return app_dir.join("window_state.json");
    }

    PathBuf::from("window_state.json")
}

/// Nạp trạng thái kích thước và vị trí cửa sổ đã lưu
pub fn load_window_state() -> WindowState {
    let path = get_window_state_path();
    if let Ok(content) = fs::read_to_string(&path) {
        if let Ok(mut state) = serde_json::from_str::<WindowState>(&content) {
            // Đảm bảo kích thước tối thiểu an toàn (không bị thu quá bé)
            if state.width < 640.0 {
                state.width = 640.0;
            }
            if state.height < 480.0 {
                state.height = 480.0;
            }
            let mut lock = CACHED_STATE.lock().unwrap();
            *lock = Some(state.clone());
            return state;
        }
    }

    let default_state = WindowState::default();
    let mut lock = CACHED_STATE.lock().unwrap();
    *lock = Some(default_state.clone());
    default_state
}

/// Cập nhật hình học cửa sổ vào bộ nhớ cache
pub fn update_window_geometry(
    width: f64,
    height: f64,
    x: Option<i32>,
    y: Option<i32>,
    is_maximized: bool,
) {
    let mut lock = CACHED_STATE.lock().unwrap();
    let mut state = lock.clone().unwrap_or_default();

    if !is_maximized {
        if width >= 600.0 && height >= 400.0 {
            state.width = width;
            state.height = height;
        }
        if let (Some(px), Some(py)) = (x, y) {
            state.x = Some(px);
            state.y = Some(py);
        }
    }
    state.is_maximized = is_maximized;
    *lock = Some(state);

    if let Ok(mut d) = DIRTY.lock() {
        *d = true;
    }
}

/// Ghi đồng bộ trạng thái cửa sổ xuống đĩa
pub fn flush_window_state() {
    let should_save = {
        let mut d = DIRTY.lock().unwrap();
        if *d {
            *d = false;
            true
        } else {
            false
        }
    };

    if should_save {
        let lock = CACHED_STATE.lock().unwrap();
        if let Some(ref state) = *lock {
            let path = get_window_state_path();
            if let Ok(json) = serde_json::to_string_pretty(state) {
                let _ = fs::write(path, json);
            }
        }
    }
}

#[tauri::command]
pub fn get_saved_window_state() -> WindowState {
    load_window_state()
}

#[tauri::command]
pub fn save_current_window_state(width: f64, height: f64, is_maximized: bool) {
    update_window_geometry(width, height, None, None, is_maximized);
    flush_window_state();
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_window_state_defaults() {
        let s = WindowState::default();
        assert_eq!(s.width, 860.0);
        assert_eq!(s.height, 640.0);
        assert!(!s.is_maximized);
    }

    #[test]
    fn test_window_geometry_update() {
        update_window_geometry(1024.0, 768.0, Some(100), Some(200), false);
        let lock = CACHED_STATE.lock().unwrap();
        let state = lock.as_ref().unwrap();
        assert_eq!(state.width, 1024.0);
        assert_eq!(state.height, 768.0);
        assert_eq!(state.x, Some(100));
        assert_eq!(state.y, Some(200));
        assert!(!state.is_maximized);
    }
}
