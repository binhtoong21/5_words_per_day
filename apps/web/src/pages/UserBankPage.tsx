import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import { WordCard } from '../components/WordCard';

export function UserBankPage() {
  const [filter, setFilter] = useState<'ALL' | 'NEW' | 'LEARNING' | 'REVIEWING' | 'MASTERED'>('ALL');

  const { data, isLoading } = useQuery({
    queryKey: ['my-words'],
    queryFn: async () => {
      const res = await api.get('/user-words');
      return res.data; 
    }
  });

  const filtered = data?.filter((uw: any) => filter === 'ALL' || uw.status === filter);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800">My Word Bank</h1>
        <p className="text-slate-500 mt-1 pb-2">Words you are actively learning and reviewing.</p>
      </div>

      <div className="flex flex-wrap gap-2 pb-4">
        {['ALL', 'NEW', 'LEARNING', 'REVIEWING', 'MASTERED'].map(f => (
          <button 
            key={f} 
            onClick={() => setFilter(f as any)}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition ${filter === f ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-28 bg-slate-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filtered?.map((uw: any) => (
            <WordCard key={uw.id} id={uw.id} word={uw.word?.word} band={uw.word?.band} status={uw.status} linkTo={`/my-words/${uw.id}`} />
          ))}
          {filtered?.length === 0 && (
            <div className="col-span-full py-16 text-center text-slate-500 font-medium bg-white rounded-3xl border border-slate-100 shadow-sm">
              No words in this category.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
