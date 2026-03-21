import { createBrowserRouter } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { WordBankPage } from './pages/WordBankPage';
import { UserBankPage } from './pages/UserBankPage';
import { SystemWordDetailPage } from './pages/SystemWordDetailPage';
import { UserWordDetailPage } from './pages/UserWordDetailPage';
import { QuizSetupPage } from './pages/QuizSetupPage';
import { ActiveQuizPage } from './pages/ActiveQuizPage';
import { QuizResultPage } from './pages/QuizResultPage';
import { ReadingSetupPage } from './pages/ReadingSetupPage';
import { ActiveReadingPage } from './pages/ActiveReadingPage';
import { SettingsPage } from './pages/SettingsPage';

export const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { 
    path: '/', 
    element: <Layout />,
    children: [
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'words', element: <WordBankPage /> },
      { path: 'words/:id', element: <SystemWordDetailPage /> },
      { path: 'my-words', element: <UserBankPage /> },
      { path: 'my-words/:id', element: <UserWordDetailPage /> },
      { path: 'quiz', element: <QuizSetupPage /> },
      { path: 'quiz/:id', element: <ActiveQuizPage /> },
      { path: 'quiz/:id/result', element: <QuizResultPage /> },
      { path: 'reading', element: <ReadingSetupPage /> },
      { path: 'reading/:id', element: <ActiveReadingPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ]
  }
]);
