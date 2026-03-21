import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, UserCircle, Settings, Home, LogOut, FileText, BrainCircuit } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuthStore } from '../store';

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const logoutStore = useAuthStore((s: any) => s.logout);
  const user = useAuthStore((s: any) => s.user);

  const handleLogout = () => {
    logoutStore();
    navigate('/login', { replace: true });
  };

  const links = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'System Dictionary', path: '/words', icon: BookOpen },
    { name: 'My Word Bank', path: '/my-words', icon: UserCircle },
    { name: 'Quizzes', path: '/quiz', icon: BrainCircuit },
    { name: 'Reading Passages', path: '/reading', icon: FileText },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <aside className="w-72 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col shadow-2xl z-10">
        <div className="p-6 mb-4">
          <Link to="/dashboard" className="text-2xl font-bold text-white flex items-center gap-3 hover:opacity-80 transition">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-xl shadow-lg">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            Vocab<span className="text-blue-400 font-light">Pro</span>
          </Link>
        </div>
        <nav className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto">
          {links.map(l => {
            const active = location.pathname.startsWith(l.path) && (l.path !== '/words' || location.pathname === '/words');
            // Quick fix for exact matching vs prefix matching
            const isActive = l.path === '/dashboard' ? location.pathname === '/dashboard' : location.pathname.startsWith(l.path);
            
            const Icon = l.icon;
            return (
              <Link key={l.path} to={l.path} className={cn(
                "flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all font-semibold text-sm",
                isActive ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg translate-x-1" : "hover:bg-slate-800 hover:text-white hover:translate-x-1"
              )}>
                <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-400")} />
                {l.name}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
           <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-slate-800/80 text-sm border border-slate-700/50 backdrop-blur-md">
             <div className="flex items-center gap-3">
               <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-inner">
                 {user?.email?.[0]?.toUpperCase() || 'U'}
               </div>
               <div className="flex flex-col">
                 <span className="truncate max-w-[100px] font-bold text-slate-200">{user?.email?.split('@')[0] || 'User'}</span>
                 <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{user?.currentBand || 'Band A1'}</span>
               </div>
             </div>
             <Link to="/settings" className="p-2 hover:bg-slate-700 rounded-xl text-slate-400 hover:text-white transition">
               <Settings className="w-4 h-4" />
             </Link>
             <button onClick={handleLogout} className="p-2 hover:bg-red-500/20 rounded-xl text-slate-400 hover:text-red-400 transition ml-1">
               <LogOut className="w-4 h-4" />
             </button>
           </div>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto w-full relative">
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-slate-200/50 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto p-6 md:p-10 w-full relative z-10 pb-20">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
