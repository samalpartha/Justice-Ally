
import React, { useEffect, useRef, useState } from 'react';
import { LiveSessionClient } from '../services/geminiService';

const LiveSession: React.FC = () => {
  const [status, setStatus] = useState("Disconnected");
  const [isActive, setIsActive] = useState(false);
  const clientRef = useRef<LiveSessionClient | null>(null);

  useEffect(() => {
    clientRef.current = new LiveSessionClient((s) => setStatus(s));
    return () => {
      clientRef.current?.disconnect();
    };
  }, []);

  const toggleConnection = async () => {
    if (isActive) {
      await clientRef.current?.disconnect();
      setIsActive(false);
    } else {
      await clientRef.current?.connect();
      setIsActive(true);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center bg-slate-950 relative overflow-hidden">
      {/* Background Pulse Effect */}
      {isActive && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-96 h-96 bg-amber-500/10 rounded-full animate-ping"></div>
          <div className="w-64 h-64 bg-amber-500/20 rounded-full animate-pulse absolute"></div>
        </div>
      )}

      <div className="z-10 text-center space-y-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-white tracking-tight">Live Strategy Session</h2>
          <p className="text-slate-400">Real-time voice consultation with your AI Strategist.</p>
        </div>

        <div className="w-48 h-48 mx-auto rounded-full border-4 border-slate-800 flex items-center justify-center relative bg-slate-900 shadow-2xl">
           {isActive ? (
             <div className="w-full h-full rounded-full flex items-center justify-center">
                {/* Voice Wave Animation (Simulated) */}
                <div className="flex gap-1 h-12 items-center">
                  <div className="w-1 bg-amber-500 h-8 animate-[bounce_1s_infinite]"></div>
                  <div className="w-1 bg-amber-500 h-12 animate-[bounce_1.2s_infinite]"></div>
                  <div className="w-1 bg-amber-500 h-6 animate-[bounce_0.8s_infinite]"></div>
                  <div className="w-1 bg-amber-500 h-10 animate-[bounce_1.1s_infinite]"></div>
                  <div className="w-1 bg-amber-500 h-5 animate-[bounce_0.9s_infinite]"></div>
                </div>
             </div>
           ) : (
             <svg className="w-16 h-16 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
             </svg>
           )}
        </div>

        <div className="space-y-4">
          <div className={`text-sm font-mono font-bold uppercase tracking-widest ${isActive ? 'text-green-500' : 'text-slate-500'}`}>
            Status: {status}
          </div>

          <button
            onClick={toggleConnection}
            className={`px-8 py-4 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-xl ${
              isActive 
                ? 'bg-red-600 hover:bg-red-500 text-white' 
                : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white'
            }`}
          >
            {isActive ? 'End Session' : 'Start Live Session'}
          </button>
        </div>

        <p className="text-xs text-slate-600 max-w-sm mx-auto">
          Ensure your microphone is enabled. Audio is processed in real-time for immediate strategic feedback.
        </p>
      </div>
    </div>
  );
};

export default LiveSession;
