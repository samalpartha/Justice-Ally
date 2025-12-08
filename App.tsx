import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import WarRoom from './components/WarRoom';
import ChatInterface from './components/ChatInterface';
import { AppMode, UploadedFile, CaseData } from './types';
import { analyzeCaseFiles } from './services/geminiService';

const App: React.FC = () => {
  const [currentMode, setMode] = useState<AppMode>(AppMode.DASHBOARD);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleFilesAdded = (newFiles: File[]) => {
    const uploaded: UploadedFile[] = newFiles.map(f => ({
      id: Math.random().toString(36).substr(2, 9),
      file: f,
      name: f.name,
      type: f.type
    }));
    setFiles(prev => [...prev, ...uploaded]);
  };

  const handleAnalyze = async (description: string) => {
    setAnalyzing(true);
    try {
      const result = await analyzeCaseFiles(files, description);
      setCaseData(result);
      setMode(AppMode.WAR_ROOM); // Auto switch to War Room on success
    } catch (error) {
      console.error("Analysis failed", error);
      alert("Analysis failed. Please ensure API Key is set in environment.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <Layout currentMode={currentMode} setMode={setMode}>
      {currentMode === AppMode.DASHBOARD && (
        <Dashboard 
          files={files} 
          onFilesAdded={handleFilesAdded}
          caseData={caseData}
          analyzing={analyzing}
          onAnalyze={handleAnalyze}
        />
      )}
      {currentMode === AppMode.WAR_ROOM && (
        <WarRoom caseData={caseData} />
      )}
      {currentMode === AppMode.CHAT && (
        <ChatInterface files={files} />
      )}
    </Layout>
  );
};

export default App;