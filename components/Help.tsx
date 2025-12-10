
import React from 'react';

const Help: React.FC = () => {
  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-8 bg-slate-950">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-6 border-b-2 border-slate-800 pb-12">
          <div className="w-16 h-16 bg-slate-900 border-2 border-amber-700 flex items-center justify-center mx-auto shadow-2xl rounded-sm">
            <span className="font-serif font-black text-amber-600 text-3xl">J</span>
          </div>
          <div>
             <h1 className="text-4xl md:text-5xl font-serif font-black text-white tracking-tight mb-4">Operational Manual</h1>
             <p className="text-amber-600 font-bold uppercase tracking-[0.3em] text-xs">JusticeAlly System Protocols</p>
          </div>
        </div>

        {/* Workflow Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {[
            { id: "01", title: "Triage & Intake", desc: "Assess procedural risk and calculate financial exposure." },
            { id: "02", title: "Evidence Docket", desc: "Secure ingestion of PDFs, Images, and Video evidence." },
            { id: "03", title: "Strategy Room", desc: "Apply strategic doctrine and map facts to Black Letter Law." },
            { id: "04", title: "Tactical Counsel", desc: "Draft motions and research case law via AI co-counsel." }
          ].map((item) => (
            <div key={item.id} className="bg-slate-900 p-8 border border-slate-800 hover:border-amber-600/50 transition-all group shadow-lg rounded-sm">
              <div className="flex items-center gap-4 mb-6 border-b border-slate-800 pb-4">
                <div className="text-xl font-mono font-bold text-slate-600 group-hover:text-amber-600">{item.id}</div>
                <h3 className="text-xl font-serif font-bold text-slate-100">{item.title}</h3>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed font-serif">
                {item.desc}
              </p>
            </div>
          ))}

          {/* Live Strategy */}
          <div className="bg-slate-900 p-8 border border-slate-800 hover:border-amber-600/50 transition-all group col-span-full shadow-lg rounded-sm flex flex-col md:flex-row gap-8 items-center">
             <div className="flex-1">
                <div className="flex items-center gap-4 mb-6 border-b border-slate-800 pb-4">
                  <div className="text-xl font-mono font-bold text-slate-600 group-hover:text-amber-600">05</div>
                  <h3 className="text-xl font-serif font-bold text-slate-100">Live Strategy Session (Voice)</h3>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed font-serif mb-4">
                  Real-time consultation loop. Rehearse oral arguments and receive immediate strategic feedback from the AI core.
                </p>
             </div>
             <div className="shrink-0 bg-slate-950 p-6 border border-slate-800 w-full md:w-auto">
               <div className="text-[10px] font-bold uppercase text-amber-600 tracking-widest mb-2">Protocol</div>
               <div className="text-slate-300 font-serif text-sm">Low-Latency Audio Stream</div>
             </div>
          </div>
        </div>

        {/* Disclaimer Footer */}
        <div className="text-center pt-12 border-t border-slate-800">
           <div className="inline-block p-4 border border-slate-800 bg-slate-900/50 rounded-sm">
             <p className="text-slate-500 text-xs font-serif italic leading-relaxed">
               JusticeAlly is an automated educational tool. It does not provide legal advice. <br/>
               Verification of all outputs with a qualified attorney is mandatory.
             </p>
           </div>
        </div>

      </div>
    </div>
  );
};

export default Help;
