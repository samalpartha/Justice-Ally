
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
      className={`p-2 rounded-full transition-all flex items-center gap-2 ${
        isRecording 
          ? 'bg-red-500/20 text-red-500 animate-pulse border border-red-500/50' 
          : 'text-slate-500 hover:text-amber-500 hover:bg-slate-800'
      } ${className}`}
      title={isRecording ? "Stop Recording" : t('dictation', 'clickToDictate')}
    >
      {isRecording ? (
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
      ) : (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      )}
      {isRecording && <span className="text-[10px] font-bold uppercase hidden sm:inline">{t('dictation', 'recording')}</span>}
    </button>
  );
};

export default DictationButton;
