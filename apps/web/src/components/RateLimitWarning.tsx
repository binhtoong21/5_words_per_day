import { AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

export function RateLimitWarning({ remaining, limit }: { remaining: number; limit: number }) {
  const isLow = remaining <= limit * 0.2;
  
  if (remaining >= limit * 0.8) return null; // Don't show if mostly full

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium w-fit shadow-sm border",
      isLow ? "bg-red-50 text-red-600 border-red-100" : "bg-amber-50 text-amber-600 border-amber-100"
    )}>
      <AlertCircle className="w-4 h-4" />
      <span>{remaining} AI calls remaining today</span>
    </div>
  );
}
