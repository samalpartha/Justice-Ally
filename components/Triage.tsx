
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
        <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Legal Triage</h2>
            <p className="text-slate-400">Let's determine the best path forward for your case.</p>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Jurisdiction</label>
                <select 
                  value={context.jurisdiction}
                  onChange={e => setContext({...context, jurisdiction: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded p-3 focus:border-amber-500 outline-none"
                >
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Case Type</label>
                <select 
                  value={context.caseType}
                  onChange={e => setContext({...context, caseType: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded p-3 focus:border-amber-500 outline-none"
                >
                  {CASE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Budget Reality</label>
              <select 
                value={context.budget}
                onChange={e => setContext({...context, budget: e.target.value})}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded p-3 focus:border-amber-500 outline-none"
              >
                <option value="Low Income">Low Income (Need Fee Waivers/Legal Aid)</option>
                <option value="Moderate">Moderate (Can afford filing fees, maybe limited help)</option>
                <option value="High">High (Can afford full retainer)</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                 <label className="block text-xs font-bold text-slate-500 uppercase">Brief Situation Description</label>
                 <DictationButton 
                    onTranscript={(text) => setContext(prev => ({...prev, description: prev.description + (prev.description ? ' ' : '') + text}))} 
                    className="hover:bg-slate-800"
                 />
              </div>
              <textarea 
                value={context.description}
                onChange={e => setContext({...context, description: e.target.value})}
                placeholder="Tell me your story. Be specific about dates, dollars, and what you want to achieve."
                className="w-full bg-slate-950 border border-slate-700 text-white rounded p-3 focus:border-amber-500 outline-none h-24 resize-none"
              />
              <div className="flex items-center gap-2 mt-2 text-slate-500 justify-end">
                <svg className="w-3 h-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="text-[10px] font-semibold tracking-wide uppercase text-emerald-500/80">Private & Secure Workspace</span>
              </div>
            </div>

            <button 
              onClick={handleAssess}
              disabled={!context.description}
              className="w-full py-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-900/20 tracking-wider transform hover:scale-[1.01]"
            >
              GENERATE STRATEGIC ROADMAP
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'analyzing') {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 bg-slate-950">
         <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-500 mb-4"></div>
         <h3 className="text-xl font-bold text-slate-200">Analyzing Case Precedents...</h3>
         <p className="text-slate-500 mt-2">Checking court fees, procedural risks, and attorney availability.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6 bg-slate-950 custom-scrollbar">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Result */}
        <div className={`p-8 rounded-2xl border ${
          result?.riskLevel === 'LOW' ? 'bg-green-900/10 border-green-500/30' :
          result?.riskLevel === 'MEDIUM' ? 'bg-amber-900/10 border-amber-500/30' :
          'bg-red-900/10 border-red-500/30'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div>
               <h2 className="text-2xl font-bold text-white">Pro Se Risk Assessment</h2>
               <p className="text-slate-400 text-sm">Based on your jurisdiction and case complexity.</p>
            </div>
            <div className={`px-6 py-2 rounded-full border font-bold text-xl ${
               result?.riskLevel === 'LOW' ? 'bg-green-900 text-green-400 border-green-700' :
               result?.riskLevel === 'MEDIUM' ? 'bg-amber-900 text-amber-400 border-amber-700' :
               'bg-red-900 text-red-400 border-red-700'
            }`}>
              {result?.riskLevel} RISK
            </div>
          </div>
          
          <p className="text-lg text-slate-200 mb-4 leading-relaxed">{result?.riskAnalysis}</p>
          <div className="bg-slate-950/50 p-4 rounded border border-slate-800/50">
            <span className="text-xs font-bold uppercase text-slate-500 block mb-1">Recommendation</span>
            <p className="text-slate-300 italic">"{result?.advice}"</p>
          </div>
        </div>

        {/* Wallet Reality Check */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
             <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
               <span className="text-xl">💰</span> Wallet Reality Check
             </h3>
             <ul className="space-y-4">
               <li>
                 <span className="text-xs text-slate-500 uppercase block">Estimated Filing Fees</span>
                 <span className="text-slate-200 font-mono">{result?.estimatedCosts.filingFees}</span>
               </li>
               <li>
                 <span className="text-xs text-slate-500 uppercase block">Hidden Costs</span>
                 <div className="flex flex-wrap gap-2 mt-1">
                   {result?.estimatedCosts.hiddenCosts.map((c, i) => (
                     <span key={i} className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-400">{c}</span>
                   ))}
                 </div>
               </li>
               <li>
                 <span className="text-xs text-slate-500 uppercase block">Attorney Cost Comparison</span>
                 <span className="text-slate-200 text-sm">{result?.estimatedCosts.attorneyComparison}</span>
               </li>
             </ul>
          </div>

          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
             <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
               <span className="text-xl">🏛️</span> Legal Resources
             </h3>
             <div className="space-y-4">
                <a href={result?.resources.legalAidUrl} target="_blank" rel="noreferrer" className="block p-3 rounded bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700">
                  <span className="text-xs text-amber-500 font-bold uppercase block">Legal Aid</span>
                  <span className="text-white text-sm font-semibold">{result?.resources.legalAidName}</span>
                  <span className="text-xs text-slate-500 truncate block mt-1">{result?.resources.legalAidUrl}</span>
                </a>
                
                <a href={result?.resources.barAssociationUrl} target="_blank" rel="noreferrer" className="block p-3 rounded bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700">
                  <span className="text-xs text-blue-400 font-bold uppercase block">Bar Association</span>
                  <span className="text-white text-sm font-semibold">Attorney Lookup & Verify</span>
                </a>

                {result?.resources.immigrationUrl && (
                  <a href={result?.resources.immigrationUrl} target="_blank" rel="noreferrer" className="block p-3 rounded bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700">
                    <span className="text-xs text-green-400 font-bold uppercase block">Immigration Help</span>
                    <span className="text-white text-sm font-semibold">EOIR Pro Bono List</span>
                  </a>
                )}
             </div>
          </div>
        </div>

        <button 
          onClick={() => result && onComplete(context, result)}
          className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition-colors border border-slate-700 flex items-center justify-center gap-2"
        >
          <span>Proceed to Workspace</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>

        {result?.riskLevel === 'HIGH' && (
           <div className="p-4 bg-red-900/20 border border-red-900/50 rounded text-center">
             <p className="text-red-400 text-xs font-bold uppercase">Critical Warning</p>
             <p className="text-red-200 text-sm mt-1">
               Your case is classified as High Risk. It is strongly recommended that you do NOT proceed Pro Se. Use the resources above to find counsel.
             </p>
           </div>
        )}
      </div>
    </div>
  );
};

export default Triage;
