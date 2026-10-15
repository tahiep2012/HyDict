use windows_sys::Win32::Graphics::Gdi::{
    BitBlt, CreateCompatibleBitmap, CreateCompatibleDC, DeleteDC, DeleteObject, GetDC,
    GetDIBits, ReleaseDC, SelectObject, BITMAPINFO, BITMAPINFOHEADER, BI_RGB, DIB_RGB_COLORS,
    SRCCOPY,
};
use windows_sys::Win32::UI::WindowsAndMessaging::{
    GetSystemMetrics, SM_CXVIRTUALSCREEN, SM_CYVIRTUALSCREEN, SM_XVIRTUALSCREEN, SM_YVIRTUALSCREEN,
};

pub struct CapturedImage {
    pub width: u32,
    pub height: u32,
    pub bgra: Vec<u8>,
}

pub fn capture_screen_rect(x: i32, y: i32, width: u32, height: u32) -> Result<CapturedImage, String> {
    if width < 5 || height < 5 {
        return Err("Vùng chọn quá nhỏ (< 5px)".to_string());
    }

    unsafe {
        // Đảm bảo tiến trình và thread kết nối với Window Station WinSta0 và Desktop default
        let hwinsta = windows_sys::Win32::System::StationsAndDesktops::OpenWindowStationA(
            b"WinSta0\0".as_ptr(),
            0,
            0x02000000, // MAXIMUM_ALLOWED
        );
        if !hwinsta.is_null() {
            windows_sys::Win32::System::StationsAndDesktops::SetProcessWindowStation(hwinsta);
        }

        let hdesk = windows_sys::Win32::System::StationsAndDesktops::OpenDesktopA(
            b"default\0".as_ptr(),
            0,
            0,
            0x02000000, // MAXIMUM_ALLOWED
        );
        if !hdesk.is_null() {
            windows_sys::Win32::System::StationsAndDesktops::SetThreadDesktop(hdesk);
        }

        let hdc_screen = GetDC(std::ptr::null_mut());
        if hdc_screen.is_null() {
            return Err("Không thể lấy Device Context màn hình".to_string());
        }

        let hdc_mem = CreateCompatibleDC(hdc_screen);
        if hdc_mem.is_null() {
            ReleaseDC(std::ptr::null_mut(), hdc_screen);
            return Err("Không thể tạo Compatible DC".to_string());
        }

        let hbmp = CreateCompatibleBitmap(hdc_screen, width as i32, height as i32);
        if hbmp.is_null() {
            DeleteDC(hdc_mem);
            ReleaseDC(std::ptr::null_mut(), hdc_screen);
            return Err("Không thể tạo Compatible Bitmap".to_string());
        }

        let old_bmp = SelectObject(hdc_mem, hbmp);

        // Chụp màn hình bằng BitBlt với CAPTUREBLT để tương thích Desktop Window Manager (DWM)
        const CAPTUREBLT: u32 = 0x40000000;
        let blt_res = BitBlt(
            hdc_mem,
            0,
            0,
            width as i32,
            height as i32,
            hdc_screen,
            x,
            y,
            SRCCOPY | CAPTUREBLT,
        );

        if blt_res == 0 {
            let err_code = windows_sys::Win32::Foundation::GetLastError();
            SelectObject(hdc_mem, old_bmp);
            DeleteObject(hbmp);
            DeleteDC(hdc_mem);
            ReleaseDC(std::ptr::null_mut(), hdc_screen);
            return Err(format!("BitBlt sao chép màn hình thất bại. GetLastError: {}", err_code));
        }

        let mut bi = BITMAPINFO {
            bmiHeader: BITMAPINFOHEADER {
                biSize: std::mem::size_of::<BITMAPINFOHEADER>() as u32,
                biWidth: width as i32,
                biHeight: -(height as i32), // Top-down DIB
                biPlanes: 1,
                biBitCount: 32,
                biCompression: BI_RGB,
                biSizeImage: 0,
                biXPelsPerMeter: 0,
                biYPelsPerMeter: 0,
                biClrUsed: 0,
                biClrImportant: 0,
            },
            bmiColors: [windows_sys::Win32::Graphics::Gdi::RGBQUAD {
                rgbBlue: 0,
                rgbGreen: 0,
                rgbRed: 0,
                rgbReserved: 0,
            }],
        };

        let mut buffer = vec![0u8; (width * height * 4) as usize];
        let lines = GetDIBits(
            hdc_mem,
            hbmp,
            0,
            height,
            buffer.as_mut_ptr() as *mut _,
            &mut bi,
            DIB_RGB_COLORS,
        );

        SelectObject(hdc_mem, old_bmp);
        DeleteObject(hbmp);
        DeleteDC(hdc_mem);
        ReleaseDC(std::ptr::null_mut(), hdc_screen);

        if lines == 0 {
            return Err("GetDIBits trích xuất pixel thất bại".to_string());
        }

        // Đảm bảo kênh alpha là 255 (opaque)
        for chunk in buffer.chunks_exact_mut(4) {
            chunk[3] = 255;
        }

        Ok(CapturedImage {
            width,
            height,
            bgra: buffer,
        })
    }
}

pub fn get_virtual_screen_bounds() -> (i32, i32, i32, i32) {
    unsafe {
        let x = GetSystemMetrics(SM_XVIRTUALSCREEN);
        let y = GetSystemMetrics(SM_YVIRTUALSCREEN);
        let w = GetSystemMetrics(SM_CXVIRTUALSCREEN);
        let h = GetSystemMetrics(SM_CYVIRTUALSCREEN);
        (x, y, w, h)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_capture_small_screen_rect() {
        // Chụp một vùng nhỏ 50x50 tại góc màn hình
        let res = capture_screen_rect(0, 0, 50, 50);
        assert!(res.is_ok(), "Chụp màn hình vùng 50x50 thất bại: {:?}", res.as_ref().err());
        let img = res.unwrap();
        assert_eq!(img.width, 50);
        assert_eq!(img.height, 50);
        assert_eq!(img.bgra.len(), 50 * 50 * 4);
    }
}
