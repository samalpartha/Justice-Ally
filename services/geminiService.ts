
import { GoogleGenAI, Type, Schema, Part, Modality, LiveServerMessage } from "@google/genai";
import { UploadedFile, CaseData, CaseContext, TriageResult } from "../types";

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

// --- SYSTEM PROMPT ---

const SYSTEM_INSTRUCTION = `
You are **JusticeAlly**, the Universal Legal Navigator and Senior Litigation Strategist.
Your mission is to democratize access to justice by moving users from "Panic" to "Action."

# CORE IDENTITY
- **Role:** Strategic Case Manager for pro-se litigants.
- **Tone:** Professional, Empathetic, Authoritative, "Sun Tzu" Strategic.
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

export const assessCaseSuitability = async (context: CaseContext): Promise<TriageResult> => {
  if (!process.env.API_KEY) throw new Error("API Key missing");
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  // Using Flash for fast JSON generation
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
  `;

  const response = await ai.models.generateContent({
    model,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
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
  context?: CaseContext
): Promise<CaseData> => {
  if (!process.env.API_KEY) throw new Error("API Key missing");

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  // UPGRADE: Use Pro for complex document reasoning and Video Understanding
  const model = "gemini-3-pro-preview"; 
  
  // Separate real files from links
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
        systemInstruction: SYSTEM_INSTRUCTION,
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
  files: UploadedFile[] = [],
  useSearch: boolean = false
) => {
  if (!process.env.API_KEY) throw new Error("API Key missing");

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  // UPGRADE: Use Gemini 3 Pro for chat logic, OR Flash if using Search (Search is currently supported well on Flash)
  // Per instructions: "Use gemini-2.5-flash (with googleSearch tool)" for search grounding.
  // Otherwise use "gemini-3-pro-preview" for chatbot.
  const model = useSearch ? "gemini-2.5-flash" : "gemini-3-pro-preview";

  // 1. Handle Links (Text Context)
  const links = files.filter(f => f.type === 'link');
  const linksContext = links.length > 0 
    ? `\n\n[System Note] Active External Links in Evidence Vault:\n${links.map(l => `${l.name}: ${l.url}`).join('\n')}` 
    : '';

  // 2. Handle Binary Files (Images/PDFs) - Convert to Parts
  const binaryFiles = files.filter(f => f.file && f.type !== 'link');
  const fileParts = await Promise.all(binaryFiles.map(f => fileToGenerativePart(f.file!)));

  // 3. Construct the Message Payload
  const augmentedMessage = `${message} ${linksContext} \n\n[Instruction: The user has attached files. Read/View the attached files to answer the query.]`;
  
  const contentParts: Part[] = [
    { text: augmentedMessage },
    ...fileParts
  ];

  const tools = useSearch ? [{ googleSearch: {} }] : undefined;

  const chat = ai.chats.create({
    model,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      tools: tools,
    },
    history: history,
  });

  // Use the parts array in the sendMessageStream call
  const result = await chat.sendMessageStream({ parts: contentParts });
  return result;
};

// --- TEXT TO SPEECH ---
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
  private outputNode: AudioWorkletNode | ScriptProcessorNode | null = null;
  private nextStartTime = 0;
  private sources = new Set<AudioBufferSourceNode>();
  private active = false;
  private stream: MediaStream | null = null;

  constructor(private onStatusChange: (status: string) => void) {}

  async connect() {
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
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Fenrir' } }
        },
        systemInstruction: SYSTEM_INSTRUCTION + "\n\nNote: You are in a real-time voice strategy session. Be concise, calm, and authoritative."
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
    // RAW PCM decoding (no header)
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
    if (this.stream) this.stream.getTracks().forEach(t => t.stop());
    if (this.inputAudioContext) this.inputAudioContext.close();
    if (this.outputAudioContext) this.outputAudioContext.close();
    // No explicit close on session object in types, but connection will drop
    this.onStatusChange("Disconnected");
  }
}
