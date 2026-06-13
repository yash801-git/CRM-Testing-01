/**
 * Meta Pixel Helper Utility
 * Wraps fbq() calls cleanly so we don't repeat code across the app.
 * The Pixel ID is loaded from environment variables.
 */

declare global {
  interface Window {
    fbq: (...args: any[]) => void;
    _fbq: any;
  }
}

const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID;

/**
 * Initialize the Meta Pixel.
 * Call this once when the app loads.
 */
export function initPixel() {
  if (!PIXEL_ID || PIXEL_ID === 'YOUR_PIXEL_ID_HERE') {
    console.warn('[Meta Pixel] No Pixel ID configured. Set VITE_META_PIXEL_ID in .env to activate.');
    return;
  }

  if (typeof window.fbq === 'function') return; // Already initialized

  // Standard Meta Pixel base code
  (function(f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
    if (f.fbq) return;
    n = f.fbq = function() {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e);
    t.async = true;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

  window.fbq('init', PIXEL_ID);
  window.fbq('track', 'PageView');
}

/**
 * Fire a ViewContent event when the form loads.
 * Tells Facebook: "This person saw the property details."
 */
export function fireViewContentEvent(data: {
  propertyTitle?: string;
  source?: string;
  campaignId?: string;
}) {
  if (typeof window.fbq !== 'function') return;
  window.fbq('track', 'ViewContent', {
    content_name: data.propertyTitle || 'Real Estate Lead Form',
    content_category: 'Real Estate',
    content_ids: [data.campaignId || ''],
    source: data.source || 'CRM Ad Form',
  });
}

/**
 * Fire an InitiateCheckout event when the customer moves to Step 2.
 * Tells Facebook: "This person was engaged enough to enter their details."
 */
export function fireInitiateCheckoutEvent() {
  if (typeof window.fbq !== 'function') return;
  window.fbq('track', 'InitiateCheckout');
}

/**
 * Fire a Lead event when the form is successfully submitted.
 * This is the most important event — Facebook learns who your ideal buyer is.
 */
export function fireLeadEvent(data: {
  name?: string;
  email?: string;
  phone?: string;
  source?: string;
}) {
  if (typeof window.fbq !== 'function') return;
  window.fbq('track', 'Lead', {
    content_name: 'Real Estate Lead',
    content_category: 'Real Estate',
    // Standard fields Facebook uses for audience matching
    fn: data.name?.toLowerCase() || '',
    em: data.email?.toLowerCase() || '',
    ph: data.phone || '',
    source: data.source || 'CRM Ad Form',
  });
}
