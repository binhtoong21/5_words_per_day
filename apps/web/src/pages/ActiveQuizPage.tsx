import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import { QuizItem } from '../components/QuizItem';

export function ActiveQuizPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: quiz, isLoading } = useQuery({
    queryKey: ['quiz', id],
    queryFn: async () => (await api.get(`/quizzes/${id}`)).data,
    refetchOnWindowFocus: false,
    staleTime: Infinity
  });

  const submitAnswer = async (answer: string) => {
    const itemId = quiz.items[currentIndex].id;
    const res = await api.post(`/quizzes/${id}/answer`, { quizItemId: itemId, answer });
    return res.data; 
  };

  const nextQuestion = () => {
    if (currentIndex < quiz.items.length - 1) {
      setCurrentIndex(c => c + 1);
    } else {
      api.post(`/quizzes/${id}/complete`).then(() => {
        navigate(`/quiz/${id}/result`, { replace: true });
      });
    }
  };

  if (isLoading) return <div className="animate-pulse h-96 bg-slate-100 rounded-3xl" />;
  if (!quiz) return <div className="text-center p-10 font-bold text-slate-500">Quiz not found</div>;

  const currentItem = quiz.items[currentIndex];

  return (
    <div className="flex flex-col items-center animate-in fade-in pb-20">
      <div className="w-full max-w-2xl flex items-center justify-between mb-8 font-bold text-slate-500 tracking-wide">
        <span>QUESTION {currentIndex + 1} OF {quiz.items.length}</span>
        <div className="flex gap-1.5 flex-1 ml-6 max-w-xs">
           {quiz.items.map((_: any, i: number) => (
             <div key={i} className={`flex-1 h-3 rounded-full transition-colors duration-300 ${i === currentIndex ? 'bg-blue-600 shadow-sm' : i < currentIndex ? 'bg-emerald-400 opacity-60' : 'bg-slate-200'}`} />
           ))}
        </div>
      </div>

      {currentItem ? (
        <QuizItem 
          key={currentItem.id} 
          id={currentItem.id}
          question={currentItem.questionText}
          options={currentItem.options}
          onSubmit={submitAnswer}
        />
      ) : (
        <div>Error loading question data</div>
      )}

      <div className="mt-8 flex justify-end w-full max-w-2xl">
         <button 
           onClick={nextQuestion}
           className="px-8 py-3.5 bg-slate-900 text-white font-bold text-lg rounded-2xl shadow-xl hover:bg-slate-800 transition hover:-translate-y-0.5 active:translate-y-0"
         >
           {currentIndex < quiz.items.length - 1 ? 'Next Question' : 'Finish Quiz'}
         </button>
      </div>
    </div>
  );
}
