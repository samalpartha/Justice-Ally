
import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';

const STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia",
  "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland",
  "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey",
  "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina",
  "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
];

const TrafficDefense: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'dui' | 'ticket' | 'accident'>('dui');
  const [selectedState, setSelectedState] = useState("California");
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [selectedStep, setSelectedStep] = useState<number | null>(null);

  useEffect(() => {
    setCheckedItems({});
    setSelectedStep(null);
  }, [activeTab]);

  const toggleCheck = (itemKey: string) => {
    setCheckedItems(prev => ({ ...prev, [itemKey]: !prev[itemKey] }));
  };

  const getSearchUrl = (query: string) => {
    return `https://www.google.com/search?q=${encodeURIComponent(`official ${selectedState} ${query} pdf`)}`;
  };

  const getThemeColors = (isActive: boolean) => {
    if (activeTab === 'dui') {
      return isActive ? 'border-red-600 text-red-500 bg-red-950/20' : 'border-slate-800 text-slate-500 hover:text-red-400';
    }
    if (activeTab === 'ticket') {
      return isActive ? 'border-amber-500 text-amber-500 bg-amber-950/20' : 'border-slate-800 text-slate-500 hover:text-amber-400';
    }
    return isActive ? 'border-blue-500 text-blue-500 bg-blue-950/20' : 'border-slate-800 text-slate-500 hover:text-blue-400';
  };

  const currentData = useMemo(() => {
    if (activeTab === 'dui') {
        return {
            icon: (
              <svg className="w-40 h-40 text-red-500/10" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
            ),
            desc: t('traffic', 'duiDesc'),
            precedent: t('traffic', 'duiPrecedent'),
            checklist: [
                { key: 'checkDui1', text: t('traffic', 'checkDui1') },
                { key: 'checkDui2', text: t('traffic', 'checkDui2') },
                { key: 'checkDui3', text: t('traffic', 'checkDui3') },
                { key: 'checkDui4', text: t('traffic', 'checkDui4') },
                { key: 'checkDui5', text: t('traffic', 'checkDui5') }
            ],
            flow: [
                { title: t('traffic', 'flowDui1Title'), desc: t('traffic', 'flowDui1Desc'), detail: t('traffic', 'flowDui1Detail') },
                { title: t('traffic', 'flowDui2Title'), desc: t('traffic', 'flowDui2Desc'), detail: t('traffic', 'flowDui2Detail') },
                { title: t('traffic', 'flowDui3Title'), desc: t('traffic', 'flowDui3Desc'), detail: t('traffic', 'flowDui3Detail') },
                { title: t('traffic', 'flowDui4Title'), desc: t('traffic', 'flowDui4Desc'), detail: t('traffic', 'flowDui4Detail') }
            ],
            forms: [
                { name: t('traffic', 'formDui1'), query: "dmv administrative hearing request form" },
                { name: t('traffic', 'formDui2'), query: "motion to suppress evidence dui template" },
                { name: t('traffic', 'formDui3'), query: "criminal discovery request form" }
            ],
            showAdmin: true
        };
    } else if (activeTab === 'ticket') {
        return {
            icon: (
              <svg className="w-40 h-40 text-amber-500/10" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 16h-2v-2h2v2zm0-4h-2V7h2v5zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
              </svg>
            ),
            desc: t('traffic', 'ticketDesc'),
            precedent: t('traffic', 'ticketPrecedent'),
            checklist: [
                { key: 'checkTick1', text: t('traffic', 'checkTick1') },
                { key: 'checkTick2', text: t('traffic', 'checkTick2') },
                { key: 'checkTick3', text: t('traffic', 'checkTick3') },
                { key: 'checkTick4', text: t('traffic', 'checkTick4') }
            ],
            flow: [
                { title: t('traffic', 'flowTick1Title'), desc: t('traffic', 'flowTick1Desc'), detail: t('traffic', 'flowTick1Detail') },
                { title: t('traffic', 'flowTick2Title'), desc: t('traffic', 'flowTick2Desc'), detail: t('traffic', 'flowTick2Detail') },
                { title: t('traffic', 'flowTick3Title'), desc: t('traffic', 'flowTick3Desc'), detail: t('traffic', 'flowTick3Detail') },
                { title: t('traffic', 'flowTick4Title'), desc: t('traffic', 'flowTick4Desc'), detail: t('traffic', 'flowTick4Detail') }
            ],
            forms: [
                { name: t('traffic', 'formTick1'), query: "trial by written declaration form traffic" },
                { name: t('traffic', 'formTick2'), query: "request for arraignment extension traffic court" }
            ],
            showAdmin: false
        };
    } else {
        return {
            icon: (
              <svg className="w-40 h-40 text-blue-500/10" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
              </svg>
            ),
            desc: t('traffic', 'accDesc'),
            precedent: t('traffic', 'accPrecedent'),
            checklist: [
                { key: 'checkAcc1', text: t('traffic', 'checkAcc1') },
                { key: 'checkAcc2', text: t('traffic', 'checkAcc2') },
                { key: 'checkAcc3', text: t('traffic', 'checkAcc3') },
                { key: 'checkAcc4', text: t('traffic', 'checkAcc4') },
                { key: 'checkAcc5', text: t('traffic', 'checkAcc5') }
            ],
            flow: [
                { title: t('traffic', 'flowAcc1Title'), desc: t('traffic', 'flowAcc1Desc'), detail: t('traffic', 'flowAcc1Detail') },
                { title: t('traffic', 'flowAcc2Title'), desc: t('traffic', 'flowAcc2Desc'), detail: t('traffic', 'flowAcc2Detail') },
                { title: t('traffic', 'flowAcc3Title'), desc: t('traffic', 'flowAcc3Desc'), detail: t('traffic', 'flowAcc3Detail') },
                { title: t('traffic', 'flowAcc4Title'), desc: t('traffic', 'flowAcc4Desc'), detail: t('traffic', 'flowAcc4Detail') }
            ],
            forms: [
                { name: t('traffic', 'formAcc1'), query: "dmv accident report form sr-1" },
                { name: t('traffic', 'formAcc2'), query: "demand letter template personal injury" },
                { name: t('traffic', 'formAcc3'), query: "property damage release form" }
            ],
            showAdmin: false
        };
    }
  }, [activeTab, t]);

  const TabButton = ({ id, label }: { id: typeof activeTab, label: string }) => {
    const isActive = activeTab === id;
    let activeClass = "";
    if (id === 'dui') activeClass = isActive ? "border-red-600 text-red-500 bg-slate-900" : "hover:text-red-500";
    if (id === 'ticket') activeClass = isActive ? "border-amber-500 text-amber-500 bg-slate-900" : "hover:text-amber-500";
    if (id === 'accident') activeClass = isActive ? "border-blue-500 text-blue-500 bg-slate-900" : "hover:text-blue-500";

    return (
      <button
        onClick={() => setActiveTab(id)}
        className={`flex-1 py-5 text-xs font-bold uppercase tracking-[0.2em] transition-all border-b-4 ${
          isActive
            ? activeClass
            : 'border-transparent text-slate-600 bg-slate-950 hover:bg-slate-900'
        }`}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-8 bg-slate-950 transition-colors duration-500">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex justify-between items-end border-b-2 border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-serif font-black text-slate-100 mb-2 flex items-center gap-3 tracking-tight">
              {t('traffic', 'header')}
            </h1>
            <p className="text-slate-500 text-xs uppercase tracking-[0.2em] font-bold">
              {t('traffic', 'subHeader')}
            </p>
          </div>
          
          <div className="hidden md:block">
             <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 text-right">{t('triage', 'jurisdiction')}</label>
             <div className="relative">
               <select 
                 value={selectedState} 
                 onChange={(e) => setSelectedState(e.target.value)}
                 className="bg-slate-900 border border-slate-700 text-slate-200 text-xs py-2 pl-3 pr-8 rounded-sm outline-none appearance-none font-serif cursor-pointer shadow-sm hover:border-slate-500 focus:border-white transition-colors"
               >
                 {STATES.map(s => <option key={s} value={s}>{s}</option>)}
               </select>
               <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
               </div>
             </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 mb-8">
          <TabButton id="dui" label={t('traffic', 'dui')} />
          <TabButton id="ticket" label={t('traffic', 'tickets')} />
          <TabButton id="accident" label={t('traffic', 'accident')} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Educational & Procedural (Cols 8) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Hero Card */}
            <div className={`bg-slate-900 border p-8 rounded-sm shadow-xl relative overflow-hidden transition-colors duration-300 ${getThemeColors(true).split(' ')[0]}`}>
               <div className="absolute top-0 right-0 p-6 opacity-100 pointer-events-none">
                  {currentData.icon}
               </div>

               <div className="relative z-10">
                 <div className="flex items-center gap-3 mb-6 border-b border-slate-800/50 pb-4">
                    <div className={`p-2 bg-slate-950 border rounded-sm ${getThemeColors(true)}`}>
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                    </div>
                    <h2 className="text-xl font-serif font-bold text-slate-100">{t('traffic', 'standard')}</h2>
                 </div>
                 
                 <p className="text-slate-300 font-serif leading-8 text-lg mb-8 max-w-2xl">
                   {currentData.desc}
                 </p>

                 <div className="bg-slate-950/40 border border-slate-800 rounded-sm p-5 max-w-2xl">
                    <h4 className="text-[10px] font-bold uppercase text-slate-500 tracking-widest mb-3">{t('traffic', 'precedentLabel')}</h4>
                    <div className="flex items-start gap-4">
                       <span className={`font-serif font-bold text-2xl ${activeTab === 'dui' ? 'text-red-500' : activeTab === 'ticket' ? 'text-amber-500' : 'text-blue-500'}`}>¶</span>
                       <p className="text-sm text-slate-300 font-serif italic leading-relaxed">
                         {currentData.precedent}
                       </p>
                    </div>
                 </div>
               </div>
            </div>

            {/* Procedural Flow */}
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-sm shadow-lg">
               <h3 className="text-[10px] font-bold uppercase text-slate-500 tracking-[0.2em] mb-8 border-b border-slate-800 pb-2">{t('traffic', 'proceduralFlow')}</h3>
               
               <div className="relative mb-6">
                 <div className="absolute top-4 left-0 right-0 h-0.5 bg-slate-800 hidden md:block"></div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                   {currentData.flow.map((step, idx) => {
                     const isSelected = selectedStep === idx;
                     return (
                       <div key={idx} className="relative group">
                          <button 
                            onClick={() => setSelectedStep(idx)}
                            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs relative z-10 mx-auto md:mx-0 mb-4 transition-all duration-300 ${
                              isSelected 
                                ? (activeTab === 'dui' ? 'bg-red-600 border-red-400 text-white scale-110' : 
                                   activeTab === 'ticket' ? 'bg-amber-600 border-amber-400 text-white scale-110' : 
                                   'bg-blue-600 border-blue-400 text-white scale-110')
                                : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500'
                          }`}>
                            {idx + 1}
                          </button>
                          
                          <button 
                             onClick={() => setSelectedStep(idx)}
                             className={`w-full text-left bg-slate-950 border p-4 rounded-sm transition-all h-full ${
                               isSelected 
                                 ? (activeTab === 'dui' ? 'border-red-500 ring-1 ring-red-500/50' : 
                                    activeTab === 'ticket' ? 'border-amber-500 ring-1 ring-amber-500/50' : 
                                    'border-blue-500 ring-1 ring-blue-500/50')
                                 : 'border-slate-800 hover:border-slate-600'
                             }`}
                          >
                             <h4 className={`font-serif font-bold text-sm mb-2 ${isSelected ? 'text-white' : 'text-slate-300'}`}>{step.title}</h4>
                             <p className="text-[10px] text-slate-500 leading-relaxed font-medium uppercase tracking-wide">{step.desc}</p>
                          </button>
                       </div>
                     );
                   })}
                 </div>
               </div>

               {selectedStep !== null && (
                 <div className="mt-8 bg-slate-950 border-t-2 border-slate-800 pt-6 animate-in fade-in slide-in-from-top-2 duration-300">
                   <div className="flex items-start gap-4">
                     <div className={`p-2 rounded-sm shrink-0 ${
                        activeTab === 'dui' ? 'bg-red-900/20 text-red-500' : 
                        activeTab === 'ticket' ? 'bg-amber-900/20 text-amber-500' : 
                        'bg-blue-900/20 text-blue-500'
                     }`}>
                       <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                     </div>
                     <div>
                       <h4 className="text-sm font-bold text-slate-200 uppercase tracking-widest mb-2">Stage {selectedStep + 1}: {currentData.flow[selectedStep].title}</h4>
                       <p className="text-slate-300 font-serif leading-7 text-sm">
                         {currentData.flow[selectedStep].detail}
                       </p>
                     </div>
                   </div>
                 </div>
               )}
            </div>
          </div>

          {/* RIGHT COLUMN: Action Items (Cols 4) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Admin Peril / DMV Card */}
            {currentData.showAdmin && (
                <div className="bg-slate-900 border border-slate-700 p-5 rounded-sm relative overflow-hidden group shadow-lg">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-red-500 to-orange-600"></div>
                    <h3 className="text-xs font-bold text-red-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        {t('traffic', 'adminTitle')}
                    </h3>
                    <p className="text-slate-400 text-xs leading-relaxed font-serif">
                        {t('traffic', 'adminDesc')}
                    </p>
                </div>
            )}

            {/* Resources Card */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-sm shadow-lg">
               <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
                  <div className={`p-1.5 border rounded-sm ${getThemeColors(true)}`}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <h2 className="text-sm font-serif font-bold text-slate-100">{t('traffic', 'formsAndTools')}</h2>
               </div>
               
               <div className="space-y-3">
                 <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1">{selectedState} Forms</p>
                 {currentData.forms.map((form, i) => (
                    <a key={i} href={getSearchUrl(form.query)} target="_blank" rel="noreferrer" className="block p-4 bg-slate-950 border border-slate-800 hover:border-slate-600 transition-colors group rounded-sm">
                      <span className="text-xs font-bold flex justify-between items-center text-slate-300 group-hover:text-white">
                        {form.name}
                        <svg className="w-3 h-3 text-slate-700 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                      </span>
                   </a>
                 ))}
               </div>
            </div>

            {/* Checklist */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-sm shadow-xl">
               <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
                 <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                    <h3 className="text-[10px] font-bold uppercase text-slate-300 tracking-widest">{t('traffic', 'checklist')}</h3>
                 </div>
                 {Object.keys(checkedItems).length > 0 && (
                   <button onClick={() => setCheckedItems({})} className="text-[9px] uppercase font-bold text-slate-600 hover:text-white transition-colors">{t('traffic', 'reset')}</button>
                 )}
               </div>
               
               <ul className="space-y-3">
                 {currentData.checklist.map((item, i) => (
                   <li key={i} className="flex items-start gap-3 group cursor-pointer" onClick={() => toggleCheck(item.key)}>
                      <div className={`w-4 h-4 shrink-0 rounded-sm border flex items-center justify-center transition-colors mt-0.5 ${
                        checkedItems[item.key] 
                          ? (activeTab === 'dui' ? 'bg-red-600 border-red-600' : activeTab === 'ticket' ? 'bg-amber-600 border-amber-600' : 'bg-blue-600 border-blue-600') 
                          : 'bg-slate-950 border-slate-700 group-hover:border-slate-500'
                      }`}>
                        {checkedItems[item.key] && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <span className={`text-xs font-serif leading-relaxed select-none ${checkedItems[item.key] ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
                        {item.text}
                      </span>
                   </li>
                 ))}
               </ul>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default TrafficDefense;
