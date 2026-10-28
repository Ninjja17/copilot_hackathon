import React, { useState, useEffect, useCallback, useRef } from 'react';
import HeaderNav from './components/common/HeaderNav';
import CanvasParticleField from './components/common/CanvasParticleField';
import Meteors from './components/common/Meteors';
import Toast from './components/common/Toast';

import VoiceStageHeader from './components/voice/VoiceStageHeader';
import CanvasFluidOrb from './components/voice/CanvasFluidOrb';
import SpectrumVisualizer from './components/voice/SpectrumVisualizer';

import CallTranscript from './components/transcript/CallTranscript';
import HandsFreeDock from './components/transcript/HandsFreeDock';

import TicketHeader from './components/dossier/TicketHeader';
import MetricsGrid from './components/dossier/MetricsGrid';
import EpistemicTriad from './components/dossier/EpistemicTriad';
import SopCard from './components/dossier/SopCard';
import DispatchDock from './components/dossier/DispatchDock';

import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';
import { useHandsFreeMic } from './hooks/useHandsFreeMic';
import { api } from './services/api';

// Default initial scenarios (mirrored with backend database)
const DEFAULT_SCENARIOS = [
  {
    id: "logistics_scanners",
    ticketId: "INC-8492",
    title: "Warehouse Logistics - Scanner Freeze",
    subtitle: "Zone B Handheld Terminals Failing on Batch QR Ingestion",
    department: "Supply Chain & Fulfillment IT",
    targetDepartment: "IT Hardware Infrastructure",
    reporter: {
      name: "Marcus Vance",
      role: "Floor Operations Supervisor",
      location: "Dallas Distribution Center #4",
      shift: "Night Shift (19:00 - 04:00)"
    },
    urgency: 5,
    sufficientDetail: 0.96,
    matchedSop: "SOP-WMS-402: Emergency Rollback Procedure for Zebra TC57 Terminals",
    impact: "SLA Risk: $18,500/hr delay penalty • 420 orders at risk",
    initialReport: "Hey SyncUp, our pickers in Zone B are at a total standstill. All 24 handheld barcode scanners started freezing up at 23:45 whenever they scan batches with QR prefix 'PR-'. Power cycling only works for one scan before it locks up with a MEM_ALLOC_FAIL error. We have trucks leaving in 2 hours and 400 orders in the backlog.",
    initialAgentQuestion: "I hear the urgency, Marcus—halting 24 pickers before truck departure is high stakes. Can you tell me: did this start immediately after the 22:00 WMS maintenance window, and are any units in Zone A or C having this same issue?",
    claims: [
      { id: 1, text: "All 24 Zone B handheld scanners freezing on QR prefix 'PR-'", type: "observed_fact", confidence: 0.98 },
      { id: 2, text: "Scanners lock up with MEM_ALLOC_FAIL error code", type: "observed_fact", confidence: 0.97 },
      { id: 3, text: "Zone A scanners on 1D barcodes are functioning normally", type: "observed_fact", confidence: 0.95 },
      { id: 4, text: "WMS 22:00 maintenance firmware update altered buffer size", type: "user_hypothesis", confidence: 0.91 },
      { id: 5, text: "Whether Zone C is experiencing the same QR scan crash", type: "critical_unknown", confidence: 0.94 },
      { id: 6, text: "Whether OTA Wi-Fi rollback is supported without physical docking", type: "critical_unknown", confidence: 0.96 }
    ]
  },
  {
    id: "fintech_checkout",
    ticketId: "INC-7721",
    title: "FinTech Platform - Checkout 504 Spikes",
    subtitle: "Tier-1 Merchant Gateway Timeouts on Apple Pay Ingestion",
    department: "Payments & Core Engineering",
    targetDepartment: "Payments Core Engineering",
    reporter: {
      name: "Siddharth Rao",
      role: "Lead Merchant Support Engineer",
      location: "San Francisco HQ",
      shift: "European Trading Window"
    },
    urgency: 5,
    sufficientDetail: 0.94,
    matchedSop: "SOP-PAY-118: Cross-Region Gateway Failover for EU-Central-1",
    impact: "Critical: Tier-1 SLA Penalty ($45,000/hr) • €230,000 carts at risk",
    initialReport: "SyncUp, our enterprise client Lumina Retail is reporting that 30% of their checkout requests are failing with HTTP 504 Gateway Timeouts. Their customer support queue has spiked by 200 tickets in the last 20 minutes.",
    initialAgentQuestion: "Understood Siddharth. Are the 504 timeouts isolated to a specific payment method or geography, and what latency are you observing on the upstream acquiring bank connector?",
    claims: [
      { id: 1, text: "30% of Lumina Retail checkout attempts failing with 504 Timeouts", type: "observed_fact", confidence: 0.97 },
      { id: 2, text: "Failures isolated to Apple Pay tokens via Frankfurt gateway", type: "observed_fact", confidence: 0.93 },
      { id: 3, text: "Direct credit card entries are passing smoothly", type: "observed_fact", confidence: 0.99 },
      { id: 4, text: "Token decryption microservice throttling after morning deploy", type: "user_hypothesis", confidence: 0.88 },
      { id: 5, text: "Traffic reroute to London secondary gateway not yet executed", type: "observed_fact", confidence: 0.95 },
      { id: 6, text: "Whether other European merchants are experiencing degradation", type: "critical_unknown", confidence: 0.96 }
    ]
  },
  {
    id: "healthcare_emr",
    ticketId: "INC-9104",
    title: "Hospital ICU - EMR Sync Lag",
    subtitle: "Nurse Tablet Vital Signs Failing to Replicate to Central Station",
    department: "Clinical Informatics & Health Tech",
    targetDepartment: "Clinical Engineering Urgent",
    reporter: {
      name: "Nurse Elena Rostova",
      role: "Charge Nurse, ICU Ward 4",
      location: "St. Jude Metro Medical Center",
      shift: "Night Shift"
    },
    urgency: 5,
    sufficientDetail: 0.98,
    matchedSop: "SOP-CLIN-009: ICU Telemetry Network Redundancy Protocol",
    impact: "High Priority: Level 1 Clinical Alert • 8 ICU Beds Affected",
    initialReport: "SyncUp, our bedside tablets in ICU Ward 4 aren't pushing patient vitals to the telemetry central nurses' station. We entered telemetry stats 15 minutes ago and the central screens are still showing 'Awaiting Data'.",
    initialAgentQuestion: "Nurse Elena, this is vital for patient safety. Are the local bedside monitors sounding their own physical alarms if vitals cross critical thresholds, and is this affecting all 12 beds in ICU-4?",
    claims: [
      { id: 1, text: "Local bedside Philips monitors alarm properly and independently", type: "observed_fact", confidence: 0.99 },
      { id: 2, text: "Central telemetry station blank for beds 401 through 408", type: "observed_fact", confidence: 0.98 },
      { id: 3, text: "South wing beds 409-412 replicating normally", type: "observed_fact", confidence: 0.94 },
      { id: 4, text: "Corridor 4A Wi-Fi access point dropped offline", type: "user_hypothesis", confidence: 0.85 },
      { id: 5, text: "Manual bedside paper logging initiated with 2 float nurses", type: "observed_fact", confidence: 0.97 },
      { id: 6, text: "Whether VLAN 40 medical Wi-Fi controller reports reboot loops", type: "critical_unknown", confidence: 0.95 }
    ]
  }
];

export default function App() {
  const [scenarios, setScenarios] = useState(DEFAULT_SCENARIOS);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const activeScenario = scenarios[selectedIdx] || scenarios[0];

  const [conversation, setConversation] = useState([
    {
      role: 'reporter',
      sender: DEFAULT_SCENARIOS[0].reporter.name,
      body: DEFAULT_SCENARIOS[0].initialReport
    },
    {
      role: 'agent',
      sender: 'SyncUp Intake Agent',
      body: DEFAULT_SCENARIOS[0].initialAgentQuestion
    }
  ]);

  const [claims, setClaims] = useState(DEFAULT_SCENARIOS[0].claims);
  const [sufficientDetail, setSufficientDetail] = useState(DEFAULT_SCENARIOS[0].sufficientDetail);
  const [isDispatched, setIsDispatched] = useState(false);
  const [toast, setToast] = useState(null);

  const { isSpeaking, speak, stop } = useSpeechSynthesis();

  const showToast = useCallback((title, message, type = 'info') => {
    setToast({ title, message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // Fetch scenarios from backend if available
  useEffect(() => {
    api.getScenarios().then((data) => {
      if (data && Array.isArray(data) && data.length > 0) {
        setScenarios(data);
      }
    });
  }, []);

  // Handle incoming user transcript (from voice or typed input)
  const handleUserMessage = useCallback(async (text) => {
    if (!text || !text.trim()) return;

    // 1. Add user turn
    const userMsg = {
      role: 'reporter',
      sender: activeScenario.reporter.name,
      body: text
    };

    setConversation(prev => [...prev, userMsg]);

    // 2. Call backend turn processor or fallback locally
    const turnResult = await api.processTurn({
      scenarioId: activeScenario.id,
      userMessage: text,
      conversationHistory: conversation
    });

    let agentResponseText = '';
    let extractedClaims = null;

    if (turnResult && turnResult.agentResponse) {
      agentResponseText = turnResult.agentResponse;
      if (turnResult.newClaims && turnResult.newClaims.length > 0) {
        extractedClaims = turnResult.newClaims;
      }
    } else {
      // Local fallback logic
      const lower = text.toLowerCase();
      if (lower.includes('firmware') || lower.includes('update') || lower.includes('deploy')) {
        extractedClaims = [{
          id: Date.now(),
          text: `Investigating firmware/deployment correlation from caller report: "${text.slice(0, 70)}..."`,
          type: 'user_hypothesis',
          confidence: 0.93
        }];
        agentResponseText = "Noted on the update. Do you have physical access to the server switch racks right now, or is there an on-call network engineer available to initiate an OTA rollback?";
      } else if (lower.includes('zone') || lower.includes('scanner') || lower.includes('fail') || lower.includes('freeze')) {
        extractedClaims = [{
          id: Date.now(),
          text: `Confirmed failure scope: "${text.slice(0, 70)}..."`,
          type: 'observed_fact',
          confidence: 0.97
        }];
        agentResponseText = "Understood. What is the current operational fallback on the floor—are teams manually cataloging, and what is your hard deadline before shipping trucks depart?";
      } else {
        agentResponseText = "I have logged those operational details into the incident dossier. Are there any adjacent systems or external clients currently impacted?";
      }
    }

    if (extractedClaims) {
      setClaims(prev => [...extractedClaims, ...prev]);
      setSufficientDetail(prev => Math.min(1.0, prev + 0.02));
    }

    // 3. Agent response turn & TTS
    setTimeout(() => {
      setConversation(prev => [
        ...prev,
        {
          role: 'agent',
          sender: 'SyncUp Intake Agent',
          body: agentResponseText
        }
      ]);
      speak(agentResponseText);
    }, 450);
  }, [activeScenario, conversation, speak]);

  const {
    isListening,
    handsFree,
    interimText,
    toggleHandsFree
  } = useHandsFreeMic({
    onTranscriptReady: handleUserMessage,
    isAgentSpeaking: isSpeaking
  });

  // Switch active scenario
  const handleSelectScenario = (idx) => {
    setSelectedIdx(idx);
    const sc = scenarios[idx] || DEFAULT_SCENARIOS[idx];
    setConversation([
      {
        role: 'reporter',
        sender: sc.reporter.name,
        body: sc.initialReport
      },
      {
        role: 'agent',
        sender: 'SyncUp Intake Agent',
        body: sc.initialAgentQuestion
      }
    ]);
    setClaims(sc.claims);
    setSufficientDetail(sc.sufficientDetail);
    setIsDispatched(false);
    showToast('Incident Loaded', `${sc.title} (${sc.ticketId})`, 'info');
    speak(sc.initialAgentQuestion);
  };

  // Dispatch incident ticket
  const handleDispatch = async () => {
    setIsDispatched(true);
    const ticketPayload = {
      ticketId: activeScenario.ticketId,
      title: activeScenario.title,
      department: activeScenario.targetDepartment,
      sufficientDetail,
      claimsCount: claims.length
    };

    const res = await api.dispatchTicket(ticketPayload);
    const confirmMsg = `Ticket ${activeScenario.ticketId} has been successfully dispatched to ${activeScenario.targetDepartment} with P1 Priority. Automated on-call paging initiated.`;

    setConversation(prev => [
      ...prev,
      {
        role: 'agent',
        sender: 'SyncUp Intake Agent',
        body: confirmMsg
      }
    ]);

    speak(confirmMsg);
    showToast(
      'Ticket Dispatched',
      res?.message || `Escalated to ${activeScenario.targetDepartment}`,
      'success'
    );
  };

  return (
    <div className="syncup-app-layout">
      {/* Background visual layers */}
      <CanvasParticleField />
      <Meteors count={16} />

      {/* Top Navigation */}
      <HeaderNav
        handsFree={handsFree}
        onToggleHandsFree={toggleHandsFree}
        isSpeaking={isSpeaking}
        isListening={isListening}
      />

      {/* Main 2-Column Incident Intake Workspace */}
      <main className="syncup-main-workspace">
        {/* Left Column: Voice Agent Stage + Call Transcript directly under */}
        <section className="voice-call-column">
          <VoiceStageHeader
            reporter={activeScenario.reporter}
            ticketId={activeScenario.ticketId}
          />

          <div className="voice-sphere-section">
            <CanvasFluidOrb
              isSpeaking={isSpeaking}
              isListening={isListening}
              onClick={() => {
                if (isSpeaking) {
                  stop();
                } else {
                  speak(activeScenario.initialAgentQuestion);
                }
              }}
            />
            <SpectrumVisualizer
              isSpeaking={isSpeaking}
              isListening={isListening}
            />
          </div>

          {/* Transcript directly under the voice sphere */}
          <CallTranscript messages={conversation} />

          {/* Hands-Free Voice Dock */}
          <HandsFreeDock
            isListening={isListening}
            handsFree={handsFree}
            interimText={interimText}
            onToggleHandsFree={toggleHandsFree}
            onSendMessage={handleUserMessage}
          />
        </section>

        {/* Right Column: Problem Intake Dossier & Epistemic Triad */}
        <section className="dossier-column">
          <TicketHeader
            scenarios={scenarios}
            selectedIdx={selectedIdx}
            onSelectScenario={handleSelectScenario}
            ticketId={activeScenario.ticketId}
            title={activeScenario.title}
            subtitle={activeScenario.subtitle}
          />

          <MetricsGrid
            sufficientDetail={sufficientDetail}
            urgency={activeScenario.urgency}
            department={activeScenario.department}
            targetDepartment={activeScenario.targetDepartment}
          />

          <EpistemicTriad claims={claims} />

          <SopCard
            matchedSop={activeScenario.matchedSop}
            impact={activeScenario.impact}
          />

          <DispatchDock
            targetDepartment={activeScenario.targetDepartment}
            isDispatched={isDispatched}
            onDispatch={handleDispatch}
          />
        </section>
      </main>

      {/* Toast Alert */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
