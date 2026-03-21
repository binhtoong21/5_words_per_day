import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import { ProgressBadge } from '../components/ProgressBadge';
import { NoteEditor } from '../components/NoteEditor';
import { AiAskPanel } from '../components/AiAskPanel';
import { ArrowLeft } from 'lucide-react';

export function UserWordDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['user-word', id],
    queryFn: async () => (await api.get(`/user-words/${id}`)).data
  });

  const saveNote = useMutation({
    mutationFn: async ({ title, content }: { title: string, content: string }) => 
      api.post(`/user-words/${id}/notes`, { title, content }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['user-word', id] })
  });

  const updateNote = useMutation({
    mutationFn: async ({ noteId, title, content }: { noteId: string, title: string, content: string }) => 
      api.patch(`/user-words/${id}/notes/${noteId}`, { title, content }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['user-word', id] })
  });

  const deleteNote = useMutation({
    mutationFn: async (noteId: string) => 
      api.delete(`/user-words/${id}/notes/${noteId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['user-word', id] })
  });
  
  if (isLoading) return <div className="animate-pulse h-64 bg-slate-100 rounded-3xl" />;
  if (!data || !data.word) return <div className="p-8 text-slate-500">Word not found</div>;

  const w = data.word;

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8 animate-in fade-in pb-20">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition w-fit font-bold">
        <ArrowLeft className="w-5 h-5" /> Back to Bank
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 flex flex-col gap-8">
          <div className="bg-white p-8 md:p-10 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-slate-100">
              <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight">{w.word}</h1>
              <div className="flex gap-3 items-center">
                 <span className="px-4 py-1.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-sm border border-slate-200">{w.band}</span>
                 <ProgressBadge status={data.status} className="text-sm px-3 py-1.5" />
              </div>
            </div>

            <div className="mt-10 space-y-10">
              {w.definitions?.map((def: any, i: number) => (
                <div key={i} className="flex flex-col gap-3">
                  <div className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-3">
                    <span className="text-slate-400 font-medium italic text-lg px-2 py-0.5 bg-slate-50 rounded-lg">{def.partOfSpeech}</span>
                    {def.meaning}
                  </div>
                  <p className="text-slate-600 border-l-4 border-slate-200 pl-5 py-2 italic text-lg leading-relaxed">"{def.example}"</p>
                </div>
              ))}
            </div>
            
            <div className="mt-10 pt-6 border-t border-slate-100 flex gap-6 text-sm text-slate-500 font-bold bg-slate-50 p-4 rounded-2xl">
               <span className="flex items-center gap-2">Correct: <span className="text-emerald-600 text-lg">{data.correctCount}</span></span>
               <span className="flex items-center gap-2">Wrong: <span className="text-red-500 text-lg">{data.wrongCount}</span></span>
               <span className="flex items-center gap-2">Streak: <span className="text-blue-600 text-lg">{data.currentStreak}</span></span>
            </div>
          </div>

          <div>
            <h3 className="text-3xl font-extrabold text-slate-800 mb-6">My Notes</h3>
            <div className="space-y-6">
              {data.notes?.map((n: any) => (
                <NoteEditor 
                  key={n.id} 
                  id={n.id} 
                  userWordId={id!} 
                  initialTitle={n.title} 
                  initialContent={n.content} 
                  onSave={(note) => updateNote.mutate({ noteId: n.id, ...note })} 
                  onDelete={() => deleteNote.mutate(n.id)}
                />
              ))}
              
              <div className="mt-8">
                <h4 className="font-bold text-slate-600 mb-4 px-2 uppercase tracking-wider text-sm">Create New Note</h4>
                <NoteEditor 
                  key={data.notes?.length || 0}
                  userWordId={id!} 
                  onSave={(note) => saveNote.mutate(note)} 
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-4 self-start sticky top-8">
          <AiAskPanel wordId={id!} />
        </div>
      </div>
    </div>
  );
}
