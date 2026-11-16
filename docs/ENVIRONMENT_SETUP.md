# Environment setup — current implementation

## Local configuration

Work from F:\nvs\NVS_CONSTRUCTION. Use npm ci with the committed lockfile. On a fresh checkout only:

    copy .env.example .env

Keep .env private and untracked. Do not paste passwords into chat or put them in shell commands, source code, screenshots or reports. The repair changed the selected database path to nvs_buildcon and generated distinct JWT secrets locally; the existing database password was preserved.

The Atlas hostname was confirmed by the operator against the intended connection string. Retain the confirmed host; never guess another cluster based on Compass history. Include /nvs_buildcon before any query options. Percent-encode reserved characters in the username/password only; do not encode the entire URI. Atlas authentication defaults and authSource must match the database-user setup.

## Database troubleshooting

    npm run db:check

This uses the same connection configuration as the application, pings, closes the connection and returns a failure exit code if unavailable. It does not insert records or create collections. A successful ping does not mean the database contains starter content.

If it fails: verify the Atlas project/Drivers hostname, database name, database user/password, current egress-IP allowlist, cluster availability, SRV DNS, outbound TCP/TLS and local firewall. Do not disable TLS or open every IP as a convenience. The actual configured Atlas connection succeeded during this repair. Startup performs at most three bounded attempts. Following a failed initial development connection, correct configuration and restart. After an established connection drops, driver reconnection/lifecycle events update readiness.

## JWT and cookies

JWT_SECRET and JWT_REFRESH_SECRET must be different, non-placeholder, cryptographically random values of at least 32 characters. The local identical secrets were rotated during repair. Do not reuse example strings. Passwords are hashed with bcrypt using BCRYPT_ROUNDS.

NODE_ENV=production forces production cookie/security settings, even if IS_PRODUCTION is false. IS_PRODUCTION=true also enables production protections for staging. Default SameSite is lax; COOKIE_SAME_SITE=none is supported only with production Secure cookies for HTTPS frontend/backend on different sites. Third-party-cookie policies can still block unrelated domains; same-site hosting is preferable.

APP_URL and CLIENT_URL define exact allowed origins. No wildcard Vercel origins are allowed. Browser cookie-authenticated writes require a permitted Origin; automated HTTP clients using cookies must supply that configured Origin. Tokens are not returned to browser JSON/localStorage. Old raw refresh tokens are invalidated by the new hashed storage/secret rotation; sign in again.

## SMTP / Resend

EMAIL_PROVIDER=smtp uses SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS and SMTP_FROM. Choose port 587 with false for STARTTLS, or 465 with true for implicit TLS. Mismatches are rejected. Gmail requires suitable account configuration and an App Password, not a normal account password. The observed response was EAUTH/535: credentials were rejected.

    npm run email:verify

This verifies connectivity/authentication only. No message is sent. After fixing credentials, an operator can explicitly request a delivery test:

    node scripts/test-email.mjs --send recipient@example.com

Use only an approved recipient and verify actual inbox delivery. Provider acceptance alone is not proof of inbox receipt. EMAIL_PROVIDER=resend requires a valid RESEND_API_KEY and an authorized sender domain in SMTP_FROM; no automatic provider fallback obscures failure. SMTP verification is not a Resend deliverability test. [Nodemailer SMTP documentation](https://nodemailer.com/smtp) describes verify() limitations.

## Administrator and content

Use the explicit plan in CURRENT_PROJECT_STATUS.md. ADMIN_SEED_EMAIL/ADMIN_SEED_PASSWORD are only for bootstrap-admin.mjs, not content seeding. Password must be 12–72 characters with upper/lower/number/symbol, with no predictable default. Existing accounts are not promoted. Ordinary startup never initializes an admin.

The content initializer creates missing records and declared indexes only with --apply --confirm matching --database. Run one initializer at a time. Production mode is rejected; production provisioning needs a separate reviewed operator procedure. No initializer was run in this repair.

## Other services

HCAPTCHA_SECRET and HCAPTCHA_SITE_KEY must match the intended domain. Unconfigured CAPTCHA is only bypassed in local nonproduction mode; configured provider outages fail closed. The frontend obtains public configuration from /api/config and submits the challenge token.

Cloudinary requires real cloud name/key/secret, not example values. Local uploads are available in development; production refuses unconfigured persistent storage. Upload MIME/extension/size checks do not replace malware/content scanning or private-document authorization.

TWILIO_SMS_FROM plus the configured Twilio credentials are needed for actual phone OTP. Phone ownership must be established before phone login; no enrollment UI exists yet. Use email login. WhatsApp notification sending remains a separate optional integration.

## Ports

npm run dev uses PORT (default 3000) for both UI and API. npm run dev:client uses 3001 and proxies to 3000. Add its exact origin to CLIENT_URL if browser-origin writes through that setup are required. An occupied port produces a meaningful error; no arbitrary process is terminated. Do not run both full-stack launchers on port 3000.
