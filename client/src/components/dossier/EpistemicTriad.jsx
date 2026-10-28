import React from 'react';

export default function EpistemicTriad({ claims = [] }) {
  const facts = claims.filter(c => c.type === 'observed_fact');
  const unknowns = claims.filter(c => c.type === 'critical_unknown');
  const hypotheses = claims.filter(c => c.type === 'user_hypothesis');

  return (
    <div className="epistemic-triad-container">
      <div className="triad-section-header">
        <span className="triad-title">EPISTEMIC CLAIMS BREAKDOWN</span>
        <span className="triad-count-badge">{claims.length} Extracted Claims</span>
      </div>

      <div className="triad-columns-grid">
        {/* Column 1: Observed Facts */}
        <div className="triad-column facts-column">
          <div className="column-header">
            <span className="col-badge fact-badge">OBSERVED FACTS ({facts.length})</span>
          </div>
          <div className="claims-list">
            {facts.map((claim) => (
              <div key={claim.id} className="claim-card fact-card">
                <p className="claim-text">{claim.text}</p>
                <div className="claim-footer">
                  <span className="confidence-pill">
                    {Math.round((claim.confidence || 0.95) * 100)}% Conf
                  </span>
                  <span className="claim-verified-tag">VERIFIED</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Critical Unknowns */}
        <div className="triad-column unknowns-column">
          <div className="column-header">
            <span className="col-badge unknown-badge">CRITICAL UNKNOWNS ({unknowns.length})</span>
          </div>
          <div className="claims-list">
            {unknowns.map((claim) => (
              <div key={claim.id} className="claim-card unknown-card">
                <p className="claim-text">{claim.text}</p>
                <div className="claim-footer">
                  <span className="confidence-pill">
                    {Math.round((claim.confidence || 0.94) * 100)}% Weight
                  </span>
                  <span className="claim-clarify-tag">SOCRATIC TARGET</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: User Hypotheses */}
        <div className="triad-column hypotheses-column">
          <div className="column-header">
            <span className="col-badge hypothesis-badge">USER HYPOTHESES ({hypotheses.length})</span>
          </div>
          <div className="claims-list">
            {hypotheses.map((claim) => (
              <div key={claim.id} className="claim-card hypothesis-card">
                <p className="claim-text">{claim.text}</p>
                <div className="claim-footer">
                  <span className="confidence-pill">
                    {Math.round((claim.confidence || 0.90) * 100)}% Prob
                  </span>
                  <span className="claim-tentative-tag">TENTATIVE</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
