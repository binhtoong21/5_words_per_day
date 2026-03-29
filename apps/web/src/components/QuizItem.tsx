import { useState } from 'react';
import { cn } from '../lib/utils';
import { PlayAudioButton } from './PlayAudioButton';
import { CheckCircle2, XCircle } from 'lucide-react';

interface QuizItemProps {
  id: string;
  question: string;
  options?: string[];
  /** The word this question is about — used for TTS pronunciation */
  wordText?: string;
  onSubmit: (answer: string) => Promise<{ isCorrect: boolean, correctAnswer: string }>;
}

export function QuizItem({ question, options, wordText, onSubmit }: QuizItemProps) {
  const [selected, setSelected] = useState('');
  const [result, setResult] = useState<{ isCorrect: boolean, correctAnswer: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (answer: string) => {
    if (result || loading) return;
    setLoading(true);
    setSelected(answer);
    try {
       const res = await onSubmit(answer);
       setResult(res);
    } finally {
       setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 rounded-3xl border border-slate-200 bg-white shadow-lg w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-center gap-3">
        {wordText && <PlayAudioButton word={wordText} size="md" />}
        <h3 className="text-xl md:text-2xl font-bold text-slate-800 leading-relaxed text-center">
          {question}
        </h3>
      </div>
      
      <div className="flex flex-col gap-3 mt-4">
        {options?.map(opt => {
          const isSelected = selected === opt;
          const isCorrectAnswer = result?.correctAnswer === opt;
          const isWrongSelected = result && !result.isCorrect && isSelected;

          return (
            <button
              key={opt}
              disabled={!!result || loading}
              onClick={() => handleSubmit(opt)}
              className={cn(
                "p-4 rounded-2xl text-left font-semibold transition-all duration-300 border-2 text-lg",
                !result && "border-slate-100 bg-slate-50 hover:border-blue-500 hover:bg-blue-50 hover:shadow-md text-slate-700 hover:-translate-y-0.5",
                result && !isSelected && !isCorrectAnswer && "opacity-40 border-slate-100 bg-slate-50",
                isCorrectAnswer && "border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm",
                isWrongSelected && "border-red-500 bg-red-50 text-red-800 shadow-sm"
              )}
            >
              <div className="flex items-center justify-between">
                <span>{opt}</span>
                {isCorrectAnswer && <CheckCircle2 className="w-6 h-6 text-emerald-600 animate-in zoom-in" />}
                {isWrongSelected && <XCircle className="w-6 h-6 text-red-600 animate-in zoom-in" />}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  );
}
