import asyncio
import edge_tts
import os

SCRIPT_TEXT = """
Arriving in an unfamiliar city is exhilarating, but it can also be overwhelming. You find yourself juggling five different apps just to compare ride prices, second-guessing tourist traps, and navigating uncertain checkout flows.

Meet PayNGo, your intelligent AI travel companion built for the PayPal AI Hackathon 2026.

PayNGo brings discovery, multi-modal transit estimation, and trusted payments together into one seamless flow.

Simply ask our AI assistant, Travelo, powered by Gemini 2.5 Flash. Instead of hallucinating, Travelo uses real server-side tool calling. It queries OpenStreetMap and Overpass APIs to discover verified local dining spots and iconic cultural landmarks.

Once you select a destination, PayNGo calculates the exact road driving distance and travel duration using OSRM road routing. Our transparent fare engine immediately evaluates options across bikes, autos, cabs, and metro, showing accurate time, distance, and carbon savings with clear pricing assumptions.

When you are ready to book, there are zero fake simulations. PayNGo integrates deeply with the PayPal Orders API v2. With one click, our server creates an encrypted checkout order. Upon your explicit approval, the payment is captured and verified server-side, issuing a verifiable digital receipt with QR authentication.

From "I don't know where to go" to a verified journey paid seamlessly via PayPal, PayNGo turns travel anxiety into effortless exploration.

PayNGo: Explore with confidence, powered by PayPal.
"""

VOICE = "en-US-ChristopherNeural"  # Professional, crisp, engaging voice
OUTPUT_PATHS = [
    "PayNGo_Demo_Voiceover.mp3",
    "public/PayNGo_Demo_Voiceover.mp3"
]

async def generate():
    print(f"Generating voiceover using neural voice: {VOICE}...")
    communicate = edge_tts.Communicate(SCRIPT_TEXT.strip(), VOICE, rate="+3%", pitch="+0Hz")
    
    # Save to root
    await communicate.save(OUTPUT_PATHS[0])
    print(f"Saved voiceover to {OUTPUT_PATHS[0]}")
    
    # Also save to public folder for web playback
    os.makedirs("public", exist_ok=True)
    import shutil
    shutil.copyfile(OUTPUT_PATHS[0], OUTPUT_PATHS[1])
    print(f"Copied voiceover to {OUTPUT_PATHS[1]}")

if __name__ == "__main__":
    asyncio.run(generate())
