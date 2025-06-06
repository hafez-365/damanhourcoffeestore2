// src/lib/analytics.ts

// تعريف واجهة لـ gtag في النافذة
declare global {
  interface Window {
    gtag: (command: string, eventName: string, eventParams?: GtagEventParams) => void;
  }
}

interface GtagEventParams {
  event_category?: string;
  event_label?: string;
  event_value?: number;
  value?: number;
  non_interaction?: boolean;
  page_path?: string;
  [key: string]: unknown; // بدلاً من any
}

export const reportWebVitals = (metricName: string, value: number, id?: string): void => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'web_vitals', {
      event_category: 'Web Vitals',
      event_value: value,
      event_label: metricName,
      non_interaction: true,
    } satisfies GtagEventParams);
  }

  // إرسال البيانات إلى الخادم الخاص بك
  fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ metricName, value, id }),
  }).catch(error => {
    console.error('Failed to send analytics:', error);
  });
};

export const trackPageView = (path: string): void => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'GA_MEASUREMENT_ID', {
      page_path: path,
    } satisfies GtagEventParams);
  }
};

export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
): void => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    } satisfies GtagEventParams);
  }
};