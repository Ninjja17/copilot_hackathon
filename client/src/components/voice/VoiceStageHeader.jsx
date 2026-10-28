import React from 'react';

export default function VoiceStageHeader({ reporter, ticketId }) {
  if (!reporter) return null;

  return (
    <div className="voice-stage-header">
      <div className="live-call-tag">
        <span className="live-pulsing-record"></span>
        <span className="call-title">LIVE INCIDENT AUDIO STREAM</span>
        <span className="call-ticket-ref">#{ticketId}</span>
      </div>

      <div className="caller-dossier-pill">
        <div className="caller-avatar">
          {reporter.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div className="caller-meta">
          <div className="caller-name">{reporter.name}</div>
          <div className="caller-role-loc">
            {reporter.role} • {reporter.location}
          </div>
        </div>
      </div>
    </div>
  );
}
