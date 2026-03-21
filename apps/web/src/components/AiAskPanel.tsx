import { useState } from 'react';
import { Send, Bot } from 'lucide-react';
import { api } from '../api';

export function AiAskPanel({ wordId }: { wordId: string }) {
  const [question, setQuestion] = useState('');
  const [chat, setChat] = useState<{role: 'user'|'ai', text: string}[]>([]);
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!question.trim()) return;
    const q = question;
    setChat(prev => [...prev, { role: 'user', text: q }]);
    setQuestion('');
    setLoading(true);

    try {
      const res = await api.post('/ai/ask', { wordId, question: q });
      setChat(prev => [...prev, { role: 'ai', text: res.data.answer }]);
    } catch {
      setChat(prev => [...prev, { role: 'ai', text: 'Error fetching response.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[400px] border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-lg">
      <div className="bg-slate-800 text-white p-3 font-bold flex items-center gap-2">
        <Bot className="w-5 h-5" /> Ask AI about this word
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-slate-50">
        {chat.length === 0 && (
          <div className="text-center text-slate-500 text-sm mt-10">
            Ask any questions about usage, grammar, or nuances!
          </div>
        )}
        {chat.map((m, i) => (
          <div key={i} className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
            m.role === 'user' ? 'bg-blue-600 text-white self-end rounded-tr-sm shadow-md' : 'bg-white border border-slate-200 text-slate-800 self-start rounded-tl-sm shadow-sm'
          }`}>
            {m.text}
          </div>
        ))}
        {loading && (
          <div className="flex gap-1 text-slate-400 self-start p-2">
             <span className="animate-bounce">●</span><span className="animate-bounce delay-100">●</span><span className="animate-bounce delay-200">●</span>
          </div>
        )}
      </div>

      <div className="p-3 bg-white border-t border-slate-200 flex gap-2">
        <input 
          maxLength={200}
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          className="flex-1 px-4 py-2 rounded-xl bg-slate-100 border-none outline-none focus:ring-2 focus:ring-blue-500 transition text-sm text-slate-800"
          placeholder="e.g., Can I use this in formal writing?"
        />
        <button 
          onClick={send}
          disabled={loading || !question.trim()}
          className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition shadow-sm"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
