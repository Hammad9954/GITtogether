import http from 'http';
import app from './app.js';
import { connectDB, closeDB } from './config/db.js';
import { initSocket } from './services/socketService.js';
import { ENV } from './config/env.js';

const server = http.createServer(app);

// Initialize Socket.IO
const io = initSocket(server);

// Start server
const startServer = async () => {
  try {
    await connectDB();

    server.listen(ENV.PORT, () => {
      console.log(`\n==================================================`);
      console.log(`🚀 Git Together Backend Server running in [${ENV.NODE_ENV}] mode`);
      console.log(`📡 Port: ${ENV.PORT}`);
      console.log(`🔗 API Base: http://localhost:${ENV.PORT}/api/v1`);
      console.log(`🔌 Socket.IO enabled on same port`);
      console.log(`==================================================\n`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

// Graceful shutdown
const shutdown = async () => {
  console.log('\n🛑 Gracefully shutting down Git Together server...');
  server.close(async () => {
    await closeDB();
    console.log('✅ Server and database closed. Exiting process.');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

startServer();

export { server, io };
