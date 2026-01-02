import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ShieldCheck, FileText, Upload, Plus, Edit3, Save, Trash2, Heart, Activity, AlertTriangle, Phone, MapPin, Camera, Check, XCircle, RefreshCw, Settings as SettingsIcon, CheckCircle2, Info, Share2, ChevronRight, Clock, X } from 'lucide-react';
import { db } from '../services/mockDb';
import { useAuth } from '../contexts/AuthContext';
import { VerificationDocument, MedicalReport, DoctorVisit } from '../types';
import { ShareHealthIdModal } from '../components/ShareHealthIdModal';
import { useTranslations } from '../i18n/I18nContext';

/**
 * Profile Page Component
 * Handles user identity, medical records, and verification documents.
 */
const Profile: React.FC = () => {
  const { user, updateAvatar, updateName } = useAuth();
  const { t } = useTranslations();
  const navigate = useNavigate();
  const [docs, setDocs] = useState<VerificationDocument[]>([]);
  const [medical, setMedical] = useState<MedicalReport>(() => db.getMedicalReport(user?.id || ''));
  const [visits, setVisits] = useState<DoctorVisit[]>([]);
  const [isEditingMedical, setIsEditingMedical] = useState(false);
  const [showLogVisit, setShowLogVisit] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'info' | 'error'} | null>(null);
  const avatarRef = useRef<HTMLInputElement>(null);

  // Name editing state
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(user?.name || '');

  // Visit Form state
  const [visitForm, setVisitForm] = useState({ doctorName: '', clinic: '', date: new Date().toISOString().split('T')[0], reason: '', notes: '' });

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const refreshData = () => {
    if (user) {
      setDocs(db.getVerificationDocs(user.id));
      setVisits(db.getVisitHistory(user.id));
      setMedical(db.getMedicalReport(user.id));
    }
  };

  useEffect(() => {
    refreshData();
    window.addEventListener('db-update', refreshData);
    return () => window.removeEventListener('db-update', refreshData);
  }, [user]);

  const handleDocUpload = (type: VerificationDocument['type']) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file && user) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          db.updateVerificationDoc(user.id, type, { name: file.name, url: ev.target?.result as string });
          showToast(t('profile.success.docUploaded'));
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        updateAvatar(ev.target?.result as string);
        showToast(t('profile.success.avatar'));
      };
      reader.readAsDataURL(file);
    }
  };

  const saveMedical = () => {
    if (user) {
      db.saveMedicalReport(user.id, medical);
      setIsEditingMedical(false);
      showToast(t('profile.success.medical'));
    }
  };

  const handleSaveName = () => {
    const trimmed = tempName.trim();
    if (!/^[a-zA-Z0-9 ._]{3,30}$/.test(trimmed)) {
      showToast(t('profile.errors.nameValid'), "error");
      return;
    }
    updateName(trimmed);
    setIsEditingName(false);
    showToast(t('profile.success.updated'));
  };

  const handleCancelName = () => {
    setIsEditingName(false);
    setTempName(user?.name || '');
  };

  const handleLogVisitSubmit = () => {
    if (!user || !visitForm.doctorName || !visitForm.clinic) return;
    db.addVisitRecord(user.id, visitForm);
    setVisitForm({ doctorName: '', clinic: '', date: new Date().toISOString().split('T')[0], reason: '', notes: '' });
    setShowLogVisit(false);
    showToast(t('profile.success.visit'));
  };

  const confirmResetHealthData = () => {
    if (!user) return;
    try {
      db.resetUserHealthData(user.id);
      showToast(t('profile.success.reset'), "success");
      setShowResetConfirm(false);
      setShowSettings(false);
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1000);
    } catch (err) {
      console.error("Reset Error:", err);
      showToast(t('profile.errors.resetFail'), "error");
    }
  };

  const handleDeleteVisit = (id: string) => {
    if (user && window.confirm(t('common.cancel') + "?")) {
      db.deleteVisitRecord(user.id, id);
      showToast(t('donors.success.removed'), "info");
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-10 animate-in fade-in duration-500 pb-20 relative">
      <ShareHealthIdModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} user={user} />
      
      {toast && (
        <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[1000] px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 ${
          toast.type === 'success' ? 'bg-teal-600 text-white' : toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-[#E6C77A] text-teal-900'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 size={18}/> : toast.type === 'error' ? <AlertTriangle size={18}/> : <Info size={18}/>}
          <span className="text-sm font-bold">{toast.message}</span>
        </div>
      )}

      {/* Profile Header */}
      <div className="bg-white rounded-[48px] p-8 md:p-12 shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="relative group">
            <div className="w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden ring-8 ring-[#BFE6DA]/20 shadow-xl">
               <img src={user.avatar} className="w-full h-full object-cover" alt={user.name} />
            </div>
            <button 
              onClick={() => avatarRef.current?.click()}
              className="absolute bottom-2 right-2 p-4 bg-teal-600 text-white rounded-full shadow-lg hover:scale-110 transition-all border-4 border-white"
            >
              <Camera size={20}/>
            </button>
            <input type="file" ref={avatarRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 group/name">
                {isEditingName ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveName();
                        if (e.key === 'Escape') handleCancelName();
                      }}
                      autoFocus
                      className="text-2xl md:text-4xl font-bold text-gray-900 bg-teal-50 rounded-xl px-4 py-1 outline-none border-b-4 border-teal-500 max-w-[250px] md:max-w-[400px]"
                      aria-label={t('profile.editUsername')}
                    />
                    <div className="flex gap-2">
                      <button onClick={handleSaveName} className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 shadow-md transition-all active:scale-90" aria-label={t('profile.saveName')}>
                        <Check size={18}/>
                      </button>
                      <button onClick={handleCancelName} className="p-2 bg-gray-100 text-gray-400 rounded-full hover:bg-gray-200 transition-all active:scale-90" aria-label={t('profile.cancelEdit')}>
                        <X size={18}/>
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h1 className="text-3xl md:text-5xl font-bold text-gray-900">{user.name}</h1>
                    <button 
                      onClick={() => { setTempName(user.name); setIsEditingName(true); }}
                      className="p-2 text-gray-300 hover:text-teal-600 transition-all md:opacity-0 md:group-hover/name:opacity-100 focus:opacity-100"
                      aria-label={t('profile.editUsername')}
                    >
                      <Edit3 size={20} />
                    </button>
                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${user.verified === 'Verified' ? 'bg-green-500 text-white' : 'bg-orange-400 text-white'}`}>
                       {user.verified === 'Verified' ? <ShieldCheck size={12}/> : <Activity size={12}/>}
                       {user.verified === 'Verified' ? t('profile.verified') : t('profile.notVerified')}
                    </div>
                  </>
                )}
              </div>
              <p className="text-gray-400 font-medium text-lg mt-1">{user.email}</p>
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
               <div className="px-6 py-3 bg-[#F7F5EF] rounded-2xl flex flex-col items-center md:items-start min-w-[140px]">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('profile.healthId')}</p>
                  <p className="text-lg font-bold text-teal-700 font-mono tracking-tighter">{user.healthId}</p>
               </div>
               <button 
                onClick={() => setShowShareModal(true)}
                className="px-8 py-3 bg-teal-600 text-white rounded-2xl font-bold shadow-lg shadow-teal-600/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 uppercase tracking-widest text-xs"
               >
                 <Share2 size={16}/> {t('profile.shareId')}
               </button>
            </div>
          </div>

          <div className="flex gap-2">
             <button onClick={() => setShowSettings(!showSettings)} className={`p-4 rounded-2xl transition-all ${showSettings ? 'bg-teal-600 text-white shadow-lg' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}>
                <SettingsIcon size={24}/>
             </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#BFE6DA]/10 rounded-full blur-3xl"></div>
      </div>

      {showSettings && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-4 duration-300">
           <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-4">
              <h3 className="text-xl font-bold text-gray-800">{t('profile.accPrefs')}</h3>
              <div className="space-y-3">
                 <button 
                  type="button"
                  onClick={() => navigate('/settings/language')}
                  aria-label={t('settings.lang.title')}
                  className="w-full flex justify-between items-center p-6 bg-gray-50 rounded-[28px] hover:bg-gray-100 transition-all group cursor-pointer border-2 border-transparent focus:border-teal-100 focus:ring-4 focus:ring-teal-50 outline-none"
                 >
                    <span className="text-sm font-bold text-gray-600 group-hover:text-teal-700 transition-colors">{t('settings.lang.title')}</span>
                    <ChevronRight size={18} className="text-gray-300 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
                 </button>
                 <button 
                  type="button"
                  onClick={() => navigate('/settings/notifications')}
                  aria-label={t('settings.notif.title')}
                  className="w-full flex justify-between items-center p-6 bg-gray-50 rounded-[28px] hover:bg-gray-100 transition-all group cursor-pointer border-2 border-transparent focus:border-teal-100 focus:ring-4 focus:ring-teal-50 outline-none"
                 >
                    <span className="text-sm font-bold text-gray-600 group-hover:text-teal-700 transition-colors">{t('settings.notif.title')}</span>
                    <ChevronRight size={18} className="text-gray-300 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
                 </button>
              </div>
           </div>

           <div className="bg-red-50 p-8 rounded-[40px] border border-red-100 shadow-sm space-y-6">
              <h3 className="text-xl font-bold text-red-800">{t('profile.dangerZone')}</h3>
              <p className="text-sm text-red-600/70 font-medium">{t('profile.resetDesc')}</p>
              
              {showResetConfirm ? (
                <div className="flex gap-3 animate-in zoom-in-95">
                   <button onClick={() => setShowResetConfirm(false)} className="flex-1 py-4 bg-white text-gray-400 rounded-2xl font-bold border border-red-100">{t('common.cancel')}</button>
                   <button onClick={confirmResetHealthData} className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-bold shadow-lg shadow-red-200">{t('profile.confirmReset')}</button>
                </div>
              ) : (
                <button onClick={() => setShowResetConfirm(true)} className="flex items-center gap-2 px-8 py-4 bg-white text-red-500 rounded-2xl font-bold border-2 border-red-100 hover:bg-red-500 hover:text-white transition-all w-full justify-center">
                  <RefreshCw size={18} /> {t('profile.resetBtn')}
                </button>
              )}
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-10">
          <section className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 space-y-6">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3"><ShieldCheck className="text-teal-600"/> {t('profile.docs.title')}</h3>
            <div className="space-y-4">
              {[
                { type: 'NID' as const, label: t('profile.docs.nid') },
                { type: 'BIRTH_CERT' as const, label: t('profile.docs.birth') },
                { type: 'MARRIAGE_CERT' as const, label: t('profile.docs.marriage') }
              ].map(item => {
                const doc = docs.find(d => d.type === item.type);
                return (
                  <div key={item.type} className="p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-teal-100 transition-all flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${doc ? 'bg-teal-600 text-white' : 'bg-white text-gray-300'}`}>
                        <FileText size={18}/>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-700">{item.label}</p>
                        <p className={`text-[10px] font-bold uppercase tracking-widest ${doc ? 'text-teal-600' : 'text-gray-400'}`}>
                          {doc ? t(`profile.docs.${doc.status.toLowerCase() as any}`) : t('profile.docs.notUploaded')}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDocUpload(item.type)}
                      className={`p-2 rounded-xl transition-all ${doc ? 'text-teal-600 hover:bg-teal-100' : 'text-gray-300 hover:text-teal-600 hover:bg-white'}`}
                    >
                      <Upload size={18}/>
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3"><Heart className="text-red-500"/> {t('profile.medical.title')}</h3>
              <button 
                onClick={() => isEditingMedical ? saveMedical() : setIsEditingMedical(true)}
                className={`p-2 rounded-xl transition-all ${isEditingMedical ? 'bg-green-500 text-white' : 'text-[#D4B56A] hover:bg-[#F7F5EF]'}`}
              >
                {isEditingMedical ? <Check size={20}/> : <Edit3 size={20}/>}
              </button>
            </div>
            
            <div className="space-y-4">
               {[
                 { label: t('profile.medical.blood'), key: 'bloodGroup', placeholder: 'e.g. O+' },
                 { label: t('profile.medical.allergies'), key: 'allergies', placeholder: t('profile.medical.placeholder') },
                 { label: t('profile.medical.diabetes'), key: 'diabetesStatus', type: 'checkbox' },
                 { label: t('profile.medical.conditions'), key: 'knownConditions', placeholder: t('profile.medical.placeholder') }
               ].map(field => (
                 <div key={field.key} className="space-y-1">
                   <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">{field.label}</label>
                   {field.type === 'checkbox' ? (
                     <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                        <input 
                          type="checkbox" 
                          checked={medical[field.key as keyof MedicalReport] as boolean}
                          disabled={!isEditingMedical}
                          onChange={e => setMedical({...medical, [field.key]: e.target.checked})}
                          className="w-5 h-5 accent-teal-600"
                        />
                        <span className="text-sm font-bold text-gray-600">{t('profile.medical.hasDiabetes')}</span>
                     </div>
                   ) : (
                     <input 
                       value={medical[field.key as keyof MedicalReport] as string}
                       disabled={!isEditingMedical}
                       onChange={e => setMedical({...medical, [field.key]: e.target.value})}
                       placeholder={field.placeholder}
                       className="w-full p-4 bg-gray-50 rounded-2xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-teal-100 disabled:opacity-60 transition-all border-none"
                     />
                   )}
                 </div>
               ))}
            </div>
          </section>
        </div>

        <div className="lg:col-span-8 space-y-8">
           <section className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                 <div className="flex items-center gap-3">
                    <div className="p-3 bg-white text-teal-600 rounded-2xl shadow-sm"><Activity size={24}/></div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{t('profile.visits.title')}</h3>
                      <p className="text-xs text-gray-400 font-medium">{t('profile.visits.recordsFound', { count: visits.length.toString() })}</p>
                    </div>
                 </div>
                 <button 
                  onClick={() => setShowLogVisit(true)}
                  className="px-6 py-3 bg-[#E6C77A] text-white rounded-2xl font-bold shadow-lg shadow-[#E6C77A]/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 uppercase tracking-widest text-[10px]"
                 >
                   <Plus size={16}/> {t('profile.visits.logBtn')}
                 </button>
              </div>

              <div className="divide-y divide-gray-50">
                 {visits.length === 0 ? (
                   <div className="p-20 text-center space-y-4 opacity-40">
                      <FileText size={64} className="mx-auto text-gray-200" />
                      <p className="font-bold text-gray-400 italic">{t('profile.visits.empty')}</p>
                   </div>
                 ) : (
                   visits.map(visit => (
                     <div key={visit.id} className="p-8 flex flex-col md:flex-row gap-6 hover:bg-gray-50/50 transition-all group">
                        <div className="flex-1 space-y-4">
                           <div className="flex justify-between">
                              <div className="space-y-1">
                                <h4 className="font-bold text-gray-800 text-lg">{visit.doctorName}</h4>
                                <p className="text-xs text-teal-600 font-bold uppercase tracking-widest flex items-center gap-2">
                                  <MapPin size={12}/> {visit.clinic}
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="flex items-center gap-2 text-gray-400 text-sm font-bold">
                                   <Clock size={16}/> {new Date(visit.date).toLocaleDateString()}
                                </div>
                              </div>
                           </div>
                           <div className="p-4 bg-[#F7F5EF] rounded-2xl space-y-2">
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('profile.visits.reason')}</p>
                              <p className="text-sm font-bold text-gray-700">{visit.reason}</p>
                           </div>
                           {visit.notes && (
                             <p className="text-sm text-gray-500 italic leading-relaxed">"{visit.notes}"</p>
                           )}
                        </div>
                        <div className="flex md:flex-col justify-end gap-2">
                           <button onClick={() => handleDeleteVisit(visit.id)} className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                             <Trash2 size={20}/>
                           </button>
                        </div>
                     </div>
                   ))
                 )}
              </div>
           </section>
        </div>
      </div>

      {showLogVisit && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[40px] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-bold text-gray-800">{t('profile.visits.logBtn')}</h2>
              <button onClick={() => setShowLogVisit(false)} className="p-2 hover:bg-gray-100 rounded-full transition-all"><XCircle size={28}/></button>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">{t('profile.visits.doctor')}</label>
                  <input className="w-full p-4 bg-[#F7F5EF] rounded-2xl outline-none focus:ring-2 focus:ring-teal-100 font-bold" value={visitForm.doctorName} onChange={e => setVisitForm({...visitForm, doctorName: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">{t('profile.visits.date')}</label>
                  <input type="date" className="w-full p-4 bg-[#F7F5EF] rounded-2xl outline-none focus:ring-2 focus:ring-teal-100 font-bold" value={visitForm.date} onChange={e => setVisitForm({...visitForm, date: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">{t('profile.visits.clinic')}</label>
                <input className="w-full p-4 bg-[#F7F5EF] rounded-2xl outline-none focus:ring-2 focus:ring-teal-100 font-bold" value={visitForm.clinic} onChange={e => setVisitForm({...visitForm, clinic: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">{t('profile.visits.reason')}</label>
                <input className="w-full p-4 bg-[#F7F5EF] rounded-2xl outline-none focus:ring-2 focus:ring-teal-100 font-bold" placeholder="Routine checkup, pain, etc." value={visitForm.reason} onChange={e => setVisitForm({...visitForm, reason: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">{t('profile.visits.notes')}</label>
                <textarea className="w-full p-4 bg-[#F7F5EF] rounded-2xl outline-none h-24 resize-none text-sm font-medium" placeholder="What did the doctor suggest?" value={visitForm.notes} onChange={e => setVisitForm({...visitForm, notes: e.target.value})} />
              </div>
              <button onClick={handleLogVisitSubmit} className="w-full py-5 bg-teal-600 text-white rounded-3xl font-bold shadow-xl shadow-teal-600/20 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-xs">
                {t('profile.visits.save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;