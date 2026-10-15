import React, { useState, useEffect, useRef } from 'react';

export const ScreenSnipper: React.FC = () => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentPoint, setCurrentPoint] = useState<{ x: number; y: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState<string>('Kéo chuột để chọn vùng cần tra cứu');

  const containerRef = useRef<HTMLDivElement>(null);

  // Lắng nghe sự kiện mở lại Snipper để reset trạng thái
  useEffect(() => {
    let unlistenFn: (() => void) | null = null;
    if (typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__) {
      import('@tauri-apps/api/event')
        .then(({ listen }) => {
          return listen('snipper-opened', () => {
            setIsSelecting(false);
            setStartPoint(null);
            setCurrentPoint(null);
            setIsProcessing(false);
            setStatusText('Kéo chuột để chọn vùng cần tra cứu');
          });
        })
        .then((unlisten) => {
          unlistenFn = unlisten;
        })
        .catch(() => {});
    }
    return () => {
      if (unlistenFn) unlistenFn();
    };
  }, []);

  const handleClose = () => {
    if (typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__) {
      import('@tauri-apps/api/core')
        .then(({ invoke }) => invoke('hide_snipper_window'))
        .catch(() => {});
    }
  };

  // Nhấn phím Escape để hủy
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click chuột phải để hủy
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    handleClose();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 || isProcessing) return; // Chỉ nhận chuột trái
    setIsSelecting(true);
    setStartPoint({ x: e.clientX, y: e.clientY });
    setCurrentPoint({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isSelecting || isProcessing) return;
    setCurrentPoint({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = async (e: React.MouseEvent) => {
    if (!isSelecting || !startPoint || !currentPoint || isProcessing) return;
    setIsSelecting(false);

    const left = Math.min(startPoint.x, currentPoint.x);
    const top = Math.min(startPoint.y, currentPoint.y);
    const width = Math.abs(currentPoint.x - startPoint.x);
    const height = Math.abs(currentPoint.y - startPoint.y);

    if (width < 10 || height < 10) {
      // Vùng chọn quá nhỏ -> coi như click nhầm, đóng snipper
      handleClose();
      return;
    }

    setIsProcessing(true);
    setStatusText('Đang nhận diện chữ Hán (Windows OCR)...');

    // Quy đổi tọa độ CSS sang tọa độ vật lý màn hình (Physical Screen Pixels)
    const dpr = window.devicePixelRatio || 1;
    const physX = Math.round(left * dpr);
    const physY = Math.round(top * dpr);
    const physW = Math.round(width * dpr);
    const physH = Math.round(height * dpr);

    if (typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('execute_screen_ocr', {
          x: physX,
          y: physY,
          width: physW,
          height: physH,
        });
      } catch (err) {
        console.error('Lỗi khi thực hiện OCR:', err);
        handleClose();
      }
    } else {
      setTimeout(() => {
        setIsProcessing(false);
      }, 500);
    }
  };

  // Tính toán hình chữ nhật đang chọn
  let rect = { left: 0, top: 0, width: 0, height: 0 };
  if (startPoint && currentPoint) {
    rect = {
      left: Math.min(startPoint.x, currentPoint.x),
      top: Math.min(startPoint.y, currentPoint.y),
      width: Math.abs(currentPoint.x - startPoint.x),
      height: Math.abs(currentPoint.y - startPoint.y),
    };
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-screen h-screen select-none cursor-crosshair overflow-hidden"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.28)' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onContextMenu={handleContextMenu}
    >
      {/* Hướng dẫn trên đầu màn hình */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 flex items-center gap-3 bg-slate-900/90 text-white px-5 py-2.5 rounded-full shadow-2xl border border-slate-700/80 backdrop-blur-md pointer-events-none text-xs font-medium z-50">
        <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>{statusText}</span>
        <span className="text-slate-400 border-l border-slate-700 pl-3">Nhấn <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 font-mono text-[11px]">Esc</kbd> hoặc chuột phải để hủy</span>
      </div>

      {/* Khung chữ nhật đang kéo chọn */}
      {isSelecting && rect.width > 2 && rect.height > 2 && (
        <div
          className="absolute border-2 border-blue-500 bg-blue-500/10 pointer-events-none transition-none shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]"
          style={{
            left: `${rect.left}px`,
            top: `${rect.top}px`,
            width: `${rect.width}px`,
            height: `${rect.height}px`,
          }}
        >
          {/* Huy hiệu hiển thị kích thước vùng chọn */}
          <div className="absolute -bottom-7 right-0 bg-blue-600 text-white font-mono text-[10px] font-semibold px-2 py-0.5 rounded shadow">
            {rect.width} × {rect.height} px
          </div>
        </div>
      )}

      {/* Hiệu ứng Spinner khi đang OCR */}
      {isProcessing && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
          <div className="bg-slate-900 border border-slate-700 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4">
            <svg
              className="animate-spin h-6 w-6 text-blue-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>
            <div className="text-sm font-semibold">Đang nhận diện ký tự chữ Hán...</div>
          </div>
        </div>
      )}
    </div>
  );
};
