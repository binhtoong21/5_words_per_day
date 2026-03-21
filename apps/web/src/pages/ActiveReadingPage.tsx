import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import { HighlightableText } from '../components/HighlightableText';
import { ArrowLeft, BookOpen, Check } from 'lucide-react';

export function ActiveReadingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['reading', id],
    queryFn: async () => (await api.get(`/passages/${id}`)).data
  });

  const highlight = useMutation({
    mutationFn: async (word: string) => api.post(`/passages/${id}/highlight`, { word }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reading', id] })
  });

  const addToBank = useMutation({
    mutationFn: async (hlId: string) => api.post(`/passages/${id}/highlights/${hlId}/add-to-kho`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reading', id] })
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
        
        {/* Helper text for highlighting */}
        <div className="mb-8 p-4 bg-amber-50 rounded-2xl border border-amber-100 text-amber-800 text-sm font-medium flex justify-center">
           💡 Tip: Select any unknown word in the text to highlight and save it!
        </div>

        <HighlightableText 
          text={data.content} 
          onHighlight={(w) => highlight.mutate(w)} 
        />

        <div className="mt-16 pt-8 border-t border-slate-100">
          <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2 mb-6">
            <BookOpen className="w-6 h-6 text-indigo-600" />
            Saved Highlights
          </h3>
          
          <div className="flex flex-wrap gap-3">
            {data.highlights?.length === 0 && <span className="text-slate-500 italic font-medium">No highlights yet. Select text above to save words.</span>}
            {data.highlights?.map((h: any) => (
              <div key={h.id} className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-2 rounded-2xl group hover:shadow-md transition">
                <span className="font-bold text-slate-700">{h.wordText}</span>
                <button 
                  onClick={() => addToBank.mutate(h.id)}
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
    </div>
  );
}
