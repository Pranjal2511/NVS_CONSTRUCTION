import crypto from 'node:crypto';

// Short-lived single-process protection. Use a shared idempotency store before scaling.
const submissions = new Map();
export const duplicateSubmission = (req, res, next) => {
  const now = Date.now();
  for (const [key, entry] of submissions) if (entry.expires <= now) submissions.delete(key);
  const body = Object.fromEntries(Object.entries(req.body).filter(([key]) => key !== 'h-captcha-response').sort(([a], [b]) => a.localeCompare(b)));
  const key = crypto.createHash('sha256').update(JSON.stringify([req.ip, req.originalUrl, body])).digest('hex');
  if (submissions.has(key)) return res.status(409).json({ success: false, message: 'This request is already submitted or being processed. Please wait before submitting it again.' });
  if (submissions.size >= 10000) return res.status(503).json({ success: false, message: 'Submission service busy. Please retry shortly.' });
  const entry = { expires: now + 300000 };
  submissions.set(key, entry);
  res.once('finish', () => { if (res.statusCode >= 400 && submissions.get(key) === entry) submissions.delete(key); });
  next();
};
