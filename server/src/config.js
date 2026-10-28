import dotenv from 'dotenv';
dotenv.config();

export const CONFIG = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || null,
  PAGERDUTY_INTEGRATION_KEY: process.env.PAGERDUTY_INTEGRATION_KEY || null,
  SLACK_INCIDENT_WEBHOOK_URL: process.env.SLACK_INCIDENT_WEBHOOK_URL || null
};
