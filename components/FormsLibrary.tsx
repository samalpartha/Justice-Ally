
import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { UploadedFile } from '../types';
import FileUploader from './FileUploader';

const STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia",
  "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland",
  "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey",
  "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina",
  "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
];

interface FormsLibraryProps {
  files?: UploadedFile[];
  onFilesAdded?: (files: File[]) => void;
}

const FormsLibrary: React.FC<FormsLibraryProps> = ({ files = [], onFilesAdded }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'official' | 'repo'>('official');
  const [selectedState, setSelectedState] = useState("California");
  const [searchQuery, setSearchQuery] = useState('');

  const getSearchUrl = (state: string, query: string) => {
    return `https://www.google.com/search?q=${encodeURIComponent(`official ${state} court forms ${query} pdf`)}`;
  };

  const getStateCourtUrl = (state: string) => {
    const urls: Record<string, string> = {
      "California": "https://www.courts.ca.gov/forms.htm",
      "New York": "https://www.nycourts.gov/forms/",
      "Texas": "https://www.txcourts.gov/forms/",
      "Florida": "https://www.flcourts.org/Resources-Services/Court-Improvement/Family-Courts/Family-Law-Self-Help-Information/Family-Law-Forms",
      "Illinois": "https://www.illinoiscourts.gov/forms/approved-forms/",
    };
    return urls[state] || getSearchUrl(state, "court forms self help");
  };

  const CATEGORIES = [
    { 
      id: 'family', 
      label: t('forms', 'categoryFamily'), 
      queries: [
        { name: "Divorce Petition / Dissolution", q: "divorce petition dissolution form" },
        { name: "Child Custody & Visitation", q: "child custody visitation order form" },
        { name: "Financial Affidavit (Family Law)", q: "financial affidavit family law form" }
      ]
    },
    { 
      id: 'housing', 
      label: t('forms', 'categoryHousing'), 
      queries: [
        { name: "Eviction Answer / Response", q: "unlawful detainer eviction answer form" },
        { name: "Lease Termination Notice", q: "lease termination notice form" },
        { name: "Repair Request (Habitability)", q: "tenant repair request demand letter" }
      ]
    },
    { 
      id: 'defense', 
      label: t('forms', 'categoryDefense'), 
      queries: [
        { name: "DUI Plea Form / Waiver", q: "dui plea form waiver of rights" },
        { name: "Traffic School Request", q: "traffic school request form" },
        { name: "Motion to Suppress (Criminal)", q: "motion to suppress evidence template" }
      ]
    },
    { 
      id: 'civil', 
      label: t('forms', 'categoryCivil'), 
      queries: [
        { name: "Civil Complaint (Breach of Contract)", q: "civil complaint breach of contract form" },
        { name: "Answer to Complaint", q: "answer to civil complaint form" },
        { name: "Fee Waiver Application", q: "application waiver of court fees" }
      ]
    },
  ];

  // Filtering Logic
  const filteredCategories = CATEGORIES.map(cat => ({
    ...cat,
    queries: cat.queries.filter(q => 
      q.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      q.q.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat => cat.queries.length > 0);

  const filteredFiles = files.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAutoFill = () => {
      alert("Auto-fill simulated: Extracted case data applied to form template.");
  };

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-8 bg-slate-950">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="text-center space-y-4 border-b-2 border-slate-800 pb-8 relative">
          <h1 className="text-4xl font-serif font-black text-slate-100 tracking-tight">{t('forms', 'title')}</h1>
          <p className="text-amber-600 uppercase tracking-[0.2em] font-bold text-xs">
            {t('forms', 'subtitle')}
          </p>
          
          {/* Progress Indicator */}
          <div className="absolute right-0 top-0 hidden md:block w-48">
             <div className="flex justify-between text-[9px] uppercase font-bold text-slate-500 mb-1">
                <span>{t('forms', 'progress')}</span>
                <span>40%</span>
             </div>
             <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-amber-600 w-[40%] rounded-full"></div>
             </div>
             
             {/* Deadline Calculator Widget */}
             <div className="bg-slate-900 border border-slate-800 p-2 rounded-sm flex items-center gap-2">
                <div className="p-1 bg-red-900/20 rounded text-red-500">
                   <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                   <div className="text-[9px] text-slate-400 font-bold uppercase">Response Deadline</div>
                   <div className="text-[10px] text-slate-200 font-mono">Typically <span className="text-red-500">within 14 days</span></div>
                </div>
             </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto">
           <input 
             type="text" 
             placeholder={t('forms', 'searchPlaceholder')} 
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className="w-full bg-slate-900 border border-slate-700 rounded-full py-3 px-6 pl-12 text-sm text-slate-200 focus:border-amber-600 outline-none shadow-lg placeholder:text-slate-600 font-serif"
           />
           <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
           </div>
        </div>

        {/* Tab Nav */}
        <div className="flex border-b border-slate-800">
           <button 
             onClick={() => setActiveTab('official')}
             className={`flex-1 py-4 text-xs font-bold uppercase tracking-[0.2em] transition-all border-b-4 ${activeTab === 'official' ? 'border-amber-600 text-amber-500 bg-slate-900' : 'border-transparent text-slate-500 hover:text-white hover:bg-slate-900'}`}
           >
             {t('forms', 'official')}
           </button>
           <button 
             onClick={() => setActiveTab('repo')}
             className={`flex-1 py-4 text-xs font-bold uppercase tracking-[0.2em] transition-all border-b-4 ${activeTab === 'repo' ? 'border-blue-500 text-blue-500 bg-slate-900' : 'border-transparent text-slate-500 hover:text-white hover:bg-slate-900'}`}
           >
             {t('forms', 'myRepo')}
           </button>
        </div>

        {/* OFFICIAL FORMS VIEW */}
        {activeTab === 'official' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-300">
            {/* State Selector */}
            <div className="bg-slate-900 border border-slate-800 rounded-sm p-8 shadow-lg">
               <div className="flex justify-between items-center mb-3">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('forms', 'selector')}</label>
                  <button 
                    onClick={handleAutoFill}
                    className="text-[10px] font-bold uppercase text-amber-500 hover:text-white flex items-center gap-1 transition-colors border border-amber-900/30 px-3 py-1.5 rounded-sm bg-amber-950/10 hover:bg-amber-950/30"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    {t('forms', 'autoFill')}
                  </button>
               </div>
               <div className="flex gap-4">
                 <div className="relative flex-1">
                   <select 
                     value={selectedState} 
                     onChange={(e) => setSelectedState(e.target.value)}
                     className="w-full bg-slate-950 border-b-2 border-slate-700 text-white rounded-none p-3 focus:border-amber-600 outline-none appearance-none font-serif text-sm hover:bg-slate-800 cursor-pointer"
                   >
                     {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                   </select>
                   <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                   </div>
                 </div>
                 <a 
                   href={getStateCourtUrl(selectedState)} 
                   target="_blank" 
                   rel="noreferrer"
                   className="px-6 py-3 bg-amber-700 hover:bg-amber-600 text-white font-bold rounded-sm flex items-center gap-2 transition-colors whitespace-nowrap uppercase text-xs tracking-wider shadow"
                 >
                   <span>{t('forms', 'portal')}</span>
                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                 </a>
               </div>
            </div>

            {/* Categorized Forms Grid */}
            {filteredCategories.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-8">
                {filteredCategories.map((cat, idx) => (
                    <div key={idx} className="bg-slate-900 border border-slate-800 rounded-sm shadow-md overflow-hidden group hover:border-slate-700 transition-colors">
                        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800">
                        <h3 className="font-serif font-bold text-slate-200 text-sm flex items-center gap-2">
                            <span className="text-amber-600">§</span> {cat.label}
                        </h3>
                        </div>
                        <div className="divide-y divide-slate-800">
                        {cat.queries.map((q, i) => (
                            <a key={i} href={getSearchUrl(selectedState, q.q)} target="_blank" rel="noreferrer" className="block px-6 py-4 hover:bg-slate-800 transition-colors flex justify-between items-center group/item">
                                <span className="text-xs text-slate-400 font-medium group-hover/item:text-slate-200">{q.name}</span>
                                <svg className="w-3 h-3 text-slate-600 group-hover/item:text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                            </a>
                        ))}
                        </div>
                    </div>
                ))}
                </div>
            ) : (
                <div className="text-center py-10">
                    <p className="text-slate-500 text-sm font-serif mb-4">No specific forms found matching "{searchQuery}".</p>
                    <a 
                        href={getSearchUrl(selectedState, searchQuery)} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-amber-500 font-bold uppercase text-xs hover:text-amber-400 tracking-wider border-b border-amber-500/50 pb-1"
                    >
                        {t('forms', 'performGlobal')}
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </a>
                </div>
            )}

            {/* Federal Block - Only show if no search or matches generic keywords */}
            {(!searchQuery || "federal immigration bankruptcy".includes(searchQuery.toLowerCase())) && (
                <div className="bg-slate-900 rounded-sm border border-slate-800 shadow-xl overflow-hidden">
                <div className="bg-slate-950 px-6 py-4 border-b border-slate-800">
                    <h3 className="font-serif font-bold text-slate-200 flex items-center gap-3">
                        <span className="text-blue-500">§</span> {t('forms', 'federal')}
                    </h3>
                </div>
                <div className="divide-y divide-slate-800">
                    <a href="https://www.uscis.gov/forms/all-forms" target="_blank" rel="noreferrer" className="block p-5 hover:bg-slate-800 transition-colors group">
                        <div className="font-bold text-slate-300 text-sm group-hover:text-white mb-1">USCIS Forms (Immigration)</div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">I-130 • I-485 • N-400 • I-765</div>
                    </a>
                    <a href="https://www.uscourts.gov/forms-fees/forms" target="_blank" rel="noreferrer" className="block p-5 hover:bg-slate-800 transition-colors group">
                        <div className="font-bold text-slate-300 text-sm group-hover:text-white mb-1">Federal Court Forms</div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Civil Pro Se • Bankruptcy</div>
                    </a>
                </div>
                </div>
            )}
          </div>
        )}

        {/* REPOSITORY VIEW */}
        {activeTab === 'repo' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-300">
             
             {/* Upload Section */}
             <div className="bg-slate-900 border border-slate-800 p-8 rounded-sm shadow-lg">
                <div className="flex items-center gap-2 mb-6">
                   <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                   <h3 className="text-sm font-bold uppercase text-slate-300 tracking-widest">{t('forms', 'uploadLabel')}</h3>
                </div>
                {onFilesAdded && <FileUploader onFilesSelected={onFilesAdded} />}
             </div>

             {/* File List */}
             <div className="bg-slate-900 border border-slate-800 rounded-sm shadow-lg overflow-hidden">
                <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                   <h3 className="text-sm font-bold uppercase text-slate-300 tracking-widest">{t('forms', 'myForms')}</h3>
                   <span className="text-[10px] bg-slate-900 border border-slate-700 px-2 py-1 text-slate-500 rounded font-mono">{filteredFiles.length} ITEMS</span>
                </div>
                
                {filteredFiles.length === 0 ? (
                   <div className="p-12 text-center">
                      <div className="w-16 h-16 border-2 border-dashed border-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                         <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      </div>
                      <p className="text-slate-500 text-xs uppercase tracking-widest font-bold">
                          {files.length > 0 ? `No files match "${searchQuery}"` : t('forms', 'repoEmpty')}
                      </p>
                   </div>
                ) : (
                   <div className="divide-y divide-slate-800">
                      {filteredFiles.map((file) => (
                        <div key={file.id} className="p-4 hover:bg-slate-800 transition-colors flex items-center justify-between group">
                           <div className="flex items-center gap-4 overflow-hidden">
                              <div className="p-2 bg-slate-950 border border-slate-700 rounded-sm text-slate-400">
                                 {file.type === 'link' 
                                   ? <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" /></svg>
                                   : <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                 }
                              </div>
                              <div className="min-w-0">
                                 <div className="text-sm font-bold text-slate-300 truncate font-serif">{file.name}</div>
                                 <div className="text-[10px] text-slate-500 uppercase tracking-wider">{file.type}</div>
                              </div>
                           </div>
                           <span className="text-[10px] text-slate-600 font-mono hidden sm:block">ID: {file.id}</span>
                        </div>
                      ))}
                   </div>
                )}
             </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default FormsLibrary;
