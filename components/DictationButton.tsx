
import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { StreamingDictationClient } from '../services/geminiService';

interface DictationButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
}

const DictationButton: React.FC<DictationButtonProps> = ({ onTranscript, className }) => {
  const { t, language } = useLanguage();
  const [isRecording, setIsRecording] = useState(false);
  const clientRef = useRef<StreamingDictationClient | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      clientRef.current?.stop();
    };
  }, []);

  const toggleRecording = async () => {
    if (isRecording) {
      clientRef.current?.stop();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      clientRef.current = new StreamingDictationClient(
        (text) => {
          // Provide immediate feedback as text streams in
          onTranscript(text + " ");
        },
        (err) => {
          console.error("Dictation Error:", err);
          setIsRecording(false);
          // Optional: Visual error feedback could go here
        }
      );
      await clientRef.current.start(language);
    }
  };

  return (
    <button
      type="button"
      onClick={toggleRecording}
      className={`relative px-3 py-2 rounded-sm transition-all flex items-center gap-2 overflow-hidden ${
        isRecording 
          ? 'bg-red-900/20 text-red-500 border border-red-500/50' 
          : 'text-slate-500 hover:text-amber-500 hover:bg-slate-800'
      } ${className}`}
      title={isRecording ? "Stop Recording" : t('dictation', 'clickToDictate')}
    >
      {/* Waveform Background Simulation */}
      {isRecording && (
          <div className="absolute inset-0 flex items-center justify-center gap-0.5 opacity-20 pointer-events-none">
              <div className="w-1 bg-red-500 h-3 animate-[pulse_0.5s_infinite]"></div>
              <div className="w-1 bg-red-500 h-6 animate-[pulse_0.7s_infinite]"></div>
              <div className="w-1 bg-red-500 h-4 animate-[pulse_0.4s_infinite]"></div>
              <div className="w-1 bg-red-500 h-7 animate-[pulse_0.6s_infinite]"></div>
              <div className="w-1 bg-red-500 h-3 animate-[pulse_0.5s_infinite]"></div>
          </div>
      )}

      {isRecording ? (
        <span className="relative flex h-3 w-3 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
      ) : (
        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      )}
      <span className={`text-[10px] font-bold uppercase ${isRecording ? 'text-red-400' : ''} hidden sm:inline relative z-10`}>
          {isRecording ? t('dictation', 'recording') : ''}
      </span>
    </button>
  );
};

export default DictationButton;
