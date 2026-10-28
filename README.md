# SyncUp — Autonomous Problem Intake Agent
*Closing the Gap Between Frontline Teams and Executive Decision-Makers*

SyncUp is an interaction-first autonomous Problem Intake Agent combining:
1. **Canvas UI (`canvasui.dev`)**: Live 2D/3D Canvas rendering engine, fluid plasma physics, interactive Force Field shockwaves (Pattern #60), and reactive pointer displacement mesh (Pattern #75).
2. **Inspira UI (`inspira-ui.com`)**: BorderBeam laser sweep, CardSpotlight cursor tracking, falling Meteors, and ShinyButton reflections.
3. **OpenAI Voice-to-Voice Realtime (`gpt-4o-realtime-preview`) & Web Speech**: Voice synthesis output and microphone STT input.
4. **OpenAI Decisions API (`/v1/decisions` with `gpt-6-luna`)**: Deterministic triage, epistemic classification (Facts, Hypotheses, Blindspots), and automated queue routing.
5. **Strict 60-30-10 Color Architecture**: 60% Obsidian Void (`#030407`), 30% Electric Cobalt Blue (`#1558C9`), 10% High-Voltage Electric Lime (`#D4FF24`).

---

## 🚀 Instant Quickstart (Zero-Install)

No Node.js or complex build setup required! The application runs directly in any modern browser:

1. Double-click **[`index.html`](./index.html)** or open it in Google Chrome, Microsoft Edge, Brave, or Firefox.
2. The interaction-first viewport will load immediately with the Canvas AI Orb, Voice & Chat, and Live Dossier.

---

## 🎨 UI Architecture: Canvas UI & Inspira UI

### 1. Canvas UI Patterns (`canvas-ui-design-patterns`)
- **`CanvasFluidOrb` (Patterns #60, #63)**: 60 FPS HTML5 Canvas engine rendering parametric harmonic outer rings, audio-reactive frequency bars, and orbiting micro-particles with momentum.
- **Force Field Detonation**: Clicking or tapping the AI Orb detonates an expanding chromatic shockwave ring in neon mint or laser ruby.
- **`CanvasParticleField` (Pattern #75)**: Background constellation canvas with pointer displacement physics where moving the cursor organically pushes nearby particles away.
- **Pointer Event Pass-Through**: Overlay canvas elements maintain `pointer-events: none` to guarantee 100% native DOM interactivity.

### 2. Inspira UI Components (`inspira-ui`)
- **`BorderBeam`**: Dual-tone laser beam sweep (`#00F59B` to `#FF2E55`) tracing the perimeter of the 65% interaction window.
- **`CardSpotlight`**: Cursor-following radial glow across both the interaction hero and the executive dossier.
- **`Meteors`**: Ambient diagonal particle streaks in the obsidian glass background.
- **`ShinyButton`**: Angled 60-degree shimmer sweep on primary escalation actions and suggestion chips.

---

## 🌟 Key Features

### 1. Frontline Voice Intake Portal
- **48-Band Web Audio Waveform Visualizer**: Real-time harmonic audio waves that animate dynamically based on whether the agent or the worker is speaking.
- **Socratic Conversational Feed**: Probing questions that isolate root causes, timestamps, and blast radius without interrogating the user.
- **Audio Feedback**: Utilizes browser speech synthesis and voice activity simulation.

### 2. Executive Problem Brief (Decision-Maker View)
- **The Epistemic Triad**:
  - 🟢 **Verified Observed Facts**: Ground reality statements with confidence scores.
  - 🟡 **User Hypotheses & Assumptions**: Unverified hunches clearly flagged to prevent false engineering rabbit holes.
  - 🔵 **Critical Unknowns**: Actionable gaps that decision-makers must investigate first.
- **Urgency Metric Rubric**: Level 1 to 5 severity scoring powered by `gpt-6-luna`.
- **Intake Convergence Meter**: Percentage readiness indicator evaluated via boolean predicates.
- **Company Knowledge Grounding**: Semantic matching against internal SOPs and historical incidents.

### 3. 1-Click Action & Routing Dispatch
- **Push to Jira**: Formatted issue payload mapped to the target department queue (e.g. `IT_Hardware_Infrastructure`).
- **Push to Linear**: Syncs urgent cycle tickets.
- **Alert Slack**: Formatted incident war room alert block.
- **Export Brief**: 1-click Markdown download.

### 4. OpenAI Decisions API Live Inspector
- Live inspector tab displaying the exact `POST https://api.openai.com/v1/decisions` payload with `model: "gpt-6-luna"`.
- Displays typed machine outputs across all 3 Decisions API primitives:
  - `predicate`: Boolean / probability evaluations (`sufficient_detail_collected`)
  - `choice`: Discrete classification (`epistemic_category`, `target_department`)
  - `score`: Rubric mapping (`urgency_score`)

---

## 🏢 Preloaded Enterprise Scenarios

Use the dropdown in the header to switch between realistic scenarios:
- **Warehouse Logistics**: Zone B Handheld Barcode Scanner Freeze (MEM_ALLOC_FAIL error).
- **FinTech Platform**: European Payment Gateway 504 Timeouts on Apple Pay tokens.
- **Healthcare / Hospital**: Bedside ICU Nurse Tablet Vital Signs Sync Lag.

---

## ⚙️ Configuration & Live API Keys

Click the **Gear icon (⚙️)** in the top navigation bar to:
- Enter your live OpenAI API key (`sk-...`) for direct calls to `POST /v1/decisions` and Realtime Voice.
- Toggle the built-in **High-Fidelity Simulator** for instant offline demonstrations.
