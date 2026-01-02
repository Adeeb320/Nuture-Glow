import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Loader2, ArrowRight, AlertCircle, Sparkles, X, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslations } from '../i18n/I18nContext';
import { Logo } from '../constants';

const Login: React.FC = () => {
  const { login } = useAuth();
  const { t } = useTranslations();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Forgot Password Modal States
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname || "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || t('auth.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.includes('@')) {
      setResetError("Please enter a valid email address.");
      return;
    }

    setResetError(null);
    setIsResetting(true);

    // Mock API Call
    setTimeout(() => {
      setIsResetting(false);
      setResetSent(true);
      // Auto close after 3 seconds on success
      setTimeout(() => {
        setShowForgotModal(false);
        setResetSent(false);
        setForgotEmail('');
      }, 3000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#F7F5EF] flex items-center justify-center p-6 relative">
      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div 
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => !isResetting && setShowForgotModal(false)}
        >
          <div 
            className="bg-white rounded-[40px] p-7 shadow-2xl animate-in zoom-in-95 duration-300 relative w-[clamp(360px,92vw,620px)] h-auto max-h-[80vh] md:max-h-[520px] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setShowForgotModal(false)}
              className="absolute top-6 right-6 p-2 text-gray-300 hover:text-gray-500 transition-colors"
            >
              <X size={20} />
            </button>

            {resetSent ? (
              <div className="text-center space-y-6 py-4 animate-in fade-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 size={40} />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-gray-900">Link Sent!</h2>
                  <p className="text-sm text-gray-500 leading-relaxed px-4">
                    If an account exists for <b>{forgotEmail}</b>, a password reset link has been sent.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-widest text-center">Enter email to receive link</p>
                </div>

                <form onSubmit={handleForgotSubmit} className="space-y-6">
                  {resetError && (
                    <div className="p-3 bg-red-50 rounded-xl flex items-center gap-2 text-red-600 text-xs font-bold animate-in slide-in-from-top-1">
                      <AlertCircle size={14} />
                      {resetError}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Email Address</label>
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#BFE6DA] focus:ring-4 focus:ring-[#BFE6DA]/10 transition-all outline-none font-medium text-gray-800"
                      autoFocus
                    />
                  </div>

                  <button
                    disabled={isResetting}
                    className="w-full h-[52px] bg-[#E6C77A] text-white rounded-[24px] font-bold shadow-xl shadow-[#E6C77A]/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isResetting ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <>
                        <span className="uppercase tracking-[0.2em] text-xs font-bold">Send Reset Link</span>
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-block mb-6 animate-bounce">
            <Logo />
          </div>
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">{t('auth.welcomeBack')}</h1>
          <p className="text-gray-500 font-medium tracking-wide uppercase text-[10px] tracking-[0.2em]">Enter your credentials to continue your journey</p>
        </div>

        <div className="bg-white p-10 rounded-[40px] shadow-2xl shadow-gray-200/50 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 rounded-2xl flex items-center gap-3 text-red-600 text-sm animate-in fade-in slide-in-from-top-2">
                <AlertCircle size={18} />
                <p className="font-semibold">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-4">{t('auth.email')}</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-teal-500 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-12 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#BFE6DA] focus:ring-4 focus:ring-[#BFE6DA]/10 transition-all outline-none font-medium text-gray-800"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-4">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{t('auth.password')}</label>
                <button 
                  type="button" 
                  onClick={() => {
                    setForgotEmail(email); // Prefill with current email if typed
                    setShowForgotModal(true);
                  }}
                  className="text-[10px] font-bold text-[#D4B56A] uppercase tracking-widest hover:text-[#B99A4F] transition-colors cursor-pointer relative z-10"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-teal-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#BFE6DA] focus:ring-4 focus:ring-[#BFE6DA]/10 transition-all outline-none font-medium text-gray-800"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-500 transition-colors focus:outline-none p-1 cursor-pointer z-10"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              disabled={isLoading}
              className="w-full py-5 bg-[#E6C77A] text-white rounded-[24px] font-bold shadow-xl shadow-[#E6C77A]/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-4"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <span className="uppercase tracking-[0.2em] text-xs">{t('auth.signIn')}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 text-center space-y-4">
            <p className="text-sm text-gray-400 font-medium">
              {t('auth.noAccount')}{' '}
              <Link to="/register" className="text-[#D4B56A] font-bold hover:underline underline-offset-4">
                {t('auth.signUp')}
              </Link>
            </p>
            <div className="pt-4 flex items-center justify-center gap-2 text-[10px] font-bold text-gray-300 uppercase tracking-widest">
              <Sparkles size={12} className="text-[#E6C77A]" />
              Safe & Secure Authentication
            </div>
          </div>
        </div>

        <Link to="/" className="block mt-8 text-center text-[11px] font-bold text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors">
          ← Back to Landing Page
        </Link>
      </div>
    </div>
  );
};

export default Login;