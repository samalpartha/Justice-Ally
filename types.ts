
export interface UploadedFile {
  id: string;
  file?: File; // Optional for links
  url?: string; // New field for web links
  name: string;
  type: string; // 'application/pdf', 'image/png', 'video/mp4', or 'link'
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
  caseSummary: string;
  notes?: string;
  documents: DocumentAnalysis[];
  strategy: StrategicAnalysis | null;
  analyzed: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  hasAudio?: boolean; // If TTS is available
}

export interface CaseContext {
  jurisdiction: string;
  caseType: string;
  budget: string;
  description: string;
}

export interface TriageResult {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  riskAnalysis: string;
  advice: string;
  estimatedCosts: {
    filingFees: string;
    hiddenCosts: string[];
    attorneyComparison: string;
  };
  resources: {
    legalAidName: string;
    legalAidUrl: string;
    barAssociationUrl: string;
    immigrationUrl?: string;
  };
}

export enum AppMode {
  TRIAGE = 'TRIAGE',
  DASHBOARD = 'DASHBOARD',
  WAR_ROOM = 'WAR_ROOM',
  CHAT = 'CHAT',
  LIVE_STRATEGY = 'LIVE_STRATEGY',
  FORMS = 'FORMS',
  HELP = 'HELP',
}
