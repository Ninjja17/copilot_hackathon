import React from 'react';

export default function DispatchDock({ targetDepartment, isDispatched, onDispatch }) {
  return (
    <div className="dispatch-dock-container">
      <button
        className={`dispatch-primary-btn ${isDispatched ? 'dispatched' : ''}`}
        onClick={onDispatch}
        disabled={isDispatched}
      >
        <span className="btn-icon">{isDispatched ? '✓' : '🚀'}</span>
        <span className="btn-label">
          {isDispatched
            ? `TICKET DISPATCHED TO ${targetDepartment.toUpperCase()} (P1 INCIDENT PAGING ACTIVE)`
            : `DISPATCH TICKET & ESCALATE TO ${targetDepartment.toUpperCase()}`}
        </span>
      </button>
    </div>
  );
}
