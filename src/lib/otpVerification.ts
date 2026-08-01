// MSG91 / Phone91 OTP Verification Provider Helper

export interface OTPConfig {
  widgetId: string;
  tokenAuth: string;
  identifier?: string;
  exposeMethods?: boolean | string;
  success?: (data: any) => void;
  failure?: (error: any) => void;
}

declare global {
  interface Window {
    initSendOTP?: (config: OTPConfig) => void;
    sendOTP?: any;
    verifyOTP?: any;
    retryOTP?: any;
  }
}

const DEFAULT_WIDGET_ID = process.env.NEXT_PUBLIC_MSG91_WIDGET_ID || '36686174704f363133353031';
const DEFAULT_TOKEN_AUTH = process.env.NEXT_PUBLIC_MSG91_TOKEN_AUTH || '556476TqAhyUyAB6a6e54adP1';

export function loadMsg91OtpScript(onLoaded?: () => void): void {
  if (typeof window === 'undefined') return;

  if (typeof window.initSendOTP === 'function') {
    onLoaded?.();
    return;
  }

  const urls = [
    'https://verify.msg91.com/otp-provider.js',
    'https://verify.phone91.com/otp-provider.js',
  ];

  let i = 0;
  function attempt() {
    if (i >= urls.length) return;
    const existing = document.querySelector(`script[src="${urls[i]}"]`);
    if (existing) {
      onLoaded?.();
      return;
    }
    const s = document.createElement('script');
    s.src = urls[i];
    s.async = true;
    s.onload = () => {
      onLoaded?.();
    };
    s.onerror = () => {
      i++;
      if (i < urls.length) {
        attempt();
      }
    };
    document.head.appendChild(s);
  }
  attempt();
}

export function triggerMsg91Otp(opts: {
  identifier?: string;
  onSuccess: (data: any) => void;
  onFailure?: (error: any) => void;
}): void {
  if (typeof window === 'undefined') return;

  const config: OTPConfig = {
    widgetId: DEFAULT_WIDGET_ID,
    tokenAuth: DEFAULT_TOKEN_AUTH,
    identifier: opts.identifier || '',
    exposeMethods: true,
    success: (data: any) => {
      console.log('[MSG91 OTP] Success response:', data);
      opts.onSuccess(data);
    },
    failure: (error: any) => {
      console.error('[MSG91 OTP] Failure reason:', error);
      opts.onFailure?.(error);
    },
  };

  loadMsg91OtpScript(() => {
    if (typeof window.initSendOTP === 'function') {
      window.initSendOTP(config);
    } else {
      console.warn('[MSG91 OTP] initSendOTP method not found after loading script.');
    }
  });
}
