import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService } from '../services/authService';
import { useLoader } from '../context/LoaderContext';
import { useNotification } from '../context/NotificationContext';

function Register() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = Get Email, 2 = Verify OTP, 3 = Personal Info, 4 = Account Setup
  
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    firstName: '',
    lastName: '',
    username: '',
    mobileNumber: '',
    password: '',
    confirmPassword: ''
  });
  
  const [error, setError] = useState('');
  const { showLoader, hideLoader, isLoading } = useLoader();
  const { showSuccess, showError } = useNotification();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      setError(t('errors.required') || 'Email is required.');
      return;
    }
    
    try {
      showLoader('Sending OTP verification code...');
      setError('');
      await authService.sendOtp(formData.email);
      hideLoader();
      showSuccess('OTP Sent Successfully', 'Please check your email.');
      setStep(2);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to send OTP.';
      setError(errMsg);
      hideLoader();
      showError('Failed to Send OTP', errMsg);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!formData.otp || formData.otp.length !== 6) {
      setError(t('errors.otpInvalid') || 'OTP must be exactly 6 digits.');
      return;
    }
    
    try {
      showLoader('Verifying OTP...');
      setError('');
      await authService.verifyOtp(formData.email, formData.otp);
      hideLoader();
      showSuccess('OTP Verified Successfully', 'Continue registration.');
      setStep(3);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Invalid or expired OTP.';
      setError(errMsg);
      hideLoader();
      showError('OTP Verification Failed', errMsg);
    }
  };

  const handleContinueToStep4 = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.firstName || !formData.lastName) {
      setError('First name and Last name are required.');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      setError(t('errors.usernameEnglish') || 'Username must be in English characters only.');
      return;
    }

    if (!/^\d{10}$/.test(formData.mobileNumber)) {
      setError(t('errors.mobileInvalid') || 'Mobile number must be exactly 10 digits.');
      return;
    }

    setStep(4);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError(t('errors.passwordMismatch') || 'Passwords do not match.');
      return;
    }

    try {
      showLoader('Creating your account...');
      const response = await authService.register(formData);
      if (response.status === 'success') {
        hideLoader();
        showSuccess('Registration Successful', 'Your account has been created.');
        navigate('/login');
      } else {
        const errMsg = response.message || 'Registration failed.';
        setError(errMsg);
        hideLoader();
        showError('Registration Failed', errMsg);
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Registration failed.';
      setError(errMsg);
      hideLoader();
      showError('Registration Failed', errMsg);
    }
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
              src="/auth_onboarding.png" 
              alt="Broker Onboarding Illustrations" 
              className="w-72 h-72 object-contain drop-shadow-[0_0_40px_rgba(124,58,237,0.2)] animate-pulse-glow"
            />
          </div>
          <div className="space-y-3">
            <h1 className="text-3.5xl font-black tracking-tight leading-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
              Create Your Account
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Join Broker System and start managing your business efficiently.
            </p>
          </div>
          <ul className="space-y-3 pt-4 text-xs font-semibold text-slate-300">
            <li className="flex items-center gap-3">
              <span className="w-5 h-5 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center text-[10px] shadow-sm select-none">✔</span>
              <span>Easy Registration</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-5 h-5 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center text-[10px] shadow-sm select-none">✔</span>
              <span>Advanced Features</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-5 h-5 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center text-[10px] shadow-sm select-none">✔</span>
              <span>24/7 Support</span>
            </li>
          </ul>
        </div>

        {/* Footer */}
        <div className="z-10 text-[10px] font-bold tracking-wider text-slate-500 uppercase select-none">
          &copy; 2026 Broker System. All rights reserved.
        </div>
      </div>

      {/* Right Side: Stepper Card */}
      <div className="w-full lg:w-1/2 min-h-screen flex items-center justify-center p-6 sm:p-12 bg-bg-base transition-colors duration-300 relative">
        <div className="absolute top-1/4 left-1/4 w-[150px] h-[150px] bg-blue-500/5 dark:bg-transparent rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[150px] h-[150px] bg-purple-500/5 dark:bg-transparent rounded-full blur-[80px] pointer-events-none" />

        <div className="w-full max-w-md space-y-8 animate-fade-in-up z-10">
          <div>
            <h2 className="text-3xl font-extrabold text-text-primary tracking-tight">
              Create an Account
            </h2>
            <p className="mt-2 text-sm text-text-muted font-medium">
              Join the Billing Management System
            </p>
          </div>

          {/* Stepper Visuals */}
          <div className="flex items-center justify-between mb-8 select-none">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className="flex items-center flex-1 last:flex-initial">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  step === num 
                    ? 'bg-blue-600 text-white ring-4 ring-blue-500/20 shadow-md' 
                    : step > num 
                      ? 'bg-emerald-500 text-white shadow-sm' 
                      : 'bg-bg-lighter text-text-muted border border-border-base'
                }`}>
                  {step > num ? '✓' : num}
                </div>
                {num < 4 && (
                  <div className={`h-0.5 flex-1 mx-2 transition-all duration-500 ${
                    step > num ? 'bg-emerald-500' : 'bg-border-base'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step Header */}
          <div className="flex justify-between items-center text-xs font-extrabold text-text-muted uppercase tracking-wider select-none mb-4">
            <span>
              {step === 1 && 'Step 1: Email Verification'}
              {step === 2 && 'Step 2: Enter OTP'}
              {step === 3 && 'Step 3: Personal details'}
              {step === 4 && 'Step 4: Secure password'}
            </span>
            <span>Step {step} of 4</span>
          </div>

          {error && (
            <div className="text-xs font-bold text-red-500 flex items-center gap-1.5 mb-4 animate-shake">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Stepper Forms */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block" htmlFor="email">
                  Email Address *
                </label>
                <div className="relative mt-1.5">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="w-full bg-bg-lighter border border-border-base rounded-xl py-3.5 px-4 text-xs font-medium text-text-primary focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder-text-muted"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="user@example.com"
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={isLoading} 
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all active:scale-[0.98] cursor-pointer select-none"
              >
                {isLoading ? 'Sending OTP...' : 'Send OTP ➔'}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="text-xs text-text-muted font-semibold bg-bg-lighter border border-border-base p-4 rounded-xl flex justify-between items-center select-none">
                <span>OTP Sent To: <strong className="text-text-primary ml-1">{formData.email}</strong></span>
                <button 
                  type="button" 
                  onClick={() => setStep(1)} 
                  className="text-blue-600 hover:text-blue-500 font-extrabold hover:underline"
                >
                  Change
                </button>
              </div>
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block" htmlFor="otp">
                  Verification Code (OTP) *
                </label>
                <div className="relative mt-1.5">
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    maxLength={6}
                    required
                    className="w-full bg-bg-lighter border border-border-base rounded-xl py-3.5 text-center tracking-widest text-lg font-mono font-black text-text-primary focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder-text-muted"
                    value={formData.otp}
                    onChange={handleChange}
                    placeholder="------"
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={isLoading} 
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all active:scale-[0.98] cursor-pointer select-none"
              >
                {isLoading ? 'Verifying OTP...' : 'Verify OTP ➔'}
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleContinueToStep4} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block" htmlFor="firstName">First Name *</label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    className="w-full bg-bg-lighter border border-border-base rounded-xl py-3.5 px-4 text-xs font-medium text-text-primary mt-1.5 focus:outline-none focus:border-blue-500"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="E.g. Jaynish"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block" htmlFor="lastName">Last Name *</label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    className="w-full bg-bg-lighter border border-border-base rounded-xl py-3.5 px-4 text-xs font-medium text-text-primary mt-1.5 focus:outline-none focus:border-blue-500"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="E.g. Patel"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block" htmlFor="username">Username (English) *</label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    className="w-full bg-bg-lighter border border-border-base rounded-xl py-3.5 px-4 text-xs font-medium text-text-primary mt-1.5 focus:outline-none focus:border-blue-500"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="jpatel12"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block" htmlFor="mobileNumber">Mobile Number (+91) *</label>
                  <input
                    id="mobileNumber"
                    name="mobileNumber"
                    type="tel"
                    required
                    maxLength={10}
                    className="w-full bg-bg-lighter border border-border-base rounded-xl py-3.5 px-4 text-xs font-medium text-text-primary mt-1.5 focus:outline-none focus:border-blue-500"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    placeholder="10-digit mobile"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all active:scale-[0.98] cursor-pointer mt-8 select-none"
              >
                Continue ➔
              </button>
            </form>
          )}

          {step === 4 && (
            <form onSubmit={handleRegister} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block" htmlFor="password">Password *</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="w-full bg-bg-lighter border border-border-base rounded-xl py-3.5 px-4 text-xs font-medium text-text-primary mt-1.5 focus:outline-none focus:border-blue-500"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block" htmlFor="confirmPassword">Confirm Password *</label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    className="w-full bg-bg-lighter border border-border-base rounded-xl py-3.5 px-4 text-xs font-medium text-text-primary mt-1.5 focus:outline-none focus:border-blue-500"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex items-start gap-2 pt-1 select-none">
                <input
                  required
                  type="checkbox"
                  id="agree"
                  className="w-4 h-4 rounded border-border-base text-blue-600 bg-bg-base focus:ring-blue-500 cursor-pointer mt-0.5"
                />
                <label htmlFor="agree" className="text-[11px] font-semibold text-text-secondary leading-relaxed cursor-pointer">
                  I agree to the <a href="#" onClick={(e) => { e.preventDefault(); Swal.fire({ title: 'Terms & Conditions', text: 'You agree to standard enterprise workspace configurations.', icon: 'info', confirmButtonColor: '#2563EB', background: 'var(--color-bg-lighter)', color: 'var(--color-text-primary)' }); }} className="text-blue-600 hover:text-blue-500 font-bold">Terms & Conditions</a> and <a href="#" onClick={(e) => { e.preventDefault(); Swal.fire({ title: 'Privacy Policy', text: 'We protect your data privacy and process logs securely.', icon: 'info', confirmButtonColor: '#2563EB', background: 'var(--color-bg-lighter)', color: 'var(--color-text-primary)' }); }} className="text-blue-600 hover:text-blue-500 font-bold">Privacy Policy</a>.
                </label>
              </div>

              <button 
                type="submit" 
                disabled={isLoading} 
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all active:scale-[0.98] cursor-pointer mt-8 select-none"
              >
                {isLoading ? 'Creating Account...' : 'Create Account ➔'}
              </button>
            </form>
          )}

          <div className="text-center text-xs font-bold text-text-muted pt-5 border-t border-border-base select-none">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-500 transition-colors font-extrabold ml-1">
              Login Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
