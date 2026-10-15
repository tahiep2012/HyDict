import { HudPosition } from './types';

export function calculateClampedPosition(
  cursorX: number,
  cursorY: number,
  windowWidth: number = 480,
  windowHeight: number = 560,
  screenWidth: number = 1920,
  screenHeight: number = 1080
): HudPosition {
  const margin = 16;
  const offsetX = 14;
  const offsetY = 16;

  let x = cursorX + offsetX;
  let y = cursorY + offsetY;

  if (x + windowWidth > screenWidth - margin) {
    x = cursorX - windowWidth - offsetX;
  }

  if (y + windowHeight > screenHeight - margin) {
    y = cursorY - windowHeight - offsetY;
  }

  if (x < margin) x = margin;
  if (y < margin) y = margin;

  return { x, y };
}

export const CHARACTER_RADICALS: Record<string, import('./types').CharacterRadicalInfo> = {
  住: {
    radical: '亻',
    name: 'Bộ Nhân đứng (rén)',
    meaning: 'Liên quan đến hành vi hoặc nơi cư ngụ của con người.',
    strokeCount: 7,
  },
  页: {
    radical: '页',
    name: 'Bộ Diệp (yè)',
    meaning: 'Liên quan đến trang giấy, mặt sách hoặc đầu gáy.',
    strokeCount: 6,
  },
  有: {
    radical: '月',
    name: 'Bộ Nguyệt / Nhục (yuè)',
    meaning: 'Liên quan đến sự tồn tại, hiện diện hoặc thân thể.',
    strokeCount: 6,
  },
  本: {
    radical: '木',
    name: 'Bộ Mộc (mù)',
    meaning: 'Liên quan đến thân cây, gốc rễ, cội nguồn căn bản.',
    strokeCount: 5,
  },
  书: {
    radical: '乛',
    name: 'Bộ Ất (yǐ)',
    meaning: 'Nét chữ, ghi chép tác phẩm hoặc thư từ.',
    strokeCount: 4,
  },
  万: {
    radical: '一',
    name: 'Bộ Nhất (yī)',
    meaning: 'Chữ số, khởi nguồn số lượng cực lớn.',
    strokeCount: 3,
  },
  市: {
    radical: '巾',
    name: 'Bộ Cân (jīn)',
    meaning: 'Khăn vải, nơi họp chợ giao thương.',
    strokeCount: 5,
  },
  省: {
    radical: '目',
    name: 'Bộ Mục (mù)',
    meaning: 'Mắt nhìn, xem xét, kiểm điểm hoặc giảm bớt.',
    strokeCount: 9,
  },
  人: {
    radical: '人',
    name: 'Bộ Nhân (rén)',
    meaning: 'Con người, nhân loại.',
    strokeCount: 2,
  },
  大: {
    radical: '大',
    name: 'Bộ Đại (dà)',
    meaning: 'To lớn, rộng lớn.',
    strokeCount: 3,
  },
  小: {
    radical: '小',
    name: 'Bộ Tiểu (xiǎo)',
    meaning: 'Nhỏ bé, ít ỏi.',
    strokeCount: 3,
  },
  好: {
    radical: '女',
    name: 'Bộ Nữ (nǚ)',
    meaning: 'Người phụ nữ, điều tốt đẹp, lành lặn.',
    strokeCount: 6,
  },
  学: {
    radical: '子',
    name: 'Bộ Tử (zǐ)',
    meaning: 'Đứa trẻ, học tập tri thức.',
    strokeCount: 8,
  },
};

export const COMMON_COMPOUNDS: Record<string, import('./types').CompoundWord[]> = {
  住: [
    { word: '居住', pinyin: 'jū zhù', meaning: 'Cư trú, sinh sống' },
    { word: '住宿', pinyin: 'zhù sù', meaning: 'Trọ lại, nghỉ đêm' },
    { word: '停住', pinyin: 'tíng zhù', meaning: 'Dừng lại, đứng khựng lại' },
    { word: '住址', pinyin: 'zhù zhǐ', meaning: 'Địa chỉ nơi ở' },
  ],
  页: [
    { word: '页面', pinyin: 'yè miàn', meaning: 'Trang giấy, giao diện' },
    { word: '首页', pinyin: 'shǒu yè', meaning: 'Trang chủ, trang đầu' },
    { word: '网页', pinyin: 'wǎng yè', meaning: 'Trang web điện tử' },
    { word: '页码', pinyin: 'yè mǎ', meaning: 'Số trang sách' },
  ],
  有: [
    { word: '有用', pinyin: 'yǒu yòng', meaning: 'Có ích, hữu dụng' },
    { word: '有人', pinyin: 'yǒu rén', meaning: 'Có người' },
    { word: '拥有', pinyin: 'yōng yǒu', meaning: 'Sở hữu, nắm giữ' },
    { word: '没有', pinyin: 'méi yǒu', meaning: 'Không có' },
  ],
  本: [
    { word: '书本', pinyin: 'shū běn', meaning: 'Sách vở' },
    { word: '本子', pinyin: 'běn zi', meaning: 'Vở ghi chép' },
    { word: '根本', pinyin: 'gēn běn', meaning: 'Căn bản, gốc rễ' },
    { word: '原本', pinyin: 'yuán běn', meaning: 'Vốn dĩ, ban đầu' },
  ],
  仁泽坊: [
    { word: '工业区', pinyin: 'gōng yè qū', meaning: 'Khu công nghiệp' },
    { word: '同奈省', pinyin: 'tóng nài shěng', meaning: 'Tỉnh Đồng Nai' },
  ],
  工业区: [
    { word: '外资企业', pinyin: 'wài zī qǐ yè', meaning: 'Doanh nghiệp ngoại' },
    { word: '工厂', pinyin: 'gōng chǎng', meaning: 'Nhà máy, xưởng' },
  ],
};

export function getRadicalInfo(char: string): import('./types').CharacterRadicalInfo | null {
  if (!char || char.length === 0) return null;
  const single = char.trim()[0];
  return CHARACTER_RADICALS[single] || null;
}

export function getCompounds(word: string): import('./types').CompoundWord[] {
  if (!word) return [];
  const trimmed = word.trim();
  return COMMON_COMPOUNDS[trimmed] || [];
}
