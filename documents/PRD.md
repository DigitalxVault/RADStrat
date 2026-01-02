# PRD.md — Radio Readback STT Trainer (Local, React + Node, Dual Realtime STT)

**Owner:** You  
**Version:** 1.0 (Final)  
**Last updated:** 2025-12-30  
**Run mode:** Local only (developer machine)

---

## 1. Overview

### 1.1 Problem
Players learning proper radio communications need a simple practice tool that:
- Presents scenario-based questions with multiple-choice answers
- Lets them speak the chosen answer using push-to-talk
- Shows **realtime speech-to-text** as they speak
- Scores performance using a consistent **Quality Matrix**:
  - **Clarity**
  - **Pace**
  - **Structure** (must follow radio terminology structure)

You also want to compare **two STT providers side-by-side** (OpenAI and ElevenLabs) on every attempt, including transcript differences, scoring breakdown, and estimated cost.

### 1.2 Solution
A local web app with a single-page UI:
1. Displays **1 question** at a time (top)
2. Displays **4 choices** below the question
3. Player selects a choice, then presses **Talk** to start speaking and **End** to stop
4. During speaking, the app streams audio to **OpenAI + ElevenLabs simultaneously** and shows **realtime transcript updates** in two side-by-side panels
5. After End, the app shows per-provider:
   - final transcript
   - **Clarity / Pace / Structure** (0–100 each) + breakdown
   - **estimated cost per attempt**
   - overall score (weighted)
6. Shows whether the selected answer is **Correct / Incorrect**
7. **Next Question** advances to the next bank item

---

## 2. Goals and Non-Goals

### 2.1 Goals (MVP)
- Local-first: easy to run on a laptop/desktop.
- Stable realtime experience: transcripts update as user speaks.
- Side-by-side comparison for OpenAI and ElevenLabs on every attempt.
- Deterministic scoring (repeatable) with explicit rubric.
- No login, no database, no admin UI.
- Immediate feedback after each question.

### 2.2 Non-Goals (MVP)
- No user accounts or saved histories.
- No online hosting requirement.
- No leaderboards or analytics dashboards.
- No large content management system for questions.

---

## 3. Target Users
- **Players** learning to speak radio communications properly.
- Single-user, local session usage.

---

## 4. Tech Stack

### 4.1 Chosen framework
- **Frontend:** React + TypeScript + Vite
- **Backend:** Node.js + Express
- **Realtime transport:** Provider-native realtime (direct) OR local proxy mode

### 4.2 Rationale
- React: stable UI state, fast iteration, clean component architecture.
- Node server: keeps API keys secret and can mint short-lived tokens; can also proxy realtime if needed.

---

## 5. UX and UI Requirements

### 5.1 Page layout (single screen)

**A) Top Panel — Current Question**
- Displays scenario + prompt text
- Displays question index (e.g., “Question 3 / 10”)

**B) Choices Panel (immediately below)**
- Exactly **4 selectable options** (A–D)
- Selected option clearly highlighted

**C) Push-to-talk controls**
- Buttons:
  - **Talk** (start capture + realtime streaming)
  - **End** (stop capture + finalize)
- Recording timer
- Provider status indicators (Connecting / Listening / Error / Completed)

**D) Results panel (below controls)**
Two columns side-by-side:
- **OpenAI** (left)
- **ElevenLabs** (right)

Each column displays:
- Realtime transcript (updates while speaking)
- Final transcript (after End)
- Scoring breakdown (Clarity / Pace / Structure + overall)
- Cost spend per speech (estimate or usage-based)

**E) Summary + Next**
- Correctness indicator: selected answer correct/incorrect
- “Next Question” button at bottom

### 5.2 Interaction rules
- **Talk** is disabled until:
  - a bank is loaded AND
  - a choice is selected
- While recording:
  - disable changing the selected answer (default ON)
- **End** finalizes scoring automatically (no separate Submit in MVP)

---

## 6. Core Functional Requirements

### 6.1 Question Bank
- Load from JSON (paste into textarea or upload file)
- Stored in memory for the session
- No persistence required

**Global rule:** Receiver call sign is **always “ATC”** (standardized across the app).

### 6.2 Dual realtime STT
- On **Talk**:
  - start mic capture
  - create sessions for **OpenAI** and **ElevenLabs**
  - stream audio chunks to both simultaneously
  - display realtime transcript updates in each provider panel
- On **End**:
  - stop mic capture
  - finalize both sessions
  - compute scoring for each provider using its final transcript + timing events
  - render breakdown and costs

### 6.3 Scoring output requirements (per provider)
After End, each provider panel must show:
- **Clarity** score (0–100)
- **Pace** score (0–100)
- **Structure** score (0–100)
- **Overall** score (0–100), weighted:
  - Clarity 40%
  - Pace 30%
  - Structure 30%

Breakdown must include:
- filler words list + count (uh/um/mm/er/ah…)
- WPM
- pause stats (count + longest pause)
- structure checklist + violations

### 6.4 Correctness indicator
- Show ✅ Correct or ❌ Incorrect based on `correctIndex` vs selected index
- Display correct option text

### 6.5 Cost per attempt (per provider)
Display cost per attempt using one of:
1) provider usage returned (if available), else  
2) estimate = audioDurationSeconds × configuredRatePerSecond

Rates must be configurable (see **App Configuration**).

---

## 7. Radio Terminology Structure (Structure Metric Spec)

### 7.1 Standard R/T structure (required order)
1. **Receiver’s Call Sign** → fixed to `ATC`
2. **Sender’s Call Sign** → who is speaking (e.g., “Bowser One”)
3. **Intent / Request / Report**
4. **Additional Info** (location/route/status as needed)
5. **Standard Closing Phrase** → “Over” (awaiting reply) or “Out” (ending transmission)

### 7.2 Structure modes
Each question has `structureMode`:
- `full` (default):
  - Must include Receiver (`ATC`), Sender, Intent/Report, Closing
  - Additional info optional unless `expectedKeywords` indicates it’s required
- `ack_short`:
  - May omit receiver/sender (e.g., “Holding short. Over.”)
  - Must include intent/report and closing
- `clarify_request`:
  - Must include receiver (`ATC`) and a clarity request phrase (e.g., “Say again”)
  - Sender optional

### 7.3 Structure scoring rubric (deterministic, 0–100)
Start at 100 and subtract penalties.

**Presence (by mode)**
- `full`:
  - Missing “ATC” (receiver): -20
  - Missing sender (any known sender token or pattern): -20
  - Missing intent/report: -30
  - Missing closing (“over” or “out”): -20
- `ack_short`:
  - Missing intent/report: -50
  - Missing closing: -50
- `clarify_request`:
  - Missing “ATC”: -30
  - Missing “say again” / equivalent: -40
  - Missing closing: -30

**Order / placement**
- Receiver appears after sender: -10
- Closing not near end: -10

**Phrase correctness**
- Closing not “over” or “out”: -10
- Multiple closings: -5

**Additional info (when expected)**
- If `expectedKeywords` provided and none found: -10

Clamp final score to 0–100.

---

## 8. Clarity and Pace Scoring

### 8.1 Clarity (0–100)
Inputs:
- Provider final transcript
- `expectedSpokenAnswer` (preferred) or selected option text
- Filler word count

Rules:
- Normalize transcript + expected:
  - lowercase
  - remove punctuation except numbers/letters
  - collapse whitespace
- Similarity metric (deterministic):
  - normalized Levenshtein similarity or Jaro-Winkler
- Filler penalty:
  - -5 per filler word (cap -25)

Formula (default):
- `clarity = clamp(similarity*100 - min(25, fillerCount*5), 0, 100)`

### 8.2 Pace (0–100)
Inputs:
- Word timing events (preferred)
- Fallback: audio duration + word count

Derived:
- WPM = words / (durationSeconds/60)
- Pauses = gaps between consecutive word end → next word start
  - pause threshold: 700ms
  - long pause threshold: 1500ms

Targets (configurable):
- Ideal WPM: 120–160
- Acceptable WPM: 100–180

Scoring (default):
- Start at 100
- WPM penalty if outside ideal band (cap -40)
- Pause penalties:
  - -3 per pause >700ms (cap -30)
  - -5 per long pause >1500ms (cap -30)
Clamp 0–100.

### 8.3 Overall score
`overall = round(0.40*clarity + 0.30*pace + 0.30*structure)`

---

## 9. Realtime Transcript Requirements

### 9.1 Realtime text iteration
While speaking, each provider panel must show:
- continuously updating partial text (“interim”)
- a committed transcript buffer that grows over time

### 9.2 Realtime live transcript
- Realtime view must visibly update at least every 0.5–2 seconds under normal conditions
- Show a status indicator (“Listening…”) and handle reconnection errors clearly

### 9.3 Finalization
On End:
- stop audio streaming
- wait for provider “final transcript” event (or timeout then use last committed text)
- freeze transcript areas and compute metrics

---

## 10. System Architecture

### 10.1 Components
- **Web app (React)**
  - session/question flow
  - audio capture
  - realtime transcript rendering
  - scoring computations + UI
- **Local server (Node/Express)**
  - stores secrets
  - mints short-lived tokens for provider connections
  - optional: proxies realtime sessions

### 10.2 Realtime modes (feature flag)
- `REALTIME_MODE=direct` (preferred):
  - browser streams directly to providers using short-lived tokens minted by Node
- `REALTIME_MODE=proxy` (fallback):
  - browser streams to local Node WS, Node forwards to providers

Acceptance:
- MVP must support `direct`
- `proxy` is recommended for stability if provider direct mode is flaky in some environments

---

## 11. API Requirements (Node/Express)

### 11.1 Required endpoints
- `GET /api/health`  
  Returns: `{ ok: true, providers: { openai: boolean, elevenlabs: boolean } }`

- `POST /api/token/openai`  
  Returns ephemeral credentials needed for client-side realtime session.

- `POST /api/token/elevenlabs`  
  Returns a single-use token for client-side websocket connection.

### 11.2 Optional endpoints (fallback non-realtime)
- `POST /api/transcribe/openai`
- `POST /api/transcribe/elevenlabs`  
Accept a short audio file upload and return transcript + optional timings.

---

## 12. Data Model

### 12.1 Types (frontend)
```ts
type StructureMode = "full" | "ack_short" | "clarify_request";

type Question = {
  id: string;
  prompt: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  expectedSpokenAnswer?: string;       // preferred for clarity scoring
  structureMode?: StructureMode;       // default: "full"
  expectedKeywords?: string[];         // optional, helps structure/additional info
};

type ProviderResult = {
  interimText: string;                 // realtime updates
  committedText: string;               // grows during speech
  finalText: string;                   // after End
  words?: { text: string; startMs: number; endMs: number }[];
  durationMs: number;
  fillers: { word: string; count: number }[];
  metrics: { clarity: number; pace: number; structure: number; overall: number };
  cost: { currency: string; amount: number; method: "usage" | "estimate" };
  errors?: string[];
};
```

---

## 13. App Configuration (Non-Secret Rules Config)

### 13.1 Purpose
The app must support a non-secret, editable configuration file for rules that affect scoring and UI labels (without changing TypeScript code).

### 13.2 Config file location (required)
Create:
```
apps/web/src/data/app_config.json
```

### 13.3 Required config schema (MVP)
```json
{
  "receiverCallsignDefault": "ATC",
  "acceptedReceiverTokens": ["atc"]
}
```

### 13.4 Config export module (required)
Create:
```
apps/web/src/config.ts
```

**Responsibilities:**
- Import `app_config.json`
- Export as `APP_CONFIG` for UI + scoring usage

### 13.5 TypeScript JSON import requirement (required)
In `apps/web/tsconfig.json`, ensure `compilerOptions` includes:
```json
{
  "resolveJsonModule": true,
  "esModuleInterop": true
}
```

### 13.6 How config affects scoring (required)
Structure scoring must use `APP_CONFIG.acceptedReceiverTokens` to validate receiver presence:
- `full`: receiver required
- `clarify_request`: receiver required
- `ack_short`: receiver optional

UI structure checklist must display receiver label using:
- `APP_CONFIG.receiverCallsignDefault` (e.g., "Receiver: ATC")

### 13.7 Acceptance criteria
Changing `app_config.json` updates:
- Receiver validation in Structure scoring
- Receiver label displayed in the UI
- No API secrets are stored in `app_config.json`

---

## 14. Codebase Structure (Monorepo)

```
radio-stt-trainer/
├── package.json
├── README.md
├── .env.example
│
├── apps/
│   ├── web/
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── main.tsx
│   │       ├── App.tsx
│   │       ├── config.ts
│   │       │
│   │       ├── components/
│   │       │   ├── BankLoader.tsx
│   │       │   ├── QuestionPanel.tsx
│   │       │   ├── ChoicesGrid.tsx
│   │       │   ├── PushToTalkControls.tsx
│   │       │   ├── ProviderComparePanels.tsx
│   │       │   ├── ProviderPanel.tsx
│   │       │   ├── ScoreBreakdown.tsx
│   │       │   └── NextQuestionButton.tsx
│   │       │
│   │       ├── audio/
│   │       │   ├── mic.ts
│   │       │   └── chunker.ts
│   │       │
│   │       ├── providers/
│   │       │   ├── types.ts
│   │       │   ├── openaiRealtime.ts
│   │       │   └── elevenlabsRealtime.ts
│   │       │
│   │       ├── scoring/
│   │       │   ├── normalize.ts
│   │       │   ├── similarity.ts
│   │       │   ├── fillers.ts
│   │       │   ├── clarity.ts
│   │       │   ├── pace.ts
│   │       │   ├── structure.ts
│   │       │   └── overall.ts
│   │       │
│   │       ├── state/
│   │       │   ├── sessionStore.ts
│   │       │   └── questionEngine.ts
│   │       │
│   │       └── data/
│   │           ├── app_config.json
│   │           └── question_bank.json
│   │
│   └── server/
│       └── src/
│           ├── index.ts
│           ├── env.ts
│           ├── routes/
│           │   ├── health.ts
│           │   ├── tokenOpenAI.ts
│           │   ├── tokenElevenLabs.ts
│           │   ├── transcribeOpenAI.ts        // optional
│           │   └── transcribeElevenLabs.ts    // optional
│           ├── middleware/
│           │   ├── rateLimit.ts
│           │   ├── cors.ts
│           │   └── errors.ts
│           └── utils/
│               ├── logger.ts
│               └── http.ts
```

---

## 15. Security Requirements

### 15.1 Secrets management
- API keys only stored on server in `.env`
- Never expose keys to client
- Token endpoints return short-lived tokens only

### 15.2 Validation and safety
- Validate bank schema before session starts (type checks + exact 4 options)
- Limit recording length (default: 30 seconds)
- Avoid logging full transcripts unless `DEBUG=true`

### 15.3 Rate limiting
- In-memory rate limiting on token endpoints (e.g., 60/min)
- If fallback file upload endpoints enabled, limit those more strictly (e.g., 30/min)

### 15.4 Common web risks
- CORS restricted to localhost origins
- No arbitrary outbound URLs (only provider endpoints)
- Do not render transcripts using unsafe HTML

---

## 16. Validation and Error Handling

### 16.1 UI validation
**Disable Talk until:**
- Bank loaded
- Selection made

**Disable Next Question until:**
- Scoring complete (or allow skip via config)

### 16.2 Provider errors
Panel-level errors must not break the whole app:
- If OpenAI fails, ElevenLabs still completes and scores
- Vice versa

### 16.3 Timeouts
- Realtime connect timeout (default: 10s) shows "Retry"
- Final transcript timeout (default: 5s after End) uses last committed text and marks "finalization timeout"

---

## 17. Logging and Monitoring (Local)

- Log provider connect/disconnect, latency, and errors in console
- Optional server logs to file (`logs/server.log`) if enabled

---

## 18. Testing Strategy

### 18.1 Unit tests (web)
Scoring functions:
- Structure modes
- Similarity/clarity
- Pause/WPM pace scoring
- Filler detection

### 18.2 Integration tests (server)
- Token endpoints return expected shapes
- Health endpoint indicates configured providers

### 18.3 Manual acceptance checklist
| Step | Expected Result |
|------|-----------------|
| Load bank | Question 1 appears |
| Choose option | Talk enabled |
| Talk | Both provider panels show interim transcript updates |
| End | Both panels show final transcript + scoring + cost |
| — | Correctness indicator appears |
| Next Question | Loads question 2 and clears UI state |

---

## 19. Deployment / Run Plan (Local)

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
# Add .env in apps/server with provider keys and config

# 3. Development mode
npm run dev  # runs server + web

# 4. Production-like local run
npm run build
npm run start
```

---

## 20. Recommended / Optional Features (Later)

- **Local persistence** (localStorage) for:
  - Last loaded bank
  - Current question index
  - Last scores (session summary)
- **Audio playback** of user recording
- **Session summary screen** (avg scores per metric and provider)
- **"Structure Coach"** suggestions highlighting missing parts
- **Additional receiver call signs** (Ground/Tower) if expanding beyond ATC
- **Third provider adapter** (plug-in interface)