
import React, { useEffect, useRef, useState } from 'react';
import { LiveSessionClient, generateSessionAnalysis } from '../services/geminiService';
import { useLanguage } from '../context/LanguageContext';
import { SessionRecord } from '../types';

const SESSION_STORAGE_KEY = 'justiceAlly_sessions_v1';

const LiveSession: React.FC = () => {
  const { t, language } = useLanguage();
  const [status, setStatus] = useState("Disconnected");
  const [isActive, setIsActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [transcript, setTranscript] = useState<{role: string, text: string}[]>([]);
  const [scenario, setScenario] = useState("mock");
  const [sessionHistory, setSessionHistory] = useState<SessionRecord[]>(() => {
      const saved = localStorage.getItem(SESSION_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
  });
  const [currentRecord, setCurrentRecord] = useState<SessionRecord | null>(null);
  const [showHistoryView, setShowHistoryView] = useState(false);

  const clientRef = useRef<LiveSessionClient | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    clientRef.current = new LiveSessionClient(
      (s) => {
          setStatus(s);
          if (s.includes("Failed") || s.includes("Error")) {
              setConnectionError(true);
              setIsActive(false);
          } else {
              setConnectionError(false);
          }
      },
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

  // Persist history changes
  useEffect(() => {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionHistory));
  }, [sessionHistory]);

  const saveSession = async () => {
      if (transcript.length === 0) return;
      
      setIsAnalyzing(true);
      setShowReport(true); // Show loader

      try {
          const analysis = await generateSessionAnalysis(transcript, language);
          
          const newRecord: SessionRecord = {
              id: Date.now().toString(),
              date: new Date().toLocaleString(),
              transcript: [...transcript],
              analysis: analysis,
              scenario: scenario
          };

          setSessionHistory(prev => [newRecord, ...prev]);
          setCurrentRecord(newRecord);
      } catch (error) {
          console.error("Failed to analyze session", error);
      } finally {
          setIsAnalyzing(false);
      }
  };

  const toggleConnection = async () => {
    if (isActive) {
      await clientRef.current?.disconnect();
      setIsActive(false);
      await saveSession(); // Auto-save on disconnect
    } else {
      setTranscript([]); // Clear previous transcript
      setShowReport(false);
      setCurrentRecord(null);
      setConnectionError(false);
      await clientRef.current?.connect(language); // Pass current language
      setIsActive(true);
    }
  };

  const handleDeleteSession = (id: string) => {
      setSessionHistory(prev => prev.filter(s => s.id !== id));
      if (currentRecord?.id === id) {
          setCurrentRecord(null);
          setShowReport(false);
      }
  };

  const loadSession = (record: SessionRecord) => {
      setCurrentRecord(record);
      setTranscript(record.transcript);
      setShowReport(true);
      setShowHistoryView(false);
  };

  return (
    <div className="h-full flex flex-col md:flex-row bg-slate-950 relative overflow-hidden">
      
      {/* Left: Visualizer / Report / History */}
      <div className="flex-1 flex flex-col items-center justify-center relative p-8">
        
        {/* Gemini Badge */}
        <div className="absolute top-6 left-6 z-20 flex gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900/80 rounded-full border border-blue-500/30 backdrop-blur-sm shadow-lg">
                <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-blue-500 animate-pulse' : 'bg-slate-600'}`}></div>
                <span className="text-[9px] font-bold text-blue-300 uppercase tracking-wide">Powered by Gemini Live API</span>
            </div>
            
            {!isActive && (
                <button 
                    onClick={() => setShowHistoryView(!showHistoryView)}
                    className={`px-3 py-1 rounded-sm border text-[9px] font-bold uppercase tracking-wide transition-colors ${showHistoryView ? 'bg-amber-900/30 border-amber-500 text-amber-500' : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'}`}
                >
                    {showHistoryView ? "Back to Live" : t('live', 'history')}
                </button>
            )}
        </div>

        {showHistoryView ? (
            <div className="w-full max-w-lg h-[80%] bg-slate-900 border border-slate-800 rounded-sm p-6 shadow-2xl overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95">
                <h3 className="text-xl font-serif font-black text-white mb-6 border-b border-slate-800 pb-4">{t('live', 'history')}</h3>
                {sessionHistory.length === 0 ? (
                    <p className="text-slate-500 text-sm text-center italic mt-10">{t('live', 'noHistory')}</p>
                ) : (
                    <div className="space-y-3">
                        {sessionHistory.map(session => (
                            <div key={session.id} className="p-4 bg-slate-950 border border-slate-800 rounded-sm hover:border-slate-600 transition-colors flex justify-between items-center group">
                                <div onClick={() => loadSession(session)} className="cursor-pointer flex-1">
                                    <div className="text-xs text-amber-600 font-bold uppercase tracking-widest mb-1">{session.scenario}</div>
                                    <div className="text-slate-300 text-sm font-mono">{session.date}</div>
                                </div>
                                <button 
                                    onClick={() => handleDeleteSession(session.id)}
                                    className="p-2 text-slate-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                    title={t('common', 'delete')}
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        ) : showReport ? (
            <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-sm p-8 shadow-2xl animate-in fade-in zoom-in-95">
                <div className="text-center mb-6">
                    <h3 className="text-2xl font-serif font-black text-white mb-2">Session Analysis</h3>
                    <p className="text-[10px] uppercase tracking-widest text-slate-500">Post-Simulation Feedback</p>
                </div>
                
                {isAnalyzing ? (
                    <div className="py-12 flex flex-col items-center gap-4">
                        <svg className="animate-spin h-8 w-8 text-amber-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-slate-400 text-xs uppercase tracking-widest animate-pulse">Consulting Strategy Core...</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="p-4 bg-green-950/20 border-l-4 border-green-600 rounded-r-sm">
                            <h4 className="text-xs font-bold text-green-500 uppercase tracking-wider mb-2">Strong Points</h4>
                            <ul className="text-sm text-slate-300 space-y-1 list-disc list-inside font-serif">
                                {currentRecord?.analysis?.strongPoints.map((point, idx) => (
                                    <li key={idx}>{point}</li>
                                )) || <li>Analysis unavailable.</li>}
                            </ul>
                        </div>
                        <div className="p-4 bg-amber-950/20 border-l-4 border-amber-600 rounded-r-sm">
                            <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-2">Areas to Improve</h4>
                            <ul className="text-sm text-slate-300 space-y-1 list-disc list-inside font-serif">
                                {currentRecord?.analysis?.improvements.map((point, idx) => (
                                    <li key={idx}>{point}</li>
                                )) || <li>Analysis unavailable.</li>}
                            </ul>
                        </div>
                    </div>
                )}
                
                {!isAnalyzing && (
                    <button 
                        onClick={() => { setShowReport(false); setTranscript([]); setCurrentRecord(null); }}
                        className="w-full mt-8 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold uppercase text-xs tracking-wider rounded-sm transition-colors"
                    >
                        Start New Session
                    </button>
                )}
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

                <div className={`w-40 h-40 mx-auto rounded-full border-4 flex items-center justify-center relative shadow-2xl transition-all duration-500 ${isActive ? 'border-amber-600 bg-slate-900' : connectionError ? 'border-red-600 bg-red-950/20' : 'border-slate-800 bg-slate-950'}`}>
                    {isActive ? (
                    <div className="flex gap-1.5 h-16 items-center">
                        <div className="w-1.5 bg-amber-600 h-8 animate-[bounce_1s_infinite]"></div>
                        <div className="w-1.5 bg-amber-600 h-14 animate-[bounce_1.2s_infinite]"></div>
                        <div className="w-1.5 bg-amber-600 h-6 animate-[bounce_0.8s_infinite]"></div>
                        <div className="w-1.5 bg-amber-600 h-12 animate-[bounce_1.1s_infinite]"></div>
                        <div className="w-1.5 bg-amber-600 h-8 animate-[bounce_0.9s_infinite]"></div>
                    </div>
                    ) : connectionError ? (
                        <div className="flex flex-col items-center">
                            <svg className="w-10 h-10 text-red-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            <span className="text-[10px] uppercase font-bold text-red-400">Connection Failed</span>
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
                    <span className={`text-xs font-mono font-bold uppercase tracking-widest ${isActive ? 'text-green-500' : connectionError ? 'text-red-500' : 'text-slate-500'}`}>
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
                    {isActive ? t('live', 'terminate') : connectionError ? t('live', 'connectError') : t('live', 'initLink')}
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
               {currentRecord ? `Transcript: ${currentRecord.date}` : t('live', 'transcript')}
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
