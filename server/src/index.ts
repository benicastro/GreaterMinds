import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { registerSocketHandlers } from './sockets/registerHandlers.js';
import type { AppServer } from './sockets/types.js';

const PORT = Number(process.env.PORT ?? 4000);

const httpServer = createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }
  res.writeHead(404);
  res.end();
});

const io: AppServer = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_ORIGIN ?? '*' },
});

registerSocketHandlers(io);

httpServer.listen(PORT, () => {
  console.log(`GREATER MINDS server listening on :${PORT}`);
});
