import fs from 'fs';
import path from 'path';
import express from 'express';
import { fileURLToPath } from 'url';
import app from './app.js';
import connectDB from './config/database.js';
import env from './config/env.js';
import logger from './utils/logger.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const setupFrontend = async () => {
  if (env.NODE_ENV !== 'production') {
    logger.info('Starting in development mode with Vite middleware');
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      root: rootDir,
      server: { middlewareMode: true },
      appType: 'custom',
    });

    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      if (req.originalUrl.startsWith('/api')) return next();
      try {
        const template = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf-8');
        const html = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (err) {
        vite.ssrFixStacktrace(err);
        next(err);
      }
    });
  } else {
    logger.info('Starting in production mode');
    const distPath = path.join(rootDir, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res, next) => {
      if (req.originalUrl.startsWith('/api')) return next();
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
};

const startServer = async () => {
  await connectDB();
  await setupFrontend();

  app.use(notFound);
  app.use(errorHandler);

  app.listen(env.PORT, () => {
    logger.info(`NVS Buildcon server running on port ${env.PORT}`);
  });
};

startServer().catch((err) => {
  logger.error('Failed to start server', { message: err.message });
  process.exit(1);
});
