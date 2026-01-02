import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Loader2, ArrowRight, AlertCircle, Sparkles, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslations } from '../i18n/I18nContext';
import { Logo } from '../constants';

const Register: React.FC = () => {
  const { register } = useAuth();
  const { t } = useTranslations();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || t('auth.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5EF] flex items-center justify-center p-6 py-20">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-block mb-6">
            <Logo />
          </div>
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">{t('auth.createAccount')}</h1>
          <p className="text-gray-500 font-medium tracking-wide uppercase text-[10px] tracking-[0.2em]">Start your premium care journey today</p>
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
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-4">{t('auth.name')}</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-teal-500 transition-colors">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Sarah Jenkins"
                  className="w-full pl-12 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#BFE6DA] focus:ring-4 focus:ring-[#BFE6DA]/10 transition-all outline-none font-medium text-gray-800"
                />
              </div>
            </div>

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
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-4">{t('auth.password')}</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-teal-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#BFE6DA] focus:ring-4 focus:ring-[#BFE6DA]/10 transition-all outline-none font-medium text-gray-800"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-4">{t('auth.confirmPassword')}</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-teal-500 transition-colors">
                  <CheckCircle size={18} />
                </div>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#BFE6DA] focus:ring-4 focus:ring-[#BFE6DA]/10 transition-all outline-none font-medium text-gray-800"
                />
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
                  <span className="uppercase tracking-[0.2em] text-xs">{t('auth.signUp')}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 text-center space-y-4">
            <p className="text-sm text-gray-400 font-medium">
              {t('auth.hasAccount')}{' '}
              <Link to="/login" className="text-[#D4B56A] font-bold hover:underline underline-offset-4">
                {t('auth.signIn')}
              </Link>
            </p>
            <div className="pt-4 flex items-center justify-center gap-2 text-[10px] font-bold text-gray-300 uppercase tracking-widest">
              <Sparkles size={12} className="text-[#E6C77A]" />
              Premium Care Features Included
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

export default Register;
