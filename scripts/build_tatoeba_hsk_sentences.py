import sqlite3
import bz2
import json
import os
import sys
import re
import urllib.request
import urllib.parse
import time
import pypinyin

sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SCRATCH_TATOEBA = 'C:/Users/votah/.gemini/antigravity/brain/1b7d7543-664b-4b65-ae3b-98e5e0ccf275/scratch/tatoeba_data'
DB_PATH = os.path.join(BASE_DIR, '..', 'src-tauri', 'dictionary.db')
ROOT_DB_PATH = os.path.join(BASE_DIR, '..', 'dictionary.db')

def format_sentence_pinyin(chinese_text):
    clean = re.sub(r'[，。？！、“”‘’（）《》…—,?!]', ' ', chinese_text).strip()
    words = clean.split()
    tokens = []
    for w in words:
        py = pypinyin.lazy_pinyin(w, style=pypinyin.Style.TONE)
        tokens.extend(py)
    return f"[ {' '.join(tokens)} ]"

def main():
    print("=== TATOEBA HSK 1 - 6 BILINGUAL SENTENCES INTEGRATION ===", flush=True)

    # 1. Load HSK 1 - 6 words
    hsk_cache_file = os.path.join(BASE_DIR, 'hsk_words.json')
    if not os.path.exists(hsk_cache_file):
        print("Downloading canonical HSK vocabulary list...", flush=True)
        url = 'https://raw.githubusercontent.com/drkameleon/complete-hsk-vocabulary/main/complete.json'
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=15) as r:
            raw_data = json.loads(r.read().decode('utf-8'))
        
        hsk_items = []
        for item in raw_data:
            levels = item.get('level', [])
            for lvl in levels:
                if lvl.startswith('old-'):
                    hsk_items.append({
                        'word': item['simplified'],
                        'level': lvl
                    })
                    break
        with open(hsk_cache_file, 'w', encoding='utf-8') as f:
            json.dump(hsk_items, f, ensure_ascii=False, indent=2)
        print(f"Saved {len(hsk_items)} HSK words to {hsk_cache_file}", flush=True)
    else:
        with open(hsk_cache_file, 'r', encoding='utf-8') as f:
            hsk_items = json.load(f)
        print(f"Loaded {len(hsk_items)} HSK words from cache.", flush=True)

    hsk_word_set = set(item['word'] for item in hsk_items)

    # 2. Load Tatoeba sentences & pre-aligned pairs
    print("Loading Tatoeba corpus...", flush=True)
    cmn_texts = {}
    with bz2.open(os.path.join(SCRATCH_TATOEBA, 'cmn_sentences.tsv.bz2'), 'rt', encoding='utf-8') as f:
        for line in f:
            parts = line.strip().split('\t')
            if len(parts) >= 3:
                cmn_texts[parts[0]] = parts[2]

    vie_texts = {}
    with bz2.open(os.path.join(SCRATCH_TATOEBA, 'vie_sentences.tsv.bz2'), 'rt', encoding='utf-8') as f:
        for line in f:
            parts = line.strip().split('\t')
            if len(parts) >= 3:
                vie_texts[parts[0]] = parts[2]

    aligned_pairs = []
    # Direct links
    with bz2.open(os.path.join(SCRATCH_TATOEBA, 'cmn-vie_links.tsv.bz2'), 'rt', encoding='utf-8') as f:
        for line in f:
            parts = line.strip().split('\t')
            if len(parts) >= 2 and parts[0] in cmn_texts and parts[1] in vie_texts:
                aligned_pairs.append((cmn_texts[parts[0]], vie_texts[parts[1]]))

    # English bridge links
    cmn_to_eng = {}
    with bz2.open(os.path.join(SCRATCH_TATOEBA, 'cmn-eng_links.tsv.bz2'), 'rt', encoding='utf-8') as f:
        for line in f:
            parts = line.strip().split('\t')
            if len(parts) >= 2:
                cmn_to_eng.setdefault(parts[0], set()).add(parts[1])

    eng_to_vie = {}
    with bz2.open(os.path.join(SCRATCH_TATOEBA, 'vie-eng_links.tsv.bz2'), 'rt', encoding='utf-8') as f:
        for line in f:
            parts = line.strip().split('\t')
            if len(parts) >= 2:
                eng_to_vie.setdefault(parts[1], set()).add(parts[0])

    for cmn_id, eng_set in cmn_to_eng.items():
        for eng_id in eng_set:
            if eng_id in eng_to_vie:
                for vie_id in eng_to_vie[eng_id]:
                    if cmn_id in cmn_texts and vie_id in vie_texts:
                        aligned_pairs.append((cmn_texts[cmn_id], vie_texts[vie_id]))

    unique_aligned_pairs = list(set(aligned_pairs))
    print(f"Loaded {len(unique_aligned_pairs)} unique pre-aligned human sentence pairs from Tatoeba.", flush=True)

    # 3. Match HSK words against aligned pairs
    word_examples = {} # word -> list of (zh, vi)
    word_seen_zh = {}  # word -> set of zh
    for zh, vi in unique_aligned_pairs:
        clean_zh = zh.strip()
        clean_vi = vi.strip()
        # Filter sentence length between 5 and 35 chars
        if len(clean_zh) < 5 or len(clean_zh) > 35 or len(clean_vi) < 5:
            continue
        n = len(clean_zh)
        for l in range(1, 5):
            for start in range(n - l + 1):
                sub = clean_zh[start:start+l]
                if sub in hsk_word_set:
                    existing = word_examples.setdefault(sub, [])
                    seen_set = word_seen_zh.setdefault(sub, set())
                    if len(existing) < 4 and clean_zh not in seen_set:
                        seen_set.add(clean_zh)
                        existing.append((clean_zh, clean_vi))

    covered_count = len(word_examples)
    total_assigned = sum(len(exs) for exs in word_examples.values())
    print(f"Step 1 coverage: {covered_count} / {len(hsk_word_set)} HSK words have {total_assigned} human example sentences.", flush=True)

    # 4. For HSK words with fewer than 2 sentences, find candidate sentences in the 89k Tatoeba corpus
    print("Indexing 89k Tatoeba sentences for remaining HSK words...", flush=True)
    cmn_all_clean = [t.strip() for t in cmn_texts.values() if 6 <= len(t.strip()) <= 32]
    
    char_to_sents = {}
    for sent in cmn_all_clean:
        for ch in set(sent):
            char_to_sents.setdefault(ch, []).append(sent)

    missing_words = [w for w in hsk_word_set if len(word_examples.get(w, [])) < 2]
    print(f"HSK words needing additional sentences: {len(missing_words)}", flush=True)

    used_sents_global = set()
    for exs in word_examples.values():
        for e in exs:
            used_sents_global.add(e[0])

    to_translate = [] # list of (word, sent)
    for w in missing_words:
        needed = 2 - len(word_examples.get(w, []))
        first_char = w[0]
        candidates = char_to_sents.get(first_char, [])
        found_for_w = 0
        for sent in candidates:
            if w in sent and sent not in used_sents_global:
                used_sents_global.add(sent)
                to_translate.append((w, sent))
                found_for_w += 1
                if found_for_w >= needed:
                    break

    print(f"Found {len(to_translate)} authentic Tatoeba sentences to translate into Vietnamese.", flush=True)

    # Translate in batches
    def translate_batch(batch_texts):
        combined = "\n".join(batch_texts)
        url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=zh-CN&tl=vi&dt=t&q=' + urllib.parse.quote(combined)
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=15) as r:
            res = json.loads(r.read().decode('utf-8'))
            translations = []
            for seg in res[0]:
                if seg[0]:
                    translations.append(seg[0])
            full_vi = "".join(translations)
            lines = [l.strip() for l in full_vi.split("\n") if l.strip()]
            return lines

    chunk_size = 30
    translated_count = 0
    for i in range(0, len(to_translate), chunk_size):
        chunk = to_translate[i:i+chunk_size]
        zh_list = [item[1] for item in chunk]
        success = False
        try:
            vi_list = translate_batch(zh_list)
            if len(vi_list) == len(chunk):
                for (w, zh), vi in zip(chunk, vi_list):
                    word_examples.setdefault(w, []).append((zh, vi))
                    translated_count += 1
                success = True
        except Exception:
            pass

        if not success:
            for w, zh in chunk:
                try:
                    single_vi = translate_batch([zh])
                    if single_vi:
                        word_examples.setdefault(w, []).append((zh, single_vi[0]))
                        translated_count += 1
                except Exception:
                    pass

        if (i // chunk_size) % 15 == 0 or (i + chunk_size) >= len(to_translate):
            print(f"  Processed {min(i + chunk_size, len(to_translate))} / {len(to_translate)} translations...", flush=True)
        time.sleep(0.08)

    print(f"Finished translation. Total translated: {translated_count}", flush=True)
    final_covered = len(word_examples)
    total_final_examples = sum(len(exs) for exs in word_examples.values())
    print(f"Final Coverage: {final_covered} / {len(hsk_word_set)} ({final_covered/len(hsk_word_set)*100:.1f}%)", flush=True)
    print(f"Total Bilingual Example Sentences to insert: {total_final_examples}", flush=True)

    # 5. Format and Update SQLite Databases
    for target_db in [DB_PATH, ROOT_DB_PATH]:
        if not os.path.exists(target_db):
            continue
        print(f"Updating {target_db}...", flush=True)
        conn = sqlite3.connect(target_db)
        cursor = conn.cursor()

        update_batch = []
        for word, sent_pairs in word_examples.items():
            ex_list = []
            for zh, vi in sent_pairs:
                py = format_sentence_pinyin(zh)
                ex_list.append({
                    "chinese": zh,
                    "pinyin": py,
                    "vietnamese": vi
                })
            ex_json = json.dumps(ex_list, ensure_ascii=False)
            update_batch.append((ex_json, word))

        cursor.executemany("UPDATE dictionary_entries SET examples = ? WHERE simplified = ?", update_batch)
        conn.commit()
        print(f"Committed {len(update_batch)} word updates to {target_db}.", flush=True)

        # Check a sample
        for test_w in ['万', '工作', '喜欢', '电脑', '检查', '学习', '准备']:
            cursor.execute("SELECT simplified, pinyin, examples FROM dictionary_entries WHERE simplified = ?", (test_w,))
            row = cursor.fetchone()
            if row and row[2]:
                exs = json.loads(row[2])
                if exs:
                    print(f"  Check '{test_w}': {len(exs)} examples. Example 1: {exs[0]['chinese']} ({exs[0]['pinyin']}) - {exs[0]['vietnamese']}", flush=True)
        conn.close()

    print("ALL DONE! Database successfully enriched with Tatoeba HSK bilingual examples!", flush=True)

if __name__ == '__main__':
    main()
