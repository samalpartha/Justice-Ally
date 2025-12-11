
import React, { useEffect, useRef, useState } from 'react';
import { LiveSessionClient } from '../services/geminiService';
import { useLanguage } from '../context/LanguageContext';

const LiveSession: React.FC = () => {
  const { t, language } = useLanguage();
  const [status, setStatus] = useState("Disconnected");
  const [isActive, setIsActive] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [transcript, setTranscript] = useState<{role: string, text: string}[]>([]);
  const [scenario, setScenario] = useState("mock");
  const clientRef = useRef<LiveSessionClient | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    clientRef.current = new LiveSessionClient(
      (s) => setStatus(s),
      (role, text) => {
        setTranscript(prev => {
          // Append if same role, else new entry
          const last = prev[prev.length - 1];
          if (last && last.role === role) {
             return [...prev.slice(0, -1), { role, text: last.text + text }];
          }
          return [...prev, { role, text }];
        });
      }
    );
    return () => {
      clientRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

  const toggleConnection = async () => {
    if (isActive) {
      await clientRef.current?.disconnect();
      setIsActive(false);
      // Show report if there was a conversation
      if (transcript.length > 0) {
          setShowReport(true);
      }
    } else {
      setTranscript([]); // Clear previous transcript
      setShowReport(false);
      await clientRef.current?.connect(language); // Pass current language
      setIsActive(true);
    }
  };

  return (
    <div className="h-full flex flex-col md:flex-row bg-slate-950 relative overflow-hidden">
      
      {/* Left: Visualizer / Report */}
      <div className="flex-1 flex flex-col items-center justify-center relative p-8">
        
        {showReport ? (
            <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-sm p-8 shadow-2xl animate-in fade-in zoom-in-95">
                <div className="text-center mb-6">
                    <h3 className="text-2xl font-serif font-black text-white mb-2">Session Analysis</h3>
                    <p className="text-[10px] uppercase tracking-widest text-slate-500">Post-Simulation Feedback</p>
                </div>
                
                <div className="space-y-6">
                    <div className="p-4 bg-green-950/20 border-l-4 border-green-600 rounded-r-sm">
                        <h4 className="text-xs font-bold text-green-500 uppercase tracking-wider mb-1">Strong Points</h4>
                        <ul className="text-sm text-slate-300 space-y-1 list-disc list-inside font-serif">
                            <li>Clear articulation of facts</li>
                            <li>Maintained composure during questioning</li>
                        </ul>
                    </div>
                    <div className="p-4 bg-amber-950/20 border-l-4 border-amber-600 rounded-r-sm">
                        <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-1">Areas to Improve</h4>
                        <ul className="text-sm text-slate-300 space-y-1 list-disc list-inside font-serif">
                            <li>Provide more direct evidence citations</li>
                            <li>Avoid emotional arguments; focus on statutes</li>
                        </ul>
                    </div>
                </div>
                
                <button 
                    onClick={() => setShowReport(false)}
                    className="w-full mt-8 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold uppercase text-xs tracking-wider rounded-sm transition-colors"
                >
                    Start New Session
                </button>
            </div>
        ) : (
            <>
                {isActive && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-[500px] h-[500px] bg-amber-600/5 rounded-full animate-ping"></div>
                    <div className="w-[400px] h-[400px] bg-amber-600/10 rounded-full animate-pulse absolute"></div>
                </div>
                )}

                <div className="z-10 text-center space-y-12 max-w-lg w-full">
                <div className="space-y-4">
                    <h2 className="text-4xl font-serif font-black text-white tracking-tight">{t('live', 'header')}</h2>
                    <p className="text-amber-600 uppercase tracking-[0.2em] text-xs font-bold">{t('live', 'secureChannel')}</p>
                </div>

                <div className={`w-40 h-40 mx-auto rounded-full border-4 flex items-center justify-center relative shadow-2xl transition-all duration-500 ${isActive ? 'border-amber-600 bg-slate-900' : 'border-slate-800 bg-slate-950'}`}>
                    {isActive ? (
                    <div className="flex gap-1.5 h-16 items-center">
                        <div className="w-1.5 bg-amber-600 h-8 animate-[bounce_1s_infinite]"></div>
                        <div className="w-1.5 bg-amber-600 h-14 animate-[bounce_1.2s_infinite]"></div>
                        <div className="w-1.5 bg-amber-600 h-6 animate-[bounce_0.8s_infinite]"></div>
                        <div className="w-1.5 bg-amber-600 h-12 animate-[bounce_1.1s_infinite]"></div>
                        <div className="w-1.5 bg-amber-600 h-8 animate-[bounce_0.9s_infinite]"></div>
                    </div>
                    ) : (
                    <svg className="w-12 h-12 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                    )}
                </div>

                <div className="space-y-6">
                    {!isActive && (
                        <div className="w-full max-w-xs mx-auto">
                            <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2 text-left">{t('live', 'selectScenario')}</label>
                            <div className="relative">
                                <select 
                                    value={scenario}
                                    onChange={(e) => setScenario(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 text-slate-300 text-xs py-3 px-4 rounded-sm outline-none appearance-none font-serif cursor-pointer hover:border-amber-600 transition-colors"
                                >
                                    <option value="mock">{t('live', 'scenarioMock')}</option>
                                    <option value="consult">{t('live', 'scenarioConsult')}</option>
                                    <option value="negotiation">{t('live', 'scenarioNeg')}</option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-slate-900 border border-slate-800 px-6 py-3 inline-block rounded-sm">
                    <span className={`text-xs font-mono font-bold uppercase tracking-widest ${isActive ? 'text-green-500' : 'text-slate-500'}`}>
                        Status: {status}
                    </span>
                    </div>

                    <button
                    onClick={toggleConnection}
                    className={`w-full py-5 rounded-sm font-bold text-sm uppercase tracking-[0.2em] transition-all shadow-xl border ${
                        isActive 
                        ? 'bg-red-900/80 hover:bg-red-900 text-white border-red-700' 
                        : 'bg-amber-700 hover:bg-amber-600 text-white border-amber-600'
                    }`}
                    >
                    {isActive ? t('live', 'terminate') : t('live', 'initLink')}
                    </button>
                </div>
                </div>
            </>
        )}
      </div>

      {/* Right: Transcript */}
      <div className="w-full md:w-96 bg-slate-900 border-l border-slate-800 flex flex-col h-1/3 md:h-full">
         <div className="px-6 py-4 border-b border-slate-800 bg-slate-900">
            <h3 className="font-serif font-bold text-slate-200 text-sm flex items-center gap-2">
               <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
               {t('live', 'transcript')}
            </h3>
         </div>
         <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-950">
            {transcript.length === 0 && isActive && (
               <p className="text-slate-600 text-xs italic text-center mt-10">{t('live', 'listening')}</p>
            )}
            {transcript.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                 <span className={`text-[9px] font-bold uppercase tracking-widest mb-1 ${msg.role === 'user' ? 'text-slate-500' : 'text-amber-600'}`}>
                    {msg.role === 'user' ? (language === 'es' ? 'Usted' : 'You') : 'Justice Ally'}
                 </span>
                 <div className={`p-3 rounded-sm text-sm font-serif max-w-[90%] leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-slate-800 text-slate-300 border border-slate-700' 
                      : 'bg-slate-950 text-slate-100 border border-slate-800'
                 }`}>
                   {msg.text}
                 </div>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default LiveSession;
