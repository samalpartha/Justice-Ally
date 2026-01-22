# JusticeAlly - System Architecture

## Table of Contents

- [Overview](#overview)
- [Current MVP Architecture](#current-mvp-architecture)
- [Technology Stack](#technology-stack)
- [Data Flow](#data-flow)
- [Production Architecture](#production-architecture)
- [Security Considerations](#security-considerations)
- [Deployment Strategy](#deployment-strategy)

---

## Overview

JusticeAlly is an AI-powered litigation strategy platform that leverages Google's Gemini AI to provide real-time legal counsel, case analysis, and strategic recommendations for attorneys and pro se litigants.

### Core Capabilities

- **AI-Powered Triage**: Automated case intake and initial assessment
- **Evidence Analysis**: Multi-modal document and media analysis
- **Strategic Planning**: Real-time litigation strategy recommendations
- **Live AI Counsel**: Voice-based consultation via Gemini Live
- **Multi-lingual Support**: English and Spanish interfaces

---

## Current MVP Architecture

### System Overview

```mermaid
graph TB
    subgraph "Client Browser"
        UI[React Frontend]
        LS[LocalStorage]
        WS[WebSocket Client]
    end
    
    subgraph "Google Cloud"
        GEMINI[Gemini API]
        FLASH[Gemini 1.5 Flash]
        PRO[Gemini 1.5 Pro]
        LIVE[Gemini Live]
        TTS[Text-to-Speech]
    end
    
    UI -->|State Management| LS
    UI -->|REST API Calls| FLASH
    UI -->|REST API Calls| PRO
    UI -->|WebSocket| LIVE
    UI -->|Audio Synthesis| TTS
    
    FLASH -->|Case Analysis| GEMINI
    PRO -->|Deep Analysis| GEMINI
    LIVE -->|Voice Interaction| GEMINI
    TTS -->|Voice Output| GEMINI
    
    style UI fill:#4285f4,color:#fff
    style GEMINI fill:#34a853,color:#fff
    style LS fill:#fbbc04,color:#000
```

### Component Architecture

```mermaid
graph LR
    subgraph "Frontend Components"
        LOGIN[Login]
        TRIAGE[Triage]
        DASH[Dashboard]
        VAULT[Evidence Vault]
        WAR[War Room]
        STRAT[Live Strategy]
        
        LOGIN --> TRIAGE
        TRIAGE --> DASH
        DASH --> VAULT
        DASH --> WAR
        DASH --> STRAT
    end
    
    subgraph "Core Services"
        GEMINI_SVC[Gemini Service]
        STORAGE[Local Storage Service]
    end
    
    subgraph "Context Providers"
        LANG[Language Context]
        THEME[Theme Context]
    end
    
    TRIAGE -.->|Uses| GEMINI_SVC
    VAULT -.->|Uses| GEMINI_SVC
    WAR -.->|Uses| GEMINI_SVC
    STRAT -.->|Uses| GEMINI_SVC
    
    DASH -->|Persists| STORAGE
    
    LOGIN -->|Consumes| LANG
    LOGIN -->|Consumes| THEME
    
    style GEMINI_SVC fill:#ea4335,color:#fff
    style STORAGE fill:#fbbc04,color:#000
```

### Data Flow - Case Triage

```mermaid
sequenceDiagram
    participant User
    participant UI as Triage UI
    participant Service as Gemini Service
    participant API as Gemini Flash API
    participant Storage as LocalStorage
    
    User->>UI: Enter case details
    UI->>Service: analyzeCaseContext(caseData)
    Service->>API: POST /generateContent
    Note over API: Schema: AICounselResponse
    API-->>Service: Structured analysis
    Service-->>UI: Return triage result
    UI->>Storage: Save case data
    UI-->>User: Display recommendations
    
    Note over User,Storage: Local-first architecture<br/>No backend persistence
```

---

## Technology Stack

### Frontend Stack

```mermaid
graph TD
    subgraph "Build Tools"
        VITE[Vite 6.2]
        TS[TypeScript 5.8]
    end
    
    subgraph "UI Framework"
        REACT[React 19.2]
        DOM[React DOM]
    end
    
    subgraph "Styling"
        CSS[Vanilla CSS]
        CUSTOM[Custom Design System]
    end
    
    subgraph "AI Integration"
        GENAI[@google/genai SDK]
        MODELS[Flash/Pro/Live]
    end
    
    subgraph "Data Visualization"
        CHARTS[Recharts 3.5]
    end
    
    VITE --> REACT
    TS --> REACT
    REACT --> GENAI
    REACT --> CHARTS
    REACT --> CSS
    
    style REACT fill:#61dafb,color:#000
    style VITE fill:#646cff,color:#fff
    style GENAI fill:#4285f4,color:#fff
```

### AI Model Selection Strategy

```mermaid
graph TD
    START[User Request]
    
    START --> QUICK{Quick Analysis?}
    QUICK -->|Yes<br/>Case triage<br/>Evidence summary| FLASH[Gemini 1.5 Flash<br/>Fast & Efficient]
    QUICK -->|No| COMPLEX{Complex Task?}
    
    COMPLEX -->|Yes<br/>Deep analysis<br/>Strategy planning| PRO[Gemini 1.5 Pro<br/>Advanced Reasoning]
    COMPLEX -->|No| VOICE{Voice Interaction?}
    
    VOICE -->|Yes<br/>Real-time counsel| LIVE[Gemini Live<br/>Low Latency WebRTC]
    VOICE -->|No| AUDIO{Audio Output?}
    
    AUDIO -->|Yes| TTS[Text-to-Speech<br/>Voice Synthesis]
    AUDIO -->|No| FLASH
    
    style FLASH fill:#34a853,color:#fff
    style PRO fill:#4285f4,color:#fff
    style LIVE fill:#ea4335,color:#fff
    style TTS fill:#fbbc04,color:#000
```

---

## Data Flow

### Evidence Analysis Pipeline

```mermaid
flowchart TB
    START([User Uploads Evidence])
    
    START --> TYPE{File Type?}
    
    TYPE -->|Document| DOC[PDF/Word Analysis]
    TYPE -->|Image| IMG[Image Analysis]
    TYPE -->|Audio| AUD[Audio Transcription]
    TYPE -->|Video| VID[Video Analysis]
    
    DOC --> EXTRACT[Text Extraction]
    IMG --> VISION[Vision API]
    AUD --> SPEECH[Speech-to-Text]
    VID --> MULTI[Multi-modal Analysis]
    
    EXTRACT --> AI[Gemini Pro Analysis]
    VISION --> AI
    SPEECH --> AI
    MULTI --> AI
    
    AI --> SUMMARY[Evidence Summary]
    AI --> TAGS[Auto-tagging]
    AI --> TIMELINE[Timeline Placement]
    
    SUMMARY --> VAULT[Evidence Vault]
    TAGS --> VAULT
    TIMELINE --> VAULT
    
    VAULT --> STORE[(LocalStorage)]
    
    style AI fill:#4285f4,color:#fff
    style VAULT fill:#34a853,color:#fff
    style STORE fill:#fbbc04,color:#000
```

### Live Strategy Session Flow

```mermaid
sequenceDiagram
    participant User
    participant UI as Live Strategy UI
    participant Client as LiveSessionClient
    participant WS as WebSocket
    participant Gemini as Gemini Live API
    participant Context as Case Context
    
    User->>UI: Click "Join Session"
    UI->>Context: Gather case data
    Context-->>UI: Return full context
    
    UI->>Client: connect(systemInstruction)
    Note over Client: System instruction includes:<br/>- Case details<br/>- Evidence summary<br/>- Past interactions<br/>- Strategy notes
    
    Client->>WS: Establish WebSocket
    WS->>Gemini: Setup session with context
    Gemini-->>WS: Session ready
    WS-->>Client: Connected
    Client-->>UI: Update status
    
    loop Real-time Interaction
        User->>UI: Speak question
        UI->>Client: Send audio
        Client->>WS: Audio stream
        WS->>Gemini: Process audio
        Gemini->>WS: AI response (audio)
        WS->>Client: Response stream
        Client->>UI: Play audio
        UI-->>User: Hear answer
    end
    
    User->>UI: End session
    UI->>Client: disconnect()
    Client->>WS: Close connection
```

---

## Production Architecture

### Recommended Enterprise Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        WEB[Web App<br/>React]
        MOBILE[Mobile App<br/>React Native]
    end
    
    subgraph "CDN & Edge"
        CDN[CloudFlare CDN]
        EDGE[Edge Functions]
    end
    
    subgraph "API Gateway"
        GATEWAY[API Gateway<br/>Kong/Apigee]
        AUTH[Auth Service<br/>OAuth 2.0 + JWT]
        RATE[Rate Limiter]
    end
    
    subgraph "Application Layer - GCP"
        API[Backend API<br/>Node.js/Express<br/>Cloud Run]
        WORKERS[Background Workers<br/>Cloud Tasks]
        REALTIME[WebSocket Server<br/>Cloud Run]
    end
    
    subgraph "AI Services"
        GEMINI_PROXY[Gemini Proxy]
        EMBEDDING[Vector Embeddings]
        RAG[RAG Pipeline]
    end
    
    subgraph "Data Layer"
        POSTGRES[(PostgreSQL<br/>Cloud SQL)]
        REDIS[(Redis Cache<br/>Memorystore)]
        VECTOR[(Vector DB<br/>Pinecone/Weaviate)]
        STORAGE[Object Storage<br/>Cloud Storage]
    end
    
    subgraph "External Services"
        GEMINI[Google Gemini API]
        VERTEX[Vertex AI]
    end
    
    WEB --> CDN
    MOBILE --> CDN
    CDN --> EDGE
    EDGE --> GATEWAY
    
    GATEWAY --> AUTH
    GATEWAY --> RATE
    AUTH --> API
    RATE --> API
    
    API --> POSTGRES
    API --> REDIS
    API --> GEMINI_PROXY
    API --> STORAGE
    
    REALTIME --> GEMINI_PROXY
    WORKERS --> POSTGRES
    WORKERS --> EMBEDDING
    
    GEMINI_PROXY --> GEMINI
    EMBEDDING --> VECTOR
    RAG --> VECTOR
    RAG --> GEMINI
    
    style WEB fill:#4285f4,color:#fff
    style API fill:#34a853,color:#fff
    style POSTGRES fill:#4285f4,color:#fff
    style GEMINI fill:#ea4335,color:#fff
```

### Multi-Tenant Architecture

```mermaid
graph TB
    subgraph "Tenant Isolation"
        subgraph "Law Firm A"
            FIRM_A_USERS[Users]
            FIRM_A_CASES[Cases]
        end
        
        subgraph "Law Firm B"
            FIRM_B_USERS[Users]
            FIRM_B_CASES[Cases]
        end
        
        subgraph "Individual Users"
            IND_USERS[Pro Se Litigants]
        end
    end
    
    subgraph "Shared Services"
        AUTH_SVC[Authentication]
        BILLING[Billing Engine]
        AUDIT[Audit Logs]
    end
    
    subgraph "Database Schema"
        TENANT_TABLE[(tenant_id)]
        USER_TABLE[(users<br/>FK: tenant_id)]
        CASE_TABLE[(cases<br/>FK: tenant_id)]
    end
    
    FIRM_A_USERS --> AUTH_SVC
    FIRM_B_USERS --> AUTH_SVC
    IND_USERS --> AUTH_SVC
    
    AUTH_SVC --> USER_TABLE
    
    FIRM_A_CASES --> CASE_TABLE
    FIRM_B_CASES --> CASE_TABLE
    
    CASE_TABLE --> TENANT_TABLE
    USER_TABLE --> TENANT_TABLE
    
    AUTH_SVC --> AUDIT
    BILLING --> AUDIT
    
    style TENANT_TABLE fill:#ea4335,color:#fff
    style AUTH_SVC fill:#4285f4,color:#fff
```

### Deployment Pipeline

```mermaid
graph LR
    subgraph "Development"
        LOCAL[Local Dev]
        GIT[Git Commit]
    end
    
    subgraph "CI/CD - GitHub Actions"
        BUILD[Build & Test]
        LINT[Lint & Type Check]
        SECURITY[Security Scan]
    end
    
    subgraph "Staging Environment"
        STAGE_DEPLOY[Deploy to Staging]
        E2E[E2E Tests]
        REVIEW[Stakeholder Review]
    end
    
    subgraph "Production - GCP"
        PROD_BUILD[Production Build]
        DEPLOY[Deploy to Cloud Run]
        CDN_PURGE[Purge CDN Cache]
        MONITOR[Initialize Monitoring]
    end
    
    subgraph "Observability"
        LOGS[Cloud Logging]
        METRICS[Cloud Monitoring]
        TRACES[Cloud Trace]
        ALERTS[Alerting]
    end
    
    LOCAL --> GIT
    GIT --> BUILD
    BUILD --> LINT
    LINT --> SECURITY
    
    SECURITY --> STAGE_DEPLOY
    STAGE_DEPLOY --> E2E
    E2E --> REVIEW
    
    REVIEW -->|Approved| PROD_BUILD
    PROD_BUILD --> DEPLOY
    DEPLOY --> CDN_PURGE
    CDN_PURGE --> MONITOR
    
    DEPLOY --> LOGS
    DEPLOY --> METRICS
    DEPLOY --> TRACES
    METRICS --> ALERTS
    
    style DEPLOY fill:#34a853,color:#fff
    style ALERTS fill:#ea4335,color:#fff
```

---

## Security Considerations

### Security Architecture

```mermaid
graph TB
    subgraph "Security Layers"
        subgraph "Network Security"
            WAF[Web Application Firewall]
            DDoS[DDoS Protection]
            TLS[TLS 1.3 Encryption]
        end
        
        subgraph "Application Security"
            AUTH[OAuth 2.0 + JWT]
            RBAC[Role-Based Access Control]
            CSRF[CSRF Protection]
            XSS[XSS Prevention]
        end
        
        subgraph "Data Security"
            ENCRYPT_REST[Encryption at Rest<br/>AES-256]
            ENCRYPT_TRANS[Encryption in Transit<br/>TLS 1.3]
            PII[PII Redaction]
            BACKUP[Encrypted Backups]
        end
        
        subgraph "API Security"
            KEY_VAULT[Secret Manager]
            RATE_LIMIT[Rate Limiting]
            API_AUTH[API Key Rotation]
        end
        
        subgraph "Compliance"
            AUDIT_LOG[Audit Logging]
            GDPR[GDPR Compliance]
            HIPAA[HIPAA Compliance]
            SOC2[SOC 2 Type II]
        end
    end
    
    WAF --> AUTH
    AUTH --> RBAC
    RBAC --> ENCRYPT_REST
    
    KEY_VAULT --> API_AUTH
    RATE_LIMIT --> AUDIT_LOG
    
    ENCRYPT_REST --> BACKUP
    PII --> AUDIT_LOG
    
    style WAF fill:#ea4335,color:#fff
    style ENCRYPT_REST fill:#4285f4,color:#fff
    style AUDIT_LOG fill:#34a853,color:#fff
```

### Data Privacy Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant PII Service
    participant AI
    participant Database
    
    User->>Frontend: Submit sensitive case data
    Frontend->>Backend: Encrypted HTTPS request
    
    Backend->>PII Service: Detect & redact PII
    Note over PII Service: Identifies:<br/>- SSN<br/>- Names<br/>- Addresses<br/>- Medical info
    
    PII Service-->>Backend: Redacted data + metadata
    
    Backend->>Database: Store encrypted data
    Note over Database: AES-256 encryption at rest
    
    Backend->>AI: Send redacted data
    AI-->>Backend: Analysis results
    
    Backend->>PII Service: Re-insert PII for display
    PII Service-->>Backend: Full context restored
    
    Backend-->>Frontend: Encrypted response
    Frontend-->>User: Display results
    
    Note over User,Database: Zero-knowledge architecture<br/>AI never sees raw PII
```

---

## Deployment Strategy

### Geographic Distribution

```mermaid
graph TB
    subgraph "Global CDN - CloudFlare"
        NA_EDGE[North America Edge]
        EU_EDGE[Europe Edge]
        ASIA_EDGE[Asia Edge]
    end
    
    subgraph "GCP Regions"
        US_CENTRAL[us-central1<br/>Primary]
        US_EAST[us-east1<br/>Backup]
        EU_WEST[europe-west1<br/>GDPR]
    end
    
    subgraph "Data Centers"
        US_DB[(Primary DB<br/>Iowa)]
        US_REPLICA[(Replica DB<br/>Virginia)]
        EU_DB[(EU DB<br/>Belgium)]
    end
    
    NA_EDGE --> US_CENTRAL
    EU_EDGE --> EU_WEST
    ASIA_EDGE --> US_CENTRAL
    
    US_CENTRAL --> US_DB
    US_EAST --> US_REPLICA
    EU_WEST --> EU_DB
    
    US_DB -.->|Replication| US_REPLICA
    US_DB -.->|Cross-region backup| EU_DB
    
    style US_CENTRAL fill:#34a853,color:#fff
    style US_DB fill:#4285f4,color:#fff
```

### Scaling Strategy

```mermaid
graph LR
    subgraph "Auto-Scaling Rules"
        CPU[CPU > 70%]
        MEM[Memory > 80%]
        REQ[Requests > 1000/min]
    end
    
    subgraph "Cloud Run Instances"
        MIN[Min: 1 instance]
        MAX[Max: 100 instances]
        
        INST1[Instance 1]
        INST2[Instance 2]
        INST_N[Instance N]
    end
    
    subgraph "Load Balancer"
        LB[Cloud Load Balancer<br/>Round Robin]
    end
    
    CPU --> LB
    MEM --> LB
    REQ --> LB
    
    LB --> INST1
    LB --> INST2
    LB --> INST_N
    
    style LB fill:#4285f4,color:#fff
    style MAX fill:#34a853,color:#fff
```

---

## Performance Metrics

### Target SLAs

| Metric | Target | Current MVP |
|--------|--------|-------------|
| **Page Load Time** | < 2s | ~1.5s |
| **API Response Time** | < 500ms | ~300ms (direct) |
| **AI Analysis** | < 5s | 3-8s |
| **Live Session Latency** | < 200ms | ~150ms |
| **Uptime** | 99.9% | N/A (local) |

### Monitoring Dashboard

```mermaid
graph TB
    subgraph "Metrics Collection"
        APP_METRICS[Application Metrics]
        INFRA_METRICS[Infrastructure Metrics]
        USER_METRICS[User Analytics]
    end
    
    subgraph "Visualization"
        GRAFANA[Grafana Dashboard]
        CLOUD_MON[Cloud Monitoring]
    end
    
    subgraph "Alerts"
        PAGER[PagerDuty]
        SLACK[Slack Notifications]
        EMAIL[Email Alerts]
    end
    
    APP_METRICS --> GRAFANA
    INFRA_METRICS --> CLOUD_MON
    USER_METRICS --> GRAFANA
    
    GRAFANA -.->|Threshold breach| PAGER
    CLOUD_MON -.->|Critical alert| PAGER
    GRAFANA -.->|Warning| SLACK
    CLOUD_MON -.->|Info| EMAIL
    
    style PAGER fill:#ea4335,color:#fff
    style GRAFANA fill:#ff9900,color:#fff
```

---

## Migration Path: MVP to Production

```mermaid
gantt
    title JusticeAlly Production Roadmap
    dateFormat YYYY-MM-DD
    
    section Phase 1: Security
    API Key Migration           :2026-02-01, 7d
    Backend API Setup          :2026-02-05, 14d
    Authentication & Auth      :2026-02-12, 14d
    
    section Phase 2: Data Layer
    Database Schema Design     :2026-02-19, 7d
    Data Migration Tools       :2026-02-26, 14d
    Backup & Recovery          :2026-03-05, 7d
    
    section Phase 3: Scale
    Load Balancing            :2026-03-12, 7d
    Caching Layer             :2026-03-15, 10d
    CDN Integration           :2026-03-20, 7d
    
    section Phase 4: Enterprise
    Multi-tenancy             :2026-03-27, 21d
    RBAC & Audit Logs         :2026-04-10, 14d
    Compliance Certification  :2026-04-17, 30d
    
    section Phase 5: Launch
    Beta Testing              :2026-05-01, 21d
    Production Deployment     :2026-05-22, 7d
    Post-Launch Monitoring    :2026-05-29, 14d
```

---

## Technology Decisions

### Why These Choices?

| Technology | Rationale |
|------------|-----------|
| **React 19** | Latest features, concurrent rendering, improved performance |
| **TypeScript** | Type safety critical for legal applications, better DX |
| **Vite** | Fastest build tool, instant HMR, optimized for modern browsers |
| **Google Gemini** | Best-in-class multimodal AI, native JSON output, cost-effective |
| **LocalStorage (MVP)** | Rapid prototyping, zero infrastructure, privacy-first |
| **Cloud Run (Prod)** | Serverless, auto-scaling, pay-per-use, easy deployment |
| **PostgreSQL (Prod)** | ACID compliance, proven for legal tech, excellent JSON support |

---

## Architecture Evolution

```mermaid
graph LR
    MVP[MVP Architecture<br/>Client-only<br/>LocalStorage] -->|Phase 1| BACKEND[Add Backend<br/>API Proxy<br/>Authentication]
    
    BACKEND -->|Phase 2| DATA[Add Data Layer<br/>PostgreSQL<br/>Cloud Storage]
    
    DATA -->|Phase 3| SCALE[Scale Infrastructure<br/>Load Balancing<br/>CDN<br/>Caching]
    
    SCALE -->|Phase 4| ENTERPRISE[Enterprise Features<br/>Multi-tenancy<br/>RBAC<br/>Audit Logs]
    
    ENTERPRISE -->|Phase 5| PROD[Production Launch<br/>99.9% SLA<br/>Full Compliance<br/>Global Distribution]
    
    style MVP fill:#fbbc04,color:#000
    style BACKEND fill:#4285f4,color:#fff
    style PROD fill:#34a853,color:#fff
```

---

## Conclusion

JusticeAlly's architecture is designed for rapid iteration in the MVP phase while maintaining a clear path to enterprise-grade production deployment. The modular design allows for incremental improvements without requiring complete rewrites, ensuring continuous delivery of value to users while building toward a scalable, secure, and compliant legal tech platform.
