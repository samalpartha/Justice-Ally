
# JusticeAlly: The Universal Legal Navigator

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Status](https://img.shields.io/badge/Status-Production%20Ready-green.svg)
![AI Model](https://img.shields.io/badge/AI-Gemini%203.0%20Pro-purple)
![Language](https://img.shields.io/badge/Language-English%20%7C%20Español-orange)

**JusticeAlly** is a high-fidelity legal navigation platform designed to bridge the "Access to Justice" gap. Acting as a **Senior Litigation Strategist** for Self-Represented Litigants (formerly "Pro Se") and a **Force Multiplier** for Junior Attorneys, it combines ruthless strategy with compassionate administrative guidance.

---

## 🏗️ System Architecture

JusticeAlly operates on a **Client-Side Privacy First** architecture. No case data is stored on external servers; the Gemini API is used strictly as a stateless reasoning engine.

```text
+------------------------------+
|   User (Pro Se / Attorney)   |
+--------------+---------------+
               |
               v
+--------------+---------------+
|    Login / Role Selection    |
+--------------+---------------+
               |
               v
+--------------+---------------+
|     AppShell (Main Layout)   |
+--------------+---------------+
               |
    +----------+----------+----------------+----------------+----------------+
    |                     |                |                |                |
    v                     v                v                v                v
+---+----------+   +------+-------+   +----+-----+   +------+-------+   +----+-----+
|  Module A:   |   |  Module B:   |   | Module C:|   |   Module D:  |   | Module F:|
| Triage & Risk|   |Evidence Vault|   | Strategy |   | AI Counsel   |   | Live Sim |
+---+----------+   +------+-------+   +----+-----+   +------+-------+   +----+-----+
    |                     |                |                |                |
    | (Data Persistence)  |                |                |                |
    v                     v                v                v                v
+---+---------------------+----------------+----------------+----------------+-------+
|          Secure Data Layer (LocalStorage + Encryption)                             |
+---+---------------------+----------------+----------------+----------------+-------+
    |                     |                |                |                |
    | (Case Context)      | (Files)        | (Facts)        | (Chat)         | (Audio)
    v                     v                v                v                v
+---+---------------------+----------------+----------------+----------------+-------+
|           Intelligence Layer (Google Gemini API)                                   |
|                 (Stateless Reasoning Engine)                                       |
+------------------------------------------------------------------------------------+
```

---

## 💻 Installation & Setup

Follow these instructions to set up the development environment.

### Prerequisites
*   **Node.js** (v18 or higher)
*   **Google Gemini API Key** (Get one at [Google AI Studio](https://aistudio.google.com/))

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/justice-ally.git
cd justice-ally
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Configuration
Create a `.env` file in the root directory. You **must** add your Gemini API key here. This file is git-ignored to protect your secrets.
```env
# .env
API_KEY=your_google_gemini_api_key_here
```

### 4. Run the Application
Start the development server.
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) (or the port shown in your terminal) to view the app.

---

## 🚀 Deployment

### Vercel / Netlify
1.  Fork this repository to your GitHub.
2.  Import the project into Vercel or Netlify.
3.  **Critical:** Add `API_KEY` to the **Environment Variables** in the deployment settings.
4.  Deploy!

**Note:** Since this is a Vite app, the build command is `npm run build` and the output directory is `dist`.

---

## 🔧 Troubleshooting & Git Operations

### Unable to Push to GitHub?
If you encounter errors when pushing, check the following:
1.  **Large Files**: Ensure you haven't accidentally committed large video or image files from your testing. The `.gitignore` is set up to exclude standard artifacts, but check your manual adds.
2.  **Secrets in History**: If you accidentally committed your `.env` file, remove it immediately:
    ```bash
    git rm --cached .env
    echo ".env" >> .gitignore
    git commit -m "Remove secrets"
    ```

### API Errors (403/503)
*   **403 Permission Denied**: Verify your API Key in `.env` is correct and has access to **Gemini 1.5 Pro/Flash** and **Gemini 3.0 Pro** models.
*   **503 Unavailable**: The model might be overloaded. The app includes an exponential backoff retry mechanism, but you can also try again in a few seconds.

---

## 🚀 Key Features

### 🌍 1. Full Bilingual Support (EN / ES)
- **Deep Localization:** The entire interface, including AI analysis, risk assessments, and legal guides, allows instant toggling between **English** and **Spanish**.

### ⚖️ 2. Triage & Risk Assessment
- **Pro Se Suitability Test:** Determines if a user can handle a case alone (Green/Yellow/Red risk analysis).
- **Wallet Reality Check:** Estimates filing fees and hidden costs.

### 🗄️ 3. Secure Evidence Vault
- **Multi-Modal Ingestion:** Accepts PDFs, Images, and **Videos (MP4)**.
- **Redaction Studio:** Integrated canvas tool to permanently blackout PII.
- **Relevance Index:** A visual scoring system (1-10) rating evidence strength.

### ♟️ 4. War Room Strategy
- **Sun Tzu Analysis:** Applies strategic principles to modern litigation.
- **Black Letter Law Matrix:** Maps facts to specific legal elements (Duty, Breach, Causation, Damages).
- **Voice Dictation:** Integrated speech-to-text for drafting Counsel's Memorandums.

### 💬 5. AI Counsel (Chat Assistant)
- **Wargaming:** Ask the AI to simulate opposing counsel or a judge.
- **Context-Aware:** Reads from your Evidence Vault and Case Strategy.
- **Dictation:** Use voice commands to draft complex legal questions naturally.

### 📝 6. Forms Library & Repository
- **Official Resources:** Directs users to verified "Self-Help" court portals for 50 states.
- **My Repository:** A secure local storage area for users to upload and manage filled forms.

### 7. Specialized Justice Hubs
- **Traffic & Defense:** DUI/DWI checklists and "Trial by Declaration" guides.
- **Juvenile Justice:** Emancipation, Delinquency, and Dependency (CPS) guidance.

### 🎙️ 8. Live Strategy (Voice)
- **Real-Time Consultation:** Uses **Gemini Live API** for low-latency voice conversations.
- **Oral Argument Practice:** Rehearse your case verbally with the AI strategist.

---

## ⚠️ Disclaimer
**JusticeAlly is an automated educational tool.** It does not provide legal advice or create an attorney-client relationship. Users should always verify information with a qualified attorney or court clerk in their jurisdiction.
