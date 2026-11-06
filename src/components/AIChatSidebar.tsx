'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Place, RideOption } from '@/types';
import {
  Sparkles,
  Send,
  X,
  Bot,
  CreditCard,
  Zap,
  RefreshCw,
  MapPin,
  Car,
  Maximize2,
  Minimize2,
  Compass,
  Calendar,
  Layers,
  Star,
  ExternalLink,
  ChevronRight,
  Clock,
  Navigation,
  Utensils,
  Building2,
  CheckCircle2,
  Eye
} from 'lucide-react';
import { AiActions, MessageItem, MessageAction } from '@/components/ui/ai-actions';
import { getPlacesForLocation, POPULAR_LOCATIONS, LocationState } from '@/lib/mockData';

// Dynamically import SmartMap for the Mindtrip live canvas
const SmartMap = dynamic(() => import('@/components/SmartMap').then((m) => m.SmartMap), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-400 text-xs space-y-2">
      <RefreshCw className="w-5 h-5 animate-spin text-sky-400" />
      <span>Loading Interactive Mindtrip Map...</span>
    </div>
  ),
});

interface AIChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCity: string;
  currency: 'INR' | 'USD';
  onOpenCheckout: (place: Place, ride?: RideOption) => void;
  initialPrompt?: string;
}

type CanvasTab = 'map' | 'places' | 'itinerary' | 'fares';

export const AIChatSidebar: React.FC<AIChatSidebarProps> = ({
  isOpen,
  onClose,
  selectedCity,
  currency,
  onOpenCheckout,
  initialPrompt,
}) => {
  const router = useRouter();

  // Mode: compact sidebar vs full Mindtrip split-canvas studio
  const [isMindtripStudio, setIsMindtripStudio] = useState(false);
  const [activeCanvasTab, setActiveCanvasTab] = useState<CanvasTab>('map');
  const [selectedCanvasPlace, setSelectedCanvasPlace] = useState<Place | null>(null);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [toolResult, setToolResult] = useState<any>(null);
  const [isFocused, setIsFocused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Places for the currently active city
  const cityLocation: LocationState =
    POPULAR_LOCATIONS.find((l) => l.name.toLowerCase().includes(selectedCity.toLowerCase())) ||
    POPULAR_LOCATIONS[0];
  const cityPlaces = getPlacesForLocation(selectedCity, cityLocation.lat, cityLocation.lng, 'all');

  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hi! I am Travelo, your Mindtrip-style AI travel companion for **${selectedCity}**. Ask me to curate day-by-day itineraries, discover hidden cafes, compare transparent cab fares, or explore top heritage spots!`,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'done',
      feedback: null,
    },
  ]);

  useEffect(() => {
    if (isOpen && initialPrompt && initialPrompt.trim()) {
      handleSendMessage(initialPrompt.trim());
    }
  }, [isOpen, initialPrompt]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsgId = Date.now().toString();
    const userMsg: MessageItem = {
      id: userMsgId,
      role: 'user',
      content: query,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'done',
    };

    const assistantMsgId = (Date.now() + 1).toString();
    const assistantPlaceholder: MessageItem = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'streaming',
      feedback: null,
    };

    setMessages((prev) => [...prev, userMsg, assistantPlaceholder]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          city: selectedCity,
          conversationHistory: messages.map((m) => ({ sender: m.role, text: m.content })),
        }),
      });

      if (!res.ok) throw new Error('Travelo API returned non-200');

      const data = await res.json();
      setToolResult(data.toolResult || null);

      // If the query asks for itinerary or fares, switch canvas tab to provide immediate visual feedback
      if (query.toLowerCase().includes('itinerary') || query.toLowerCase().includes('day') || query.toLowerCase().includes('plan')) {
        setActiveCanvasTab('itinerary');
      } else if (query.toLowerCase().includes('fare') || query.toLowerCase().includes('cab') || query.toLowerCase().includes('taxi') || query.toLowerCase().includes('ride')) {
        setActiveCanvasTab('fares');
      } else if (data.toolResult?.places) {
        setActiveCanvasTab('places');
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? { ...m, content: data.reply || 'No response returned. Please retry.', status: 'done' }
            : m
        )
      );
    } catch (err) {
      console.error('Travelo AI error:', err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? { ...m, content: 'Sorry, I encountered an issue. Please click Retry below.', status: 'error' }
            : m
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (action: MessageAction, messageId: string) => {
    if (action === 'like') {
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, feedback: m.feedback === 'like' ? null : 'like' } : m))
      );
    } else if (action === 'dislike') {
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, feedback: m.feedback === 'dislike' ? null : 'dislike' } : m))
      );
    } else if (action === 'retry') {
      const targetIdx = messages.findIndex((m) => m.id === messageId);
      const prevUserMsg = [...messages.slice(0, targetIdx)].reverse().find((m) => m.role === 'user');
      if (prevUserMsg) {
        setMessages((prev) => prev.filter((m) => m.id !== messageId));
        handleSendMessage(prevUserMsg.content);
      }
    }
  };

  const handleBookToolRecommendation = (res: any) => {
    if (res.type === 'payment_created') {
      const params = new URLSearchParams({
        title: res.data.placeName || 'Curated Experience',
        amount: (res.data.amountINR || 1200).toString(),
        type: 'experience',
        details: res.data.description || 'Curated by Travelo AI Assistant',
      });
      router.push(`/checkout?${params.toString()}`);
      onClose();
    }
  };

  const handleDirectPayPalBooking = (place: Place) => {
    const params = new URLSearchParams({
      title: place.name,
      amount: place.avgPrice.toString(),
      type: place.category === 'hotel' ? 'stay' : 'experience',
      details: `${place.popularItem || place.tags.join(', ')} in ${selectedCity}`,
    });
    router.push(`/checkout?${params.toString()}`);
    onClose();
  };

  // Mindtrip-style intent chips
  const mindtripCategoryPills = [
    { label: '🏛️ Top Sights', query: `Top 5 must-visit heritage attractions & photography spots in ${selectedCity}` },
    { label: '🍛 Food & Cafes', query: `Must-try local dishes, iconic street food, and top cafes in ${selectedCity}` },
    { label: '📅 3-Day Itinerary', query: `Create a detailed 3-day day-by-day travel plan for ${selectedCity} with timings and budget` },
    { label: '🚕 Airport Cabs', query: `Compare cab fares and travel duration from airport to ${selectedCity}` },
    { label: '🏨 Heritage Stays', query: `Best boutique hotels and authentic heritage stays in ${selectedCity}` },
    { label: '✨ Hidden Gems', query: `Offbeat viewpoints, sunset spots, and local secrets in ${selectedCity}` },
  ];

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Mindtrip-Style Travelo AI Studio"
      className={`fixed z-50 transition-all duration-300 flex flex-col shadow-2xl ${
        isMindtripStudio
          ? 'inset-2 sm:inset-4 md:inset-6 rounded-3xl overflow-hidden bg-slate-900 border border-slate-700/80'
          : 'inset-y-0 right-0 w-full sm:w-[480px] bg-slate-900 border-l border-slate-800'
      }`}
    >
      {/* Top Header - Mindtrip Branding */}
      <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0 relative z-20">
        
        {/* Left Brand & Active Location */}
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-500 p-0.5 shadow-md shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-sky-400 animate-pulse" />
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-black text-white tracking-tight">Travelo Studio</h3>
              <span className="text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Mindtrip AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              {selectedCity} • Real-Time Map &amp; Multi-Modal Copilot
            </p>
          </div>
        </div>

        {/* Center Canvas Switcher (Only in Studio Mode) */}
        {isMindtripStudio && (
          <div className="hidden md:flex items-center space-x-1 bg-slate-900/90 border border-slate-800 p-1 rounded-2xl">
            <button
              onClick={() => setActiveCanvasTab('map')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeCanvasTab === 'map'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Interactive Map</span>
            </button>
            <button
              onClick={() => setActiveCanvasTab('places')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeCanvasTab === 'places'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Curated Places</span>
            </button>
            <button
              onClick={() => setActiveCanvasTab('itinerary')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeCanvasTab === 'itinerary'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>3-Day Plan</span>
            </button>
            <button
              onClick={() => setActiveCanvasTab('fares')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeCanvasTab === 'fares'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              <span>Fares</span>
            </button>
          </div>
        )}

        {/* Right Controls: Expand / Minimize + Close */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => setIsMindtripStudio(!isMindtripStudio)}
            className="hidden sm:flex items-center space-x-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 px-3 py-1.5 rounded-xl transition-all shadow-sm cursor-pointer"
            title={isMindtripStudio ? 'Switch to Compact Sidebar' : 'Expand to Mindtrip Split Studio Canvas'}
          >
            {isMindtripStudio ? (
              <>
                <Minimize2 className="w-3.5 h-3.5 text-sky-400" />
                <span>Compact</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-sky-400" />
                <span>Mindtrip Studio</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            aria-label="Close Assistant"
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Split Body */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* ==================== LEFT COLUMN: CHAT CONVERSATION ==================== */}
        <div
          className={`flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300 ${
            isMindtripStudio ? 'w-full md:w-[46%] lg:w-[42%]' : 'w-full'
          }`}
        >
          {/* Mindtrip Quick Filter Chips Bar */}
          <div className="px-4 py-2.5 bg-slate-950/70 border-b border-slate-800/80 flex items-center space-x-2 overflow-x-auto scrollbar-none shrink-0">
            {mindtripCategoryPills.map((pill, idx) => (
              <button
                key={idx}
                disabled={loading}
                onClick={() => handleSendMessage(pill.query)}
                className="shrink-0 text-xs font-semibold px-3 py-1 rounded-full bg-slate-800/80 hover:bg-sky-600 hover:text-white text-slate-300 border border-slate-700/80 transition-all shadow-sm whitespace-nowrap cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {pill.label}
              </button>
            ))}
          </div>

          {/* Messages Scroll View */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            <AiActions messages={messages} onAction={handleAction} />

            {/* Typing Loader */}
            {loading && (
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-slate-800 border border-slate-700 text-slate-300 flex items-center space-x-1.5 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-xs text-slate-400 ml-2">Travelo is curating places...</span>
                </div>
              </div>
            )}

            {/* Mindtrip Places Result Card In-Chat */}
            {toolResult?.places && toolResult.places.length > 0 && (
              <div className="rounded-2xl p-4 bg-slate-950 border border-slate-800 shadow-xl space-y-3 mt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs font-bold text-sky-400">
                    <MapPin className="w-4 h-4 text-sky-400" />
                    <span>Mindtrip Curated Spots ({toolResult.places.length})</span>
                  </div>
                  <span className="text-[10px] font-bold bg-sky-500/20 text-sky-300 px-2.5 py-0.5 rounded-full border border-sky-500/30">
                    Verified
                  </span>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {toolResult.places.slice(0, 4).map((p: any, idx: number) => (
                    <div
                      key={p.id || idx}
                      onClick={() => {
                        setSelectedCanvasPlace(p);
                        if (!isMindtripStudio) setIsMindtripStudio(true);
                      }}
                      className="p-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-sky-500/50 transition-all flex items-center justify-between gap-3 group cursor-pointer"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-bold text-xs text-white truncate group-hover:text-sky-300 transition-colors">
                            {p.name}
                          </p>
                          <span className="text-[10px] text-amber-400 flex items-center shrink-0">
                            ★ 4.8
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {p.address || p.category || 'Historic Landmark'}
                        </p>
                      </div>

                      <div className="flex items-center space-x-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSendMessage(`Calculate fares and distance to ${p.name} from current location`);
                          }}
                          className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 transition-colors"
                        >
                          Fares
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDirectPayPalBooking({
                              id: p.id || `osm-${idx}`,
                              name: p.name,
                              category: 'activity',
                              rating: 4.8,
                              reviewsCount: 1200,
                              priceLevel: '₹₹',
                              avgPrice: 850,
                              distanceKm: 2.5,
                              newcomerScore: 95,
                              address: p.address || selectedCity,
                              lat: p.lat || cityLocation.lat,
                              lng: p.lng || cityLocation.lng,
                              imageUrl: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800&auto=format&fit=crop',
                              tags: ['Curated by Travelo AI'],
                              description: p.name,
                            });
                          }}
                          className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-colors flex items-center space-x-1"
                        >
                          <span>Pass</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mindtrip Transit Fares Card */}
            {toolResult?.fares && toolResult.fares.length > 0 && (
              <div className="rounded-2xl p-4 bg-slate-950 border border-slate-800 shadow-xl space-y-3 mt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs font-bold text-amber-400">
                    <Car className="w-4 h-4 text-amber-400" />
                    <span>Transparent Ride Estimates ({toolResult.fares[0]?.distanceKm || ''} km)</span>
                  </div>
                  <span className="text-[10px] font-bold bg-amber-400/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                    Modelled Fares
                  </span>
                </div>

                <div className="space-y-2">
                  {toolResult.fares.slice(0, 3).map((f: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-white">{f.provider}</span>
                        <span className="text-[11px] text-slate-400 ml-2">~{f.durationMinutes} mins</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-black text-sm text-amber-400">₹{f.estimatedPriceINR}</span>
                        <button
                          onClick={() => {
                            const params = new URLSearchParams({
                              title: `${f.provider} Ride (${f.distanceKm || ''} km)`,
                              amount: f.estimatedPriceINR.toString(),
                              type: 'transit',
                              details: `Travel via ${f.provider}`,
                            });
                            router.push(`/checkout?${params.toString()}`);
                            onClose();
                          }}
                          className="text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-sm"
                        >
                          Book with PayPal
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Chat Input Bar */}
          <div className="p-4 bg-slate-950 border-t border-slate-800 shrink-0">
            <div
              className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 transition-all bg-slate-900 border ${
                isFocused ? 'border-sky-500 ring-2 ring-sky-500/20' : 'border-slate-800'
              }`}
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={`Ask Travelo anything about ${selectedCity}...`}
                className="flex-1 bg-transparent text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!input.trim() || loading}
                aria-label="Send message"
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all bg-sky-600 hover:bg-sky-500 text-white disabled:opacity-40 disabled:hover:bg-sky-600 shrink-0 cursor-pointer"
              >
                {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
              <span>Powered by Google Gemini 1.5</span>
              <span>OpenStreetMap &bull; PayPal Orders v2</span>
            </div>
          </div>
        </div>

        {/* ==================== RIGHT COLUMN: MINDTRIP LIVE CANVAS ==================== */}
        {isMindtripStudio && (
          <div className="hidden md:flex flex-1 flex-col bg-slate-950 overflow-hidden relative">
            
            {/* Live Canvas View Switcher Bar */}
            <div className="p-3 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <Layers className="w-4 h-4 text-sky-400" />
                  <span>Mindtrip Live Canvas:</span>
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  {activeCanvasTab === 'map' && 'Interactive OpenStreetMap Radar'}
                  {activeCanvasTab === 'places' && 'Curated Destination Highlights'}
                  {activeCanvasTab === 'itinerary' && 'Personalized 3-Day Plan'}
                  {activeCanvasTab === 'fares' && 'Multi-Modal Cab & Transit Engine'}
                </span>
              </div>

              {/* Quick Tab Buttons */}
              <div className="flex items-center space-x-1">
                {(['map', 'places', 'itinerary', 'fares'] as CanvasTab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveCanvasTab(tab)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-all ${
                      activeCanvasTab === tab
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* TAB 1: INTERACTIVE SMART MAP */}
            {activeCanvasTab === 'map' && (
              <div className="flex-1 relative w-full h-full">
                <SmartMap
                  currentLocation={cityLocation}
                  places={cityPlaces}
                  selectedPlace={selectedCanvasPlace}
                  onSelectPlace={(p) => setSelectedCanvasPlace(p)}
                  onOpenLocationPicker={() => {}}
                />

                {/* Floating Selected Place Info Pill */}
                {selectedCanvasPlace && (
                  <div className="absolute bottom-6 left-6 right-6 z-[400] max-w-md bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl p-4 shadow-2xl text-white flex items-center justify-between gap-4 animate-fade-in">
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">
                        {selectedCanvasPlace.category} • ★ {selectedCanvasPlace.rating}
                      </span>
                      <h4 className="text-sm font-bold truncate text-white">{selectedCanvasPlace.name}</h4>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{selectedCanvasPlace.address}</p>
                    </div>
                    <button
                      onClick={() => handleDirectPayPalBooking(selectedCanvasPlace)}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl shrink-0 transition-colors"
                    >
                      Book ₹{selectedCanvasPlace.avgPrice}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: CURATED PLACES GRID */}
            {activeCanvasTab === 'places' && (
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-black text-white">Recommended Highlights in {selectedCity}</h4>
                  <span className="text-xs text-slate-400 font-mono">{cityPlaces.length} destinations</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {cityPlaces.map((place) => (
                    <div
                      key={place.id}
                      className="bg-slate-900 border border-slate-800 hover:border-sky-500/50 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:scale-[1.01] flex flex-col group"
                    >
                      <div className="relative h-44 w-full overflow-hidden bg-slate-950">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={place.imageUrl}
                          alt={place.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider border border-white/10">
                          {place.category}
                        </div>
                        <div className="absolute top-3 right-3 bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full text-xs font-black flex items-center space-x-1 shadow-md">
                          <Star className="w-3 h-3 fill-slate-950" />
                          <span>{place.rating}</span>
                        </div>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <h5 className="font-bold text-sm text-white group-hover:text-sky-400 transition-colors">
                            {place.name}
                          </h5>
                          <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                            {place.description}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {place.tags.slice(0, 2).map((t, idx) => (
                            <span key={idx} className="text-[10px] font-medium bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md">
                              {t}
                            </span>
                          ))}
                        </div>

                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-slate-400 block">Est. Cost</span>
                            <span className="text-sm font-black text-emerald-400">₹{place.avgPrice}</span>
                          </div>
                          <button
                            onClick={() => handleDirectPayPalBooking(place)}
                            className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md flex items-center space-x-1"
                          >
                            <span>Book with PayPal</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: MINDTRIP DAY-BY-DAY ITINERARY PLANNER */}
            {activeCanvasTab === 'itinerary' && (
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h4 className="text-lg font-black text-white">Mindtrip 3-Day Plan for {selectedCity}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Optimized for culture, local cuisine, and transit efficiency</p>
                  </div>
                  <button
                    onClick={() => router.push('/planner')}
                    className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center space-x-1.5"
                  >
                    <span>Open Full Planner</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Day 1, 2, 3 Timelines */}
                {[
                  {
                    day: 'Day 1',
                    theme: 'Heritage Icons & Royal Old City',
                    morning: 'Historic Monument Walk & Architecture Tour',
                    afternoon: 'Traditional Thali & Artisan Bazaar Exploration',
                    evening: 'Sunset Viewpoint & Iconic Street Food Crawl',
                    cost: '₹1,800',
                  },
                  {
                    day: 'Day 2',
                    theme: 'Art, Culture & Scenic Lakefronts',
                    morning: 'State Museum & Botanical Garden Promenade',
                    afternoon: 'Artisan Village & Handloom Crafts Shopping',
                    evening: 'Lakefront Breeze & Rooftop Dining Under the Stars',
                    cost: '₹2,400',
                  },
                  {
                    day: 'Day 3',
                    theme: 'Culinary Secrets & Modern Landmarks',
                    morning: 'Legendary Breakfast Joint & Specialty Coffee',
                    afternoon: 'Boutique Shopping & Modern Art Pavilion',
                    evening: 'Celebration Dinner & Souvenir Collection',
                    cost: '₹2,100',
                  },
                ].map((plan, idx) => (
                  <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <span className="w-7 h-7 rounded-xl bg-sky-500/20 text-sky-400 font-black text-xs flex items-center justify-center border border-sky-500/30">
                          {idx + 1}
                        </span>
                        <div>
                          <h5 className="font-bold text-sm text-white">{plan.day}: {plan.theme}</h5>
                          <span className="text-[11px] text-slate-400">Full day curated experience</span>
                        </div>
                      </div>
                      <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                        Est. {plan.cost}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-xs">
                      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">🌅 Morning</span>
                        <p className="text-slate-200">{plan.morning}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                        <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block">☀️ Afternoon</span>
                        <p className="text-slate-200">{plan.afternoon}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                        <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">🌙 Evening</span>
                        <p className="text-slate-200">{plan.evening}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 4: TRANSIT & FARES COMPARISON */}
            {activeCanvasTab === 'fares' && (
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h4 className="text-base font-black text-white">Multi-Modal Ride Estimates in {selectedCity}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Transparent fares calculated via OpenStreetMap &amp; OSRM routing</p>
                  </div>
                  <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
                    Live Engine
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { provider: 'Ola Prime Sedan', type: 'Sedan AC', time: '18 mins', inr: 280, badge: 'Popular' },
                    { provider: 'Uber Go Auto', type: 'Auto Rickshaw', time: '22 mins', inr: 140, badge: 'Cheapest' },
                    { provider: 'Rapido Bike Taxi', type: 'Motorbike', time: '14 mins', inr: 75, badge: 'Fastest' },
                    { provider: 'BluSmart EV Cab', type: 'Zero-Emission EV', time: '20 mins', inr: 310, badge: 'Eco Friendly' },
                  ].map((ride, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm text-white">{ride.provider}</span>
                          <span className="text-[10px] font-bold bg-slate-800 text-sky-400 px-2 py-0.5 rounded-full">
                            {ride.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{ride.type} &bull; ~{ride.time}</p>
                      </div>
                      <div className="text-right space-y-1.5">
                        <div className="text-base font-black text-amber-400">₹{ride.inr}</div>
                        <button
                          onClick={() => {
                            const params = new URLSearchParams({
                              title: `${ride.provider} (${selectedCity})`,
                              amount: ride.inr.toString(),
                              type: 'transit',
                              details: `Ride via ${ride.provider}`,
                            });
                            router.push(`/checkout?${params.toString()}`);
                            onClose();
                          }}
                          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-xl transition-colors"
                        >
                          Book
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};

export default AIChatSidebar;
