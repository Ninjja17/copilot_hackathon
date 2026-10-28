import React from 'react';

export default function SopCard({ matchedSop, impact }) {
  return (
    <div className="sop-impact-row">
      {/* Matched SOP */}
      <div className="sop-card">
        <div className="card-top-tag">
          <span className="tag-spark">📋</span>
          <span>MATCHED COMPANY SOP</span>
        </div>
        <div className="sop-name">{matchedSop || 'SOP-WMS-402: Emergency Rollback Procedure'}</div>
        <div className="sop-sub">Directly linked to on-call playbook & rollback scripts</div>
      </div>

      {/* Financial & SLA Impact */}
      <div className="impact-card">
        <div className="card-top-tag">
          <span className="tag-spark">⚠️</span>
          <span>SLA & REVENUE IMPACT</span>
        </div>
        <div className="impact-statement">{impact || 'SLA Risk: $18,500/hr delay penalty • 420 orders at risk'}</div>
        <div className="impact-sub">Automated financial penalty mitigation protocol</div>
      </div>
    </div>
  );
}
