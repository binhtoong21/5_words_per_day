import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import { PlayAudioButton } from '../components/PlayAudioButton';
import { ArrowLeft, Plus } from 'lucide-react';

export function SystemWordDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['word', id],
    queryFn: async () => (await api.get(`/words/${id}`)).data
  });

  const addToBank = useMutation({
    mutationFn: async () => api.post('/user-words', { wordId: id }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-words'] });
      navigate('/my-words');
    }
  });

  if (isLoading) return <div className="animate-pulse h-64 bg-slate-100 rounded-3xl" />;
  if (!data) return <div className="p-8 text-slate-500">Word not found</div>;

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6 animate-in fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition w-fit font-bold">
        <ArrowLeft className="w-5 h-5" /> Back
      </button>
      
      <div className="bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-4">
              <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight">{data.word}</h1>
              <PlayAudioButton word={data.word} size="lg" />
            </div>
            {data.phonetic && <p className="mt-2 text-lg text-slate-500 font-medium italic">{data.phonetic}</p>}
            <div className="mt-4 flex gap-3">
               <span className="px-4 py-1.5 bg-blue-100 text-blue-700 font-bold rounded-xl text-sm border border-blue-200">{data.band}</span>
            </div>
          </div>
          <button 
            onClick={() => addToBank.mutate()}
            disabled={addToBank.isPending}
            className="flex items-center gap-2 px-6 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition shadow-lg hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            <Plus className="w-5 h-5" /> Add to My Bank
          </button>
        </div>

        <div className="mt-10 space-y-10">
           {data.definitions?.map((def: any, i: number) => (
             <div key={i} className="flex flex-col gap-3">
               <div className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-3">
                 <span className="text-slate-400 font-medium italic text-lg px-2 py-0.5 bg-slate-50 rounded-lg">{def.partOfSpeech}</span>
                 {def.meaning}
               </div>
               <p className="text-slate-600 border-l-4 border-slate-200 pl-5 py-2 italic text-lg leading-relaxed">"{def.example}"</p>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
