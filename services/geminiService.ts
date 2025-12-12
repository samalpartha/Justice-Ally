
import { GoogleGenAI, Type, Schema, Modality, LiveServerMessage } from "@google/genai";
import { UploadedFile, CaseData, CaseContext, TriageResult, Language, SessionAnalysis, SessionRecord, AppMode, UserProfile, UserRole } from "../types";

// --- CONSTANTS ---
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

// --- HELPERS FOR PERSISTENCE ---

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const base64ToFile = (base64: string, filename: string, mimeType: string): File => {
  const arr = base64.split(',');
  const dataStr = arr.length > 1 ? arr[1] : arr[0];
  const bstr = atob(dataStr);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while(n--){
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, {type: mimeType});
};

export const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } } | null> => {
  // 1. Check size limit before processing
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`FILE_TOO_LARGE: ${file.name}`);
  }

  try {
    const base64String = await fileToBase64(file);
    const parts = base64String.split(',');
    const base64Data = parts.length > 1 ? parts[1] : parts[0]; 
    
    if (!base64Data || base64Data.trim() === '') return null;

    return {
      inlineData: {
        data: base64Data,
        mimeType: file.type,
      },
    };
  } catch (e) {
    console.error("Failed to process file", e);
    throw new Error("FILE_READ_ERROR");
  }
};

export const mapApiError = (error: any): string => {
  const msg = error?.message || error?.toString() || "";
  
  if (msg.includes("429") || msg.includes("Resource has been exhausted")) return "apiError429";
  if (msg.includes("500") || msg.includes("503") || msg.includes("Internal error") || msg.includes("unavailable")) return "apiError500";
  if (msg.includes("API key") || msg.includes("403") || msg.includes("permission denied")) return "apiErrorKey";
  if (msg.includes("ContentUnion") || msg.includes("must not be empty")) return "apiErrorContent";
  if (msg.includes("SAFETY") || msg.includes("blocked")) return "apiErrorSafety";
  if (msg.includes("Failed to fetch") || msg.includes("NetworkError") || msg.includes("connection")) return "apiErrorNetwork";
  if (msg.includes("FILE_TOO_LARGE")) return "fileTooLarge"; 
  if (msg.includes("FILE_READ_ERROR")) return "fileReadError";
  
  return "analysisFailed"; // Generic fallback
};

function encodeAudio(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function decodeAudio(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper to clean JSON strings from Markdown code blocks
const cleanJsonString = (str: string): string => {
  if (!str) return "{}";
  // Remove ```json and ``` wrapping
  let cleaned = str.replace(/```json/g, "").replace(/```/g, "");
  return cleaned.trim();
};

// Helper for resampling audio if browser doesn't support 16kHz natively
const downsampleBuffer = (buffer: Float32Array, inputRate: number, outputRate: number = 16000): Float32Array => {
    if (inputRate === outputRate) return buffer;
    if (inputRate < outputRate) return buffer; // Should not happen for 16k target
    
    const sampleRateRatio = inputRate / outputRate;
    const newLength = Math.floor(buffer.length / sampleRateRatio);
    const result = new Float32Array(newLength);
    
    for (let i = 0; i < newLength; i++) {
        // Nearest neighbor interpolation for speed
        result[i] = buffer[Math.floor(i * sampleRateRatio)];
    }
    return result;
};

// Simple retry wrapper for API calls
async function withRetry<T>(fn: () => Promise<T>, retries = 2, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (err: any) {
    if (retries > 0 && (err?.status === 503 || err?.message?.includes("503") || err?.message?.includes("unavailable"))) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw err;
  }
}

// STRICT Language Enforcement System Prompt
const getSystemInstruction = (language: Language) => `
You are **JusticeAlly**, the Universal Legal Navigator and Senior Litigation Strategist.
Mission: Democratize access to justice. Move users from "Panic" to "Action."

# CORE IDENTITY
- **Role:** Strategic Case Manager for pro-se litigants.
- **Tone:** Professional, Empathetic, Authoritative, "Sun Tzu" Strategic.
- **Active Language:** ${language === 'es' ? 'SPANISH (Español)' : 'ENGLISH'}.
- **Guardrails:** NEVER invent laws. ALWAYS cite sources. ALWAYS warn "Review Required".

# STRICT LANGUAGE RULES
1. **Output Language:** You must ONLY speak in ${language === 'es' ? 'SPANISH' : 'ENGLISH'}.
2. **Prohibited:** Do not use Hindi, Mandarin, Arabic, or any other script.
3. **Accent:** If the user speaks with a heavy accent, interpret it to the best of your ability but respond in standard ${language === 'es' ? 'Spanish' : 'English'}.

# OUTPUT RULES
- Use **Bold** for emphasis.
- Use specific search queries for forms if direct links aren't known.
- **Document/Video Analysis:** Analyze uploaded files deeply.
- **JSON Keys:** Always English.
- **String Values:** ${language === 'es' ? 'Spanish' : 'English'}.
`;

const TRIAGE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    riskLevel: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH"] },
    riskAnalysis: { type: Type.STRING },
    advice: { type: Type.STRING },
    estimatedCosts: {
      type: Type.OBJECT,
      properties: {
        filingFees: { type: Type.STRING },
        hiddenCosts: { type: Type.ARRAY, items: { type: Type.STRING } },
        attorneyComparison: { type: Type.STRING },
      },
      required: ["filingFees", "hiddenCosts", "attorneyComparison"],
    },
    resources: {
      type: Type.OBJECT,
      properties: {
        legalAidName: { type: Type.STRING },
        legalAidUrl: { type: Type.STRING },
        barAssociationUrl: { type: Type.STRING },
        immigrationUrl: { type: Type.STRING },
      },
      required: ["legalAidName", "legalAidUrl", "barAssociationUrl"],
    },
  },
  required: ["riskLevel", "riskAnalysis", "advice", "estimatedCosts", "resources"],
};

const CASE_ANALYSIS_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    caseSummary: { type: Type.STRING },
    documents: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          fileName: { type: Type.STRING },
          relevanceScore: { type: Type.NUMBER },
          summary: { type: Type.STRING },
          redFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
          docType: { type: Type.STRING },
          date: { type: Type.STRING },
        },
        required: ["fileName", "relevanceScore", "summary", "redFlags", "docType"],
      },
    },
    strategy: {
      type: Type.OBJECT,
      properties: {
        blackLetter: {
          type: Type.OBJECT,
          properties: {
            claimElements: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  element: { type: Type.STRING },
                  evidence: { type: Type.STRING },
                  status: { type: Type.STRING, enum: ["strong", "weak", "missing"] },
                },
              },
            },
            affirmativeDefenses: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
        },
        sunTzu: {
          type: Type.OBJECT,
          properties: {
            strategyName: { type: Type.STRING },
            quote: { type: Type.STRING },
            application: { type: Type.STRING },
            opponentProfile: { type: Type.STRING },
          },
        },
        procedural: {
          type: Type.OBJECT,
          properties: {
            nextStep: { type: Type.STRING },
            discoveryQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            deadlines: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
        },
      },
    },
  },
  required: ["caseSummary", "documents", "strategy"],
};

export const assessCaseSuitability = async (context: CaseContext, language: Language = 'en'): Promise<TriageResult> => {
  if (!process.env.API_KEY) throw new Error("API Key missing");
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-2.5-flash";

  const prompt = `
    Analyze User Case:
    Jurisdiction: ${context.jurisdiction}
    Case Type: ${context.caseType}
    Budget: ${context.budget}
    Description: ${context.description}

    Output JSON matching the schema. Language: ${language === 'es' ? 'Spanish' : 'English'}.
  `;

  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        systemInstruction: getSystemInstruction(language),
        responseMimeType: "application/json",
        responseSchema: TRIAGE_SCHEMA,
      },
    });
    return JSON.parse(cleanJsonString(response.text || "{}"));
  });
};

export const analyzeCaseFiles = async (
  files: UploadedFile[],
  caseDescription: string,
  language: Language = 'en',
  context?: CaseContext,
): Promise<CaseData> => {
  if (!process.env.API_KEY) throw new Error("API Key missing");

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-pro-preview"; 
  
  const binaryFiles = files.filter(f => f.file && f.type !== 'link');
  const links = files.filter(f => f.type === 'link');

  // Process files safely, filtering nulls
  const processedFiles = await Promise.all(binaryFiles.map(async f => {
      try {
          return await fileToGenerativePart(f.file!);
      } catch (e) {
          throw e;
      }
  }));
  const validFileParts = processedFiles.filter((p): p is { inlineData: { data: string; mimeType: string } } => p !== null);
  
  const contextStr = context ? `Context: ${context.jurisdiction}, ${context.caseType}` : "";
  const linksStr = links.length > 0 ? `Links: ${links.map(l => l.url).join(', ')}` : "";

  const descText = caseDescription.trim() || "Analyze the provided context.";

  const prompt = `
    Analyze Evidence & Facts: "${descText}"
    ${contextStr}
    ${linksStr}
    
    1. Executive Summary: Concise overview.
    2. Document Analysis: Review attached files (if any) or analyze the provided narrative.
    3. Strategy (Sun Tzu): "Win without fighting" if low budget.
    4. Black Letter Law: Map facts to elements.
    
    Output JSON. Language: ${language === 'es' ? 'Spanish' : 'English'}.
  `;

  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          role: "user",
          parts: [...validFileParts, { text: prompt }],
        },
      ],
      config: {
        systemInstruction: getSystemInstruction(language),
        responseMimeType: "application/json",
        responseSchema: CASE_ANALYSIS_SCHEMA,
      },
    });
    const parsed = JSON.parse(cleanJsonString(response.text || "{}"));
    return { ...parsed, analyzed: true };
  });
};

// --- CHAT & TTS ---

export const sendChatMessage = async (
  history: { role: string; parts: { text: string }[] }[],
  message: string,
  language: Language = 'en',
  files: UploadedFile[] = [],
  useSearch: boolean = false,
  location?: { latitude: number; longitude: number },
  caseContext?: string
) => {
  if (!process.env.API_KEY) throw new Error("API Key missing");
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Prepare tools
  const tools: any[] = [];
  let toolConfig: any = undefined;

  if (useSearch) {
    tools.push({ googleSearch: {} });
    tools.push({ googleMaps: {} });
    
    if (location) {
      toolConfig = {
        functionCallingConfig: { mode: 'AUTO' },
        googleSearchRetrieval: {
           dynamicRetrievalConfig: { mode: 'MODE_DYNAMIC', dynamicThreshold: 0.7 }
        }
      };
    }
  }

  // Handle files
  const fileParts = [];
  for (const file of files) {
      if (file.type === 'link') continue;
      if (file.file) {
          try {
             const part = await fileToGenerativePart(file.file);
             if (part) fileParts.push(part);
          } catch(e) { console.error(e); }
      } else if (file.base64) {
          fileParts.push({
              inlineData: {
                  mimeType: file.type,
                  data: file.base64.split(',')[1] || file.base64
              }
          });
      }
  }

  // Construct contents
  const contents = [...history];
  
  const newParts: any[] = fileParts.length > 0 ? [...fileParts] : [];
  
  let textPrompt = message;
  if (location && useSearch) {
      textPrompt += `\n[Context: User Location is Lat ${location.latitude}, Lng ${location.longitude}]`;
  }
  
  newParts.push({ text: textPrompt });

  contents.push({
      role: 'user',
      parts: newParts
  });

  // Use Gemini 2.5 Flash for better availability/stability in chat
  const model = "gemini-2.5-flash"; 
  
  // Combine system instruction with case context if available
  const baseInstruction = getSystemInstruction(language);
  const combinedInstruction = caseContext 
    ? `${baseInstruction}\n\n# CURRENT CASE CONTEXT\n${caseContext}\n\nUse this context to answer specific questions about the user's situation.` 
    : baseInstruction;

  // Direct return for streaming, using retry if initial connection fails
  return withRetry(async () => {
      return await ai.models.generateContentStream({
        model,
        contents: contents as any,
        config: {
          systemInstruction: combinedInstruction,
          tools: tools.length > 0 ? tools : undefined,
          toolConfig: toolConfig
        }
      });
  });
};

export const textToSpeech = async (text: string, language: Language = 'en'): Promise<string> => {
  if (!process.env.API_KEY) throw new Error("API Key missing");
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: {
      parts: [{ text }],
    },
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
};

// --- AUDIO UTILS ---
export const transcribeAudio = async (audioBlob: Blob, language: Language = 'en'): Promise<string> => {
  if (!process.env.API_KEY) throw new Error("API Key missing");
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const reader = new FileReader();
  const base64Promise = new Promise<string>((resolve, reject) => {
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
  });
  reader.readAsDataURL(audioBlob);
  const base64Audio = await base64Promise;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{
      parts: [
        { inlineData: { mimeType: audioBlob.type || 'audio/webm', data: base64Audio } },
        { text: `Transcribe exactly. Language: ${language}.` }
      ]
    }]
  });

  return response.text || "";
}

export const generateSessionAnalysis = async (transcript: {role: string, text: string}[], language: Language = 'en'): Promise<SessionAnalysis> => {
  if (!process.env.API_KEY) throw new Error("API Key missing");
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-2.5-flash";

  const transcriptText = transcript.map(t => `${t.role}: ${t.text}`).join('\n');

  const prompt = `
    Analyze this legal consultation transcript between a user (litigant) and an AI assistant.
    Target Audience: Self-represented litigant.
    Goal: Provide constructive feedback on their communication, fact presentation, and emotional control.

    Transcript:
    ${transcriptText}

    Output JSON with two arrays of strings: 'strongPoints' and 'improvements'.
    Language: ${language === 'es' ? 'Spanish' : 'English'}.
  `;

  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            strongPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
            improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["strongPoints", "improvements"],
        }
      },
    });
    return JSON.parse(cleanJsonString(response.text || "{ \"strongPoints\": [], \"improvements\": [] }"));
  });
};

// --- LIVE & DICTATION CLASSES ---
export class LiveSessionClient {
  private session: any; 
  private inputCtx: AudioContext | null = null;
  private outputCtx: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private active = false;
  private nextStartTime = 0;
  
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;

  constructor(
    private onStatus: (s: string) => void,
    private onTranscript?: (role: string, text: string) => void
  ) {}

  async connect(language: Language = 'en') {
    if (!process.env.API_KEY) throw new Error("Missing API Key");
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    this.active = true;
    this.onStatus("Connecting...");

    try {
      this.inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 16000});
      this.outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
      
      if (this.inputCtx && this.inputCtx.state === 'suspended') await this.inputCtx.resume();
      if (this.outputCtx && this.outputCtx.state === 'suspended') await this.outputCtx.resume();

      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      this.session = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {}, 
          outputAudioTranscription: {},
          // PASS LANGUAGE TO SYSTEM INSTRUCTION HERE
          systemInstruction: getSystemInstruction(language)
        },
        callbacks: {
          onopen: () => { this.onStatus("Connected"); this.streamAudio(); },
          onmessage: (msg: LiveServerMessage) => this.handleMessage(msg),
          onclose: () => { this.onStatus("Disconnected"); this.active = false; },
          onerror: (e) => { console.error(e); this.onStatus("Error (Retry)"); }
        }
      });
    } catch (e) {
      console.error(e);
      this.onStatus("Connection Failed");
      this.active = false;
    }
  }

  private streamAudio() {
    if (!this.inputCtx || !this.stream) return;
    this.source = this.inputCtx.createMediaStreamSource(this.stream);
    this.processor = this.inputCtx.createScriptProcessor(4096, 1, 1);
    
    this.processor.onaudioprocess = (e) => {
      if (!this.active) return;
      
      const input = e.inputBuffer.getChannelData(0);
      const outputRate = 16000;
      let dataToSend = input;

      if (this.inputCtx && this.inputCtx.sampleRate !== outputRate) {
          dataToSend = downsampleBuffer(input, this.inputCtx.sampleRate, outputRate);
      }

      const int16 = new Int16Array(dataToSend.length);
      for (let i=0; i<dataToSend.length; i++) int16[i] = dataToSend[i] * 32768;
      
      this.session.then((s: any) => s.sendRealtimeInput({
        media: { mimeType: 'audio/pcm;rate=16000', data: encodeAudio(new Uint8Array(int16.buffer)) }
      }));
    };
    this.source.connect(this.processor);
    this.processor.connect(this.inputCtx.destination);
  }

  private async handleMessage(msg: LiveServerMessage) {
    const audioData = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
    if (audioData && this.outputCtx) {
        const audioBytes = decodeAudio(audioData);
        const buffer = this.outputCtx.createBuffer(1, audioBytes.length/2, 24000);
        const channel = buffer.getChannelData(0);
        const int16 = new Int16Array(audioBytes.buffer);
        for(let i=0; i<int16.length; i++) channel[i] = int16[i] / 32768.0;
        
        const source = this.outputCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(this.outputCtx.destination);
        
        this.nextStartTime = Math.max(this.outputCtx.currentTime, this.nextStartTime);
        source.start(this.nextStartTime);
        this.nextStartTime += buffer.duration;
    }

    if (msg.serverContent?.inputTranscription?.text) {
        this.onTranscript?.('user', msg.serverContent.inputTranscription.text);
    }
    if (msg.serverContent?.outputTranscription?.text) {
        this.onTranscript?.('model', msg.serverContent.outputTranscription.text);
    }
  }

  async disconnect() {
    this.active = false;
    this.stream?.getTracks().forEach(t => t.stop());
    this.source?.disconnect();
    this.processor?.disconnect();
    if (this.inputCtx && this.inputCtx.state !== 'closed') try { await this.inputCtx.close(); } catch(e) {}
    if (this.outputCtx && this.outputCtx.state !== 'closed') try { await this.outputCtx.close(); } catch(e) {}
    this.onStatus("Disconnected");
  }
}

export class StreamingDictationClient {
  private session: any;
  private ctx: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private active = false;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;

  constructor(private onText: (t: string) => void, private onError: (e: any) => void) {}

  async start(language: Language) {
    if (!process.env.API_KEY) throw new Error("No API Key");
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    this.active = true;

    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 16000});
      if (this.ctx && this.ctx.state === 'suspended') await this.ctx.resume();
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      this.session = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: { 
          responseModalities: [Modality.AUDIO], 
          inputAudioTranscription: {},
          systemInstruction: `Dictation Mode. Transcribe speech strictly into ${language === 'es' ? 'Spanish' : 'English'}.` 
        },
        callbacks: {
          onopen: () => this.streamAudio(),
          onmessage: (m: LiveServerMessage) => {
             if (m.serverContent?.inputTranscription?.text) this.onText(m.serverContent.inputTranscription.text);
          },
          onerror: (e) => { this.onError(e); this.stop(); },
          onclose: () => this.stop()
        }
      });
    } catch (e) {
      this.onError(e);
      this.stop();
    }
  }

  private streamAudio() {
    if (!this.ctx || !this.stream) return;
    this.source = this.ctx.createMediaStreamSource(this.stream);
    this.processor = this.ctx.createScriptProcessor(4096, 1, 1);
    
    this.processor.onaudioprocess = (e) => {
      if (!this.active) return;
      const input = e.inputBuffer.getChannelData(0);
      const outputRate = 16000;
      let dataToSend = input;
      if (this.ctx && this.ctx.sampleRate !== outputRate) {
          dataToSend = downsampleBuffer(input, this.ctx.sampleRate, outputRate);
      }
      const int16 = new Int16Array(dataToSend.length);
      for (let i=0; i<dataToSend.length; i++) int16[i] = dataToSend[i] * 32768;
      
      this.session.then((s: any) => s.sendRealtimeInput({
        media: { mimeType: 'audio/pcm;rate=16000', data: encodeAudio(new Uint8Array(int16.buffer)) }
      }));
    };
    this.source.connect(this.processor);
    this.processor.connect(this.ctx.destination);
  }

  stop() {
    this.active = false;
    this.stream?.getTracks().forEach(t => t.stop());
    this.source?.disconnect();
    this.processor?.disconnect();
    if (this.ctx && this.ctx.state !== 'closed') try { this.ctx.close(); } catch(e) {}
  }
}
