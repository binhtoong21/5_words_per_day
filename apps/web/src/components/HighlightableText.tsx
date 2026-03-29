import { useState, useRef, useEffect } from 'react';
import { Languages, MessageSquare, Plus, Volume2 } from 'lucide-react';
import { clsx } from 'clsx';

interface HighlightableTextProps {
  text: string;
  onTranslate?: (word: string) => void;
  onAskAi?: (word: string, context: string) => void;
  onAddWord?: (word: string) => void;
  onHighlight?: (word: string) => void;
}

export function HighlightableText({ text, onTranslate, onAskAi, onAddWord, onHighlight }: HighlightableTextProps) {
  const [activeTokenIndex, setActiveTokenIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActiveTokenIndex(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const tokens = text.split(/([a-zA-Z0-9]+(?:'[a-zA-Z0-9]+)*)/g);

  return (
    <div 
      ref={containerRef}
      className="text-lg md:text-xl leading-loose text-slate-800 font-serif"
    >
      {tokens.map((token, index) => {
        const isWord = /^[a-zA-Z0-9]+(?:'[a-zA-Z0-9]+)*$/.test(token);
        if (!isWord) {
          return <span key={index}>{token}</span>;
        }

        const isActive = activeTokenIndex === index;

        return (
          <span key={index} className="relative inline-block">
            <span
              onClick={() => setActiveTokenIndex(isActive ? null : index)}
              className={clsx(
                "cursor-pointer transition-colors duration-200 rounded px-0.5",
                isActive ? "bg-indigo-200 text-indigo-900" : "hover:bg-indigo-100"
              )}
            >
              {token}
            </span>

            {isActive && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 flex items-center gap-1 bg-slate-900 p-1.5 rounded-xl shadow-xl border border-slate-700 animate-in fade-in zoom-in-95 duration-200">
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 rotate-45 border-r border-b border-slate-700"></div>
                
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    const u = new SpeechSynthesisUtterance(token);
                    u.lang = 'en-US'; u.rate = 0.9;
                    window.speechSynthesis.cancel();
                    window.speechSynthesis.speak(u);
                  }}
                  className="flex flex-col items-center justify-center w-12 h-10 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition"
                  title="Phát âm"
                >
                  <Volume2 className="w-4 h-4 mb-1" />
                  <span className="text-[10px] font-bold">Listen</span>
                </button>

                {onTranslate && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onTranslate(token); setActiveTokenIndex(null); }}
                    className="flex flex-col items-center justify-center w-12 h-10 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition"
                    title="Dịch nhanh"
                  >
                    <Languages className="w-4 h-4 mb-1" />
                    <span className="text-[10px] font-bold">Dịch</span>
                  </button>
                )}
                
                {onAskAi && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onAskAi(token, text); setActiveTokenIndex(null); }}
                    className="flex flex-col items-center justify-center w-12 h-10 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition"
                    title="Hỏi AI"
                  >
                    <MessageSquare className="w-4 h-4 mb-1" />
                    <span className="text-[10px] font-bold">Ask AI</span>
                  </button>
                )}

                {(onAddWord || onHighlight) && (
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      if (onAddWord) onAddWord(token); 
                      else if (onHighlight) onHighlight(token);
                      setActiveTokenIndex(null); 
                    }}
                    className="flex flex-col items-center justify-center w-12 h-10 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition"
                    title="Lưu vào Kho"
                  >
                    <Plus className="w-4 h-4 mb-1" />
                    <span className="text-[10px] font-bold">Save</span>
                  </button>
                )}
              </div>
            )}
          </span>
        );
      })}
    </div>
  );
}
