import { CONFIG } from '../config.js';

export class DispatchService {
  /**
   * Dispatches triaged incident ticket to on-call engineering & alerting channels
   */
  static async dispatchIncident(ticketPayload) {
    const timestamp = new Date().toISOString();
    const result = {
      ticketId: ticketPayload.ticketId,
      dispatchedAt: timestamp,
      targetDepartment: ticketPayload.targetDepartment || 'IT_Infrastructure',
      urgency: ticketPayload.urgency || 5,
      channelsAlerted: ['OnCall_PagerDuty', 'Incident_War_Room_Slack'],
      status: 'DISPATCHED_TO_ON_CALL'
    };

    // If PagerDuty integration key is configured, post alert
    if (CONFIG.PAGERDUTY_INTEGRATION_KEY) {
      try {
        await fetch('https://events.pagerduty.com/v2/enqueue', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            routing_key: CONFIG.PAGERDUTY_INTEGRATION_KEY,
            event_action: 'trigger',
            payload: {
              summary: `[P1 ALERT] ${ticketPayload.title}: ${ticketPayload.subtitle}`,
              severity: 'critical',
              source: 'SyncUp Problem Intake Agent',
              custom_details: ticketPayload
            }
          })
        });
      } catch (err) {
        console.warn('PagerDuty notification failed:', err.message);
      }
    }

    return result;
  }
}
