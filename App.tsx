
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
import AboutModal from './components/AboutModal';
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
  const [showAbout, setShowAbout] = useState(false);
  
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
    const uploaded = newFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      type: file.type,
      previewUrl: URL.createObjectURL(file)
    }));
    setFiles(prev => [...prev, ...uploaded]);
  };

  const handleLinkAdded = (link: UploadedFile) => {
    setFiles(prev => [...prev, link]);
  };

  const handleFileUpdated = (updatedFile: UploadedFile) => {
      setFiles(prev => prev.map(f => f.id === updatedFile.id ? updatedFile : f));
  };

  const handleFileDeleted = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    showNotify(t('common', 'delete') + " Successful", "success");
  };

  const handleAnalyze = async (desc: string) => {
    if (!files.length && !desc) return;
    setAnalyzing(true);
    
    // Update context description if changed
    if (caseContext && desc !== caseContext.description) {
        setCaseContext({ ...caseContext, description: desc });
    }

    try {
      const data = await analyzeCaseFiles(files, desc, language, caseContext);
      setCaseData(data);
      showNotify("Analysis Complete", "success");
      setMode(AppMode.WAR_ROOM); // Auto-navigate to strategy
    } catch (error: any) {
      console.error(error);
      const errorKey = mapApiError(error);
      showNotify(errorKey, "error");
    } finally {
      setAnalyzing(false);
    }
  };

  // --- SAVE / LOAD SYSTEM ---
  const handleSaveState = async () => {
    try {
        // Convert Files to Base64 for storage
        const serializableFiles = await Promise.all(files.map(async f => {
            if (f.type === 'link') return f;
            if (f.file) {
               try {
                   const b64 = await fileToBase64(f.file);
                   return { ...f, file: undefined, base64: b64, previewUrl: undefined };
               } catch (e) {
                   console.error("File skip", e);
                   return null; 
               }
            }
            return f;
        }));

        const state = {
            files: serializableFiles.filter(f => f !== null),
            caseData,
            caseContext,
            triageResult,
            timestamp: Date.now()
        };

        try {
            localStorage.setItem(SAVE_KEY, JSON.stringify(state));
            showNotify('saveSuccess', 'success');
        } catch (e) {
            // Quota exceeded fallback
            const liteState = {
                ...state,
                files: state.files.filter((f: any) => f.type === 'link') // Only save links
            };
            localStorage.setItem(SAVE_KEY, JSON.stringify(liteState));
            showNotify('saveLite', 'success');
        }
    } catch (e) {
        console.error(e);
        showNotify('saveFail', 'error');
    }
  };

  const handleLoadState = () => {
      const saved = localStorage.getItem(SAVE_KEY);
      if (!saved) {
          showNotify('noSavedCase', 'error');
          return;
      }
      try {
          const state = JSON.parse(saved);
          
          // Rehydrate Files
          const rehydratedFiles = state.files.map((f: any) => {
              if (f.base64) {
                  const fileObj = base64ToFile(f.base64, f.name, f.type);
                  return { ...f, file: fileObj, previewUrl: URL.createObjectURL(fileObj) };
              }
              return f;
          });

          setFiles(rehydratedFiles);
          setCaseData(state.caseData);
          setCaseContext(state.caseContext);
          setTriageResult(state.triageResult);
          showNotify('loadSuccess', 'success');
          setMode(AppMode.DASHBOARD);
      } catch (e) {
          console.error(e);
          showNotify('loadFail', 'error');
      }
  };

  const loadDemoData = () => {
      // Pre-fill with sample Landlord/Tenant data
      setCaseContext({
          jurisdiction: 'California',
          caseType: 'Landlord/Tenant',
          budget: 'Low',
          description: 'Eviction defense for non-payment due to habitability issues (broken heater).'
      });
      showNotify('demoLoaded', 'success');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Layout 
      currentMode={currentMode} 
      setMode={setMode} 
      onSave={handleSaveState} 
      onLoad={handleLoadState}
      user={user}
      onLogout={handleLogout}
      onShowAbout={() => setShowAbout(true)}
    >
      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
      
      {/* Toast Notification */}
      {notification && (
          <div className={`fixed top-4 right-4 z-[100] px-6 py-4 rounded-sm shadow-2xl border-l-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${notification.type === 'success' ? 'bg-slate-900 border-green-500 text-green-400' : 'bg-slate-900 border-red-500 text-red-400'}`}>
              {notification.type === 'success' ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              )}
              <span className="font-bold text-xs uppercase tracking-wide">{notification.message}</span>
          </div>
      )}

      {currentMode === AppMode.TRIAGE && (
        <Triage onComplete={(ctx, res) => {
            setCaseContext(ctx);
            setTriageResult(res);
            setMode(AppMode.DASHBOARD);
        }} />
      )}
      
      {currentMode === AppMode.DASHBOARD && (
        <Dashboard 
          files={files} 
          onFilesAdded={handleFilesAdded}
          onLinkAdded={handleLinkAdded}
          onFileUpdated={handleFileUpdated}
          onFileDeleted={handleFileDeleted}
          caseData={caseData}
          analyzing={analyzing}
          onAnalyze={handleAnalyze}
          context={caseContext}
          onLoadDemo={loadDemoData}
        />
      )}

      {currentMode === AppMode.WAR_ROOM && (
        <WarRoom 
           caseData={caseData} 
           onFilesAdded={handleFilesAdded}
           onLinkAdded={handleLinkAdded}
           onNotesChange={(notes) => setCaseData(prev => prev ? {...prev, notes} : null)}
           onLoadDemo={loadDemoData}
        />
      )}

      {currentMode === AppMode.LIVE_STRATEGY && <LiveSession />}
      {currentMode === AppMode.FORMS && <FormsLibrary files={files} onFilesAdded={handleFilesAdded} />}
      {currentMode === AppMode.JUVENILE && <JuvenileJustice />}
      {currentMode === AppMode.TRAFFIC && <TrafficDefense />}
      {currentMode === AppMode.HELP && <Help />}
    </Layout>
  );
};

const App: React.FC = () => {
  return <AppContent />;
};

export default App;
