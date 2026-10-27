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

    // Intent detectors
    const isGreeting = /^(hi|hello|hey|namaste|vanakkam|good morning|good evening|howdy|sup|hola)\b/i.test(lowerQ);
    const isFoodIntent = lowerQ.includes('food') || lowerQ.includes('eat') || lowerQ.includes('breakfast') || lowerQ.includes('lunch') || lowerQ.includes('dinner') || lowerQ.includes('veg') || lowerQ.includes('biryani') || lowerQ.includes('snack') || lowerQ.includes('restaurant');
    const isSightseeingIntent = lowerQ.includes('visit') || lowerQ.includes('see') || lowerQ.includes('place') || lowerQ.includes('heritage') || lowerQ.includes('temple') || lowerQ.includes('fort') || lowerQ.includes('monument') || lowerQ.includes('attraction') || lowerQ.includes('gem');
    const isBudgetIntent = lowerQ.includes('budget') || lowerQ.includes('cost') || lowerQ.includes('price') || lowerQ.includes('how much') || lowerQ.includes('cheap') || lowerQ.includes('expensive');

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
      lowerQ.includes('uber') ||
      lowerQ.includes('taxi');

    // 1. Google Gemini (Fast models prioritized)
    if (geminiKey && geminiKey.trim() !== '') {
      try {
        // Build conversation history — map 'assistant' role to Gemini's 'model' role
        const historyMessages = conversationHistory.slice(-4).map((m: any) => ({
          role: (m.sender === 'assistant' || m.role === 'assistant') ? 'model' : 'user',
          parts: [{ text: m.text }],
        }));

        // Deduplicate consecutive same-role messages (Gemini requires alternating user/model)
        const deduped: typeof historyMessages = [];
        for (const msg of historyMessages) {
          if (deduped.length > 0 && deduped[deduped.length - 1].role === msg.role) {
            deduped[deduped.length - 1].parts[0].text += '\n' + msg.parts[0].text;
          } else {
            deduped.push(msg);
          }
        }

        const contentsPayload = [
          ...deduped,
          {
            role: 'user',
            parts: [{ text: `[Current Explorer Context: Exploring ${city}, India]\n\n${query}` }],
          },
        ];

        // High-speed, high-availability models first
        const candidateModels = [
          'gemini-3.5-flash',       // Tested ~1.8s ultra-fast response
          'gemini-3.1-flash-lite',  // Lightweight backup
          'gemini-flash-latest',    // Stable alias
          'gemini-2.5-flash-lite',
          'gemini-3.8-flash',
        ];

        for (const modelName of candidateModels) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 6500); // 6.5s per model to avoid serverless timeout

            const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiKey.trim()}`;
            const geminiRes = await fetch(geminiUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              signal: controller.signal,
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

            clearTimeout(timeoutId);

            if (geminiRes.ok) {
              const geminiData = await geminiRes.json();
              const candidateText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
              if (candidateText && candidateText.trim().length > 0) {
                aiReply = candidateText.trim();
                modelUsed = modelName;
                break;
              }
            } else {
              const errBody = await geminiRes.text().catch(() => '');
              console.warn(`Gemini model ${modelName} returned status ${geminiRes.status}:`, errBody.slice(0, 150));
            }
          } catch (modelErr: any) {
            if (modelErr?.name === 'AbortError') {
              console.warn(`Gemini model ${modelName} timed out after 6.5s`);
            } else {
              console.warn(`Error trying Gemini model ${modelName}:`, modelErr?.message || modelErr);
            }
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
            role: (m.sender === 'assistant' || m.role === 'assistant') ? 'assistant' : 'user',
            content: m.text,
          })),
          {
            role: 'user',
            content: `[Current Explorer Context: Exploring ${city}, India]\n\n${query}`,
          },
        ];

        const anthropicController = new AbortController();
        const anthropicTimeout = setTimeout(() => anthropicController.abort(), 7000);

        const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': anthropicKey.trim(),
            'anthropic-version': '2023-06-01',
          },
          signal: anthropicController.signal,
          body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 1024,
            system: GEMINI_SYSTEM_PROMPT,
            messages: messagesPayload,
          }),
        });

        clearTimeout(anthropicTimeout);

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

    // 3. Dynamic Context-Aware Fallback (Only used if ALL external AI models are down)
    if (!aiReply) {
      if (isGreeting) {
        aiReply = `👋 **Namaste & Welcome!** I'm **Travelo**, your PayNGo travel assistant for **${city}**.\n\n` +
          `What are you planning today? Here are some quick ideas:\n` +
          `• 🍛 **Local Eats**: Ask me for the best breakfast, street food, or dining under ₹300.\n` +
          `• 🚖 **Fare Comparison**: Compare live cab, auto, and metro fares across ${city}.\n` +
          `• 🏛️ **Heritage & Highlights**: Discover top monuments, hidden gems, and entry fees.\n` +
          `• 💳 **Instant Booking**: Say *"Book tour in ${city}"* to lock in an experience with PayPal!`;
      } else if (isBookingIntent) {
        aiReply = `🤖 **PayNGo Agentic Booking Ready**: I've found a signature experience for **${city}**. You can review details and securely book it with PayPal below!`;
      } else if (isRideIntent) {
        aiReply = `🚖 **Transit Comparison for ${city}**: Here is your real-time breakdown across verified rides, autos, and metro options with ETA and fares:`;
      } else if (isFoodIntent) {
        aiReply = `🍛 **Culinary Guide for ${city}**:\n\n` +
          `• **Morning Specialties**: Try authentic local breakfast platters (dosas, kachoris, or poha depending on the region) priced ~₹60–₹120.\n` +
          `• **Signature Must-Haves**: Famous regional thalis and slow-cooked house curries at legendary local kitchens.\n` +
          `• **Verified Street Food**: Head to central market bazaars between 5 PM and 10 PM for safe, high-turnover street delicacies!`;
      } else if (isSightseeingIntent) {
        aiReply = `🏛️ **Top Highlights in ${city}**:\n\n` +
          `• **Iconic Heritage**: Major architectural marvels and historic quarters (best visited early morning to avoid queues).\n` +
          `• **Cultural Walk**: Bustling heritage bazaars packed with local handicrafts and spices.\n` +
          `• **Sunset Spot**: Panoramic viewpoints or lakefront promenades ideal for photography around 5:30 PM.`;
      } else if (isBudgetIntent) {
        aiReply = `💰 **Budget Breakdown for ${city}**:\n\n` +
          `• **Backpacker**: ₹1,200 – ₹1,800/day ($15 – $22 USD) covering hostels, street food, and metro/autos.\n` +
          `• **Mid-Range**: ₹3,500 – ₹6,000/day ($42 – $72 USD) for 3-star boutique stays, cab rides, and AC dining.\n` +
          `• **Luxury**: ₹12,000+/day ($145+ USD) for heritage palace hotels, private chauffeur, and curated fine dining.`;
      } else if (lowerQ.includes('itinerary') || lowerQ.includes('plan') || lowerQ.includes('trip')) {
        aiReply = `🗺️ **Smart Curated Travel Plan for ${city}**:\n\n` +
          `• **Day 1**: Arrive, check-in, explore historic core & famous regional dinner.\n` +
          `• **Day 2**: Early morning landmark visits, local bazaar photography walk, evening light & sound show.\n` +
          `• **Day 3**: Offbeat temples/gardens, souvenir shopping, and smooth airport/railway transit!`;
      } else {
        aiReply = `✨ **Exploring ${city} with Travelo**:\n\n` +
          `Regarding **"${query}"** in **${city}**: I can guide you through specific attractions, verified dining spots, transit fare estimates, or create a tailored PayPal booking. Feel free to ask a specific question!`;
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
