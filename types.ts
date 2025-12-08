export interface UploadedFile {
  id: string;
  file: File;
  name: string;
  type: string;
  previewUrl?: string;
  base64?: string;
}

export interface DocumentAnalysis {
  fileName: string;
  relevanceScore: number; // 1-10
  summary: string;
  redFlags: string[];
  docType: string;
  date?: string;
}

export interface StrategicAnalysis {
  blackLetter: {
    claimElements: { element: string; evidence: string; status: 'strong' | 'weak' | 'missing' }[];
    affirmativeDefenses: string[];
  };
  sunTzu: {
    strategyName: string;
    quote: string;
    application: string;
    opponentProfile: string;
  };
  procedural: {
    nextStep: string;
    discoveryQuestions: string[];
    deadlines: string[];
  };
}

export interface CaseData {
  documents: DocumentAnalysis[];
  strategy: StrategicAnalysis | null;
  analyzed: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export enum AppMode {
  DASHBOARD = 'DASHBOARD',
  WAR_ROOM = 'WAR_ROOM',
  CHAT = 'CHAT',
}