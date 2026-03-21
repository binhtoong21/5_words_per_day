import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import { Trophy } from 'lucide-react';

export function QuizResultPage() {
  const { id } = useParams();
  
  const { data: quiz, isLoading } = useQuery({
    queryKey: ['quiz', id],
    queryFn: async () => (await api.get(`/quizzes/${id}`)).data
  });

  if (isLoading) return <div className="animate-pulse h-64 bg-slate-100 rounded-3xl max-w-xl mx-auto mt-10" />;

  const correct = quiz?.items?.filter((i: any) => i.isCorrect).length || 0;
  const total = quiz?.items?.length || 1;
  const score = Math.round((correct / total) * 100);

  return (
    <div className="max-w-xl mx-auto flex flex-col items-center text-center gap-6 mt-10 animate-in zoom-in duration-500">
      <div className="w-28 h-28 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full flex items-center justify-center text-white shadow-2xl shadow-amber-500/40 mb-4 animate-bounce">
        <Trophy className="w-14 h-14" />
      </div>
      <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight">Quiz Complete!</h1>
      <div className="bg-white px-8 py-4 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4 mt-2">
        <span className="text-4xl font-black text-blue-600">{score}%</span>
        <div className="h-8 w-px bg-slate-200" />
        <span className="text-slate-500 font-medium whitespace-nowrap">{correct} correct / {total} total</span>
      </div>

      <div className="w-full flex flex-col sm:flex-row gap-4 mt-8">
        <Link to="/quiz" className="flex-1 py-4 bg-white border-2 border-slate-200 text-slate-700 font-bold text-lg rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition shadow-sm">
          Take Another
        </Link>
        <Link to="/dashboard" className="flex-1 py-4 bg-blue-600 text-white font-bold text-lg rounded-2xl shadow-xl shadow-blue-500/30 hover:bg-blue-700 hover:-translate-y-1 transition">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
