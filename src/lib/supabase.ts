import { createClient } from '@supabase/supabase-js';

export const getSupabaseUrl = (): string => {
  let raw = '';
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project-id')) {
    raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  } else if (typeof window !== 'undefined') {
    raw = localStorage.getItem('payngo_supabase_url') || '';
  }
  if (!raw) return '';
  return raw.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
};

export const getSupabaseAnonKey = (): string => {
  if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes('your-supabase-anon-key')) {
    return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  }
  if (typeof window !== 'undefined') {
    return localStorage.getItem('payngo_supabase_anon_key') || '';
  }
  return '';
};

const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

/**
 * Checks if Supabase credentials are configured
 */
export const isSupabaseConfigured = (): boolean => {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  return Boolean(
    url &&
    key &&
    url.startsWith('https://') &&
    !url.includes('your-project-id') &&
    !key.includes('your-supabase-anon-key')
  );
};

let clientInstance: any = null;
let lastUrl = '';
let lastKey = '';

export const getSupabaseClient = () => {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();

  if (url && key && url.startsWith('https://') && !url.includes('your-project-id')) {
    if (clientInstance && lastUrl === url && lastKey === key) {
      return clientInstance;
    }
    lastUrl = url;
    lastKey = key;
    clientInstance = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
    });
    return clientInstance;
  }
  return null;
};

/**
 * Supabase Browser/Client-side SDK instance Proxy
 */
export const supabase = new Proxy({} as any, {
  get: (_target, prop) => {
    const client = getSupabaseClient();
    if (!client) {
      // Return a safe mock object so calls don't crash when unconfigured
      if (prop === 'auth') {
        return {
          signInWithOAuth: async () => ({ error: new Error('Supabase not configured') }),
          signInWithPassword: async () => ({ error: new Error('Supabase not configured') }),
          signUp: async () => ({ error: new Error('Supabase not configured') }),
          signOut: async () => ({ error: null }),
          getSession: async () => ({ data: { session: null }, error: null }),
          getUser: async () => ({ data: { user: null }, error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
          resetPasswordForEmail: async () => ({ error: new Error('Supabase not configured') }),
        };
      }
      if (prop === 'from') {
        return () => ({
          select: () => ({ error: new Error('Supabase not configured'), data: [] }),
          insert: () => ({ select: () => ({ single: () => ({ error: new Error('Supabase not configured') }) }) }),
          upsert: () => ({ select: () => ({ error: new Error('Supabase not configured') }) }),
        });
      }
      return undefined;
    }
    const val = client[prop];
    return typeof val === 'function' ? val.bind(client) : val;
  },
});

/**
 * Supabase Server-side Admin SDK instance (for secure API routes)
 */
export const supabaseAdmin = (isSupabaseConfigured() && supabaseServiceRoleKey)
  ? createClient(getSupabaseUrl(), supabaseServiceRoleKey)
  : supabase;

/**
 * TypeScript Data Models for Supabase Database
 */
export interface UserProfileRecord {
  id?: string;
  email: string;
  name?: string;
  full_name?: string;
  avatar_url?: string;
  provider?: string;
  created_at?: string;
  updated_at?: string;
  last_sign_in_at?: string;
}

export interface BookingRecord {
  id?: string;
  user_id?: string | null;
  order_id: string;
  title: string;
  destination: string;
  traveler_name: string;
  traveler_email: string;
  amount_inr: number;
  amount_usd: number;
  currency: string;
  status: string;
  payment_method: string;
  qr_code_url?: string;
  booking_date?: string;
  travel_date?: string;
  metadata?: Record<string, any>;
  created_at?: string;
}

export interface SavedItineraryRecord {
  id?: string;
  user_id?: string;
  title: string;
  pickup_city: string;
  destination_city: string;
  distance_km: number;
  total_cost_inr: number;
  total_cost_usd: number;
  transit_modes?: string[];
  itinerary_details: any;
  created_at?: string;
}

export interface TravelMomentRecord {
  id?: string;
  user_id?: string;
  author_name: string;
  author_avatar?: string;
  city: string;
  image_url: string;
  caption: string;
  likes_count?: number;
  created_at?: string;
}
