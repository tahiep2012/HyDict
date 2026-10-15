use serde::{Deserialize, Serialize};
use std::sync::OnceLock;
use jieba_rs::Jieba;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChineseToken {
    pub word: String,
    pub start: usize,
    pub end: usize,
    pub is_punctuation: bool,
}

static JIEBA_INSTANCE: OnceLock<Jieba> = OnceLock::new();

fn get_jieba() -> &'static Jieba {
    JIEBA_INSTANCE.get_or_init(Jieba::new)
}

pub fn is_cjk_punctuation(c: char) -> bool {
    matches!(
        c,
        '。' | '，' | '、' | '；' | '：' | '？' | '！' | '“' | '”' | '‘' | '’' | '（' | '）' | '《' | '》' | '—' | '…' | '.' | ',' | '!' | '?' | ';' | ':'
    )
}

#[tauri::command]
pub fn segment_sentence(text: &str) -> Vec<ChineseToken> {
    if text.trim().is_empty() {
        return Vec::new();
    }

    let jieba = get_jieba();
    let words = jieba.cut(text, false);
    let mut tokens = Vec::new();
    let mut current_offset = 0;

    for word in words {
        let word_len = word.chars().count();
        let is_punct = word.chars().all(is_cjk_punctuation);
        tokens.push(ChineseToken {
            word: word.to_string(),
            start: current_offset,
            end: current_offset + word_len,
            is_punctuation: is_punct,
        });
        current_offset += word_len;
    }

    tokens
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_segment_sentence_basic() {
        let tokens = segment_sentence("这本书有万页。");
        let words: Vec<String> = tokens.iter().map(|t| t.word.clone()).collect();
        assert!(words.contains(&"有".to_string()));
        assert!(words.contains(&"这".to_string()) || words.contains(&"本书".to_string()));
        assert!(words.contains(&"万页".to_string()) || words.contains(&"万".to_string()));
    }
}
