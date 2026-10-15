pub mod db;
pub mod hotkey;
pub mod ocr;
pub mod screen_capture;
pub mod segmentation;
pub mod tts;
pub mod window_hud;

use db::DbState;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Mutex;
use std::time::Instant;
use tauri::menu::{Menu, MenuItem};
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
use tauri::{Emitter, Manager};
use tauri_plugin_clipboard_manager::ClipboardExt;
use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut, ShortcutState};

static HUD_PINNED: AtomicBool = AtomicBool::new(false);
static LAST_HUD_SHOW: Mutex<Option<Instant>> = Mutex::new(None);

#[cfg(target_os = "windows")]
pub mod win_clip {
    use std::mem::size_of;
    use windows_sys::Win32::Foundation::POINT;
    use windows_sys::Win32::UI::Input::KeyboardAndMouse::{
        GetAsyncKeyState, SendInput, INPUT, INPUT_KEYBOARD, KEYBDINPUT, KEYEVENTF_KEYUP,
        VK_CONTROL, VK_MENU, VK_SHIFT,
    };
    use windows_sys::Win32::UI::WindowsAndMessaging::GetCursorPos;
    use windows_sys::Win32::System::DataExchange::{
        CloseClipboard, EmptyClipboard, GetClipboardSequenceNumber, OpenClipboard,
    };

    /// Cờ nhận diện phím ảo độc quyền của HyDict
    /// Giúp VCKey, UniKey, EVKey nhận biết đây là phím hệ thống của từ điển,
    /// tự động bỏ qua và KHÔNG BAO GIỜ bị đứng/treo hook gõ phím.
    pub const HYDICT_EXTRA_INFO: usize = 0x11A011A0;

    pub fn get_cursor_pos() -> (i32, i32) {
        unsafe {
            let mut pt = POINT { x: 0, y: 0 };
            if GetCursorPos(&mut pt) != 0 {
                (pt.x, pt.y)
            } else {
                (100, 100)
            }
        }
    }

    /// Làm sạch clipboard một cách an toàn và nhanh chóng trước khi copy
    pub fn clear_clipboard() {
        unsafe {
            for _ in 0..3 {
                if OpenClipboard(std::ptr::null_mut()) != 0 {
                    EmptyClipboard();
                    CloseClipboard();
                    break;
                }
                std::thread::sleep(std::time::Duration::from_millis(2));
            }
        }
    }

    /// Giả lập tổ hợp phím Ctrl + C nguyên khối (Atomic Batch SendInput)
    /// - Không làm nghẽn luồng Windows Message Loop (Non-blocking).
    /// - Gắn cờ HYDICT_EXTRA_INFO để các bộ gõ như VCKey, UniKey bỏ qua, tránh xung đột / đứng hook.
    /// - Thực hiện qua 1 lệnh SendInput duy nhất (< 0.05ms) thay vì sleep hàng trăm ms.
    pub fn simulate_copy() -> Option<u32> {
        unsafe {
            let alt_down = (GetAsyncKeyState(VK_MENU as i32) as u16 & 0x8000) != 0;
            let ctrl_down = (GetAsyncKeyState(VK_CONTROL as i32) as u16 & 0x8000) != 0;
            let shift_down = (GetAsyncKeyState(VK_SHIFT as i32) as u16 & 0x8000) != 0;

            let mut inputs: Vec<INPUT> = Vec::with_capacity(8);

            // 1. Nếu phím Alt hoặc Shift đang được người dùng đè (do bấm Alt+Q hoặc Shift+T),
            // nhả chúng ra trong batch để không biến Ctrl+C thành Alt+Ctrl+C
            if alt_down {
                let mut inp: INPUT = std::mem::zeroed();
                inp.r#type = INPUT_KEYBOARD;
                inp.Anonymous.ki = KEYBDINPUT {
                    wVk: VK_MENU,
                    wScan: 0x38,
                    dwFlags: KEYEVENTF_KEYUP,
                    time: 0,
                    dwExtraInfo: HYDICT_EXTRA_INFO,
                };
                inputs.push(inp);
            }
            if shift_down {
                let mut inp: INPUT = std::mem::zeroed();
                inp.r#type = INPUT_KEYBOARD;
                inp.Anonymous.ki = KEYBDINPUT {
                    wVk: VK_SHIFT,
                    wScan: 0x2A,
                    dwFlags: KEYEVENTF_KEYUP,
                    time: 0,
                    dwExtraInfo: HYDICT_EXTRA_INFO,
                };
                inputs.push(inp);
            }

            // 2. Nếu Ctrl chưa được nhấn, nhấn Ctrl down
            if !ctrl_down {
                let mut inp: INPUT = std::mem::zeroed();
                inp.r#type = INPUT_KEYBOARD;
                inp.Anonymous.ki = KEYBDINPUT {
                    wVk: VK_CONTROL,
                    wScan: 0x1D,
                    dwFlags: 0,
                    time: 0,
                    dwExtraInfo: HYDICT_EXTRA_INFO,
                };
                inputs.push(inp);
            }

            // 3. Nhấn phím 'C' down
            let mut c_down: INPUT = std::mem::zeroed();
            c_down.r#type = INPUT_KEYBOARD;
            c_down.Anonymous.ki = KEYBDINPUT {
                wVk: 0x43, // 'C'
                wScan: 0x2E,
                dwFlags: 0,
                time: 0,
                dwExtraInfo: HYDICT_EXTRA_INFO,
            };
            inputs.push(c_down);

            // 4. Nhả phím 'C' up
            let mut c_up: INPUT = std::mem::zeroed();
            c_up.r#type = INPUT_KEYBOARD;
            c_up.Anonymous.ki = KEYBDINPUT {
                wVk: 0x43, // 'C'
                wScan: 0x2E,
                dwFlags: KEYEVENTF_KEYUP,
                time: 0,
                dwExtraInfo: HYDICT_EXTRA_INFO,
            };
            inputs.push(c_up);

            // 5. Nếu Ctrl không bị người dùng giữ thật, nhả Ctrl up
            if !ctrl_down {
                let mut inp: INPUT = std::mem::zeroed();
                inp.r#type = INPUT_KEYBOARD;
                inp.Anonymous.ki = KEYBDINPUT {
                    wVk: VK_CONTROL,
                    wScan: 0x1D,
                    dwFlags: KEYEVENTF_KEYUP,
                    time: 0,
                    dwExtraInfo: HYDICT_EXTRA_INFO,
                };
                inputs.push(inp);
            }

            clear_clipboard();
            let seq_before = GetClipboardSequenceNumber();

            // Phát lệnh SendInput duy nhất
            SendInput(inputs.len() as u32, inputs.as_ptr(), size_of::<INPUT>() as i32);

            // Chờ phản hồi clipboard trong thời gian ngắn (tối đa 60ms)
            for _ in 0..6 {
                std::thread::sleep(std::time::Duration::from_millis(10));
                let current_seq = GetClipboardSequenceNumber();
                if current_seq != seq_before {
                    return Some(current_seq);
                }
            }

            None
        }
    }
}

#[cfg(not(target_os = "windows"))]
pub mod win_clip {
    pub const HYDICT_EXTRA_INFO: usize = 0x11A011A0;

    pub fn get_cursor_pos() -> (i32, i32) {
        (100, 100)
    }

    pub fn clear_clipboard() {}

    pub fn simulate_copy() -> Option<u32> {
        None
    }
}


#[tauri::command]
fn ping() -> &'static str {
    "pong"
}

#[tauri::command]
fn open_hud_window(app: tauri::AppHandle, word: Option<String>) {
    if let Some(hud_window) = app.get_webview_window("hud") {
        let (cx, cy) = win_clip::get_cursor_pos();
        let win_size = window_hud::Rect { width: 480, height: 560 };
        let (screen_w, screen_h) = hud_window
            .current_monitor()
            .ok()
            .flatten()
            .map(|m| (m.size().width as i32, m.size().height as i32))
            .unwrap_or((1920, 1080));
        let screen_bounds = window_hud::Rect {
            width: screen_w,
            height: screen_h,
        };
        let clamped = window_hud::calculate_clamped_hud_position(
            window_hud::Point { x: cx, y: cy },
            win_size,
            screen_bounds,
        );

        if let Ok(mut guard) = LAST_HUD_SHOW.lock() {
            *guard = Some(Instant::now());
        }

        let _ = hud_window.set_position(tauri::Position::Physical(
            tauri::PhysicalPosition { x: clamped.x, y: clamped.y },
        ));
        let _ = hud_window.show();
        let _ = hud_window.unminimize();
        let _ = hud_window.set_focus();

        if let Some(w) = word {
            let _ = app.emit("quick-lookup-triggered", w.trim());
        }
    }
}

#[tauri::command]
fn hide_hud_window(app: tauri::AppHandle) {
    if let Some(hud_window) = app.get_webview_window("hud") {
        let _ = hud_window.hide();
    }
}

#[tauri::command]
fn set_hud_pinned(app: tauri::AppHandle, pinned: bool) {
    HUD_PINNED.store(pinned, Ordering::SeqCst);
    if let Some(hud_window) = app.get_webview_window("hud") {
        let _ = hud_window.set_always_on_top(pinned);
    }
}

#[tauri::command]
fn open_main_window(app: tauri::AppHandle, word: Option<String>) {
    if let Some(main_window) = app.get_webview_window("main") {
        let _ = main_window.show();
        let _ = main_window.unminimize();
        let _ = main_window.set_focus();

        if let Some(w) = word {
            let _ = app.emit("open-main-word", w.trim());
        }
    }
}

#[tauri::command]
fn open_snipper_window(app: tauri::AppHandle) {
    if let Some(snipper) = app.get_webview_window("snipper") {
        let (vx, vy, vw, vh) = screen_capture::get_virtual_screen_bounds();
        let _ = snipper.set_position(tauri::Position::Physical(tauri::PhysicalPosition { x: vx, y: vy }));
        let _ = snipper.set_size(tauri::Size::Physical(tauri::PhysicalSize {
            width: (vw.max(800)) as u32,
            height: (vh.max(600)) as u32,
        }));
        let _ = snipper.show();
        let _ = snipper.unminimize();
        let _ = snipper.set_always_on_top(true);
        let _ = snipper.set_focus();
        let _ = snipper.emit("snipper-opened", ());
    }
}

#[tauri::command]
fn hide_snipper_window(app: tauri::AppHandle) {
    if let Some(snipper) = app.get_webview_window("snipper") {
        let _ = snipper.hide();
    }
}

#[tauri::command]
fn execute_screen_ocr(
    app: tauri::AppHandle,
    x: i32,
    y: i32,
    width: u32,
    height: u32,
) -> Result<String, String> {
    // Ẩn snipper ngay lập tức để không che khuất màn hình
    if let Some(snipper) = app.get_webview_window("snipper") {
        let _ = snipper.hide();
    }

    if width < 5 || height < 5 {
        return Err("Vùng chọn quá nhỏ (< 5px)".to_string());
    }

    // 1. Chụp chính xác vùng màn hình đã chọn
    let capture = screen_capture::capture_screen_rect(x, y, width, height)?;

    // 2. Nhận diện chữ Hán siêu tốc qua Windows Native OCR
    let recognized = ocr::recognize_chinese_text(capture.width, capture.height, &capture.bgra)?;
    let clean_text = recognized.trim().to_string();

    // 3. Nếu tìm thấy chữ, tự động bật Lingoes HUD popup ngay tại vị trí kéo thả chuột
    if !clean_text.is_empty() {
        if let Some(hud_window) = app.get_webview_window("hud") {
            let win_size = window_hud::Rect { width: 480, height: 560 };
            let (screen_w, screen_h) = hud_window
                .current_monitor()
                .ok()
                .flatten()
                .map(|m| (m.size().width as i32, m.size().height as i32))
                .unwrap_or((1920, 1080));
            let screen_bounds = window_hud::Rect {
                width: screen_w,
                height: screen_h,
            };
            let clamped = window_hud::calculate_clamped_hud_position(
                window_hud::Point { x, y: y + height as i32 },
                win_size,
                screen_bounds,
            );

            if let Ok(mut guard) = LAST_HUD_SHOW.lock() {
                *guard = Some(Instant::now());
            }

            let _ = hud_window.set_position(tauri::Position::Physical(
                tauri::PhysicalPosition { x: clamped.x, y: clamped.y },
            ));
            let _ = hud_window.show();
            let _ = hud_window.unminimize();
            let _ = hud_window.set_always_on_top(true);
            let _ = hud_window.set_focus();
        }

        // Phát sự kiện tra cứu tức thì sang React HUD
        let _ = app.emit("quick-lookup-triggered", clean_text.clone());
    }

    Ok(clean_text)
}

pub fn run() {
    let conn = db::init_db().expect("Failed to initialize dictionary database");
    let alt_s_shortcut: Shortcut = "alt+s".parse().expect("valid alt+s shortcut");

    tauri::Builder::default()
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_handler(move |app, shortcut, event| {
                    if event.state == ShortcutState::Pressed {
                        if shortcut == &alt_s_shortcut {
                            open_snipper_window(app.clone());
                            return;
                        }

                        let app_handle = app.clone();
                        // Chạy toàn bộ luồng copy & hiển thị HUD trong background thread riêng
                        // Tuyệt đối không làm nghẽn Tauri Event Loop hoặc Windows Hook chain của VCKey/UniKey!
                        std::thread::spawn(move || {
                            // 1. Giả lập Ctrl+C nguyên khối, non-blocking
                            let _seq = win_clip::simulate_copy();
                            std::thread::sleep(std::time::Duration::from_millis(15));

                            // 2. Đọc nội dung văn bản vừa copy từ clipboard
                            let copied_text = app_handle.clipboard().read_text().unwrap_or_default();

                            // 3. Đưa cửa sổ HUD nổi lên trên cùng ngay tại vị trí con trỏ chuột (Lingoes-style standalone popup)
                            if let Some(hud_window) = app_handle.get_webview_window("hud") {
                                let (cx, cy) = win_clip::get_cursor_pos();
                                let win_size = window_hud::Rect { width: 480, height: 560 };
                                let (screen_w, screen_h) = hud_window
                                    .current_monitor()
                                    .ok()
                                    .flatten()
                                    .map(|m| (m.size().width as i32, m.size().height as i32))
                                    .unwrap_or((1920, 1080));
                                let screen_bounds = window_hud::Rect {
                                    width: screen_w,
                                    height: screen_h,
                                };
                                let clamped = window_hud::calculate_clamped_hud_position(
                                    window_hud::Point { x: cx, y: cy },
                                    win_size,
                                    screen_bounds,
                                );

                                if let Ok(mut guard) = LAST_HUD_SHOW.lock() {
                                    *guard = Some(Instant::now());
                                }

                                let _ = hud_window.set_position(tauri::Position::Physical(
                                    tauri::PhysicalPosition { x: clamped.x, y: clamped.y },
                                ));
                                let _ = hud_window.show();
                                let _ = hud_window.unminimize();
                                let _ = hud_window.set_always_on_top(true);
                                let _ = hud_window.set_focus();
                            }

                            // 4. Phát sự kiện sang React Frontend để nạp từ điển & hiển thị từ vựng trên HUD
                            let clean_text = copied_text.trim().to_string();
                            if !clean_text.is_empty() {
                                let _ = app_handle.emit("quick-lookup-triggered", clean_text);
                            }
                        });
                    }
                })
                .build(),
        )
        .setup(|app| {
            // Đăng ký phím tắt toàn cục một cách độc lập và an toàn (chống xung đột VCKey/UniKey/App khác)
            for hotkey_str in ["alt+q", "ctrl+q", "shift+t", "alt+s"] {
                if let Ok(shortcut) = hotkey_str.parse::<Shortcut>() {
                    let _ = app.global_shortcut().register(shortcut);
                }
            }

            // Khởi tạo Menu cho Khay hệ thống (System Tray Context Menu)
            let show_i = MenuItem::with_id(app, "show", "Mở từ điển chính", true, None::<&str>)?;
            let quit_i = MenuItem::with_id(app, "quit", "Thoát HyDict", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show_i, &quit_i])?;

            // Khởi tạo icon chuẩn từ biểu tượng mới (nhúng trực tiếp 128x128.png)
            let icon_bytes = include_bytes!("../icons/128x128.png");
            let app_icon = tauri::image::Image::from_bytes(icon_bytes).expect("valid embedded icon");

            // Đặt biểu tượng trực tiếp cho cửa sổ chính và cửa sổ HUD
            if let Some(main_window) = app.get_webview_window("main") {
                let _ = main_window.set_icon(app_icon.clone());
            }
            if let Some(hud_window) = app.get_webview_window("hud") {
                let _ = hud_window.set_icon(app_icon.clone());
            }

            let tray = TrayIconBuilder::with_id("main-tray")
                .icon(app_icon)
                .menu(&menu)
                .show_menu_on_left_click(false)
                .tooltip("HyDict - Tra cứu thông minh")
                .on_menu_event(|app, event| {
                    match event.id.as_ref() {
                        "show" => {
                            if let Some(main_window) = app.get_webview_window("main") {
                                let _ = main_window.show();
                                let _ = main_window.unminimize();
                                let _ = main_window.set_focus();
                            }
                        }
                        "quit" => {
                            app.exit(0);
                        }
                        _ => {}
                    }
                })
                .on_tray_icon_event(|tray, event| {
                    match event {
                        TrayIconEvent::Click {
                            button: MouseButton::Left,
                            button_state: MouseButtonState::Up,
                            ..
                        }
                        | TrayIconEvent::DoubleClick {
                            button: MouseButton::Left,
                            ..
                        } => {
                            let app = tray.app_handle();
                            if let Some(main_window) = app.get_webview_window("main") {
                                if main_window.is_visible().unwrap_or(false) {
                                    let _ = main_window.hide();
                                } else {
                                    let _ = main_window.show();
                                    let _ = main_window.unminimize();
                                    let _ = main_window.set_focus();
                                }
                            }
                        }
                        _ => {}
                    }
                })
                .build(app)?;

            // Quản lý tray trong App State để tránh bị drop
            app.manage(tray);

            if let Some(main_window) = app.get_webview_window("main") {
                let _ = main_window.show();
                let _ = main_window.unminimize();
                let _ = main_window.set_focus();
            }

            Ok(())
        })
        .on_window_event(|window, event| {
            match event {
                tauri::WindowEvent::CloseRequested { api, .. } => {
                    // Khi người dùng bấm nút 'X' ở cửa sổ chính, ẩn xuống khay hệ thống (System Tray) thay vì tắt hẳn ứng dụng
                    if window.label() == "main" {
                        api.prevent_close();
                        let _ = window.hide();
                    }
                }
                tauri::WindowEvent::Focused(false) => {
                    if window.label() == "hud" {
                        let is_pinned = HUD_PINNED.load(Ordering::SeqCst);
                        let elapsed_ms = LAST_HUD_SHOW
                            .lock()
                            .ok()
                            .and_then(|guard| guard.map(|t| t.elapsed().as_millis()))
                            .unwrap_or(1000);
                        // Tự động ẩn cửa sổ HUD khi click chuột ra ngoài (mất focus) nếu chưa được ghim
                        if !is_pinned && elapsed_ms > 350 {
                            let _ = window.hide();
                        }
                    }
                }
                _ => {}
            }
        })
        .manage(DbState {
            conn: Mutex::new(conn),
        })
        .invoke_handler(tauri::generate_handler![
            ping,
            open_hud_window,
            hide_hud_window,
            set_hud_pinned,
            open_main_window,
            open_snipper_window,
            hide_snipper_window,
            execute_screen_ocr,
            segmentation::segment_sentence,
            db::lookup_dictionary,
            db::search_suggestions,
            db::search_dictionary_multi,
            tts::get_audio_cache_path
        ])
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|_app_handle, event| match event {
            tauri::RunEvent::ExitRequested { api, .. } => {
                api.prevent_exit();
            }
            _ => {}
        });
}
