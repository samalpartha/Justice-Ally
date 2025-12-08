import { GoogleGenAI, Type, Schema } from "@google/genai";
import { UploadedFile, CaseData } from "../types";

// Helper to convert file to base64
export const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const SYSTEM_INSTRUCTION = `
You are JusticeAlly, a high-level AI Senior Litigation Strategist.
CORE COMPETENCIES:
1. Shoebox Analysis: Analyze documents for relevance (1-10) and red flags (deadlines, errors).
2. Black Letter Law: Break down claims into elements (Duty, Breach, Causation, Damages).
3. Sun Tzu Strategy: Apply "Art of War" to litigation (e.g., "Win without fighting").
4. Procedural: Identify next steps and discovery questions.

GUARDRAILS:
- NO Hallucinations: Do not invent case law.
- Confidentiality: Redact PII (e.g., [Minor Child A]).
- UPL Warning: ALWAYS remind user this is not legal advice.
`;

const CASE_ANALYSIS_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
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
};

export const analyzeCaseFiles = async (
  files: UploadedFile[],
  caseDescription: string
): Promise<CaseData> => {
  if (!process.env.API_KEY) throw new Error("API Key missing");

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const model = "gemini-2.5-flash"; 
  
  const fileParts = await Promise.all(files.map(f => fileToGenerativePart(f.file)));
  
  const prompt = `
    Analyze the attached legal documents for a case regarding: "${caseDescription}".
    
    Perform a "Shoebox Analysis" on each document.
    Then, enter "War Room Mode" and provide a strategic analysis based on the aggregate facts.
    
    If a document is an image of a handwritten note, transcribe the relevant parts in the summary.
    If a document is a court notice, highlight the date in redFlags.
    
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
  files: UploadedFile[] = []
) => {
  if (!process.env.API_KEY) throw new Error("API Key missing");

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-2.5-flash";

  // We don't send all files every chat turn to save tokens, only if explicitly added or on first turn context.
  // Ideally, the 'history' contains previous context.
  // For this implementation, we assume the chat context is maintained by the client state passed in `history`.

  const chat = ai.chats.create({
    model,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
    },
    history: history,
  });

  const result = await chat.sendMessageStream({ message });
  return result;
};