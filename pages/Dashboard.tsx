import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  Activity, Droplet, Weight, Clock, CheckCircle, ChevronRight, BookOpen, 
  MessageSquare, Plus, Apple, Baby, Sparkles, BrainCircuit
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslations } from '../i18n/I18nContext';
import { AIService, HealthData } from '../services/aiService';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/mockDb';

// Exporting full implementation page components from their own files
export { default as Appointments } from './Appointments';
export { default as Vaccines } from './VaccineTracker';
export { Community } from './Community';
export { default as Profile } from './Profile';
export { default as Journal } from './Journal';
export { default as Nutrition } from './Nutrition';
export { default as Pregnancy } from './Pregnancy';
export { default as Hospitals } from './Hospitals';
export { default as Pharmacy } from './Pharmacy';
export { default as Myths } from './Myths';
export { default as Translator } from './Translator';
export { default as BloodDonors } from './BloodDonors';
export { default as Health } from './Health';

const activityData = [
  { name: 'Mon', active: 40 },
  { name: 'Tue', active: 30 },
  { name: 'Wed', active: 65 },
  { name: 'Thu', active: 45 },
  { name: 'Fri', active: 90 },
  { name: 'Sat', active: 70 },
  { name: 'Sun', active: 55 },
];

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { t, locale } = useTranslations();
  const navigate = useNavigate();
  const [insights, setInsights] = useState<string[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(true);

  const currentWeek = useMemo(() => user ? db.getPregnancyWeek(user.id) : 24, [user]);
  const hydration = useMemo(() => user ? db.getHydration(user.id) : 4, [user]);

  useEffect(() => {
    const fetchInsights = async () => {
      setLoadingInsights(true);
      try {
        const healthData: HealthData = {
          pregnancyWeek: currentWeek.toString(),
          vaccinesDue: 1, // Mocked for context
          hydrationLevel: `${(hydration * 0.25).toFixed(1)}L`
        };
        const aiInsights = await AIService.getHealthInsights(healthData, locale);
        if (aiInsights && aiInsights.length > 0) {
          setInsights(aiInsights);
        } else {
          throw new Error("Empty insights");
        }
      } catch (error) {
        // Fallback clinical tips
        setInsights([
          locale === 'bn' ? "প্রতিদিন অন্তত ৮ গ্লাস পানি পান করুন।" : "Drink at least 8 glasses of water daily.",
          locale === 'bn' ? "আপনার প্রসবপূর্ব ভিটামিন নিতে ভুলবেন না।" : "Don't forget to take your prenatal vitamins.",
          locale === 'bn' ? "হালকা হাঁটাহাঁটি আপনার এবং শিশুর স্বাস্থ্যের জন্য ভালো।" : "Light walking is great for you and the baby."
        ]);
      } finally {
        setLoadingInsights(false);
      }
    };
    fetchInsights();
  }, [locale, currentWeek, hydration]);

  const quickActions = [
    { label: t('nav.appointments'), icon: <Plus size={18} />, color: 'bg-[#BFE6DA] text-teal-800', path: '/appointments' },
    { label: t('nav.nutrition'), icon: <Apple size={18} />, color: 'bg-[#E6C77A]/20 text-orange-800', path: '/nutrition' },
    { label: t('nav.community'), icon: <MessageSquare size={18} />, color: 'bg-indigo-50 text-indigo-800', path: '/community' },
    { label: t('nav.journal'), icon: <BookOpen size={18} />, color: 'bg-blue-50 text-blue-800', path: '/journal' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20 p-4 md:p-8">
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-[#BFE6DA] to-[#D5EEE6] p-8 md:p-12 shadow-sm">
        <div className="relative z-10 max-w-lg">
          <h2 className="text-3xl md:text-4xl font-bold text-teal-900 mb-4">
            {t('dashboard.welcome', { name: user?.name?.split(' ')[0] || 'Sarah' })}!
          </h2>
          <p className="text-teal-700 text-lg mb-6 opacity-90">
            {t('dashboard.pregnancySub')}
          </p>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-sm rounded-full w-fit">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
            <span className="text-orange-900 font-semibold text-sm">Week {currentWeek}</span>
          </div>
        </div>
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-gradient-to-br from-white to-[#F7F5EF] p-8 rounded-[32px] shadow-sm border border-[#E6C77A]/10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#E6C77A]/20 text-[#D4B56A] rounded-xl">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{t('ai.insightsTitle')}</h3>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">{t('dashboard.poweredAi')}</p>
                </div>
              </div>
              <button onClick={() => navigate('/assistant')} className="p-2 text-gray-400 hover:text-teal-600 transition-colors">
                <ChevronRight size={20} />
              </button>
            </div>
            <div className="grid gap-4">
              {loadingInsights ? (
                <div className="space-y-3">
                  <div className="h-16 w-full bg-gray-100/50 rounded-2xl animate-pulse"></div>
                  <div className="h-16 w-full bg-gray-100/50 rounded-2xl animate-pulse delay-75"></div>
                  <div className="h-16 w-full bg-gray-100/50 rounded-2xl animate-pulse delay-150"></div>
                </div>
              ) : (
                insights.map((insight, idx) => (
                  <div key={idx} className="flex gap-4 p-5 bg-white rounded-2xl shadow-sm border border-gray-50 items-center hover:translate-x-1 transition-transform group">
                    <div className="w-1.5 h-8 rounded-full bg-[#E6C77A] opacity-30 group-hover:opacity-100 transition-opacity"></div>
                    <p className="text-sm text-gray-700 font-medium leading-relaxed">{insight}</p>
                  </div>
                ))
              )}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">{t('dashboard.healthSummary')}</h3>
              <button 
                onClick={() => navigate('/health')}
                className="text-[#D4B56A] font-medium flex items-center gap-1 hover:gap-2 transition-all active:scale-95"
              >
                {t('common.viewAll')} <ChevronRight size={16} />
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: t('health.heartRate'), value: '72', unit: 'bpm', icon: <Activity />, color: 'text-red-500', bg: 'bg-red-50', id: 'heart-rate' },
                { label: t('health.hydration'), value: (hydration * 0.25).toFixed(1), unit: 'L', icon: <Droplet />, color: 'text-blue-500', bg: 'bg-blue-50', id: 'hydration' },
                { label: t('health.weight'), value: '64', unit: 'kg', icon: <Weight />, color: 'text-orange-500', bg: 'bg-orange-50', id: 'weight' },
                { label: t('health.sleep'), value: '7h 20m', unit: '', icon: <Clock />, color: 'text-purple-500', bg: 'bg-purple-50', id: 'sleep' },
              ].map((m, idx) => (
                <button 
                  key={idx} 
                  onClick={() => navigate(`/health/${m.id}`)}
                  aria-label={`View ${m.label} details`}
                  className="bg-white p-5 rounded-[24px] shadow-sm hover:shadow-md hover:scale-[1.02] transition-all text-left w-full group cursor-pointer border border-transparent hover:border-teal-50"
                >
                  <div className={`w-10 h-10 ${m.bg} ${m.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner`}>
                    {m.icon}
                  </div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">{m.label}</p>
                  <p className="text-lg font-bold text-gray-800">{m.value} <span className="text-xs font-normal text-gray-400">{m.unit}</span></p>
                </button>
              ))}
            </div>
          </section>

          <section className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-50">
            <h3 className="text-lg font-bold text-gray-800 mb-8">{t('dashboard.activity')}</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                  <YAxis hide />
                  <Tooltip 
                    cursor={{fill: '#F7F5EF'}} 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)'}}
                  />
                  <Bar dataKey="active" fill="#BFE6DA" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-6">{t('dashboard.quickActions')}</h3>
            <div className="space-y-3">
              {quickActions.map((action, idx) => (
                <button 
                  key={idx} 
                  onClick={() => navigate(action.path)}
                  className={`flex items-center gap-3 w-full p-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-95 ${action.color} shadow-sm`}
                >
                  <span className="p-2 bg-white/50 rounded-lg shadow-inner">{action.icon}</span>
                  <span className="font-semibold text-sm">{action.label}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="bg-[#1a1a1a] text-white p-8 rounded-[32px] shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#BFE6DA]/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-lg font-bold">{t('dashboard.completion')}</h3>
              <CheckCircle className="text-[#BFE6DA]" />
            </div>
            <div className="mb-6">
              <div className="flex justify-between text-xs mb-2 font-bold uppercase tracking-widest">
                <span className="text-gray-400">Vaccine Progress</span>
                <span className="text-[#BFE6DA]">{t('dashboard.statusPercent')}</span>
              </div>
              <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-[#BFE6DA] shadow-[0_0_10px_rgba(191,230,218,0.3)] transition-all duration-1000" style={{ width: '85%' }}></div>
              </div>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed italic">
              {t('dashboard.nextVaccine')}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;