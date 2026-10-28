/**
 * Intelligent Triage Engine for Socratic Incident Clarification
 */
export class TriageEngine {
  static analyzeInput(userText, incidentContext) {
    const text = (userText || '').toLowerCase().trim();
    const newClaims = [];
    let followUp = '';
    let detailBoost = 0.02;

    if (text.includes('firmware') || text.includes('update') || text.includes('deploy') || text.includes('version')) {
      newClaims.push({
        id: Date.now(),
        text: `Investigating change event correlation: "${userText.slice(0, 85)}"`,
        type: 'user_hypothesis',
        confidence: 0.92
      });
      followUp = "Noted on the deployment/update. Did this maintenance change pass standard canary validation, and can on-call Ops initiate a clean rollback without physical device access?";
      detailBoost = 0.04;
    } else if (text.includes('fail') || text.includes('error') || text.includes('crash') || text.includes('timeout') || text.includes('freeze')) {
      newClaims.push({
        id: Date.now(),
        text: `Confirmed failure signature: "${userText.slice(0, 85)}"`,
        type: 'observed_fact',
        confidence: 0.98
      });
      followUp = "Understood. What is the active operational contingency on the ground right now, and what is your hard SLA cutoff before contractual penalties kick in?";
      detailBoost = 0.03;
    } else if (text.includes('manual') || text.includes('paper') || text.includes('slow') || text.includes('bottleneck')) {
      newClaims.push({
        id: Date.now(),
        text: `Operational throughput degradation: manual fallback active`,
        type: 'observed_fact',
        confidence: 0.96
      });
      followUp = "We have achieved sufficient clarity on operational risk and blast radius. Should I dispatch this priority ticket directly to on-call Engineering?";
      detailBoost = 0.05;
    } else if (text.includes('don\'t know') || text.includes('unknown') || text.includes('haven\'t checked') || text.includes('unclear')) {
      newClaims.push({
        id: Date.now(),
        text: `Investigative gap identified: "${userText.slice(0, 85)}"`,
        type: 'critical_unknown',
        confidence: 0.95
      });
      followUp = "Logged as a critical triage unknown for the incident commander. Are there any telemetry monitors or dashboards reporting upstream anomalies?";
      detailBoost = 0.03;
    } else {
      followUp = "I've logged those details into the incident dossier. What is the immediate impact on customer fulfillment or safety right now?";
    }

    return {
      newClaims,
      followUp,
      detailBoost
    };
  }
}
