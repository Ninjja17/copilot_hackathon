import React from 'react';

export default function ChatMessageBubble({ message }) {
  const isAgent = message.role === 'agent';

  return (
    <div className={`chat-bubble-row ${isAgent ? 'agent-row' : 'reporter-row'}`}>
      <div className="bubble-sender-label">
        <span className="sender-indicator"></span>
        <span className="sender-name">{message.sender || (isAgent ? 'SyncUp Intake Agent' : 'Caller')}</span>
      </div>
      <div className={`bubble-text-box ${isAgent ? 'agent-box' : 'reporter-box'}`}>
        <p className="bubble-text">{message.body}</p>
      </div>
    </div>
  );
}
