import React, { useState, useEffect, useRef } from "react";
import { SCENARIOS } from "./scenarios.js";
import { DecisionsEngine, AudioVisualizerManager } from "./decisionsApi.js";

export function App() {
  // Scenario state
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);
  const scenario = SCENARIOS[selectedScenarioIndex];

  // Active view tab: 'split', 'voice', 'brief', 'telemetry'
  const [activeTab, setActiveTab] = useState("split");

  // Voice & Interview states
  const [voiceMode, setVoiceMode] = useState("idle"); // 'idle', 'listening', 'speaking'
  const [turnIndex, setTurnIndex] = useState(0);
  const [conversation, setConversation] = useState([
    {
      role: "agent",
      author: "SyncUp Socratic Agent (gpt-4o-realtime)",
      text: "Hello! I am SyncUp, your problem intake partner. What issue or operational blocker are you encountering on your shift?"
    },
    {
      role: "worker",
      author: `${scenario.reporter.name} (${scenario.reporter.role})`,
      text: scenario.initialReport
    }
  ]);

  // Epistemic Triad states (Facts, Guesses, Unknowns)
  const [epistemicClaims, setEpistemicClaims] = useState(
    scenario.socraticTurns[0].decisions.claims
  );
  const [convergenceScore, setConvergenceScore] = useState(
    scenario.socraticTurns[0].decisions.sufficient_detail
  );
  const [urgencyScore, setUrgencyScore] = useState(
    scenario.socraticTurns[0].decisions.urgency_score
  );
  const [targetDepartment, setTargetDepartment] = useState(
    scenario.socraticTurns[0].decisions.target_department
  );

  // OpenAI Decisions API Telemetry state
  const [lastDecisionPayload, setLastDecisionPayload] = useState(null);
  const [lastDecisionResult, setLastDecisionResult] = useState(null);
  const [isEvaluatingDecision, setIsEvaluatingDecision] = useState(false);

  // API settings
  const [apiKey, setApiKey] = useState(localStorage.getItem("syncup_openai_api_key") || "");
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [activeDispatchModal, setActiveDispatchModal] = useState(null); // 'jira', 'linear', 'slack'

  // Audio Visualizer ref
  const canvasRef = useRef(null);
  const visualizerRef = useRef(null);
  const decisionsEngineRef = useRef(new DecisionsEngine(apiKey));
  const chatScrollRef = useRef(null);

  // Initialize visualizer
  useEffect(() => {
    if (canvasRef.current) {
      visualizerRef.current = new AudioVisualizerManager(canvasRef.current);
      visualizerRef.current.startSimulation("idle");
    }
    return () => {
      if (visualizerRef.current) visualizerRef.current.stop();
    };
  }, []);

  // Update visualizer when voiceMode changes
  useEffect(() => {
    if (visualizerRef.current) {
      visualizerRef.current.setMode(voiceMode);
    }
  }, [voiceMode]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [conversation]);

  // Sync API key to decisions engine
  useEffect(() => {
    decisionsEngineRef.current.setApiKey(apiKey);
    if (apiKey) {
      localStorage.setItem("syncup_openai_api_key", apiKey);
    }
  }, [apiKey]);

  // Switch scenario
  const handleSelectScenario = (index) => {
    setSelectedScenarioIndex(index);
    const newScen = SCENARIOS[index];
    setTurnIndex(0);
    setConversation([
      {
        role: "agent",
        author: "SyncUp Socratic Agent (gpt-4o-realtime)",
        text: "Hello! I am SyncUp, your problem intake partner. What issue or operational blocker are you encountering on your shift?"
      },
      {
        role: "worker",
        author: `${newScen.reporter.name} (${newScen.reporter.role})`,
        text: newScen.initialReport
      }
    ]);
    setEpistemicClaims(newScen.socraticTurns[0].decisions.claims);
    setConvergenceScore(newScen.socraticTurns[0].decisions.sufficient_detail);
    setUrgencyScore(newScen.socraticTurns[0].decisions.urgency_score);
    setTargetDepartment(newScen.socraticTurns[0].decisions.target_department);
    showToast(`Switched scenario to: ${newScen.title}`);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3800);
  };

  // Run real or simulated Decisions API call
  const triggerDecisionsEvaluation = async (latestText, currentTurn) => {
    setIsEvaluatingDecision(true);
    const questions = [
      {
        type: "predicate",
        name: "sufficient_detail_collected",
        instructions: "Has the frontline reporter provided adequate root-cause, scale, and symptom information to close intake?"
      },
      {
        type: "choice",
        name: "target_department",
        instructions: "Which business department must own resolution of this incident?",
        options: [
          "IT_Hardware_Infrastructure",
          "Payments_Core_Engineering",
          "Clinical_Engineering_Urgent",
          "Operations_Floor_Management"
        ]
      },
      {
        type: "score",
        name: "urgency_score",
        instructions: "Rate operational blast radius and revenue/SLA danger from 1 (minor) to 5 (critical blocker).",
        levels: ["1", "2", "3", "4", "5"]
      }
    ];

    const result = await decisionsEngineRef.current.evaluate(latestText, questions);
    setLastDecisionPayload(result.payload);
    setLastDecisionResult(result);
    setIsEvaluatingDecision(false);

    if (currentTurn && currentTurn.decisions) {
      setEpistemicClaims((prev) => [...prev, ...currentTurn.decisions.claims]);
      setConvergenceScore(currentTurn.decisions.sufficient_detail);
      setUrgencyScore(currentTurn.decisions.urgency_score);
      setTargetDepartment(currentTurn.decisions.target_department);
    }
  };

  // Advance Socratic interview turn
  const handleAdvanceTurn = async () => {
    if (turnIndex >= scenario.socraticTurns.length) {
      showToast("Intake interview already concluded with high confidence!");
      return;
    }

    const currentTurn = scenario.socraticTurns[turnIndex];

    // 1. Agent asks question
    setVoiceMode("speaking");
    setConversation((prev) => [
      ...prev,
      {
        role: "agent",
        author: "SyncUp Socratic Agent (gpt-4o-realtime)",
        text: currentTurn.agentQuestion
      }
    ]);

    // Optional browser speech synthesis
    if ("speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(currentTurn.agentQuestion);
        utter.rate = 1.05;
        utter.pitch = 1.0;
        utter.onend = () => setVoiceMode("listening");
        window.speechSynthesis.speak(utter);
      } catch (e) {
        // Fallback timing
        setTimeout(() => setVoiceMode("listening"), 1800);
      }
    } else {
      setTimeout(() => setVoiceMode("listening"), 1800);
    }

    // 2. Worker answers after a short pause
    setTimeout(async () => {
      setVoiceMode("listening");
      setConversation((prev) => [
        ...prev,
        {
          role: "worker",
          author: `${scenario.reporter.name} (${scenario.reporter.role})`,
          text: currentTurn.userAnswer
        }
      ]);

      // 3. Trigger OpenAI Decisions API evaluation
      await triggerDecisionsEvaluation(currentTurn.userAnswer, currentTurn);

      setTurnIndex((i) => i + 1);
      setTimeout(() => setVoiceMode("idle"), 1200);
    }, 2400);
  };

  // Export Executive Brief as Markdown
  const handleExportBrief = () => {
    const markdown = `# SyncUp Executive Problem Brief: ${scenario.title}
**Reporter**: ${scenario.reporter.name} (${scenario.reporter.role}) - ${scenario.reporter.location}
**Target Routing**: ${targetDepartment}
**Urgency**: Level ${urgencyScore}/5 | **Intake Convergence**: ${(convergenceScore * 100).toFixed(0)}%

---
### 1. Verified Observed Facts
${epistemicClaims
  .filter((c) => c.type === "observed_fact")
  .map((c) => `- ${c.text} (Confidence: ${(c.confidence * 100).toFixed(0)}%)`)
  .join("\n")}

---
### 2. Hypotheses & Guesses
${epistemicClaims
  .filter((c) => c.type === "user_hypothesis")
  .map((c) => `- ${c.text} [Hypothesis - Needs Verification]`)
  .join("\n")}

---
### 3. Critical Unknowns
${epistemicClaims
  .filter((c) => c.type === "critical_unknown")
  .map((c) => `- ${c.text} [Action Item: Investigate First]`)
  .join("\n")}

---
### 4. Company Knowledge Grounding
- **Matched SOP**: ${scenario.companyContext.matchedSop}
- **Impact Risk**: ${scenario.companyContext.impactAssessment.slaRisk}
- **Scale**: ${scenario.companyContext.impactAssessment.workersAffected} Workers Blocked | ${scenario.companyContext.impactAssessment.ordersAtRisk}
`;

    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SyncUp-Brief-${scenario.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Downloaded Executive Problem Brief (Markdown)");
  };

  return (
    <div className="app-root">
      {/* Top Header Navigation */}
      <header className="header-nav">
        <div className="brand-section">
          <div className="brand-logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" x2="12" y1="19" y2="22"/>
            </svg>
          </div>
          <div>
            <h1 className="brand-title">SyncUp</h1>
            <p className="brand-tagline">Autonomous Problem Intake & Decision Triage</p>
          </div>

          <div className="model-badges">
            <span className="model-badge realtime" title="Voice-to-Voice Realtime Intake Model">
              <span className="status-dot"></span> gpt-4o-realtime
            </span>
            <span className="model-badge decisions" title="Typed Structured Decisions API">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              gpt-6-luna /v1/decisions
            </span>
          </div>
        </div>

        <div className="nav-controls">
          {/* Scenario Selector */}
          <div className="scenario-select-wrap">
            <select
              className="scenario-select"
              value={selectedScenarioIndex}
              onChange={(e) => handleSelectScenario(Number(e.target.value))}
            >
              {SCENARIOS.map((s, idx) => (
                <option key={s.id} value={idx}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Tabs */}
          <div className="view-tabs">
            <button
              className={`view-tab-btn ${activeTab === "split" ? "active" : ""}`}
              onClick={() => setActiveTab("split")}
            >
              Dual Split View
            </button>
            <button
              className={`view-tab-btn ${activeTab === "voice" ? "active" : ""}`}
              onClick={() => setActiveTab("voice")}
            >
              Frontline Voice
            </button>
            <button
              className={`view-tab-btn ${activeTab === "brief" ? "active" : ""}`}
              onClick={() => setActiveTab("brief")}
            >
              Executive Brief
            </button>
            <button
              className={`view-tab-btn ${activeTab === "telemetry" ? "active" : ""}`}
              onClick={() => setActiveTab("telemetry")}
            >
              Decisions API
            </button>
          </div>

          {/* API Key Settings Button */}
          <button
            className="icon-btn"
            title="Configure OpenAI API Key"
            onClick={() => setShowSettingsModal(true)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
        </div>
      </header>

      {/* Main Viewport Container */}
      <main className="main-viewport">
        {/* Render Grid based on active tab */}
        <div className={activeTab === "split" ? "dual-grid" : ""}>
          {/* Left Column: Frontline Voice Portal */}
          {(activeTab === "split" || activeTab === "voice") && (
            <section className="glass-card">
              <div className="card-header-bar">
                <div className="card-title-group">
                  <div className="card-icon-badge" style={{ background: "rgba(99, 102, 241, 0.15)", color: "#818CF8" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="card-title">Frontline Voice Intake</h2>
                    <p className="card-subtitle">
                      Reporting: {scenario.reporter.name} • {scenario.reporter.role}
                    </p>
                  </div>
                </div>

                <span className={`voice-status-pill ${voiceMode}`}>
                  <span className="status-dot"></span>
                  {voiceMode === "speaking" && "Agent Speaking"}
                  {voiceMode === "listening" && "Listening to Worker"}
                  {voiceMode === "idle" && "Ready / Standby"}
                </span>
              </div>

              {/* 48-Band Web Audio Waveform Visualizer */}
              <div className="visualizer-container">
                <canvas ref={canvasRef} className="visualizer-canvas" width={600} height={90} />
              </div>

              {/* Big Reactive Mic Button */}
              <div className="voice-action-row">
                <button
                  className={`mic-toggle-btn ${
                    voiceMode === "listening" ? "active" : voiceMode === "speaking" ? "agent-active" : ""
                  }`}
                  onClick={handleAdvanceTurn}
                  title="Click to advance Socratic interview turn"
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                    <line x1="12" x2="12" y1="19" y2="22"/>
                  </svg>
                </button>
              </div>

              <div style={{ textAlign: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  {turnIndex < scenario.socraticTurns.length
                    ? `Click mic to trigger Turn ${turnIndex + 1} of ${scenario.socraticTurns.length}`
                    : "Intake complete! All critical details gathered."}
                </span>
              </div>

              {/* Conversational Stream Feed */}
              <div className="chat-conversation-scroll" ref={chatScrollRef}>
                {conversation.map((msg, i) => (
                  <div key={i} className={`chat-bubble ${msg.role}`}>
                    <div className="bubble-avatar">
                      {msg.role === "agent" ? "AI" : "YOU"}
                    </div>
                    <div className="bubble-content">
                      <span className="bubble-author">{msg.author}</span>
                      <p className="bubble-text">{msg.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Prompt Chips */}
              <div className="quick-chips-row">
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", alignSelf: "center" }}>
                  Prompt Suggestions:
                </span>
                <button className="quick-chip" onClick={handleAdvanceTurn}>
                  "Proceed to next Socratic question"
                </button>
                <button
                  className="quick-chip"
                  onClick={() => triggerDecisionsEvaluation(scenario.initialReport)}
                >
                  "Re-evaluate via gpt-6-luna"
                </button>
              </div>
            </section>
          )}

          {/* Right Column: Executive Problem Brief Command Center */}
          {(activeTab === "split" || activeTab === "brief") && (
            <section className="glass-card">
              <div className="card-header-bar">
                <div className="card-title-group">
                  <div className="card-icon-badge" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#34D399" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                      <polyline points="10 9 9 9 8 9"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="card-title">Executive Problem Brief</h2>
                    <p className="card-subtitle">
                      Live synthesized triage for Decision-Makers
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button className="icon-btn" title="Download Brief Markdown" onClick={handleExportBrief}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Top Key Metrics Evaluated by Decisions API */}
              <div className="brief-header-metric-grid">
                <div className="metric-pill-card">
                  <span className="metric-pill-label">Urgency Score (1-5)</span>
                  <div className="metric-pill-value urgent">
                    <span>Level {urgencyScore}</span>
                    <span style={{ fontSize: "0.75rem", color: "#EF4444" }}>[Critical]</span>
                  </div>
                </div>

                <div className="metric-pill-card">
                  <span className="metric-pill-label">Target Routing</span>
                  <div className="metric-pill-value department">
                    {targetDepartment}
                  </div>
                </div>

                <div className="metric-pill-card">
                  <span className="metric-pill-label">Intake Convergence</span>
                  <div className="metric-pill-value convergence">
                    {(convergenceScore * 100).toFixed(0)}%
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Ready</span>
                  </div>
                </div>
              </div>

              {/* The Epistemic Triad (Facts vs. Guesses vs. Unknowns) */}
              <div className="triad-container">
                {/* 1. Verified Observed Facts */}
                <div className="triad-card fact">
                  <div className="triad-card-header">
                    <span className="triad-card-title">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      Verified Observed Facts ({epistemicClaims.filter(c => c.type === "observed_fact").length})
                    </span>
                    <span style={{ fontSize: "0.7rem", color: "var(--fact-color)" }}>Ground Reality</span>
                  </div>
                  <div className="triad-item-list">
                    {epistemicClaims
                      .filter((c) => c.type === "observed_fact")
                      .map((c, i) => (
                        <div key={i} className="triad-item">
                          <span className="triad-item-bullet"></span>
                          <span>{c.text}</span>
                          <span className="triad-confidence-pill">
                            {(c.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* 2. User Hypotheses & Guesses */}
                <div className="triad-card guess">
                  <div className="triad-card-header">
                    <span className="triad-card-title">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                      Hypotheses & Assumptions ({epistemicClaims.filter(c => c.type === "user_hypothesis").length})
                    </span>
                    <span style={{ fontSize: "0.7rem", color: "var(--guess-color)" }}>Unverified</span>
                  </div>
                  <div className="triad-item-list">
                    {epistemicClaims
                      .filter((c) => c.type === "user_hypothesis")
                      .map((c, i) => (
                        <div key={i} className="triad-item">
                          <span className="triad-item-bullet"></span>
                          <span>{c.text}</span>
                          <span className="triad-confidence-pill" style={{ color: "var(--guess-color)" }}>
                            Guess
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* 3. Critical Unknowns */}
                <div className="triad-card unknown">
                  <div className="triad-card-header">
                    <span className="triad-card-title">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                        <line x1="12" y1="17" x2="12.01" y2="17"/>
                      </svg>
                      Critical Unknowns ({epistemicClaims.filter(c => c.type === "critical_unknown").length})
                    </span>
                    <span style={{ fontSize: "0.7rem", color: "var(--unknown-color)" }}>Investigate First</span>
                  </div>
                  <div className="triad-item-list">
                    {epistemicClaims
                      .filter((c) => c.type === "critical_unknown")
                      .map((c, i) => (
                        <div key={i} className="triad-item">
                          <span className="triad-item-bullet"></span>
                          <span>{c.text}</span>
                          <span className="triad-confidence-pill" style={{ color: "var(--unknown-color)" }}>
                            Unknown
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* Company Context Grounding Box */}
              <div className="grounding-box">
                <span className="grounding-title">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                  </svg>
                  Company Knowledge & SOP Grounding
                </span>
                <div className="grounding-item">
                  <span style={{ color: "#38BDF8", fontWeight: 600 }}>Matched SOP:</span>
                  <span style={{ color: "var(--text-code)" }}>{scenario.companyContext.matchedSop}</span>
                </div>
                <div className="grounding-item">
                  <span style={{ color: "#EC4899", fontWeight: 600 }}>SLA Risk:</span>
                  <span style={{ color: "var(--text-code)" }}>{scenario.companyContext.impactAssessment.slaRisk}</span>
                </div>
              </div>

              {/* 1-Click Action & Routing Dispatch Hub */}
              <div className="dispatch-actions-hub">
                <button
                  className="dispatch-btn jira"
                  onClick={() => {
                    setActiveDispatchModal("jira");
                    showToast(`Dispatched P1 Ticket to Jira (${targetDepartment})`);
                  }}
                >
                  Push to Jira
                </button>
                <button
                  className="dispatch-btn linear"
                  onClick={() => {
                    setActiveDispatchModal("linear");
                    showToast("Synced Issue to Linear Urgent Cycle");
                  }}
                >
                  Push to Linear
                </button>
                <button
                  className="dispatch-btn slack"
                  onClick={() => {
                    setActiveDispatchModal("slack");
                    showToast("Broadcasted Executive Brief to #incident-war-room");
                  }}
                >
                  Alert Slack
                </button>
              </div>
            </section>
          )}

          {/* Under-the-Hood: OpenAI Decisions API Telemetry View */}
          {activeTab === "telemetry" && (
            <section className="glass-card" style={{ gridColumn: "1 / -1" }}>
              <div className="card-header-bar">
                <div className="card-title-group">
                  <div className="card-icon-badge" style={{ background: "rgba(167, 139, 250, 0.15)", color: "#A78BFA" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="card-title">OpenAI Decisions API Live Inspector</h2>
                    <p className="card-subtitle">
                      Inspecting POST https://api.openai.com/v1/decisions with model: "gpt-6-luna"
                    </p>
                  </div>
                </div>

                <button
                  className="quick-chip"
                  onClick={() => triggerDecisionsEvaluation(scenario.initialReport)}
                >
                  Execute Live Evaluation
                </button>
              </div>

              <div className="telemetry-container">
                <div className="telemetry-header-bar">
                  <span>Endpoint: <strong>POST /v1/decisions</strong></span>
                  <span>Model: <strong style={{ color: "#A78BFA" }}>gpt-6-luna</strong></span>
                  <span>Latency: <strong style={{ color: "#10B981" }}>{lastDecisionResult ? `${lastDecisionResult.latencyMs} ms` : "142 ms"}</strong></span>
                  <span>Source: <strong>{lastDecisionResult ? lastDecisionResult.source : "local_gpt_6_luna"}</strong></span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>
                      REQUEST PAYLOAD (Typed Questions: predicate, choice, score):
                    </span>
                    <pre className="telemetry-code-block">
                      {JSON.stringify(
                        lastDecisionPayload || {
                          model: "gpt-6-luna",
                          input: scenario.initialReport,
                          questions: [
                            {
                              type: "predicate",
                              name: "sufficient_detail_collected",
                              instructions: "Has the reporter provided clear reproduction steps, scale, and symptom?"
                            },
                            {
                              type: "choice",
                              name: "target_department",
                              instructions: "Select owning resolution team.",
                              options: ["IT_Hardware", "Payments_Engineering", "Clinical_Biomed", "Floor_Ops"]
                            },
                            {
                              type: "score",
                              name: "urgency_score",
                              instructions: "Operational urgency rubric 1 to 5.",
                              levels: ["1", "2", "3", "4", "5"]
                            }
                          ]
                        },
                        null,
                        2
                      )}
                    </pre>
                  </div>

                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>
                      TYPED MACHINE DECISIONS OUTPUT:
                    </span>
                    <pre className="telemetry-code-block">
                      {JSON.stringify(
                        lastDecisionResult
                          ? lastDecisionResult.answers
                          : {
                              sufficient_detail_collected: {
                                type: "predicate",
                                probability: 0.96,
                                verdict: true
                              },
                              target_department: {
                                type: "choice",
                                selected: targetDepartment,
                                confidence: 0.98
                              },
                              urgency_score: {
                                type: "score",
                                score: 5,
                                rationale: "Direct operations blocker halting 24 pickers with $18.5k/hr freight penalty."
                              }
                            },
                        null,
                        2
                      )}
                    </pre>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Dispatch Ticket Preview Modal */}
      {activeDispatchModal && (
        <div className="modal-overlay" onClick={() => setActiveDispatchModal(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem" }}>
                Routed to {activeDispatchModal.toUpperCase()} Cloud
              </h3>
              <button
                className="icon-btn"
                onClick={() => setActiveDispatchModal(null)}
              >
                ✕
              </button>
            </div>
            <div style={{ background: "rgba(0,0,0,0.4)", padding: "14px", borderRadius: "10px", fontSize: "0.8rem", fontFamily: "var(--font-mono)" }}>
              <p style={{ color: "#38BDF8", marginBottom: "6px" }}><strong>Issue Key:</strong> {activeDispatchModal === "jira" ? "OPS-4102" : activeDispatchModal === "linear" ? "ENG-881" : "#incident-bridge"}</p>
              <p style={{ color: "#EF4444", marginBottom: "6px" }}><strong>Priority:</strong> P1 - Highest (Scored via gpt-6-luna Decisions)</p>
              <p style={{ color: "#10B981", marginBottom: "6px" }}><strong>Assignee Queue:</strong> {targetDepartment}</p>
              <p style={{ color: "var(--text-secondary)" }}><strong>Summary:</strong> {scenario.subtitle}</p>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                className="dispatch-btn download"
                onClick={() => setActiveDispatchModal(null)}
              >
                Close
              </button>
              <button
                className="dispatch-btn jira"
                onClick={() => {
                  setActiveDispatchModal(null);
                  showToast("Confirmed live webhook push!");
                }}
              >
                Confirm Dispatch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="modal-overlay" onClick={() => setShowSettingsModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem" }}>
                API Configuration
              </h3>
              <button className="icon-btn" onClick={() => setShowSettingsModal(false)}>✕</button>
            </div>
            <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
              Provide an OpenAI API Key with access to the <strong>Decisions API</strong> and <strong>Realtime Voice</strong>. If left blank, SyncUp operates with the built-in high-fidelity simulator.
            </p>
            <div>
              <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>
                OpenAI API Key (sk-...)
              </label>
              <input
                type="password"
                className="modal-input"
                placeholder="sk-proj-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                className="dispatch-btn download"
                onClick={() => {
                  setApiKey("");
                  localStorage.removeItem("syncup_openai_api_key");
                  showToast("Switched to offline high-fidelity simulator");
                  setShowSettingsModal(false);
                }}
              >
                Use Simulator
              </button>
              <button
                className="dispatch-btn linear"
                onClick={() => {
                  showToast("Saved API Key configuration");
                  setShowSettingsModal(false);
                }}
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notice */}
      {toastMessage && (
        <div className="toast-notice">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "white" }}>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
