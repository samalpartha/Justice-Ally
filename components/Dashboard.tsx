import React, { useState } from 'react';
import { UploadedFile, CaseData, DocumentAnalysis } from '../types';
import FileUploader from './FileUploader';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  files: UploadedFile[];
  onFilesAdded: (files: File[]) => void;
  caseData: CaseData | null;
  analyzing: boolean;
  onAnalyze: (desc: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ files, onFilesAdded, caseData, analyzing, onAnalyze }) => {
  const [caseDesc, setCaseDesc] = useState('');

  const relevanceData = caseData?.documents.map(doc => ({
    name: doc.fileName.length > 15 ? doc.fileName.substring(0, 12) + '...' : doc.fileName,
    score: doc.relevanceScore,
    fullDoc: doc
  })) || [];

  return (
    <div className="h-full overflow-y-auto p-8 custom-scrollbar">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">The Shoebox</h2>
          <p className="text-slate-400">Ingest evidence, categorize documents, and detect immediate procedural red flags.</p>
        </div>

        {/* Input Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900 p-6 rounded-xl border border-slate-800">
            <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
              Document Ingestion
            </h3>
            <div className="space-y-4">
              <FileUploader onFilesSelected={onFilesAdded} />
              
              {files.length > 0 && (
                <div className="bg-slate-950 rounded p-3 border border-slate-800 max-h-40 overflow-y-auto">
                  <ul className="space-y-2">
                    {files.map(f => (
                      <li key={f.id} className="text-sm text-slate-300 flex justify-between items-center">
                        <span className="truncate max-w-[80%]">{f.name}</span>
                        <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-500 uppercase">{f.type.split('/')[1]}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <textarea
                value={caseDesc}
                onChange={(e) => setCaseDesc(e.target.value)}
                placeholder="Briefly describe your legal goal (e.g., 'I want full custody' or 'Defend against breach of contract')..."
                className="w-full bg-slate-950 text-slate-200 border border-slate-700 rounded-lg p-3 text-sm focus:border-amber-500 focus:outline-none h-24 resize-none"
              />

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