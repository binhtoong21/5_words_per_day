import { useState, useCallback, useRef } from 'react';
import { Volume2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface PlayAudioButtonProps {
  word: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Plays word pronunciation using browser Web Speech API.
 * Zero-cost, no backend needed. Works on Chrome, Edge, Safari, Firefox.
 */
export function PlayAudioButton({ word, size = 'md', className }: PlayAudioButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const sizeClasses = {
    sm: 'w-7 h-7 p-1',
    md: 'w-9 h-9 p-1.5',
    lg: 'w-11 h-11 p-2',
  };

  const iconSize = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const handlePlay = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Cancel any ongoing speech
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1;

    // Try to pick a natural-sounding English voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) => v.lang.startsWith('en') && v.name.toLowerCase().includes('natural')
    ) || voices.find(
      (v) => v.lang === 'en-US'
    ) || voices.find(
      (v) => v.lang.startsWith('en')
    );

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [word]);

  return (
    <button
      type="button"
      onClick={handlePlay}
      title={`Pronounce "${word}"`}
      className={cn(
        'inline-flex items-center justify-center rounded-full transition-all duration-300',
        'bg-indigo-50 text-indigo-600 border border-indigo-200',
        'hover:bg-indigo-100 hover:border-indigo-300 hover:shadow-md hover:scale-110',
        'active:scale-95',
        isPlaying && 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/30 animate-pulse',
        sizeClasses[size],
        className
      )}
    >
      <Volume2 className={cn(iconSize[size], isPlaying && 'animate-bounce')} />
    </button>
  );
}
