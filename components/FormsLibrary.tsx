
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
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4 border-b-2 border-slate-800 pb-8">
          <h1 className="text-4xl font-serif font-black text-slate-100 tracking-tight">Forms Repository</h1>
          <p className="text-amber-600 uppercase tracking-[0.2em] font-bold text-xs">
            Standardized Legal Instruments
          </p>
        </div>

        {/* State Selector */}
        <div className="bg-slate-900 border border-slate-800 rounded-sm p-8 shadow-lg">
           <label className="block text-[10px] font-bold text-slate-500 uppercase mb-3 tracking-widest">Jurisdiction Selector</label>
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
               <span>Access Court Portal</span>
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
             </a>
           </div>
        </div>

        {/* Content Grid */}
        <div className="grid md:grid-cols-2 gap-10">
          <div className="bg-slate-900 rounded-sm border border-slate-800 shadow-xl overflow-hidden">
             <div className="bg-slate-950 px-6 py-4 border-b border-slate-800">
                <h3 className="font-serif font-bold text-slate-200 flex items-center gap-3">
                  <span className="text-blue-500">§</span> Federal & Immigration
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
          
          <div className="bg-slate-900 rounded-sm border border-slate-800 shadow-xl overflow-hidden">
             <div className="bg-slate-950 px-6 py-4 border-b border-slate-800">
                <h3 className="font-serif font-bold text-slate-200 flex items-center gap-3">
                  <span className="text-amber-500">§</span> Generic Templates
                </h3>
             </div>
             <div className="divide-y divide-slate-800 max-h-80 overflow-y-auto custom-scrollbar">
               {COMMON_FORMS.map((form, idx) => (
                 <div key={idx} className="flex justify-between items-start p-5 hover:bg-slate-800 transition-colors group">
                    <div>
                      <div className="text-sm font-bold text-slate-300 group-hover:text-amber-500 transition-colors font-serif">{form.title}</div>
                      <div className="text-xs text-slate-500 mt-1 leading-relaxed">{form.desc}</div>
                    </div>
                    <a 
                      href={getSearchUrl(selectedState, form.keywords)} 
                      target="_blank" 
                      rel="noreferrer"
                      className="ml-4 p-2 text-slate-500 hover:text-white bg-slate-950 hover:bg-amber-600 rounded-sm transition-all border border-slate-700 hover:border-amber-600"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </a>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormsLibrary;
