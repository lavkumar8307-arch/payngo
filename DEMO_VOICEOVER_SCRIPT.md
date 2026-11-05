# 🎙️ PayNGo Demo Video Script & Voiceover Guide

**Audio File Location:** 
- Root: [`PayNGo_Demo_Voiceover.mp3`](file:///c:/Users/lavku/OneDrive/Desktop/PAYPAL/PayNGo_Demo_Voiceover.mp3)
- Public Web URL: [`/PayNGo_Demo_Voiceover.mp3`](file:///c:/Users/lavku/OneDrive/Desktop/PAYPAL/public/PayNGo_Demo_Voiceover.mp3)
**Generated With:** Microsoft Neural TTS (`en-US-ChristopherNeural` - Crisp, engaging tone)
**Duration:** ~1 minute 15 seconds

---

## 🎬 Timestamped Script & Visual Cue Board

| Time | Voiceover Audio | Video Screen Action (What to Record) |
| :--- | :--- | :--- |
| **0:00 – 0:12** | *"Arriving in an unfamiliar city is exhilarating, but it can also be overwhelming. You find yourself juggling five different apps just to compare ride prices, second-guessing tourist traps, and navigating uncertain checkout flows."* | **Intro Scene:** Open the PayNGo dashboard. Quick zoom-in on the hero header and search bar with the midnight blue glassmorphism theme. |
| **0:12 – 0:21** | *"Meet PayNGo, your intelligent AI travel companion built for the PayPal AI Hackathon 2026."* | **Logo & Tagline:** Show the top navigation bar with the floating brand pill, city selector, and currency toggle (INR / USD). |
| **0:21 – 0:31** | *"PayNGo brings discovery, multi-modal transit estimation, and trusted payments together into one seamless flow."* | **Feature Overview:** Scroll smoothly past the Geolocation Radar Map down to the live place cards. |
| **0:31 – 0:44** | *"Simply ask our AI assistant, Travelo, powered by Gemini 2.5 Flash. Instead of hallucinating, Travelo uses real server-side tool calling. It queries OpenStreetMap and Overpass APIs to discover verified local dining spots and iconic cultural landmarks."* | **AI Assistant in Action:** Click the floating "Ask Travelo AI" button. In the chat drawer, type: *"Find vegetarian lunch in Delhi"*. Show the AI calling OpenStreetMap tools and rendering the live POI cards directly in the chat. |
| **0:44 – 0:58** | *"Once you select a destination, PayNGo calculates the exact road driving distance and travel duration using OSRM road routing. Our transparent fare engine immediately evaluates options across bikes, autos, cabs, and metro, showing accurate time, distance, and carbon savings with clear pricing assumptions."* | **Route & Fare Estimation:** Tap "Fares" on one of the destination cards or open the Ride Calculator modal. Show the real driving distance (e.g. 4.7 km, 6 mins) and the side-by-side comparison (Rapido, Ola, InDrive, Uber, Metro). |
| **0:58 – 1:12** | *"When you are ready to book, there are zero fake simulations. PayNGo integrates deeply with the PayPal Orders API v2. With one click, our server creates an encrypted checkout order. Upon your explicit approval, the payment is captured and verified server-side, issuing a verifiable digital receipt with QR authentication."* | **Verified PayPal Checkout:** Tap "Review & Book". The PayPal drawer opens. Complete the authorization. Show the server capturing the order and displaying the verified digital receipt modal with QR code and download button. |
| **1:12 – 1:20** | *"From 'I don't know where to go' to a verified journey paid seamlessly via PayPal, PayNGo turns travel anxiety into effortless exploration. PayNGo: Explore with confidence, powered by PayPal."* | **Outro:** Click "Print / Download Receipt" to showcase the branded receipt window, then return to the sleek dashboard. Fade to end screen with the live demo link (`payngo-eta.vercel.app`). |

---

## 🛠️ How to Re-generate or Customise the Voice

If you want to re-record or adjust the voice speed or text:
```bash
python scripts/generate_voiceover.py
```
*(Available voices include `en-US-ChristopherNeural`, `en-US-GuyNeural`, `en-IN-PrabhatNeural`, etc.)*
