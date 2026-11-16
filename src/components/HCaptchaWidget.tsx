import React, { useEffect, useRef, useState } from 'react';
import { apiFetch } from '../utils/api';
interface HCaptchaWidgetProps { onVerify: (token: string) => void; onExpire?: () => void }
declare global { interface Window { hcaptcha: { render: (element: HTMLElement, options: Record<string, unknown>) => string; remove: (id: string) => void } } }
export default function HCaptchaWidget({ onVerify, onExpire }: HCaptchaWidgetProps) {
  const container = useRef<HTMLDivElement>(null);
  const handlers = useRef({ onVerify, onExpire });
  handlers.current = { onVerify, onExpire };
  const [error, setError] = useState('');
  useEffect(() => {
    let disposed = false; let widget: string | undefined; let timer: ReturnType<typeof setInterval> | undefined;
    apiFetch('/api/config').then(response => { if (!response.ok) throw new Error(); return response.json(); }).then(config => {
      if (disposed || !config.captchaEnabled) return;
      if (!config.hcaptchaSiteKey) throw new Error();
      if (!document.querySelector('script[data-nvs-captcha]')) {
        const script = document.createElement('script'); script.dataset.nvsCaptcha = 'true'; script.async = true;
        script.src = 'https://js.hcaptcha.com/1/api.js?render=explicit'; document.head.appendChild(script);
      }
      let attempts = 0;
      timer = setInterval(() => {
        if (disposed) return;
        if (window.hcaptcha && container.current) {
          clearInterval(timer);
          widget = window.hcaptcha.render(container.current, { sitekey: config.hcaptchaSiteKey, theme: 'dark', callback: (token: string) => handlers.current.onVerify(token), 'expired-callback': () => handlers.current.onExpire?.(), 'error-callback': () => { handlers.current.onExpire?.(); setError('CAPTCHA unavailable. Reload and try again.'); } });
        } else if (++attempts >= 40) { clearInterval(timer); setError('CAPTCHA could not load. Check your connection and reload.'); }
      }, 250);
    }).catch(() => { if (!disposed) setError('CAPTCHA configuration unavailable. Please retry shortly.'); });
    return () => { disposed = true; clearInterval(timer); if (widget && window.hcaptcha) window.hcaptcha.remove(widget); };
  }, []);
  return <div className="flex flex-col items-center my-4"><div ref={container} />{error && <p role="alert" className="text-red-400 text-sm">{error}</p>}</div>;
};
