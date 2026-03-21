import { ProgressBadge } from './ProgressBadge';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

interface WordCardProps {
  id: string;
  word: string;
  band: string;
  status?: 'NEW' | 'LEARNING' | 'REVIEWING' | 'MASTERED' | null;
  linkTo?: string;
}

export function WordCard({ id, word, band, status, linkTo }: WordCardProps) {
  const defaultLink = `/words/${id}`;
  
  return (
    <Link 
      to={linkTo || defaultLink}
      className={cn(
        "group flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-white",
        "hover:border-blue-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
      )}
    >
      <div className="flex flex-col gap-2 items-start">
        <span className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
          {word}
        </span>
        {status && <ProgressBadge status={status} />}
      </div>
      <div className="flex bg-slate-100 border border-slate-200 px-3 py-1 rounded-xl text-sm font-bold text-slate-600 shadow-sm">
        {band}
      </div>
    </Link>
  );
}
