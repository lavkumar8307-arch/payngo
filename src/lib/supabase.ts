import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

/**
 * Checks if Supabase credentials are configured
 */
export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('https://') &&
    !supabaseUrl.includes('your-project-id') &&
    !supabaseAnonKey.includes('your-supabase-anon-key')
  );
};

/**
 * Supabase Browser/Client-side SDK instance
 */
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (null as any);

/**
 * Supabase Server-side Admin SDK instance (for secure API routes)
 */
export const supabaseAdmin = (isSupabaseConfigured() && supabaseServiceRoleKey)
  ? createClient(supabaseUrl, supabaseServiceRoleKey)
  : supabase;

/**
 * TypeScript Data Models for Supabase Database
 */
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
