
# JusticeAlly: The Universal Legal Navigator

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Status](https://img.shields.io/badge/Status-Production%20Ready-green.svg)
![AI Model](https://img.shields.io/badge/AI-Gemini%203.0%20Pro-purple)
![Language](https://img.shields.io/badge/Language-English%20%7C%20Español-orange)

**JusticeAlly** is a high-fidelity legal navigation platform designed to bridge the "Access to Justice" gap. Acting as a **Senior Litigation Strategist** for Self-Represented Litigants (formerly "Pro Se") and a **Force Multiplier** for Junior Attorneys, it combines ruthless strategy with compassionate administrative guidance.

---

## 🚀 Key Features

### 🌍 1. Full Bilingual Support (EN / ES)
- **Deep Localization:** The entire interface, including AI analysis, risk assessments, and legal guides, allows instant toggling between **English** and **Spanish**.
- **Accessibility:** Designed to serve the millions of Spanish-speaking litigants navigating the US legal system.

### ⚖️ 2. Triage & Risk Assessment
- **Pro Se Suitability Test:** Determines if a user can handle a case alone (Green/Yellow/Red risk analysis).
- **Wallet Reality Check:** Estimates filing fees, hidden costs (process servers, parking), and compares them against market rates for private counsel.
- **Resource Routing:** Dynamically generates links to local Legal Aid and Bar Associations.

### 🗄️ 3. Secure Evidence Vault
- **Multi-Modal Ingestion:** Accepts PDFs, Images, and **Videos (MP4)**.
- **Redaction Studio:** Integrated canvas tool to permanently blackout PII (Personally Identifiable Information) before analysis.
- **Relevance Index:** A visual scoring system (1-10) rating evidence strength against legal claims.

### ♟️ 4. War Room Strategy
- **Sun Tzu Analysis:** Applies strategic principles (e.g., "Win without fighting" via settlement) to modern litigation.
- **Black Letter Law Matrix:** Maps facts to specific legal elements (Duty, Breach, Causation, Damages).
- **Procedural Roadmap:** Generates timelines for discovery and statutory deadlines.

### 📝 5. Forms Library & Repository
- **Official Resources:** Directs users to verified "Self-Help" court portals for 50 states.
- **My Repository:** A local, secure storage area for users to upload and manage their filled forms.
- **Smart Search:** Filters forms by category (Family, Housing, Civil) and keyword.

### 🚔 6. Specialized Justice Hubs
- **Traffic & Defense:** 
  - **Tracks:** DUI/DWI, Traffic Infractions, Accident Liability.
  - **Tools:** DMV Hearing checklists, "Trial by Declaration" guides.
- **Juvenile Justice:** 
  - **Tracks:** Emancipation, Delinquency, Dependency (CPS).
  - **Guidance:** Guardian Ad Litem (GAL) explanations and "Best Interest of the Child" standards.

### 🎙️ 7. Live Strategy (Voice)
- **Real-Time Consultation:** Uses **Gemini Live API** for low-latency, interruptible voice conversations.
- **Oral Argument Practice:** Rehearse your case verbally with the AI strategist.
- **Streaming Dictation:** Real-time speech-to-text for drafting affidavits and notes.

---

## 🛠️ Technology Stack

- **Frontend:** React 19 + TypeScript + TailwindCSS.
- **AI Core:** `@google/genai` SDK.
  - **Reasoning/Vision:** `gemini-3-pro-preview`
  - **Triage/Speed:** `gemini-2.5-flash`
  - **Voice/Live:** `gemini-2.5-flash-native-audio-preview-09-2025`
  - **TTS:** `gemini-2.5-flash-preview-tts`
- **Privacy Architecture:** 
  - **LocalStorage:** All case data persists only in the user's browser.
  - **No Backend Database:** Maximizes privacy and reduces liability.

## ⚠️ Disclaimer
**JusticeAlly is an automated educational tool.** It does not provide legal advice or create an attorney-client relationship. Users should always verify information with a qualified attorney or court clerk in their jurisdiction.
