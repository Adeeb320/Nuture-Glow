import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Calendar, Edit3, ImagePlus, Paperclip, Save, Sparkles, X, ChevronRight, RefreshCw, Trash2, FileText, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { db } from '../services/mockDb';
import { useAuth } from '../contexts/AuthContext';
import { JournalEntry } from '../types';
import { useTranslations } from '../i18n/I18nContext';

const Journal: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslations();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isWriting, setIsWriting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newEntry, setNewEntry] = useState({ title: '', content: '', mood: 'Happy' });
  const [attachments, setAttachments] = useState<JournalEntry['attachments']>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const refreshEntries = () => {
    if (user) setEntries(db.getJournalEntries(user.id));
  };

  useEffect(() => {
    refreshEntries();
    window.addEventListener('db-update', refreshEntries);
    return () => window.removeEventListener('db-update', refreshEntries);
  }, [user]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async () => {
    if (!user || !newEntry.content.trim()) return;
    setLoading(true);
    
    // Simple sentiment analysis locally
    let mood = newEntry.mood;
    if (newEntry.content.toLowerCase().includes('pain') || newEntry.content.toLowerCase().includes('sad')) mood = 'Concerned';
    if (newEntry.content.toLowerCase().includes('excited') || newEntry.content.toLowerCase().includes('happy')) mood = 'Happy';

    db.addJournalEntry(user.id, {
      ...newEntry,
      mood,
      attachments
    });

    setIsWriting(false);
    setNewEntry({ title: '', content: '', mood: 'Happy' });
    setAttachments([]);
    setLoading(false);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    files.forEach(file => {
      if (file.size > 2 * 1024 * 1024) {
        alert(t('journal.largeFile', { name: file.name }));
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        setAttachments(prev => [...prev, { name: file.name, url: ev.target?.result as string, type: file.type }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDeleteConfirm = () => {
    if (user && deleteConfirmId) {
      try {
        db.deleteJournalEntry(user.id, deleteConfirmId);
        showToast("Journal entry deleted", "success");
      } catch (err) {
        showToast("Failed to delete entry", "error");
      } finally {
        setDeleteConfirmId(null);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500 pb-20 relative">
      {/* Toast Notifications */}
      {toast && (
        <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[1000] px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-300 ${toast.type === 'success' ? 'bg-teal-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle2 size={18}/> : <AlertTriangle size={18}/>}
          <span className="text-sm font-bold">{toast.message}</span>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[40px] p-8 max-w-sm w-full shadow-2xl space-y-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle size={32}/>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{t('journal.confirmDelete')}</h3>
              <p className="text-sm text-gray-500 mt-2">Are you sure you want to delete this journal entry?</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteConfirmId(null)} 
                className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all cursor-pointer outline-none focus:ring-2 focus:ring-gray-200"
              >
                {t('common.cancel')}
              </button>
              <button 
                onClick={handleDeleteConfirm} 
                className="flex-1 py-3 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-200 cursor-pointer outline-none focus:ring-2 focus:ring-red-300"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('journal.title')}</h1>
          <p className="text-gray-500">{t('journal.subtitle')}</p>
        </div>
        {!isWriting && (
          <button 
            onClick={() => setIsWriting(true)}
            className="flex items-center gap-2 px-8 py-4 bg-teal-600 text-white rounded-2xl font-bold shadow-xl shadow-teal-600/20 hover:scale-105 active:scale-95 transition-all"
          >
            <Edit3 size={20}/> {t('journal.newEntry')}
          </button>
        )}
      </div>

      {isWriting && (
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 space-y-8 animate-in slide-in-from-top-4">
          <div className="space-y-6">
            <input 
              className="w-full text-2xl font-bold text-gray-800 bg-transparent outline-none placeholder:text-gray-200" 
              placeholder={t('journal.entryTitle')} 
              value={newEntry.title}
              onChange={e => setNewEntry({...newEntry, title: e.target.value})}
            />
            <textarea 
              className="w-full h-64 p-8 bg-[#F7F5EF] rounded-[32px] outline-none focus:ring-2 focus:ring-[#BFE6DA] resize-none text-lg font-medium shadow-inner" 
              placeholder={t('journal.placeholder')}
              value={newEntry.content}
              onChange={e => setNewEntry({...newEntry, content: e.target.value})}
            />
          </div>

          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-4">
              {attachments.map((at, i) => (
                <div key={i} className="relative w-24 h-24 rounded-2xl overflow-hidden shadow-sm group border border-gray-100">
                  {at.type.startsWith('image') ? (
                    <img src={at.url} className="w-full h-full object-cover" alt={at.name} />
                  ) : (
                    <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center p-2 text-center">
                      <FileText size={24} className="text-gray-400" />
                      <span className="text-[8px] mt-1 line-clamp-1">{at.name}</span>
                    </div>
                  )}
                  <button 
                    onClick={() => setAttachments(attachments.filter((_, idx) => idx !== i))} 
                    className="absolute top-1 right-1 p-1 bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12}/>
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between items-center pt-8 border-t border-gray-50">
            <div className="flex gap-4">
              <button onClick={() => fileRef.current?.click()} className="p-4 bg-gray-50 text-gray-400 hover:text-teal-600 rounded-2xl transition-all cursor-pointer"><ImagePlus size={24}/></button>
              <input type="file" ref={fileRef} className="hidden" multiple onChange={handleUpload} />
            </div>
            <div className="flex gap-4">
              <button onClick={() => setIsWriting(false)} className="px-8 py-4 text-gray-400 font-bold cursor-pointer">{t('journal.cancel')}</button>
              <button 
                onClick={handleSave}
                disabled={loading || !newEntry.content.trim()}
                className="px-10 py-4 bg-[#E6C77A] text-white rounded-2xl font-bold shadow-xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
              >
                <Save size={20}/> {t('journal.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {entries.length === 0 ? (
          <div className="bg-white p-20 rounded-[40px] text-center border-2 border-dashed border-gray-100">
             <BookOpen className="mx-auto text-gray-200 mb-4" size={64} />
             <p className="text-gray-400 font-medium text-lg">{t('journal.empty')}</p>
          </div>
        ) : (
          entries.map(entry => (
            <div key={entry.id} className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 space-y-6 hover:border-[#BFE6DA] transition-all group relative">
              <button 
                onClick={() => setDeleteConfirmId(entry.id)} 
                className="absolute top-8 right-8 p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all cursor-pointer z-10 rounded-xl hover:bg-red-50"
                title="Delete Entry"
              >
                <Trash2 size={18}/>
              </button>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#F7F5EF] rounded-2xl flex items-center justify-center text-teal-600 font-bold uppercase text-[10px] shadow-inner">
                    {new Date(entry.date).getDate()}<br/>{new Date(entry.date).toLocaleString('default', { month: 'short' })}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{entry.title || t('journal.untitled')}</h3>
                    <p className="text-xs text-gray-300 font-bold uppercase tracking-widest">{new Date(entry.date).toLocaleTimeString()}</p>
                  </div>
                </div>
                <span className="px-4 py-1.5 bg-teal-50 text-teal-600 rounded-full text-[10px] font-bold uppercase tracking-widest border border-teal-100">{entry.mood}</span>
              </div>
              <p className="text-gray-600 leading-relaxed font-medium line-clamp-3">{entry.content}</p>
              
              {entry.attachments && entry.attachments.length > 0 && (
                <div className="flex flex-wrap gap-4">
                  {entry.attachments.map((at, i) => (
                    at.type.startsWith('image') ? (
                      <img key={i} src={at.url} className="w-20 h-20 rounded-2xl object-cover shadow-sm border border-gray-50" alt={at.name} />
                    ) : (
                      <div key={i} className="w-20 h-20 bg-gray-50 rounded-2xl flex flex-col items-center justify-center text-gray-400 border border-gray-100 p-2 text-center">
                        <FileText size={16}/>
                        <span className="text-[7px] mt-1 line-clamp-1">{at.name}</span>
                      </div>
                    )
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Journal;