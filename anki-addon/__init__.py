# -*- coding: utf-8 -*-
"""
Hanzii Dict Desktop - Anki Integration Add-on
Tự động nhận diện từ vựng tiếng Trung khi double-click và gọi Hanzii Dict HUD
"""

from aqt import mw, gui_hooks
from aqt.webview import AnkiWebView

JS_SELECTION_HOOK = """
(function() {
    if (window.__hanziiHookAttached) return;
    window.__hanziiHookAttached = true;

    document.addEventListener('dblclick', function(e) {
        var selection = window.getSelection();
        var selectedText = selection.toString().trim();
        
        // Nếu chọn ký tự CJK đơn, mở rộng bằng Intl.Segmenter
        if (selectedText.length === 1 && typeof Intl !== 'undefined' && Intl.Segmenter) {
            try {
                var range = selection.getRangeAt(0);
                var fullText = range.startContainer.textContent || '';
                var offset = range.startOffset;
                var segmenter = new Intl.Segmenter('zh', { granularity: 'word' });
                var segments = Array.from(segmenter.segment(fullText));
                
                for (var i = 0; i < segments.length; i++) {
                    var seg = segments[i];
                    if (offset >= seg.index && offset < seg.index + seg.segment.length) {
                        // Tìm thấy từ có nghĩa bao quanh
                        var newRange = document.createRange();
                        newRange.setStart(range.startContainer, seg.index);
                        newRange.setEnd(range.startContainer, seg.index + seg.segment.length);
                        selection.removeAllRanges();
                        selection.addRange(newRange);
                        break;
                    }
                }
            } catch(err) {
                console.warn('Hanzii segmentation expand error:', err);
            }
        }
    });
})();
"""

def on_webview_will_set_text(text: str, webview: AnkiWebView) -> str:
    """Nhúng JavaScript tự động mở rộng vùng bôi đen vào reviewer thẻ"""
    script_tag = f"<script>{JS_SELECTION_HOOK}</script>"
    return text + script_tag

def init_addon():
    gui_hooks.webview_will_set_text.append(on_webview_will_set_text)

init_addon()
