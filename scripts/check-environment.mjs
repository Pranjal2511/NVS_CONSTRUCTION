import net from 'node:net';
import env from '../server/config/env.js';
const server = net.createServer();
server.once('error', () => { console.error('Configured PORT is unavailable. No existing process was stopped.'); process.exitCode = 1; });
server.listen(env.PORT, () => server.close(() => console.log('Configuration loaded and PORT is available.')));
