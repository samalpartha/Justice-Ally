
import React, { useRef, useState } from 'react';
import { CaseData, UploadedFile } from '../types';
import DictationButton from './DictationButton';
import { useLanguage } from '../context/LanguageContext';

interface WarRoomProps {
  caseData: CaseData | null;
  onFilesAdded?: (files: File[]) => void;
  onLinkAdded?: (link: UploadedFile) => void;
  onNotesChange?: (notes: string) => void;
  onLoadDemo?: () => void;
}

const WarRoom: React.FC<WarRoomProps> = ({ caseData, onFilesAdded, onLinkAdded, onNotesChange, onLoadDemo }) => {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkName, setLinkName] = useState('');
  const [saveStatus, setSaveStatus] = useState<string>('');

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

  const handleManualSave = () => {
    if (caseData?.notes && onFilesAdded) {
        const blob = new Blob([caseData.notes], { type: 'text/plain' });
        const dateStr = new Date().toISOString().split('T')[0];
        const file = new File([blob], `Counsel_Memo_${dateStr}.txt`, { type: 'text/plain' });
        onFilesAdded([file]);
    }

    setSaveStatus('SAVED TO VAULT');
    setTimeout(() => setSaveStatus(''), 2000);
  };

  const handleExportPdf = () => {
      window.print();
  };

  const EmptyState = () => (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-slate-950 transition-colors duration-300 print:hidden">
      <div className="w-20 h-20 border-2 border-slate-800 rounded-sm flex items-center justify-center mb-6 bg-slate-900 shadow-2xl transition-colors duration-300">
         <svg className="w-10 h-10 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
         </svg>
      </div>
      <h2 className="text-3xl font-serif font-bold text-slate-200 tracking-tight mb-2 transition-colors duration-300">{t('warroom', 'unavailable')}</h2>
      <p className="text-slate-500 mb-8 max-w-md font-serif text-sm leading-relaxed transition-colors duration-300">
        {t('warroom', 'unavailableDesc')}
      </p>
      
      {onLoadDemo && (
        <button 
          onClick={onLoadDemo}
          title="Populate with sample Landlord/Tenant case data."
          className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-amber-600 font-bold rounded-sm transition-colors border border-amber-600/50 uppercase tracking-[0.1em] text-xs shadow-lg hover:border-amber-600 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {t('warroom', 'loadDemo')}
        </button>
      )}
    </div>
  );

  return (
    <div className="h-full flex flex-col overflow-hidden relative bg-slate-950 transition-colors duration-300 print:overflow-visible print:h-auto print:block print:bg-white">
      {/* Strategy Header */}
      <div className="shrink-0 px-4 md:px-8 py-6 border-b-2 border-slate-800 bg-slate-950 shadow-xl z-10 flex flex-col md:flex-row justify-between items-start md:items-center transition-colors duration-300 no-print gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-serif font-black text-slate-100 flex items-center gap-3 tracking-tight transition-colors duration-300">
             {t('warroom', 'header')}
          </h1>
          <p className="text-[10px] text-amber-600 uppercase tracking-[0.3em] font-bold mt-1 transition-colors duration-300">{t('warroom', 'subHeader')}</p>
        </div>
        
        {onFilesAdded && (
          <div className="flex flex-wrap gap-4 w-full md:w-auto">
            <input 
              type="file" 
              ref={fileInputRef}
              className="hidden" 
              multiple 
              onChange={handleFileChange}
            />
            
            {caseData && (
              <button 
                onClick={handleExportPdf}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 text-[10px] font-bold uppercase rounded-sm border border-slate-700 flex items-center gap-2 transition-colors tracking-wider"
                title="Export Strategy to PDF"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                {t('warroom', 'exportPdf')}
              </button>
            )}

            <div className="relative">
               <button
                 onClick={() => setShowLinkInput(!showLinkInput)}
                 className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 text-[10px] font-bold uppercase rounded-sm border border-slate-700 flex items-center gap-2 transition-colors tracking-wider"
                 title="Add Citation"
               >
                 <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                 {t('warroom', 'addCitation')}
               </button>
               {showLinkInput && (
                 <div className="absolute right-0 top-full mt-2 w-80 bg-slate-900 border border-slate-600 rounded-sm shadow-2xl z-50 p-6 transition-colors duration-300">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-4 tracking-widest border-b border-slate-700 pb-2">External Authority</h4>
                    <input 
                      className="w-full bg-slate-950 border-b border-slate-600 rounded-none px-0 py-2 mb-3 text-sm text-slate-100 font-serif focus:border-amber-600 outline-none placeholder:text-slate-600 transition-colors duration-300" 
                      placeholder="Citation Title" 
                      value={linkName} 
                      onChange={e => setLinkName(e.target.value)} 
                    />
                    <input 
                      className="w-full bg-slate-950 border-b border-slate-600 rounded-none px-0 py-2 mb-6 text-sm text-slate-100 font-serif focus:border-amber-600 outline-none placeholder:text-slate-600 transition-colors duration-300" 
                      placeholder="Source URL" 
                      value={linkUrl} 
                      onChange={e => setLinkUrl(e.target.value)} 
                    />
                    <div className="flex justify-end gap-3">
                       <button onClick={() => setShowLinkInput(false)} className="text-xs text-slate-500 hover:text-slate-200 uppercase font-bold tracking-wider">Cancel</button>
                       <button onClick={handleLinkSubmit} className="text-xs bg-amber-700 hover:bg-amber-600 text-white px-4 py-2 rounded-sm font-bold uppercase tracking-wider">Attach</button>
                    </div>
                 </div>
               )}
            </div>

            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-amber-700 hover:bg-amber-600 text-white text-[10px] font-bold uppercase rounded-sm border border-amber-600 flex items-center gap-2 transition-colors tracking-wider shadow-lg"
              title="Quick Add Evidence"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              {t('warroom', 'quickAdd')}
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 print:overflow-visible print:h-auto print:p-0">
        <div className="max-w-[1600px] mx-auto space-y-8 print:max-w-none print:space-y-6">
          
          {/* Counsel's Notes (Always Visible but styled for print) */}
          <div className="bg-slate-900 border border-slate-800 rounded-sm shadow-lg relative overflow-hidden group transition-colors duration-300">
            {/* Header Actions - Hidden in Print */}
            <div className="bg-slate-900 px-6 py-3 border-b border-slate-800 flex justify-between items-center transition-colors duration-300 no-print">
               <h3 className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-2 tracking-[0.2em]">
                 <svg className="w-3 h-3 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                 {t('warroom', 'memo')}
               </h3>
               <div className="flex items-center gap-3">
                   <DictationButton 
                      onTranscript={(text) => onNotesChange && onNotesChange((caseData?.notes || '') + (caseData?.notes ? '\n' : '') + text)} 
                      className="text-slate-500 hover:text-amber-500"
                   />
               </div>
            </div>
            
            {/* Editable Textarea - Hidden in Print */}
            <textarea
              value={caseData?.notes || ''}
              onChange={(e) => onNotesChange && onNotesChange(e.target.value)}
              placeholder={t('warroom', 'memoPlaceholder')}
              className="w-full bg-slate-950 text-slate-200 text-sm p-6 outline-none min-h-[120px] resize-none font-serif leading-7 transition-colors duration-300 no-print"
            />

            {/* Read-Only Print View for Notes */}
            <div className="hidden print:block p-6 text-black font-serif text-sm leading-relaxed whitespace-pre-wrap">
                <h3 className="text-lg font-bold uppercase mb-2 border-b border-gray-300 pb-1">Counsel's Memorandum</h3>
                {caseData?.notes || "No notes recorded."}
            </div>

            {/* Save Entry Button - Hidden in Print */}
            <div className="px-6 pb-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center transition-colors duration-300 no-print">
                <span className={`text-[10px] font-bold uppercase tracking-widest transition-opacity duration-300 ${saveStatus ? 'text-green-500 opacity-100' : 'opacity-0'}`}>
                  {saveStatus}
                </span>
                <button 
                  onClick={handleManualSave}
                  className="text-[10px] font-bold uppercase bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 px-4 py-2 rounded-sm border border-slate-700 hover:border-slate-500 transition-all shadow-md active:transform active:scale-95 flex items-center gap-2"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                  SAVE ENTRY
                </button>
            </div>
          </div>

          {!caseData || !caseData.strategy ? (
             <EmptyState />
          ) : (
            <>
              {/* Strategy Content Renders Here */}
              <div className="hidden print:block print:mb-6">
                 <h1 className="text-2xl font-serif font-black text-black">CASE STRATEGY REPORT</h1>
                 <p className="text-xs uppercase font-bold text-gray-500">Privileged & Confidential Work Product</p>
                 <hr className="my-2 border-gray-300"/>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:block print:gap-0 print:space-y-6">
                <div className="lg:col-span-2 bg-slate-900 rounded-sm border-l-4 border-amber-600 p-8 shadow-md relative overflow-hidden transition-colors duration-300 print:break-inside-avoid">
                   {/* Badge */}
                   <div className="absolute top-4 right-4 z-20 no-print">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-950/80 rounded-full border border-purple-500/50 backdrop-blur-sm">
                         <svg className="w-3 h-3 text-purple-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/><path d="M12 6a1 1 0 0 0-1 1v4H7a1 1 0 0 0 0 2h4v4a1 1 0 0 0 2 0v-4h4a1 1 0 0 0 0-2h-4V7a1 1 0 0 0-1-1z"/></svg>
                         <span className="text-[9px] font-bold text-purple-300 uppercase tracking-wide">Powered by Gemini 3 Pro</span>
                      </div>
                   </div>

                   <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                      <svg className="w-32 h-32 text-slate-100" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5 10 5 10-5-5-2.5-5 2.5z"/></svg>
                   </div>
                   <h2 className="text-[10px] font-bold uppercase text-amber-600 tracking-widest mb-4 flex items-center gap-2">
                     {t('warroom', 'theory')}
                   </h2>
                   <h3 className="text-2xl md:text-3xl font-serif font-black text-slate-100 mb-6 tracking-tight transition-colors duration-300">"{caseData.strategy.sunTzu.strategyName}"</h3>
                   
                   <div className="grid md:grid-cols-2 gap-8 relative z-10">
                     <div>
                        <span className="block text-[9px] text-slate-500 uppercase font-bold tracking-widest mb-2">{t('warroom', 'guidingPrinciple')}</span>
                        <blockquote className="text-lg italic text-slate-300 font-serif border-l-2 border-slate-700 pl-4 leading-relaxed transition-colors duration-300">
                          "{caseData.strategy.sunTzu.quote}"
                        </blockquote>
                     </div>
                     <div>
                        <span className="block text-[9px] text-slate-500 uppercase font-bold tracking-widest mb-2">{t('warroom', 'tacticalApp')}</span>
                        <p className="text-sm text-slate-200 leading-relaxed font-serif transition-colors duration-300">{caseData.strategy.sunTzu.application}</p>
                     </div>
                   </div>
                </div>

                <div className="bg-slate-900 rounded-sm border border-slate-800 p-6 shadow-md flex flex-col transition-colors duration-300 print:mt-6 print:break-inside-avoid">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-slate-800 pb-2">
                    <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    {t('warroom', 'opponentProfile')}
                  </h3>
                  <div className="flex-1 bg-slate-950 p-4 border border-slate-800 rounded-sm transition-colors duration-300">
                    <p className="text-sm text-slate-300 leading-relaxed font-serif transition-colors duration-300">
                      {caseData.strategy.sunTzu.opponentProfile}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 rounded-sm border border-slate-800 shadow-md overflow-hidden transition-colors duration-300 print:break-inside-avoid">
                <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors duration-300">
                  <h3 className="text-sm font-serif font-bold text-slate-200 flex items-center gap-2 transition-colors duration-300">
                    <span className="text-amber-600">§</span> {t('warroom', 'matrix')}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {caseData.strategy.blackLetter.affirmativeDefenses.map((def, idx) => (
                        <span key={idx} className="text-[9px] bg-slate-900 border border-slate-700 text-slate-400 px-2 py-1 uppercase tracking-wider font-bold rounded-sm transition-colors duration-300">
                          {def}
                        </span>
                    ))}
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-900 transition-colors duration-300">
                        <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest w-1/4">{t('warroom', 'legalElement')}</th>
                        <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest w-24">{t('warroom', 'status')}</th>
                        <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('warroom', 'evidenceNotes')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {caseData.strategy.blackLetter.claimElements.map((el, idx) => (
                        <tr key={idx} className="hover:bg-slate-800 transition-colors duration-300">
                          <td className="p-4 text-sm font-serif font-bold text-slate-200 transition-colors duration-300">{el.element}</td>
                          <td className="p-4">
                             <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-sm text-[9px] font-bold uppercase tracking-wider border ${
                               el.status === 'strong' ? 'bg-green-950/30 text-green-500 border-green-800' : 
                               el.status === 'weak' ? 'bg-amber-950/30 text-amber-500 border-amber-800' : 
                               'bg-red-950/30 text-red-500 border-red-800'
                             }`}>
                               <span className={`w-1.5 h-1.5 rounded-full ${
                                 el.status === 'strong' ? 'bg-green-500' : el.status === 'weak' ? 'bg-amber-500' : 'bg-red-500'
                               }`}></span>
                               {el.status}
                             </span>
                          </td>
                          <td className="p-4 text-sm text-slate-400 font-serif italic border-l border-slate-800">
                            {el.evidence || "No direct evidence identified."}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8 print:block print:gap-0 print:space-y-6">
                <div className="bg-slate-900 rounded-sm border border-slate-800 p-6 shadow-md transition-colors duration-300 print:break-inside-avoid">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-slate-800 pb-2">
                    <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    {t('warroom', 'deadlines')}
                  </h3>
                  <div className="bg-blue-950/10 border-l-2 border-blue-500 p-4 mb-6 transition-colors duration-300">
                     <span className="block text-[9px] text-blue-500 uppercase font-bold mb-1">{t('warroom', 'immediateAction')}</span>
                     <p className="text-sm text-slate-200 font-serif font-medium transition-colors duration-300">{caseData.strategy.procedural.nextStep}</p>
                  </div>
                  <ul className="space-y-3">
                    {caseData.strategy.procedural.deadlines.map((d, i) => (
                      <li key={i} className="flex items-center gap-3 text-xs text-slate-300 font-mono border-b border-slate-800 pb-2 last:border-0 transition-colors duration-300">
                         <span className="text-slate-600">●</span> {d}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-slate-900 rounded-sm border border-slate-800 p-6 shadow-md transition-colors duration-300 print:mt-6 print:break-inside-avoid">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-slate-800 pb-2">
                    <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    {t('warroom', 'discoveryPlan')}
                  </h3>
                  <ul className="space-y-4">
                    {caseData.strategy.procedural.discoveryQuestions.map((q, i) => (
                      <li key={i} className="flex gap-3 text-sm text-slate-300 bg-slate-950 p-3 border border-slate-800 rounded-sm transition-colors duration-300">
                         <span className="text-amber-600 font-serif font-bold text-xs pt-0.5">Q{i+1}.</span>
                         <span className="font-serif italic text-xs leading-relaxed transition-colors duration-300">{q}</span>
                      </li>
                    ))}
                  </ul>
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
