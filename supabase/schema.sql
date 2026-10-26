-- ==============================================================================
-- PayNGo - Supabase Database Schema & Migration
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. User Profiles Table (Linked with Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  preferred_currency TEXT DEFAULT 'INR' CHECK (preferred_currency IN ('INR', 'USD')),
  home_city TEXT DEFAULT 'Hyderabad',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone." 
  ON public.profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own profile." 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile." 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Trigger to automatically create a profile on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. PayPal Bookings & Travel Passes Table
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  order_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  destination TEXT NOT NULL,
  traveler_name TEXT NOT NULL,
  traveler_email TEXT NOT NULL,
  amount_inr NUMERIC(10, 2) NOT NULL,
  amount_usd NUMERIC(10, 2) NOT NULL,
  currency TEXT DEFAULT 'INR' NOT NULL,
  status TEXT DEFAULT 'COMPLETED' NOT NULL,
  payment_method TEXT DEFAULT 'PayPal Orders API v2' NOT NULL,
  qr_code_url TEXT,
  booking_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  travel_date TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bookings" 
  ON public.bookings FOR SELECT 
  USING (
    auth.uid() = user_id 
    OR traveler_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR auth.role() = 'service_role'
  );

CREATE POLICY "Anyone or server can insert a booking" 
  ON public.bookings FOR INSERT 
  WITH CHECK (true);

-- Index on Order ID and Traveler Email
CREATE INDEX IF NOT EXISTS idx_bookings_order_id ON public.bookings(order_id);
CREATE INDEX IF NOT EXISTS idx_bookings_email ON public.bookings(traveler_email);

-- 4. Saved Itineraries & Multi-Modal Trip Plans
CREATE TABLE IF NOT EXISTS public.saved_itineraries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  pickup_city TEXT NOT NULL,
  destination_city TEXT NOT NULL,
  distance_km NUMERIC(10, 2) NOT NULL,
  total_cost_inr NUMERIC(10, 2),
  total_cost_usd NUMERIC(10, 2),
  transit_modes TEXT[] DEFAULT ARRAY['cab', 'train', 'bus'],
  itinerary_details JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Saved Itineraries
ALTER TABLE public.saved_itineraries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their saved itineraries" 
  ON public.saved_itineraries FOR ALL 
  USING (auth.uid() = user_id);

-- 5. Community Travel Moments (Photo Drops & Reviews)
CREATE TABLE IF NOT EXISTS public.travel_moments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  author_avatar TEXT,
  city TEXT NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Travel Moments
ALTER TABLE public.travel_moments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view travel moments" 
  ON public.travel_moments FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create travel moments" 
  ON public.travel_moments FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);
