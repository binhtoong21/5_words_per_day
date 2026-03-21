import { Link } from 'react-router-dom';
import { BookOpen, Sparkles, BrainCircuit, ArrowRight, FileText } from 'lucide-react';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <nav className="relative z-50 flex items-center justify-between p-6 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2 text-xl font-bold text-slate-800">
          <div className="bg-blue-600 p-2 rounded-xl">
             <BookOpen className="w-6 h-6 text-white" />
          </div>
          Vocab<span className="text-blue-600">Pro</span>
        </div>
        <div className="flex gap-4">
          <Link to="/login" className="px-5 py-2.5 text-slate-600 font-bold hover:text-slate-900 transition">Log In</Link>
          <Link to="/register" className="px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition shadow-lg">Sign Up</Link>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto -mt-20">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 font-semibold text-sm mb-8 border border-blue-100">
          <Sparkles className="w-4 h-4" /> Powered by AI Spaced Repetition
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
          Master English Vocabulary <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Without Forgetting</span>
        </h1>
        <p className="text-xl text-slate-600 mb-10 max-w-2xl leading-relaxed">
          Build your personal word bank, read AI-generated stories using your words, and take adaptive quizzes that guarantee retention.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/register" className="px-8 py-4 bg-blue-600 text-white text-lg font-bold rounded-2xl hover:bg-blue-700 transition shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2">
            Start Learning Now <ArrowRight className="w-5 h-5" />
          </Link>
          <a href="#features" className="px-8 py-4 bg-white text-slate-700 border border-slate-200 text-lg font-bold rounded-2xl hover:bg-slate-50 transition shadow-sm flex items-center justify-center">
            See How It Works
          </a>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 max-w-6xl mx-auto w-full relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight">Supercharge your learning</h2>
          <p className="text-lg text-slate-500 mt-4 max-w-2xl mx-auto">Three core features designed to take your English vocabulary from passive recognition to active mastery.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 hover:-translate-y-2 transition-transform duration-300">
            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
               <BookOpen className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">Dictionary & Notes</h3>
            <p className="text-slate-600 leading-relaxed">Save words from our curated A1-C2 dictionary. Write personalized notes and let our AI review them to ensure you grasp the nuances.</p>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 hover:-translate-y-2 transition-transform duration-300">
            <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
               <BrainCircuit className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">Spaced Repetition Quizzes</h3>
            <p className="text-slate-600 leading-relaxed">Take daily quizzes customized to your memory curve. Words you struggle with appear more often until they are mastered.</p>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 hover:-translate-y-2 transition-transform duration-300">
            <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
               <FileText className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">AI Reading Stories</h3>
            <p className="text-slate-600 leading-relaxed">Reading isolated words is boring. Our AI writes engaging short stories featuring the exact vocabulary you are currently reviewing.</p>
          </div>
        </div>
      </section>

      {/* Decorative background blur */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-400 rounded-full blur-[150px] opacity-20 pointer-events-none -z-10" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-400 rounded-full blur-[150px] opacity-20 pointer-events-none -z-10" />
    </div>
  );
}
