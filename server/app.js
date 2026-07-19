import express from 'express';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import path from 'path';
import { fileURLToPath } from 'url';
import env from './config/env.js';
import { helmetMiddleware, corsMiddleware } from './middleware/security.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import apiRoutes from './routes/index.js';
import { verifyAccessToken } from './utils/jwt.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.set('trust proxy', 1);

app.use(helmetMiddleware);
app.use(corsMiddleware);

// Add performance and security headers
app.use((req, res, next) => {
  res.setHeader('X-DNS-Prefetch-Control', 'on');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(hpp());
app.use(generalLimiter);

// Protect admin pages in browser requests
app.use((req, res, next) => {
  const url = req.originalUrl;
  
  // Skip API, uploads, static files (files with extensions)
  if (url.startsWith('/api') || url.startsWith('/uploads') || url.includes('.')) {
    return next();
  }

  // Intercept any admin page requests based on secret path
  if (url.startsWith(env.ADMIN_SECRET_PATH)) {
    const token = req.cookies?.accessToken;
    let user = null;

    if (token) {
      try {
        user = verifyAccessToken(token);
      } catch (err) {
        // Token is invalid/expired; clear it and treat user as unauthenticated
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
      }
    }

    // Case 1: Logged-in user is a normal user (role !== 'admin')
    if (user && user.role !== 'admin') {
      res.status(403);
      return res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>403 Forbidden</title>
          <style>
            body {
              background-color: #0a0f18;
              color: #ffffff;
              font-family: 'Inter', system-ui, -apple-system, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              text-align: center;
            }
            .container {
              max-width: 400px;
              padding: 2rem;
              border: 1px solid #c2a649;
              background-color: #111827;
              border-radius: 12px;
              box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
            }
            h1 {
              color: #f59e0b;
              font-size: 2.2rem;
              margin-bottom: 1rem;
            }
            p {
              color: #9ca3af;
              font-size: 1rem;
              line-height: 1.5;
            }
            .spinner {
              border: 3px solid rgba(245, 158, 11, 0.1);
              width: 36px;
              height: 36px;
              border-radius: 50%;
              border-left-color: #f59e0b;
              animation: spin 1s linear infinite;
              margin: 2rem auto 0;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          </style>
          <script>
            setTimeout(function() {
              window.location.href = '/';
            }, 3000);
          </script>
        </head>
        <body>
          <div class="container">
            <h1>403 Forbidden</h1>
            <p>Access denied. Normal users are not allowed to access the admin portal.</p>
            <p>Redirecting to homepage...</p>
            <div class="spinner"></div>
          </div>
        </body>
        </html>
      `);
    }

    // Case 2: Not authenticated and trying to access restricted admin pages (anything except login)
    if (!user && url !== `${env.ADMIN_SECRET_PATH}/login`) {
      return res.redirect(`${env.ADMIN_SECRET_PATH}/login`);
    }
  }

  next();
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api', apiRoutes);

export default app;
