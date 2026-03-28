import { Link } from 'react-router-dom';
import { AlertCircle, Zap } from 'lucide-react';
import { cn } from '../lib/utils';

export function RateLimitWarning({ remaining, limit }: { remaining: number; limit: number }) {
  const isLow = remaining <= limit * 0.2;
  
  if (remaining >= limit * 0.8) return null; // Don't show if mostly full

  return (
    <div className={cn(
      "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium w-fit shadow-sm border",
      isLow ? "bg-red-50 text-red-600 border-red-100" : "bg-amber-50 text-amber-600 border-amber-100"
    )}>
      <div className="flex items-center gap-1.5">
        <AlertCircle className="w-4 h-4" />
        <span>{remaining} AI calls remaining</span>
      </div>
      {isLow && (
        <Link to="/pricing" className="flex items-center gap-1 px-2 py-1 bg-white hover:bg-slate-50 border rounded-lg text-indigo-600 hover:text-indigo-700 transition font-bold shadow-sm">
          <Zap className="w-3.5 h-3.5" /> Upgrade
        </Link>
      )}
    </div>
  );
}
