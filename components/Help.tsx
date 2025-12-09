
import React from 'react';

const Help: React.FC = () => {
  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-8 bg-slate-950">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-amber-600 rounded-lg flex items-center justify-center mx-auto shadow-xl shadow-amber-900/20">
            <span className="font-serif font-bold text-white text-4xl">J</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">JusticeAlly Operational Manual</h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Your strategic guide to navigating the legal system. Move from panic to action with this tactical workflow.
          </p>
        </div>

        {/* Workflow Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Step 1: Triage */}
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 hover:border-amber-500/30 transition-colors group">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-amber-500 font-bold">1</div>
              <h3 className="text-xl font-bold text-slate-200">Triage & Intake</h3>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              Assess the battlefield. Calculates your "Pro Se Risk Score" and estimates real financial costs.
            </p>
          </div>

          {/* Step 2: Vault */}
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 hover:border-amber-500/30 transition-colors group">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-amber-500 font-bold">2</div>
              <h3 className="text-xl font-bold text-slate-200">Secure Evidence Vault</h3>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              Upload PDFs, Images, and **Videos (Bodycam/CCTV)**. The AI uses **Video Understanding** to analyze footage for key events.
            </p>
          </div>

          {/* Step 3: War Room */}
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 hover:border-amber-500/30 transition-colors group">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-amber-500 font-bold">3</div>
              <h3 className="text-xl font-bold text-slate-200">War Room Strategy</h3>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              The brain of the operation. Applies "Sun Tzu" principles and maps evidence to "Black Letter Law".
            </p>
          </div>

          {/* Step 4: Chat */}
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 hover:border-amber-500/30 transition-colors group">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-amber-500 font-bold">4</div>
              <h3 className="text-xl font-bold text-slate-200">Tactical Chat & Search</h3>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              Draft motions or ask questions. Toggle **Research Mode** to use Google Search for live case law. Use **Read Aloud** to hear responses.
            </p>
          </div>

          {/* Step 5: Live Strategy */}
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 hover:border-amber-500/30 transition-colors group col-span-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-amber-500 font-bold">5</div>
              <h3 className="text-xl font-bold text-slate-200">Live Strategy Session (Voice)</h3>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              Speak directly to JusticeAlly in real-time. Perfect for practicing oral arguments or quick consultations while hands-free.
            </p>
            <div className="text-xs font-mono text-slate-500 bg-slate-950 p-2 rounded">
              🎯 Goal: Real-time oral rehearsal and rapid-fire strategy.
            </div>
          </div>
        </div>

        {/* Disclaimer Footer */}
        <div className="text-center pt-8 border-t border-slate-800">
           <p className="text-slate-500 text-xs">
             JusticeAlly is an AI-powered educational tool. It does not provide legal advice. <br/>
             Always verify deadlines and forms with your local Court Clerk.
           </p>
        </div>

      </div>
    </div>
  );
};

export default Help;
