// Prevents console window on Windows
#![windows_subsystem = "windows"]

#[cfg(target_os = "windows")]
mod single_instance {
    use std::ffi::c_void;
    use std::ptr::null;

    #[link(name = "kernel32")]
    extern "system" {
        fn CreateMutexW(
            lpMutexAttributes: *const c_void,
            bInitialOwner: i32,
            lpName: *const u16,
        ) -> *mut c_void;
        fn GetLastError() -> u32;
    }

    #[link(name = "user32")]
    extern "system" {
        fn FindWindowW(lpClassName: *const u16, lpWindowName: *const u16) -> *mut c_void;
        fn ShowWindow(hWnd: *mut c_void, nCmdShow: i32) -> i32;
        fn SetForegroundWindow(hWnd: *mut c_void) -> i32;
    }

    const ERROR_ALREADY_EXISTS: u32 = 183;
    const SW_RESTORE: i32 = 9;

    pub fn ensure_single_instance() -> bool {
        let mutex_name: Vec<u16> = "Global\\HyDict_Single_Instance_Mutex\0"
            .encode_utf16()
            .collect();

        unsafe {
            let handle = CreateMutexW(null(), 1, mutex_name.as_ptr());
            if handle.is_null() || GetLastError() == ERROR_ALREADY_EXISTS {
                // Đã có một instance HyDict đang chạy
                // Tìm cửa sổ "HyDict Desktop" và khôi phục hiển thị lên trên cùng
                let win_title: Vec<u16> = "HyDict Desktop\0".encode_utf16().collect();
                let hwnd = FindWindowW(null(), win_title.as_ptr());
                if !hwnd.is_null() {
                    ShowWindow(hwnd, SW_RESTORE);
                    SetForegroundWindow(hwnd);
                }
                return false;
            }
        }
        true
    }
}

fn main() {
    #[cfg(target_os = "windows")]
    {
        if !single_instance::ensure_single_instance() {
            // Đã có phiên bản HyDict đang chạy trong khay hệ thống, kích hoạt cửa sổ và thoát an toàn
            return;
        }
    }

    // Bỏ qua System Proxy (v2rayN, Clash, VPN...) cho các domain nội bộ của Tauri
    std::env::set_var(
        "WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS",
        "--proxy-bypass-list=<local>;localhost;*.localhost;tauri.localhost;127.0.0.1",
    );

    std::panic::set_hook(Box::new(|info| {
        let exe_dir = std::env::current_exe()
            .ok()
            .and_then(|p| p.parent().map(|d| d.to_path_buf()))
            .unwrap_or_else(|| std::path::PathBuf::from("."));
        let log_file = exe_dir.join("hydict_crash.log");
        let payload = if let Some(s) = info.payload().downcast_ref::<&str>() {
            s.to_string()
        } else if let Some(s) = info.payload().downcast_ref::<String>() {
            s.clone()
        } else {
            format!("{:#?}", info)
        };
        let msg = format!(
            "Timestamp: {:?}\nLocation: {:?}\nError: {}\n",
            std::time::SystemTime::now(),
            info.location(),
            payload
        );
        let _ = std::fs::write(&log_file, msg);
    }));

    hydict_desktop_lib::run();
}
