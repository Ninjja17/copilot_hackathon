import React from 'react';
import ShimmerText from '../common/ShimmerText';
import RippleButton from '../common/RippleButton';

/**
 * Fluid, Borderless Live Summary & Escalation Sidebar (~30% width)
 * Completely eliminates the "boxy card" design.
 * Text and elements float seamlessly directly on the deep obsidian canvas
 * with ambient neon glow flares, soft typography, and fluid pill actions.
 */
export default function IncidentSummarySidebar({
  ticketId,
  title,
  summary,
  keyDetails = [],
  targetDepartment,
  urgency,
  onEscalate,
  dispatchedChannel
}) {
  return (
    <aside className="fluid-summary-stream" aria-label="Incident Summary and Escalation">
      {/* Header Strip with Glowing Floating Tags */}
      <div className="stream-header-row">
        <div className="stream-ticket-ref">
          <span className="ambient-ping-dot"></span>
          <ShimmerText shimmerColor="#79B0FF" baseColor="#79B0FF" duration={3}>
            #{ticketId || 'INC-LIVE'}
          </ShimmerText>
        </div>
        <div className="fluid-urgent-pill">
          <span className="urgent-pulse-glow"></span>
          <ShimmerText shimmerColor="#FFFFFF" baseColor="#D4FF24" duration={2.5}>
            P1 URGENT
          </ShimmerText>
        </div>
      </div>

      {/* Incident Title: Floating Typography */}
      <div className="stream-headline-wrap">
        <h2 className="stream-incident-title">{title || 'Active Operational Incident'}</h2>
      </div>

      {/* 1. Live Plain-Language Summary: Completely Borderless Fluid Block */}
      <div className="fluid-summary-block">
        <div className="fluid-section-label">
          <span className="label-gem">✦</span>
          <span>LIVE SITUATION SUMMARY</span>
        </div>
        <p className="fluid-summary-prose">
          {summary || 'Listening to caller report... Key operational facts and failure symptoms will synthesize here in real time.'}
        </p>
      </div>

      {/* 2. Key Situation Facts: Minimal Floating Glow List */}
      {keyDetails && keyDetails.length > 0 && (
        <div className="fluid-facts-block">
          <div className="fluid-section-label">
            <span className="label-gem">✦</span>
            <span>GATHERED FACTS ({keyDetails.length})</span>
          </div>
          <div className="fluid-facts-stack">
            {keyDetails.slice(0, 4).map((detail, idx) => (
              <div key={idx} className="fluid-fact-item">
                <span className="fact-glow-bullet"></span>
                <span className="fact-prose">{typeof detail === 'string' ? detail : detail.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Recommended Resolution Team: Borderless Ambient Glow Callout */}
      <div className="fluid-team-callout">
        <div className="fluid-section-label">
          <span className="label-gem">✦</span>
          <span>RECOMMENDED RESOLUTION TEAM</span>
        </div>
        <div className="fluid-team-title-row">
          <span className="team-glow-icon">🎯</span>
          <span className="fluid-team-name">{targetDepartment || 'IT Hardware Infrastructure'}</span>
        </div>
        <div className="fluid-team-caption">Auto-inferred from operational failure symptoms</div>
      </div>

      {/* 4. Quick Escalation Channels: Floating Pill Capsules */}
      <div className="fluid-escalation-dock">
        <div className="fluid-section-label">
          <span className="label-gem">✦</span>
          <span>ONE-CLICK DISPATCH</span>
        </div>
        <div className="floating-pills-cluster">
          {/* Slack Capsule */}
          <RippleButton
            className={`floating-dispatch-pill slack-pill ${dispatchedChannel === 'slack' ? 'dispatched' : ''}`}
            onClick={() => onEscalate('slack')}
            disabled={dispatchedChannel === 'slack'}
            rippleColor="rgba(212, 255, 36, 0.5)"
          >
            <span className="pill-icon">💬</span>
            <span className="pill-text">
              {dispatchedChannel === 'slack' ? 'Dispatched to Slack (#incident-war-room) ✓' : 'Send to Slack'}
            </span>
          </RippleButton>

          {/* Email Capsule */}
          <RippleButton
            className={`floating-dispatch-pill email-pill ${dispatchedChannel === 'email' ? 'dispatched' : ''}`}
            onClick={() => onEscalate('email')}
            disabled={dispatchedChannel === 'email'}
            rippleColor="rgba(21, 88, 201, 0.5)"
          >
            <span className="pill-icon">✉️</span>
            <span className="pill-text">
              {dispatchedChannel === 'email' ? 'Sent via On-Call Distribution ✓' : 'Send via Email'}
            </span>
          </RippleButton>

          {/* SMS Capsule */}
          <RippleButton
            className={`floating-dispatch-pill sms-pill ${dispatchedChannel === 'sms' ? 'dispatched' : ''}`}
            onClick={() => onEscalate('sms')}
            disabled={dispatchedChannel === 'sms'}
            rippleColor="rgba(212, 255, 36, 0.55)"
          >
            <span className="pill-icon">📱</span>
            <span className="pill-text">
              {dispatchedChannel === 'sms' ? 'Direct SMS / Pager Dispatched ✓' : 'Send SMS / Message'}
            </span>
          </RippleButton>
        </div>
      </div>
    </aside>
  );
}
