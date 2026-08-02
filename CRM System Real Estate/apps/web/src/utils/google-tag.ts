/**
 * Google Tag Helper Utility
 * Wraps gtag() calls cleanly so we don't repeat code across the app.
 * The Conversion ID is loaded from environment variables.
 */

const GOOGLE_CONVERSION_ID = import.meta.env.VITE_GOOGLE_CONVERSION_ID;

// Use a safe accessor to avoid TypeScript conflicts with the global window type
function gtag(...args: any[]) {
  const w = window as any;
  if (typeof w.gtag === 'function') {
    w.gtag(...args);
  } else if (w.dataLayer) {
    w.dataLayer.push(arguments);
  }
}

/**
 * Initialize the Google Tag.
 * Call this once when the app loads.
 */
export function initGoogleTag() {
  if (!GOOGLE_CONVERSION_ID || GOOGLE_CONVERSION_ID === 'YOUR_GOOGLE_ID_HERE') {
    console.warn('[Google Tag] No Conversion ID configured. Set VITE_GOOGLE_CONVERSION_ID in .env to activate.');
    return;
  }

  const w = window as any;
  if (w.dataLayer && w.gtag) return; // Already initialized

  // Standard Google Tag base code injected dynamically
  w.dataLayer = w.dataLayer || [];
  w.gtag = function() {
    w.dataLayer.push(arguments);
  };
  
  w.gtag('js', new Date());
  w.gtag('config', GOOGLE_CONVERSION_ID);

  const t = document.createElement('script');
  t.async = true;
  t.src = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_CONVERSION_ID}`;
  const s = document.getElementsByTagName('script')[0];
  s.parentNode?.insertBefore(t, s);
}

/**
 * Fire a Conversion event when the form is viewed.
 */
export function fireGoogleViewEvent(data: {
  propertyTitle?: string;
  source?: string;
  campaignId?: string;
}) {
  gtag('event', 'page_view', {
    send_to: GOOGLE_CONVERSION_ID,
    page_title: data.propertyTitle || 'Real Estate Lead Form',
    campaign_id: data.campaignId,
    source: data.source,
  });
}

/**
 * Fire a Conversion event when the form is successfully submitted.
 */
export function fireGoogleLeadEvent(data: {
  name?: string;
  email?: string;
  phone?: string;
  source?: string;
}) {
  gtag('event', 'conversion', {
    send_to: GOOGLE_CONVERSION_ID,
    value: 1.0,
    currency: 'INR',
    transaction_id: new Date().getTime().toString(), // basic deduplication
  });
}
