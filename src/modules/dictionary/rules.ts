import { DictionaryEntry } from './types';

export const FALLBACK_DICTIONARY: Record<string, DictionaryEntry> = {
  报销: {
    simplified: '报销',
    traditional: '報銷',
    pinyin: '[ bào xiāo ]',
    hanViet: 'Hán Việt: BÁO TIÊU',
    pos: 'Động từ',
    definitions: [
      'Nộp báo cáo chi tiêu; thanh toán chi phí, bồi hoàn tiền công tác phí.',
      'Ghi sổ xoá sổ, huỷ bỏ; tiêu diệt, làm hỏng hoàn toàn (nghĩa bóng).',
    ],
    examples: [
      {
        chinese: '我明天去财务部报销。',
        pinyin: '[ wǒ míng tiān qù cái wù bù bào xiāo ]',
        vietnamese: 'Ngày mai tôi phải đến phòng tài vụ để thanh toán chi phí.',
      },
    ],
  },
  财务: {
    simplified: '财务',
    traditional: '財務',
    pinyin: '[ cái wù ]',
    hanViet: 'Hán Việt: TÀI VỤ',
    pos: 'Danh từ',
    definitions: [
      'Công việc tài chính, việc quản lý thu chi tiền bạc của cơ quan, doanh nghiệp.',
      'Bộ phận tài chính, kế toán.',
    ],
    examples: [
      {
        chinese: '他在公司财务部工作。',
        pinyin: '[ tā zài gōng sī cái wù bù gōng zuò ]',
        vietnamese: 'Anh ấy làm việc ở phòng tài vụ của công ty.',
      },
    ],
  },
  万: {
    simplified: '万',
    traditional: '萬',
    pinyin: '[ wàn ]',
    hanViet: 'Hán Việt: VẠN',
    pos: 'Số từ (num)',
    definitions: [
      'Muôn, vạn; mười nghìn (10,000).',
      'Rất nhiều, vô số; chỉ một lượng cực lớn (vạn tuế, vạn vật).',
      'Tuyệt đối, nhất thiết (vạn vạn bất khả).',
    ],
    examples: [
      {
        chinese: '这本书有万页。',
        pinyin: '[ zhè běn shū yǒu wàn yè ]',
        vietnamese: 'Cuốn sách này có vạn trang.',
      },
      {
        chinese: '万里长城十分雄伟。',
        pinyin: '[ wàn lǐ cháng chéng shí fēn xióng wěi ]',
        vietnamese: 'Vạn Lý Trường Thành vô cùng hùng vĩ.',
      },
    ],
  },
  这本书: {
    simplified: '这本书',
    pinyin: '[ zhè běn shū ]',
    hanViet: 'Hán Việt: GIÁ BỔN THƯ',
    pos: 'Cụm danh từ',
    definitions: ['Cuốn sách này, quyển sách này (Đại từ 这 + Lượng từ 本 + Danh từ 书).'],
    examples: [
      {
        chinese: '这本书很有意思。',
        pinyin: '[ zhè běn shū hěn yǒu yì si ]',
        vietnamese: 'Quyển sách này rất hay.',
      },
    ],
  },
  这: {
    simplified: '这',
    traditional: '這',
    pinyin: '[ zhè ]',
    hanViet: 'Hán Việt: GIÁ',
    pos: 'Đại từ chỉ thị',
    definitions: [
      'Đây, này (chỉ người hoặc sự vật ở cự ly gần).',
      'Bây giờ, lúc này (phó từ: 这就去 - đi ngay bây giờ).',
    ],
    examples: [
      {
        chinese: '这是我的中文老师。',
        pinyin: '[ zhè shì wǒ de zhōng wén lǎo shī ]',
        vietnamese: 'Đây là giáo viên tiếng Trung của tôi.',
      },
    ],
  },
  本: {
    simplified: '本',
    pinyin: '[ běn ]',
    hanViet: 'Hán Việt: BỔN / BẢN',
    pos: 'Lượng từ / Danh từ',
    definitions: [
      'Cuốn, quyển (lượng từ cho sách, vở, tạp chí: 一本书 - một quyển sách).',
      'Gốc, rễ, cội nguồn, bản chất (cơ bản, căn bản).',
      'Vốn liếng (tiền vốn: 成本 - giá vốn).',
    ],
    examples: [
      {
        chinese: '这是一本好书。',
        pinyin: '[ zhè shì yī běn hǎo shū ]',
        vietnamese: 'Đây là một quyển sách hay.',
      },
    ],
  },
  书: {
    simplified: '书',
    traditional: '書',
    pinyin: '[ shū ]',
    hanViet: 'Hán Việt: THƯ',
    pos: 'Danh từ',
    definitions: ['Sách, vở, tác phẩm.', 'Thư từ, thư tín.'],
    examples: [
      {
        chinese: '他在看书。',
        pinyin: '[ tā zài kàn shū ]',
        vietnamese: 'Anh ấy đang đọc sách.',
      },
    ],
  },
  有: {
    simplified: '有',
    pinyin: '[ yǒu ]',
    hanViet: 'Hán Việt: HỮU',
    pos: 'Động từ',
    definitions: ['Có; sở hữu, chiếm giữ.', 'Tồn tại, hiện diện.'],
    examples: [
      {
        chinese: '我有一本汉语词典。',
        pinyin: '[ wǒ yǒu yī běn hàn yǔ cí diǎn ]',
        vietnamese: 'Tôi có một cuốn từ điển tiếng Hán.',
      },
    ],
  },
  页: {
    simplified: '页',
    traditional: '頁',
    pinyin: '[ yè ]',
    hanViet: 'Hán Việt: DIỆP',
    pos: 'Lượng từ',
    definitions: ['Trang (trang sách, trang giấy).'],
    examples: [
      {
        chinese: '请翻到第五十页。',
        pinyin: '[ qǐng fān dào dì wǔ shí yè ]',
        vietnamese: 'Xin hãy lật đến trang số 50.',
      },
    ],
  },
  万里长城: {
    simplified: '万里长城',
    traditional: '萬里長城',
    pinyin: '[ wàn lǐ cháng chéng ]',
    hanViet: 'Hán Việt: VẠN LÝ TRƯỜNG THÀNH',
    pos: 'Danh từ riêng',
    definitions: ['Vạn Lý Trường Thành (công trình phòng thủ cổ đại nổi tiếng của Trung Quốc).'],
    examples: [
      {
        chinese: '不到长城非好汉。',
        pinyin: '[ bù dào cháng chéng fēi hǎo hàn ]',
        vietnamese: 'Bất đáo Trường Thành phi hảo hán.',
      },
    ],
  },
  十分: {
    simplified: '十分',
    pinyin: '[ shí fēn ]',
    hanViet: 'Hán Việt: THẬP PHÂN',
    pos: 'Phó từ',
    definitions: ['Vô cùng, rất, hết sức (đồng nghĩa: 非常, 极其).'],
    examples: [
      {
        chinese: '大家十分高兴。',
        pinyin: '[ dà jiā shí fēn gāo xìng ]',
        vietnamese: 'Mọi người vô cùng vui mừng.',
      },
    ],
  },
  雄伟: {
    simplified: '雄伟',
    traditional: '雄偉',
    pinyin: '[ xióng wěi ]',
    hanViet: 'Hán Việt: HÙNG VĨ',
    pos: 'Tính từ',
    definitions: ['Hùng vĩ, đồ sộ, nguy nga tráng lệ.'],
    examples: [
      {
        chinese: '气势雄伟。',
        pinyin: '[ qì shì xióng wěi ]',
        vietnamese: 'Khí thế hùng vĩ.',
      },
    ],
  },
  汉语: {
    simplified: '汉语',
    traditional: '漢語',
    pinyin: '[ hàn yǔ ]',
    hanViet: 'Hán Việt: HÁN NGỮ',
    pos: 'Danh từ',
    definitions: ['Tiếng Hán, tiếng Trung Quốc.', 'Ngôn ngữ của dân tộc Hán.'],
    examples: [
      {
        chinese: '汉语不难学。',
        pinyin: '[ hàn yǔ bù nán xué ]',
        vietnamese: 'Tiếng Hán không khó học.',
      },
    ],
  },
  是: {
    simplified: '是',
    pinyin: '[ shì ]',
    hanViet: 'Hán Việt: THỊ',
    pos: 'Động từ hệ từ',
    definitions: [
      'Là (dùng để phán đoán: 这是书 - đây là sách).',
      'Đúng, phải (đối lập với phi/sai: 是非 - đúng sai).',
      'Đồng ý, vâng, dạ.',
    ],
    examples: [
      {
        chinese: '他是我的中国朋友。',
        pinyin: '[ tā shì wǒ de zhōng guó péng you ]',
        vietnamese: 'Anh ấy là bạn người Trung Quốc của tôi.',
      },
    ],
  },
  不是: {
    simplified: '不是',
    pinyin: '[ bù shì ]',
    hanViet: 'Hán Việt: BẤT THỊ',
    pos: 'Động từ',
    definitions: ['Không phải; không là.', 'Lỗi lầm, khuyết điểm (陪不是 - nhận lỗi).'],
    examples: [
      {
        chinese: '这不是我的书。',
        pinyin: '[ zhè bú shì wǒ de shū ]',
        vietnamese: 'Đây không phải là sách của tôi.',
      },
    ],
  },
  在: {
    simplified: '在',
    pinyin: '[ zài ]',
    hanViet: 'Hán Việt: TẠI',
    pos: 'Giới từ / Động từ',
    definitions: [
      'Ở, tại (chỉ nơi chốn: 在家 - ở nhà).',
      'Đang (phó từ chỉ hành động tiếp diễn: 在看书 - đang đọc sách).',
      'Tồn tại, hiện diện.',
    ],
    examples: [
      {
        chinese: '他在河内工作。',
        pinyin: '[ tā zài hé nèi gōng zuò ]',
        vietnamese: 'Anh ấy làm việc ở Hà Nội.',
      },
    ],
  },
  家乡: {
    simplified: '家乡',
    traditional: '家鄉',
    pinyin: '[ jiā xiāng ]',
    hanViet: 'Hán Việt: GIA HƯƠNG',
    pos: 'Danh từ',
    definitions: ['Quê hương, quê nhà, xứ sở sinh thành.'],
    examples: [
      {
        chinese: '我的家乡非常美丽。',
        pinyin: '[ wǒ de jiā xiāng fēi cháng měi lì ]',
        vietnamese: 'Quê hương của tôi rất đẹp.',
      },
    ],
  },
  市: {
    simplified: '市',
    pinyin: '[ shì ]',
    hanViet: 'Hán Việt: THỊ',
    pos: 'Danh từ',
    definitions: [
      'Thành phố (đơn vị hành chính: 胡志明市 - Thành phố Hồ Chí Minh).',
      'Chợ, nơi mua bán (thị trường).',
    ],
    examples: [
      {
        chinese: '这个市有很多工厂。',
        pinyin: '[ zhè ge shì yǒu hěn duō gōng chǎng ]',
        vietnamese: 'Thành phố này có rất nhiều nhà máy.',
      },
    ],
  },
  省: {
    simplified: '省',
    pinyin: '[ shěng ]',
    hanViet: 'Hán Việt: TỈNH',
    pos: 'Danh từ / Động từ',
    definitions: [
      'Tỉnh (đơn vị hành chính).',
      'Tiết kiệm, giảm bớt (省钱 - tiết kiệm tiền).',
    ],
    examples: [
      {
        chinese: '他在同奈省上班。',
        pinyin: '[ tā zài tóng nài shěng shàng bān ]',
        vietnamese: 'Anh ấy đi làm ở tỉnh Đồng Nai.',
      },
    ],
  },
  现在: {
    simplified: '现在',
    traditional: '現在',
    pinyin: '[ xiàn zài ]',
    hanViet: 'Hán Việt: HIỆN TẠI',
    pos: 'Danh từ thời gian',
    definitions: ['Bây giờ, hiện tại, thời điểm hiện nay.'],
    examples: [
      {
        chinese: '现在几点了？',
        pinyin: '[ xiàn zài jǐ diǎn le ]',
        vietnamese: 'Bây giờ là mấy giờ rồi?',
      },
    ],
  },
  住: {
    simplified: '住',
    pinyin: '[ zhù ]',
    hanViet: 'Hán Việt: TRÚ',
    pos: 'Động từ',
    definitions: ['Ở, cư trú, sinh sống (居住).', 'Dừng lại, ngừng (停住).'],
    examples: [
      {
        chinese: '你住在哪儿？',
        pinyin: '[ nǐ zhù zài nǎr ]',
        vietnamese: 'Bạn sống ở đâu?',
      },
    ],
  },
  于: {
    simplified: '于',
    traditional: '於',
    pinyin: '[ yú ]',
    hanViet: 'Hán Việt: VU / Ư',
    pos: 'Giới từ',
    definitions: [
      'Ở, tại, vào lúc (chỉ thời gian, địa điểm: 出生于1995年 - sinh năm 1995).',
      'Đối với; so với (lớn hơn, cao hơn).',
    ],
    examples: [
      {
        chinese: '他生于河内。',
        pinyin: '[ tā shēng yú hé nèi ]',
        vietnamese: 'Anh ấy sinh ra ở Hà Nội.',
      },
    ],
  },
  年: {
    simplified: '年',
    pinyin: '[ nián ]',
    hanViet: 'Hán Việt: NIÊN',
    pos: 'Danh từ',
    definitions: ['Năm (năm tháng, niên đại: 2026年).', 'Tuổi tác; Tết (quá niên).'],
    examples: [
      {
        chinese: '新的一年。',
        pinyin: '[ xīn de yī nián ]',
        vietnamese: 'Một năm mới.',
      },
    ],
  },
  出生: {
    simplified: '出生',
    pinyin: '[ chū shēng ]',
    hanViet: 'Hán Việt: XUẤT SINH',
    pos: 'Động từ',
    definitions: ['Sinh ra, ra đời.'],
    examples: [
      {
        chinese: '他在越南出生。',
        pinyin: '[ tā zài yuè nán chū shēng ]',
        vietnamese: 'Anh ấy sinh ra ở Việt Nam.',
      },
    ],
  },
  生日: {
    simplified: '生日',
    pinyin: '[ shēng rì ]',
    hanViet: 'Hán Việt: SINH NHẬT',
    pos: 'Danh từ',
    definitions: ['Ngày sinh, sinh nhật.'],
    examples: [
      {
        chinese: '祝你生日快乐！',
        pinyin: '[ zhù nǐ shēng rì kuài lè ]',
        vietnamese: 'Chúc bạn sinh nhật vui vẻ!',
      },
    ],
  },
  月: {
    simplified: '月',
    pinyin: '[ yuè ]',
    hanViet: 'Hán Việt: NGUYỆT',
    pos: 'Danh từ',
    definitions: ['Tháng (nhất nguyệt, nhị nguyệt).', 'Mặt trăng (nguyệt quang).'],
    examples: [
      {
        chinese: '十月的天气很凉爽。',
        pinyin: '[ shí yuè de tiān qì hěn liáng shuǎng ]',
        vietnamese: 'Thời tiết tháng mười rất mát mẻ.',
      },
    ],
  },
  号: {
    simplified: '号',
    traditional: '號',
    pinyin: '[ hào ]',
    hanViet: 'Hán Việt: HÀO / HIỆU',
    pos: 'Danh từ / Lượng từ',
    definitions: [
      'Ngày (trong ngày tháng: 12号 - ngày 12).',
      'Số, mã số, kích cỡ (hào mã).',
    ],
    examples: [
      {
        chinese: '今天是五号。',
        pinyin: '[ jīn tiān shì wǔ hào ]',
        vietnamese: 'Hôm nay là ngày mùng 5.',
      },
    ],
  },
  虽: {
    simplified: '虽',
    traditional: '雖',
    pinyin: '[ suī ]',
    hanViet: 'Hán Việt: TUY',
    pos: 'Liên từ',
    definitions: ['Tuy, dẫu rằng (thường đi với 虽然 - tuy nhiên).'],
    examples: [
      {
        chinese: '虽小但全。',
        pinyin: '[ suī xiǎo dàn quán ]',
        vietnamese: 'Tuy nhỏ nhưng đầy đủ.',
      },
    ],
  },
  岁: {
    simplified: '岁',
    traditional: '歲',
    pinyin: '[ suī ]',
    hanViet: 'Hán Việt: TUẾ',
    pos: 'Lượng từ',
    definitions: [
      'Tuổi (chỉ tuổi tác của con người: 二十岁 - 20 tuổi).',
      'Năm (tuế nguyệt).',
    ],
    examples: [
      {
        chinese: '他今年二十岁。',
        pinyin: '[ tā jīn nián èr shí suì ]',
        vietnamese: 'Năm nay anh ấy hai mươi tuổi.',
      },
    ],
  },
  了: {
    simplified: '了',
    pinyin: '[ le / liǎo ]',
    hanViet: 'Hán Việt: LIỄU',
    pos: 'Trợ từ',
    definitions: [
      'Rồi (trợ từ ngữ khí chỉ sự việc đã hoàn thành hoặc có sự biến đổi).',
      'Hiểu rõ (liễu giải - 了解).',
    ],
    examples: [
      {
        chinese: '吃饭了。',
        pinyin: '[ chī fàn le ]',
        vietnamese: 'Ăn cơm rồi.',
      },
    ],
  },
  仁泽坊: {
    simplified: '仁泽坊',
    traditional: '仁澤坊',
    pinyin: '[ rén zé fāng ]',
    hanViet: 'Hán Việt: NHƠN TRẠCH PHƯỜNG',
    pos: 'Địa danh',
    definitions: ['Phường Nhơn Trạch (đơn vị hành chính địa phương).'],
    examples: [
      {
        chinese: '仁泽坊是一个工业区。',
        pinyin: '[ rén zé fāng shì yí gè gōng yè qū ]',
        vietnamese: 'Phường Nhơn Trạch là một khu công nghiệp.',
      },
    ],
  },
  工业区: {
    simplified: '工业区',
    traditional: '工業區',
    pinyin: '[ gōng yè qū ]',
    hanViet: 'Hán Việt: CÔNG NGHIỆP KHU',
    pos: 'Danh từ',
    definitions: ['Khu công nghiệp (khu vực tập trung các nhà máy sản xuất công nghiệp).'],
    examples: [
      {
        chinese: '工业区有很多工人。',
        pinyin: '[ gōng yè qū yǒu hěn duō gōng rén ]',
        vietnamese: 'Khu công nghiệp có rất nhiều công nhân.',
      },
    ],
  },
};

export function queryLocalDictionary(word: string): DictionaryEntry | null {
  if (!word || typeof word !== 'string') return null;
  const trimmed = word.trim();
  return FALLBACK_DICTIONARY[trimmed] || null;
}

export function formatHanViet(hanViet: string): string {
  if (!hanViet) return '';
  return hanViet.startsWith('Hán Việt:') ? hanViet : `Hán Việt: ${hanViet.toUpperCase()}`;
}
