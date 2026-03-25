import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import { api } from '../api';
import { BookOpen, UserPlus } from 'lucide-react';

export function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPlacementPrompt, setShowPlacementPrompt] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleTakeQuiz = async () => {
    try {
      setLoading(true);
      const { data } = await api.post('/quizzes', { type: 'BAND_TEST' });
      navigate(`/quiz/${data.id}`);
    } catch (e) {
      alert('Failed to start placement test');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', { email, password });
      login(
        { id: data.id, email: data.email, currentBand: 'A1' },
        data.accessToken,
        data.refreshToken
      );
      setShowPlacementPrompt(true);
    } catch (e) {
      alert('Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  if (showPlacementPrompt) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4 font-sans">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl shadow-slate-200/50 border border-slate-100 text-center">
          <BookOpen className="w-16 h-16 text-indigo-600 mx-auto mb-6" />
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-4">Welcome!</h2>
          <p className="text-slate-600 mb-8 font-medium">To personalize your learning experience, would you like to take a quick vocabulary placement test to determine your current English band?</p>
          <div className="flex flex-col gap-3">
            <button 
              onClick={handleTakeQuiz} 
              disabled={loading}
              className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/30 disabled:opacity-50"
            >
              {loading ? 'Starting...' : 'Take Placement Test'}
            </button>
            <button 
              onClick={() => navigate('/dashboard')}
              disabled={loading}
              className="w-full py-4 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl shadow-slate-200/50 border border-slate-100">
        <div className="flex flex-col items-center mb-10 text-center">
          <Link to="/" className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/30 hover:scale-105 transition hover:rotate-3">
            <BookOpen className="w-8 h-8 text-white" />
          </Link>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Create Account</h2>
          <p className="text-slate-500 mt-2 font-medium">Join us to master your vocabulary.</p>
        </div>
        <form onSubmit={handleRegister} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-slate-900 font-medium" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Password (Min 6 chars)</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={6} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-slate-900 font-medium" placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading || !email || password.length < 6} className="w-full mt-4 flex items-center justify-center gap-2 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/30 disabled:opacity-50">
            {loading ? 'Creating...' : <><UserPlus className="w-5 h-5"/> Sign Up</>}
          </button>
        </form>
        <div className="mt-8 text-center text-sm font-medium text-slate-600">
          Already have an account? <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-bold ml-1 hover:underline">Log in</Link>
        </div>
      </div>
    </div>
  );
}
