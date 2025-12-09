
import React, { useState, useEffect } from 'react';
import { UploadedFile, CaseData, DocumentAnalysis, CaseContext } from '../types';
import FileUploader from './FileUploader';
import DictationButton from './DictationButton';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  files: UploadedFile[];
  onFilesAdded: (files: File[]) => void;
  onLinkAdded: (link: UploadedFile) => void;
  caseData: CaseData | null;
  analyzing: boolean;
  onAnalyze: (desc: string) => void;
  context?: CaseContext;
}

const Dashboard: React.FC<DashboardProps> = ({ files, onFilesAdded, onLinkAdded, caseData, analyzing, onAnalyze, context }) => {
  const [caseDesc, setCaseDesc] = useState('');

  // Pre-fill description from context if available
  useEffect(() => {
    if (context?.description && !caseDesc) {
      setCaseDesc(context.description);
    }
  }, [context, caseDesc]);

  const relevanceData = caseData?.documents.map(doc => ({
    name: doc.fileName.length > 15 ? doc.fileName.substring(0, 12) + '...' : doc.fileName,
    score: doc.relevanceScore,
    fullDoc: doc
  })) || [];

  return (
    <div className="h-full overflow-y-auto p-8 custom-scrollbar">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section with Context */}
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
              <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              SECURE EVIDENCE VAULT
            </h2>
            <p className="text-slate-400">Upload case files, videos (MP4), emails, and notices. All data is encrypted and analyzed for strategic leverage.</p>
          </div>
          {context && (
            <div className="text-right hidden sm:block">
              <span className="block text-xs text-slate-500 uppercase">Current Matter</span>
              <span className="text-amber-500 font-semibold text-sm">{context.caseType}</span>
              <span className="block text-xs text-slate-600">{context.jurisdiction}</span>
            </div>
          )}
        </div>

        {/* Input Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900 p-6 rounded-xl border border-slate-800">
            <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
              Document & Video Ingestion
            </h3>
            <div className="space-y-4">
              <FileUploader onFilesSelected={onFilesAdded} onLinkAdded={onLinkAdded} />
              
              {files.length > 0 && (
                <div className="bg-slate-950 rounded p-3 border border-slate-800 max-h-40 overflow-y-auto">
                  <ul className="space-y-2">
                    {files.map(f => (
                      <li key={f.id} className="text-sm text-slate-300 flex justify-between items-center group">
                        <div className="flex items-center gap-2 overflow-hidden">
                           {f.type === 'link' ? (
                             <svg className="w-4 h-4 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                           ) : f.type.startsWith('video') ? (
                             <svg className="w-4 h-4 text-purple-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                           ) : (
                             <svg className="w-4 h-4 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                           )}
                           <span className="truncate">{f.name}</span>
                        </div>
                        {f.type === 'link' ? (
                          <span className="text-xs bg-blue-900/30 text-blue-400 px-2 py-1 rounded uppercase">Link</span>
                        ) : (
                          <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-500 uppercase">{f.type.split('/')[1] || f.type}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="relative">
                 <textarea
                  value={caseDesc}
                  onChange={(e) => setCaseDesc(e.target.value)}
                  placeholder="Briefly describe your legal goal (e.g., 'I want full custody' or 'Defend against breach of contract')..."
                  className="w-full bg-slate-950 text-slate-200 border border-slate-700 rounded-lg p-3 text-sm focus:border-amber-500 focus:outline-none h-24 resize-none"
                />
                <div className="absolute top-2 right-2">
                  <DictationButton 
                    onTranscript={(text) => setCaseDesc(prev => prev + (prev ? ' ' : '') + text)} 
                    className="bg-slate-900 hover:bg-slate-800 border border-slate-700 shadow-lg"
                  />
                </div>
              </div>

              <button
                onClick={() => onAnalyze(caseDesc)}
                disabled={analyzing || files.length === 0 || !caseDesc}
                className={`w-full py-3 rounded-lg font-bold text-sm tracking-wide transition-all ${
                  analyzing 
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white shadow-lg shadow-amber-900/20'
                }`}
              >
                {analyzing ? 'ANALYZING EVIDENCE...' : 'ANALYZE CASE & STRATEGY'}
              </button>
            </div>
          </div>

          {/* Stats / Quick View */}
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 flex flex-col">
            <h3 className="text-lg font-semibold text-slate-200 mb-4">Evidence Relevance</h3>
            {caseData ? (
              <div className="flex-1 min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={relevanceData} layout="vertical" margin={{ left: 0, right: 20 }}>
                     <XAxis type="number" domain={[0, 10]} hide />
                     <YAxis dataKey="name" type="category" width={100} tick={{fill: '#94a3b8', fontSize: 10}} />
                     <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }}
                        itemStyle={{ color: '#fbbf24' }}
                        cursor={{fill: '#1e293b'}}
                     />
                     <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={20}>
                        {relevanceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.score > 7 ? '#d97706' : '#475569'} />
                        ))}
                     </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-600 text-sm italic">
                Awaiting analysis...
              </div>
            )}
          </div>
        </div>

        {/* Executive Summary */}
        {caseData && caseData.caseSummary && (
          <div className="bg-slate-900 border border-amber-900/30 rounded-xl p-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <svg className="w-24 h-24 text-amber-500" fill="currentColor" viewBox="0 0 24 24"><path d="M14 17H4v2h10v-2zm6-8H4v2h16V9zM4 15h16v-2H4v2zM4 5v2h16V5H4z"/></svg>
             </div>
             <h3 className="text-xl font-bold text-slate-200 mb-3 flex items-center gap-2">
               <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
               Executive Case Summary
             </h3>
             <div className="text-slate-300 leading-relaxed text-sm bg-slate-950/50 p-4 rounded border border-slate-800/50">
               {caseData.caseSummary}
             </div>
          </div>
        )}

        {/* Document Grid */}
        {caseData && (
          <div>
            <h3 className="text-xl font-bold text-slate-200 mb-4">Analyzed Documents</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {caseData.documents.map((doc: DocumentAnalysis, idx: number) => (
                <div key={idx} className="bg-slate-900 border border-slate-800 rounded-lg p-4 hover:border-slate-600 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-400">
                      {doc.docType}
                    </span>
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      doc.relevanceScore > 7 ? 'bg-amber-900/30 text-amber-500' : 'bg-slate-800 text-slate-500'
                    }`}>
                      Relevance: {doc.relevanceScore}/10
                    </span>
                  </div>
                  <h4 className="font-semibold text-slate-200 mb-2 truncate" title={doc.fileName}>{doc.fileName}</h4>
                  <p className="text-slate-400 text-xs mb-3 line-clamp-3">{doc.summary}</p>
                  
                  {doc.redFlags.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-800">
                      <p className="text-[10px] text-red-400 font-bold uppercase mb-1">Red Flags Detected:</p>
                      <ul className="list-disc list-inside text-[10px] text-red-300/80">
                        {doc.redFlags.map((flag, i) => <li key={i}>{flag}</li>)}
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
