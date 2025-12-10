
# JusticeAlly: The Universal Legal Navigator
### *Democratizing Access to Justice via AI-Powered Litigation Strategy*

---

## 1. Executive Summary
**JusticeAlly** is a high-fidelity legal navigation platform designed to bridge the "Access to Justice" gap. It functions not just as a chatbot, but as a **Senior Litigation Strategist** for Self-Represented Litigants (formerly "Pro Se") and a **Force Multiplier** for Junior Attorneys.

By combining the reasoning power of **Gemini 3.0 Pro**, the real-time capabilities of **Gemini Live (Native Audio)**, and a strict "Black Letter Law" analytical framework, JusticeAlly moves users from a state of panic to a state of strategic action.

---

## 2. User Architecture & Security
The application features a secure, role-based entry point designed to establish privilege context and intent.

### **Authentication & Roles**
*   **Dual Login System:**
    *   **Self-Represented Litigant:** Focuses on education, cost-saving, and procedural guidance.
    *   **Attorney:** Focuses on rapid evidence review, strategy validation, and case management.
*   **Session Persistence:** Utilizes LocalStorage to persist user sessions and case data securely within the browser sandbox.
*   **Encryption Aesthetic:** The UI reinforces trust with "Bank-Level" visual cues and strict data boundaries.

### **Safety Protocols**
*   **Quick Exit:** A prominent safety button (often required in Domestic Violence cases) instantly redirects the browser to Google Weather.
*   **Redaction Studio:** An integrated canvas tool allowing users to permanently blackout PII (Personally Identifiable Information) from images *before* they are sent to the AI for analysis.

---

## 3. Core Modules

### **Module A: Triage & Intake (The "Risk Test")**
Before strategizing, the system assesses viability to prevent disastrous self-representation in complex cases.
*   **Inputs:** Jurisdiction (50 States + Federal), Case Type (including Juvenile Justice), Budget, and Voice-Dictated Statement of Facts.
*   **AI Assessment Engine (Gemini Flash):**
    *   **Risk Score:** Green (Go), Yellow (Caution), Red (Stop/Seek Counsel).
    *   **Wallet Reality Check:** Estimates filing fees, hidden costs (process servers, parking), and compares them against market rates for private counsel.
    *   **Resource Routing:** Dynamically generates links to local Legal Aid, Bar Associations, and immigration EOIR lists.

### **Module B: Secure Evidence Vault (The "Docket")**
A central repository for case assets, replacing the disorganized "Shoebox" method.
*   **Multi-Modal Ingestion:** Supports PDF, Images, and **Video (MP4/MOV)**.
*   **Video Understanding:** Leverages **Gemini 3 Pro** to watch bodycam or CCTV footage and extract timeline events.
*   **External Citations:** Users can attach URLs (news articles, case law) which are injected into the analysis context.
*   **Relevance Index:** A visual bar chart scoring every piece of evidence (1-10) based on its legal weight regarding the case claims.
*   **Executive Brief:** Automatically generates a senior-partner level summary of the case status.

### **Module C: Case Strategy & Planning (The "War Room")**
The heart of the application, redesigned with a "Senior Partner's Desk" aesthetic.
*   **Sun Tzu Analysis:** Applies "Art of War" principles to litigation (e.g., "The Empty Fort Strategy" for settlement leverage).
*   **Black Letter Law Matrix:** A structured table mapping facts to specific legal elements (Duty, Breach, Causation, Damages) and identifying **Affirmative Defenses**.
*   **Procedural Roadmap:** A timeline view of immediate next steps, statutory deadlines, and discovery tasks.
*   **Opponent Profiling:** Analyzes opposing counsel's correspondence to determine if they are a "Bully," "Settler," or "Stickler."
*   **Strategist Notepad:** A persistent memo pad with voice dictation for capturing non-documentary facts.

### **Module D: Tactical Chat (AI Co-Counsel)**
A context-aware chat interface for specific legal drafting and research.
*   **Model:** Powered by **Gemini 3.0 Pro Preview**.
*   **Research Mode:** Toggles **Google Search Grounding** to fetch real-time case law, statutes, and news verification.
*   **Wargaming:** A dedicated mode to simulate the opponent's strongest arguments.
*   **Attachments:** Users can inject new files or links directly into the conversation stream.
*   **Text-to-Speech (TTS):** Uses **Gemini Flash TTS** to read complex legal advice aloud for accessibility.

### **Module E: Live Strategy (Voice)**
A low-latency voice interface for oral argument preparation.
*   **Tech:** Built on **Gemini Live API (Native Audio)** via WebSockets.
*   **Function:** Allows users to have a fluid, interruptible conversation with the AI strategist.
*   **Transcription:** Displays a real-time scrolling transcript of both User input and AI output for record-keeping.
*   **Visualizer:** Interactive audio wave animation to indicate connection status.

### **Module F: Forms Library**
A repository of procedural templates.
*   **State Routing:** Directs users to verified "Self-Help" court portals (avoiding broken deep links).
*   **Generic Templates:** Provides standard structures for Answers, Fee Waivers, and Motions.
*   **Juvenile Justice:** Specific section covering Expungement, Emancipation, and Sealing Records.

---

## 4. Technical Architecture

### **AI Integration (@google/genai)**
*   **Gemini 3.0 Pro Preview:** Used for "Deep Reasoned" tasks (Case Analysis, Video Understanding, Complex Chat).
*   **Gemini 2.5 Flash:** Used for high-speed tasks (Triage JSON generation, Search Grounding).
*   **Gemini Live (Native Audio):** Handles the WebSocket voice sessions.
*   **Gemini TTS:** Handles text-to-speech synthesis.

### **Frontend Engineering**
*   **Framework:** React 19 + TypeScript.
*   **Styling:** TailwindCSS with a custom "Legal Docket" theme (Slate-950, Amber-600, Merriweather Serif).
*   **State Management:** LocalStorage for Save/Load functionality, ensuring data stays on the client side.
*   **Audio Processing:** Web Audio API for PCM encoding/decoding required by the Live API.

### **UI/UX Design Language**
*   **"The Docket":** Shifted from rounded tech-startup UI to sharp, double-bordered legal stationary aesthetics.
*   **Typography:** Merriweather (Serif) for authority; Inter (Sans) for readability.
*   **Iconography:** Custom SVG "Scales of Justice" branding and informative tooltips throughout.

---

## 5. Disclaimer & Ethics
JusticeAlly includes hard-coded guardrails:
*   **Unauthorized Practice of Law (UPL):** Every output is stamped with a disclaimer that AI is not an attorney.
*   **Hallucination Prevention:** The System Prompt explicitly instructs the model to refuse inventing case law and to prioritize official sources.
*   **Privacy:** All analysis happens via API with no persistent cloud storage on our end (client-side persistence only).
