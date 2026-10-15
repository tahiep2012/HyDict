import sqlite3
import re
import csv
import json
import os
import sys

# Pinyin Tone conversion mapping
TONE_MARKS = {
    'a': ['ā', 'á', 'ǎ', 'à', 'a'],
    'e': ['ē', 'é', 'ě', 'è', 'e'],
    'i': ['ī', 'í', 'ǐ', 'ì', 'i'],
    'o': ['ō', 'ó', 'ǒ', 'ò', 'o'],
    'u': ['ū', 'ú', 'ǔ', 'ù', 'u'],
    'v': ['ǖ', 'ǘ', 'ǚ', 'ǜ', 'ü'],
    'ü': ['ǖ', 'ǘ', 'ǚ', 'ǜ', 'ü'],
}

def convert_pinyin_syllable(s):
    m = re.match(r'^([a-zA-ZüÜvV]+)(\d)?$', s)
    if not m:
        return s
    letters, tone = m.groups()
    if not tone:
        return letters
    tone_idx = int(tone) - 1
    if tone_idx < 0 or tone_idx >= 5:
        return letters

    low = letters.lower()
    # Rules for where tone mark goes:
    # 1. 'a' or 'e' takes priority
    # 2. 'ou' takes tone on 'o'
    # 3. Otherwise, second vowel takes mark
    target_idx = -1
    if 'a' in low:
        target_idx = low.find('a')
    elif 'e' in low:
        target_idx = low.find('e')
    elif 'ou' in low:
        target_idx = low.find('o')
    else:
        for i in range(len(low) - 1, -1, -1):
            if low[i] in 'aeiouvü':
                target_idx = i
                break

    if target_idx != -1:
        vowel = low[target_idx]
        marked = TONE_MARKS[vowel][tone_idx]
        if letters[target_idx].isupper():
            marked = marked.upper()
        return letters[:target_idx] + marked + letters[target_idx+1:]
    return letters

def convert_pinyin_string(pinyin_str):
    parts = pinyin_str.strip().split()
    converted = [convert_pinyin_syllable(p) for p in parts]
    return f"[ {' '.join(converted)} ]"

# Load Han-Viet single character mapping
def load_hanviet_map(csv_path):
    hv_map = {}
    if not os.path.exists(csv_path):
        return hv_map
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        header = next(reader, None)
        for row in reader:
            if len(row) >= 2:
                char = row[0].strip()
                raw_hv = row[1].strip()
                # parse raw_hv e.g. "['thướng']"
                readings = re.findall(r"'([^']+)'", raw_hv)
                if readings and char not in hv_map:
                    hv_map[char] = readings[0].upper()
    return hv_map

def get_word_hanviet(simp, trad, hv_map):
    readings = []
    if len(simp) == len(trad):
        for s, t in zip(simp, trad):
            if s in hv_map:
                readings.append(hv_map[s])
            elif t in hv_map:
                readings.append(hv_map[t])
            else:
                readings.append(s)
    else:
        for c in simp:
            if c in hv_map:
                readings.append(hv_map[c])
            else:
                readings.append(c)
    if readings:
        return f"Hán Việt: {' '.join(readings)}"
    return ""

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    u8_path = os.path.join(base_dir, 'CVDICT.u8')
    csv_path = os.path.join(base_dir, 'hanviet.csv')
    out_db = os.path.join(base_dir, '..', 'src-tauri', 'dictionary.db')

    print(f"Loading Han-Viet map from {csv_path}...")
    hv_map = load_hanviet_map(csv_path)
    print(f"Loaded {len(hv_map)} Han-Viet character readings.")

    print(f"Parsing {u8_path} and creating SQLite database at {out_db}...")
    if os.path.exists(out_db):
        os.remove(out_db)

    conn = sqlite3.connect(out_db)
    cursor = conn.cursor()

    cursor.execute("PRAGMA synchronous = OFF")
    cursor.execute("PRAGMA journal_mode = MEMORY")

    cursor.execute("""
        CREATE TABLE dictionary_entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            simplified TEXT NOT NULL,
            traditional TEXT,
            pinyin TEXT NOT NULL,
            han_viet TEXT NOT NULL,
            pos TEXT,
            definitions TEXT NOT NULL,
            examples TEXT
        )
    """)

    # Regex for CEDICT line:
    # 報銷 报销 [bao4 xiao1] /nộp báo cáo chi tiêu/xin hoàn tiền/ghi sổ xoá sổ/tiêu diệt/
    line_pattern = re.compile(r'^(\S+)\s+(\S+)\s+\[([^\]]+)\]\s+/(.+)/$')

    batch = []
    count = 0
    with open(u8_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            m = line_pattern.match(line)
            if not m:
                continue
            trad, simp, py_raw, defs_raw = m.groups()

            py_formatted = convert_pinyin_string(py_raw)
            hv = get_word_hanviet(simp, trad, hv_map)

            # Split defs
            raw_defs = [d.strip() for d in defs_raw.split('/') if d.strip()]
            defs_json = json.dumps(raw_defs, ensure_ascii=False)
            examples_json = json.dumps([], ensure_ascii=False)

            # Guess POS
            pos = None
            if raw_defs:
                first = raw_defs[0]
                if '(danh từ)' in first or '(noun)' in first:
                    pos = 'Danh từ'
                elif '(động từ)' in first or '(verb)' in first:
                    pos = 'Động từ'
                elif '(tính từ)' in first or '(adj)' in first:
                    pos = 'Tính từ'
                elif '(phó từ)' in first or '(adv)' in first:
                    pos = 'Phó từ'

            batch.append((simp, trad, py_formatted, hv, pos, defs_json, examples_json))
            count += 1

            if len(batch) >= 10000:
                cursor.executemany("""
                    INSERT INTO dictionary_entries (simplified, traditional, pinyin, han_viet, pos, definitions, examples)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, batch)
                batch = []
                print(f"Processed {count} entries...")

    if batch:
        cursor.executemany("""
            INSERT INTO dictionary_entries (simplified, traditional, pinyin, han_viet, pos, definitions, examples)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, batch)

    print("Creating indexes...")
    cursor.execute("CREATE INDEX idx_simplified ON dictionary_entries(simplified)")
    cursor.execute("CREATE INDEX idx_traditional ON dictionary_entries(traditional)")
    cursor.execute("CREATE INDEX idx_han_viet ON dictionary_entries(han_viet)")

    conn.commit()
    conn.close()

    print(f"DONE! Total {count} dictionary entries imported into {out_db}.")

    # Test lookup on output DB
    conn = sqlite3.connect(out_db)
    cursor = conn.cursor()
    for test_word in ["报销", "财务", "有", "住", "页"]:
        cursor.execute("SELECT simplified, traditional, pinyin, han_viet, definitions FROM dictionary_entries WHERE simplified = ? LIMIT 1", (test_word,))
        row = cursor.fetchone()
        if row:
            print(f"Test '{test_word}': Pinyin={row[2]}, HV={row[3]}, Defs={row[4][:80]}...")
        else:
            print(f"Test '{test_word}': NOT FOUND!")
    conn.close()

    # Copy to root directory as well
    root_db = os.path.join(base_dir, '..', 'dictionary.db')
    import shutil
    shutil.copyfile(out_db, root_db)
    print(f"Copied {out_db} to {root_db}")

if __name__ == '__main__':
    if sys.platform == 'win32':
        try:
            sys.stdout.reconfigure(encoding='utf-8')
        except Exception:
            pass
    main()
