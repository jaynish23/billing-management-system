import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LoaderProvider } from './context/LoaderContext';
import { NotificationProvider } from './context/NotificationContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import District from './pages/District';
import State from './pages/State';
import Dukan from './pages/Dukan';
import Mill from './pages/Mill';
import Marko from './pages/Marko';
import MillList from './pages/Ledger/MillList';
import MillLedger from './pages/Ledger/MillLedger';
import DukanList from './pages/Ledger/DukanList';
import DukanLedger from './pages/Ledger/DukanLedger';
import DashboardLayout from './components/DashboardLayout';
import Profile from './pages/Profile';
import BillConfiguration from './pages/BillConfiguration';
import './i18n';

function AppContent() {
  const { i18n, t } = useTranslation();
  const location = useLocation();

  // Global Theme Engine State for Auth Pages
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/';

  return (
    <div className="min-h-screen bg-bg-base text-text-primary flex flex-col font-sans transition-colors duration-300">
      {isAuthPage && (
        <header className="absolute top-0 right-0 p-6 w-full flex justify-end z-20 pointer-events-none">
          <button 
            id="theme-toggle-auth"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="bg-bg-lighter/75 dark:bg-bg-darker/75 backdrop-blur-md rounded-xl p-2.5 shadow-md border border-border-base/50 flex items-center justify-center text-text-primary hover:bg-bg-base/80 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer pointer-events-auto select-none"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <span className="flex items-center gap-2 text-xs font-semibold">
                <span>☀️</span>
                <span>Light Mode</span>
              </span>
            ) : (
              <span className="flex items-center gap-2 text-xs font-semibold">
                <span>🌙</span>
                <span>Dark Mode</span>
              </span>
            )}
          </button>
        </header>
      )}

      <main className="flex-1 flex flex-col p-0">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected dashboard layout wrapper */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/bill-configuration" element={<BillConfiguration />} />
            <Route path="/district" element={<District />} />
            <Route path="/state" element={<State />} />
            <Route path="/dukan" element={<Dukan />} />
            <Route path="/mill" element={<Mill />} />
            <Route path="/marko" element={<Marko />} />
            <Route path="/mill-list" element={<MillList />} />
            <Route path="/mill-ledger/:id" element={<MillLedger />} />
            <Route path="/dukan-list" element={<DukanList />} />
            <Route path="/dukan-ledger/:id" element={<DukanLedger />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <NotificationProvider>
      <LoaderProvider>
        <Router>
          <AppContent />
        </Router>
      </LoaderProvider>
    </NotificationProvider>
  );
}

export default App;
