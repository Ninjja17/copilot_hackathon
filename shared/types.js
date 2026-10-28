/**
 * Shared Type Schemas & Validator Helpers
 */
export function validateClaim(claim) {
  if (!claim || typeof claim.text !== 'string' || !claim.text.trim()) {
    throw new Error('Claim must contain non-empty text string.');
  }
  const validTypes = ['observed_fact', 'critical_unknown', 'user_hypothesis'];
  if (!validTypes.includes(claim.type)) {
    throw new Error(`Invalid claim type: ${claim.type}. Must be one of: ${validTypes.join(', ')}`);
  }
  return {
    id: claim.id || Date.now() + Math.random(),
    text: claim.text.trim(),
    type: claim.type,
    confidence: typeof claim.confidence === 'number' ? Math.min(1, Math.max(0, claim.confidence)) : 0.95
  };
}

export function validateIncident(incident) {
  if (!incident || !incident.id || !incident.title) {
    throw new Error('Incident must have an id and title.');
  }
  return {
    id: incident.id,
    ticketId: incident.ticketId || `INC-${Math.floor(1000 + Math.random() * 9000)}`,
    title: incident.title,
    subtitle: incident.subtitle || '',
    department: incident.department || 'Operations',
    targetDepartment: incident.targetDepartment || 'IT Infrastructure',
    reporter: incident.reporter || { name: 'Anonymous Reporter', role: 'Staff', location: 'Unknown' },
    urgency: incident.urgency || 3,
    sufficientDetail: incident.sufficientDetail || 0.5,
    matchedSop: incident.matchedSop || 'Standard Operating Procedure',
    impact: incident.impact || 'Standard SLA risk',
    claims: Array.isArray(incident.claims) ? incident.claims.map(validateClaim) : []
  };
}
