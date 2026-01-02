
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  BrainCircuit, Send, Sparkles, Search as SearchIcon, MapPin, 
  MessageSquare, History, Globe, ExternalLink, Mic, X, Volume2
} from 'lucide-react';
import { useTranslations } from '../i18n/I18nContext';
import { AIService } from '../services/aiService';
import { LiveAssistant } from '../components/ai/LiveAssistant';
import { speakTextNative, playPcmAudio } from '../services/ttsService';

export const Assistant: React.FC = () => {
  const { t, locale } = useTranslations();
  const [msg, setMsg] = useState('');
  const [chat, setChat] = useState<{role: 'user' | 'bot', text: string, sources?: any[]}[]>([]);
  const [loading, setLoading] = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState<number | null>(null);
  const [grounding, setGrounding] = useState<'none' | 'search' | 'maps'>('none');
  const [showLive, setShowLive] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat, loading]);

  const handleSend = async () => {
    if(!msg.trim()) return;
    const userMsg = msg;
    setMsg('');
    setChat(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      let location;
      if (grounding === 'maps') {
        const pos: any = await new Promise((res) => navigator.geolocation.getCurrentPosition(res, () => res(null)));
        if (pos) {
          location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        }
      }

      const response = await AIService.chatAssistant(userMsg, locale, grounding, location);
      setChat(prev => [...prev, { role: 'bot', text: response.text, sources: response.sources }]);
    } catch (error) {
      setChat(prev => [...prev, { role: 'bot', text: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = async (text: string, index: number) => {
    if (speakingIdx !== null) return;
    setSpeakingIdx(index);
    try {
      const audioBase64 = await AIService.generateSpeech(text, locale);
      await playPcmAudio(audioBase64);
    } catch (err) {
      await speakTextNative(text, locale);
    } finally {
      setSpeakingIdx(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-12rem)] flex flex-col bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden mb-12">
      {showLive && <LiveAssistant onClose={() => setShowLive(false)} />}
      
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#BFE6DA] text-teal-800 rounded-xl"><BrainCircuit size={24}/></div>
          <div>
            <h2 className="font-bold text-gray-800">{t('ai.askAssistant')}</h2>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">AI Care Expert Active</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <button 
            onClick={() => setShowLive(true)}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-md shadow-teal-600/20"
          >
            <Mic size={14}/> Live Voice
          </button>
          <div className="h-6 w-px bg-gray-100 mx-1"></div>
          <button 
            onClick={() => setGrounding(grounding === 'search' ? 'none' : 'search')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${grounding === 'search' ? 'bg-[#E6C77A] text-white' : 'bg-gray-50 text-gray-400'}`}
          >
            <SearchIcon size={14}/> Search
          </button>
          <button 
            onClick={() => setGrounding(grounding === 'maps' ? 'none' : 'maps')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${grounding === 'maps' ? 'bg-blue-500 text-white' : 'bg-gray-50 text-gray-400'}`}
          >
            <MapPin size={14}/> Near Me
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 bg-[#FAFAFC]/50 custom-scrollbar">
        {chat.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto space-y-4 opacity-50">
            <div className="w-20 h-20 bg-white rounded-[32px] shadow-sm flex items-center justify-center text-[#E6C77A]">
              <Sparkles size={40} className="animate-pulse"/>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-800">Hello, I'm your Nurture Glow AI.</p>
              <p className="text-sm text-gray-500">I can help with health logs, symptom analysis, and finding nearby hospitals. How can I assist you today?</p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-4">
              {["Common symptoms in Week 24?", "Nearby Gynaecologists", "Summarize my journal", "Vaccine schedule help"].map(q => (
                <button 
                  key={q} 
                  onClick={() => { setMsg(q); }}
                  className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-bold text-gray-400 hover:border-[#BFE6DA] hover:text-teal-600 transition-all text-left active:scale-95"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {chat.map((c, i) => (
          <div key={i} className={`flex ${c.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[85%] p-5 rounded-[28px] shadow-sm space-y-3 relative group ${c.role === 'user' ? 'bg-teal-600 text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'}`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{c.text}</p>
              
              {c.role === 'bot' && (
                <button 
                  onClick={() => handleSpeak(c.text, i)}
                  className={`absolute -right-12 top-0 p-2 rounded-xl transition-all ${speakingIdx === i ? 'text-teal-600 scale-110' : 'text-gray-300 hover:text-teal-500 opacity-0 group-hover:opacity-100'}`}
                >
                  <Volume2 size={20} className={speakingIdx === i ? 'animate-pulse' : ''} />
                </button>
              )}

              {c.sources && c.sources.length > 0 && (
                <div className="pt-3 border-t border-gray-100 space-y-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Verified Sources:</p>
                  <div className="flex flex-wrap gap-2">
                    {c.sources.map((chunk, idx) => (
                      chunk.web && (
                        <a 
                          key={idx} 
                          href={chunk.web.uri} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 hover:bg-teal-50 text-[9px] font-bold text-teal-700 rounded-full border border-gray-100 transition-all"
                        >
                          <Globe size={10}/> {chunk.web.title || 'Source'} <ExternalLink size={8}/>
                        </a>
                      )
                    ))}
                    {c.sources.map((chunk, idx) => (
                      chunk.maps && (
                        <a 
                          key={idx} 
                          href={chunk.maps.uri} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 hover:bg-blue-100 text-[9px] font-bold text-blue-700 rounded-full border border-blue-100 transition-all"
                        >
                          <MapPin size={10}/> {chunk.maps.title || 'Location'} <ExternalLink size={8}/>
                        </a>
                      )
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 p-5 rounded-[28px] rounded-tl-none flex items-center gap-3">
              <div className="flex gap-1">
                <span className="w-1 h-1 bg-teal-500 rounded-full animate-bounce"></span>
                <span className="w-1 h-1 bg-teal-500 rounded-full animate-bounce delay-150"></span>
                <span className="w-1 h-1 bg-teal-500 rounded-full animate-bounce delay-300"></span>
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Analyzing...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="p-6 bg-white border-t border-gray-50">
        <div className="max-w-4xl mx-auto flex gap-3 relative">
          <div className="flex-1 relative">
            <input 
              value={msg} 
              onChange={e => setMsg(e.target.value)} 
              onKeyDown={e => e.key === 'Enter' && handleSend()} 
              placeholder={t('ai.chatPlaceholder')} 
              className="w-full bg-[#F7F5EF] border-2 border-transparent rounded-[24px] pl-6 pr-14 py-4 text-sm focus:bg-white focus:ring-4 focus:ring-[#BFE6DA]/20 focus:border-[#BFE6DA] transition-all outline-none shadow-inner" 
            />
            {grounding !== 'none' && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2 py-1 bg-white rounded-lg shadow-sm border border-gray-100">
                {grounding === 'search' ? <SearchIcon size={12} className="text-[#E6C77A]"/> : <MapPin size={12} className="text-blue-500"/>}
                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">Grounded</span>
              </div>
            )}
          </div>
          <button 
            onClick={handleSend} 
            disabled={loading || !msg.trim()} 
            className="p-4 bg-teal-600 text-white rounded-2xl hover:bg-teal-700 active:scale-95 transition-all shadow-xl shadow-teal-600/20 disabled:opacity-50"
          >
            <Send size={24}/>
          </button>
        </div>
      </div>
    </div>
  );
};
