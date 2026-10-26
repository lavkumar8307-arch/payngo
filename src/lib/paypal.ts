/**
 * PayPal API Helper Module for Server-Side Orders API v2 Integration
 * Handles Create Order & Capture Order endpoints.
 */

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'sb'; // Sandbox default
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || '';
const PAYPAL_API_BASE = process.env.PAYPAL_ENV === 'live' 
  ? 'https://api-m.paypal.com' 
  : 'https://api-m.sandbox.paypal.com';

/**
 * Obtain OAuth2 Access Token from PayPal API
 */
export async function getPayPalAccessToken(): Promise<string> {
  if (!PAYPAL_CLIENT_SECRET || PAYPAL_CLIENT_ID === 'sb') {
    // Return a mock token if credentials aren't provided in .env
    return 'mock_sandbox_access_token_for_demo';
  }

  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    body: 'grant_type=client_credentials',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  if (!response.ok) {
    throw new Error(`PayPal OAuth Failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Create Order via PayPal Orders API v2
 */
export async function createPayPalOrder(amountUSD: number, description: string, placeName: string) {
  const token = await getPayPalAccessToken();

  if (token === 'mock_sandbox_access_token_for_demo') {
    // Generate simulated order ID for instant sandbox demo
    const mockOrderId = `PAYPAL-DEMO-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    return {
      id: mockOrderId,
      status: 'CREATED',
      links: [
        { href: `https://www.sandbox.paypal.com/checkoutnow?token=${mockOrderId}`, rel: 'approve', method: 'GET' }
      ]
    };
  }

  const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: amountUSD.toFixed(2),
          },
          description: `${description} at ${placeName}`,
        },
      ],
      application_context: {
        brand_name: 'PayNGo AI Travel Agent',
        user_action: 'PAY_NOW',
        shipping_preference: 'NO_SHIPPING',
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`PayPal Create Order Error: ${errText}`);
  }

  return await response.json();
}

/**
 * Capture Order via PayPal Orders API v2
 */
export async function capturePayPalOrder(orderId: string) {
  const token = await getPayPalAccessToken();

  if (token === 'mock_sandbox_access_token_for_demo') {
    return {
      id: orderId,
      status: 'COMPLETED',
      payer: {
        name: { given_name: 'Traveler', surname: 'User' },
        email_address: 'traveler-sandbox@payngo.ai',
      },
      purchase_units: [
        {
          payments: {
            captures: [{ id: `CAP-${Date.now()}`, status: 'COMPLETED' }],
          },
        },
      ],
    };
  }

  const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`PayPal Capture Order Error: ${errText}`);
  }

  return await response.json();
}
