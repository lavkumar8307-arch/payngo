/** Server-side PayPal Orders API v2 helpers. No simulated payments are returned. */
const clientId = process.env.PAYPAL_CLIENT_ID || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '';
const clientSecret = process.env.PAYPAL_CLIENT_SECRET || '';
const apiBase = process.env.PAYPAL_ENV === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
export async function getPayPalAccessToken(): Promise<string> {
  if (!clientId || !clientSecret) throw new Error('PayPal is not configured. Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET.');
  const auth = Buffer.from(clientId + ':' + clientSecret).toString('base64');
  const response = await fetch(apiBase + '/v1/oauth2/token', { method: 'POST', headers: { Authorization: 'Basic ' + auth, 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'grant_type=client_credentials', cache: 'no-store' });
  if (!response.ok) throw new Error('PayPal authentication failed');
  const data = await response.json();
  if (!data.access_token) throw new Error('PayPal did not return an access token');
  return data.access_token;
}
export async function createPayPalOrder(amountUSD: number, description: string, placeName: string) {
  if (!Number.isFinite(amountUSD) || amountUSD <= 0) throw new Error('A valid positive payment amount is required');
  const token = await getPayPalAccessToken();
  const response = await fetch(apiBase + '/v2/checkout/orders', { method: 'POST', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }, body: JSON.stringify({ intent: 'CAPTURE', purchase_units: [{ description: (description + ' at ' + placeName).slice(0, 127), amount: { currency_code: 'USD', value: amountUSD.toFixed(2) } }], application_context: { brand_name: 'PayNGo', user_action: 'PAY_NOW', shipping_preference: 'NO_SHIPPING' } }), cache: 'no-store' });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.id) throw new Error('PayPal order creation failed: ' + (data.message || response.statusText));
  return data;
}
export async function capturePayPalOrder(orderId: string) {
  if (!orderId || !/^[A-Z0-9-]{8,}$/i.test(orderId)) throw new Error('Invalid PayPal order ID');
  const token = await getPayPalAccessToken();
  const response = await fetch(apiBase + '/v2/checkout/orders/' + encodeURIComponent(orderId) + '/capture', { method: 'POST', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }, cache: 'no-store' });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error('PayPal capture failed: ' + (data.message || response.statusText));
  if (data.status !== 'COMPLETED') throw new Error('PayPal payment is not completed');
  const captures = (data.purchase_units || []).flatMap((unit: any) => unit.payments?.captures || []);
  if (!captures.length || captures.some((capture: any) => capture.status !== 'COMPLETED')) throw new Error('PayPal did not confirm a completed capture');
  return data;
}
