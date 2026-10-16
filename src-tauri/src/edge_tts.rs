use futures_util::{SinkExt, StreamExt};
use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};
use tokio_tungstenite::{
    connect_async,
    tungstenite::{client::IntoClientRequest, http::HeaderValue, Message},
};

const TRUSTED_CLIENT_TOKEN: &str = "6A5AA1D4EAFF4E9FB37E23D68491D6F4";
const WIN_EPOCH: f64 = 11644473600.0;
const S_TO_NS: f64 = 1e9;
const CHROMIUM_FULL_VERSION: &str = "143.0.3650.75";

const SHA256_INITIAL: [u32; 8] = [
    0x6A09E667, 0xBB67AE85, 0x3C6EF372, 0xA54FF53A,
    0x510E527F, 0x9B05688C, 0x1F83D9AB, 0x5BE0CD19,
];

const SHA256_STATE: [u32; 8] = [
    0xFD9FBEA2, 0x91243CE7, 0xBE499094, 0xCD2E1E0A,
    0x6C006F49, 0x04BD35AB, 0xFEB0A7E4, 0x03EFFBD2,
];

const SHA256_SCHEDULE: [u32; 14] = [
    0xEB24BF9E, 0x1558691F, 0xA0C09EE2, 0x0CFA32BA, 0xA622EE8C, 0xD1DD9491, 0xC0DD25A0,
    0xF9E70AB6, 0xF0C31573, 0x7058CE4E, 0x7188E606, 0x00E5AB33, 0xD258B060, 0x72766564,
];

const SHA256_ROUND_CONSTANTS: [u32; 64] = [
    0x428A2F98, 0x71374491, 0xB5C0FBCF, 0xE9B5DBA5, 0x3956C25B, 0x59F111F1, 0x923F82A4,
    0xAB1C5ED5, 0xD807AA98, 0x12835B01, 0x243185BE, 0x550C7DC3, 0x72BE5D74, 0x80DEB1FE,
    0x9BDC06A7, 0xC19BF174, 0xE49B69C1, 0xEFBE4786, 0x0FC19DC6, 0x240CA1CC, 0x2DE92C6F,
    0x4A7484AA, 0x5CB0A9DC, 0x76F988DA, 0x983E5152, 0xA831C66D, 0xB00327C8, 0xBF597FC7,
    0xC6E00BF3, 0xD5A79147, 0x06CA6351, 0x14292967, 0x27B70A85, 0x2E1B2138, 0x4D2C6DFC,
    0x53380D13, 0x650A7354, 0x766A0ABB, 0x81C2C92E, 0x92722C85, 0xA2BFE8A1, 0xA81A664B,
    0xC24B8B70, 0xC76C51A3, 0xD192E819, 0xD6990624, 0xF40E3585, 0x106AA070, 0x19A4C116,
    0x1E376C08, 0x2748774C, 0x34B0BCB5, 0x391C0CB3, 0x4ED8AA4A, 0x5B9CCA4F, 0x682E6FF3,
    0x748F82EE, 0x78A5636F, 0x84C87814, 0x8CC70208, 0x90BEFFFA, 0xA4506CEB, 0xBEF9A3F7,
    0xC67178F2,
];

const SHA256_ADJUSTMENT: u32 = 0xC9DC06A7;
const SHA256_SIGMA0_ADJUSTMENT: u32 = 0x059C0B80;
const SHA256_SIGMA1_ADJUSTMENT: u32 = 0x000B92C0;

const CS64_COEFFICIENTS: [(u32, u32); 14] = [
    (0xE82E91B1, 0xB32700D0),
    (0x44DE24C6, 0x88DFF51D),
    (0x3BEB65BC, 0x29514038),
    (0xC89C5933, 0xB328CBDF),
    (0x8D1EC211, 0xD405B4D5),
    (0x314EF5D5, 0x26E55F3C),
    (0xE92491B1, 0x607801C6),
    (0xF0A5B9D5, 0x82B2C1FB),
    (0x06064CF3, 0xFA51A3DA),
    (0xDA79FA60, 0x207CC464),
    (0xBED20560, 0x3C3C74F3),
    (0x89F9C9F8, 0xD2D14B61),
    (0x35FA38C6, 0xBB04A2C1),
    (0xCB49E3C6, 0xC5626167),
];

const CS64_FACTOR: u32 = 0x82893933;
const CS64_ADJUSTMENT0: u32 = 0xF2F90B1A;
const CS64_ADJUSTMENT1: u32 = 0x0B1A0000;

#[inline]
fn sigma0(v: u32) -> u32 {
    v.rotate_right(7) ^ v.rotate_right(18) ^ (v >> 3)
}

#[inline]
fn sigma1(v: u32) -> u32 {
    v.rotate_right(17) ^ v.rotate_right(19) ^ (v >> 10)
}

#[inline]
fn big_sigma0(a: u32) -> u32 {
    a.rotate_right(2) ^ a.rotate_right(13) ^ a.rotate_right(22)
}

#[inline]
fn big_sigma1(e: u32) -> u32 {
    e.rotate_right(6) ^ e.rotate_right(11) ^ e.rotate_right(25)
}

#[inline]
fn ch(e: u32, f: u32, g: u32) -> u32 {
    (e & f) ^ (!e & g)
}

#[inline]
fn maj(a: u32, b: u32, c: u32) -> u32 {
    (a & b) | (c & (a | b))
}

fn expand_sha256_schedule(words: &mut Vec<u32>, first_word: usize) {
    for index in first_word..64 {
        let x = words[index - 2];
        let y = words[index - 15];
        let s1 = sigma1(x);
        let s0 = sigma0(y);
        let val = s1
            .wrapping_add(words[index - 7])
            .wrapping_add(s0)
            .wrapping_add(words[index - 16]);
        words.push(val);
    }
}

fn sha256_rounds(state: [u32; 8], words: &[u32], first_round: usize) -> [u32; 8] {
    let mut a = state[0];
    let mut b = state[1];
    let mut c = state[2];
    let mut d = state[3];
    let mut e = state[4];
    let mut f = state[5];
    let mut g = state[6];
    let mut h = state[7];

    let mut constants = SHA256_ROUND_CONSTANTS;
    if first_round == 14 {
        constants[14] = SHA256_ADJUSTMENT;
    }

    for index in first_round..64 {
        let t1 = h
            .wrapping_add(big_sigma1(e))
            .wrapping_add(ch(e, f, g))
            .wrapping_add(constants[index])
            .wrapping_add(words[index]);
        let t2 = big_sigma0(a).wrapping_add(maj(a, b, c));

        h = g;
        g = f;
        f = e;
        e = d.wrapping_add(t1);
        d = c;
        c = b;
        b = a;
        a = t1.wrapping_add(t2);
    }

    [a, b, c, d, e, f, g, h]
}

fn sha256_init(data: &[u8]) -> [u32; 8] {
    let mut words: Vec<u32> = Vec::with_capacity(64);
    for _ in 0..14 {
        words.push(0);
    }
    let w14 = ((data[0] as u32) << 16) | ((data[1] as u32) << 8) | (data[2] as u32);
    words.push(w14);
    let w15 = u32::from_be_bytes([data[3], data[4], data[5], data[6]]);
    words.push(w15);

    for index in 16..30 {
        let mut value = SHA256_SCHEDULE[index - 16];
        if index - 2 >= 14 {
            let s1 = sigma1(words[index - 2]);
            value = value.wrapping_add(if index == 16 {
                s1 ^ SHA256_SIGMA1_ADJUSTMENT
            } else {
                s1
            });
        }
        if index - 7 >= 14 {
            value = value.wrapping_add(words[index - 7]);
        }
        if index - 15 >= 14 {
            let s0 = sigma0(words[index - 15]);
            value = value.wrapping_add(if index == 29 {
                s0 ^ SHA256_SIGMA0_ADJUSTMENT
            } else {
                s0
            });
        }
        words.push(value);
    }

    let w30 = sigma1(words[28])
        .wrapping_add(words[23])
        .wrapping_add(sigma0(words[15]))
        .wrapping_add(words[14])
        .wrapping_add(SHA256_ADJUSTMENT)
        .wrapping_sub(SHA256_ROUND_CONSTANTS[14]);
    words.push(w30);

    expand_sha256_schedule(&mut words, 31);
    let working = sha256_rounds(SHA256_STATE, &words, 14);

    let mut res = [0u32; 8];
    for i in 0..8 {
        res[i] = SHA256_INITIAL[i].wrapping_add(working[i]);
    }
    res
}

fn sha256_digest(data: &[u8]) -> [u8; 32] {
    assert!(data.len() >= 7, "Token salt must contain at least seven bytes");
    let length = (57 + data.len()) as u64;
    let mut padded = Vec::from(&data[7..]);
    padded.push(0x80);
    let pad_len = ((55 - (57 + data.len() as isize)) % 64 + 64) % 64;
    padded.extend(std::iter::repeat(0u8).take(pad_len as usize));
    padded.extend_from_slice(&(length * 8).to_be_bytes());

    let mut state = sha256_init(&data[..7]);

    for chunk in padded.chunks_exact(64) {
        let mut words: Vec<u32> = Vec::with_capacity(64);
        for i in 0..16 {
            words.push(u32::from_be_bytes([
                chunk[i * 4],
                chunk[i * 4 + 1],
                chunk[i * 4 + 2],
                chunk[i * 4 + 3],
            ]));
        }
        expand_sha256_schedule(&mut words, 16);
        let working = sha256_rounds(state, &words, 0);
        for i in 0..8 {
            state[i] = state[i].wrapping_add(working[i]);
        }
    }

    let mut out = [0u8; 32];
    for (i, &word) in state.iter().enumerate() {
        out[i * 4..(i + 1) * 4].copy_from_slice(&word.to_be_bytes());
    }
    out
}

fn words_le4_even(data: &[u8]) -> Vec<u32> {
    let mut padded = data.to_vec();
    let rem = padded.len() % 4;
    if rem != 0 {
        padded.extend(std::iter::repeat(0u8).take(4 - rem));
    }
    let mut words = Vec::new();
    for chunk in padded.chunks_exact(4) {
        words.push(u32::from_le_bytes([chunk[0], chunk[1], chunk[2], chunk[3]]));
    }
    if words.len() % 2 != 0 {
        words.push(0);
    }
    words
}

fn cs64_digest(data: &[u8], digest: &[u8; 32]) -> (u32, u32) {
    let key_a = u32::from_le_bytes([digest[0], digest[1], digest[2], digest[3]]) | 1;
    let key_b = u32::from_le_bytes([digest[4], digest[5], digest[6], digest[7]]) | 1;

    let factors = [
        key_a.wrapping_mul(CS64_FACTOR),
        key_b.wrapping_mul(CS64_FACTOR),
    ];

    let mut terms: Vec<u32> = Vec::new();
    let mut offsets: Vec<u32> = Vec::new();

    for (index, &(coefficient, offset)) in CS64_COEFFICIENTS.iter().enumerate() {
        terms.push(coefficient.wrapping_mul(factors[index % 2]));
        offsets.push(offset);
    }

    let mut prepended = Vec::with_capacity(1 + data.len());
    prepended.push(0x00);
    prepended.extend_from_slice(data);
    let words = words_le4_even(&prepended);

    for (index, &word) in words.iter().enumerate() {
        let mut term = word.wrapping_mul(if index % 2 == 0 { key_a } else { key_b });
        let mut offset = word.rotate_left(16).wrapping_mul(if index % 2 == 0 {
            0xEF0569FB
        } else {
            0xC31713DB
        });

        if index == 0 {
            term = term.wrapping_add(CS64_ADJUSTMENT0.wrapping_mul(factors[0]));
            offset = offset.wrapping_add(CS64_ADJUSTMENT1);
        }

        terms.push(term);
        offsets.push(offset);
    }

    let mut swap_acc: u32 = 0;
    let mut swap_last: u32 = 0;
    let mut state: u32 = 0;
    let mut acc: u32 = 0;

    for index in (0..terms.len()).step_by(2) {
        let x = terms[index];
        let y = terms[index + 1];

        let mut t = offsets[index].wrapping_add(x).rotate_left(16);
        let mut q = t.wrapping_mul(0x76F50F34);
        swap_acc = swap_acc.wrapping_add(q.rotate_left(16).wrapping_mul(0xC3EFEA97).wrapping_add(q));

        t = offsets[index + 1].wrapping_add(y).rotate_left(16);
        q = t.wrapping_mul(0x1881CE3C);
        swap_last = q.rotate_left(16).wrapping_mul(0x35BD1EC9).wrapping_add(q);
        swap_acc = swap_acc.wrapping_add(swap_last);

        state = state.wrapping_mul(key_a).wrapping_add(x);
        state = state.rotate_left(16).wrapping_mul(0xCF98B111);
        state = state.rotate_left(16).wrapping_mul(0x87085B9F);
        state = state.rotate_left(16).wrapping_mul(0x12CEB96D);
        state = state.rotate_left(16).wrapping_mul(0x257E1D83);
        acc = acc.wrapping_add(state);

        t = state.wrapping_mul(key_b).wrapping_add(y);
        t = t.rotate_left(16).wrapping_mul(0xA27416F5);
        t = t.rotate_left(16).wrapping_mul(0xD38396FF);
        state = t.rotate_left(16).wrapping_mul(0x7C932B89).rotate_left(16).wrapping_mul(0xBFA49F69);
        acc = acc.wrapping_add(state);
    }

    (swap_last ^ state, swap_acc ^ acc)
}

pub fn generate_sec_ms_gec_v2(unix_timestamp: Option<f64>) -> String {
    let ticks_sec = match unix_timestamp {
        Some(ts) => ts,
        None => {
            let dur = SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap_or_default();
            dur.as_secs_f64()
        }
    };

    let mut ticks = ticks_sec + WIN_EPOCH;
    ticks -= ticks % 300.0;
    ticks *= S_TO_NS / 100.0;

    let str_to_hash = format!("{:.0}{}", ticks, TRUSTED_CLIENT_TOKEN);
    let data = str_to_hash.as_bytes();

    let digest = sha256_digest(data);
    let (cs64_0, cs64_1) = cs64_digest(data, &digest);

    let mut cs64_bytes = [0u8; 8];
    cs64_bytes[0..4].copy_from_slice(&cs64_0.to_le_bytes());
    cs64_bytes[4..8].copy_from_slice(&cs64_1.to_le_bytes());

    let cs64_hex: String = cs64_bytes.iter().map(|b| format!("{:02X}", b)).collect();
    let sha256_hex: String = digest.iter().map(|b| format!("{:02X}", b)).collect();

    format!("{}-{}", cs64_hex, sha256_hex)
}

pub fn generate_muid() -> String {
    let u1 = uuid::Uuid::new_v4().simple().to_string();
    u1.to_uppercase()
}

pub async fn synthesize_edge_tts(
    text: &str,
    voice: &str,
    rate_str: &str,
) -> Result<Vec<u8>, String> {
    let text = text.trim();
    if text.is_empty() {
        return Err("Text cannot be empty".to_string());
    }

    let token = generate_sec_ms_gec_v2(None);
    let conn_id = uuid::Uuid::new_v4().simple().to_string();
    let muid = generate_muid();

    let url = format!(
        "wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken={}&Sec-MS-GEC={}&Sec-MS-GEC-Version=2-{}&ConnectionId={}",
        TRUSTED_CLIENT_TOKEN, token, CHROMIUM_FULL_VERSION, conn_id
    );

    let mut req = url
        .into_client_request()
        .map_err(|e| format!("Failed to create client request: {}", e))?;

    let headers = req.headers_mut();
    headers.insert(
        "Origin",
        HeaderValue::from_static("chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold"),
    );
    headers.insert(
        "User-Agent",
        HeaderValue::from_static(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0",
        ),
    );
    headers.insert("Pragma", HeaderValue::from_static("no-cache"));
    headers.insert("Cache-Control", HeaderValue::from_static("no-cache"));
    headers.insert(
        "Cookie",
        HeaderValue::from_str(&format!("muid={};", muid))
            .unwrap_or_else(|_| HeaderValue::from_static("")),
    );

    let (mut ws_stream, _) = connect_async(req)
        .await
        .map_err(|e| format!("Edge TTS WebSocket connect error: {}", e))?;

    // 1. Send speech.config
    let timestamp = chrono::Utc::now().to_rfc3339();
    let cfg_msg = format!(
        "X-Timestamp:{}\r\nContent-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n{{\"context\":{{\"synthesis\":{{\"audio\":{{\"metadataoptions\":{{\"sentenceBoundaryEnabled\":\"false\",\"wordBoundaryEnabled\":\"false\"}},\"outputFormat\":\"audio-24khz-48kbitrate-mono-mp3\"}}}}}}}}",
        timestamp
    );
    ws_stream
        .send(Message::Text(cfg_msg))
        .await
        .map_err(|e| format!("Failed to send speech.config: {}", e))?;

    // 2. Send SSML
    let escaped_text = text
        .replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('\'', "&apos;")
        .replace('"', "&quot;");
    let req_id = uuid::Uuid::new_v4().simple().to_string();
    let lang = voice.split('-').take(2).collect::<Vec<_>>().join("-");
    let ssml_body = format!(
        "<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='{lang}'>\
         <voice name='{voice}'>\
         <prosody pitch='+0Hz' rate='{rate_str}' volume='+0%'>\
         {escaped_text}\
         </prosody></voice></speak>"
    );
    let ssml_msg = format!(
        "X-RequestId:{req_id}\r\nContent-Type:application/ssml+xml\r\nX-Timestamp:{timestamp}\r\nPath:ssml\r\n\r\n{ssml_body}"
    );
    ws_stream
        .send(Message::Text(ssml_msg))
        .await
        .map_err(|e| format!("Failed to send SSML: {}", e))?;

    // 3. Receive audio binary chunks
    let mut audio_bytes = Vec::new();
    while let Some(msg_res) = ws_stream.next().await {
        match msg_res {
            Ok(Message::Binary(bin)) => {
                if bin.len() > 2 {
                    let header_len = u16::from_be_bytes([bin[0], bin[1]]) as usize;
                    if bin.len() > 2 + header_len {
                        audio_bytes.extend_from_slice(&bin[2 + header_len..]);
                    }
                }
            }
            Ok(Message::Text(txt)) => {
                if txt.contains("Path:turn.end") {
                    break;
                }
            }
            Ok(Message::Close(_)) => break,
            Ok(Message::Ping(data)) => {
                let _ = ws_stream.send(Message::Pong(data)).await;
            }
            Err(e) => return Err(format!("WS read error: {}", e)),
            _ => {}
        }
    }

    if audio_bytes.is_empty() {
        return Err("No audio received from Edge TTS service".to_string());
    }

    Ok(audio_bytes)
}

#[derive(Debug, Serialize, Deserialize)]
pub struct EdgeTtsResponse {
    pub audio_base64: String,
    pub voice: String,
}

#[tauri::command]
pub async fn synthesize_speech(
    text: String,
    voice: String,
    rate: Option<f32>,
) -> Result<EdgeTtsResponse, String> {
    let speed = rate.unwrap_or(1.0);
    let rate_pct = ((speed - 1.0) * 100.0).round() as i32;
    let rate_str = if rate_pct >= 0 {
        format!("+{}%", rate_pct)
    } else {
        format!("{}%", rate_pct)
    };

    let audio_bytes = synthesize_edge_tts(&text, &voice, &rate_str).await?;
    
    // Convert to base64
    let base64_str = {
        // Base64 encode without external crate:
        const BASE64_ALPHABET: &[u8; 64] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        let mut buf = String::with_capacity((audio_bytes.len() + 2) / 3 * 4);
        for chunk in audio_bytes.chunks(3) {
            let b0 = chunk[0] as u32;
            let b1 = if chunk.len() > 1 { chunk[1] as u32 } else { 0 };
            let b2 = if chunk.len() > 2 { chunk[2] as u32 } else { 0 };
            let triple = (b0 << 16) | (b1 << 8) | b2;

            buf.push(BASE64_ALPHABET[((triple >> 18) & 0x3F) as usize] as char);
            buf.push(BASE64_ALPHABET[((triple >> 12) & 0x3F) as usize] as char);
            if chunk.len() > 1 {
                buf.push(BASE64_ALPHABET[((triple >> 6) & 0x3F) as usize] as char);
            } else {
                buf.push('=');
            }
            if chunk.len() > 2 {
                buf.push(BASE64_ALPHABET[(triple & 0x3F) as usize] as char);
            } else {
                buf.push('=');
            }
        }
        buf
    };

    Ok(EdgeTtsResponse {
        audio_base64: base64_str,
        voice,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_gec_token_v2_known_vector() {
        // Reference vector obtained directly from Python edge_tts 7.3.1 generate_sec_ms_gec_v2(1700000000)
        let token = generate_sec_ms_gec_v2(Some(1700000000.0));
        assert_eq!(
            token,
            "2CD23A2CA0B2595A-F3C846C370E05F9CC83ACC5F995C5F5D87A4D0F14CE8936A0F902E64099E38A2"
        );
    }

    #[tokio::test]
    async fn test_edge_tts_live_yunxi() {
        let res = synthesize_edge_tts("你好", "zh-CN-YunxiNeural", "+0%").await;
        println!("Edge TTS Live Yunxi result: is_ok={}", res.is_ok());
        if let Err(ref e) = res {
            println!("Error: {}", e);
        }
        assert!(res.is_ok());
        let bytes = res.unwrap();
        assert!(!bytes.is_empty());
        println!("Edge TTS Live Yunxi generated {} bytes", bytes.len());
    }
}
