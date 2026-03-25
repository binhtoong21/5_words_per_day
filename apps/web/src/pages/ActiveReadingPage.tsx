import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import { HighlightableText } from '../components/HighlightableText';
import { AiAskPanel } from '../components/AiAskPanel';
import { ArrowLeft, BookOpen, Check, X } from 'lucide-react';

interface PassageHighlight {
  id: string;
  wordText: string;
  createdAt: string;
}

interface PassageData {
  id: string;
  title: string;
  content: string;
  level?: string;
  highlights: PassageHighlight[];
  passageWords: Array<{ id: string; wordId: string }>;
}

interface TranslationResult {
  id: string;
  pos: string;
  vietnamese: string;
}

export function ActiveReadingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [translatingWord, setTranslatingWord] = useState<string | null>(null);
  const [askingWord, setAskingWord] = useState<{word: string, context: string} | null>(null);

  const { data, isLoading } = useQuery<PassageData>({
    queryKey: ['reading', id],
    queryFn: async () => (await api.get(`/passages/${id}`)).data
  });

  const { data: translationData, isLoading: translationLoading } = useQuery<TranslationResult[]>({
    queryKey: ['translation', translatingWord],
    queryFn: async () => (await api.get(`/words/search?q=${translatingWord}`)).data,
    enabled: !!translatingWord
  });

  const highlight = useMutation({
    mutationFn: async (word: string) => api.post(`/passages/${id}/highlight`, { word }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reading', id] })
  });

  const addToBankFromHighlight = useMutation({
    mutationFn: async (hlId: string) => api.post(`/passages/${id}/highlights/${hlId}/add-to-kho`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reading', id] })
  });

  const addWordDirectly = useMutation({
    mutationFn: async (word: string) => api.post('/user-words', { wordId: word }),
    onSuccess: () => {
      alert(`Word added to your bank!`);
    }
  });

  if (isLoading) return <div className="animate-pulse h-96 bg-slate-100 rounded-3xl max-w-4xl mx-auto mt-10" />;
  if (!data) return <div className="text-center p-10 font-bold text-slate-500">Passage not found</div>;

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 animate-in fade-in pb-20">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/reading')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition w-fit font-bold">
          <ArrowLeft className="w-5 h-5" /> Back to Logs
        </button>
        <div className="px-4 py-1.5 bg-indigo-100 text-indigo-700 font-bold rounded-xl text-sm border border-indigo-200 uppercase tracking-wide">
          Level {data.level}
        </div>
      </div>

      <div className="bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-2xl shadow-slate-200/50">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-10 text-center font-serif">
          {data.title}
        </h1>
        
        <div className="mb-8 p-4 bg-amber-50 rounded-2xl border border-amber-100 text-amber-800 text-sm font-medium flex justify-center text-center">
           💡 Tip: Click on any word in the text to translate, ask AI, or save it!
        </div>

        <HighlightableText 
          text={data.content} 
          onTranslate={(w) => setTranslatingWord(w)}
          onAskAi={(w, ctx) => setAskingWord({ word: w, context: ctx })}
          onAddWord={(w) => addWordDirectly.mutate(w)}
          onHighlight={(w) => highlight.mutate(w)} 
        />

        <div className="mt-16 pt-8 border-t border-slate-100">
          <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2 mb-6">
            <BookOpen className="w-6 h-6 text-indigo-600" />
            Saved Highlights
          </h3>
          
          <div className="flex flex-wrap gap-3">
            {data.highlights?.length === 0 && <span className="text-slate-500 italic font-medium">No highlights yet. Select text above to save words.</span>}
            {data.highlights?.map((h) => (
              <div key={h.id} className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-2 rounded-2xl group hover:shadow-md transition">
                <span className="font-bold text-slate-700">{h.wordText}</span>
                <button 
                  onClick={() => addToBankFromHighlight.mutate(h.id)}
                  title="Add to my bank"
                  className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 transition"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {translatingWord && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800 text-lg">Translate</h3>
              <button onClick={() => setTranslatingWord(null)} className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-full transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="text-xl font-bold text-indigo-700 mb-4">{translatingWord}</div>
              {translationLoading ? (
                <div className="space-y-3">
                  <div className="h-4 bg-slate-100 rounded-full animate-pulse w-3/4" />
                  <div className="h-4 bg-slate-100 rounded-full animate-pulse w-1/2" />
                </div>
              ) : translationData && translationData.length > 0 ? (
                <div className="space-y-4">
                  {translationData.slice(0, 3).map((w) => (
                    <div key={w.id} className="text-slate-700">
                      <span className="font-serif italic text-slate-500 mr-2">{w.pos}</span>
                      {w.vietnamese}
                    </div>
                  ))}
                  <button 
                    onClick={() => { addWordDirectly.mutate(translatingWord); setTranslatingWord(null); }}
                    className="mt-4 w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition"
                  >
                    Add to Word Bank
                  </button>
                </div>
              ) : (
                <div className="text-slate-500">
                  <p>No exact match found in dictionary.</p>
                  <button 
                    onClick={() => { addWordDirectly.mutate(translatingWord); setTranslatingWord(null); }}
                    className="mt-4 w-full py-2 border-2 border-slate-200 hover:border-indigo-600 hover:text-indigo-600 font-bold rounded-xl transition text-slate-700"
                  >
                    Add anyway
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {askingWord && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg relative">
            <button 
              onClick={() => setAskingWord(null)} 
              className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white bg-slate-800 rounded-full transition backdrop-blur-md"
            >
              <X className="w-6 h-6" />
            </button>
            <AiAskPanel wordId={askingWord.word} />
          </div>
        </div>
      )}
    </div>
  );
}
