import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import { api } from '../api';
import { Check, Star } from 'lucide-react';

export function PricingPage() {
  const [loading, setLoading] = useState(false);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const handleUpgrade = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    try {
      setLoading(true);
      const { data } = await api.post('/payment/checkout');
      // Redirect to Stripe Checkout URL
      window.location.href = data.url;
    } catch (e) {
      alert('Could not initiate checkout session.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12 font-sans px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight mb-4">
          Supercharge Your Learning
        </h1>
        <p className="text-lg text-slate-600 mb-12 max-w-2xl mx-auto">
          Get 10x the daily AI limits to learn words faster and explore deeper contexts without interruption.
        </p>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto text-left">
          {/* Free Tier */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative flex flex-col">
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Free Plan</h3>
            <div className="text-slate-500 mb-6 font-medium">Standard access for casual learners.</div>
            <div className="text-4xl font-extrabold text-slate-800 mb-8">$0<span className="text-lg text-slate-500 font-medium">/mo</span></div>
            
            <ul className="space-y-4 mb-8 flex-grow">
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-emerald-500" />
                <span className="text-slate-700 font-medium">Full access to words</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-emerald-500" />
                <span className="text-slate-700 font-medium">Basic AI Assistance</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-emerald-500" />
                <span className="text-slate-700 font-medium">Standard Daily Quotes</span>
              </li>
            </ul>

            <button disabled className="w-full py-4 bg-slate-100 text-slate-500 font-bold rounded-xl cursor-not-allowed">
              Your Current Plan
            </button>
          </div>

          {/* Premium Tier */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-8 border border-indigo-400 shadow-xl shadow-indigo-500/20 relative flex flex-col transform hover:scale-105 transition duration-300">
            <div className="absolute top-0 right-8 transform -translate-y-1/2">
              <span className="bg-amber-400 text-amber-900 text-xs font-black uppercase px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                <Star className="w-3 h-3" /> Most Popular
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Pro Plan</h3>
            <div className="text-indigo-100 mb-6 font-medium">For serious vocabulary mastery.</div>
            <div className="text-4xl font-extrabold text-white mb-8">$5<span className="text-lg text-indigo-200 font-medium">/mo</span></div>
            
            <ul className="space-y-4 mb-8 flex-grow">
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-indigo-200" />
                <span className="text-white font-medium">10x Daily AI Context Questions</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-indigo-200" />
                <span className="text-white font-medium">10x Note Verifications</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-indigo-200" />
                <span className="text-white font-medium">Unlimited Stories & Quizzes</span>
              </li>
            </ul>

            <button 
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full py-4 bg-white text-indigo-600 font-bold rounded-xl hover:bg-slate-50 transition shadow-lg disabled:opacity-75"
            >
              {loading ? 'Processing...' : 'Upgrade Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
