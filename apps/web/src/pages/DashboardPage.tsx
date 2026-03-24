import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import { Link } from 'react-router-dom';
import { WordCard } from '../components/WordCard';
import { BrainCircuit, Book, ArrowRight, Loader2, Flame } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export function DashboardPage() {
  const { data: userWords, isLoading: wordsLoading } = useQuery({
    queryKey: ['dashboard-words'],
    queryFn: async () => (await api.get('/user-words')).data
  });

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => (await api.get('/user-words/stats')).data
  });

  const chartData = [
    { name: 'New', value: statsData?.statusCounts?.NEW || 0, color: '#94a3b8' },
    { name: 'Learning', value: statsData?.statusCounts?.LEARNING || 0, color: '#f59e0b' },
    { name: 'Reviewing', value: statsData?.statusCounts?.REVIEWING || 0, color: '#3b82f6' },
    { name: 'Mastered', value: statsData?.statusCounts?.MASTERED || 0, color: '#10b981' },
  ];

  const totalWords = chartData.reduce((acc, curr) => acc + curr.value, 0);
  const activeChartData = chartData.filter(d => d.value > 0);

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500 pb-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Your Dashboard</h1>
          <p className="text-slate-500 mt-2 text-lg">
            {statsData?.statusCounts?.REVIEWING > 0 
              ? `Good morning! You have ${statsData.statusCounts.REVIEWING} words to review today.` 
              : "Good morning! Ready to learn some new words?"}
          </p>
        </div>
        
        {/* Streak Indicator */}
        {!statsLoading && (
          <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl shadow-sm border border-orange-200 w-fit">
            <div className={`p-2 rounded-xl ${statsData?.streak > 0 ? 'bg-orange-100 text-orange-500' : 'bg-slate-100 text-slate-400'}`}>
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">Daily Streak</div>
              <div className="text-2xl font-black text-slate-800 leading-none">
                {statsData?.streak || 0} <span className="text-base font-bold text-slate-400">days</span>
              </div>
            </div>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="md:col-span-1 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col">
          <h2 className="text-xl font-bold text-slate-800 mb-2">Word Bank Stats</h2>
          <div className="flex-1 min-h-[220px] relative">
            {statsLoading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              </div>
            ) : totalWords === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-center px-4 font-medium">
                No words in your bank yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={activeChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {activeChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* CTAs Section */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Daily Quiz CTA */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group h-full flex flex-col justify-between">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-700">
               <BrainCircuit className="w-48 h-48" />
            </div>
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white font-bold text-sm mb-4">
                Daily Task
              </div>
              <h2 className="text-3xl font-extrabold leading-tight">Crush your<br/>daily review</h2>
              <p className="text-blue-100 mt-2 text-lg">Keep your {statsData?.streak || 0}-day streak alive!</p>
            </div>
            <Link to="/quiz?type=DAILY" className="relative z-10 mt-6 self-start inline-flex items-center gap-2 bg-white text-blue-700 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition shadow-lg hover:-translate-y-1">
              Start Quiz <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Reading CTA */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between gap-6 group hover:border-slate-300 transition">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <Book className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Read a Story</h2>
              <p className="text-slate-500 mt-2">We've generated a short story using words from your active vocabulary list.</p>
            </div>
            <Link to="/reading" className="inline-flex items-center gap-2 text-indigo-600 font-bold hover:text-indigo-700 transition">
              Read now <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-slate-800">Words needing review</h3>
          <Link to="/my-words?filter=REVIEWING" className="text-blue-600 font-bold hover:underline">View all</Link>
        </div>
          {wordsLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : userWords?.items?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userWords.items.filter((w: any) => w.status === 'REVIEWING' || w.status === 'LEARNING').slice(0, 3).map((w: any) => (
                <WordCard 
                  key={w.id} 
                  id={w.id} 
                  word={w.word.word} 
                  band={w.word.band} 
                  status={w.status} 
                  linkTo={`/my-words/${w.id}`}
                />
              ))}
            </div>
          ) : (
            <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-3xl text-slate-500 font-medium">
              Your Word Bank is empty. Go to the System Dictionary to add some words!
            </div>
          )}
      </div>
    </div>
  );
}
