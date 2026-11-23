import { adChoiceAllows, GOOGLE_ADS_DESTINATION, GOOGLE_ADS_TAG, META_PIXEL_ID, traceAllowsAds, type PurchaseReceipt } from './ads-measurement';
type Fbq = ((...args: unknown[]) => void) & { callMethod?: (...args: unknown[]) => void; queue?: unknown[]; push?: unknown; loaded?: boolean; version?: string };
declare global { interface Window { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void; fbq?: Fbq; _fbq?: Fbq } }
function loadMetaPixel() {
  if (!window.fbq) {
    const fbq: Fbq = (...args: unknown[]) => { if (fbq.callMethod) fbq.callMethod.apply(fbq, args); else fbq.queue?.push(args); };
    fbq.queue = []; fbq.push = fbq; fbq.loaded = true; fbq.version = '2.0';
    window.fbq = fbq; window._fbq ??= fbq;
  }
  if (!document.querySelector('script[data-meta-pixel]')) {
    window.fbq('consent', 'grant');
    window.fbq('init', META_PIXEL_ID, {}, { agent: 'lovable' });
    window.fbq('track', 'PageView');
    const script = document.createElement('script');
    script.async = true; script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    script.dataset['metaPixel'] = ''; document.head.appendChild(script);
  } else window.fbq('consent', 'grant');
}
let region: Promise<boolean> | undefined;
async function allowed() {
  region ??= fetch('/cdn-cgi/trace', { signal: AbortSignal.timeout(2000) }).then(async r => r.ok && traceAllowsAds(await r.text(), location.hostname)).catch(() => false);
  const regionAllowed = await region;
  return adChoiceAllows(localStorage.getItem('cookie_consent'), (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true, regionAllowed);
}
export async function loadAdsMeasurement() {
  if (!await allowed()) return false;
  window.dataLayer ??= [];
  window.gtag ??= (...args: unknown[]) => { window.dataLayer?.push(args); };
  if (!document.querySelector('script[data-google-ads]')) {
    window.gtag('consent', 'default', { ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted' });
    window.gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', region: ['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE','IT','LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE','IS','LI','NO','GB','CH','CA-QC'] });
    window.gtag('set', 'developer_id.dZjgwMW', true);
    window.gtag('js', new Date());
    window.gtag('config', GOOGLE_ADS_TAG, { send_page_view: false });
    const script = document.createElement('script');
    script.async = true; script.src = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_TAG}`;
    script.dataset['googleAds'] = ''; document.head.appendChild(script);
  }
  loadMetaPixel();
  return true;
}
export async function reportPaidPurchase(receipt: PurchaseReceipt) {
  if (!await loadAdsMeasurement() || !await allowed()) return;
  const key = `ads-purchase-${receipt.transactionId}`;
  if (localStorage.getItem(key)) return;
  window.gtag?.('event', 'conversion', { send_to: GOOGLE_ADS_DESTINATION, transaction_id: receipt.transactionId, value: receipt.value, currency: receipt.currency });
  window.fbq?.('track', 'Purchase', { value: receipt.value, currency: receipt.currency }, { eventID: receipt.transactionId });
  localStorage.setItem(key, 'sent');
}
export function stopAdsMeasurement() {
  window.gtag?.('set', 'user_data', null);
  window.gtag?.('consent', 'update', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
  document.querySelector('script[data-google-ads]')?.remove();
  window.fbq?.('consent', 'revoke');
}
export function refuseAdsMeasurement() {
  localStorage.setItem('cookie_consent', 'denied');
  stopAdsMeasurement();
}