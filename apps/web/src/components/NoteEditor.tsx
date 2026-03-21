import { useState } from 'react';
import { Sparkles, Save, Trash2 } from 'lucide-react';
import { api } from '../api';

interface NoteEditorProps {
  id?: string;
  userWordId: string;
  initialTitle?: string;
  initialContent?: string;
  onSave: (note: { title: string; content: string }) => void;
  onDelete?: () => void;
}

export function NoteEditor({ id, userWordId, initialTitle = '', initialContent = '', onSave, onDelete }: NoteEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [isChecking, setIsChecking] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleCheck = async () => {
    if (!id) return;
    setIsChecking(true);
    try {
      const res = await api.post('/ai/check-note', { userWordId, noteId: id });
      setFeedback(res.data.feedback);
    } catch (e) {
      setFeedback('Failed to check note.');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <input 
        className="text-lg font-bold border-none outline-none focus:ring-0 bg-transparent placeholder-slate-400 text-slate-800 w-full"
        placeholder="Note Title (e.g., In business context)"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />
      <textarea 
        className="resize-none min-h-[80px] border-none outline-none focus:ring-0 bg-transparent placeholder-slate-400 text-slate-600 w-full"
        placeholder="Write how you understand this word..."
        value={content}
        onChange={e => setContent(e.target.value)}
      />
      
      {feedback && (
        <div className="p-3 bg-indigo-50 text-indigo-800 rounded-lg text-sm whitespace-pre-wrap border border-indigo-100">
          <strong>AI Feedback:</strong> {feedback}
        </div>
      )}

      <div className="flex justify-between items-center mt-2 border-t pt-3">
        <div className="flex gap-2">
          <button 
            onClick={handleCheck}
            disabled={!id || isChecking}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            {isChecking ? 'Checking...' : 'Check with AI'}
          </button>
        </div>
        <div className="flex gap-2">
           {onDelete && (
            <button 
              onClick={onDelete}
              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
            >
              <Trash2 className="w-5 h-5" />
            </button>
           )}
          <button 
            onClick={() => onSave({ title, content })}
            disabled={!title.trim() || !content.trim()}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
