import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService } from '../services/authService';
import { useLoader } from '../context/LoaderContext';
import { useNotification } from '../context/NotificationContext';

function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const { showLoader, hideLoader, isLoading } = useLoader();
  const { showSuccess, showError } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("[Auth-Login] Starting login request...");
    console.log("[Auth-Login] API Base URL configured is:", import.meta.env.VITE_API_BASE_URL);
    console.log("[Auth-Login] Payload username:", formData.username);

    try {
      showLoader('Authenticating credentials...');
      setError('');
      const response = await authService.login(formData.username, formData.password);
      console.log("[Auth-Login] Response received:", response);
      
      if (response.status === 'success') {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        hideLoader();
        showSuccess('Login Successful', `Welcome back, ${response.user?.firstName || ''} ${response.user?.lastName || ''}`.trim() || 'Welcome back!');
        navigate('/dashboard');
      } else {
        const errorMessage = response.message || 'Invalid username or password.';
        console.warn("[Auth-Login] Login not successful. Message:", errorMessage);
        setError(errorMessage);
        hideLoader();
        showError('Login Failed', errorMessage);
      }
    } catch (err) {
      console.error("[Auth-Login] Exception occurred during login request:", err);
      if (err.response) {
        console.error("[Auth-Login] Server responded with error status:", err.response.status, "data:", err.response.data);
      } else if (err.request) {
        console.error("[Auth-Login] No response received. The request was made but backend may be offline, port wrong, or CORS blocked:", err.request);
      } else {
        console.error("[Auth-Login] Request setup error:", err.message);
      }
      const errorMessage = err.response?.data?.message || 'Invalid username or password.';
      setError(errorMessage);
      hideLoader();
      showError('Login Failed', errorMessage);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row transition-colors duration-300">
      
      {/* Left Side: Illustration Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-950 text-white flex-col justify-between p-12 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none" />
        
        {/* Logo/Branding */}
        <div className="flex items-center gap-2.5 z-10 select-none">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center font-bold text-white shadow-md">
            B
          </div>
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
            Broker System
          </span>
        </div>

        {/* Core Content */}
        <div className="my-auto space-y-8 z-10 max-w-md mx-auto">
          <div className="flex justify-center">
            <img 
              src="/auth_security_shield.png" 
              alt="Broker System Analytics & Security" 
              className="w-72 h-72 object-contain drop-shadow-[0_0_40px_rgba(37,99,235,0.2)] animate-pulse-glow"
            />
          </div>
          <div className="space-y-3">
            <h1 className="text-3.5xl font-black tracking-tight leading-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
              Welcome to Broker System
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Manage your billing, ledgers and transactions from one centralized platform.
            </p>
          </div>
          <ul className="space-y-3 pt-4 text-xs font-semibold text-slate-300">
            <li className="flex items-center gap-3">
              <span className="w-5 h-5 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center text-[10px] shadow-sm select-none">✔</span>
              <span>Secure & Reliable</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-5 h-5 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center text-[10px] shadow-sm select-none">✔</span>
              <span>Real-time Analytics</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-5 h-5 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center text-[10px] shadow-sm select-none">✔</span>
              <span>Smart Management</span>
            </li>
          </ul>
        </div>

        {/* Footer */}
        <div className="z-10 text-[10px] font-bold tracking-wider text-slate-500 uppercase select-none">
          &copy; 2026 Broker System. All rights reserved.
        </div>
      </div>

      {/* Right Side: Authentication Panel */}
      <div className="w-full lg:w-1/2 min-h-screen flex items-center justify-center p-6 sm:p-12 bg-bg-base transition-colors duration-300 relative">
        {/* Glow decorations for light mode */}
        <div className="absolute top-1/4 left-1/4 w-[150px] h-[150px] bg-blue-500/5 dark:bg-transparent rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[150px] h-[150px] bg-purple-500/5 dark:bg-transparent rounded-full blur-[80px] pointer-events-none" />

        <div className="w-full max-w-md space-y-8 animate-fade-in-up z-10">
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
              Welcome Back! 👋
            </h2>
            <p className="mt-2 text-sm text-text-muted font-medium">
              Sign in to continue to your dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block" htmlFor="username">
                Username / Email Address
              </label>
              <div className="relative mt-1.5">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="w-full bg-bg-lighter border border-border-base rounded-xl py-3.5 pl-11 pr-4 text-xs font-medium text-text-primary focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder-text-muted"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter username or email"
                />
                <span className="absolute left-4 top-[15px] text-text-muted text-sm pointer-events-none select-none">👤</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block" htmlFor="password">
                  Password
                </label>
              </div>
              <div className="relative mt-1.5">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="w-full bg-bg-lighter border border-border-base rounded-xl py-3.5 pl-11 pr-4 text-xs font-medium text-text-primary focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder-text-muted"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                />
                <span className="absolute left-4 top-[15px] text-text-muted text-sm pointer-events-none select-none">🔒</span>
              </div>
            </div>

            {error && (
              <div className="text-xs font-bold text-red-500 flex items-center gap-1.5 pt-1">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-1 select-none">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-text-secondary">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-border-base text-blue-600 bg-bg-base focus:ring-blue-500 cursor-pointer"
                />
                <span>Remember me</span>
              </label>
              <a 
                href="#" 
                onClick={(e) => { 
                  e.preventDefault(); 
                  Swal.fire({ 
                    title: 'Forgot Password?', 
                    text: 'Please contact your administrator to reset your enterprise password.', 
                    icon: 'info', 
                    confirmButtonColor: '#2563EB', 
                    background: 'var(--color-bg-lighter)', 
                    color: 'var(--color-text-primary)' 
                  }); 
                }} 
                className="text-xs font-bold text-blue-600 hover:text-blue-500 transition-colors"
              >
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all active:scale-[0.98] cursor-pointer mt-8 select-none"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4.5 w-4.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Signing In...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <span>Login</span>
                  <span>➔</span>
                </span>
              )}
            </button>
          </form>

          <div className="relative flex py-2 items-center select-none">
            <div className="flex-grow border-t border-border-base/60"></div>
            <span className="flex-shrink mx-4 text-text-muted text-[10px] font-extrabold uppercase tracking-wider">or continue with</span>
            <div className="flex-grow border-t border-border-base/60"></div>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-3 gap-3">
            <button 
              onClick={() => Swal.fire({ title: 'Social Sign In', text: 'Social authentication is not configured for this enterprise workspace.', icon: 'info', confirmButtonColor: '#2563EB', background: 'var(--color-bg-lighter)', color: 'var(--color-text-primary)' })} 
              className="flex items-center justify-center gap-2 py-3 px-2 bg-bg-lighter hover:bg-bg-base border border-border-base rounded-xl text-[11px] font-bold text-text-secondary hover:text-text-primary transition cursor-pointer select-none"
            >
              <span>🌐</span>
              <span>Google</span>
            </button>
            <button 
              onClick={() => Swal.fire({ title: 'Social Sign In', text: 'Social authentication is not configured for this enterprise workspace.', icon: 'info', confirmButtonColor: '#2563EB', background: 'var(--color-bg-lighter)', color: 'var(--color-text-primary)' })} 
              className="flex items-center justify-center gap-2 py-3 px-2 bg-bg-lighter hover:bg-bg-base border border-border-base rounded-xl text-[11px] font-bold text-text-secondary hover:text-text-primary transition cursor-pointer select-none"
            >
              <span>💻</span>
              <span>Microsoft</span>
            </button>
            <button 
              onClick={() => Swal.fire({ title: 'Social Sign In', text: 'Social authentication is not configured for this enterprise workspace.', icon: 'info', confirmButtonColor: '#2563EB', background: 'var(--color-bg-lighter)', color: 'var(--color-text-primary)' })} 
              className="flex items-center justify-center gap-2 py-3 px-2 bg-bg-lighter hover:bg-bg-base border border-border-base rounded-xl text-[11px] font-bold text-text-secondary hover:text-text-primary transition cursor-pointer select-none"
            >
              <span>🐙</span>
              <span>GitHub</span>
            </button>
          </div>

          <div className="text-center text-xs font-bold text-text-muted pt-5 border-t border-border-base select-none">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-500 transition-colors font-extrabold ml-1">
              Register Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
