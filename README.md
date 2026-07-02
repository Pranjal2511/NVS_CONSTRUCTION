# NVS Buildcon Portfolio

React 19 + Vite frontend with a Node/Express + MongoDB backend for the NVS Buildcon construction and architecture site.

## Deployment Notes

The frontend is designed to deploy as a static Vite build on Netlify. The Express backend must be deployed separately on a Node-capable host such as Railway, Render, Fly.io, or a VPS, with MongoDB Atlas or another reachable MongoDB instance.

No verified live backend host is committed in this repository. The previous `render.yaml` file was removed because the repository did not prove Render is the real deployment target. When the backend URL is known, set it in Netlify as:

```env
VITE_API_URL=https://your-live-backend.example.com
```

If the Express server serves both frontend and backend from the same origin, leave `VITE_API_URL` blank and requests will continue to use same-origin `/api/...` URLs.

Required backend production environment variables:

```env
IS_PRODUCTION=true
CLIENT_URL=https://nvsbuildcon.com
APP_URL=https://your-live-backend.example.com
MONGODB_URI=mongodb+srv://...
JWT_SECRET=<minimum 32 characters>
JWT_REFRESH_SECRET=<minimum 32 characters>
HCAPTCHA_SECRET=...
HCAPTCHA_SITE_KEY=...
```

`JWT_SECRET` and `JWT_REFRESH_SECRET` are required in every environment and the server refuses to start if either is missing or shorter than 32 characters.

## SEO/AEO

The public static build prerenders these routes at build time:

```text
/
/projects
/house-plans
/gallery
/services
/process
/about
/testimonials
/contact
```

`public/sitemap.xml`, `public/robots.txt`, and `public/llms.txt` describe only the public routes and factual business information.
