// Prevents console window on Windows
#![windows_subsystem = "windows"]

fn main() {
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
        let msg = format!("Timestamp: {:?}\nLocation: {:?}\nError: {}\n", std::time::SystemTime::now(), info.location(), payload);
        let _ = std::fs::write(&log_file, msg);
    }));
    hydict_desktop_lib::run();
}
