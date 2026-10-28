import React from 'react';

export default function TicketHeader({
  scenarios,
  selectedIdx,
  onSelectScenario,
  ticketId,
  title,
  subtitle
}) {
  return (
    <div className="ticket-header-container">
      {/* Scenario Switcher Tabs */}
      <div className="scenario-tab-bar">
        {scenarios.map((sc, idx) => (
          <button
            key={sc.id}
            className={`scenario-tab-item ${selectedIdx === idx ? 'active' : ''}`}
            onClick={() => onSelectScenario(idx)}
          >
            <span className="tab-ticket-id">#{sc.ticketId}</span>
            <span className="tab-title">{sc.title.split(' - ')[0]}</span>
          </button>
        ))}
      </div>

      <div className="ticket-title-row">
        <div className="ticket-info-group">
          <div className="ticket-code-pill">
            <span className="code-dot"></span>
            <span className="ticket-code">{ticketId}</span>
          </div>
          <h2 className="incident-headline">{title}</h2>
          <p className="incident-subline">{subtitle}</p>
        </div>

        <div className="severity-badge-p1">
          <span className="sev-spark">⚡</span>
          <span className="sev-text">P1 CRITICAL</span>
        </div>
      </div>
    </div>
  );
}
