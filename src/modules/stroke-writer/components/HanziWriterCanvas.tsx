import React, { useEffect, useRef } from 'react';
import HanziWriter from 'hanzi-writer';
import { StrokeWriterProps } from '../types';
import { isSingleChineseChar } from '../rules';
import { RotateCcw } from 'lucide-react';

export const HanziWriterCanvas: React.FC<StrokeWriterProps> = ({
  character,
  size = 120,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const writerRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || !isSingleChineseChar(character)) return;

    containerRef.current.innerHTML = '';

    try {
      writerRef.current = HanziWriter.create(containerRef.current, character, {
        width: size,
        height: size,
        padding: 5,
        showOutline: true,
        strokeAnimationSpeed: 1,
        delayBetweenStrokes: 150,
        strokeColor: '#1e3a8a',
        radicalColor: '#2563eb',
        outlineColor: '#cbd5e1',
      });
      writerRef.current.animateCharacter();
    } catch (e) {
      console.warn('HanziWriter load error:', e);
    }

    return () => {
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, [character, size]);

  if (!isSingleChineseChar(character)) {
    return null;
  }

  const handleReplay = () => {
    if (writerRef.current) {
      writerRef.current.animateCharacter();
    }
  };

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-1 bg-slate-50 shadow-inner">
        <div ref={containerRef} className="cursor-pointer" onClick={handleReplay} />
      </div>
      <button
        onClick={handleReplay}
        className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-blue-600 transition-colors"
        title="Xem lại quy tắc bút thuận"
      >
        <RotateCcw className="w-3 h-3" />
        <span>Xem lại nét viết</span>
      </button>
    </div>
  );
};
