use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
pub struct Point {
    pub x: i32,
    pub y: i32,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
pub struct Rect {
    pub width: i32,
    pub height: i32,
}

/**
 * Thuật toán tính toán vị trí cửa sổ HUD thông minh (Smart Screen Clamping)
 * Tránh tràn ra ngoài mép màn hình khi nhấp chuột ở góc hoặc cạnh dưới.
 */
pub fn calculate_clamped_hud_position(
    cursor: Point,
    window_size: Rect,
    screen_bounds: Rect,
) -> Point {
    let margin = 16;
    let offset_x = 12;
    let offset_y = 16;

    let mut target_x = cursor.x + offset_x;
    let mut target_y = cursor.y + offset_y;

    // Nếu tràn mép phải màn hình: lật sang bên trái con trỏ chuột
    if target_x + window_size.width > screen_bounds.width - margin {
        target_x = cursor.x - window_size.width - offset_x;
    }

    // Nếu tràn mép dưới màn hình: đẩy lên phía trên
    if target_y + window_size.height > screen_bounds.height - margin {
        target_y = cursor.y - window_size.height - offset_y;
    }

    // Đảm bảo không tràn mép trái hoặc mép trên
    if target_x < margin {
        target_x = margin;
    }
    if target_y < margin {
        target_y = margin;
    }

    Point {
        x: target_x,
        y: target_y,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_normal_positioning() {
        let cursor = Point { x: 500, y: 300 };
        let win = Rect { width: 480, height: 560 };
        let screen = Rect { width: 1920, height: 1080 };

        let pos = calculate_clamped_hud_position(cursor, win, screen);
        assert_eq!(pos.x, 512);
        assert_eq!(pos.y, 316);
    }

    #[test]
    fn test_right_edge_clamping() {
        let cursor = Point { x: 1800, y: 300 };
        let win = Rect { width: 480, height: 560 };
        let screen = Rect { width: 1920, height: 1080 };

        let pos = calculate_clamped_hud_position(cursor, win, screen);
        // Phải lật sang trái con trỏ
        assert!(pos.x < 1800);
        assert_eq!(pos.x, 1800 - 480 - 12);
    }

    #[test]
    fn test_bottom_edge_clamping() {
        let cursor = Point { x: 500, y: 1000 };
        let win = Rect { width: 480, height: 560 };
        let screen = Rect { width: 1920, height: 1080 };

        let pos = calculate_clamped_hud_position(cursor, win, screen);
        // Phải đẩy lên trên
        assert!(pos.y < 1000);
        assert_eq!(pos.y, 1000 - 560 - 16);
    }
}
