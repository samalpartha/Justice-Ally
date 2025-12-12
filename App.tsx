
import React, { useCallback, useState, useEffect } from "react";

import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import WarRoom from "./components/WarRoom";
import Triage from "./components/Triage";
import Help from "./components/Help";
import LiveSession from "./components/LiveSession";
import FormsLibrary from "./components/FormsLibrary";
import JuvenileJustice from "./components/JuvenileJustice";
import TrafficDefense from "./components/TrafficDefense";
import Login from "./components/Login";
import AboutModal from "./components/AboutModal";
import ChatInterface from "./components/ChatInterface";

import { AppMode, CaseData, UserProfile, UploadedFile, CaseContext, TriageResult, UserRole } from "./types";
import { analyzeCaseFiles, fileToBase64, base64ToFile, mapApiError } from './services/geminiService';
import { useLanguage } from './context/LanguageContext';

const SAVE_KEY = 'justiceAlly_save_v1';
const USER_KEY = 'justiceAlly_user_v1';

const createEmptyCaseData = (notes: string = ""): CaseData => ({
  caseSummary: "",
  documents: [],
  strategy: null,
  analyzed: false,
  notes,
  timeline: [],
  entities: []
});

const App: React.FC = () => {
  const { t, language } = useLanguage();
  const [mode, setMode] = useState<AppMode>(AppMode.TRIAGE);
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showAbout, setShowAbout] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [caseContext, setCaseContext] = useState<CaseContext | undefined>();
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const showNotify = (messageKey: string, type: 'success' | 'error') => {
      const msg = t('alerts', messageKey) || messageKey;
      setNotification({ message: msg, type });
      setTimeout(() => setNotification(null), 5000);
  };

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
    setFiles([]);
    setCaseData(null);
    setCaseContext(undefined);
    setMode(AppMode.TRIAGE);
  };

  const handleNotesChange = useCallback((notes: string) => {
    setCaseData((prev) =>
      prev ? { ...prev, notes } : createEmptyCaseData(notes)
    );
  }, []);

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

  // Refactored handler to strictly manage loading state
  const handleAnalyzeEvidence = async (statementOfFacts: string) => {
    if ((!files || files.length === 0) && !statementOfFacts.trim()) {
      showNotify("Please upload evidence or enter a statement of facts.", "error");
      return;
    }

    setAnalyzing(true);
    try {
      // Update context description if provided
      const currentContext = caseContext || {
        jurisdiction: "Unknown",
        caseType: "General",
        budget: "Unknown",
        description: statementOfFacts
      };

      if (statementOfFacts && statementOfFacts !== currentContext.description) {
         currentContext.description = statementOfFacts;
         setCaseContext(currentContext);
      }

      const result = await analyzeCaseFiles(files, statementOfFacts, language, currentContext);
      
      setCaseData(prev => ({
        ...result,
        notes: prev?.notes || result.notes || ''
      }));
      
      showNotify("Analysis Complete", "success");
      setMode(AppMode.WAR_ROOM);
    } catch (err: any) {
      console.error("analyzeCaseFiles error:", err);
      const key = mapApiError(err);
      showNotify(key, "error");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveState = async () => {
    try {
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
            const liteState = {
                ...state,
                files: state.files.filter((f: any) => f.type === 'link')
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
      setCaseContext({
          jurisdiction: 'California',
          caseType: 'Landlord/Tenant',
          budget: 'Low',
          description: 'Eviction defense for non-payment due to habitability issues (broken heater).'
      });
      
      const dummyLink: UploadedFile = {
          id: 'demo_email',
          name: 'Email_Thread_Repair_Request_Jan2024.pdf',
          type: 'link',
          url: 'https://mail.google.com/mail/u/0/#search/landlord'
      };
      
      setFiles(prev => [...prev, dummyLink]);
      showNotify('demoLoaded', 'success');
  };

  const renderContent = () => {
    switch (mode) {
      case AppMode.WAR_ROOM:
        return (
          <WarRoom
            caseData={caseData}
            onNotesChange={handleNotesChange}
            onFilesAdded={handleFilesAdded}
            onLinkAdded={handleLinkAdded}
            onLoadDemo={loadDemoData}
          />
        );
      case AppMode.CHAT:
        return <ChatInterface caseData={caseData} />;
      case AppMode.TRIAGE:
        return <Triage onComplete={(ctx, res) => {
            setCaseContext(ctx);
            setTriageResult(res);
            setMode(AppMode.DASHBOARD);
        }} />;
      case AppMode.LIVE_STRATEGY:
        return <LiveSession />;
      case AppMode.FORMS:
        return <FormsLibrary files={files} onFilesAdded={handleFilesAdded} />;
      case AppMode.JUVENILE:
        return <JuvenileJustice />;
      case AppMode.TRAFFIC:
        return <TrafficDefense />;
      case AppMode.HELP:
        return <Help />;
      case AppMode.DASHBOARD:
      default:
        return (
          <Dashboard
            files={files}
            onFilesAdded={handleFilesAdded}
            onLinkAdded={handleLinkAdded}
            onFileUpdated={handleFileUpdated}
            onFileDeleted={handleFileDeleted}
            caseData={caseData}
            analyzing={analyzing}
            onAnalyze={handleAnalyzeEvidence}
            context={caseContext}
            onLoadDemo={loadDemoData}
          />
        );
    }
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <>
      <Layout
        currentMode={mode}
        setMode={setMode}
        onShowAbout={() => setShowAbout(true)}
        user={user}
        onSave={handleSaveState}
        onLoad={handleLoadState}
        onLogout={handleLogout}
      >
        {notification && (
          <div className={`fixed top-4 right-4 z-[100] px-6 py-4 rounded-sm shadow-2xl border-l-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${notification.type === 'success' ? 'bg-slate-900 border-green-500 text-green-400' : 'bg-slate-900 border-red-500 text-red-400'}`}>
              <span className="font-bold text-xs uppercase tracking-wide">{notification.message}</span>
          </div>
        )}
        {renderContent()}
      </Layout>
      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
    </>
  );
};

export default App;
