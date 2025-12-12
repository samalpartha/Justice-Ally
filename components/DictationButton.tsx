
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { StreamingDictationClient } from "../services/geminiService";
import { Language } from "../types";
import { useLanguage } from '../context/LanguageContext';

type DictationButtonProps = {
  onTranscript: (text: string) => void;
  ariaLabel?: string;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const DictationButton: React.FC<DictationButtonProps> = ({
  onTranscript,
  ariaLabel,
  className,
  ...buttonProps
}) => {
  const { language } = useLanguage();
  const [isRecording, setIsRecording] = useState(false);
  const clientRef = useRef<StreamingDictationClient | null>(null);
  const onTranscriptRef = useRef(onTranscript);

  // keep latest callback to avoid stale closures
  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  const stopRecording = useCallback(() => {
    if (clientRef.current) {
      try {
        clientRef.current.stop();
      } catch (err) {
        console.error("Error stopping dictation:", err);
      }
      clientRef.current = null;
    }
    setIsRecording(false);
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const client = new StreamingDictationClient(
        (text: string) => {
          const trimmed = text.trim();
          if (!trimmed) return;
          onTranscriptRef.current(trimmed);
        },
        (error: unknown) => {
          console.error("Dictation error:", error);
          stopRecording();
        }
      );

      clientRef.current = client;
      await client.start(language as Language); // use context language
      setIsRecording(true);
    } catch (error) {
      console.error("Failed to start dictation:", error);
      clientRef.current = null;
      setIsRecording(false);
    }
  }, [stopRecording, language]);

  const handleClick = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      void startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (clientRef.current) {
        try {
          clientRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // Determine classes: if className provided, append recording state styles if active.
  // If not provided, use a default icon-button style.
  const baseClass = className ?? "p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-slate-800";
  const activeClass = isRecording ? " text-red-500 animate-pulse" : "";

  return (
    <button
      type="button"
      aria-label={ariaLabel ?? (isRecording ? "Stop dictation" : "Start dictation")}
      onClick={handleClick}
      className={`${baseClass}${activeClass} flex items-center justify-center`}
      title={isRecording ? "Stop Recording" : "Dictate"}
      {...buttonProps}
    >
      {isRecording ? (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <rect x="6" y="6" width="12" height="12" rx="2" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      )}
    </button>
  );
};

export default DictationButton;
