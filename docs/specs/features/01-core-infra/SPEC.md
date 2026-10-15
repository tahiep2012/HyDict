# SPECIFICATION: 01-CORE-INFRA (KHUNG NỀN TẢNG & ATOMIC UI)

> **Mã phân hệ**: `EPIC-01`  
> **Trạng thái**: `PENDING`  
> **Tiêu chuẩn**: `modular-architecture`, `ui-design-system`, `qa-verification`

---

## 1. TỔNG QUAN & USER STORIES
- **Người dùng**: Lập trình viên và người dùng cuối.
- **Mục tiêu**: Xây dựng bộ khung nền tảng chuẩn mực cho ứng dụng Hanzii Dict Desktop sử dụng Tauri v2 + React + TypeScript + Tailwind CSS.
- **User Story**: 
  - Là lập trình viên, tôi cần một hệ thống module độc lập tuyệt đối có ranh giới rõ ràng, có cổng prebuild test tự động chặn lỗi biên dịch, và có thư viện component dùng chung (Atomic Components) để đảm bảo giao diện luôn đồng nhất.

---

## 2. RANH GIỚI MÔ-ĐUN & KIẾN TRÚC
- **Thư mục phân hệ**: `src/modules/core-infra/`
- **Tệp xuất công khai**: `src/modules/core-infra/index.ts`
- **Atomic Components**: `src/components/ui/` (`Button`, `Card`, `Badge`, `Modal`, `Input`, `Tooltip`).
- **Design Tokens**: `tailwind.config.js` chuẩn hóa mã màu: `blue-600` (primary), `emerald-600` (success/Hán Việt), `amber-500` (pinyin/warning), `purple-600` (part of speech), `slate-800` (text).

---

## 3. MÔ HÌNH DỮ LIỆU & KIỂU DỮ LIỆU (TYPES)
```typescript
export interface AppConfig {
  theme: 'light' | 'dark' | 'system';
  hotkey: string; // Mặc định: "Shift+T"
  autoPronounce: boolean;
  ankiDeckName: string;
  ankiModelName: string;
}

export type UIState = 'loading' | 'empty' | 'error' | 'success';
```

---

## 4. ĐẶC TẢ GIAO DIỆN & TRẠNG THÁI UI
- Hỗ trợ đủ 4 trạng thái giao diện chuẩn:
  1. `Loading`: Skeleton loader bo tròn `rounded-2xl` cho các thẻ từ vựng.
  2. `Empty`: Trạng thái trống với icon sách và thông điệp chỉ dẫn tra từ.
  3. `Error`: Khung thông báo lỗi viền đỏ `border-rose-200 bg-rose-50` kèm nút thử lại.
  4. `Success`: Giao diện thẻ từ hiển thị trọn vẹn, sắc nét.
- Toàn bộ button có đủ 5 trạng thái: `Default`, `Hover`, `Active`, `Focus-visible`, `Disabled`.

---

## 5. QUY TẮC NGHIỆP VỤ & RÀNG BUỘC
- File `package.json` bắt buộc cấu hình hook prebuild:
  ```json
  "scripts": {
    "test": "tsx tests/test_qa_lifecycle.ts",
    "prebuild": "npm run test"
  }
  ```
- Tầng 0 Architecture Gate tự động quét kiểm tra 100% module có file `index.ts` và 0 rò rỉ ranh giới.

---

## 6. XỬ LÝ BIÊN & DỮ LIỆU BẨN (EDGE CASES)
- Trường hợp cấu hình hệ thống chưa có file config: Tự động khởi tạo giá trị mặc định an toàn (Default fallback).
- Hỗ trợ màn hình độ phân giải cao (High DPI Scaling 125%, 150%, 200% trên Windows).

---

## 7. TIÊU CHÍ NGHIỆM THU (ACCEPTANCE CRITERIA / DOD)
- [ ] Khởi tạo hoàn chỉnh dự án Tauri v2 + React 18 + TypeScript + Tailwind CSS.
- [ ] Thư viện Atomic Components (`Button`, `Card`, `Badge`) hoạt động độc lập và đầy đủ 5 trạng thái tương tác.
- [ ] Hook `prebuild` hoạt động: Nếu test fail, chặn đứng quá trình build.
- [ ] Test Tầng 0 quét kiến trúc đạt 100% PASS.
