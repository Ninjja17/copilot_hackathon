import React, { useState, useEffect, useCallback, useRef } from 'react';
import HeaderNav from './components/common/HeaderNav';
import CanvasParticleField from './components/common/CanvasParticleField';
import Meteors from './components/common/Meteors';
import Toast from './components/common/Toast';

import VoiceStageHeader from './components/voice/VoiceStageHeader';
import CanvasFluidOrb from './components/voice/CanvasFluidOrb';
import FluidWaveformVisualizer from './components/voice/FluidWaveformVisualizer';

import CallTranscript from './components/transcript/CallTranscript';
import HandsFreeDock from './components/transcript/HandsFreeDock';
import IncidentSummarySidebar from './components/dossier/IncidentSummarySidebar';

import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';
import { useHandsFreeMic } from './hooks/useHandsFreeMic';
import { api } from './services/api';

export default function App() {
  const [ticketId, setTicketId] = useState('INC-8492');
  const [incidentTitle, setIncidentTitle] = useState('Warehouse Logistics - Scanner Freeze');
  const [targetDepartment, setTargetDepartment] = useState('IT Hardware Infrastructure');
  const [urgency, setUrgency] = useState(5);
  const [dispatchedChannel, setDispatchedChannel] = useState(null);
  const [toast, setToast] = useState(null);

  const [reporter, setReporter] = useState({
    name: 'Marcus Vance',
    role: 'Floor Operations Supervisor',
    location: 'Dallas Distribution Center #4'
  });

  const [conversation, setConversation] = useState([
    {
      role: 'reporter',
      sender: 'Marcus Vance',
      body: "Hey SyncUp, our pickers in Zone B are at a total standstill. All 24 handheld barcode scanners started freezing up at 23:45 whenever they scan batches with QR prefix 'PR-'. Power cycling only works for one scan before it locks up with a MEM_ALLOC_FAIL error. We have trucks leaving in 2 hours and 400 orders in the backlog."
    },
    {
      role: 'agent',
      sender: 'SyncUp Intake Agent',
      body: "I hear the urgency, Marcus—halting 24 pickers before truck departure is high stakes. Can you tell me: did this start immediately after the 22:00 WMS maintenance window, and are any units in Zone A or C having this same issue?"
    }
  ]);

  const [liveSummary, setLiveSummary] = useState(
    "Marcus Vance reported that 24 handheld barcode scanners in Zone B are freezing with error MEM_ALLOC_FAIL when scanning QR codes with prefix 'PR-'. Began at 23:45 following the 22:00 maintenance window. Zone A remains normal. 420 orders at risk before truck departure."
  );

  const [keyDetails, setKeyDetails] = useState([
    "All 24 Zone B handheld scanners freezing on QR prefix 'PR-'",
    "Scanners lock up with MEM_ALLOC_FAIL error code",
    "Zone A scanners on 1D barcodes are functioning normally",
    "WMS 22:00 maintenance firmware update altered buffer size"
  ]);

  const { isSpeaking, speak, stop } = useSpeechSynthesis();

  const showToast = useCallback((title, message, type = 'info') => {
    setToast({ title, message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // Fetch initial ticket state from SQLite backend if available
  useEffect(() => {
    api.getScenarios().then((tickets) => {
      if (tickets && Array.isArray(tickets) && tickets.length > 0) {
        const first = tickets[0];
        setTicketId(first.ticketId || first.id);
        setIncidentTitle(first.title);
        setTargetDepartment(first.targetDepartment || first.department);
        setUrgency(first.urgency || 5);
        if (first.reporter) setReporter(first.reporter);

        api.getTicketDetails(first.ticketId).then((details) => {
          if (details && details.conversation && details.conversation.length > 0) {
            setConversation(details.conversation);
          }
          if (details && details.claims && details.claims.length > 0) {
            setKeyDetails(details.claims.map(c => c.text));
          }
        });
      }
    });
  }, []);

  // Process incoming user turn through the AI Socratic Prober
  const handleUserMessage = useCallback(async (text) => {
    if (!text || !text.trim()) return;

    // 1. Append user speech turn to chat window
    const userMsg = {
      role: 'reporter',
      sender: reporter.name,
      body: text
    };
    setConversation(prev => [...prev, userMsg]);

    // 2. Call backend Two-Brain engine
    const turnResult = await api.processTurn({
      ticketId,
      userMessage: text,
      senderName: reporter.name
    });

    let agentResponseText = '';

    if (turnResult && turnResult.agentResponse) {
      agentResponseText = turnResult.agentResponse;

      if (turnResult.newClaims && turnResult.newClaims.length > 0) {
        const newClaimTexts = turnResult.newClaims.map(c => c.text);
        setKeyDetails(prev => [...newClaimTexts, ...prev]);
      }

      // Backend dynamic plain-language situation briefing
      if (turnResult.liveSummary) {
        setLiveSummary(turnResult.liveSummary);
      }

      // Backend evaluated resolution team
      if (turnResult.recommendedTeam) {
        setTargetDepartment(turnResult.recommendedTeam);
      }
    } else {
      // Local fallback
      const lower = text.toLowerCase();
      if (lower.includes('firmware') || lower.includes('update') || lower.includes('patch')) {
        agentResponseText = "Noted on the update. Do you have physical access to the server switch racks right now, or is there an on-call network engineer available to initiate an OTA rollback?";
        setKeyDetails(prev => ["WMS firmware correlation reported by frontline caller", ...prev]);
      } else if (lower.includes('zone') || lower.includes('scanner') || lower.includes('fail')) {
        agentResponseText = "Understood. What is the current operational fallback on the floor—are teams manually cataloging, and what is your hard deadline before shipping departure?";
      } else {
        agentResponseText = "I have captured those operational details. I have enough clarity to escalate this to IT Hardware Infrastructure for immediate resolve.";
      }
    }

    // 3. Agent answers with pleasant natural speech
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
    }, 400);
  }, [ticketId, reporter.name, speak]);

  const {
    isListening,
    handsFree,
    interimText,
    toggleHandsFree
  } = useHandsFreeMic({
    onTranscriptReady: handleUserMessage,
    isAgentSpeaking: isSpeaking
  });

  // Handle Quick Escalation via Slack, Email, or SMS
  const handleEscalate = async (channel) => {
    setDispatchedChannel(channel);

    const payload = {
      ticketId,
      title: incidentTitle,
      targetDepartment,
      channel,
      summary: liveSummary,
      keyDetails,
      reporter
    };

    const dispatchResult = await api.dispatchTicket(payload, channel);

    let channelName = 'Slack (#incident-war-room)';
    if (channel === 'email') channelName = 'Email (On-Call Infrastructure Distribution)';
    if (channel === 'sms') channelName = 'Direct SMS / Pager Alert';

    const confirmMsg = dispatchResult?.message || `Ticket ${ticketId} has been successfully dispatched to ${targetDepartment} via ${channelName}. On-call engineers notified for immediate resolution.`;

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
      'Escalation Dispatched',
      `Sent to ${targetDepartment} via ${channel.toUpperCase()}`,
      'success'
    );
  };

  return (
    <div className="syncup-app-layout">
      {/* Ambient background visual layers */}
      <CanvasParticleField />
      <Meteors count={14} />

      {/* Top Navigation */}
      <HeaderNav
        handsFree={handsFree}
        onToggleHandsFree={toggleHandsFree}
        isSpeaking={isSpeaking}
        isListening={isListening}
      />

      {/* 70 / 30 Asymmetric Proportional Layout */}
      <main className="syncup-main-workspace-70-30">
        {/* LEFT COLUMN (~70%): Voice Agent Sphere + Chat Window Underneath + Hands-Free Dock */}
        <section className="voice-and-chat-hero-column">
          {/* Top: Voice Stage Header with Caller Info */}
          <VoiceStageHeader
            reporter={reporter}
            ticketId={ticketId}
          />

          {/* 3D Metallic Horizon AI Sphere */}
          <div className="voice-sphere-section">
            <CanvasFluidOrb
              isSpeaking={isSpeaking}
              isListening={isListening}
              onClick={() => {
                if (isSpeaking) {
                  stop();
                } else {
                  speak("SyncUp listening hands-free. State the operational issue.");
                }
              }}
            />
            <FluidWaveformVisualizer
              isSpeaking={isSpeaking}
              isListening={isListening}
            />
          </div>

          {/* CHAT WINDOW (Positioned directly under the voice agent) */}
          <CallTranscript messages={conversation} />

          {/* Continuous Hands-Free Microphone Bar & Input Dock */}
          <HandsFreeDock
            isListening={isListening}
            handsFree={handsFree}
            interimText={interimText}
            onToggleHandsFree={toggleHandsFree}
            onSendMessage={handleUserMessage}
          />
        </section>

        {/* RIGHT COLUMN (~30%): Compact Summary Window & Quick Escalation Channels */}
        <IncidentSummarySidebar
          ticketId={ticketId}
          title={incidentTitle}
          summary={liveSummary}
          keyDetails={keyDetails}
          targetDepartment={targetDepartment}
          urgency={urgency}
          onEscalate={handleEscalate}
          dispatchedChannel={dispatchedChannel}
        />
      </main>

      {/* Glass status toast notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
