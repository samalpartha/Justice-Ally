
import React, { useState, useEffect } from 'react';
import { UploadedFile, CaseData, DocumentAnalysis, CaseContext } from '../types';
import FileUploader from './FileUploader';
import DictationButton from './DictationButton';
import { RedactionTool } from './RedactionTool';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useLanguage } from '../context/LanguageContext';

interface DashboardProps {
  files: UploadedFile[];
  onFilesAdded: (files: File[]) => void;
  onLinkAdded: (link: UploadedFile) => void;
  onFileUpdated?: (file: UploadedFile) => void;
  caseData: CaseData | null;
  analyzing: boolean;
  onAnalyze: (desc: string) => void;
  context?: CaseContext;
}

const Dashboard: React.FC<DashboardProps> = ({ files, onFilesAdded, onLinkAdded, onFileUpdated, caseData, analyzing, onAnalyze, context }) => {
  const { t } = useLanguage();
  const [caseDesc, setCaseDesc] = useState('');
  const [redactingFile, setRedactingFile] = useState<UploadedFile | null>(null);

  // Pre-fill description from context if available
  useEffect(() => {
    if (context?.description && !caseDesc) {
      setCaseDesc(context.description);
    }
  }, [context]);

  const relevanceData = caseData?.documents.map(doc => ({
    name: doc.fileName.length > 15 ? doc.fileName.substring(0, 12) + '...' : doc.fileName,
    score: doc.relevanceScore,
    fullDoc: doc
  })) || [];

  const handleRedactionSave = (newFile: File, base64: string) => {
    if (redactingFile && onFileUpdated) {
        const updated: UploadedFile = {
            ...redactingFile,
            file: newFile,
            base64: base64,
            name: "redacted_" + redactingFile.name
        };
        onFileUpdated(updated);
        setRedactingFile(null);
    }
  };

  const isImage = (file: UploadedFile) => {
     return file.type.startsWith('image/');
  };

  // Logic: Enable if NOT analyzing AND (Files exist OR Text has sufficient length)
  const hasContent = files.length > 0 || caseDesc.trim().length > 3;
  const isButtonEnabled = !analyzing && hasContent;

  return (
    <div className="h-full overflow-y-auto p-8 custom-scrollbar bg-slate-950">
      {redactingFile && (
        <RedactionTool 
          file={redactingFile} 
          onSave={handleRedactionSave} 
          onCancel={() => setRedactingFile(null)} 
        />
      )}
      
      <div className="max-w-[1400px] mx-auto space-y-12">
        
        {/* Header Section with Context */}
        <div className="flex justify-between items-end border-b-2 border-slate-800 pb-6">
          <div>
            <h2 className="text-3xl font-serif font-black text-slate-100 mb-2 flex items-center gap-3 tracking-tight">
              {t('dashboard', 'header')}
            </h2>
            <p className="text-amber-600 text-xs uppercase tracking-[0.2em] font-bold">{t('dashboard', 'subHeader')}</p>
          </div>
          {context && (
            <div className="text-right hidden sm:block">
              <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">{t('dashboard', 'matterRef')}</span>
              <div className="bg-slate-900 px-4 py-2 border-l-2 border-amber-600">
                <span className="text-slate-200 font-serif font-bold text-sm block">{context.caseType}</span>
                <span className="block text-xs text-slate-500 font-mono mt-0.5">{context.jurisdiction}</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-sm shadow-xl p-0 overflow-hidden">
            <div className="bg-slate-950 border-b border-slate-800 px-6 py-4 flex justify-between items-center">
               <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                 <span className="text-amber-600">§</span> {t('dashboard', 'ingest')}
               </h3>
               <span className="text-[10px] text-slate-500 font-mono">{files.length} {t('dashboard', 'itemsLogged')}</span>
            </div>
            
            <div className="p-6 space-y-8">
              <FileUploader onFilesSelected={onFilesAdded} onLinkAdded={onLinkAdded} />
              
              {files.length > 0 && (
                <div className="border border-slate-800 rounded-sm">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-950 border-b border-slate-800">
                        <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest w-16">{t('dashboard', 'id')}</th>
                        <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('dashboard', 'exhibitName')}</th>
                        <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest w-24">{t('dashboard', 'type')}</th>
                        <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest w-24 text-right">{t('dashboard', 'action')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {files.map((f, idx) => (
                        <tr key={f.id} className="hover:bg-slate-800/50 transition-colors group">
                          <td className="p-3 text-[10px] font-mono text-slate-600">{(idx + 1).toString().padStart(3, '0')}</td>
                          <td className="p-3">
                             <div className="flex items-center gap-3">
                                {f.type === 'link' ? (
                                  <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                                ) : isImage(f) ? (
                                  <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                ) : (
                                  <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                )}
                                <span className="text-sm text-slate-300 font-serif truncate max-w-[200px]">{f.name}</span>
                             </div>
                          </td>
                          <td className="p-3">
                             <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 border border-slate-700 px-1.5 py-0.5 rounded-sm">
                               {f.type.split('/')[1] || 'LINK'}
                             </span>
                          </td>
                          <td className="p-3 text-right">
                             {isImage(f) && (
                               <button 
                                 onClick={() => setRedactingFile(f)}
                                 className="text-[10px] font-bold uppercase tracking-wider text-amber-600 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                               >
                                 {t('dashboard', 'redact')}
                               </button>
                             )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="relative">
                 <div className="absolute top-2 right-2 text-[9px] text-slate-500 font-mono z-10">
                   {caseDesc.length} / 5000
                 </div>
                 <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                   {t('dashboard', 'factsLabel')}
                   <svg className="w-3 h-3 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                 </label>
                 <textarea
                  value={caseDesc}
                  onChange={(e) => setCaseDesc(e.target.value)}
                  placeholder="Detailed narrative of events..."
                  maxLength={5000}
                  className="w-full bg-slate-950 text-slate-200 border border-slate-800 rounded-sm p-4 text-sm focus:border-amber-600 focus:outline-none h-32 resize-none font-serif leading-8 shadow-inner tracking-wide"
                />
                <div className="absolute top-8 right-2">
                  <DictationButton 
                    onTranscript={(text) => setCaseDesc(prev => prev + (prev ? ' ' : '') + text)} 
                    className="bg-slate-900 hover:bg-slate-800 border border-slate-800 shadow-lg text-slate-400"
                  />
                </div>
              </div>

              <button
                onClick={() => onAnalyze(caseDesc)}
                disabled={!isButtonEnabled}
                title={isButtonEnabled ? "Run deep analysis on Vault contents." : "Please add evidence files or a case description."}
                className={`w-full py-4 rounded-sm font-bold text-xs tracking-[0.2em] uppercase transition-all flex items-center justify-center gap-2 ${
                  isButtonEnabled
                    ? 'bg-amber-700 hover:bg-amber-600 text-white shadow-lg border border-amber-500 cursor-pointer'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                {analyzing && <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                {analyzing ? t('dashboard', 'analyzingBtn') : t('dashboard', 'analyzeBtn')}
              </button>
            </div>
          </div>

          {/* Stats / Quick View */}
          <div className="bg-slate-900 rounded-sm border border-slate-800 shadow-xl flex flex-col p-0 overflow-hidden h-fit">
             <div className="bg-slate-950 border-b border-slate-800 px-6 py-4">
               <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                 <span className="text-amber-600">§</span> {t('dashboard', 'relevanceIndex')}
                 <svg className="w-3 h-3 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
               </h3>
             </div>
             <div className="p-6">
                {caseData ? (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={relevanceData} layout="vertical" margin={{ left: 0, right: 20 }}>
                         <XAxis type="number" domain={[0, 10]} hide />
                         <YAxis dataKey="name" type="category" width={80} tick={{fill: '#64748b', fontSize: 10, fontFamily: 'serif'}} />
                         <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontFamily: 'serif' }}
                            itemStyle={{ color: '#fbbf24' }}
                            cursor={{fill: '#1e293b'}}
                         />
                         <Bar dataKey="score" barSize={12}>
                            {relevanceData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.score > 7 ? '#d97706' : '#475569'} />
                            ))}
                         </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="py-20 flex flex-col items-center justify-center text-slate-600 space-y-4">
                    <div className="w-16 h-16 border-2 border-dashed border-slate-800 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                    </div>
                    <span className="text-xs uppercase tracking-widest font-bold">{t('dashboard', 'noData')}</span>
                  </div>
                )}
             </div>
          </div>
        </div>

        {/* Executive Summary */}
        {caseData && caseData.caseSummary && (
          <div className="bg-slate-900 border-t-4 border-amber-600 rounded-sm p-8 shadow-xl">
             <h3 className="text-xl font-serif font-black text-slate-100 mb-4 flex items-center gap-3">
               {t('dashboard', 'execBrief')}
               <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
             </h3>
             <div className="text-slate-300 leading-8 text-sm bg-slate-950 p-8 border-l-2 border-slate-700 font-serif">
               {caseData.caseSummary}
             </div>
          </div>
        )}

        {/* Document Grid */}
        {caseData && (
          <div>
            <div className="flex items-center gap-4 mb-8 border-b-2 border-slate-800 pb-2">
               <h3 className="text-2xl font-serif font-black text-slate-100">{t('dashboard', 'exhibitsAnalysis')}</h3>
               <span className="bg-slate-800 text-slate-400 text-[10px] font-bold px-2 py-1 uppercase tracking-wider">{caseData.documents.length} Exhibits</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {caseData.documents.map((doc: DocumentAnalysis, idx: number) => (
                <div key={idx} className="bg-slate-900 border border-slate-800 rounded-sm p-6 hover:border-slate-600 transition-colors group shadow-lg flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <span className="inline-block px-2 py-0.5 border border-slate-700 text-[10px] font-bold uppercase bg-slate-950 text-slate-400 tracking-widest">
                      Ex. {String.fromCharCode(65 + idx)}
                    </span>
                    <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest border ${
                      doc.relevanceScore > 7 ? 'border-amber-900/50 text-amber-600 bg-amber-950/20' : 'border-slate-800 text-slate-500 bg-slate-950'
                    }`}>
                      Rel: {doc.relevanceScore}/10
                    </span>
                  </div>
                  <h4 className="font-serif font-bold text-slate-100 mb-3 text-lg leading-tight">{doc.fileName}</h4>
                  <p className="text-slate-400 text-xs mb-6 line-clamp-3 leading-relaxed font-serif flex-1">{doc.summary}</p>
                  
                  {doc.redFlags.length > 0 && (
                    <div className="mt-auto bg-red-950/20 p-4 border-l-2 border-red-800">
                      <p className="text-[9px] text-red-500 font-bold uppercase mb-2 tracking-widest flex items-center gap-1">
                        {t('dashboard', 'risksDetected')}
                      </p>
                      <ul className="space-y-1">
                        {doc.redFlags.map((flag, i) => (
                           <li key={i} className="text-xs text-red-300/80 font-serif leading-snug">• {flag}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
