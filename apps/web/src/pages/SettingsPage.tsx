import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import { Settings as SettingsIcon, LogOut } from 'lucide-react';

export function SettingsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s: any) => s.user);
  const logoutStore = useAuthStore((s: any) => s.logout);

  const handleLogout = () => {
    logoutStore();
    navigate('/login', { replace: true });
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-8 animate-in fade-in">
      <div className="flex items-center gap-5">
        <div className="w-20 h-20 bg-gradient-to-br from-slate-700 to-slate-900 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-slate-900/20">
          <SettingsIcon className="w-10 h-10" />
        </div>
        <div>
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">Settings</h1>
          <p className="text-slate-500 font-medium mt-1">Manage your account preferences.</p>
        </div>
      </div>

      <div className="bg-white p-8 md:p-10 rounded-3xl border border-slate-200 shadow-2xl shadow-slate-200/50 flex flex-col gap-8">
        <div>
          <h3 className="text-xl font-bold text-slate-800 mb-4">Account Information</h3>
          <div className="px-6 py-5 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center text-slate-700 font-medium">
            <span className="font-bold">Email</span>
            <span className="text-slate-500">{user?.email || 'user@example.com'}</span>
          </div>
        </div>
        
        <div className="pt-8 border-t border-slate-100 flex justify-end">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 font-bold rounded-2xl hover:bg-red-100 transition hover:shadow-sm"
          >
            <LogOut className="w-5 h-5" /> Logout from VocabPro
          </button>
        </div>
      </div>
    </div>
  );
}
