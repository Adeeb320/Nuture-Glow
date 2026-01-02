import React, { useState } from 'react';
import { Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, Calendar, Syringe, Apple, Baby, 
  BookOpen, Users, Droplet, Zap, Hospital, 
  ShoppingBag, User, Languages, Mic, Menu, Bell, BrainCircuit,
  LogOut, Search
} from 'lucide-react';
import { Logo } from '../constants';
import { useTranslations } from '../i18n/I18nContext';
import { useAuth } from '../contexts/AuthContext';
import { useVoiceCommands } from './voice/useVoiceCommands';
import { VoiceDebugPanel } from './voice/VoiceDebugPanel';
import { NotificationBell } from './notifications/NotificationBell';
import { GlobalSearch } from './search/GlobalSearch';

// Pages
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Register from '../pages/Register';
import About from '../pages/About';
import FeaturesPage from '../pages/FeaturesPage';
import Products from '../pages/Products';
import Contact from '../pages/Contact';
import PlaceholderPage from '../pages/PlaceholderPage';
import Dashboard, { 
  Appointments, 
  Vaccines, 
  Community, 
  Journal, 
  Profile,
  Nutrition,
  Pregnancy,
  Hospitals,
  Pharmacy,
  Myths,
  Translator,
  BloodDonors,
  Health
} from '../pages/Dashboard';
import Cart from '../pages/Cart';
import { Assistant } from '../pages/Assistant';
import { LanguageSettings, NotificationSettings } from '../pages/SettingsPages';

const Layout: React.FC = () => {
  const { user, logout, isLoading } = useAuth();
  const { locale, setLocale, t } = useTranslations();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const {
    isSupported,
    isListening,
    transcript,
    lastIntent,
    error,
    toggleListening
  } = useVoiceCommands({
    lang: locale,
    onCommand: (path) => {
      navigate(path);
    }
  });

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: t('nav.dashboard'), path: '/dashboard' },
    { icon: <BrainCircuit size={20} />, label: t('nav.assistant'), path: '/assistant' },
    { icon: <User size={20} />, label: t('nav.profile'), path: '/profile' },
    { icon: <Calendar size={20} />, label: t('nav.appointments'), path: '/appointments' },
    { icon: <Syringe size={20} />, label: t('nav.vaccines'), path: '/vaccines' },
    { icon: <BookOpen size={20} />, label: t('nav.journal'), path: '/journal' },
    { icon: <Users size={20} />, label: t('nav.community'), path: '/community' },
    { icon: <Apple size={20} />, label: t('nav.nutrition'), path: '/nutrition' },
    { icon: <Baby size={20} />, label: t('nav.pregnancy'), path: '/pregnancy' },
    { icon: <Hospital size={20} />, label: t('nav.hospitals'), path: '/hospitals' },
    { icon: <Droplet size={20} />, label: t('nav.donors'), path: '/donors' },
    { icon: <Languages size={20} />, label: t('nav.translator'), path: '/translator' },
    { icon: <Zap size={20} />, label: t('nav.myths'), path: '/myths' },
    { icon: <ShoppingBag size={20} />, label: t('nav.pharmacy'), path: '/pharmacy' },
  ];

  const filteredMenu = menuItems.filter(item => 
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#F7F5EF]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E6C77A]"></div>
      </div>
    );
  }

  // Define landing routes that don't need auth or sidebar
  const publicRoutes = [
    '/', '/about', '/features', '/pricing', '/contact', '/how-it-works', 
    '/mobile-app', '/help-center', '/privacy', '/terms', '/cookie-policy', '/sitemap'
  ];

  if (publicRoutes.includes(location.pathname)) {
    return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<About />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/pricing" element={<Products />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/how-it-works" element={<PlaceholderPage title="How It Works" />} />
        <Route path="/mobile-app" element={<PlaceholderPage title="Mobile App" />} />
        <Route path="/help-center" element={<PlaceholderPage title="Help Center" />} />
        <Route path="/privacy" element={<PlaceholderPage title="Privacy Policy" />} />
        <Route path="/terms" element={<PlaceholderPage title="Terms of Service" />} />
        <Route path="/cookie-policy" element={<PlaceholderPage title="Cookie Policy" />} />
        <Route path="/sitemap" element={<PlaceholderPage title="Sitemap" />} />
      </Routes>
    );
  }
  
  const authRoutes = ['/login', '/register', '/signup'];
  if (authRoutes.includes(location.pathname)) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/signup" element={<Register />} />
      </Routes>
    );
  }

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  return (
    <div className="flex h-screen overflow-hidden">
      <VoiceDebugPanel 
        isSupported={isSupported}
        isListening={isListening}
        lang={locale}
        transcript={transcript}
        lastIntent={lastIntent}
        error={error}
      />

      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/20 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transition-transform duration-300 lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div onClick={() => navigate('/dashboard')} className="cursor-pointer p-6 flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Logo />
            <div>
              <h1 className="text-xl font-bold text-gray-800 leading-tight">Nurture</h1>
              <span className="text-xs text-[#E6C77A] font-semibold uppercase tracking-wider">Glow</span>
            </div>
          </div>

          <div className="px-4 mb-4">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
                <input 
                  type="text" 
                  placeholder="Filter menu..." 
                  className="w-full bg-gray-50 border-none rounded-xl pl-9 py-2 text-xs focus:ring-2 focus:ring-[#BFE6DA] outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
             </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1 scrollbar-hide">
            {filteredMenu.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 ${location.pathname === item.path || (item.path === '/pharmacy' && location.pathname === '/pharmacy/cart') ? 'bg-[#BFE6DA]/20 text-teal-800 font-bold' : 'text-gray-500 hover:bg-[#F7F5EF] hover:text-gray-800'}`}
              >
                <span className={`${location.pathname === item.path || (item.path === '/pharmacy' && location.pathname === '/pharmacy/cart') ? 'text-teal-600' : 'text-gray-400'}`}>
                  {item.icon}
                </span>
                <span className="text-sm">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-100 space-y-2">
            <button onClick={() => setLocale(locale === 'en' ? 'bn' : 'en')} className="flex items-center gap-3 w-full px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-2xl transition-all">
              <Languages size={20} className="text-gray-400" />
              <span className="font-medium text-sm">{locale === 'en' ? 'বাংলা' : 'English'}</span>
            </button>
            <button onClick={() => logout()} className="flex items-center gap-3 w-full px-4 py-3 text-red-500 hover:bg-red-50 rounded-2xl transition-all">
              <LogOut size={20} className="text-red-400" />
              <span className="font-medium text-sm">{t('nav.logout')}</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-16 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 border-b border-gray-100 sticky top-0 z-30">
          <div className="flex items-center gap-4 flex-1">
            <button className="lg:hidden p-2 hover:bg-gray-100 rounded-lg" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <GlobalSearch />
          </div>
          <div className="flex items-center gap-4 ml-4">
            <button onClick={toggleListening} disabled={!isSupported} className={`p-3 rounded-full transition-all ${isListening ? 'bg-red-500 text-white shadow-lg shadow-red-200' : 'bg-[#E6C77A]/20 text-[#D4B56A]'}`}>
              <Mic size={20} />
            </button>
            <NotificationBell />
            <button onClick={() => navigate('/profile')} className="flex items-center gap-3 pl-2 p-1.5 rounded-2xl hover:bg-gray-50 transition-all">
              <img src={user?.avatar} className="w-9 h-9 rounded-full object-cover ring-2 ring-[#BFE6DA]" />
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-gray-800 line-clamp-1">{user?.name}</p>
                <p className="text-[9px] text-teal-600 font-bold tracking-tighter uppercase">Premium Hub</p>
              </div>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-[#F7F5EF] custom-scrollbar">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/health" element={<Health />} />
            <Route path="/health/:metric" element={<Health />} />
            <Route path="/assistant" element={<Assistant />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/vaccines" element={<Vaccines />} />
            <Route path="/community" element={<Community />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings/language" element={<LanguageSettings />} />
            <Route path="/settings/notifications" element={<NotificationSettings />} />
            <Route path="/nutrition" element={<Nutrition />} />
            <Route path="/pregnancy" element={<Pregnancy />} />
            <Route path="/hospitals" element={<Hospitals />} />
            <Route path="/pharmacy" element={<Pharmacy />} />
            <Route path="/pharmacy/cart" element={<Cart />} />
            <Route path="/myths" element={<Myths />} />
            <Route path="/translator" element={<Translator />} />
            <Route path="/donors" element={<BloodDonors />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default Layout;