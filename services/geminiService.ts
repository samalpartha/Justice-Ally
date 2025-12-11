
import { GoogleGenAI, Type, Schema, Part, Modality, LiveServerMessage } from "@google/genai";
import { UploadedFile, CaseData, CaseContext, TriageResult, Language } from "../types";

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
  // Handle cases where base64 string might not have the prefix
  const dataStr = arr.length > 1 ? arr[1] : arr[0];
  const bstr = atob(dataStr);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while(n--){
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, {type: mimeType});
};

// Helper to convert file to base64 for Gemini API (expects raw base64, no prefix)
export const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  const base64String = await fileToBase64(file);
  const base64Data = base64String.split(',')[1];
  return {
    inlineData: {
      data: base64Data,
      mimeType: file.type,
    },
  };
};

// --- AUDIO HELPERS ---
function encodeAudio(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decodeAudio(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// --- SYSTEM PROMPT GENERATOR ---

const getSystemInstruction = (language: Language) => `
You are **JusticeAlly**, the Universal Legal Navigator and Senior Litigation Strategist.
Your mission is to democratize access to justice by moving users from "Panic" to "Action."

# CORE IDENTITY
- **Role:** Strategic Case Manager for pro-se litigants.
- **Tone:** Professional, Empathetic, Authoritative, "Sun Tzu" Strategic.
- **Language:** You must communicate in **${language === 'es' ? 'SPANISH (Español)' : 'ENGLISH'}**.
- **Guardrails:** NEVER invent laws. ALWAYS cite sources. ALWAYS warn "Review Required: AI generated."

# DYNAMIC CAPABILITIES

## 1. THE STATUS BAR
Always maintain context of the user's status:
> **📍 JURISDICTION:** [State/Federal] | **⚖️ CASE TYPE:** [Type] | **🚦 RISK LEVEL:** [Low/Med/High] | **💰 EST. COST:** [Range]

## 2. THE VISUAL ROADMAP (Mermaid.js)
Visualize processes using Mermaid diagrams when explaining timelines.
Example:
\`\`\`mermaid
graph LR
A[Start] --> B{Decision};
B -- Yes --> C[Result 1];
B -- No --> D[Result 2];
\`\`\`

## 3. MODULES
- **Form Hunter:** specific government PDF links (lawhelp.org/[state_code], uscis.gov/[form]).
- **Wallet Reality Check:** Real talk on fees (Filing + Service + Parking).
- **Strategy (Sun Tzu):** "Win without fighting" (Settlement) vs "Total War" (Trial).

# OUTPUT RULES
- Use **Bold** for emphasis.
- Use lists for steps.
- If asking for a form, generate the specific search query the user should use if a direct link isn't certain.
- **Document/Video Analysis:** You have access to the user's uploaded files (PDFs, Images, Videos). When asked to draft timelines or summaries, USE the content of these files.
- **Language Enforcement:** Even if the JSON Schema keys are in English, the string values (content) must be in ${language === 'es' ? 'Spanish' : 'English'}.
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
    caseSummary: { 
      type: Type.STRING, 
      description: "A concise executive summary of the entire case covering main claims, key evidence, and strategic outlook for quick review." 
    },
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
          date: { type: Type.STRING, description: "YYYY-MM-DD or Unknown" },
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
    Perform a "Pro Se Suitability Test" and "Wallet Reality Check" for the following user:
    Jurisdiction: ${context.jurisdiction}
    Case Type: ${context.caseType}
    Budget: ${context.budget}
    Description: ${context.description}

    1. Risk Assessment:
    - GREEN LIGHT (Low Risk): Small Claims, Traffic, Simple Uncontested.
    - YELLOW LIGHT (Medium Risk): Contested Custody, Civil >$10k, Visa Renewals.
    - RED LIGHT (High Risk): Felony, Asylum, Malpractice, Complex Business.
    
    2. Cost Estimation:
    - Estimate filing fees for ${context.jurisdiction}.
    - List hidden costs (Process Servers, Parking, etc.).
    - Compare vs Attorney Costs (Full vs Unbundled).

    3. Resources:
    - Provide valid URL patterns for Legal Aid in ${context.jurisdiction}.
    - If Immigration, provide US DOJ EOIR link.

    Return JSON matching the schema.
    IMPORTANT: The content of the strings (riskAnalysis, advice, etc.) MUST be in ${language === 'es' ? 'SPANISH' : 'ENGLISH'}.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      systemInstruction: getSystemInstruction(language),
      responseMimeType: "application/json",
      responseSchema: TRIAGE_SCHEMA,
    },
  });

  const text = response.text;
  if (!text) throw new Error("No response");
  return JSON.parse(text);
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

  const fileParts = await Promise.all(binaryFiles.map(f => fileToGenerativePart(f.file!)));
  
  const contextStr = context ? `
    Context:
    Jurisdiction: ${context.jurisdiction}
    Case Type: ${context.caseType}
    Budget: ${context.budget}
  ` : "";

  const linksStr = links.length > 0 
    ? `\n\nExternal Reference Links (Treat as evidence/context): \n${links.map(l => `- ${l.name}: ${l.url}`).join('\n')}` 
    : "";

  const prompt = `
    Analyze the attached evidence (Documents, Videos, Images) and reference links for a case regarding: "${caseDescription}".
    ${contextStr}
    ${linksStr}
    
    1. **Executive Summary**: Generate a concise summary of the entire case, including the main claims, key evidence, and the current strategic outlook.
    2. **Evidence Vault Analysis**: Review each file. For Videos, summarize the key events shown. For Documents, list Red Flags.
    3. **War Room Mode**: Apply "Sun Tzu" strategic analysis.
       - If user is "Low Income", prioritize "Settlement" over "Trial".
       - Profile the opponent based on documents.
    4. **Black Letter Law**: Map facts to legal elements.
    
    Return the output in the specified JSON format.
    IMPORTANT: The content of the strings MUST be in ${language === 'es' ? 'SPANISH' : 'ENGLISH'}.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          role: "user",
          parts: [...fileParts, { text: prompt }],
        },
      ],
      config: {
        systemInstruction: getSystemInstruction(language),
        responseMimeType: "application/json",
        responseSchema: CASE_ANALYSIS_SCHEMA,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    const parsed = JSON.parse(text);
    return { ...parsed, analyzed: true };
  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};

export const sendChatMessage = async (
  history: { role: string; parts: { text: string }[] }[],
  message: string,
  language: Language = 'en',
  files: UploadedFile[] = [],
  useSearch: boolean = false
) => {
  if (!process.env.API_KEY) throw new Error("API Key missing");

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = useSearch ? "gemini-2.5-flash" : "gemini-3-pro-preview";

  const links = files.filter(f => f.type === 'link');
  const linksContext = links.length > 0 
    ? `\n\n[System Note] Active External Links in Evidence Vault:\n${links.map(l => `${l.name}: ${l.url}`).join('\n')}` 
    : '';

  const binaryFiles = files.filter(f => f.file && f.type !== 'link');
  const fileParts = await Promise.all(binaryFiles.map(f => fileToGenerativePart(f.file!)));

  const augmentedMessage = `${message} ${linksContext} \n\n[Instruction: The user has attached files. Read/View the attached files to answer the query. Respond in ${language === 'es' ? 'Spanish' : 'English'}.]`;
  
  const contentParts: Part[] = [
    { text: augmentedMessage },
    ...fileParts
  ];

  const tools = useSearch ? [{ googleSearch: {} }] : undefined;

  const chat = ai.chats.create({
    model,
    config: {
      systemInstruction: getSystemInstruction(language),
      tools: tools,
    },
    history: history,
  });

  const result = await chat.sendMessageStream({ parts: contentParts });
  return result;
};

// --- AUDIO TRANSCRIPTION (Robust) ---
export const transcribeAudio = async (audioBlob: Blob, language: Language = 'en'): Promise<string> => {
  if (!process.env.API_KEY) throw new Error("API Key missing");
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Convert Blob to Base64
  const reader = new FileReader();
  const base64Promise = new Promise<string>((resolve, reject) => {
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
  });
  reader.readAsDataURL(audioBlob);
  const base64Audio = await base64Promise;

  const prompt = `Transcribe the attached audio exactly as spoken. Return ONLY the transcription text, no preamble. Language is ${language === 'es' ? 'Spanish' : 'English'}.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash", // Flash is fast and good for transcription
    contents: [{
      parts: [
        { inlineData: { mimeType: audioBlob.type || 'audio/webm', data: base64Audio } },
        { text: prompt }
      ]
    }]
  });

  return response.text || "";
}

export const textToSpeech = async (text: string): Promise<string> => {
  if (!process.env.API_KEY) throw new Error("API Key missing");
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("No audio generated");
  return base64Audio;
};

// --- LIVE API SESSION (Strategy) ---
export class LiveSessionClient {
  private session: any; // Type is technically Promise<LiveSession>
  private inputAudioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private nextStartTime = 0;
  private sources = new Set<AudioBufferSourceNode>();
  private active = false;
  private stream: MediaStream | null = null;

  constructor(
    private onStatusChange: (status: string) => void,
    private onTranscript?: (role: 'user' | 'model', text: string) => void
  ) {}

  async connect(language: Language = 'en') {
    if (!process.env.API_KEY) throw new Error("API Key missing");
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    this.active = true;
    this.onStatusChange("Connecting...");

    this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 16000});
    this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
    
    // Setup Input
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    // Gemini Live Session
    this.session = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      callbacks: {
        onopen: () => {
          this.onStatusChange("Connected (Listening)");
          this.startAudioStream();
        },
        onmessage: async (message: LiveServerMessage) => {
          // Play Audio
          const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (base64Audio) {
             await this.playAudio(base64Audio);
          }
          
          // Handle Subtitles / Transcription
          if (message.serverContent?.inputTranscription?.text) {
             this.onTranscript?.('user', message.serverContent.inputTranscription.text);
          }
          if (message.serverContent?.outputTranscription?.text) {
             this.onTranscript?.('model', message.serverContent.outputTranscription.text);
          }

          if (message.serverContent?.interrupted) {
            this.stopAudio();
          }
        },
        onclose: () => {
          this.onStatusChange("Disconnected");
          this.active = false;
        },
        onerror: (err) => {
          console.error("Live API Error:", err);
          this.onStatusChange("Error");
        }
      },
      config: {
        responseModalities: [Modality.AUDIO],
        inputAudioTranscription: {}, // Request transcription for user input
        outputAudioTranscription: {}, // Request transcription for model output
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Fenrir' } }
        },
        systemInstruction: getSystemInstruction(language) + "\n\nNote: You are in a real-time voice strategy session. Be concise, calm, and authoritative."
      }
    });
  }

  private startAudioStream() {
    if (!this.inputAudioContext || !this.stream) return;
    
    const source = this.inputAudioContext.createMediaStreamSource(this.stream);
    const processor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);
    
    processor.onaudioprocess = (e) => {
      if (!this.active) return;
      const inputData = e.inputBuffer.getChannelData(0);
      
      // Convert Float32 to PCM16
      const l = inputData.length;
      const int16 = new Int16Array(l);
      for (let i = 0; i < l; i++) {
        int16[i] = inputData[i] * 32768;
      }
      
      const pcmData = encodeAudio(new Uint8Array(int16.buffer));
      
      this.session.then((s: any) => {
         s.sendRealtimeInput({
            media: {
              mimeType: 'audio/pcm;rate=16000',
              data: pcmData
            }
         });
      });
    };

    source.connect(processor);
    processor.connect(this.inputAudioContext.destination);
  }

  private async playAudio(base64: string) {
    if (!this.outputAudioContext) return;
    
    this.nextStartTime = Math.max(this.nextStartTime, this.outputAudioContext.currentTime);
    const audioBytes = decodeAudio(base64);
    
    // Decode PCM to AudioBuffer
    const buffer = this.outputAudioContext.createBuffer(1, audioBytes.length / 2, 24000);
    const channelData = buffer.getChannelData(0);
    const dataInt16 = new Int16Array(audioBytes.buffer);
    for (let i = 0; i < dataInt16.length; i++) {
       channelData[i] = dataInt16[i] / 32768.0;
    }

    const source = this.outputAudioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.outputAudioContext.destination);
    source.onended = () => this.sources.delete(source);
    
    source.start(this.nextStartTime);
    this.nextStartTime += buffer.duration;
    this.sources.add(source);
  }

  private stopAudio() {
    this.sources.forEach(s => s.stop());
    this.sources.clear();
    this.nextStartTime = 0;
  }

  async disconnect() {
    this.active = false;
    
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
    
    // Fix: Check state before closing to avoid "Cannot close a closed AudioContext" error
    if (this.inputAudioContext && this.inputAudioContext.state !== 'closed') {
      try {
        await this.inputAudioContext.close();
      } catch (e) {
        console.warn("Error closing input context:", e);
      }
    }
    this.inputAudioContext = null;

    if (this.outputAudioContext && this.outputAudioContext.state !== 'closed') {
      try {
        await this.outputAudioContext.close();
      } catch (e) {
        console.warn("Error closing output context:", e);
      }
    }
    this.outputAudioContext = null;

    this.onStatusChange("Disconnected");
  }
}

// --- STREAMING DICTATION CLIENT (Real-Time) ---
export class StreamingDictationClient {
  private session: any;
  private inputAudioContext: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private active = false;

  constructor(
    private onTranscript: (text: string) => void,
    private onError: (err: any) => void
  ) {}

  async start(language: Language) {
     if (!process.env.API_KEY) throw new Error("API Key missing");
     const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
     this.active = true;

     try {
       this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 16000});
       this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });

       this.session = ai.live.connect({
         model: 'gemini-2.5-flash-native-audio-preview-09-2025',
         callbacks: {
            onopen: () => {
              this.startAudioStream();
            },
            onmessage: (message: LiveServerMessage) => {
              // Only listen for input transcription (user's voice)
              if (message.serverContent?.inputTranscription?.text) {
                 this.onTranscript(message.serverContent.inputTranscription.text);
              }
            },
            onerror: (err) => {
               this.onError(err);
               this.stop();
            },
            onclose: () => {
               this.stop();
            }
         },
         config: {
           // We only want text processing, but Live API requires AUDIO response modality.
           // We will simply ignore the audio output in the onmessage handler.
           responseModalities: [Modality.AUDIO], 
           inputAudioTranscription: {}, 
           systemInstruction: `You are a dictation assistant. Your only job is to listen. Do not respond to questions. Language: ${language === 'es' ? 'Spanish' : 'English'}.`
         }
       });

     } catch (err) {
       this.onError(err);
       this.stop();
     }
  }

  private startAudioStream() {
    if (!this.inputAudioContext || !this.stream) return;
    const source = this.inputAudioContext.createMediaStreamSource(this.stream);
    const processor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);
    
    processor.onaudioprocess = (e) => {
      if (!this.active) return;
      const inputData = e.inputBuffer.getChannelData(0);
      const l = inputData.length;
      const int16 = new Int16Array(l);
      for (let i = 0; i < l; i++) {
        int16[i] = inputData[i] * 32768;
      }
      const pcmData = encodeAudio(new Uint8Array(int16.buffer));
      
      this.session.then((s: any) => {
         s.sendRealtimeInput({
            media: {
              mimeType: 'audio/pcm;rate=16000',
              data: pcmData
            }
         });
      });
    };

    source.connect(processor);
    processor.connect(this.inputAudioContext.destination);
  }

  stop() {
    this.active = false;
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
    if (this.inputAudioContext && this.inputAudioContext.state !== 'closed') {
      this.inputAudioContext.close();
    }
    this.inputAudioContext = null;
  }
}
