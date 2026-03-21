import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { api } from '../api';
import { BookOpenText } from 'lucide-react';

export function ReadingSetupPage() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');

  const createPassage = useMutation({
    mutationFn: async () => api.post('/passages', { topic: topic || undefined }),
    onSuccess: (res) => navigate(`/reading/${res.data.id}`)
  });

  return (
    <div className="max-w-xl mx-auto flex flex-col items-center text-center gap-6 mt-10 animate-in fade-in">
      <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/30">
        <BookOpenText className="w-12 h-12" />
      </div>
      <h1 className="text-5xl font-extrabold text-slate-800 tracking-tight">AI Reading Log</h1>
      <p className="text-slate-500 text-lg max-w-md">Read stories dynamically generated to include the words you are currently learning.</p>

      <div className="w-full flex flex-col gap-4 mt-8 text-left">
        <label className="block text-sm font-bold text-slate-700 mb-1 pl-1">Topic (Optional)</label>
        <input 
          type="text" 
          placeholder="e.g., Technology, History, Science Fiction..."
          value={topic}
          onChange={e => setTopic(e.target.value)}
          className="w-full px-5 py-4 border-2 border-slate-200 bg-white rounded-2xl focus:border-indigo-500 outline-none transition shadow-sm font-medium"
        />
      </div>

      <button 
        onClick={() => createPassage.mutate()}
        disabled={createPassage.isPending}
        className="w-full py-5 mt-4 bg-indigo-600 text-white font-extrabold text-lg rounded-2xl shadow-xl shadow-indigo-500/30 hover:bg-indigo-700 hover:-translate-y-1 transition disabled:opacity-50 disabled:hover:translate-y-0"
      >
        {createPassage.isPending ? 'Writing story...' : 'Generate AI Story'}
      </button>
    </div>
  );
}
