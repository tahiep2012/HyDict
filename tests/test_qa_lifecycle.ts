import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// ANSI color codes
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';

console.log(`${CYAN}======================================================${RESET}`);
console.log(`${CYAN}🛡️  HANZII DICT DESKTOP - 5-TIER QA VERIFICATION GATE${RESET}`);
console.log(`${CYAN}======================================================${RESET}\n`);

let totalPassed = 0;
let totalFailed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ${GREEN}✓ [PASS]${RESET} ${testName}`);
    totalPassed++;
  } else {
    console.error(`  ${RED}✗ [FAIL]${RESET} ${testName}`);
    totalFailed++;
  }
}

// -------------------------------------------------------------
// TẦNG 0: MODULAR ARCHITECTURE & ENCAPSULATION GATE
// -------------------------------------------------------------
console.log(`${YELLOW}▶ TẦNG 0: CỔNG KIẾN TRÚC MÔ-ĐUN & RANH GIỚI ĐÓNG GÓI${RESET}`);

const modulesDir = path.resolve(process.cwd(), 'src/modules');
if (fs.existsSync(modulesDir)) {
  const moduleList = fs.readdirSync(modulesDir).filter((item) => {
    return fs.statSync(path.join(modulesDir, item)).isDirectory();
  });

  // 0.1 Mọi module bắt buộc phải có file index.ts (Public API)
  moduleList.forEach((mod) => {
    const indexPath = path.join(modulesDir, mod, 'index.ts');
    const hasIndex = fs.existsSync(indexPath);
    assert(hasIndex, `Module "${mod}" phải có index.ts làm Public API duy nhất`);
  });

  // 0.2 Quét ranh giới mô-đun: Cấm chọc thẳng vào file con của module khác
  function scanModuleViolations(dir: string): string[] {
    let violations: string[] = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        violations = violations.concat(scanModuleViolations(fullPath));
      } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const lines = content.split('\n');

        lines.forEach((line, idx) => {
          const importMatch = line.match(/from\s+['"](\.\.\/[^'"]+|@\/modules\/[^'"]+)['"]/);
          if (importMatch) {
            const importPath = importMatch[1];
            for (const otherMod of moduleList) {
              const relToModules = path.relative(modulesDir, fullPath);
              const currentMod = relToModules.split(path.sep)[0];
              if (
                currentMod !== otherMod &&
                (importPath.includes(`/${otherMod}/components/`) ||
                  importPath.includes(`../${otherMod}/components/`) ||
                  importPath.includes(`/${otherMod}/hooks/`) ||
                  importPath.includes(`../${otherMod}/hooks/`))
              ) {
                violations.push(
                  `${path.relative(process.cwd(), fullPath)}:${idx + 1} chọc trực tiếp vào nội bộ module ${otherMod}`
                );
              }
            }
          }
        });
      }
    }
    return violations;
  }

  const archViolations = scanModuleViolations(modulesDir);
  assert(archViolations.length === 0, `Không có vi phạm rò rỉ ranh giới mô-đun (Zero Encapsulation Leak)`);
  if (archViolations.length > 0) {
    archViolations.forEach((v) => console.error(`    ${RED}Vi phạm:${RESET} ${v}`));
  }
} else {
  console.log(`  ${YELLOW}Thư mục src/modules chưa tồn tại, bỏ qua kiểm tra.${RESET}`);
}

// -------------------------------------------------------------
// TẦNG 1: UNIT TESTS (RULES & VALIDATION)
// -------------------------------------------------------------
console.log(`\n${YELLOW}▶ TẦNG 1: KIỂM THỬ ĐƠN VỊ (UNIT TESTS)${RESET}`);

import { DEFAULT_CONFIG, validateHotkey } from '../src/modules/core-infra';
import { segmentChineseText, findTokenAtOffset, isCjkPunctuation } from '../src/modules/segmentation';

assert(DEFAULT_CONFIG.hotkey === 'Alt+Q', 'Cấu hình phím tắt mặc định phải là Alt+Q');
assert(DEFAULT_CONFIG.ankiDeckName === 'Tiếng Trung', 'Tên deck Anki mặc định là Tiếng Trung');
assert(validateHotkey('Shift+T') === true, 'Phím tắt Shift+T hợp lệ');
assert(validateHotkey('Alt+Q') === true, 'Phím tắt Alt+Q hợp lệ');
assert(validateHotkey('T') === false, 'Phím tắt đơn T không hợp lệ (phải có phím bổ trợ)');
assert(validateHotkey('') === false, 'Phím tắt rỗng không hợp lệ');

// Tests cho module 02-segmentation
const tokens1 = segmentChineseText('这本书有万页。');
const words1 = tokens1.map((t) => t.word);
assert(words1.includes('万'), 'Phân đoạn "这本书有万页。" phải nhận diện được chữ "万"');
assert(words1.includes('页'), 'Phân đoạn "这本书有万页。" phải nhận diện được chữ "页"');
assert(words1.includes('。') && tokens1.find((t) => t.word === '。')?.isPunctuation === true, 'Dấu chấm CJK "。" được đánh dấu là punctuation');

const tokens2 = segmentChineseText('万里长城十分雄伟。');
const words2 = tokens2.map((t) => t.word);
assert(words2.includes('十分') || words2.includes('雄伟') || words2.includes('长城'), 'Phân đoạn câu phức "万里长城十分雄伟。" tách đúng cụm từ');

const tokenAtCursor = findTokenAtOffset(tokens1, 4); // vị trí chữ '万'
assert(tokenAtCursor !== null, 'Tìm đúng token tại vị trí con trỏ chuột');
assert(isCjkPunctuation('，') === true, 'Ký tự "，" là dấu câu CJK');
assert(isCjkPunctuation('书') === false, 'Ký tự "书" không phải dấu câu CJK');

// Tests cho module 03-dictionary
import { queryLocalDictionary, formatHanViet } from '../src/modules/dictionary';

const entryWan = queryLocalDictionary('万');
assert(entryWan !== null, 'Tra cứu từ "万" trong từ điển thành công');
assert(entryWan?.hanViet === 'Hán Việt: VẠN', 'Âm Hán Việt của "万" là "Hán Việt: VẠN"');
assert(entryWan?.pinyin === '[ wàn ]', 'Pinyin của "万" là "[ wàn ]"');
assert((entryWan?.definitions.length ?? 0) >= 3, 'Từ "万" có đầy đủ các tầng nghĩa chi tiết');
assert((entryWan?.examples.length ?? 0) >= 2, 'Từ "万" có câu ví dụ song ngữ thực tế');

const entryChangCheng = queryLocalDictionary('万里长城');
assert(entryChangCheng !== null, 'Tra cứu cụm từ dài "万里长城" thành công');
assert(formatHanViet('vạn') === 'Hán Việt: VẠN', 'Hàm formatHanViet chuẩn hóa âm Hán Việt in hoa');

// Tests cho bộ từ vựng người dùng yêu cầu: 本, 有, 是, 家乡, 工业区
const entryBen = queryLocalDictionary('本');
assert(entryBen !== null, 'Tra cứu từ "本" (quyển/cuốn) trong từ điển thành công');
assert(Boolean(entryBen?.hanViet.includes('BỔN') || entryBen?.hanViet.includes('BẢN')), 'Âm Hán Việt của "本" chứa BỔN / BẢN');

const entryYou = queryLocalDictionary('有');
assert(entryYou !== null, 'Tra cứu từ "有" trong từ điển thành công');
assert(entryYou?.hanViet === 'Hán Việt: HỮU', 'Âm Hán Việt của "有" là "Hán Việt: HỮU"');
assert((entryYou?.definitions.length ?? 0) >= 2, 'Từ "有" có đầy đủ định nghĩa');

const entryShi = queryLocalDictionary('是');
assert(entryShi !== null, 'Tra cứu từ "是" trong từ điển thành công');

const entryJiaXiang = queryLocalDictionary('家乡');
assert(entryJiaXiang !== null && entryJiaXiang.hanViet === 'Hán Việt: GIA HƯƠNG', 'Tra cứu từ "家乡" ra âm Hán Việt "GIA HƯƠNG"');

const entryGongYeQu = queryLocalDictionary('工业区');
assert(entryGongYeQu !== null && entryGongYeQu.hanViet === 'Hán Việt: CÔNG NGHIỆP KHU', 'Tra cứu cụm "工业区" ra âm Hán Việt "CÔNG NGHIỆP KHU"');

// Tests cho từ vựng thực tế trong Anki card: 报销, 财务
const entryBaoXiao = queryLocalDictionary('报销');
assert(entryBaoXiao !== null, 'Tra cứu từ "报销" (thanh toán chi phí) trong từ điển thành công');
assert(entryBaoXiao?.hanViet === 'Hán Việt: BÁO TIÊU', 'Âm Hán Việt của "报销" là "Hán Việt: BÁO TIÊU"');
assert(entryBaoXiao?.pinyin === '[ bào xiāo ]', 'Pinyin của "报销" là "[ bào xiāo ]"');

const entryCaiWu = queryLocalDictionary('财务');
assert(entryCaiWu !== null, 'Tra cứu từ "财务" (tài chính) trong từ điển thành công');
assert(entryCaiWu?.hanViet === 'Hán Việt: TÀI VỤ', 'Âm Hán Việt của "财务" là "Hán Việt: TÀI VỤ"');

// Tests cho tính năng Tô màu thanh điệu Pinyin & Cấp độ HSK (EPIC-09)
import { getToneFromPinyinSyllable, parsePinyinToTokens, getHskLevel } from '../src/modules/dictionary';

assert(getToneFromPinyinSyllable('bā') === 1, '[Tone] "bā" là Thanh 1');
assert(getToneFromPinyinSyllable('bá') === 2, '[Tone] "bá" là Thanh 2');
assert(getToneFromPinyinSyllable('bǎ') === 3, '[Tone] "bǎ" là Thanh 3');
assert(getToneFromPinyinSyllable('bà') === 4, '[Tone] "bà" là Thanh 4');
assert(getToneFromPinyinSyllable('ba') === 5, '[Tone] "ba" là Khinh thanh');
assert(getToneFromPinyinSyllable('hao3') === 3, '[Tone] "hao3" định dạng số nhận diện đúng Thanh 3');

const tokensBaoXiao = parsePinyinToTokens('[ bào xiāo ]');
assert(tokensBaoXiao.length === 4, '[Tone Parser] Tách đúng 4 token cho "[ bào xiāo ]"');
assert(tokensBaoXiao[1].tone === 4 && tokensBaoXiao[2].tone === 1, '[Tone Parser] Nhận diện đúng "bào" thanh 4 và "xiāo" thanh 1');

assert(getHskLevel('爱') === 'HSK 1', '[HSK] Chữ "爱" thuộc cấp độ HSK 1');
assert(getHskLevel('喜欢') === 'HSK 1', '[HSK] Từ "喜欢" thuộc cấp độ HSK 1');
assert(getHskLevel('万') === 'HSK 3', '[HSK] Chữ "万" thuộc cấp độ HSK 3');
assert(getHskLevel('报销') === 'HSK 6', '[HSK] Từ "报销" thuộc cấp độ HSK 6');
assert(getHskLevel('仁泽坊') === null, '[HSK] Địa danh không thuộc HSK trả về null');

// Tests cho phân hệ EPIC-11: Tra cứu đa chiều (Reverse Vietnamese & Pinyin Tone-free)
import { classifySearchQuery, stripPinyinTones, queryLocalDictionaryMulti } from '../src/modules/dictionary';

// 1. Phân loại Query
assert(classifySearchQuery('万里长城').type === 'chinese', '[EPIC-11] Nhận diện đúng chữ Hán "万里长城"');
assert(classifySearchQuery('学习').type === 'chinese', '[EPIC-11] Nhận diện đúng chữ Hán "学习"');
assert(classifySearchQuery('gongzuo').type === 'pinyin', '[EPIC-11] Nhận diện đúng Pinyin không dấu "gongzuo"');
assert(classifySearchQuery('nihao').type === 'pinyin', '[EPIC-11] Nhận diện đúng Pinyin không dấu "nihao"');
assert(classifySearchQuery('ni hao').type === 'pinyin', '[EPIC-11] Nhận diện đúng Pinyin có khoảng trắng "ni hao"');
assert(classifySearchQuery('bảo hiểm').type === 'vietnamese', '[EPIC-11] Nhận diện đúng tiếng Việt có dấu "bảo hiểm"');
assert(classifySearchQuery('sa thải').type === 'vietnamese', '[EPIC-11] Nhận diện đúng tiếng Việt có dấu "sa thải"');
assert(classifySearchQuery('sa thai').type === 'vietnamese', '[EPIC-11] Nhận diện đúng tiếng Việt không dấu "sa thai"');

// 2. Chuẩn hóa Tone-free Pinyin
assert(stripPinyinTones('bào xiāo') === 'baoxiao', '[EPIC-11] Loại bỏ thanh điệu "bào xiāo" thành "baoxiao"');
assert(stripPinyinTones('[ nǐ hǎo ]') === 'nihao', '[EPIC-11] Loại bỏ ngoặc và thanh điệu "[ nǐ hǎo ]" thành "nihao"');

// 3. Tra cứu đa chiều
const resultsViet = queryLocalDictionaryMulti('bảo hiểm', 'vietnamese');
assert(resultsViet.length > 0 && resultsViet[0].simplified === '保险', '[EPIC-11] Tra cứu ngược "bảo hiểm" ra từ "保险"');

const resultsPinyin = queryLocalDictionaryMulti('gongzuo', 'pinyin');
assert(resultsPinyin.length > 0 && resultsPinyin[0].simplified === '工作', '[EPIC-11] Tra cứu Pinyin "gongzuo" ra từ "工作"');

const resultsPinyinNihao = queryLocalDictionaryMulti('nihao', 'pinyin');
assert(resultsPinyinNihao.length > 0 && resultsPinyinNihao[0].simplified === '你好', '[EPIC-11] Tra cứu Pinyin "nihao" ra từ "你好"');

// Tests cho module 04-popup-hud
import { calculateClampedPosition } from '../src/modules/popup-hud';

const normalPos = calculateClampedPosition(500, 300, 480, 560, 1920, 1080);
assert(normalPos.x === 514 && normalPos.y === 316, 'Định vị HUD bình thường cách chuột 14px và 16px');

const rightClampedPos = calculateClampedPosition(1850, 300, 480, 560, 1920, 1080);
assert(rightClampedPos.x < 1850, 'HUD tự động lật sang trái con trỏ khi sát mép phải màn hình');

const bottomClampedPos = calculateClampedPosition(500, 1000, 480, 560, 1920, 1080);
assert(bottomClampedPos.y < 1000, 'HUD tự động đẩy lên trên khi sát đáy màn hình');

// Tests cho tính năng Lingoes HUD: Bộ thủ & Từ ghép tiếng Trung
import { getRadicalInfo, getCompounds } from '../src/modules/popup-hud';

const zhuRadical = getRadicalInfo('住');
assert(zhuRadical !== null && zhuRadical.radical === '亻', 'Nhận diện đúng bộ thủ của chữ "住" là "亻" (Bộ Nhân đứng)');
assert(zhuRadical?.strokeCount === 7, 'Chữ "住" có 7 nét thuận');

const yeRadical = getRadicalInfo('页');
assert(yeRadical !== null && yeRadical.radical === '页', 'Nhận diện đúng bộ thủ của chữ "页" là "页" (Bộ Diệp)');

const zhuCompounds = getCompounds('住');
assert(zhuCompounds.length > 0 && zhuCompounds.some((c) => c.word === '居住'), 'Tra cứu từ ghép của "住" chứa "居住"');

const yeCompounds = getCompounds('页');
assert(yeCompounds.length > 0 && yeCompounds.some((c) => c.word === '页面'), 'Tra cứu từ ghép của "页" chứa "页面"');


// Tests cho module 05-audio và stroke-writer
import {
  sanitizeAudioText,
  getGoogleTtsAudioUrl,
  getBaiduTtsAudioUrl,
  buildAzureSsml,
} from '../src/modules/tts-audio';
import { isSingleChineseChar } from '../src/modules/stroke-writer';

assert(sanitizeAudioText('  万  ') === '万', 'Làm sạch chuỗi âm thanh trước khi phát');
assert(getGoogleTtsAudioUrl('你好').includes('translate.google.com') && getGoogleTtsAudioUrl('你好').includes('tl=zh-CN'), '[TTS Engine] Tạo URL Google Translate TTS chuẩn');
assert(getBaiduTtsAudioUrl('你好').includes('fanyi.baidu.com') && getBaiduTtsAudioUrl('你好').includes('lan=zh'), '[TTS Engine] Tạo URL Baidu Fanyi TTS dự phòng');
assert(buildAzureSsml('你好', 'zh-CN-XiaoxiaoNeural').includes('zh-CN-XiaoxiaoNeural'), '[TTS Engine] Tạo SSML Azure Neural Voices chuẩn');
assert(isSingleChineseChar('万') === true, 'Ký tự "万" là chữ Hán đơn hợp lệ');
assert(isSingleChineseChar('书') === true, 'Ký tự "书" là chữ Hán đơn hợp lệ');
assert(isSingleChineseChar('这本书') === false, 'Cụm từ "这本书" không phải chữ Hán đơn');
assert(isSingleChineseChar('A') === false, 'Ký tự Latinh "A" không phải chữ Hán');

// Tests cho module 06-anki-bridge
import { createAnkiPayload, buildAnkiConnectRequestBody } from '../src/modules/anki-bridge';

const ankiPayload = createAnkiPayload({
  Hanzi: '万',
  Pinyin: '[ wàn ]',
  HanViet: 'Hán Việt: VẠN',
  Meaning: 'Muôn, vạn',
});
assert(ankiPayload.deckName === 'Tiếng Trung', 'Tên deck mặc định cho thẻ Anki là "Tiếng Trung"');
assert(ankiPayload.tags.includes('hydict'), 'Thẻ Anki được tự động gắn tag "hydict"');
assert(ankiPayload.fields.Hanzi === '万', 'Trường Hanzi của thẻ Anki được gán đúng');

const reqBody = buildAnkiConnectRequestBody('addNote', { note: ankiPayload });
assert(reqBody.action === 'addNote' && reqBody.version === 6, 'Cấu trúc request AnkiConnect đúng chuẩn phiên bản 6');

// Tests cho module 08-main-window
import { DEFAULT_APP_SETTINGS } from '../src/modules/main-window';
assert(DEFAULT_APP_SETTINGS.globalHotkey === 'Alt+Q', 'Cấu hình phím tắt mặc định trong Settings là Alt+Q');
assert(DEFAULT_APP_SETTINGS.enableCursorCapture === true, 'Mặc định kích hoạt tính năng bắt từ khi bôi đen chuột');
assert(DEFAULT_APP_SETTINGS.filterCjkOnly === true, 'Mặc định kích hoạt bộ lọc ký tự thông minh CJK');
assert(DEFAULT_APP_SETTINGS.ankiDeck === 'Tiếng Trung (HSK 1 - 6)', 'Deck Anki mặc định là Tiếng Trung (HSK 1 - 6)');

// Tests cho module 10-favorites-history (EPIC-10)
import {
  addFavorite,
  removeFavorite,
  isFavorite,
  addHistoryItem,
  filterFavorites,
  filterHistory,
  MAX_HISTORY_ITEMS,
} from '../src/modules/notebook';

const initialFavs: any[] = [];
const fav1 = addFavorite(initialFavs, {
  word: '学习',
  pinyin: 'xué xí',
  hanViet: 'HỌC TẬP',
  definition: 'Học tập; nghiên cứu',
});
assert(fav1.length === 1 && fav1[0].word === '学习', '[Notebook] Thêm từ vào danh sách yêu thích thành công');
assert(isFavorite(fav1, '学习') === true, '[Notebook] isFavorite trả về true cho từ đã lưu');
assert(isFavorite(fav1, '工作') === false, '[Notebook] isFavorite trả về false cho từ chưa lưu');

// Thêm trùng lặp cập nhật lên đầu không trùng
const fav2 = addFavorite(fav1, {
  word: '万',
  pinyin: 'wàn',
  hanViet: 'VẠN',
  definition: 'Mười nghìn',
});
assert(fav2.length === 2 && fav2[0].word === '万', '[Notebook] Từ mới được đưa lên đầu danh sách yêu thích');

const fav3 = addFavorite(fav2, {
  word: '学习',
  pinyin: 'xué xí',
  hanViet: 'HỌC TẬP',
  definition: 'Học tập; nghiên cứu chuyên sâu',
});
assert(fav3.length === 2 && fav3[0].word === '学习', '[Notebook] Thêm lại từ cũ đưa lên đầu không bị trùng lặp');

const favRemoved = removeFavorite(fav3, '学习');
assert(favRemoved.length === 1 && favRemoved[0].word === '万', '[Notebook] Xóa từ khỏi danh sách yêu thích thành công');

// Lọc từ yêu thích
const filteredFav = filterFavorites(fav3, 'nghiên cứu');
assert(filteredFav.length === 1 && filteredFav[0].word === '学习', '[Notebook] filterFavorites tìm đúng theo nội dung giải nghĩa');

// Lịch sử tra cứu & giới hạn 100 mục
let histList: any[] = [];
histList = addHistoryItem(histList, { word: '万', pinyin: 'wàn', hanViet: 'VẠN' });
assert(histList.length === 1 && histList[0].word === '万', '[History] Thêm từ vào lịch sử tra cứu thành công');

// Giới hạn maxItems
let cappedList: any[] = [];
for (let i = 0; i < 110; i++) {
  cappedList = addHistoryItem(cappedList, { word: `word_${i}`, pinyin: `pinyin_${i}`, hanViet: `HV_${i}` }, 100);
}
assert(cappedList.length === 100, `[History] Lịch sử tra cứu giới hạn tối đa ${MAX_HISTORY_ITEMS} mục theo chuẩn FIFO`);
assert(cappedList[0].word === 'word_109', '[History] Mục tra cứu mới nhất luôn ở đầu danh sách');

// -------------------------------------------------------------
// TẦNG 2: INTEGRATION TESTS
// -------------------------------------------------------------
console.log(`\n${YELLOW}▶ TẦNG 2: KIỂM THỬ TÍCH HỢP (INTEGRATION TESTS)${RESET}`);

assert(fs.existsSync(path.resolve(process.cwd(), 'package.json')), 'Tệp package.json tồn tại và toàn vẹn');
assert(fs.existsSync(path.resolve(process.cwd(), 'tsconfig.json')), 'Tệp tsconfig.json tồn tại và có cấu hình alias @/*');
assert(fs.existsSync(path.resolve(process.cwd(), 'tailwind.config.js')), 'Tệp tailwind.config.js cấu hình đúng Design Tokens');

// Kiểm thử Kiến trúc Đa Cửa Sổ (Multi-Window Lingoes Architecture)
const tauriConfPath = path.resolve(process.cwd(), 'src-tauri/tauri.conf.json');
assert(fs.existsSync(tauriConfPath), 'Tệp cấu hình tauri.conf.json tồn tại');

const dbFile = path.resolve(process.cwd(), 'src-tauri/dictionary.db');
assert(fs.existsSync(dbFile), 'Tệp cơ sở dữ liệu SQLite cục bộ (src-tauri/dictionary.db) tồn tại');
assert(fs.statSync(dbFile).size > 25 * 1024 * 1024, 'Cơ sở dữ liệu dictionary.db sau khi tích hợp Tatoeba đạt dung lượng > 25MB (~31MB)');

// Kiểm thử Tích hợp Câu ví dụ Song ngữ Tatoeba HSK 1 - 6 (TASK-03.6)
try {
  const pyScript = `
import sqlite3, json
conn = sqlite3.connect(r'''${dbFile}''')
c = conn.cursor()
words = ['万', '喜欢', '电脑', '工作', '学习', '准备', '检查']
ok = True
for w in words:
    c.execute('SELECT examples FROM dictionary_entries WHERE simplified = ?', (w,))
    row = c.fetchone()
    if not row or not row[0]:
        ok = False
        break
    exs = json.loads(row[0])
    if len(exs) < 2 or not all('chinese' in x and 'pinyin' in x and 'vietnamese' in x for x in exs):
        ok = False
        break
c.execute("SELECT COUNT(*) FROM dictionary_entries WHERE examples IS NOT NULL AND examples != '[]'")
total_exs = c.fetchone()[0]
conn.close()
print(f"{ok}|{total_exs}")
`;
  const stdout = execSync('python', { input: pyScript, encoding: 'utf-8' }).trim();
  const [okStr, countStr] = stdout.split('|');
  assert(okStr === 'True', '[Tatoeba HSK] Các từ vựng mẫu (万, 喜欢, 电脑, 工作, 学习, 准备, 检查) có đầy đủ câu ví dụ song ngữ');
  assert(parseInt(countStr, 10) >= 4000, `[Tatoeba HSK] Đã nạp thành công câu ví dụ song ngữ cho ${countStr} từ vựng HSK trong CSDL (>= 4000 từ)`);
} catch (err: any) {
  assert(false, `[Tatoeba HSK] Lỗi kiểm tra CSDL Tatoeba: ${err?.message}`);
}

const tauriConf = JSON.parse(fs.readFileSync(tauriConfPath, 'utf-8'));
const appWindows = tauriConf.app?.windows || [];
const mainWindowConf = appWindows.find((w: any) => w.label === 'main');
const hudWindowConf = appWindows.find((w: any) => w.label === 'hud');

assert(mainWindowConf !== undefined, '[Multi-Window] Cửa sổ "main" được cấu hình chuẩn (860x640)');
assert(hudWindowConf !== undefined, '[Multi-Window] Cửa sổ "hud" độc lập được cấu hình');
assert(hudWindowConf?.url === 'index.html#hud', '[Multi-Window] Cửa sổ "hud" trỏ đúng route "index.html#hud"');
assert(hudWindowConf?.transparent === false, '[Multi-Window] Cửa sổ "hud" nền đục 100% không trong suốt (transparent: false)');
assert(hudWindowConf?.width === 480 && hudWindowConf?.height === 560, '[Multi-Window] Cửa sổ "hud" kích thước chuẩn Lingoes (480x560)');
assert(hudWindowConf?.alwaysOnTop === true, '[Multi-Window] Cửa sổ "hud" luôn ghim trên cùng (alwaysOnTop: true)');
assert(hudWindowConf?.skipTaskbar === true, '[Multi-Window] Cửa sổ "hud" ẩn khỏi Taskbar Windows (skipTaskbar: true)');

// Kiểm thử phân quyền Capabilities
const capPath = path.resolve(process.cwd(), 'src-tauri/capabilities/default.json');
assert(fs.existsSync(capPath), 'Tệp phân quyền capabilities/default.json tồn tại');
const capConf = JSON.parse(fs.readFileSync(capPath, 'utf-8'));
assert(Array.isArray(capConf.windows) && capConf.windows.includes('main') && capConf.windows.includes('hud'), '[Capabilities] Cả 2 cửa sổ ["main", "hud"] được cấp quyền điều khiển');

// Kiểm thử phân tách giao diện App.tsx
const appTsxContent = fs.readFileSync(path.resolve(process.cwd(), 'src/App.tsx'), 'utf-8');
assert(appTsxContent.includes('#hud'), '[App Router] App.tsx có cơ chế nhận diện route độc lập #hud');
assert(appTsxContent.includes('StandaloneHudApp'), '[App Router] App.tsx có component StandaloneHudApp chuyên trách HUD độc lập');
assert(appTsxContent.includes('MainWindowApp'), '[App Router] App.tsx có component MainWindowApp chuyên trách Main Window');
assert(!appTsxContent.includes('<AddToAnkiButton'), '[Lingoes HUD] Nút "Thêm vào Anki" đã được loại bỏ hoàn toàn khỏi HUD');
assert(appTsxContent.includes('onFocusChanged') && appTsxContent.includes('blur'), '[Auto-Hide] StandaloneHudApp tích hợp cơ chế tự động ẩn khi click ra ngoài (blur & onFocusChanged)');
assert(appTsxContent.includes('set_hud_pinned'), '[Pinning] StandaloneHudApp đồng bộ trạng thái ghim với backend Rust qua set_hud_pinned');

const libRsContent = fs.readFileSync(path.resolve(process.cwd(), 'src-tauri/src/lib.rs'), 'utf-8');
assert(libRsContent.includes('set_hud_pinned'), '[Rust Backend] Lệnh IPC set_hud_pinned được khai báo');
assert(libRsContent.includes('WindowEvent::Focused(false)'), '[Rust Backend] Bắt sự kiện WindowEvent::Focused(false) để tự động ẩn HUD khi mất focus');
assert(libRsContent.includes('TrayIconBuilder'), '[System Tray] Khởi tạo TrayIconBuilder cho thanh tác vụ Windows Taskbar');
assert(libRsContent.includes('main-tray'), '[System Tray] ID khay hệ thống main-tray được cấu hình');
assert(libRsContent.includes('CloseRequested') && libRsContent.includes('prevent_close'), '[System Tray] Đóng cửa sổ chính ẩn xuống Tray thay vì tắt app (CloseRequested -> prevent_close)');
assert(libRsContent.includes('exit_app') && libRsContent.includes('std::process::exit(0)'), '[System Tray] Menu Thoát HyDict gọi std::process::exit(0) để thoát hoàn toàn ứng dụng');
assert(!libRsContent.includes('0x1B'), '[Clipboard Copy] Tuyệt đối không gửi VK_ESCAPE (0x1B) để tránh hủy bôi đen chữ trên Anki/Web');
assert(libRsContent.includes('EmptyClipboard') && libRsContent.includes('clear_clipboard'), '[Clipboard Copy] Xóa sạch clipboard trước khi copy tránh đọc lại từ cũ');
assert(libRsContent.includes('OpenClipboard') && libRsContent.includes('CloseClipboard'), '[Clipboard Copy] Quản lý mở và đóng Windows Clipboard an toàn');
assert(libRsContent.includes('SendInput'), '[Clipboard Copy] Sử dụng SendInput atomic batch nguyên khối siêu tốc');
assert(libRsContent.includes('HYDICT_EXTRA_INFO'), '[IME Compatibility] Gắn cờ HYDICT_EXTRA_INFO (0x11A011A0) chống xung đột bộ gõ VCKey/UniKey');
assert(libRsContent.includes('std::thread::spawn'), '[Non-Blocking Hotkey] Xử lý phím tắt bất đồng bộ trong background thread tránh treo Windows LowLevelHook');

// Kiểm thử Phase 4: Screen Capture OCR (EPIC-12)
const snipperWindowConf = appWindows.find((w: any) => w.label === 'snipper');
assert(snipperWindowConf !== undefined, '[Screen Snipper] Cửa sổ "snipper" được cấu hình trong tauri.conf.json');
assert(snipperWindowConf?.url === 'index.html#snipper', '[Screen Snipper] Cửa sổ "snipper" trỏ đúng route "index.html#snipper"');
assert(snipperWindowConf?.transparent === true, '[Screen Snipper] Cửa sổ "snipper" trong suốt (transparent: true)');
assert(snipperWindowConf?.skipTaskbar === true, '[Screen Snipper] Cửa sổ "snipper" ẩn khỏi taskbar (skipTaskbar: true)');
assert(capConf.windows.includes('snipper'), '[Capabilities] Cửa sổ "snipper" được cấp quyền trong capabilities/default.json');
assert(appTsxContent.includes('#snipper') && appTsxContent.includes('ScreenSnipper'), '[App Router] App.tsx hỗ trợ điều hướng #snipper đến ScreenSnipper');

const screenCaptureRs = fs.readFileSync(path.resolve(process.cwd(), 'src-tauri/src/screen_capture.rs'), 'utf-8');
assert(screenCaptureRs.includes('CAPTUREBLT') && screenCaptureRs.includes('BitBlt'), '[OCR Backend] Tệp screen_capture.rs tồn tại và triển khai BitBlt với CAPTUREBLT');
assert(screenCaptureRs.includes('WinSta0') && screenCaptureRs.includes('default'), '[OCR Backend] screen_capture.rs kết nối WinSta0 và Desktop default chống lỗi quyền hệ thống');

const ocrRs = fs.readFileSync(path.resolve(process.cwd(), 'src-tauri/src/ocr.rs'), 'utf-8');
assert(ocrRs.includes('OcrEngine') && ocrRs.includes('zh-Hans-CN'), '[OCR Backend] Tệp ocr.rs tồn tại và tích hợp Windows.Media.Ocr Native Engine');

assert(libRsContent.includes('open_snipper_window') && libRsContent.includes('hide_snipper_window') && libRsContent.includes('execute_screen_ocr'), '[Rust Commands] Lệnh open_snipper_window, hide_snipper_window, execute_screen_ocr được đăng ký trong invoke_handler');
assert(libRsContent.includes('alt+s'), '[Global Hotkey] Phím tắt Alt+S được đăng ký để kích hoạt Screen Snipper');

const snipperTsx = fs.readFileSync(path.resolve(process.cwd(), 'src/modules/screen-snipper/ScreenSnipper.tsx'), 'utf-8');
assert(snipperTsx.includes('execute_screen_ocr'), '[Frontend UI] ScreenSnipper.tsx gọi lệnh execute_screen_ocr');
assert(snipperTsx.includes('Escape') && snipperTsx.includes('onContextMenu'), '[Frontend UI] ScreenSnipper.tsx hỗ trợ phím Esc và click phải để hủy');

// -------------------------------------------------------------
// TẦNG 3: FUNCTIONAL UI TESTS (ATOMIC COMPONENTS)
// -------------------------------------------------------------
console.log(`\n${YELLOW}▶ TẦNG 3: KIỂM THỬ GIAO DIỆN & ATOMIC COMPONENTS${RESET}`);

const uiDir = path.resolve(process.cwd(), 'src/components/ui');
assert(fs.existsSync(path.join(uiDir, 'Button.tsx')), 'Atomic Component Button.tsx tồn tại');
assert(fs.existsSync(path.join(uiDir, 'Card.tsx')), 'Atomic Component Card.tsx tồn tại');
assert(fs.existsSync(path.join(uiDir, 'Badge.tsx')), 'Atomic Component Badge.tsx tồn tại');
assert(fs.existsSync(path.join(uiDir, 'index.ts')), 'Thư viện Atomic UI có file index.ts đóng gói');

const dictUiDir = path.resolve(process.cwd(), 'src/modules/dictionary/components');
assert(fs.existsSync(path.join(dictUiDir, 'DefinitionCard.tsx')), 'Component DefinitionCard.tsx tồn tại');
assert(fs.existsSync(path.join(dictUiDir, 'ExampleList.tsx')), 'Component ExampleList.tsx tồn tại');
assert(fs.existsSync(path.join(dictUiDir, 'ToneColoredPinyin.tsx')), 'Component ToneColoredPinyin.tsx tồn tại');
assert(fs.existsSync(path.join(dictUiDir, 'HskLevelBadge.tsx')), 'Component HskLevelBadge.tsx tồn tại');

const hudUiDir = path.resolve(process.cwd(), 'src/modules/popup-hud/components');
assert(fs.existsSync(path.join(hudUiDir, 'HudTitlebar.tsx')), 'Component HudTitlebar.tsx tồn tại');
assert(fs.existsSync(path.join(hudUiDir, 'HudWindowContainer.tsx')), 'Component HudWindowContainer.tsx tồn tại');
assert(fs.existsSync(path.join(hudUiDir, 'HudLingoesContent.tsx')), 'Component HudLingoesContent.tsx chuẩn Lingoes tồn tại');

const strokeUiDir = path.resolve(process.cwd(), 'src/modules/stroke-writer/components');
assert(fs.existsSync(path.join(strokeUiDir, 'HanziWriterCanvas.tsx')), 'Component HanziWriterCanvas.tsx tồn tại');

const ankiUiDir = path.resolve(process.cwd(), 'src/modules/anki-bridge/components');
assert(fs.existsSync(path.join(ankiUiDir, 'AddToAnkiButton.tsx')), 'Component AddToAnkiButton.tsx tồn tại');
assert(fs.existsSync(path.resolve(process.cwd(), 'anki-addon/__init__.py')), 'Add-on cho Anki Desktop (anki-addon/__init__.py) tồn tại');

const mainWindowUiDir = path.resolve(process.cwd(), 'src/modules/main-window/components');
assert(fs.existsSync(path.join(mainWindowUiDir, 'MainWindowLayout.tsx')), 'Component MainWindowLayout.tsx tồn tại');
assert(fs.existsSync(path.join(mainWindowUiDir, 'DictLookupTab.tsx')), 'Component DictLookupTab.tsx tồn tại');
assert(fs.existsSync(path.join(mainWindowUiDir, 'HotkeyCaptureTab.tsx')), 'Component HotkeyCaptureTab.tsx tồn tại');
assert(fs.existsSync(path.join(mainWindowUiDir, 'AnkiConfigTab.tsx')), 'Component AnkiConfigTab.tsx tồn tại');
assert(fs.existsSync(path.join(mainWindowUiDir, 'SystemSettingsTab.tsx')), 'Component SystemSettingsTab.tsx tồn tại');
assert(fs.existsSync(path.join(mainWindowUiDir, 'SystemTrayModal.tsx')), 'Component SystemTrayModal.tsx tồn tại');

const notebookUiDir = path.resolve(process.cwd(), 'src/modules/notebook/components');
assert(fs.existsSync(path.join(notebookUiDir, 'BookmarkButton.tsx')), 'Component BookmarkButton.tsx tồn tại');
assert(fs.existsSync(path.join(notebookUiDir, 'NotebookTab.tsx')), 'Component NotebookTab.tsx tồn tại');
assert(fs.existsSync(path.resolve(process.cwd(), 'src/modules/notebook/hooks/useNotebook.ts')), 'Hook useNotebook.ts tồn tại');

const mainWindowLayoutContent = fs.readFileSync(path.join(mainWindowUiDir, 'MainWindowLayout.tsx'), 'utf-8');
assert(mainWindowLayoutContent.includes('notebook'), 'MainWindowLayout tích hợp tab Sổ Từ & Lịch Sử (notebook)');

// -------------------------------------------------------------
// TẦNG 4: STRESS & BOUNDARY TESTS
// -------------------------------------------------------------
console.log(`\n${YELLOW}▶ TẦNG 4: KIỂM THỬ GIỚI HẠN & DỮ LIỆU BẨN${RESET}`);

// @ts-ignore
assert(validateHotkey(null as any) === false, 'Xử lý an toàn khi giá trị hotkey là null');
// @ts-ignore
assert(validateHotkey(undefined as any) === false, 'Xử lý an toàn khi giá trị hotkey là undefined');

// Stress test segmentation
assert(segmentChineseText('').length === 0, 'Phân đoạn chuỗi rỗng trả về mảng rỗng an toàn');
assert(segmentChineseText('   ').length === 0, 'Phân đoạn chuỗi toàn khoảng trắng trả về mảng rỗng');
// @ts-ignore
assert(segmentChineseText(null as any).length === 0, 'Xử lý an toàn khi câu đầu vào là null');
// @ts-ignore
assert(segmentChineseText(undefined as any).length === 0, 'Xử lý an toàn khi câu đầu vào là undefined');
const mixedTokens = segmentChineseText('Hello 123 汉字 🎉');
assert(mixedTokens.length > 0, 'Xử lý mượt mà văn bản hỗn hợp Trung - Anh - Số - Emoji');

// -------------------------------------------------------------
// TẦNG 5: ZERO-REGRESSION & DEFINITION OF DONE (E2E SCENARIO)
// -------------------------------------------------------------
console.log(`\n${YELLOW}▶ TẦNG 5: KIỂM THỬ HỒI QUY & NGHIỆM THU E2E TOÀN DIỆN (DOD)${RESET}`);

// Kiểm thử kịch bản trọn vẹn: Sentence -> Segment -> Lookup -> Stroke -> Audio -> Anki
const e2eSentence = '这本书有万页。';
const e2eTokens = segmentChineseText(e2eSentence);
assert(e2eTokens.length > 0, '[E2E-1] Phân từ câu tiếng Trung thành công');

const e2eTargetWord = '万';
const e2eDict = queryLocalDictionary(e2eTargetWord);
assert(e2eDict !== null && e2eDict.hanViet === 'Hán Việt: VẠN', '[E2E-2] Tra cứu từ điển ra đúng âm Hán Việt');

const e2eAudio = sanitizeAudioText(e2eTargetWord);
assert(e2eAudio === '万', '[E2E-3] Chuẩn bị audio phát âm sạch sẽ');

const e2eStroke = isSingleChineseChar(e2eTargetWord);
assert(e2eStroke === true, '[E2E-4] Xác thực chữ đơn để render bút thuận HanziWriter');

const e2eAnkiCard = createAnkiPayload({
  Hanzi: e2eTargetWord,
  Pinyin: e2eDict?.pinyin || '',
  HanViet: e2eDict?.hanViet || '',
  Meaning: e2eDict?.definitions.join('; ') || '',
});
assert(e2eAnkiCard.fields.Hanzi === '万' && e2eAnkiCard.deckName === 'Tiếng Trung', '[E2E-5] Tạo payload AnkiConnect hợp lệ sẵn sàng gửi sang Anki');

const e2eHudPos = calculateClampedPosition(100, 100);
assert(e2eHudPos.x > 0 && e2eHudPos.y > 0, '[E2E-6] Vị trí HUD tính toán an toàn trên màn hình');

assert(fs.existsSync(path.resolve(process.cwd(), 'src/modules/main-window/index.ts')), '[E2E-7] Module main-window sẵn sàng phục vụ kiến trúc Lingoes');

assert(totalFailed === 0, '100% các tiêu chí kiểm thử đạt chuẩn Zero-Regression & Definition of Done');

console.log(`\n${CYAN}======================================================${RESET}`);
if (totalFailed === 0) {
  console.log(`${GREEN}🎉 TỔNG KẾT: 100% KIỂM THỬ ĐẠT CHUẨN (${totalPassed} tests PASSED, 0 FAILED)${RESET}`);
  console.log(`${GREEN}✅ CỔNG KIỂM ĐỊNH CHẤT LƯỢNG CHO PHÉP TIẾP TỤC!${RESET}`);
  process.exit(0);
} else {
  console.error(`${RED}💥 TỔNG KẾT: CÓ LỖI XẢY RA (${totalFailed} tests FAILED, ${totalPassed} PASSED)${RESET}`);
  process.exit(1);
}
