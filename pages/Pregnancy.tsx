import React, { useState, useEffect } from 'react';
import { Baby, Info, Calendar, ChevronRight, Apple, Zap, Heart } from 'lucide-react';
import { db } from '../services/mockDb';
import { useAuth } from '../contexts/AuthContext';

const Pregnancy: React.FC = () => {
  const { user } = useAuth();
  const [selectedWeek, setSelectedWeek] = useState(24);

  useEffect(() => {
    if (user) {
      const savedWeek = db.getPregnancyWeek(user.id);
      setSelectedWeek(savedWeek);
    }
  }, [user]);

  const handleWeekChange = (week: number) => {
    setSelectedWeek(week);
    if (user) db.updatePregnancyWeek(user.id, week);
  };

  const getWeekInfo = (week: number) => {
    if (week < 13) {
      return { 
        stage: 'First Trimester', 
        size: 'Poppy Seed', 
        desc: 'Major organs begin to form. You might feel fatigued and experience morning sickness as your body adapts.',
        nutrients: ['Folic Acid for neural tube', 'Vitamin B12 for energy', 'Hydration is critical'],
        symptoms: ['Fatigue & Morning sickness', 'Breast tenderness', 'Frequent urination']
      };
    }
    if (week < 27) {
      return { 
        stage: 'Second Trimester', 
        size: 'Ear of Corn', 
        desc: 'Baby can hear your voice! Your bump is visible, and you might feel the first kicks (quickening) as they grow.',
        nutrients: ['Calcium for bone growth', 'Iron for blood supply', 'Omega-3 for brain'],
        symptoms: ['Backaches & leg cramps', 'Nasal congestion', 'Vivid dreams']
      };
    }
    return { 
      stage: 'Third Trimester', 
      size: 'Watermelon', 
      desc: 'Baby is growing rapidly and putting on fat. Preparing for the big day! You may feel short of breath as baby takes up space.',
      nutrients: ['Protein for muscle growth', 'Vitamin C for immunity', 'Complex carbs for stamina'],
      symptoms: ['Braxton Hicks contractions', 'Sleep difficulty', 'Swollen ankles (Edema)']
    };
  };

  const current = getWeekInfo(selectedWeek);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-12 animate-in fade-in duration-500 pb-20">
      <div className="relative overflow-hidden rounded-[48px] bg-gradient-to-br from-pink-50 to-pink-100 p-10 md:p-16 shadow-sm border border-pink-100">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3 px-6 py-2 bg-white/60 backdrop-blur-md rounded-full border border-white/50 shadow-sm">
               <span className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></span>
               <span className="text-[10px] font-bold text-pink-700 uppercase tracking-widest">{current.stage}</span>
            </div>
            <h1 className="text-5xl font-serif font-bold text-gray-900 leading-tight">Your Baby is the size <br/> of an <span className="text-pink-600 italic">{current.size}.</span></h1>
            <p className="text-xl text-gray-600 font-light leading-relaxed">{current.desc}</p>
            <div className="flex gap-4">
               <div className="p-4 bg-white rounded-3xl shadow-sm border border-pink-50 flex items-center gap-3">
                  <div className="w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center text-pink-500 shadow-inner"><Calendar size={20}/></div>
                  <div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Weeks to Go</p><p className="font-bold text-gray-800">{40 - selectedWeek} Weeks</p></div>
               </div>
               <div className="p-4 bg-white rounded-3xl shadow-sm border border-pink-50 flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-500 shadow-inner"><Heart size={20}/></div>
                  <div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Due Date</p><p className="font-bold text-gray-800">In ~{(40 - selectedWeek) * 7} Days</p></div>
               </div>
            </div>
          </div>
          <div className="flex justify-center">
             <div className="w-64 h-64 md:w-80 md:h-80 bg-white rounded-full flex items-center justify-center shadow-2xl relative">
                <Baby size={120} className="text-pink-300" />
                <div className="absolute inset-0 rounded-full border-8 border-dashed border-pink-100/50 animate-spin-slow"></div>
             </div>
          </div>
        </div>
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-pink-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Timeline</h2>
          <div className="px-4 py-1 bg-pink-50 text-pink-600 rounded-full text-xs font-bold uppercase tracking-widest">Selected: Week {selectedWeek}</div>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide">
          {[...Array(40)].map((_, i) => (
            <button 
              key={i} 
              onClick={() => handleWeekChange(i + 1)}
              className={`flex-shrink-0 w-16 h-16 rounded-2xl font-bold transition-all border-2 flex items-center justify-center shadow-sm ${selectedWeek === i + 1 ? 'bg-pink-500 border-pink-500 text-white shadow-lg scale-110' : 'bg-white border-gray-100 text-gray-400 hover:border-pink-200'}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100 space-y-6 hover:shadow-md transition-shadow">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3"><Apple className="text-green-500"/> Nutrients this stage</h3>
          <ul className="space-y-4">
             {current.nutrients.map((tip, i) => (
               <li key={i} className="flex gap-4 p-5 bg-gray-50 rounded-2xl items-center group">
                 <div className="w-2 h-2 rounded-full bg-green-400 group-hover:scale-125 transition-transform"></div>
                 <span className="text-sm font-bold text-gray-700">{tip}</span>
               </li>
             ))}
          </ul>
        </div>
        <div className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100 space-y-6 hover:shadow-md transition-shadow">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3"><Zap className="text-yellow-500"/> Symptoms to watch</h3>
          <ul className="space-y-4">
             {current.symptoms.map((tip, i) => (
               <li key={i} className="flex gap-4 p-5 bg-gray-50 rounded-2xl items-center group">
                 <div className="w-2 h-2 rounded-full bg-yellow-400 group-hover:scale-125 transition-transform"></div>
                 <span className="text-sm font-bold text-gray-700">{tip}</span>
               </li>
             ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Pregnancy;