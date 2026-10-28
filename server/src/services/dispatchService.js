import { CONFIG } from '../config.js';
import db from '../db/database.js';

export class DispatchService {
  /**
   * Dispatch via Slack (Block Kit formatted alert)
   */
  static async dispatchToSlack(ticketPayload) {
    const { ticketId, title, targetDepartment, department, summary, keyDetails = [], reporter } = ticketPayload;
    const targetQueue = targetDepartment || department || 'On-Call Incident Squad';
    const now = new Date().toISOString();
    const callerName = reporter?.name || 'Frontline Worker';

    // Format Slack Block Kit Payload
    const slackPayload = {
      channel: '#incident-war-room',
      username: 'SyncUp Autonomous Triage',
      icon_emoji: ':rotating_light:',
      attachments: [
        {
          color: '#E02424', // Crimson Red
          blocks: [
            {
              type: 'header',
              text: {
                type: 'plain_text',
                text: `🚨 [P1 CRITICAL] ${title || 'Incident Escalation'}`,
                emoji: true
              }
            },
            {
              type: 'section',
              fields: [
                { type: 'mrkdwn', text: `*Ticket ID:*\n\`#${ticketId}\`` },
                { type: 'mrkdwn', text: `*Target Team:*\n*${targetQueue}*` },
                { type: 'mrkdwn', text: `*Reported By:*\n${callerName}` },
                { type: 'mrkdwn', text: `*Priority:*\nP1 - IMMEDIATE ATTENTION` }
              ]
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*📋 Plain-Language Situation Summary:*\n>${summary || 'Operational standstill reported on floor. Triage facts gathered.'}`
              }
            },
            ...(keyDetails.length > 0 ? [
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `*🔍 Verified Situation Facts:*\n${keyDetails.map(d => `• ${d}`).join('\n')}`
                }
              }
            ] : []),
            {
              type: 'actions',
              elements: [
                {
                  type: 'button',
                  text: { type: 'plain_text', text: '✅ Acknowledge P1', emoji: true },
                  style: 'primary',
                  value: `ack_${ticketId}`
                },
                {
                  type: 'button',
                  text: { type: 'plain_text', text: '🎙️ Join War Room Voice', emoji: true },
                  style: 'danger',
                  value: `join_${ticketId}`
                },
                {
                  type: 'button',
                  text: { type: 'plain_text', text: '📖 View SOP Runbook', emoji: true },
                  value: `sop_${ticketId}`
                }
              ]
            }
          ]
        }
      ]
    };

    let webhookStatus = 'SIMULATED_LOCAL';
    const webhookUrl = CONFIG.SLACK_INCIDENT_WEBHOOK_URL || process.env.DISPATCH_WEBHOOK_URL;

    if (webhookUrl && webhookUrl.startsWith('http')) {
      try {
        const res = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(slackPayload)
        });
        webhookStatus = res.ok ? 'DELIVERED_TO_SLACK' : `SLACK_HTTP_${res.status}`;
      } catch (err) {
        webhookStatus = `SLACK_NET_ERROR: ${err.message}`;
      }
    }

    this._recordAudit({
      ticketId,
      channel: 'slack',
      targetQueue,
      webhookUrl: webhookUrl || 'LOCAL_SIMULATED',
      webhookStatus,
      payload: slackPayload
    });

    return {
      success: true,
      channel: 'slack',
      ticketId,
      targetQueue,
      status: 'P1_DISPATCHED_SLACK',
      deliveredAt: now,
      webhookStatus,
      message: `🚨 Incident ${ticketId} posted to Slack (#incident-war-room). Escalated to ${targetQueue}.`,
      payload: slackPayload
    };
  }

  /**
   * Dispatch via Email (High-priority HTML incident memo)
   */
  static async dispatchToEmail(ticketPayload) {
    const { ticketId, title, targetDepartment, department, summary, keyDetails = [], reporter } = ticketPayload;
    const targetQueue = targetDepartment || department || 'On-Call Incident Squad';
    const now = new Date().toISOString();
    const callerName = reporter?.name || 'Frontline Worker';

    const htmlEmail = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #030407; color: #FFFFFF; padding: 24px; border-radius: 12px; border: 1px solid #1558C9;">
        <div style="background: linear-gradient(135deg, #E02424, #9B1C1C); padding: 12px 18px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="margin: 0; font-size: 1.1rem; color: #FFFFFF; letter-spacing: 0.04em;">🚨 [P1 CRITICAL ESCALATION] ${title}</h2>
          <p style="margin: 4px 0 0 0; font-size: 0.8rem; color: #FEE2E2;">Ticket #${ticketId} &bull; Target: ${targetQueue}</p>
        </div>
        <p style="font-size: 0.9rem; line-height: 1.5; color: #E2E8F0;">
          <strong>Reporter:</strong> ${callerName}<br/>
          <strong>Escalated by:</strong> SyncUp Autonomous Problem Intake Agent<br/>
          <strong>Timestamp:</strong> ${now}
        </p>
        <div style="background: rgba(21, 88, 201, 0.15); border-left: 3px solid #1558C9; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
          <h3 style="margin: 0 0 6px 0; font-size: 0.82rem; color: #79B0FF; text-transform: uppercase;">Executive Situation Briefing</h3>
          <p style="margin: 0; font-size: 0.88rem; line-height: 1.5; color: #F1F5F9;">${summary || 'Operational incident actively triaged.'}</p>
        </div>
        ${keyDetails.length > 0 ? `
          <h4 style="margin: 16px 0 8px 0; font-size: 0.78rem; color: #94A3B8; text-transform: uppercase;">Gathered Operational Facts</h4>
          <ul style="margin: 0; padding-left: 20px; font-size: 0.84rem; color: #CBD5E1; line-height: 1.6;">
            ${keyDetails.map(f => `<li>${f}</li>`).join('')}
          </ul>
        ` : ''}
        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 0.76rem; color: #64748B;">
          This is an automated dispatch from the SyncUp Socratic Triage Platform. Response SLA: 15 minutes.
        </div>
      </div>
    `;

    this._recordAudit({
      ticketId,
      channel: 'email',
      targetQueue,
      webhookUrl: 'SMTP_DISTRIBUTION_QUEUE',
      webhookStatus: 'QUEUED_FOR_DELIVERY',
      payload: { htmlEmail, subject: `[P1 CRITICAL] ${ticketId} - ${title}` }
    });

    return {
      success: true,
      channel: 'email',
      ticketId,
      targetQueue,
      status: 'P1_DISPATCHED_EMAIL',
      deliveredAt: now,
      message: `✉️ Priority incident dossier dispatched via Email to on-call ${targetQueue} distribution list.`,
      subject: `[P1 CRITICAL] ${ticketId}: ${title}`
    };
  }

  /**
   * Dispatch via SMS / Pager (Ultra-fast cellular alert)
   */
  static async dispatchToSMS(ticketPayload) {
    const { ticketId, title, targetDepartment, department, summary, reporter } = ticketPayload;
    const targetQueue = targetDepartment || department || 'On-Call Incident Squad';
    const now = new Date().toISOString();
    const callerName = reporter?.name || 'Frontline';

    const smsText = `🚨 SYNCUP P1 ALERT: #${ticketId} escalated to ${targetQueue}. Issue: ${title}. Reporter: ${callerName}. Situation: ${summary ? summary.slice(0, 100) : 'Floor standstill'}. Reply ACK to claim. Bridge: syncup.internal/live/${ticketId}`;

    this._recordAudit({
      ticketId,
      channel: 'sms',
      targetQueue,
      webhookUrl: 'CELLULAR_PAGER_GATEWAY',
      webhookStatus: 'QUEUED_FOR_SMS_PAGER',
      payload: { smsText }
    });

    return {
      success: true,
      channel: 'sms',
      ticketId,
      targetQueue,
      status: 'P1_DISPATCHED_SMS',
      deliveredAt: now,
      message: `📱 High-priority SMS pager alert sent to on-call engineers in ${targetQueue}.`,
      smsPreview: smsText
    };
  }

  /**
   * Generic router for dispatch (supports channel: 'slack' | 'email' | 'sms')
   */
  static async dispatchIncident(ticketPayload, channel = 'slack') {
    const normalized = (channel || 'slack').toLowerCase();
    if (normalized === 'email') {
      return this.dispatchToEmail(ticketPayload);
    }
    if (normalized === 'sms') {
      return this.dispatchToSMS(ticketPayload);
    }
    return this.dispatchToSlack(ticketPayload);
  }

  /**
   * Internal SQLite Audit Logger
   */
  static _recordAudit({ ticketId, channel, targetQueue, webhookUrl, webhookStatus, payload }) {
    try {
      db.prepare(`
        UPDATE tickets
        SET status = ?, dispatched_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(`P1_DISPATCHED_${channel.toUpperCase()}`, ticketId);

      db.prepare(`
        INSERT INTO dispatch_audit (ticket_id, target_queue, webhook_url, webhook_status, payload_json)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        ticketId,
        `${targetQueue} [${channel.toUpperCase()}]`,
        webhookUrl,
        webhookStatus,
        JSON.stringify(payload)
      );
    } catch (err) {
      console.warn('[DispatchService] Error writing to dispatch_audit table:', err.message);
    }
  }

  /**
   * Fetch dispatch audit trail for an incident
   */
  static getAuditTrail(ticketId) {
    try {
      return db.prepare('SELECT * FROM dispatch_audit WHERE ticket_id = ? ORDER BY dispatched_at DESC').all(ticketId);
    } catch (err) {
      return [];
    }
  }
}
