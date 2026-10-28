import { createApp } from './src/app.js';
import { CONFIG } from './src/config.js';

const app = createApp();
const PORT = CONFIG.PORT;

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 SyncUp Full-Stack Server active on port ${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`📋 Incidents API: http://localhost:${PORT}/api/incidents`);
  console.log(`⚖️ Decisions API: http://localhost:${PORT}/api/decisions/evaluate`);
  console.log(`🚨 Dispatch API: http://localhost:${PORT}/api/dispatch`);
  console.log(`=======================================================`);
});
