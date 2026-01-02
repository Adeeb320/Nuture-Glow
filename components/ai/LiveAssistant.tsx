"use client";

import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { MicOff, Sparkles, AlertCircle } from 'lucide-react';

// Manual Base64 Implementation
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const LiveAssistant: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef(new Set<AudioBufferSourceNode>());
  const sessionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startSession = async () => {
    if (isConnecting || isActive) return;
    
    setIsConnecting(true);
    setErrorMessage(null);
    
    try {
      if (!process.env.API_KEY) {
        throw new Error("API Key is missing. Please ensure your environment is configured.");
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      if (inputCtx.state === 'suspended') await inputCtx.resume();
      if (outputCtx.state === 'suspended') await outputCtx.resume();
      
      audioContextRef.current = inputCtx;
      outputAudioContextRef.current = outputCtx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setIsConnecting(false);
            
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              }).catch(() => {});
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message) => {
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current) {
              const ctx = outputAudioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              
              try {
                const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
                const source = ctx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(ctx.destination);
                
                source.addEventListener('ended', () => {
                  sourcesRef.current.delete(source);
                });

                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
                sourcesRef.current.add(source);
              } catch (decodeErr) {
                console.error("Audio decoding error:", decodeErr);
              }
            }

            if (message.serverContent?.interrupted) {
              for (const source of sourcesRef.current.values()) {
                try { source.stop(); } catch(e) {}
                sourcesRef.current.delete(source);
              }
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error("Live Error Callback:", e);
            setErrorMessage("Connection encountered a network error. This might be due to regional availability or API limits.");
            setIsConnecting(false);
          },
          onclose: () => {
            setIsActive(false);
            setIsConnecting(false);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
          },
          systemInstruction: 'You are Nurture Glow, a warm and caring health assistant for mothers. Provide supportive, clinically-accurate (within your limits) advice. Speak in a soothing, professional yet empathetic tone.'
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to establish a live connection.");
      setIsConnecting(false);
    }
  };

  const stopSession = () => {
    if (sessionRef.current) {
      try { sessionRef.current.close(); } catch(e) {}
      sessionRef.current = null;
    }
    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch(e) {}
      audioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
      try { outputAudioContextRef.current.close(); } catch(e) {}
      outputAudioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsActive(false);
    setIsConnecting(false);
    onClose();
  };

  useEffect(() => {
    startSession();
    return () => {
      if (sessionRef.current) sessionRef.current.close();
      if (audioContextRef.current) audioContextRef.current.close();
      if (outputAudioContextRef.current) outputAudioContextRef.current.close();
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div 
        className="bg-white rounded-[28px] p-7 flex flex-col gap-4 shadow-2xl text-center animate-in zoom-in-95 duration-300 w-[clamp(360px,92vw,560px)] h-auto max-h-[80vh] md:max-h-[520px] overflow-y-auto"
      >
        <div className="relative">
          <div className={`w-32 h-32 rounded-full flex items-center justify-center mx-auto ring-8 transition-all ${isActive ? 'bg-[#BFE6DA]/20 ring-[#BFE6DA]/10' : 'bg-gray-50 ring-gray-100'}`}>
            {isActive ? (
              <div className="flex gap-1.5 items-end h-10">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i} 
                    className="w-1.5 bg-teal-500 rounded-full animate-bounce" 
                    style={{ animationDelay: `${i * 150}ms`, height: `${30 + Math.random() * 70}%` }}
                  />
                ))}
              </div>
            ) : isConnecting ? (
              <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <MicOff className="text-gray-300" size={48} />
            )}
          </div>
          {isActive && (
             <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full animate-pulse uppercase tracking-widest">
               Live
             </div>
          )}
        </div>

        <div>
          <h3 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
            <Sparkles className="text-[#E6C77A]" size={20} />
            {isConnecting ? 'Initializing...' : isActive ? 'Listening...' : 'Voice Assistant'}
          </h3>
          
          {errorMessage ? (
            <div className="mt-2 p-4 bg-red-50 rounded-2xl flex items-start gap-3 text-left">
              <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs text-red-700 font-medium leading-relaxed">{errorMessage}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-500 mt-1">
              {isActive 
                ? "I'm here for you. Ask me anything about your health journey." 
                : "Setting up a private, low-latency session..."}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3 pt-2">
          {errorMessage ? (
            <button 
              onClick={startSession}
              className="w-full h-[52px] bg-teal-600 text-white rounded-3xl font-bold shadow-xl hover:bg-teal-700 transition-all uppercase tracking-widest text-xs flex items-center justify-center"
            >
              Retry Connection
            </button>
          ) : isActive && (
            <button 
              onClick={stopSession}
              className="w-full h-[52px] bg-teal-600 text-white rounded-3xl font-bold shadow-xl shadow-teal-600/20 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-xs flex items-center justify-center"
            >
              End Session
            </button>
          )}
          
          {!errorMessage && <p className="text-[10px] text-gray-400 font-medium">Encrypted care session.</p>}
        </div>
      </div>
    </div>
  );
};