import React, { useEffect, useRef } from 'react';
import ChatMessageBubble from './ChatMessageBubble';

export default function CallTranscript({ messages }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="transcript-section">
      <div className="transcript-header-bar">
        <span className="transcript-title">LIVE CALL TRANSCRIPT & TRIAGE STREAM</span>
        <span className="turn-count-badge">{messages.length} TURNS</span>
      </div>
      <div className="transcript-messages-viewport" ref={containerRef}>
        {messages.map((msg, idx) => (
          <ChatMessageBubble key={idx} message={msg} />
        ))}
      </div>
    </div>
  );
}
