import React from 'react';
import ShimmerText from './ShimmerText';
import BorderBeam from './BorderBeam';

export default function HeaderNav({ handsFree, onToggleHandsFree, isSpeaking, isListening }) {
  return (
    <header className="header-nav">
      <div className="brand-group">
        <div className="brand-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
        </div>
        <div className="brand-text">
          <span className="brand-name">
            <ShimmerText shimmerColor="#D4FF24" baseColor="#FFFFFF" duration={4}>
              SyncUp
            </ShimmerText>
          </span>
          <span className="brand-sub">Incident Triage Intelligence</span>
        </div>
      </div>

      <div className="nav-center-status">
        <div className={`status-pill ${isSpeaking ? 'speaking' : isListening ? 'listening' : ''}`}>
          <BorderBeam
            size={90}
            duration={5}
            colorFrom={isListening ? '#D4FF24' : '#1558C9'}
            colorTo={isListening ? '#55A0FF' : '#79B0FF'}
            borderWidth={1}
          />
          <span className="live-indicator-dot"></span>
          <span className="status-label">
            {isSpeaking ? 'Agent Speaking' : isListening ? 'Hands-Free Listening' : 'Continuous Sync Active'}
          </span>
        </div>
      </div>

      <div className="nav-controls">
        <button 
          className={`nav-pill-btn ${handsFree ? 'active' : ''}`}
          onClick={onToggleHandsFree}
          title="Toggle hands-free continuous conversational listening"
        >
          <span className="mic-dot"></span>
          <span>Hands-Free {handsFree ? 'ON' : 'OFF'}</span>
        </button>
      </div>
    </header>
  );
}
