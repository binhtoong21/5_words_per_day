import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import { api } from '../api';
import { BookOpen, LogIn } from 'lucide-react';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      login(
        { id: data.id, email: data.email, currentBand: data.currentBand || 'A1' },
        data.accessToken,
        data.refreshToken
      );
      navigate('/dashboard');
    } catch (e) {
      alert('Login failed. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl shadow-slate-200/50 border border-slate-100">
        <div className="flex flex-col items-center mb-10 text-center">
          <Link to="/" className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30 hover:scale-105 transition hover:rotate-3">
            <BookOpen className="w-8 h-8 text-white" />
          </Link>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Welcome back</h2>
          <p className="text-slate-500 mt-2 font-medium">Log in to continue your streak.</p>
        </div>
        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-slate-900 font-medium" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-slate-900 font-medium" placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading || !email || !password} className="w-full mt-4 flex items-center justify-center gap-2 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/30 disabled:opacity-50">
            {loading ? 'Entering...' : <><LogIn className="w-5 h-5"/> Log In</>}
          </button>
        </form>
        <div className="mt-8 text-center text-sm font-medium text-slate-600">
          Don't have an account? <Link to="/register" className="text-blue-600 hover:text-blue-700 font-bold ml-1 hover:underline">Sign up</Link>
        </div>
      </div>
    </div>
  );
}
