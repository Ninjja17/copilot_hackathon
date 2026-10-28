import React from 'react';

export default function MetricsGrid({ sufficientDetail, urgency, department, targetDepartment }) {
  const detailPercent = Math.round((sufficientDetail || 0.96) * 100);

  return (
    <div className="metrics-grid-row">
      {/* Sufficient Detail Meter */}
      <div className="metric-card detail-meter-card">
        <div className="metric-header-row">
          <span className="metric-label">SUFFICIENT DETAIL SCORE</span>
          <span className="metric-value-accent">{detailPercent}%</span>
        </div>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${detailPercent}%` }}
          />
        </div>
        <div className="metric-footnote">
          {detailPercent >= 90 ? 'Ready for Autonomous IT Escalation' : 'Gathering Socratic Clarifications...'}
        </div>
      </div>

      {/* Urgency Level */}
      <div className="metric-card urgency-card">
        <div className="metric-header-row">
          <span className="metric-label">URGENCY SCORE</span>
          <span className="urgency-score-value">LEVEL {urgency || 5} / 5</span>
        </div>
        <div className="urgency-ticks">
          {[1, 2, 3, 4, 5].map((lvl) => (
            <span
              key={lvl}
              className={`tick-pip ${lvl <= (urgency || 5) ? 'active' : ''}`}
            />
          ))}
        </div>
        <div className="metric-footnote">Business Continuity Impact Active</div>
      </div>

      {/* Target Department Routing */}
      <div className="metric-card department-card">
        <div className="metric-header-row">
          <span className="metric-label">TARGET ESCALATION QUEUE</span>
        </div>
        <div className="department-title">{targetDepartment || 'IT Hardware Infrastructure'}</div>
        <div className="metric-footnote">Source: {department}</div>
      </div>
    </div>
  );
}
