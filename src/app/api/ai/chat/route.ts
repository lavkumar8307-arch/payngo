import { NextRequest, NextResponse } from 'next/server';
import { calculateFares } from '@/lib/fareEngine';
import { searchOpenStreetMapPlaces, getRoadRoute } from '@/lib/travel-integrations';

export const dynamic = 'force-dynamic';
const SYSTEM = `You are Travelo, PayNGo's India travel assistant. Be accurate and concise. Never claim prices, availability, opening hours, bookings or provider quotes are live unless a connected source confirms them. Use tools for nearby places, route distances and fare estimates. Fare results are modelled estimates, not provider quotes. Never initiate a payment or booking; explain that the user must review and explicitly approve payment separately. Ask for missing origin/destination or coordinates when needed.`;
const declarations = [
  { name: 'search_places', description: 'Find nearby restaurants, attractions or hotels using OpenStreetMap data.', parameters: { type: 'OBJECT', properties: { query: { type: 'STRING', description: 'City, neighborhood or place name' }, category: { type: 'STRING', enum: ['all','food','hotel','activity'] }, limit: { type: 'INTEGER' } }, required: ['query'] } },
  { name: 'calculate_route', description: 'Calculate approximate driving road distance and duration between two coordinate pairs.', parameters: { type: 'OBJECT', properties: { originLat: { type: 'NUMBER' }, originLng: { type: 'NUMBER' }, destinationLat: { type: 'NUMBER' }, destinationLng: { type: 'NUMBER' } }, required: ['originLat','originLng','destinationLat','destinationLng'] } },
  { name: 'estimate_fares', description: 'Estimate transport fares for a known route distance. These are modelled estimates, not live provider quotes.', parameters: { type: 'OBJECT', properties: { distanceKm: { type: 'NUMBER' }, city: { type: 'STRING' } }, required: ['distanceKm'] } }
];
async function executeTool(name: string, args: any) {
  if (name === 'search_places') return { source: 'OpenStreetMap', places: await searchOpenStreetMapPlaces(String(args.query || ''), String(args.category || 'all'), Number(args.limit || 8)) };
  if (name === 'calculate_route') return await getRoadRoute({ lat: Number(args.originLat), lng: Number(args.originLng) }, { lat: Number(args.destinationLat), lng: Number(args.destinationLng) });
  if (name === 'estimate_fares') {
    const distance = Number(args.distanceKm);
    if (!Number.isFinite(distance) || distance <= 0 || distance > 3000) throw new Error('Provide a valid route distance in kilometres');
    return { distanceKm: distance, quoteType: 'MODELLED_ESTIMATE_NOT_LIVE_PROVIDER_QUOTE', fares: calculateFares(distance, 1, String(args.city || '')).map(ride => ({ ...ride, availabilityNote: 'Estimated fare only. Confirm the final price in the provider app.' })) };
  }
  throw new Error('Unknown tool requested');
}
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = String(body.message || '').trim();
    const city = String(body.city || 'India');
    if (!message) return NextResponse.json({ reply: 'Tell me where you are travelling and what you need help with.', toolResult: null });
    const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!key) return NextResponse.json({ reply: 'The AI assistant is not configured yet. Add GEMINI_API_KEY to the server environment.', toolResult: null, modelUsed: 'unavailable' }, { status: 503 });
    const history = Array.isArray(body.conversationHistory) ? body.conversationHistory.slice(-8).map((m: any) => ({ role: m.sender === 'assistant' || m.role === 'assistant' || m.sender === 'agent' ? 'model' : 'user', parts: [{ text: String(m.text || '').slice(0, 4000) }] })) : [];
    const contents: any[] = [];
    for (const item of history) {
      if (contents.length && contents[contents.length - 1].role === item.role) contents[contents.length - 1].parts[0].text += '\n' + item.parts[0].text;
      else contents.push(item);
    }
    if (contents.length && contents[contents.length - 1].role === 'user') contents[contents.length - 1].parts[0].text += '\n' + '[Current city: ' + city + '] ' + message;
    else contents.push({ role: 'user', parts: [{ text: '[Current city: ' + city + '] ' + message }] });
    const toolResults: any[] = [];
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(model) + ':generateContent?key=' + encodeURIComponent(key);
    for (let turn = 0; turn < 3; turn++) {
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ system_instruction: { parts: [{ text: SYSTEM }] }, contents, tools: [{ function_declarations: declarations }], tool_config: { function_calling_config: { mode: 'AUTO' } }, generationConfig: { temperature: 0.4, maxOutputTokens: 900 } }, cache: 'no-store', signal: AbortSignal.timeout(25000) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error?.message || 'Gemini request failed');
      const candidate = data.candidates?.[0];
      const parts = candidate?.content?.parts || [];
      const calls = parts.filter((part: any) => part.functionCall);
      if (!calls.length) {
        const reply = parts.map((part: any) => part.text || '').filter(Boolean).join('\n').trim();
        return NextResponse.json({ reply: reply || 'I could not generate a response. Please try again.', toolResult: toolResults.length ? { type: 'agent_tools', data: toolResults } : null, modelUsed: model });
      }
      contents.push({ role: 'model', parts });
      const functionResponses = [];
      for (const part of calls) {
        const call = part.functionCall;
        try {
          const result = await executeTool(call.name, call.args || {});
          toolResults.push({ tool: call.name, result });
          functionResponses.push({ functionResponse: { name: call.name, response: { result } } });
        } catch (error) {
          functionResponses.push({ functionResponse: { name: call.name, response: { error: error instanceof Error ? error.message : 'Tool failed' } } });
        }
      }
      contents.push({ role: 'user', parts: functionResponses });
    }
    return NextResponse.json({ reply: 'I found some information, but could not complete the full response. Please narrow your request and try again.', toolResult: toolResults.length ? { type: 'agent_tools', data: toolResults } : null, modelUsed: model });
  } catch (error) {
    console.error('PayNGo AI chat error:', error);
    return NextResponse.json({ reply: error instanceof Error ? error.message : 'Travel assistant temporarily unavailable.', toolResult: null }, { status: 502 });
  }
}
