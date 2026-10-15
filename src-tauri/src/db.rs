use rusqlite::{params, Connection, Result};
use serde::{Deserialize, Serialize};
use std::sync::Mutex;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExampleSentence {
    pub chinese: String,
    pub pinyin: String,
    pub vietnamese: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DictionaryEntry {
    pub simplified: String,
    pub traditional: Option<String>,
    pub pinyin: String,
    pub han_viet: String,
    pub pos: Option<String>,
    pub definitions: Vec<String>,
    pub examples: Vec<ExampleSentence>,
}

pub struct DbState {
    pub conn: Mutex<Connection>,
}

pub fn init_db() -> Result<Connection> {
    // 1. Kiểm tra các đường dẫn có thể chứa tệp dictionary.db (122.596 từ vựng)
    let candidates = [
        // Cạnh file thực thi .exe (Production / Release)
        std::env::current_exe()
            .ok()
            .and_then(|p| p.parent().map(|d| d.join("dictionary.db"))),
        // Thư mục làm việc hiện tại
        Some(std::path::PathBuf::from("dictionary.db")),
        // Thư mục src-tauri (Development)
        Some(std::path::PathBuf::from("src-tauri/dictionary.db")),
        // Thư mục gốc dự án khi chạy target debug
        std::env::current_exe()
            .ok()
            .and_then(|p| p.parent().and_then(|p2| p2.parent()).and_then(|p3| p3.parent()).map(|d| d.join("dictionary.db"))),
    ];

    for candidate in candidates.into_iter().flatten() {
        if candidate.exists() {
            let conn = Connection::open_with_flags(
                &candidate,
                rusqlite::OpenFlags::SQLITE_OPEN_READ_WRITE | rusqlite::OpenFlags::SQLITE_OPEN_CREATE,
            )?;
            let _ = conn.execute_batch("PRAGMA journal_mode = WAL; PRAGMA synchronous = NORMAL;");
            let _ = conn.execute_batch("
                CREATE INDEX IF NOT EXISTS idx_pinyin_clean ON dictionary_entries(pinyin_clean);
                CREATE INDEX IF NOT EXISTS idx_pinyin_flat ON dictionary_entries(pinyin_flat);
            ");
            return Ok(conn);
        }
    }

    // Fallback: nếu không tìm thấy file dictionary.db ngoài đĩa, tạo in-memory và seed dữ liệu dự phòng
    let conn = Connection::open_in_memory()?;

    conn.execute_batch(
        "
        CREATE TABLE IF NOT EXISTS dictionary_entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            simplified TEXT NOT NULL UNIQUE,
            traditional TEXT,
            pinyin TEXT NOT NULL,
            pinyin_clean TEXT,
            pinyin_flat TEXT,
            han_viet TEXT NOT NULL,
            pos TEXT,
            definitions TEXT NOT NULL,
            examples TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_simplified ON dictionary_entries(simplified);
        CREATE INDEX IF NOT EXISTS idx_han_viet ON dictionary_entries(han_viet);
        CREATE INDEX IF NOT EXISTS idx_pinyin_clean ON dictionary_entries(pinyin_clean);
        CREATE INDEX IF NOT EXISTS idx_pinyin_flat ON dictionary_entries(pinyin_flat);
        ",
    )?;

    seed_core_data(&conn)?;

    Ok(conn)
}

fn seed_core_data(conn: &Connection) -> Result<()> {
    let seed_entries = vec![
        (
            "本",
            Some("本"),
            "[ běn ]",
            "BỔN / BẢN",
            Some("Lượng từ / Danh từ"),
            r#"["Cuốn, quyển (lượng từ dùng cho sách, vở, tài liệu: 一本书 - một cuốn sách).", "Gốc rễ, cội nguồn; cơ bản, căn bản (bản tính, căn bản).", "Bản thân, của mình (bản nhân, bản quốc)."]"#,
            r#"[
                {"chinese": "我买了一本书。", "pinyin": "[ wǒ mǎi le yī běn shū ]", "vietnamese": "Tôi đã mua một cuốn sách."},
                {"chinese": "这本书很有用。", "pinyin": "[ zhè běn shū hěn yǒu yòng ]", "vietnamese": "Quyển sách này rất hữu ích."}
            ]"#,
        ),
        (
            "有",
            None,
            "[ yǒu ]",
            "HỮU",
            Some("Động từ"),
            r#"["Có; sở hữu, chiếm giữ (có tiền, có nhà).", "Tồn tại, hiện diện (ngăn kéo có sách).", "Một số, có một ít (đại từ: 有人 - có người)."]"#,
            r#"[
                {"chinese": "我有一本汉语词典。", "pinyin": "[ wǒ yǒu yī běn hàn yǔ cí diǎn ]", "vietnamese": "Tôi có một cuốn từ điển tiếng Hán."},
                {"chinese": "这里有人吗？", "pinyin": "[ zhè lǐ yǒu rén ma ]", "vietnamese": "Ở đây có ai không?"}
            ]"#,
        ),
        (
            "万",
            Some("萬"),
            "[ wàn ]",
            "VẠN",
            Some("Số từ (num)"),
            r#"["Muôn, vạn; mười nghìn (10,000).", "Rất nhiều, vô số; chỉ một lượng cực lớn (vạn tuế, vạn vật).", "Tuyệt đối, nhất thiết (vạn vạn bất khả)."]"#,
            r#"[
                {"chinese": "这本书有万页。", "pinyin": "[ zhè běn shū yǒu wàn yè ]", "vietnamese": "Cuốn sách này có vạn trang."},
                {"chinese": "万里长城十分雄伟。", "pinyin": "[ wàn lǐ cháng chéng shí fēn xióng wěi ]", "vietnamese": "Vạn Lý Trường Thành vô cùng hùng vĩ."}
            ]"#,
        ),
        (
            "这本书",
            None,
            "[ zhè běn shū ]",
            "GIÁ BỔN THƯ",
            Some("Cụm danh từ"),
            r#"["Cuốn sách này, quyển sách này (Đại từ 这 + Lượng từ 本 + Danh từ 书)."]"#,
            r#"[
                {"chinese": "这本书很有意思。", "pinyin": "[ zhè běn shū hěn yǒu yì si ]", "vietnamese": "Quyển sách này rất hay."}
            ]"#,
        ),
        (
            "这",
            Some("這"),
            "[ zhè ]",
            "GIÁ",
            Some("Đại từ chỉ thị"),
            r#"["Đây, này (chỉ người hoặc sự vật ở cự ly gần).", "Bây giờ, lúc này (phó từ: 这就去)."]"#,
            r#"[
                {"chinese": "这是我的中文老师。", "pinyin": "[ zhè shì wǒ de zhōng wén lǎo shī ]", "vietnamese": "Đây là giáo viên tiếng Trung của tôi."}
            ]"#,
        ),
        (
            "书",
            Some("書"),
            "[ shū ]",
            "THƯ",
            Some("Danh từ"),
            r#"["Sách, vở, tác phẩm.", "Thư từ, thư tín.", "Viết, ghi chép (động từ trong văn ngôn)."]"#,
            r#"[
                {"chinese": "他在图书馆看书。", "pinyin": "[ tā zài tú shū guǎn kàn shū ]", "vietnamese": "Anh ấy đọc sách trong thư viện."}
            ]"#,
        ),
        (
            "页",
            Some("頁"),
            "[ yè ]",
            "DIỆP",
            Some("Lượng từ"),
            r#"["Trang (trang sách, trang giấy, trang web).", "Tờ giấy, mảnh lá (nghĩa cổ)."]"#,
            r#"[
                {"chinese": "请翻到第五十页。", "pinyin": "[ qǐng fān dào dì wǔ shí yè ]", "vietnamese": "Xin hãy lật đến trang số 50."}
            ]"#,
        ),
        (
            "万里长城",
            Some("萬里長城"),
            "[ wàn lǐ cháng chéng ]",
            "VẠN LÝ TRƯỜNG THÀNH",
            Some("Danh từ riêng"),
            r#"["Vạn Lý Trường Thành (kỳ quan kiến trúc phòng thủ cổ đại nổi tiếng của Trung Quốc).", "Thành trì vững chắc kiên cố."]"#,
            r#"[
                {"chinese": "不到长城非好汉。", "pinyin": "[ bù dào cháng chéng fēi hǎo hàn ]", "vietnamese": "Bất đáo Trường Thành phi hảo hán."}
            ]"#,
        ),
        (
            "十分",
            None,
            "[ shí fēn ]",
            "THẬP PHÂN",
            Some("Phó từ"),
            r#"["Vô cùng, rất, hết sức (đồng nghĩa: 非常, 极其).", "Mười phần, toàn bộ, đầy đủ."]"#,
            r#"[
                {"chinese": "大家十分高兴。", "pinyin": "[ dà jiā shí fēn gāo xìng ]", "vietnamese": "Mọi người vô cùng vui mừng."}
            ]"#,
        ),
        (
            "雄伟",
            Some("雄偉"),
            "[ xióng wěi ]",
            "HÙNG VĨ",
            Some("Tính từ"),
            r#"["Hùng vĩ, đồ sộ, nguy nga tráng lệ (thường miêu tả núi non, kiến trúc)."]"#,
            r#"[
                {"chinese": "气势雄伟。", "pinyin": "[ qì shì xióng wěi ]", "vietnamese": "Khí thế hùng vĩ."}
            ]"#,
        ),
        (
            "汉语",
            Some("漢語"),
            "[ hàn yǔ ]",
            "HÁN NGỮ",
            Some("Danh từ"),
            r#"["Tiếng Hán, tiếng Trung Quốc.", "Ngôn ngữ của dân tộc Hán."]"#,
            r#"[
                {"chinese": "汉语不难学。", "pinyin": "[ hàn yǔ bù nán xué ]", "vietnamese": "Tiếng Hán không khó học."}
            ]"#,
        ),
        (
            "是",
            None,
            "[ shì ]",
            "THỊ",
            Some("Động từ hệ từ"),
            r#"["Là (dùng để phán đoán: 这是书 - đây là sách).", "Đúng, phải (đối lập với phi / sai: 是非 - đúng sai).", "Đồng ý, vâng, dạ."]"#,
            r#"[
                {"chinese": "他是我的中国朋友。", "pinyin": "[ tā shì wǒ de zhōng guó péng you ]", "vietnamese": "Anh ấy là bạn người Trung Quốc của tôi."}
            ]"#,
        ),
        (
            "不是",
            None,
            "[ bù shì ]",
            "BẤT THỊ",
            Some("Động từ"),
            r#"["Không phải; không là.", "Lỗi lầm, khuyết điểm (陪不是 - nhận lỗi)."]"#,
            r#"[
                {"chinese": "这不是我的书。", "pinyin": "[ zhè bú shì wǒ de shū ]", "vietnamese": "Đây không phải là sách của tôi."}
            ]"#,
        ),
        (
            "在",
            None,
            "[ zài ]",
            "TẠI",
            Some("Giới từ / Động từ"),
            r#"["Ở, tại (chỉ nơi chốn: 在家 - ở nhà).", "Đang (phó từ chỉ hành động tiếp diễn: 在看书 - đang đọc sách).", "Tồn tại, hiện diện."]"#,
            r#"[
                {"chinese": "他在河内工作。", "pinyin": "[ tā zài hé nèi gōng zuò ]", "vietnamese": "Anh ấy làm việc ở Hà Nội."}
            ]"#,
        ),
        (
            "家乡",
            Some("家鄉"),
            "[ jiā xiāng ]",
            "GIA HƯƠNG",
            Some("Danh từ"),
            r#"["Quê hương, quê nhà, xứ sở sinh thành."]"#,
            r#"[
                {"chinese": "我的家乡非常美丽。", "pinyin": "[ wǒ de jiā xiāng fēi cháng měi lì ]", "vietnamese": "Quê hương của tôi rất đẹp."}
            ]"#,
        ),
        (
            "市",
            None,
            "[ shì ]",
            "THỊ",
            Some("Danh từ"),
            r#"["Thành phố (đơn vị hành chính: 胡志明市 - Thành phố Hồ Chí Minh).", "Chợ, nơi mua bán (thị trường)."]"#,
            r#"[
                {"chinese": "这个市有很多工厂。", "pinyin": "[ zhè ge shì yǒu hěn duō gōng chǎng ]", "vietnamese": "Thành phố này có rất nhiều nhà máy."}
            ]"#,
        ),
        (
            "省",
            None,
            "[ shěng ]",
            "TỈNH",
            Some("Danh từ / Động từ"),
            r#"["Tỉnh (đơn vị hành chính).", "Tiết kiệm, giảm bớt (省钱 - tiết kiệm tiền).", "Xem xét lại mình (tự tỉnh, phát âm xǐng)."]"#,
            r#"[
                {"chinese": "他在同奈省上班。", "pinyin": "[ tā zài tóng nài shěng shàng bān ]", "vietnamese": "Anh ấy đi làm ở tỉnh Đồng Nai."}
            ]"#,
        ),
        (
            "现在",
            Some("現在"),
            "[ xiàn zài ]",
            "HIỆN TẠI",
            Some("Danh từ thời gian"),
            r#"["Bây giờ, hiện tại, thời điểm hiện nay."]"#,
            r#"[
                {"chinese": "现在几点了？", "pinyin": "[ xiàn zài jǐ diǎn le ]", "vietnamese": "Bây giờ là mấy giờ rồi?"}
            ]"#,
        ),
        (
            "住",
            None,
            "[ zhù ]",
            "TRÚ",
            Some("Động từ"),
            r#"["Ở, cư trú, sinh sống (居住).", "Dừng lại, ngừng (停住)."]"#,
            r#"[
                {"chinese": "你住在哪儿？", "pinyin": "[ nǐ zhù zài nǎr ]", "vietnamese": "Bạn sống ở đâu?"}
            ]"#,
        ),
        (
            "于",
            Some("於"),
            "[ yú ]",
            "VU / Ư",
            Some("Giới từ"),
            r#"["Ở, tại, vào lúc (chỉ thời gian, địa điểm: 出生于1995年 - sinh năm 1995).", "Đối với; so với (lớn hơn, cao hơn)."]"#,
            r#"[
                {"chinese": "他生于河内。", "pinyin": "[ tā shēng yú hé nèi ]", "vietnamese": "Anh ấy sinh ra ở Hà Nội."}
            ]"#,
        ),
        (
            "年",
            None,
            "[ nián ]",
            "NIÊN",
            Some("Danh từ"),
            r#"["Năm (năm tháng, niên đại: 2026年).", "Tuổi tác; Tết (quá niên)."]"#,
            r#"[
                {"chinese": "新的一年。", "pinyin": "[ xīn de yī nián ]", "vietnamese": "Một năm mới."}
            ]"#,
        ),
        (
            "出生",
            None,
            "[ chū shēng ]",
            "XUẤT SINH",
            Some("Động từ"),
            r#"["Sinh ra, ra đời."]"#,
            r#"[
                {"chinese": "他在越南出生。", "pinyin": "[ tā zài yuè nán chū shēng ]", "vietnamese": "Anh ấy sinh ra ở Việt Nam."}
            ]"#,
        ),
        (
            "生日",
            None,
            "[ shēng rì ]",
            "SINH NHẬT",
            Some("Danh từ"),
            r#"["Ngày sinh, sinh nhật."]"#,
            r#"[
                {"chinese": "祝你生日快乐！", "pinyin": "[ zhù nǐ shēng rì kuài lè ]", "vietnamese": "Chúc bạn sinh nhật vui vẻ!"}
            ]"#,
        ),
        (
            "月",
            None,
            "[ yuè ]",
            "NGUYỆT",
            Some("Danh từ"),
            r#"["Tháng (nhất nguyệt, nhị nguyệt).", "Mặt trăng (nguyệt quang)."]"#,
            r#"[
                {"chinese": "十月的天气很凉爽。", "pinyin": "[ shí yuè de tiān qì hěn liáng shuǎng ]", "vietnamese": "Thời tiết tháng mười rất mát mẻ."}
            ]"#,
        ),
        (
            "号",
            Some("號"),
            "[ hào ]",
            "HÀO / HIỆU",
            Some("Danh từ / Lượng từ"),
            r#"["Ngày (trong ngày tháng: 12号 - ngày 12).", "Số, mã số, kích cỡ (hào mã)."]"#,
            r#"[
                {"chinese": "今天是五号。", "pinyin": "[ jīn tiān shì wǔ hào ]", "vietnamese": "Hôm nay là ngày mùng 5."}
            ]"#,
        ),
        (
            "虽",
            Some("雖"),
            "[ suī ]",
            "TUY",
            Some("Liên từ"),
            r#"["Tuy, dẫu rằng (thường đi với 虽然 - tuy nhiên)."]"#,
            r#"[
                {"chinese": "虽小但全。", "pinyin": "[ suī xiǎo dàn quán ]", "vietnamese": "Tuy nhỏ nhưng đầy đủ."}
            ]"#,
        ),
        (
            "岁",
            Some("歲"),
            "[ suì ]",
            "TUẾ",
            Some("Lượng từ"),
            r#"["Tuổi (chỉ tuổi tác của con người: 二十岁 - 20 tuổi).", "Năm (tuế nguyệt)."]"#,
            r#"[
                {"chinese": "他今年二十岁。", "pinyin": "[ tā jīn nián èr shí suì ]", "vietnamese": "Năm nay anh ấy hai mươi tuổi."}
            ]"#,
        ),
        (
            "了",
            None,
            "[ le / liǎo ]",
            "LIỄU",
            Some("Trợ từ"),
            r#"["Rồi (trợ từ ngữ khí chỉ sự việc đã hoàn thành hoặc có sự biến đổi).", "Hiểu rõ (liễu giải - 了解)."]"#,
            r#"[
                {"chinese": "吃饭了。", "pinyin": "[ chī fàn le ]", "vietnamese": "Ăn cơm rồi."}
            ]"#,
        ),
        (
            "仁泽坊",
            Some("仁澤坊"),
            "[ rén zé fāng ]",
            "NHƠN TRẠCH PHƯỜNG",
            Some("Địa danh"),
            r#"["Phường Nhơn Trạch (đơn vị hành chính địa phương)."]"#,
            r#"[
                {"chinese": "仁泽坊是一个工业区。", "pinyin": "[ rén zé fāng shì yí gè gōng yè qū ]", "vietnamese": "Phường Nhơn Trạch là một khu công nghiệp."}
            ]"#,
        ),
        (
            "工业区",
            Some("工業區"),
            "[ gōng yè qū ]",
            "CÔNG NGHIỆP KHU",
            Some("Danh từ"),
            r#"["Khu công nghiệp, vùng tập trung các nhà máy xí nghiệp sản xuất."]"#,
            r#"[
                {"chinese": "这个工业区有很多外资企业。", "pinyin": "[ zhè ge gōng yè qū yǒu hěn duō wài zī qǐ yè ]", "vietnamese": "Khu công nghiệp này có rất nhiều doanh nghiệp có vốn đầu tư nước ngoài."}
            ]"#,
        ),
        (
            "人",
            None,
            "[ rén ]",
            "NHÂN",
            Some("Danh từ"),
            r#"["Người, con người, nhân loại."]"#,
            r#"[
                {"chinese": "大家都是好人。", "pinyin": "[ dà jiā dōu shì hǎo rén ]", "vietnamese": "Mọi người đều là người tốt."}
            ]"#,
        ),
        (
            "大",
            None,
            "[ dà ]",
            "ĐẠI",
            Some("Tính từ"),
            r#"["To, lớn, vĩ đại (đối lập với tiểu / nhỏ)."]"#,
            r#"[
                {"chinese": "这个苹果很大。", "pinyin": "[ zhè ge píng guǒ hěn dà ]", "vietnamese": "Quả táo này rất to."}
            ]"#,
        ),
        (
            "小",
            None,
            "[ xiǎo ]",
            "TIỂU",
            Some("Tính từ"),
            r#"["Nhỏ, bé, ít tuổi (đối lập với đại / lớn)."]"#,
            r#"[
                {"chinese": "一只小猫。", "pinyin": "[ yì zhī xiǎo māo ]", "vietnamese": "Một con mèo nhỏ."}
            ]"#,
        ),
        (
            "好",
            None,
            "[ hǎo ]",
            "HẢO",
            Some("Tính từ"),
            r#"["Tốt, đẹp, hay, thân thiện.", "Khỏe (你好 - bạn có khỏe không)."]"#,
            r#"[
                {"chinese": "你好！", "pinyin": "[ nǐ hǎo ]", "vietnamese": "Xin chào!"}
            ]"#,
        ),
        (
            "学",
            Some("學"),
            "[ xué ]",
            "HỌC",
            Some("Động từ"),
            r#"["Học, học tập, bắt chước.", "Môn học, ngành khoa học (học vấn)."]"#,
            r#"[
                {"chinese": "学习汉语。", "pinyin": "[ xué xí hàn yǔ ]", "vietnamese": "Học tiếng Hán."}
            ]"#,
        ),
    ];

    for (sim, trad, py, hv, pos, defs, exs) in seed_entries {
        let py_clean = clean_pinyin_rust(py);
        let py_flat = py_clean.replace(' ', "");
        conn.execute(
            "INSERT OR REPLACE INTO dictionary_entries (simplified, traditional, pinyin, pinyin_clean, pinyin_flat, han_viet, pos, definitions, examples)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
            params![sim, trad, py, py_clean, py_flat, hv, pos, defs, exs],
        )?;
    }

    Ok(())
}

pub fn clean_pinyin_rust(p: &str) -> String {
    let lower = p.to_lowercase();
    let mut result = String::with_capacity(lower.len());
    for ch in lower.chars() {
        match ch {
            'ā' | 'á' | 'ǎ' | 'à' => result.push('a'),
            'ē' | 'é' | 'ě' | 'è' => result.push('e'),
            'ī' | 'í' | 'ǐ' | 'ì' => result.push('i'),
            'ō' | 'ó' | 'ǒ' | 'ò' => result.push('o'),
            'ū' | 'ú' | 'ǔ' | 'ù' => result.push('u'),
            'ǖ' | 'ǘ' | 'ǚ' | 'ǜ' | 'ü' => result.push('v'),
            '[' | ']' | '1'..='5' => (),
            c if c.is_alphanumeric() || c == ' ' => result.push(c),
            _ => (),
        }
    }
    result.split_whitespace().collect::<Vec<_>>().join(" ")
}

pub fn lookup_word(conn: &Connection, word: &str) -> Option<DictionaryEntry> {
    let clean_word = word
        .trim()
        .trim_matches(|c: char| c == '\u{feff}' || c == '\u{200b}' || c == '\u{200e}' || c == '\u{200f}');
    if clean_word.is_empty() {
        return None;
    }

    let mut stmt = conn
        .prepare(
            "SELECT simplified, traditional, pinyin, han_viet, pos, definitions, examples
             FROM dictionary_entries WHERE simplified = ?1 OR traditional = ?1 LIMIT 1",
        )
        .ok()?;

    let direct_match = stmt
        .query_row(params![clean_word], |row| {
            let sim: String = row.get(0)?;
            let trad: Option<String> = row.get(1)?;
            let py: String = row.get(2)?;
            let hv: String = row.get(3)?;
            let pos: Option<String> = row.get(4)?;
            let defs_raw: String = row.get(5)?;
            let exs_raw: String = row.get(6)?;

            let defs: Vec<String> = serde_json::from_str(&defs_raw).unwrap_or_else(|_| vec![defs_raw]);
            let exs: Vec<ExampleSentence> = serde_json::from_str(&exs_raw).unwrap_or_default();

            Ok(DictionaryEntry {
                simplified: sim,
                traditional: trad,
                pinyin: py,
                han_viet: hv,
                pos,
                definitions: defs,
                examples: exs,
            })
        })
        .ok();

    if direct_match.is_some() {
        return direct_match;
    }

    // Fallback: Phân tích chi tiết từng chữ đơn nếu là cụm từ ghép nhiều ký tự
    if clean_word.chars().count() > 1 {
        let mut sub_pinyins = Vec::new();
        let mut sub_hanviets = Vec::new();
        let mut breakdown_defs = Vec::new();
        let mut found_count = 0;

        for ch in clean_word.chars() {
            let ch_str = ch.to_string();
            let sub_match = stmt
                .query_row(params![ch_str], |row| {
                    let py: String = row.get(2)?;
                    let hv: String = row.get(3)?;
                    let defs_raw: String = row.get(5)?;
                    let defs: Vec<String> = serde_json::from_str(&defs_raw).unwrap_or_else(|_| vec![defs_raw]);
                    Ok((py, hv, defs))
                })
                .ok();

            if let Some((py, hv, defs)) = sub_match {
                found_count += 1;
                let clean_py = py.trim_matches(|c| c == '[' || c == ']' || c == ' ').to_string();
                sub_pinyins.push(clean_py);

                let clean_hv = hv.replace("Hán Việt:", "").trim().to_string();
                sub_hanviets.push(clean_hv);

                let first_def = defs.first().cloned().unwrap_or_default();
                breakdown_defs.push(format!("{}: {}", ch, first_def));
            } else {
                sub_pinyins.push("?".to_string());
                sub_hanviets.push(ch.to_string());
                breakdown_defs.push(format!("{}: (Chưa có giải nghĩa)", ch));
            }
        }

        if found_count > 0 {
            let combined_pinyin = format!("[ {} ]", sub_pinyins.join(" "));
            let combined_hanviet = format!("Hán Việt: {}", sub_hanviets.join(" "));
            breakdown_defs.insert(0, format!("Cụm từ ghép cấu thành từ {} chữ Hán:", clean_word.chars().count()));

            return Some(DictionaryEntry {
                simplified: clean_word.to_string(),
                traditional: None,
                pinyin: combined_pinyin,
                han_viet: combined_hanviet,
                pos: Some("Cụm từ ghép".to_string()),
                definitions: breakdown_defs,
                examples: Vec::new(),
            });
        }
    }

    None
}

#[tauri::command]
pub fn lookup_dictionary(state: tauri::State<DbState>, word: String) -> Option<DictionaryEntry> {
    let conn = state.conn.lock().unwrap();
    lookup_word(&conn, &word)
}

pub fn lookup_reverse_vietnamese(conn: &Connection, query: &str, limit: usize) -> Vec<DictionaryEntry> {
    let clean_query = query.trim();
    if clean_query.is_empty() {
        return Vec::new();
    }

    let term_upper = format!("%{}%", clean_query.to_uppercase());
    let exact_def = format!("%\"{}\"%", clean_query.to_lowercase());
    let starts_def = format!("%\"{}%", clean_query.to_lowercase());
    let contains_def = format!("%{}%", clean_query.to_lowercase());

    let mut stmt = match conn.prepare(
        "SELECT simplified, traditional, pinyin, han_viet, pos, definitions, examples
         FROM dictionary_entries
         WHERE han_viet LIKE ?1 OR definitions LIKE ?2
         ORDER BY 
             CASE 
                 WHEN han_viet LIKE ?1 THEN 1
                 WHEN definitions LIKE ?3 THEN 2
                 WHEN definitions LIKE ?4 THEN 3
                 ELSE 4
             END,
             length(simplified) ASC
         LIMIT ?5"
    ) {
        Ok(s) => s,
        Err(_) => return Vec::new(),
    };

    let rows = stmt.query_map(params![term_upper, contains_def, exact_def, starts_def, limit], |row| {
        let sim: String = row.get(0)?;
        let trad: Option<String> = row.get(1)?;
        let py: String = row.get(2)?;
        let hv: String = row.get(3)?;
        let pos: Option<String> = row.get(4)?;
        let defs_raw: String = row.get(5)?;
        let exs_raw: String = row.get(6)?;

        let defs: Vec<String> = serde_json::from_str(&defs_raw).unwrap_or_else(|_| vec![defs_raw]);
        let exs: Vec<ExampleSentence> = serde_json::from_str(&exs_raw).unwrap_or_default();

        Ok(DictionaryEntry {
            simplified: sim,
            traditional: trad,
            pinyin: py,
            han_viet: hv,
            pos,
            definitions: defs,
            examples: exs,
        })
    });

    match rows {
        Ok(r) => r.filter_map(|e| e.ok()).collect(),
        Err(_) => Vec::new(),
    }
}

pub fn lookup_by_pinyin_tone_free(conn: &Connection, query: &str, limit: usize) -> Vec<DictionaryEntry> {
    let clean_query = clean_pinyin_rust(query);
    let flat_query = clean_query.replace(' ', "");
    if flat_query.is_empty() {
        return Vec::new();
    }

    let flat_prefix = format!("{}%", flat_query);
    let clean_prefix = format!("{}%", clean_query);

    let mut stmt = match conn.prepare(
        "SELECT simplified, traditional, pinyin, han_viet, pos, definitions, examples
         FROM dictionary_entries
         WHERE pinyin_flat = ?1 OR pinyin_flat LIKE ?2 OR pinyin_clean = ?3 OR pinyin_clean LIKE ?4
         ORDER BY 
             CASE 
                 WHEN pinyin_flat = ?1 THEN 1
                 WHEN pinyin_clean = ?3 THEN 2
                 WHEN pinyin_flat LIKE ?2 THEN 3
                 ELSE 4
             END,
             length(simplified) ASC
         LIMIT ?5"
    ) {
        Ok(s) => s,
        Err(_) => return Vec::new(),
    };

    let rows = stmt.query_map(params![flat_query, flat_prefix, clean_query, clean_prefix, limit], |row| {
        let sim: String = row.get(0)?;
        let trad: Option<String> = row.get(1)?;
        let py: String = row.get(2)?;
        let hv: String = row.get(3)?;
        let pos: Option<String> = row.get(4)?;
        let defs_raw: String = row.get(5)?;
        let exs_raw: String = row.get(6)?;

        let defs: Vec<String> = serde_json::from_str(&defs_raw).unwrap_or_else(|_| vec![defs_raw]);
        let exs: Vec<ExampleSentence> = serde_json::from_str(&exs_raw).unwrap_or_default();

        Ok(DictionaryEntry {
            simplified: sim,
            traditional: trad,
            pinyin: py,
            han_viet: hv,
            pos,
            definitions: defs,
            examples: exs,
        })
    });

    match rows {
        Ok(r) => r.filter_map(|e| e.ok()).collect(),
        Err(_) => Vec::new(),
    }
}

#[tauri::command]
pub fn search_dictionary_multi(
    state: tauri::State<DbState>,
    query: String,
    query_type: Option<String>,
) -> Vec<DictionaryEntry> {
    let conn = state.conn.lock().unwrap();
    let q = query.trim();
    if q.is_empty() {
        return Vec::new();
    }

    let is_chinese = q.chars().any(|c| ('\u{4e00}'..='\u{9fa5}').contains(&c));

    match query_type.as_deref() {
        Some("chinese") => {
            let mut results = Vec::new();
            if let Some(entry) = lookup_word(&conn, q) {
                results.push(entry);
            }
            if let Ok(mut stmt) = conn.prepare(
                "SELECT simplified, traditional, pinyin, han_viet, pos, definitions, examples
                 FROM dictionary_entries WHERE simplified LIKE ?1 AND simplified != ?2 LIMIT 9"
            ) {
                let pattern = format!("{}%", q);
                if let Ok(rows) = stmt.query_map(params![pattern, q], |row| {
                    let sim: String = row.get(0)?;
                    let trad: Option<String> = row.get(1)?;
                    let py: String = row.get(2)?;
                    let hv: String = row.get(3)?;
                    let pos: Option<String> = row.get(4)?;
                    let defs_raw: String = row.get(5)?;
                    let exs_raw: String = row.get(6)?;
                    let defs: Vec<String> = serde_json::from_str(&defs_raw).unwrap_or_else(|_| vec![defs_raw]);
                    let exs: Vec<ExampleSentence> = serde_json::from_str(&exs_raw).unwrap_or_default();
                    Ok(DictionaryEntry {
                        simplified: sim,
                        traditional: trad,
                        pinyin: py,
                        han_viet: hv,
                        pos,
                        definitions: defs,
                        examples: exs,
                    })
                }) {
                    for r in rows.flatten() {
                        results.push(r);
                    }
                }
            }
            results
        }
        Some("pinyin") => {
            let pinyin_results = lookup_by_pinyin_tone_free(&conn, q, 10);
            if !pinyin_results.is_empty() {
                pinyin_results
            } else {
                lookup_reverse_vietnamese(&conn, q, 10)
            }
        }
        Some("vietnamese") => {
            let viet_results = lookup_reverse_vietnamese(&conn, q, 10);
            if !viet_results.is_empty() {
                viet_results
            } else {
                lookup_by_pinyin_tone_free(&conn, q, 10)
            }
        }
        _ => {
            if is_chinese {
                let mut results = Vec::new();
                if let Some(entry) = lookup_word(&conn, q) {
                    results.push(entry);
                }
                results
            } else {
                let pinyin_res = lookup_by_pinyin_tone_free(&conn, q, 10);
                if !pinyin_res.is_empty() {
                    pinyin_res
                } else {
                    lookup_reverse_vietnamese(&conn, q, 10)
                }
            }
        }
    }
}

#[tauri::command]
pub fn search_suggestions(state: tauri::State<DbState>, query: String) -> Vec<String> {
    let conn = state.conn.lock().unwrap();
    let q = query.trim();
    if q.is_empty() {
        return Vec::new();
    }

    let is_chinese = q.chars().any(|c| ('\u{4e00}'..='\u{9fa5}').contains(&c));
    if is_chinese {
        let mut stmt = match conn.prepare(
            "SELECT simplified FROM dictionary_entries WHERE simplified LIKE ?1 LIMIT 5",
        ) {
            Ok(s) => s,
            Err(_) => return Vec::new(),
        };

        let pattern = format!("{}%", q);
        let rows = match stmt.query_map(params![pattern], |row| row.get(0)) {
            Ok(r) => r,
            Err(_) => return Vec::new(),
        };

        rows.filter_map(|r| r.ok()).collect()
    } else {
        // Query by clean pinyin
        let clean_py = clean_pinyin_rust(q);
        let flat_py = clean_py.replace(' ', "");
        let flat_pattern = format!("{}%", flat_py);
        if let Ok(mut stmt) = conn.prepare(
            "SELECT simplified FROM dictionary_entries WHERE pinyin_flat = ?1 OR pinyin_flat LIKE ?2 LIMIT 5"
        ) {
            if let Ok(rows) = stmt.query_map(params![flat_py, flat_pattern], |row| row.get(0)) {
                let res: Vec<String> = rows.filter_map(|r| r.ok()).collect();
                if !res.is_empty() {
                    return res;
                }
            }
        }
        // Fallback to definitions
        let def_pattern = format!("%{}%", q);
        if let Ok(mut stmt) = conn.prepare(
            "SELECT simplified FROM dictionary_entries WHERE definitions LIKE ?1 LIMIT 5"
        ) {
            if let Ok(rows) = stmt.query_map(params![def_pattern], |row| row.get(0)) {
                return rows.filter_map(|r| r.ok()).collect();
            }
        }
        Vec::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_lookup_baoxiao_and_fallback() {
        let conn = init_db().expect("Failed to init db");
        // Test 1: Direct lookup cho từ 报销
        let res = lookup_word(&conn, "报销");
        assert!(res.is_some(), "Tra cứu từ 报销 phải thành công");
        let entry = res.unwrap();
        assert_eq!(entry.simplified, "报销");
        assert!(entry.han_viet.contains("BÁO TIÊU"));

        // Test 2: Morphological breakdown fallback cho cụm từ 财务部
        let fallback_res = lookup_word(&conn, "财务部");
        assert!(fallback_res.is_some(), "Tra cứu cụm từ 财务部 phải kích hoạt breakdown fallback");
        let fb_entry = fallback_res.unwrap();
        assert!(fb_entry.pinyin.contains("cái") && fb_entry.pinyin.contains("wù"));
    }

    #[test]
    fn test_pinyin_tone_free_search() {
        let conn = init_db().expect("Failed to init db");
        // Test tìm kiếm từ 'gongzuo' -> phải ra '工作'
        let res = lookup_by_pinyin_tone_free(&conn, "gongzuo", 5);
        assert!(!res.is_empty(), "Tra cứu pinyin 'gongzuo' không được rỗng");
        assert_eq!(res[0].simplified, "工作", "Kết quả đầu tiên của 'gongzuo' phải là '工作'");

        // Test tìm kiếm từ 'nihao' -> phải ra '你好'
        let res_nihao = lookup_by_pinyin_tone_free(&conn, "nihao", 5);
        assert!(!res_nihao.is_empty(), "Tra cứu pinyin 'nihao' không được rỗng");
        assert_eq!(res_nihao[0].simplified, "你好", "Kết quả đầu tiên của 'nihao' phải là '你好'");
    }

    #[test]
    fn test_reverse_vietnamese_search() {
        let conn = init_db().expect("Failed to init db");
        // Test tra cứu ngược 'bảo hiểm' -> top 3 phải chứa '保险'
        let res = lookup_reverse_vietnamese(&conn, "bảo hiểm", 5);
        assert!(!res.is_empty(), "Tra cứu ngược 'bảo hiểm' không được rỗng");
        let top3_sim: Vec<String> = res.iter().take(3).map(|e| e.simplified.clone()).collect();
        assert!(top3_sim.contains(&"保险".to_string()), "Top 3 tra ngược 'bảo hiểm' phải chứa '保险'");

        // Test tra cứu ngược 'sa thải' -> phải tìm thấy từ ngữ liên quan
        let res_sathai = lookup_reverse_vietnamese(&conn, "sa thải", 5);
        assert!(!res_sathai.is_empty(), "Tra cứu ngược 'sa thải' không được rỗng");
    }
}
