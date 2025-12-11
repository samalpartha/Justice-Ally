
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import WarRoom from './components/WarRoom';
import Triage from './components/Triage';
import Help from './components/Help';
import LiveSession from './components/LiveSession';
import FormsLibrary from './components/FormsLibrary';
import JuvenileJustice from './components/JuvenileJustice';
import TrafficDefense from './components/TrafficDefense';
import Login from './components/Login';
import { AppMode, UploadedFile, CaseData, CaseContext, TriageResult, UserProfile, UserRole } from './types';
import { analyzeCaseFiles, fileToBase64, base64ToFile, mapApiError } from './services/geminiService';
import { useLanguage } from './context/LanguageContext';

const SAVE_KEY = 'justiceAlly_save_v1';
const USER_KEY = 'justiceAlly_user_v1';

const AppContent: React.FC = () => {
  const { t, language } = useLanguage();
  // User Session State
  const [user, setUser] = useState<UserProfile | null>(null);

  // App State
  const [currentMode, setMode] = useState<AppMode>(AppMode.TRIAGE);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [caseContext, setCaseContext] = useState<CaseContext | undefined>();
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  
  // Notification System
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const showNotify = (messageKey: string, type: 'success' | 'error') => {
      // Look up translation or use raw key if missing
      const msg = t('alerts', messageKey) || messageKey;
      setNotification({ message: msg, type });
      setTimeout(() => setNotification(null), 5000);
  };

  // Load User on Init
  useEffect(() => {
    const savedUser = localStorage.getItem(USER_KEY);
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (role: UserRole, name: string, email: string) => {
    const profile: UserProfile = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      role
    };
    setUser(profile);
    localStorage.setItem(USER_KEY, JSON.stringify(profile));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem(USER_KEY);
    // Optional: Clear case data on logout for privacy
    setFiles([]);
    setCaseData(null);
    setCaseContext(undefined);
  };

  const handleFilesAdded = (newFiles: File[]) => {
    const uploaded: UploadedFile[] = newFiles.map(f => ({
      id: Math.random().toString(36).substr(2, 9),
      file: f,
      name: f.name,
      type: f.type
    }));
    setFiles(prev => [...prev, ...uploaded]);
  };

  const handleLinkAdded = (link: UploadedFile) => {
    setFiles(prev => [...prev, link]);
  };

  const handleFileUpdated = (updatedFile: UploadedFile) => {
    setFiles(prev => prev.map(f => f.id === updatedFile.id ? updatedFile : f));
  };

  const handleAnalyze = async (description: string) => {
    setAnalyzing(true);
    try {
      const result = await analyzeCaseFiles(files, description, language, caseContext);
      setCaseData(result);
      setMode(AppMode.WAR_ROOM); // Auto switch to War Room on success
    } catch (error: any) {
      console.error("Analysis failed", error);
      const errorKey = mapApiError(error);
      
      // If custom error message from validation
      if (error?.message && error.message.startsWith("FILE_TOO_LARGE")) {
         showNotify(`${t('uploader', 'fileTooLarge')} (${error.message.split(': ')[1]})`, 'error');
      } else {
         showNotify(errorKey, 'error');
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const handleUpdateNotes = (notes: string) => {
    setCaseData(prev => prev ? { ...prev, notes } : { 
      caseSummary: '', 
      notes, 
      documents: [], 
      strategy: null, 
      analyzed: false 
    });
  };

  const handleLoadDemo = () => {
    setCaseContext({
      jurisdiction: 'New York',
      caseType: 'Landlord/Tenant',
      budget: 'Low Income',
      description: 'Eviction notice received for non-payment due to lack of repairs (heating).'
    });
    
    setCaseData({
      analyzed: true,
      caseSummary: "The tenant faces eviction for non-payment of rent but has a strong defense under the Warranty of Habitability due to documented lack of heating. The strategy focuses on withholding rent into an escrow account and filing a counterclaim for rent abatement.",
      notes: "Client mentioned Landlord called on June 12th threatening to 'throw things on the street'. Need to verify if witness was present.",
      documents: [
        { fileName: "Eviction_Notice_July.pdf", relevanceScore: 10, summary: "3-Day Notice to Quit demanding $2,400.", redFlags: ["Service was by mail only, not personal delivery"], docType: "Legal Notice", date: "2023-07-15" },
        { fileName: "Email_Thread_Heating.pdf", relevanceScore: 9, summary: "Thread showing 4 requests for heat repair between Jan-March.", redFlags: [], docType: "Evidence", date: "2023-02-10" }
      ],
      strategy: {
        sunTzu: {
          strategyName: "The Empty Fort",
          quote: "Appear weak when you are strong, and strong when you are weak.",
          application: "Do not aggressively fight the initial notice. Allow them to file. Once in court, present the 'Warranty of Habitability' evidence (heating emails) to blindside them with a counterclaim, forcing a settlement.",
          opponentProfile: "The Landlord appears disorganized and is cutting corners on procedure (service by mail). Likely to settle if faced with legal complexity."
        },
        blackLetter: {
          claimElements: [
            { element: "Landlord-Tenant Relationship", evidence: "Lease Agreement", status: "strong" },
            { element: "Non-Payment of Rent", evidence: "Admitted by Tenant", status: "weak" },
            { element: "Warranty of Habitability", evidence: "Email thread regarding broken heater", status: "strong" }
          ],
          affirmativeDefenses: ["Breach of Warranty of Habitability", "Improper Service of Process", "Retaliatory Eviction"]
        },
        procedural: {
          nextStep: "File 'Answer' with Counterclaims within 5 days of court service.",
          discoveryQuestions: [
            "Produce all maintenance records for the heating unit for the last 2 years.",
            "Did you obtain a certificate of occupancy for the basement unit?"
          ],
          deadlines: ["Answer due: Aug 20th", "Court Hearing: Sept 5th"]
        }
      }
    });
    showNotify('demoLoaded', 'success');
  };

  const handleTriageComplete = (ctx: CaseContext, result: TriageResult) => {
    setCaseContext(ctx);
    setTriageResult(result);
    setMode(AppMode.DASHBOARD);
  };

  const saveCase = async () => {
    try {
      // 1. Convert files to base64 for storage
      const serializedFiles = await Promise.all(files.map(async (f) => {
        if (f.type === 'link') return f; // Links are simple objects, return as is
        
        if (f.base64) return { ...f, file: null }; // Already have base64
        if (f.file) {
          const b64 = await fileToBase64(f.file);
          return {
            id: f.id,
            name: f.name,
            type: f.type,
            base64: b64,
            file: null 
          };
        }
        return f;
      }));

      const stateToSave = {
        timestamp: Date.now(),
        currentMode,
        caseContext,
        triageResult,
        caseData,
        files: serializedFiles
      };

      const json = JSON.stringify(stateToSave);
      
      try {
        localStorage.setItem(SAVE_KEY, json);
        showNotify('saveSuccess', 'success');
      } catch (quotaError) {
        // If quota exceeded, try saving without heavy file content (but keep links)
        console.warn("Quota exceeded, saving Lite version.");
        const liteFiles = serializedFiles.map(f => {
          if (f.type === 'link') return f;
          return { ...f, base64: undefined };
        });
        const liteState = { ...stateToSave, files: liteFiles };
        localStorage.setItem(SAVE_KEY, JSON.stringify(liteState));
        showNotify('saveLite', 'success');
      }
    } catch (err) {
      console.error("Save failed:", err);
      showNotify('saveFail', 'error');
    }
  };

  const loadCase = () => {
    try {
      const json = localStorage.getItem(SAVE_KEY);
      if (!json) {
        showNotify('noSavedCase', 'error');
        return;
      }
      const state = JSON.parse(json);

      // Restore Mode & Data
      if (state.currentMode) setMode(state.currentMode);
      if (state.caseContext) setCaseContext(state.caseContext);
      if (state.triageResult) setTriageResult(state.triageResult);
      if (state.caseData) setCaseData(state.caseData);

      // Restore Files
      if (state.files && Array.isArray(state.files)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const restoredFiles = state.files.map((f: any) => {
          if (f.type === 'link') return f; // Return links as is

          let fileObj: File;
          if (f.base64) {
             fileObj = base64ToFile(f.base64, f.name, f.type);
          } else {
             fileObj = new File([""], f.name, { type: f.type });
          }
          return {
            ...f,
            file: fileObj,
            base64: f.base64
          } as UploadedFile;
        });
        setFiles(restoredFiles);
      }
      
      showNotify('loadSuccess', 'success');
    } catch (err) {
      console.error("Load failed:", err);
      showNotify('loadFail', 'error');
    }
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Layout 
      currentMode={currentMode} 
      setMode={setMode}
      onSave={saveCase}
      onLoad={loadCase}
      user={user}
      onLogout={handleLogout}
    >
      {/* GLOBAL NOTIFICATION BANNER */}
      {notification && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-sm shadow-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${
            notification.type === 'success' ? 'bg-slate-900 border-green-600 text-green-400' : 'bg-slate-900 border-red-600 text-red-400'
        }`}>
            {notification.type === 'success' ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            )}
            <span className="font-bold text-sm tracking-wide uppercase">{notification.message}</span>
            <button onClick={() => setNotification(null)} className="ml-2 hover:text-white"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>
      )}

      {currentMode === AppMode.TRIAGE && (
        <Triage onComplete={handleTriageComplete} />
      )}
      {currentMode === AppMode.DASHBOARD && (
        <Dashboard 
          files={files} 
          onFilesAdded={handleFilesAdded}
          onLinkAdded={handleLinkAdded}
          onFileUpdated={handleFileUpdated}
          caseData={caseData}
          analyzing={analyzing}
          onAnalyze={handleAnalyze}
          context={caseContext}
        />
      )}
      {currentMode === AppMode.WAR_ROOM && (
        <WarRoom 
          caseData={caseData} 
          onFilesAdded={handleFilesAdded}
          onLinkAdded={handleLinkAdded}
          onNotesChange={handleUpdateNotes}
          onLoadDemo={handleLoadDemo}
        />
      )}
      {currentMode === AppMode.LIVE_STRATEGY && (
        <LiveSession />
      )}
      {currentMode === AppMode.FORMS && (
        <FormsLibrary files={files} onFilesAdded={handleFilesAdded} />
      )}
      {currentMode === AppMode.JUVENILE && (
        <JuvenileJustice />
      )}
      {currentMode === AppMode.TRAFFIC && (
        <TrafficDefense />
      )}
      {currentMode === AppMode.HELP && (
        <Help />
      )}
    </Layout>
  );
};

const App: React.FC = () => {
    return <AppContent />;
};

export default App;
