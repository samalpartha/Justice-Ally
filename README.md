
# JusticeAlly: Universal Legal Navigator

JusticeAlly is an advanced AI-powered legal assistant designed to democratize access to justice. Acting as a "Senior Litigation Strategist" for pro-se litigants, it combines ruthless strategy with compassionate administrative guidance.

## 🚀 Key Features

### 1. Triage & Risk Assessment
- **Pro Se Suitability Test:** Determines if a user can handle a case alone (Green/Yellow/Red risk).
- **Wallet Reality Check:** Estimates filing fees, hidden costs, and compares against attorney rates.

### 2. Secure Evidence Vault
- **Multi-Modal Ingestion:** Accepts PDFs, Images, and **Videos (MP4)**.
- **Video Understanding:** Uses **Gemini 3 Pro** to analyze footage (e.g., bodycams, CCTV).
- **External Links:** Attach court dockets or news articles as evidence.

### 3. War Room Strategy
- **Sun Tzu Analysis:** Applies "Art of War" principles (e.g., "Win without fighting" via settlement).
- **Black Letter Law:** Maps facts to legal elements (Duty, Breach, Causation, Damages).
- **Procedural Roadmap:** Generates discovery questions and identifies deadlines.

### 4. Tactical Chat & Research
- **AI Chatbot:** Powered by **Gemini 3 Pro** for high-level reasoning.
- **Legal Research Mode:** Toggles **Google Search Grounding** to find up-to-date case law and statutes.
- **Text-to-Speech:** Uses **Gemini Flash TTS** to read advice aloud.
- **Wargaming:** Simulates opposing counsel arguments.

### 5. Live Strategy (Voice)
- **Real-Time Conversation:** Uses **Gemini Live API (Native Audio)** for low-latency voice interaction.
- **Oral Argument Practice:** Rehearse your case verbally with the AI.

## 🛠️ Technology Stack

- **Frontend:** React, TailwindCSS, Recharts.
- **AI Core:** `@google/genai` SDK.
  - **Reasoning/Vision:** `gemini-3-pro-preview`
  - **Speed/Search:** `gemini-2.5-flash`
  - **Audio/Voice:** `gemini-2.5-flash-native-audio-preview-09-2025`
  - **TTS:** `gemini-2.5-flash-preview-tts`

## ⚠️ Disclaimer
JusticeAlly is an AI tool for informational and educational purposes only. It does not constitute legal advice or create an attorney-client relationship. Users should always verify information with a qualified attorney or court clerk.
