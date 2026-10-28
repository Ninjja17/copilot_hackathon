import React, { useState } from 'react';

export default function HandsFreeDock({
  isListening,
  handsFree,
  interimText,
  onToggleHandsFree,
  onSendMessage
}) {
  const [typedInput, setTypedInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!typedInput.trim()) return;
    onSendMessage(typedInput.trim());
    setTypedInput('');
  };

  return (
    <div className="handsfree-bottom-dock">
      {interimText && (
        <div className="interim-speech-preview">
          <span className="live-speech-pulse"></span>
          <span className="interim-text">"{interimText}"</span>
        </div>
      )}

      {/* Quick Frontline Operational Responses */}
      <div className="quick-suggestions-stream" aria-label="Quick conversational responses">
        {[
          "Zone A scanners work fine on 1D barcodes",
          "Issue began right after 22:00 WMS update",
          "400 orders at risk, trucks depart in 90 mins",
          "Need OTA firmware rollback immediately"
        ].map((chip, idx) => (
          <button
            key={idx}
            type="button"
            className="quick-reply-pill"
            onClick={() => onSendMessage(chip)}
            title={`Send quick update: "${chip}"`}
          >
            <span>💬</span> {chip}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="input-toolbar-row">
        <button
          type="button"
          className={`mic-primary-btn ${isListening ? 'listening' : ''}`}
          onClick={onToggleHandsFree}
          title={handsFree ? 'Hands-Free listening active (click to pause)' : 'Click to enable Hands-Free'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" x2="12" y1="19" y2="22"/>
          </svg>
          <span className="mic-label">{handsFree ? 'HANDS-FREE ON' : 'MIC PAUSED'}</span>
          {handsFree && (
            <div className="mic-mini-visualizer" aria-hidden="true">
              <span className="mini-bar b1"></span>
              <span className="mini-bar b2"></span>
              <span className="mini-bar b3"></span>
              <span className="mini-bar b4"></span>
            </div>
          )}
        </button>

        <input
          type="text"
          className="chat-text-input"
          placeholder="Speak freely, or type operational details here..."
          value={typedInput}
          onChange={(e) => setTypedInput(e.target.value)}
        />

        <button type="submit" className="send-btn" disabled={!typedInput.trim()}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </form>
    </div>
  );
}
