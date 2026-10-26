import asyncio
import edge_tts
import os

TEXT = """
Traveling to a new country like India is exhilarating, but for foreign travelers and newcomers, navigating local transport fares, authentic spots, and local payment barriers can be intimidating and confusing.

Meet PayNGo — an AI-powered travel companion that turns chaotic travel planning into effortless, trusted discovery, backed by the safety of PayPal.

With PayNGo's intelligent discovery radar powered by Google Gemini, travelers can search in plain English for authentic local spots and transit routes. Our system automatically estimates verified fair rates across rideshare and local transport — eliminating foreigner surge scams and ensuring complete price transparency.

Here is where PayPal takes center stage. Instead of dealing with foreign card declines or unfamiliar local QR systems, PayNGo embeds PayPal Orders API v2 directly into the booking flow. With one click, travelers get an itemized ledger, instant digital entry passes, and bank-grade 256-bit encryption with PayPal Buyer Protection.

Travelers can also capture and contribute real-time memories on our interactive photo clothesline, sharing tips with the global community. Everything is backed by a reactive Supabase PostgreSQL architecture, syncing your booked itineraries, saved routes, and verified reviews in real time across devices.

Built with Next.js, Gemini AI, Supabase, and PayPal, PayNGo bridges the gap between global explorers and authentic local experiences. Safe, smart, and borderless. Thank you for watching!
""".strip()

async def main():
    voice = "en-US-ChristopherNeural"
    output_file = "PayNGo_Demo_Voiceover.mp3"
    print(f"Generating voiceover using {voice}...")
    communicate = edge_tts.Communicate(TEXT, voice=voice, rate="-2%")
    await communicate.save(output_file)
    print(f"Voiceover successfully generated and saved to: {os.path.abspath(output_file)}")
    print(f"File size: {os.path.getsize(output_file)} bytes")

if __name__ == "__main__":
    asyncio.run(main())
