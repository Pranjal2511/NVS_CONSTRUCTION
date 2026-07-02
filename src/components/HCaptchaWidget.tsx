import React, { useEffect, useRef, useState } from 'react';
import { apiFetch } from '../utils/api';

interface HCaptchaWidgetProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
}

declare global {
  interface Window {
    hcaptcha: any;
  }
}

export default function HCaptchaWidget({ onVerify, onExpire }: HCaptchaWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [siteKey, setSiteKey] = useState<string>('');

  useEffect(() => {
    // Fetch hCaptcha config from the server
    apiFetch('/api/config')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.hcaptchaSiteKey) {
          setSiteKey(data.hcaptchaSiteKey);
        } else {
          // Fallback to test site key
          setSiteKey('10000000-ffff-ffff-ffff-ffffffffffff');
        }
      })
      .catch(() => {
        setSiteKey('10000000-ffff-ffff-ffff-ffffffffffff');
      });
  }, []);

  useEffect(() => {
    if (!siteKey || !containerRef.current) return;

    let checkInterval: NodeJS.Timeout;
    let isRendered = false;

    const renderWidget = () => {
      if (window.hcaptcha && containerRef.current && !isRendered) {
        try {
          const id = window.hcaptcha.render(containerRef.current, {
            sitekey: siteKey,
            theme: 'dark',
            callback: (token: string) => onVerify(token),
            'expired-callback': () => {
              if (onExpire) onExpire();
            },
          });
          widgetIdRef.current = id;
          isRendered = true;
          if (checkInterval) clearInterval(checkInterval);
        } catch (e) {
          // Render failed or script not fully loaded yet
        }
      }
    };

    // Try rendering immediately
    renderWidget();

    // Or poll until window.hcaptcha is available
    if (!isRendered) {
      checkInterval = setInterval(() => {
        if (window.hcaptcha) {
          renderWidget();
        }
      }, 500);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
      if (window.hcaptcha && widgetIdRef.current !== null) {
        try {
          window.hcaptcha.reset(widgetIdRef.current);
        } catch (e) {
          // ignore reset errors on unmount
        }
      }
    };
  }, [siteKey, onVerify, onExpire]);

  return (
    <div className="flex justify-center my-4">
      <div ref={containerRef} className="h-captcha-container"></div>
    </div>
  );
}
