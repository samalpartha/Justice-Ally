
import React, { useState, useEffect } from 'react';

interface DictationButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
  placeholder?: string;
}

const DictationButton: React.FC<DictationButtonProps> = ({ onTranscript, className, placeholder = "Dictate" }) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [supported, setSupported] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // Check for browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSupported(true);
      const rec = new SpeechRecognition();
      rec.continuous = false; // Capture one utterance at a time for simple input
      rec.interimResults = false;
      rec.lang = 'en-US';
      
      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
           onTranscript(transcript);
        }
        setIsListening(false);
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        if (event.error === 'network') {
          setErrorMsg("Network error. Please check connection.");
          alert("Dictation Error: Network connection failed. This feature requires an active internet connection to process speech.");
        } else if (event.error === 'not-allowed') {
          setErrorMsg("Microphone access denied.");
          alert("Dictation Error: Microphone access blocked. Please allow microphone permissions in your browser settings.");
        } else {
           setErrorMsg(`Error: ${event.error}`);
        }
        setIsListening(false);
      };
      
      rec.onend = () => {
        setIsListening(false);
      };

      setRecognition(rec);
    }
  }, [onTranscript]);

  const toggleListening = () => {
    if (!recognition) return;
    setErrorMsg(null);

    if (isListening) {
      try {
        recognition.stop();
      } catch (e) {
        // Ignore stop errors
      }
      setIsListening(false);
    } else {
      try {
        recognition.start();
        setIsListening(true);
      } catch (e) {
        console.error("Failed to start recognition", e);
        // If start fails (e.g. already started), ensure state matches
        setIsListening(false);
      }
    }
  };

  if (!supported) return null;

  return (
    <button
      onClick={toggleListening}
      type="button"
      className={`p-2 rounded-full transition-all flex items-center gap-2 ${
        isListening 
          ? 'bg-red-500/20 text-red-500 animate-pulse border border-red-500/50' 
          : 'text-slate-500 hover:text-amber-500 hover:bg-slate-800'
      } ${className}`}
      title={errorMsg || (isListening ? "Listening..." : "Click to dictate text")}
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
      {isListening && <span className="text-[10px] font-bold uppercase animate-pulse">Recording...</span>}
    </button>
  );
};

export default DictationButton;
