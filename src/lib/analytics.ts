import { logEvent } from 'firebase/analytics';
import { getFirebase } from './firebase';

/**
 * Log a custom event to Firebase Analytics
 * @param eventName Name of the event
 * @param eventParams Optional parameters for the event
 */
export async function trackEvent(eventName: string, eventParams?: Record<string, any>) {
  try {
    const { analytics } = await getFirebase();
    if (analytics) {
      logEvent(analytics, eventName, eventParams);
      console.log(`[Analytics] Event tracked: ${eventName}`, eventParams);
    }
  } catch (e) {
    console.warn(`[Analytics] Failed to track event: ${eventName}`, e);
  }
}

/**
 * Track a page view
 * @param pageName Name of the page/screen
 */
export async function trackPageView(pageName: string) {
  return trackEvent('page_view', {
    page_title: pageName,
    page_location: window.location.href,
    page_path: window.location.pathname
  });
}

/**
 * Track user login
 * @param method Login method (e.g., 'google')
 */
export async function trackLogin(method: string = 'google') {
  return trackEvent('login', { method });
}

/**
 * Track user logout
 */
export async function trackLogout() {
  return trackEvent('logout');
}

/**
 * Track invoice creation
 * @param amount Total amount of the invoice
 * @param currency Currency of the invoice
 */
export async function trackInvoiceCreated(amount: number, currency: string) {
  return trackEvent('invoice_created', {
    value: amount,
    currency: currency
  });
}

/**
 * Track quote creation
 * @param amount Total amount of the quote
 * @param currency Currency of the quote
 */
export async function trackQuoteCreated(amount: number, currency: string) {
  return trackEvent('quote_created', {
    value: amount,
    currency: currency
  });
}
