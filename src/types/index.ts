export type Category = 'all' | 'food' | 'hotel' | 'activity' | 'transit';

export interface Place {
  id: string;
  name: string;
  category: 'food' | 'hotel' | 'activity' | 'transit';
  rating: number;
  reviewsCount: number;
  priceLevel: '₹' | '₹₹' | '₹₹₹' | '₹₹₹₹';
  avgPrice: number; // in INR
  distanceKm: number;
  newcomerScore: number; // 0 - 100
  address: string;
  lat: number;
  lng: number;
  imageUrl: string;
  tags: string[];
  description: string;
  popularItem?: string;
}

export interface RideOption {
  provider: string;
  vehicleType: string;
  estimatedPriceINR: number;
  estimatedPriceUSD: number;
  durationMinutes: number;
  etaMinutes: number;
  co2SavingsKg?: number;
  badge?: 'LOWEST' | 'FASTEST' | 'BEST VALUE' | 'ECO FRIENDLY' | 'POPULAR' | 'Cheapest' | 'Fastest' | 'Best Value' | 'Eco Friendly';
  percentCheaper?: number;
  brandColor?: string;
  bgColor?: string;
  borderColor?: string;
  logoSvg?: string;
  icon?: string;
}

export interface PayPalOrderPayload {
  orderId: string;
  amount: number;
  currency: string;
  description: string;
  itemDetails?: {
    placeName: string;
    rideProvider?: string;
    personCount?: number;
  };
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  toolResult?: {
    type: 'places' | 'rides' | 'payment_created' | 'itinerary';
    data: any;
  };
}

export interface ItinerarySegment {
  mode: 'Train' | 'Bus' | 'Flight' | 'Cab';
  provider: string;
  departure: string;
  arrival: string;
  duration: string;
  durationMin?: number;
  costINR: number;
  type?: 'outbound' | 'return';
  bookingStatus: 'available' | 'reserved';
}

export interface InterCityPlan {
  id: string;
  title: string;
  tier?: 'Cheapest' | 'Fastest' | 'Most Comfortable';
  origin: string;
  destination: string;
  totalCostINR: number;
  totalCostUSD: number;
  segments: ItinerarySegment[];
  recommendedStay?: string;
  totalDuration?: string;
  lastUpdated?: string;
}
