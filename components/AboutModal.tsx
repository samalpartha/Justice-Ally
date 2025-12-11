
import React from 'react';
import { useLanguage } from '../context/LanguageContext';

interface AboutModalProps {
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
  const { t } = useLanguage();

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-sm shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-serif font-bold text-white mb-1">About JusticeAlly</h2>
            <div className="flex items-center gap-2">
               <span className="px-2 py-0.5 rounded-full bg-purple-900/30 border border-purple-500/50 text-purple-300 text-[10px] font-bold uppercase tracking-wider">
                 Powered by Gemini 3.0 Pro
               </span>
               <span className="px-2 py-0.5 rounded-full bg-blue-900/30 border border-blue-500/50 text-blue-300 text-[10px] font-bold uppercase tracking-wider">
                 Built with AI Studio
               </span>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto custom-scrollbar space-y-8">
           
           <div className="space-y-4">
              <h3 className="text-amber-500 font-bold uppercase tracking-widest text-xs border-b border-slate-800 pb-2">The "Vibe Coding" Story</h3>
              <p className="text-slate-300 font-serif leading-relaxed">
                JusticeAlly was constructed using Google AI Studio's "Vibe Coding" methodology. By leveraging natural language prompts within the IDE, the development process bypassed weeks of boilerplate engineering. This allowed the focus to remain purely on high-fidelity UX and complex legal logic.
              </p>
              <div className="grid grid-cols-2 gap-4 mt-4">
                 <div className="bg-slate-950 p-4 border border-slate-800 rounded-sm">
                    <div className="text-2xl font-black text-white mb-1">100%</div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">AI-Generated Code</div>
                 </div>
                 <div className="bg-slate-950 p-4 border border-slate-800 rounded-sm">
                    <div className="text-2xl font-black text-white mb-1">Gemini 3</div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Reasoning Engine</div>
                 </div>
              </div>
           </div>

           <div className="space-y-4">
              <h3 className="text-blue-500 font-bold uppercase tracking-widest text-xs border-b border-slate-800 pb-2">Tech Stack & Features</h3>
              <ul className="space-y-3">
                 {[
                   { title: "Gemini 3.0 Pro", desc: "Complex legal reasoning, strategy generation, and document analysis." },
                   { title: "Gemini 2.5 Flash", desc: "High-speed triage, risk scoring, and JSON extraction." },
                   { title: "Gemini Live API", desc: "Real-time, low-latency voice consultation via WebSocket." },
                   { title: "Client-Side Privacy", desc: "Zero-retention architecture. All data stays in the browser." }
                 ].map((item, i) => (
                   <li key={i} className="flex gap-3">
                      <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></div>
                      <div>
                         <strong className="text-slate-200 text-sm block">{item.title}</strong>
                         <span className="text-slate-400 text-xs">{item.desc}</span>
                      </div>
                   </li>
                 ))}
              </ul>
           </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-950 border-t border-slate-800 text-center">
           <button onClick={onClose} className="w-full py-3 bg-amber-700 hover:bg-amber-600 text-white font-bold uppercase text-xs tracking-[0.2em] rounded-sm transition-colors">
             Close
           </button>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;
