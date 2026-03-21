import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import { WordCard } from '../components/WordCard';

export function WordBankPage() {
  const [band, setBand] = useState('A1');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['words', band, search],
    queryFn: async () => {
      if (search) {
        const res = await api.get(`/words/search?q=${search}`);
        return res.data;
      }
      const res = await api.get(`/words?band=${band}`);
      return res.data.data;
    }
  });

  return (
    <div className="flex flex-col gap-6 animate-in fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">System Dictionary</h1>
          <p className="text-slate-500 mt-1">Browse all available words by CEFR band.</p>
        </div>
        <input 
          type="text"
          placeholder="Search words..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64 shadow-sm font-medium"
        />
      </div>

      {!search && (
        <div className="flex flex-wrap gap-2">
          {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(b => (
            <button 
              key={b} 
              onClick={() => setBand(b)}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition ${band === b ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              Band {b}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-28 bg-slate-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data?.map((w: any) => (
            <WordCard key={w.id} id={w.id} word={w.word} band={w.band} linkTo={`/words/${w.id}`} />
          ))}
          {data?.length === 0 && (
            <div className="col-span-full py-16 text-center text-slate-500 font-medium bg-white rounded-3xl border border-slate-100 shadow-sm">
              No words found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
