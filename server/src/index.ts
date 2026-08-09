import 'dotenv/config';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Server } from 'socket.io';
import { registerSocketHandlers } from './sockets/registerHandlers.js';
import type { AppServer } from './sockets/types.js';

const PORT = Number(process.env.PORT ?? 4000);

// dist/index.js -> server/ -> repo root -> client/dist. The client's built assets are
// served from here so the whole app is one same-origin deployment (see client/src/socket.ts).
const CLIENT_DIST = join(fileURLToPath(new URL('.', import.meta.url)), '../../client/dist');

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

async function serveClient(req: IncomingMessage, res: ServerResponse) {
  const pathname = new URL(req.url ?? '/', 'http://localhost').pathname;
  const candidate = join(CLIENT_DIST, pathname === '/' ? 'index.html' : pathname);

  try {
    const body = await readFile(candidate);
    res.writeHead(200, { 'Content-Type': MIME_TYPES[extname(candidate)] ?? 'application/octet-stream' });
    res.end(body);
  } catch {
    // Not a built asset -> a client-side route (e.g. /play/ABCD); hand it index.html
    // and let React Router take over.
    const indexHtml = await readFile(join(CLIENT_DIST, 'index.html'));
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(indexHtml);
  }
}

const httpServer = createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }
  void serveClient(req, res);
});

const io: AppServer = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_ORIGIN ?? '*' },
});

registerSocketHandlers(io);

httpServer.listen(PORT, () => {
  console.log(`GREATER MINDS server listening on :${PORT}`);
});
