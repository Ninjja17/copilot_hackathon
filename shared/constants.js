/**
 * Shared System Constants across Client and Server
 */
export const COLOR_TOKENS = {
  BG_OBSIDIAN_VOID: '#030407',   // 60% Dominant Void
  COBALT_PRIMARY: '#1558C9',     // 30% Secondary Electric Cobalt Blue
  ELECTRIC_LIME: '#D4FF24',      // 10% High-Voltage Accent
  MINT_SUBTLE: 'rgba(21, 88, 201, 0.14)',
  RUBY_SUBTLE: 'rgba(212, 255, 36, 0.12)'
};

export const EPISTEMIC_CATEGORIES = {
  OBSERVED_FACT: 'observed_fact',
  CRITICAL_UNKNOWN: 'critical_unknown',
  USER_HYPOTHESIS: 'user_hypothesis'
};

export const INCIDENT_SEVERITY = {
  P1_CRITICAL: 'P1_CRITICAL',
  P2_HIGH: 'P2_HIGH',
  P3_MODERATE: 'P3_MODERATE',
  P4_LOW: 'P4_LOW'
};

export const API_ENDPOINTS = {
  INCIDENTS: '/api/incidents',
  DECISIONS: '/api/decisions',
  DISPATCH: '/api/dispatch',
  HEALTH: '/api/health'
};
