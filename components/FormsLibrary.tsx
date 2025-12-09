
import React, { useState } from 'react';

const STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia",
  "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland",
  "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey",
  "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina",
  "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
];

const COMMON_FORMS = [
  {
    title: "Fee Waiver (In Forma Pauperis)",
    desc: "Request to waive court filing fees due to financial hardship.",
    keywords: "Application for Waiver of Court Fees"
  },
  {
    title: "Answer / Response",
    desc: "The standard legal form to respond to a lawsuit or complaint.",
    keywords: "Answer to Complaint Civil"
  },
  {
    title: "Summons & Complaint",
    desc: "Forms used to start a lawsuit against another party.",
    keywords: "Civil Complaint Form"
  },
  {
    title: "Motion to Dismiss",
    desc: "Requesting the court to throw out a case based on legal defects.",
    keywords: "Motion to Dismiss Template"
  },
  {
    title: "Declaration / Affidavit",
    desc: "Sworn written statement of facts used as evidence.",
    keywords: "General Affidavit Form"
  }
];

const FormsLibrary: React.FC = () => {
  const [selectedState, setSelectedState] = useState("California");

  const getSearchUrl = (state: string, query: string) => {
    return `https://www.google.com/search?q=${encodeURIComponent(`official ${state} court forms ${query} pdf`)}`;
  };

  const getStateCourtUrl = (state: string) => {
    // A simplified map or heuristic for major states, fallback to search for others
    const urls: Record<string, string> = {
      "California": "https://www.courts.ca.gov/forms.htm",
      "New York": "https://www.nycourts.gov/forms/",
      "Texas": "https://www.txcourts.gov/forms/",
      "Florida": "https://www.flcourts.org/Resources-Services/Court-Improvement/Family-Courts/Family-Law-Self-Help-Information/Family-Law-Forms",
      "Illinois": "https://www.illinoiscourts.gov/forms/approved-forms/",
    };
    return urls[state] || getSearchUrl(state, "court forms self help");
  };

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-8 bg-slate-950">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto border border-slate-700">
            <svg className="w-6 h-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Forms Repository</h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            Access official court forms and generic templates. Always use the official form for your specific jurisdiction when available.
          </p>
        </div>

        {/* State Selector */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
           <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Select Your Jurisdiction</label>
           <div className="flex gap-4">
             <select 
               value={selectedState} 
               onChange={(e) => setSelectedState(e.target.value)}
               className="flex-1 bg-slate-950 border border-slate-700 text-white rounded p-3 focus:border-amber-500 outline-none"
             >
               {STATES.map(s => <option key={s} value={s}>{s}</option>)}
             </select>
             <a 
               href={getStateCourtUrl(selectedState)} 
               target="_blank" 
               rel="noreferrer"
               className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded flex items-center gap-2 transition-colors whitespace-nowrap"
             >
               <span>Visit {selectedState} Court Portal</span>
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
             </a>
           </div>
        </div>

        {/* Federal / Immigration */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
             <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
               <span className="text-blue-400">🇺🇸</span> Federal & Immigration
             </h3>
             <ul className="space-y-3">
               <li>
                 <a href="https://www.uscis.gov/forms/all-forms" target="_blank" rel="noreferrer" className="block p-3 bg-slate-950 rounded border border-slate-800 hover:border-blue-500 transition-colors group">
                   <div className="font-bold text-slate-200 group-hover:text-blue-400">USCIS Forms (Immigration)</div>
                   <div className="text-xs text-slate-500">I-130, I-485, N-400, I-765</div>
                 </a>
               </li>
               <li>
                 <a href="https://www.uscourts.gov/forms-fees/forms" target="_blank" rel="noreferrer" className="block p-3 bg-slate-950 rounded border border-slate-800 hover:border-blue-500 transition-colors group">
                   <div className="font-bold text-slate-200 group-hover:text-blue-400">Federal Court Forms</div>
                   <div className="text-xs text-slate-500">Civil Pro Se Forms, Bankruptcy</div>
                 </a>
               </li>
             </ul>
          </div>
          
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
             <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
               <span className="text-amber-500">⚖️</span> Generic Templates
             </h3>
             <p className="text-xs text-slate-400 mb-4">
               Use these queries to find the specific version for {selectedState}.
             </p>
             <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
               {COMMON_FORMS.map((form, idx) => (
                 <div key={idx} className="flex justify-between items-center p-2 rounded hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-colors">
                    <div>
                      <div className="text-sm font-semibold text-slate-300">{form.title}</div>
                      <div className="text-[10px] text-slate-500">{form.desc}</div>
                    </div>
                    <a 
                      href={getSearchUrl(selectedState, form.keywords)} 
                      target="_blank" 
                      rel="noreferrer"
                      className="p-2 text-slate-400 hover:text-amber-500"
                      title="Search for this form"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </a>
                 </div>
               ))}
             </div>
          </div>
        </div>

        <div className="bg-amber-900/10 border border-amber-900/30 p-6 rounded-xl">
           <h4 className="text-amber-500 font-bold uppercase text-xs mb-2">Pro-Se Tip</h4>
           <p className="text-sm text-slate-300">
             Courts are strict about formatting. Whenever possible, fill out the PDF provided by the court rather than drafting your own document from scratch. If you must draft from scratch (like a Motion), use "Pleading Paper" format (numbered lines).
           </p>
        </div>

      </div>
    </div>
  );
};

export default FormsLibrary;
