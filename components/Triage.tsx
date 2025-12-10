
import React, { useState } from 'react';
import { CaseContext, TriageResult } from '../types';
import { assessCaseSuitability } from '../services/geminiService';
import DictationButton from './DictationButton';

interface TriageProps {
  onComplete: (context: CaseContext, result: TriageResult) => void;
}

const STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia",
  "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland",
  "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey",
  "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina",
  "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming",
  "Federal Immigration (USCIS)", "Federal District Court"
];

const CASE_TYPES = [
  "Family Law (Divorce/Custody)",
  "Civil Litigation (Small Claims < $10k)",
  "Civil Litigation (>$10k)",
  "Landlord/Tenant (Eviction)",
  "Criminal (Traffic/Misdemeanor)",
  "Criminal (Felony)",
  "Immigration (Visa/Greencard)",
  "Immigration (Deportation/Asylum)",
  "Medical Malpractice",
  "Business Dispute"
];

const Triage: React.FC<TriageProps> = ({ onComplete }) => {
  const [step, setStep] = useState<'input' | 'analyzing' | 'result'>('input');
  const [context, setContext] = useState<CaseContext>({
    jurisdiction: 'California',
    caseType: 'Family Law (Divorce/Custody)',
    budget: 'Low Income',
    description: ''
  });
  const [result, setResult] = useState<TriageResult | null>(null);

  const handleAssess = async () => {
    if (!context.description) return;
    setStep('analyzing');
    try {
      const assessment = await assessCaseSuitability(context);
      setResult(assessment);
      setStep('result');
    } catch (error) {
      console.error(error);
      alert("Error accessing assessment service.");
      setStep('input');
    }
  };

  if (step === 'input') {
    return (
      <div className="h-full flex items-center justify-center p-6 bg-slate-950 overflow-y-auto">
        <div className="max-w-3xl w-full bg-slate-950 border border-slate-700 rounded-sm p-12 shadow-2xl relative">
          {/* Header */}
          <div className="text-center mb-12 border-b-2 border-slate-800 pb-6">
            <h2 className="text-3xl font-serif font-black text-slate-100 mb-2 tracking-tight uppercase">Preliminary Case Intake</h2>
            <p className="text-amber-600 font-bold text-xs tracking-[0.2em] uppercase">Confidential Assessment Protocol</p>
          </div>

          <div className="space-y-10">
            <div className="grid grid-cols-2 gap-8">
              <div className="group">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                   Jurisdiction
                </label>
                <div className="relative">
                  <select 
                    value={context.jurisdiction}
                    onChange={e => setContext({...context, jurisdiction: e.target.value})}
                    className="w-full bg-slate-900 border-b-2 border-slate-700 text-slate-200 rounded-none p-3 focus:border-amber-600 outline-none appearance-none font-serif text-sm transition-colors cursor-pointer hover:bg-slate-800"
                  >
                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>
              <div className="group">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                  Matter Classification
                </label>
                <div className="relative">
                  <select 
                    value={context.caseType}
                    onChange={e => setContext({...context, caseType: e.target.value})}
                    className="w-full bg-slate-900 border-b-2 border-slate-700 text-slate-200 rounded-none p-3 focus:border-amber-600 outline-none appearance-none font-serif text-sm transition-colors cursor-pointer hover:bg-slate-800"
                  >
                    {CASE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                   <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="group">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                Litigation Budget Resources
              </label>
              <div className="relative">
                <select 
                  value={context.budget}
                  onChange={e => setContext({...context, budget: e.target.value})}
                  className="w-full bg-slate-900 border-b-2 border-slate-700 text-slate-200 rounded-none p-3 focus:border-amber-600 outline-none appearance-none font-serif text-sm transition-colors cursor-pointer hover:bg-slate-800"
                >
                  <option value="Low Income">Low Income (Indigent / Fee Waiver Required)</option>
                  <option value="Moderate">Moderate (Can bear standard filing fees)</option>
                  <option value="High">High (Retainer Capacity)</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>

            <div className="group">
              <div className="flex justify-between items-center mb-2">
                 <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                   Statement of Facts (Affidavit Draft)
                 </label>
                 <DictationButton 
                    onTranscript={(text) => setContext(prev => ({...prev, description: prev.description + (prev.description ? ' ' : '') + text}))} 
                    className="hover:bg-slate-800 bg-slate-950 border border-slate-800 text-amber-600"
                 />
              </div>
              <div className="relative">
                <textarea 
                  value={context.description}
                  onChange={e => setContext({...context, description: e.target.value})}
                  placeholder="Detailed description of legal issue, key dates, and relief sought..."
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-sm p-6 focus:border-amber-600 outline-none h-40 resize-none font-serif leading-7 shadow-inner placeholder:text-slate-600 placeholder:italic"
                  style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px)', backgroundSize: '100% 2rem', lineHeight: '2rem' }}
                />
              </div>
              <div className="flex items-center gap-2 mt-2 justify-end">
                <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-amber-700/80">Privileged & Confidential</span>
              </div>
            </div>

            <button 
              onClick={handleAssess}
              disabled={!context.description}
              className="w-full py-5 bg-amber-700 hover:bg-amber-600 text-white font-bold rounded-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg tracking-[0.2em] uppercase text-xs border border-amber-500 hover:border-amber-400"
            >
              Generate Strategic Roadmap
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'analyzing') {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 bg-slate-950">
         <div className="w-24 h-24 border-4 border-slate-800 border-t-amber-600 rounded-full animate-spin mb-8"></div>
         <h3 className="text-3xl font-serif font-bold text-slate-200 tracking-tight mb-2">Analyzing Precedents...</h3>
         <p className="text-amber-600 font-mono text-xs uppercase tracking-widest">Cross-referencing Statutes & Fee Schedules</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-8 bg-slate-950 custom-scrollbar">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Result */}
        <div className={`p-8 rounded-sm border-l-4 shadow-2xl bg-slate-900 ${
          result?.riskLevel === 'LOW' ? 'border-green-600' :
          result?.riskLevel === 'MEDIUM' ? 'border-amber-600' :
          'border-red-600'
        }`}>
          <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-6">
            <div>
               <h2 className="text-3xl font-serif font-black text-slate-100 mb-1">Risk Assessment Memorandum</h2>
               <p className="text-slate-500 text-[10px] uppercase tracking-[0.25em] font-bold">Privileged Work Product</p>
            </div>
            <div className={`px-4 py-2 border-2 text-sm font-bold uppercase tracking-widest ${
               result?.riskLevel === 'LOW' ? 'bg-green-950/30 text-green-500 border-green-700' :
               result?.riskLevel === 'MEDIUM' ? 'bg-amber-950/30 text-amber-500 border-amber-700' :
               'bg-red-950/30 text-red-500 border-red-700'
            }`}>
              {result?.riskLevel} RISK DETECTED
            </div>
          </div>
          
          <div className="prose prose-invert max-w-none">
            <p className="text-lg text-slate-300 mb-6 leading-relaxed font-serif">{result?.riskAnalysis}</p>
          </div>
          
          <div className="bg-slate-950 p-6 border-l-2 border-slate-700 mt-6">
            <span className="text-[10px] font-bold uppercase text-amber-600 block mb-3 tracking-widest">Strategic Counsel</span>
            <p className="text-slate-200 italic font-serif text-lg leading-relaxed">"{result?.advice}"</p>
          </div>
        </div>

        {/* Wallet Reality Check */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-slate-900 p-8 rounded-sm border border-slate-800 shadow-lg">
             <h3 className="text-lg font-serif font-bold text-slate-100 mb-6 flex items-center gap-3 border-b border-slate-800 pb-4">
               <span className="text-amber-600">§</span> Financial Projection
             </h3>
             <ul className="space-y-6">
               <li>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1">Estimated Filing Fees</span>
                 <span className="text-slate-200 font-mono text-xl border-b border-slate-700 pb-1 block w-max">{result?.estimatedCosts.filingFees}</span>
               </li>
               <li>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Ancillary Costs</span>
                 <div className="flex flex-wrap gap-2">
                   {result?.estimatedCosts.hiddenCosts.map((c, i) => (
                     <span key={i} className="text-[10px] bg-slate-950 border border-slate-800 px-2 py-1 text-slate-400 font-mono uppercase">{c}</span>
                   ))}
                 </div>
               </li>
               <li>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1">Market Rate (Private Counsel)</span>
                 <span className="text-slate-300 text-sm italic font-serif">{result?.estimatedCosts.attorneyComparison}</span>
               </li>
             </ul>
          </div>

          <div className="bg-slate-900 p-8 rounded-sm border border-slate-800 shadow-lg">
             <h3 className="text-lg font-serif font-bold text-slate-100 mb-6 flex items-center gap-3 border-b border-slate-800 pb-4">
               <span className="text-blue-600">§</span> Resource Routing
             </h3>
             <div className="space-y-4">
                <a href={result?.resources.legalAidUrl} target="_blank" rel="noreferrer" className="block p-5 bg-slate-950 hover:bg-slate-900 transition-colors border-l-2 border-amber-600 group">
                  <span className="text-[10px] text-amber-600 font-bold uppercase block tracking-widest mb-1">Pro Bono / Legal Aid</span>
                  <span className="text-slate-200 font-serif font-bold group-hover:text-white">{result?.resources.legalAidName}</span>
                </a>
                
                <a href={result?.resources.barAssociationUrl} target="_blank" rel="noreferrer" className="block p-5 bg-slate-950 hover:bg-slate-900 transition-colors border-l-2 border-blue-600 group">
                  <span className="text-[10px] text-blue-500 font-bold uppercase block tracking-widest mb-1">Bar Association</span>
                  <span className="text-slate-200 font-serif font-bold group-hover:text-white">Attorney Verification Database</span>
                </a>

                {result?.resources.immigrationUrl && (
                  <a href={result?.resources.immigrationUrl} target="_blank" rel="noreferrer" className="block p-5 bg-slate-950 hover:bg-slate-900 transition-colors border-l-2 border-green-600 group">
                    <span className="text-[10px] text-green-500 font-bold uppercase block tracking-widest mb-1">Federal Immigration</span>
                    <span className="text-slate-200 font-serif font-bold group-hover:text-white">EOIR Accreditation List</span>
                  </a>
                )}
             </div>
          </div>
        </div>

        <button 
          onClick={() => result && onComplete(context, result)}
          className="w-full py-5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold rounded-sm transition-colors border border-slate-600 flex items-center justify-center gap-4 uppercase tracking-[0.2em] text-xs shadow-lg group"
        >
          <span>Initialize Evidence Vault</span>
          <svg className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>

        {result?.riskLevel === 'HIGH' && (
           <div className="p-6 bg-red-950/20 border-2 border-red-900/50 text-center">
             <p className="text-red-500 text-xs font-bold uppercase tracking-[0.2em] mb-2">⚠️ Critical Statutory Disclaimer</p>
             <p className="text-red-300 text-sm font-serif max-w-2xl mx-auto">
               High complexity litigation detected. Proceeding Pro Se poses significant risk of default judgment or dismissal. Retaining qualified counsel is strongly advised.
             </p>
           </div>
        )}
      </div>
    </div>
  );
};

export default Triage;
