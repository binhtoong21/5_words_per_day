import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import { Link } from 'react-router-dom';
import { WordCard } from '../components/WordCard';
import { BrainCircuit, Book, ArrowRight, Loader2 } from 'lucide-react';

export function DashboardPage() {
  const { data: userWords, isLoading } = useQuery({
    queryKey: ['dashboard-words'],
    queryFn: async () => (await api.get('/user-words')).data
  });

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Your Dashboard</h1>
          <p className="text-slate-500 mt-2 text-lg">Good morning! You have 15 words to review today.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Daily Quiz CTA */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-700">
             <BrainCircuit className="w-48 h-48" />
          </div>
          <div className="relative z-10 flex flex-col h-full justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white font-bold text-sm mb-4">
                Daily Task
              </div>
              <h2 className="text-3xl font-extrabold leading-tight">Crush your<br/>daily review</h2>
              <p className="text-blue-100 mt-2 text-lg max-w-[80%]">15 words are waiting in your spaced repetition queue.</p>
            </div>
            <Link to="/quiz?type=DAILY" className="self-start inline-flex items-center gap-2 bg-white text-blue-700 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition shadow-lg hover:-translate-y-1">
              Start Quiz <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Reading CTA */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between gap-6 group hover:border-slate-300 transition">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Book className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Read a Story</h2>
            <p className="text-slate-500 mt-2">We've generated a short story using 5 words from your active vocabulary list.</p>
          </div>
          <Link to="/reading" className="inline-flex items-center gap-2 text-indigo-600 font-bold hover:text-indigo-700 transition">
            Read now <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-slate-800">Words needing review</h3>
          <Link to="/my-words?filter=REVIEWING" className="text-blue-600 font-bold hover:underline">View all</Link>
        </div>
          {isLoading ? (
            <div className="col-span-3 flex justify-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : userWords?.items?.length > 0 ? (
            userWords.items.slice(0, 3).map((w: any) => (
              <WordCard 
                key={w.id} 
                id={w.id} 
                word={w.word.word} 
                band={w.word.band} 
                status={w.status} 
                linkTo={`/my-words/${w.id}`}
              />
            ))
          ) : (
            <div className="col-span-3 text-center p-8 border-2 border-dashed border-slate-200 rounded-3xl text-slate-500 font-medium">
              Your Word Bank is empty. Go to the System Dictionary to add some words!
            </div>
          )}
      </div>
    </div>
  );
}
