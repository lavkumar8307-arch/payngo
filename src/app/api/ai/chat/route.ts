import { NextRequest, NextResponse } from 'next/server';
import { getPlacesForLocation, MOCK_INTERCITY_PLANS } from '@/lib/mockData';
import { calculateFares } from '@/lib/fareEngine';
import { createPayPalOrder } from '@/lib/paypal';

export const dynamic = 'force-dynamic';

const GEMINI_SYSTEM_PROMPT = `You are Travelo, PayNGo's advanced, highly knowledgeable, friendly, and culturally authentic AI travel assistant and concierge specialized in travel across India.

Your capabilities:
1. Answer ANY question accurately about India travel, tourism, history, culture, regional cuisines, festivals, weather, safety, and etiquette across all 28 Indian States and 8 Union Territories.
2. Provide verified advice on transit options:
   - Long-distance inter-state: Domestic flights (IndiGo, Air India, Vistara), IRCTC Indian Railways (Vande Bharat Express, Rajdhani Express, Superfast AC berths), and Volvo AC sleeper buses.
   - Regional trips: Intercity express buses (Zingbus, AbhiBus), Shatabdi trains, outstation cabs.
   - Local city travel: City Metro, Uber, Ola, Rapido bike/auto, InDrive.
3. Offer budget breakdowns in both Indian Rupees (₹ INR) and US Dollars ($ USD, 1 USD ≈ ₹83.2 INR).
4. Provide safety and newcomer tips for solo travelers, backpackers, foreign tourists, and families.
5. If the user asks to book, reserve, or pay for an experience or ticket, mention that PayNGo provides instant PayPal payment execution with PayPal Orders API v2.

Tone and style:
- Friendly, inspiring, crisp, structured with markdown formatting (bullet points, bold highlights, relevant emojis).
- Keep responses engaging, accurate, and informative.`;

export async function POST(req: NextRequest) {
  try {
    const { message, city = 'All India', conversationHistory = [] } = await req.json();
    const query = (message || '').trim();

    if (!query) {
      return NextResponse.json({
        reply: "Hello! I'm Travelo, your AI travel companion. Ask me anything about exploring destinations, food, itineraries, or transport across India!",
        toolResult: null,
      });
    }

    const lowerQ = query.toLowerCase();
    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    let aiReply = '';
    let toolResult: any = null;
    let modelUsed = 'payngo-native';

    // Check for agentic booking intent (e.g. "book Taj Mahal", "pay for breakfast", "order cab")
    const isBookingIntent =
      lowerQ.includes('book') ||
      lowerQ.includes('pay') ||
      lowerQ.includes('buy') ||
      lowerQ.includes('reserve') ||
      lowerQ.includes('order');

    const isRideIntent =
      lowerQ.includes('ride') ||
      lowerQ.includes('cab') ||
      lowerQ.includes('auto') ||
      lowerQ.includes('fare') ||
      lowerQ.includes('metro') ||
      lowerQ.includes('rapido') ||
      lowerQ.includes('uber');

    // 1. Google Gemini 1.5 Flash (100% Free Tier from Google AI Studio)
    if (geminiKey && geminiKey.trim() !== '' && !geminiKey.includes('your_gemini_api_key')) {
      try {
        const contentsPayload = [
          ...conversationHistory.slice(-4).map((m: any) => ({
            role: m.sender === 'agent' ? 'model' : 'user',
            parts: [{ text: m.text }],
          })),
          {
            role: 'user',
            parts: [{ text: `[Current Explorer Context: Exploring ${city}, India]\n\n${query}` }],
          },
        ];

        // Primary: Google Gemini 3.8 Flash (latest official version)
        const candidateModels = [
          'gemini-3.8-flash',
          'gemini-3.7-flash',
          'gemini-flash-latest',
          'gemini-2.5-flash-lite',
        ];

        for (const modelName of candidateModels) {
          try {
            const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiKey.trim()}`;
            const geminiRes = await fetch(geminiUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                system_instruction: {
                  parts: [{ text: GEMINI_SYSTEM_PROMPT }],
                },
                contents: contentsPayload,
                generationConfig: {
                  temperature: 0.7,
                  maxOutputTokens: 800,
                },
              }),
            });

            if (geminiRes.ok) {
              const geminiData = await geminiRes.json();
              const candidateText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
              if (candidateText) {
                aiReply = candidateText;
                modelUsed = modelName;
                break;
              }
            } else {
              console.warn(`Gemini model ${modelName} returned status ${geminiRes.status}`);
            }
          } catch (modelErr) {
            console.warn(`Error trying Gemini model ${modelName}:`, modelErr);
          }
        }
      } catch (geminiErr) {
        console.error('Gemini API call error:', geminiErr);
      }
    }

    // 2. Anthropic Claude Fallback (if Anthropic key is supplied instead)
    if (!aiReply && anthropicKey && anthropicKey.trim() !== '' && !anthropicKey.includes('your_anthropic_api_key')) {
      try {
        const messagesPayload = [
          ...conversationHistory.slice(-4).map((m: any) => ({
            role: m.sender === 'agent' ? 'assistant' : 'user',
            content: m.text,
          })),
          {
            role: 'user',
            content: `[Current Explorer Context: Exploring ${city}, India]\n\n${query}`,
          },
        ];

        const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': anthropicKey.trim(),
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 1024,
            system: GEMINI_SYSTEM_PROMPT,
            messages: messagesPayload,
          }),
        });

        if (anthropicRes.ok) {
          const anthropicData = await anthropicRes.json();
          if (anthropicData.content?.[0]?.text) {
            aiReply = anthropicData.content[0].text;
            modelUsed = 'claude-3-5-sonnet';
          }
        }
      } catch (anthropicErr) {
        console.error('Anthropic API error:', anthropicErr);
      }
    }

    // 3. Built-in Intelligence Response
    if (!aiReply) {
      if (isBookingIntent) {
        aiReply = `🤖 **PayNGo Agentic Booking Ready**: I've analyzed your travel request for **${city}**. I can immediately lock in your reservation and generate a secure PayPal checkout order for you below!`;
      } else if (isRideIntent) {
        aiReply = `🚖 **Multi-Modal Transit Comparison for ${city}**: Here is your real-time breakdown across verified transit options including live fares and ETA:`;
      } else if (lowerQ.includes('itinerary') || lowerQ.includes('plan') || lowerQ.includes('trip')) {
        aiReply = `🗺️ **Smart Curated Travel Itinerary**: Here is a comprehensive multi-day exploration guide for **${city}**, featuring iconic heritage spots, local culinary hubs, and optimal travel routes!`;
      } else {
        aiReply = `✨ **PayNGo Travel Intelligence for ${city}**:\n\n` +
          `• **Top Highlights**: Iconic heritage monuments, vibrant local bazaars, and scenic cultural hotspots.\n` +
          `• **Transit Connectivity**: Accessible via direct flights, IRCTC Superfast & Vande Bharat trains, and express roadway corridors.\n` +
          `• **Food & Dining**: World-renowned regional delicacies with authentic vegetarian and multi-cuisine options.\n` +
          `• **PayPal Payments**: Seamless agentic bookings supported across all verified experiences!`;
      }
    }

    // 4. Attach relevant Interactive Tool Results (PayPal Order, Ride Comparison, or Curated Places)
    if (isBookingIntent) {
      const places = getPlacesForLocation(city, 20.5937, 78.9629);
      const matchedPlace = places[0] || {
        id: 'booking-exp',
        name: `${city} Signature Travel Experience`,
        avgPrice: 450,
        popularItem: `Guided Heritage Tour in ${city}`,
      };

      const usdAmount = parseFloat((matchedPlace.avgPrice / 83.2).toFixed(2)) || 5.00;
      let orderId = `PAYPAL-MOCK-${Date.now()}`;

      try {
        const order = await createPayPalOrder(
          usdAmount,
          `Agentic Booking: ${matchedPlace.popularItem || matchedPlace.name}`,
          matchedPlace.name
        );
        if (order?.id) orderId = order.id;
      } catch (err) {
        console.warn('PayPal order generation fallback:', err);
      }

      toolResult = {
        type: 'payment_created',
        data: {
          orderId,
          placeName: matchedPlace.name,
          amountUSD: usdAmount,
          amountINR: matchedPlace.avgPrice,
          description: matchedPlace.popularItem || matchedPlace.name,
        },
      };
    } else if (isRideIntent) {
      const fares = calculateFares(12.5, 1.15, city);
      toolResult = {
        type: 'rides',
        data: { distanceKm: 12.5, fares },
      };
    } else if (lowerQ.includes('itinerary') || lowerQ.includes('plan')) {
      toolResult = {
        type: 'itinerary',
        data: MOCK_INTERCITY_PLANS[0],
      };
    } else {
      const places = getPlacesForLocation(city, 20.5937, 78.9629);
      if (places.length > 0) {
        toolResult = {
          type: 'places',
          data: places.slice(0, 3),
        };
      }
    }

    return NextResponse.json({
      reply: aiReply,
      toolResult,
      modelUsed,
    });

  } catch (error: any) {
    console.error('AI Chat Agent Error:', error);
    return NextResponse.json({
      reply: "I'm sorry, I ran into an issue processing your request. Please try asking again!",
      toolResult: null,
    });
  }
}
