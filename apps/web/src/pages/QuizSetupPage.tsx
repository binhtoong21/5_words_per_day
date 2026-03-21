import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { api } from '../api';
import { BrainCircuit } from 'lucide-react';

export function QuizSetupPage() {
  const navigate = useNavigate();
  const [type, setType] = useState('DAILY');

  const createQuiz = useMutation({
    mutationFn: async () => api.post('/quizzes', { type }),
    onSuccess: (res) => navigate(`/quiz/${res.data.id}`)
  });

  return (
    <div className="max-w-xl mx-auto flex flex-col items-center text-center gap-6 mt-10 animate-in fade-in">
      <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-blue-500/30">
        <BrainCircuit className="w-12 h-12" />
      </div>
      <h1 className="text-5xl font-extrabold text-slate-800 tracking-tight">Generate Quiz</h1>
      <p className="text-slate-500 text-lg max-w-md">Our AI will generate a personalized quiz based on your Spaced Repetition schedule.</p>

      <div className="w-full flex flex-col gap-4 mt-8 text-left">
        <label className="flex items-center justify-between p-5 border-2 border-slate-200 rounded-2xl cursor-pointer hover:border-blue-500 transition-colors bg-white hover:shadow-md">
          <div className="flex flex-col">
            <span className="font-extrabold text-slate-800 text-lg tracking-tight">Daily Review</span>
            <span className="text-slate-500 text-sm font-medium mt-1">Optimal mix of new and reviewing words.</span>
          </div>
          <input type="radio" name="type" value="DAILY" checked={type === 'DAILY'} onChange={e => setType(e.target.value)} className="w-5 h-5 accent-blue-600" />
        </label>
        
        <label className="flex items-center justify-between p-5 border-2 border-slate-200 rounded-2xl cursor-pointer hover:border-blue-500 transition-colors bg-white hover:shadow-md">
          <div className="flex flex-col">
            <span className="font-extrabold text-slate-800 text-lg tracking-tight">Random Practice</span>
            <span className="text-slate-500 text-sm font-medium mt-1">Random selection from your entire bank.</span>
          </div>
          <input type="radio" name="type" value="QUICK" checked={type === 'QUICK'} onChange={e => setType(e.target.value)} className="w-5 h-5 accent-blue-600" />
        </label>
      </div>

      <button 
        onClick={() => createQuiz.mutate()}
        disabled={createQuiz.isPending}
        className="w-full py-5 mt-6 bg-blue-600 text-white font-extrabold text-lg rounded-2xl shadow-xl shadow-blue-500/30 hover:bg-blue-700 hover:-translate-y-1 transition disabled:opacity-50 disabled:hover:translate-y-0"
      >
        {createQuiz.isPending ? 'Generating with AI...' : 'Start Quiz'}
      </button>
    </div>
  );
}
