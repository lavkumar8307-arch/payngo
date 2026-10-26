import { supabase, isSupabaseConfigured, BookingRecord, SavedItineraryRecord } from './supabase';

const LOCAL_STORAGE_TRIPS_KEY = 'wanderpay_trips';
const LOCAL_STORAGE_ITINERARIES_KEY = 'wanderpay_saved_itineraries';

/**
 * Save a new confirmed PayPal booking
 */
export async function persistBooking(booking: BookingRecord): Promise<{ success: boolean; data?: any; error?: string }> {
  // 1. Always update local storage for immediate optimistic UI & demo resilience
  if (typeof window !== 'undefined') {
    try {
      const existing = localStorage.getItem(LOCAL_STORAGE_TRIPS_KEY);
      const list = existing ? JSON.parse(existing) : [];
      list.unshift({
        id: booking.order_id,
        orderId: booking.order_id,
        title: booking.title,
        destination: booking.destination,
        travelerName: booking.traveler_name,
        travelerEmail: booking.traveler_email,
        amountINR: booking.amount_inr,
        amountUSD: booking.amount_usd,
        bookingDate: booking.booking_date || new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
        travelDate: booking.travel_date || 'Upcoming',
        status: booking.status || 'Paid',
        paymentMethod: booking.payment_method || 'PayPal Orders API v2',
        qrCodeMock: booking.qr_code_url || `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${booking.order_id}`,
      });
      localStorage.setItem(LOCAL_STORAGE_TRIPS_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('Local storage cache update failed:', e);
    }
  }

  // 2. Persist to Supabase if configured
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert([{
          order_id: booking.order_id,
          title: booking.title,
          destination: booking.destination,
          traveler_name: booking.traveler_name,
          traveler_email: booking.traveler_email,
          amount_inr: booking.amount_inr,
          amount_usd: booking.amount_usd,
          currency: booking.currency || 'INR',
          status: booking.status || 'COMPLETED',
          payment_method: booking.payment_method || 'PayPal Orders API v2',
          qr_code_url: booking.qr_code_url,
          metadata: booking.metadata || {},
        }])
        .select()
        .single();

      if (error) {
        console.warn('Supabase bookings insert error:', error.message);
        return { success: false, error: error.message };
      }
      return { success: true, data };
    } catch (err: any) {
      console.warn('Supabase booking persistence failed:', err);
      return { success: false, error: err.message };
    }
  }

  return { success: true, data: booking };
}

/**
 * Fetch all bookings for a user
 */
export async function fetchBookings(userEmail?: string): Promise<any[]> {
  // If Supabase is connected, query Supabase
  if (isSupabaseConfigured() && supabase) {
    try {
      let query = supabase.from('bookings').select('*').order('created_at', { ascending: false });
      if (userEmail) {
        query = query.eq('traveler_email', userEmail);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        // Map database records to TripItem format for the dashboard
        return data.map((b: any) => ({
          id: b.id || b.order_id,
          orderId: b.order_id,
          title: b.title,
          destination: b.destination,
          travelerName: b.traveler_name,
          travelerEmail: b.traveler_email,
          amountINR: Number(b.amount_inr),
          amountUSD: Number(b.amount_usd),
          bookingDate: new Date(b.booking_date || b.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
          travelDate: b.travel_date ? new Date(b.travel_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Flexible',
          status: b.status,
          paymentMethod: b.payment_method,
          qrCodeMock: b.qr_code_url || `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${b.order_id}`,
        }));
      }
    } catch (err) {
      console.warn('Could not query Supabase bookings:', err);
    }
  }

  // Fallback to local storage
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_TRIPS_KEY);
      if (stored) {
        const list = JSON.parse(stored);
        if (Array.isArray(list) && list.length > 0) {
          return list;
        }
      }
    } catch (e) {
      console.warn('Failed to read trips from localStorage:', e);
    }
  }

  return [];
}

/**
 * Persist a multi-modal trip itinerary
 */
export async function persistItinerary(itinerary: SavedItineraryRecord): Promise<{ success: boolean; data?: any }> {
  if (typeof window !== 'undefined') {
    try {
      const existing = localStorage.getItem(LOCAL_STORAGE_ITINERARIES_KEY);
      const list = existing ? JSON.parse(existing) : [];
      list.unshift(itinerary);
      localStorage.setItem(LOCAL_STORAGE_ITINERARIES_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn(e);
    }
  }

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.from('saved_itineraries').insert([itinerary]).select();
      if (!error) return { success: true, data };
    } catch (err) {
      console.warn('Supabase itinerary insert error:', err);
    }
  }

  return { success: true, data: itinerary };
}
