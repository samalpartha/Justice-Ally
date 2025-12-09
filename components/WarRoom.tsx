
import React, { useRef, useState } from 'react';
import { CaseData, UploadedFile } from '../types';
import DictationButton from './DictationButton';

interface WarRoomProps {
  caseData: CaseData | null;
  onFilesAdded?: (files: File[]) => void;
  onLinkAdded?: (link: UploadedFile) => void;
  onNotesChange?: (notes: string) => void;
  onLoadDemo?: () => void;
}

const WarRoom: React.FC<WarRoomProps> = ({ caseData, onFilesAdded, onLinkAdded, onNotesChange, onLoadDemo }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkName, setLinkName] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && onFilesAdded) {
      onFilesAdded(Array.from(e.target.files));
    }
  };

  const handleLinkSubmit = () => {
    if(linkUrl && linkName && onLinkAdded) {
      onLinkAdded({
        id: Math.random().toString(36).substr(2, 9),
        name: linkName,
        url: linkUrl,
        type: 'link'
      });
      setShowLinkInput(false);
      setLinkUrl('');
      setLinkName('');
    }
  };

  const EmptyState = () => (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-slate-300">War Room Empty</h2>
      <p className="text-slate-500 mt-2 mb-6 max-w-md">Upload documents to unlock strategic insights.</p>
      
      {onLoadDemo && (
        <button 
          onClick={onLoadDemo}
          className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-amber-900/20"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          Load Demo Case
        </button>
      )}
    </div>
  );

  return (
    <div className="h-full flex flex-col overflow-hidden relative">
      {/* War Room Header */}
      <div className="shrink-0 p-6 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            STRATEGY WAR ROOM
          </h1>
          <p className="text-xs text-slate-400">Review intelligence, map procedures, and execute.</p>
        </div>
        
        {onFilesAdded && (
          <div className="flex gap-2">
            <input 
              type="file" 
              ref={fileInputRef}
              className="hidden" 
              multiple 
              onChange={handleFileChange}
            />
            
            {/* Add Link Button */}
            <div className="relative">
               <button
                 onClick={() => setShowLinkInput(!showLinkInput)}
                 className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded border border-slate-700 flex items-center gap-2 transition-colors"
               >
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                 Add Link
               </button>
               {showLinkInput && (
                 <div className="absolute right-0 top-full mt-2 w-80 bg-slate-900 border border-slate-700 rounded-lg p-4 shadow-xl z-50">
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Attach External URL</h4>
                    <input 
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 mb-2 text-sm text-white" 
                      placeholder="Title (e.g. Court Docket)" 
                      value={linkName} 
                      onChange={e => setLinkName(e.target.value)} 
                    />
                    <input 
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 mb-3 text-sm text-white" 
                      placeholder="https://..." 
                      value={linkUrl} 
                      onChange={e => setLinkUrl(e.target.value)} 
                    />
                    <div className="flex justify-end gap-2">
                       <button onClick={() => setShowLinkInput(false)} className="text-xs text-slate-500 hover:text-white">Cancel</button>
                       <button onClick={handleLinkSubmit} className="text-xs bg-amber-600 hover:bg-amber-500 text-white px-3 py-1 rounded font-bold">Add</button>
                    </div>
                 </div>
               )}
            </div>

            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded border border-slate-700 flex items-center gap-2 transition-colors"
            >
              <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Quick Add Evidence
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Strategist Notepad (Persistent) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
               <h3 className="text-sm font-bold text-slate-400 uppercase flex items-center gap-2">
                 <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                 Strategist Notepad (Case Theory)
               </h3>
               <DictationButton 
                  onTranscript={(text) => onNotesChange && onNotesChange((caseData?.notes || '') + (caseData?.notes ? '\n' : '') + text)} 
               />
            </div>
            <textarea
              value={caseData?.notes || ''}
              onChange={(e) => onNotesChange && onNotesChange(e.target.value)}
              placeholder="Jot down quick facts, verbal threats, or specific dates not found in documents. e.g. 'Client remembers landlord threatened eviction on call June 12th'..."
              className="w-full bg-slate-950 text-slate-200 text-sm p-4 rounded border border-slate-700 focus:border-amber-500 outline-none min-h-[100px] resize-none font-mono"
            />
          </div>

          {!caseData || !caseData.strategy ? (
             <EmptyState />
          ) : (
            <>
              {/* Sun Tzu Header */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-8 border border-amber-900/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <svg className="w-32 h-32 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.42 12.54l-7.42-7.42-7.42 7.42c-.78.78-.78 2.05 0 2.83l7.42 7.42 7.42-7.42c.78-.78.78-2.05 0-2.83zm-7.42 5.59l-5.59-5.59 5.59-5.59 5.59 5.59-5.59 5.59z"/>
                  </svg>
                </div>
                <h2 className="text-amber-500 font-serif text-xl mb-2">The Art of Litigation</h2>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">"{caseData.strategy.sunTzu.strategyName}"</h1>
                <blockquote className="text-lg italic text-slate-300 border-l-4 border-amber-600 pl-4 mb-6">
                  "{caseData.strategy.sunTzu.quote}"
                </blockquote>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-xs font-bold uppercase text-slate-500 mb-2">Strategic Application</h4>
                    <p className="text-sm text-slate-200 leading-relaxed">{caseData.strategy.sunTzu.application}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase text-slate-500 mb-2">Opponent Profile</h4>
                    <p className="text-sm text-slate-200 leading-relaxed bg-slate-950/50 p-3 rounded border border-slate-800">
                      {caseData.strategy.sunTzu.opponentProfile}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Black Letter Law */}
                <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-slate-200">Black Letter Law Analysis</h3>
                    <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded">Elements of Claim</span>
                  </div>
                  
                  <div className="space-y-4">
                    {caseData.strategy.blackLetter.claimElements.map((el, idx) => (
                      <div key={idx} className="relative pl-6 border-l-2 border-slate-700">
                        <div className={`absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full ${
                          el.status === 'strong' ? 'bg-green-500' : el.status === 'weak' ? 'bg-amber-500' : 'bg-red-500'
                        }`}></div>
                        <h4 className="font-semibold text-slate-200 text-sm">{el.element}</h4>
                        <p className="text-xs text-slate-400 mt-1">{el.evidence || "No direct evidence found."}</p>
                        <span className={`inline-block mt-2 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          el.status === 'strong' ? 'bg-green-900/30 text-green-400' : 
                          el.status === 'weak' ? 'bg-amber-900/30 text-amber-400' : 'bg-red-900/30 text-red-400'
                        }`}>
                          Case Strength: {el.status}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-800">
                    <h4 className="text-sm font-bold text-slate-300 mb-3">Suggested Affirmative Defenses</h4>
                    <div className="flex flex-wrap gap-2">
                      {caseData.strategy.blackLetter.affirmativeDefenses.map((def, idx) => (
                        <span key={idx} className="px-3 py-1 bg-slate-800 text-slate-300 text-xs rounded-full border border-slate-700">
                          {def}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Procedural Next Steps */}
                <div className="space-y-6">
                  <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
                    <h3 className="text-xl font-bold text-slate-200 mb-4">Procedural Roadmap</h3>
                    <div className="bg-amber-900/10 border border-amber-900/30 p-4 rounded-lg mb-6">
                      <h4 className="text-amber-500 text-xs font-bold uppercase mb-1">Immediate Action</h4>
                      <p className="text-lg text-white font-semibold">{caseData.strategy.procedural.nextStep}</p>
                    </div>
                    
                    {caseData.strategy.procedural.deadlines.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-sm font-bold text-slate-400 mb-2">Critical Deadlines</h4>
                        <ul className="space-y-2">
                          {caseData.strategy.procedural.deadlines.map((d, i) => (
                            <li key={i} className="flex items-center text-sm text-red-300">
                              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {d}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
                    <h3 className="text-xl font-bold text-slate-200 mb-4">Discovery Engine</h3>
                    <p className="text-xs text-slate-500 mb-4">Proposed interrogatories to expose weaknesses.</p>
                    <ul className="space-y-3">
                      {caseData.strategy.procedural.discoveryQuestions.map((q, i) => (
                        <li key={i} className="flex gap-3 text-sm text-slate-300 bg-slate-950 p-3 rounded border border-slate-800/50">
                          <span className="text-amber-600 font-bold font-mono">Q{i+1}.</span>
                          {q}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WarRoom;
