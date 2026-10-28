# SyncUp — Project Context & System Architecture

> **Document Version:** 1.0.0  
> **Last Updated:** October 2026  
> **Project Root:** `c:\Users\drbac\OneDrive\Desktop\Popat`

---

## 1. Executive Summary & Identity

**SyncUp** is an interaction-first, voice-driven **Autonomous Problem Intake & Incident Triage Agent**. Its core mission is to bridge frontline operational emergencies (warehouse floor supervisors, on-call DevOps engineers, charge nurses) and executive decision-makers by turning unstructured voice reports into verified, structured incident tickets in real-time.

SyncUp is **not** a generic chatbot; it is a specialized voice intake cockpit designed for high-stakes operational environments where hands-free communication and rapid epistemic categorization (Facts, Unknowns, Hypotheses) are required.

---

## 2. Core Architecture & Technology Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Runtime & Framework** | HTML5, React 18, Babel Standalone | Runs directly in modern browsers without complex build tooling or bundling steps. |
| **Aesthetic System** | Vanilla CSS3, Glassmorphism, 60-30-10 Rule | • **60% Background:** `#030407` (Deep Obsidian Void & frosted glass)<br>• **30% Secondary:** `#1558C9` (Electric Cobalt Blue headers, borders, bubbles)<br>• **10% Accent:** `#D4FF24` (High-Voltage Electric Lime indicators, live pulses, P1 status) |
| **Layout Constraint** | Strict `100vh` Cockpit Lock | `html, body { height: 100vh; overflow: hidden; }` — Zero outer page scrollbars. Only internal transcript and claim containers scroll. |
| **Canvas UI Patterns** | HTML5 2D Canvas Engine | • **3D Metallic Horizon AI Sphere (`CanvasFluidOrb`, ~190px):** Specular satin pearl dome, dynamic liquid cobalt/lime equator, Fresnel rim light, and reactive shockwaves.<br>• **`CanvasParticleField`:** Interactive background starfield with cursor displacement physics. |
| **Inspira UI Patterns** | CSS Keyframe VFX | Ambient diagonal falling meteors, card spotlights, and glowing perimeter accents. |
| **Voice Engine** | Web Speech API | Dual-channel: `SpeechRecognition` (STT) + `SpeechSynthesis` (TTS) connected via continuous hands-free turn-taking. |
| **Decision Intelligence** | `decisionsApi.js` & Socratic Engine | Epistemic claim extraction, urgency scoring (1–5), detail convergence meter, and company SOP mapping. |

---

## 3. Screen Layout & Component Hierarchy

The interface is structured as a non-scrolling split cockpit layout:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  HEADER: Brand (SyncUp) | Hands-Free Badge (🟢 AUTO-AUDIO ON) | Sound Toggle (🔊 ON)  │
├───────────────────────────────────────────┬────────────────────────────────────────────┤
│  LEFT COLUMN: VOICE AGENT & TRANSCRIPT    │  RIGHT COLUMN: TICKET & PROBLEM DOSSIER    │
│  ┌─────────────────────────────────────┐  │  ┌──────────────────────────────────────┐  │
│  │ Voice Agent Stage (Top ~200px)       │  │  │ Ticket Header: TICKET #INC-8492      │  │
│  │ • 190px 3D Metallic Horizon Sphere   │  │  │ • P1 - CRITICAL ESCALATION strobe    │  │
│  │ • Live Audio Spectrum Visualizer    │  │  │ • Scenario Tabs: Warehouse|FinTech|ICU│  │
│  │ • Caller ID & Live Call Status Pill  │  │  └──────────────────────────────────────┘  │
│  └─────────────────────────────────────┘  │  ┌──────────────────────────────────────┐  │
│  ┌─────────────────────────────────────┐  │  │ Caller Card: Marcus Vance (Dallas #4)│  │
│  │ Live Call Transcript Stream (Middle)│  │  │ Incident Headline & Subline          │  │
│  │ • Placed DIRECTLY under Voice Agent │  │  └──────────────────────────────────────┘  │
│  │ • Intake Agent vs. Reporter dialogue│  │  ┌──────────────────────────────────────┐  │
│  │ • Internal smooth scroll            │  │  │ Metrics: 96% Detail | Urgency 5/5    │  │
│  └─────────────────────────────────────┘  │  └──────────────────────────────────────┘  │
│  ┌─────────────────────────────────────┐  │  ┌──────────────────────────────────────┐  │
│  │ Hands-Free Command Dock (Bottom)    │  │  │ Epistemic Triad Stream:              │  │
│  │ • Mic Toggle (pulsing green glow)   │  │  │  🟢 Verified Observed Facts          │  │
│  │ • Text fallback input & Send button │  │  │  🔴 Critical Unknowns (Triage gaps)  │  │
│  └─────────────────────────────────────┘  │  │  🟡 Caller Hypotheses (Theories)     │  │
│                                           │  └──────────────────────────────────────┘  │
│                                           │  ┌──────────────────────────────────────┐  │
│                                           │  │ Matched SOP: SOP-WMS-402 Rollback    │  │
│                                           │  │ 🚀 Dispatch Ticket CTA Button        │  │
│                                           │  └──────────────────────────────────────┘  │
└───────────────────────────────────────────┴────────────────────────────────────────────┘
```

---

## 4. Continuous Hands-Free Voice Architecture

### The Problem It Solves
Frontline workers cannot keep tapping a microphone button between operational tasks. SyncUp implements a continuous, conversational turn-taking loop:

```
               ┌──────────────────────────────────────┐
               │         User Speaks Into Mic         │
               └──────────────────┬───────────────────┘
                                  ▼
               ┌──────────────────────────────────────┐
               │    SpeechRecognition Transcribes     │
               └──────────────────┬───────────────────┘
                                  ▼
               ┌──────────────────────────────────────┐
               │  Triage Engine Updates Claims & SOP  │
               └──────────────────┬───────────────────┘
                                  ▼
               ┌──────────────────────────────────────┐
               │   SyncUp Speaks Socratic Response    │
               │   (Mic auto-paused to prevent echo)  │
               └──────────────────┬───────────────────┘
                                  ▼
               ┌──────────────────────────────────────┐
               │   utterance.onend Fires              │
               │   ➜ recognition.start() AUTO-CALLED  │
               └──────────────────┬───────────────────┘
                                  ▼
               ┌──────────────────────────────────────┐
               │ Mic Resumes Listening Automatically  │
               │ (No button clicking needed)          │
               └──────────────────────────────────────┘
```

### Voice Selection
* **No UI dropdown clutter:** The app automatically queries `speechSynthesis.getVoices()` and selects the most natural/neural voice available (e.g., `Google UK English Female`, `Samantha`, `Victoria`, `Jenny`, `Serena`).

### Browser Microphone Permission Note
* **Local `file:///` limitations:** Browsers (Chrome, Edge, Brave) do not allow persistent microphone permissions on local `file://` URLs. 
* **Production / Local Server:** Running via `http://localhost` (e.g. `python -m http.server 3000` or `npx serve .`) allows the browser to save "Always Allow" permanently after the first prompt.

---

## 5. Enterprise Incident Scenarios

The system comes preloaded with three real-world enterprise operational crisis scenarios:

### 1. Warehouse Logistics — Scanner Freeze (`INC-8492`)
* **Reporter:** Marcus Vance, Floor Operations Supervisor, Dallas DC #4 (Night Shift).
* **Problem:** All 24 handheld barcode scanners freeze on QR prefix `PR-` with error `MEM_ALLOC_FAIL` 2 hours before freight departure.
* **Matched SOP:** `SOP-WMS-402: Emergency Rollback Procedure for Zebra TC57 Terminals`.
* **Impact:** Critical ($18,500/hr delay penalty • 420 shipments at risk).

### 2. FinTech Platform — Checkout 504 Spikes (`INC-7721`)
* **Reporter:** Siddharth Rao, Lead Merchant Support Engineer (European Trading Window).
* **Problem:** 30% of checkout requests failing with HTTP 504 timeouts on Apple Pay tokens via Frankfurt gateway.
* **Matched SOP:** `SOP-PAY-118: Cross-Region Gateway Failover for EU-Central-1`.
* **Impact:** Tier-1 SLA Penalty ($45,000/hr • €230,000 carts at risk).

### 3. Hospital ICU — Telemetry EMR Sync Lag (`INC-9104`)
* **Reporter:** Nurse Elena Rostova, Charge Nurse, ICU Ward 4.
* **Problem:** Bedside vital signs failing to replicate to central telemetry monitors for beds 401–408.
* **Matched SOP:** `SOP-CLIN-009: ICU Telemetry Network Redundancy Protocol`.
* **Impact:** Level 1 Clinical Alert (8 ICU beds under continuous monitoring).

---

## 6. Project File Structure

```
c:\Users\drbac\OneDrive\Desktop\Popat\
├── index.html          # Main HTML entrypoint with React 18 & Canvas UI components
├── styles.css          # Glassmorphic styles, 60-30-10 color tokens, animations
├── scenarios.js        # Enterprise scenarios, Socratic turns, and SOP fixtures
├── decisionsApi.js     # OpenAI Decisions API client & gpt-6-luna simulator
├── app.jsx             # Component modularization reference
├── README.md           # High-level product overview
└── CONTEXT.md          # Comprehensive technical context & system specifications (this file)
```

---

## 7. Development Guidelines & Invariants

When modifying or extending this codebase, adhere to these strict invariants:

1. **Maintain the 60-30-10 Palette:**
   * 60% `#030407` (Dominant void and dark frosted glass).
   * 30% `#1558C9` (Secondary electric cobalt blue for headers, borders, badges).
   * 10% `#D4FF24` (High-voltage electric lime for active pulses, P1 alerts, recording glow).
2. **Strict Non-Scrolling Lock:**
   * The page body must never have an outer scrollbar (`overflow: hidden; height: 100vh;`).
   * Only internal scroll containers (`.core-chat-stream`, `.epistemic-stream-deck`) scroll.
3. **Voice-First Positioning:**
   * The 3D Metallic Horizon AI Sphere sits prominently at the top of the interaction pane.
   * The conversation transcript sits **directly under** the Voice Agent.
4. **Preserve Hands-Free Continuous Loop:**
   * Do not remove the `utterance.onend -> recognition.start()` audio loop. Frontline workers rely on zero-click conversational turn-taking.
5. **Avoid Nested Card Soup:**
   * Avoid putting cards inside cards inside cards. Maintain clean, spacious frosted-glass panels with clear typographic contrast.
