import { cn } from '../lib/utils';

type Status = 'NEW' | 'LEARNING' | 'REVIEWING' | 'MASTERED';

export function ProgressBadge({ status, className }: { status: Status; className?: string }) {
  const styles = {
    NEW: 'bg-slate-100 text-slate-600',
    LEARNING: 'bg-blue-100 text-blue-700',
    REVIEWING: 'bg-amber-100 text-amber-700',
    MASTERED: 'bg-emerald-100 text-emerald-700',
  };

  return (
    <span className={cn('px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider', styles[status], className)}>
      {status}
    </span>
  );
}
