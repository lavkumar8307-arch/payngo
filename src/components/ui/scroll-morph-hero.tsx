import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { motion, useTransform, useSpring, useMotionValue } from "framer-motion";
import { X, MapPin, Compass, CreditCard, ArrowRight, ShieldCheck } from "lucide-react";

export type AnimationPhase = "scatter" | "line" | "circle" | "bottom-strip";

export interface DestinationItem {
  id: string;
  src: string;
  title: string;
  location: string;
  category: string;
  description: string;
  state: string;
}

// Full 20 Destinations Dataset - Updated continuously by user batches
export const DESTINATIONS_DATA: DestinationItem[] = [
  // --- BATCH 1 (User Provided) ---
  {
    id: "kedarnath",
    src: "/destinations/batch1_1_kedarnath.jpg",
    title: "Kedarnath Temple",
    location: "Rudraprayag, Uttarakhand",
    category: "Sacred Shrine & Himalayas",
    description: "Ancient 8th-century stone temple standing majestic beneath golden Himalayan snow peaks.",
    state: "Uttarakhand",
  },
  {
    id: "golden-temple",
    src: "/destinations/batch1_2_golden_temple.jpg",
    title: "Golden Temple",
    location: "Amritsar, Punjab",
    category: "Spiritual Sanctuary",
    description: "Sri Harmandir Sahib gleaming over the holy Amrit Sarovar pool of nectar.",
    state: "Punjab",
  },
  {
    id: "csmt-mumbai",
    src: "/destinations/batch1_3_csmt_mumbai.jpg",
    title: "CSMT Heritage Terminus",
    location: "Mumbai, Maharashtra",
    category: "Victorian Gothic & Vintage Transit",
    description: "UNESCO World Heritage station featuring iconic red double-decker bus and Victorian Gothic stone domes.",
    state: "Maharashtra",
  },
  {
    id: "hawa-mahal",
    src: "/destinations/batch1_4_hawa_mahal.jpg",
    title: "Hawa Mahal",
    location: "Jaipur, Rajasthan",
    category: "Royal Honeycomb Palace",
    description: "Crown-shaped pink palace built in 1799 with 953 intricate jharokha lattice windows.",
    state: "Rajasthan",
  },
  {
    id: "taj-mahal",
    src: "/destinations/batch1_5_taj_mahal.jpg",
    title: "Taj Mahal",
    location: "Agra, Uttar Pradesh",
    category: "World Wonder Architecture",
    description: "UNESCO World Heritage white marble mausoleum framed by arched gateway architecture.",
    state: "Uttar Pradesh",
  },

  // --- BATCH 2 (User Provided: Images 6-10) ---
  {
    id: "qutub-minar",
    src: "/destinations/batch2_6_qutub_minar.jpg",
    title: "Qutub Minar",
    location: "Mehrauli, New Delhi",
    category: "Ancient Victory Tower",
    description: "73-meter UNESCO heritage red sandstone tower framed through ornate carved stone arches.",
    state: "Delhi",
  },
  {
    id: "red-fort",
    src: "/destinations/batch2_7_red_fort.jpg",
    title: "Red Fort (Lal Qila)",
    location: "Old Delhi, Delhi",
    category: "Mughal Heritage Citadel",
    description: "Iconic 17th-century Mughal red sandstone fortress with the Indian Tricolor flag flying high.",
    state: "Delhi",
  },
  {
    id: "lotus-temple",
    src: "/destinations/batch2_8_lotus_temple.jpg",
    title: "Lotus Temple",
    location: "Kalkaji, New Delhi",
    category: "Modern Architectural Marvel",
    description: "Serene lotus-shaped Bahá'í House of Worship featuring 27 white marble petals against a sunset sky.",
    state: "Delhi",
  },
  {
    id: "ram-mandir",
    src: "/destinations/batch2_9_ram_mandir.jpg",
    title: "Shri Ram Janmabhoomi Mandir",
    location: "Ayodhya, Uttar Pradesh",
    category: "Nagara Style Temple Wonder",
    description: "Grand 3-tiered pink sandstone complex glowing under golden hour skies, built in traditional Nagara design.",
    state: "Uttar Pradesh",
  },
  {
    id: "kailasa-temple",
    src: "/destinations/batch2_10_kailasa_temple.jpg",
    title: "Kailasa Temple (Cave 16)",
    location: "Ellora, Maharashtra",
    category: "Monolithic Rock-Cut Wonder",
    description: "World's largest single monolithic rock excavation carved top-down from a basalt cliff in 8th century CE.",
    state: "Maharashtra",
  },
  // --- BATCH 3 (User Provided: Images 11-15) ---
  {
    id: "great-buddha",
    src: "/destinations/batch3_11_great_buddha.jpg",
    title: "Great Buddha Statue",
    location: "Bodh Gaya, Bihar",
    category: "Sacred Pilgrimage & Meditation",
    description: "Colossal 80-foot sandstone Buddha sitting in peaceful dhyana mudra meditation, consecrated by the Dalai Lama.",
    state: "Bihar",
  },
  {
    id: "kerala-backwaters",
    src: "/destinations/batch3_12_kerala_backwaters.jpg",
    title: "Alleppey Backwaters",
    location: "Alappuzha, Kerala",
    category: "Emerald Waterways & Houseboats",
    description: "Scenic wooden Kettuvallam houseboats and traditional shikaras gliding through palm-shaded tropical canals.",
    state: "Kerala",
  },
  {
    id: "varkala-cliff",
    src: "/destinations/batch3_13_varkala_cliff.jpg",
    title: "Varkala Cliff Beach",
    location: "Varkala, Kerala",
    category: "Coastal Cliff Sanctuary",
    description: "Dramatic red laterite cliffs towering over golden sandy beaches and azure Arabian Sea waves.",
    state: "Kerala",
  },
  {
    id: "cabo-de-rama",
    src: "/destinations/batch3_14_cabo_de_rama.jpg",
    title: "Cabo de Rama View",
    location: "Canacona, South Goa",
    category: "Coastal Heritage & Archway",
    description: "Historic carved wooden doorway framing serene tropical coconut groves and turquoise ocean views.",
    state: "Goa",
  },
  {
    id: "jama-masjid",
    src: "/destinations/batch3_15_jama_masjid.jpg",
    title: "Jama Masjid",
    location: "Old Delhi, Delhi",
    category: "Mughal Sacred Architecture",
    description: "Grand 17th-century Mughal red sandstone mosque with soaring minarets set beneath sunset skies.",
    state: "Delhi",
  },
  // --- BATCH 4 (User Provided: Images 16-20) ---
  {
    id: "munnar-tea-gardens",
    src: "/destinations/batch4_16_tea_plantation.jpg",
    title: "Munnar Tea Estates",
    location: "Idukki, Kerala",
    category: "Rolling Tea Plantations",
    description: "Endless emerald tea plantations carpeted across misty Western Ghats slopes with traditional pluckers.",
    state: "Kerala",
  },
  {
    id: "himalayan-shrine",
    src: "/destinations/batch4_17_himalayan_shrine.jpg",
    title: "Maa Chandi Devi Shrine",
    location: "Haridwar, Uttarakhand",
    category: "Mist-Veiled Himalayan Sanctuary",
    description: "Golden spire shrine perched on a cliffside amidst dense mist-shrouded Himalayan evergreen forests.",
    state: "Uttarakhand",
  },
  {
    id: "betaab-valley",
    src: "/destinations/batch4_18_betaab_valley.jpg",
    title: "Betaab Valley",
    location: "Pahalgam, Jammu & Kashmir",
    category: "Paradise Alpine Meadow",
    description: "Crystal stream winding through lush green meadows framed by pine forests and towering snow peaks.",
    state: "Jammu & Kashmir",
  },
  {
    id: "buddha-park-sikkim",
    src: "/destinations/batch4_19_buddha_park_sikkim.jpg",
    title: "Tathagata Tsal (Buddha Park)",
    location: "Ravangla, South Sikkim",
    category: "Himalayan Sacred Sanctuary",
    description: "Majestic 130-foot copper-gilded statue of Lord Buddha surrounded by manicured gardens and Sikkim mountain ranges.",
    state: "Sikkim",
  },
  {
    id: "sunset-monument",
    src: "/destinations/batch4_20_sunset_monument.jpg",
    title: "Sri Ranganathaswamy View",
    location: "Srirangam, Tamil Nadu",
    category: "Sunset Dravidian Monument",
    description: "Majestic multi-tiered ornamental pyramid structure glowing beneath a breathtaking pastel pink sunset sky.",
    state: "Tamil Nadu",
  },
];

interface FlipCardProps {
  item: DestinationItem;
  index: number;
  total: number;
  phase: AnimationPhase;
  target: { x: number; y: number; rotation: number; scale: number; opacity: number };
  onSelect: (item: DestinationItem) => void;
}

const IMG_WIDTH = 60;
const IMG_HEIGHT = 86;

function FlipCard({
  item,
  index,
  total,
  phase,
  target,
  onSelect,
}: FlipCardProps) {
  return (
    <motion.div
      onClick={() => onSelect(item)}
      animate={{
        x: target.x,
        y: target.y,
        rotate: target.rotation,
        scale: target.scale,
        opacity: target.opacity,
      }}
      transition={{
        type: "spring",
        stiffness: 70,
        damping: 22,
        mass: 0.8,
      }}
      style={{
        position: "absolute",
        width: IMG_WIDTH,
        height: IMG_HEIGHT,
        transformStyle: "preserve-3d",
        perspective: "1000px",
        willChange: "transform, opacity",
      }}
      className="cursor-pointer group"
    >
      <motion.div
        className="relative h-full w-full rounded-xl shadow-md"
        style={{ transformStyle: "preserve-3d" }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        whileHover={{ rotateY: 180, scale: 1.25 }}
      >
        {/* Front Face - Clean Image Only */}
        <div
          className="absolute inset-0 h-full w-full overflow-hidden rounded-xl bg-slate-900 border border-slate-700/50 shadow-xs"
          style={{ backfaceVisibility: "hidden" }}
        >
          <img
            src={item.src}
            alt={item.title}
            className="h-full w-full object-cover rounded-xl"
            loading="eager"
          />
          <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-transparent" />
        </div>

        {/* Back Face Flip - Executive Passport Travel Card */}
        <div
          className="absolute inset-0 h-full w-full overflow-hidden rounded-xl shadow-xl bg-gradient-to-b from-slate-900 via-slate-950 to-blue-950 flex flex-col items-center justify-between p-2 border border-blue-500/40 text-center"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          <p className="text-[9px] font-black text-white leading-tight tracking-tight uppercase break-words w-full px-0.5">
            {item.state}
          </p>
          <span className="text-[7px] font-bold text-sky-300 bg-sky-950/80 px-1.5 py-0.5 rounded-full border border-sky-400/30">
            View ➔
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}

const TOTAL_IMAGES = 20;
const MAX_SCROLL = 100000; // Continuous infinite scroll without clipping

const lerp = (start: number, end: number, t: number) => start * (1 - t) + end * t;

export default function IntroAnimation() {
  const [introPhase, setIntroPhase] = useState<AnimationPhase>("scatter");
  const [containerSize, setContainerSize] = useState({ width: 1200, height: 800 });
  const [selectedItem, setSelectedItem] = useState<DestinationItem | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const virtualScroll = useMotionValue(0);
  const scrollRef = useRef(0);

  // Morph from center circle to bottom carousel during scroll 0 -> 500, then stay locked at bottom level
  const morphProgress = useTransform(virtualScroll, [0, 500], [0, 1], { clamp: true });
  const smoothMorph = useSpring(morphProgress, { stiffness: 60, damping: 25 });

  // Infinite continuous rotation driven by user scroll
  const scrollRotate = useTransform(virtualScroll, (v) => v * 0.25);
  const smoothScrollRotate = useSpring(scrollRotate, { stiffness: 60, damping: 25 });

  const mouseX = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { stiffness: 50, damping: 25 });

  const [morphValue, setMorphValue] = useState(0);
  const [rotateValue, setRotateValue] = useState(0);
  const [parallaxValue, setParallaxValue] = useState(0);
  const [autoRotate, setAutoRotate] = useState(0);

  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();
    const updateAutoRotate = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;
      setAutoRotate((prev) => (prev + delta * 8) % 360); // Smooth continuous 8 deg/sec ambient rotation
      animId = requestAnimationFrame(updateAutoRotate);
    };
    animId = requestAnimationFrame(updateAutoRotate);
    return () => cancelAnimationFrame(animId);
  }, []);

  useEffect(() => {
    let animationFrameId: number;
    const updateLoop = () => {
      setMorphValue(smoothMorph.get());
      setRotateValue(smoothScrollRotate.get());
      setParallaxValue(smoothMouseX.get());
      animationFrameId = requestAnimationFrame(updateLoop);
    };
    animationFrameId = requestAnimationFrame(updateLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [smoothMorph, smoothScrollRotate, smoothMouseX]);

  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.offsetWidth || window.innerWidth,
          height: containerRef.current.offsetHeight || window.innerHeight,
        });
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const newScroll = Math.min(Math.max(scrollRef.current + e.deltaY * 0.85, 0), MAX_SCROLL);
      scrollRef.current = newScroll;
      virtualScroll.set(newScroll);
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchMove = (e: TouchEvent) => {
      const touchY = e.touches[0].clientY;
      const deltaY = (touchStartY - touchY) * 1.5;
      touchStartY = touchY;

      const newScroll = Math.min(Math.max(scrollRef.current + deltaY, 0), MAX_SCROLL);
      scrollRef.current = newScroll;
      virtualScroll.set(newScroll);
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("touchstart", handleTouchStart, { passive: false });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
    };
  }, [virtualScroll]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      const normalizedX = (relativeX / rect.width) * 2 - 1;
      mouseX.set(normalizedX * 60);
    };
    container.addEventListener("mousemove", handleMouseMove);
    return () => container.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX]);

  useEffect(() => {
    const timer1 = setTimeout(() => setIntroPhase("line"), 150);
    const timer2 = setTimeout(() => setIntroPhase("circle"), 600);
    return () => { clearTimeout(timer1); clearTimeout(timer2); };
  }, []);

  const scatterPositions = useMemo(() => {
    return DESTINATIONS_DATA.map(() => ({
      x: (Math.random() - 0.5) * 1400,
      y: (Math.random() - 0.5) * 900,
      rotation: (Math.random() - 0.5) * 180,
      scale: 0.6,
      opacity: 0,
    }));
  }, []);

  const contentOpacity = useTransform(smoothMorph, [0.7, 1], [0, 1]);
  const contentY = useTransform(smoothMorph, [0.7, 1], [20, 0]);

  return (
    <div ref={containerRef} className="relative w-full h-full bg-[#FFFFFF] overflow-hidden select-none">

      <div className="flex h-full w-full flex-col items-center justify-center">

        {/* Intro Headline - Positioned cleanly INSIDE circle without touching any letters */}
        <div className="absolute z-0 flex flex-col items-center justify-center text-center pointer-events-none top-1/2 -translate-y-1/2 max-w-[280px] sm:max-w-[340px] px-2">
          <motion.h1
            initial={{ opacity: 0, y: 15, filter: "blur(8px)" }}
            animate={introPhase === "circle" && morphValue < 0.5 ? { opacity: 1 - morphValue * 2, y: 0, filter: "blur(0px)" } : { opacity: 0, filter: "blur(8px)" }}
            transition={{ duration: 0.8 }}
            className="text-xl sm:text-3xl font-black tracking-tight text-gray-900 leading-tight"
          >
            The Future of Travel is <span className="text-sky-600">PayNGo.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={introPhase === "circle" && morphValue < 0.5 ? { opacity: 0.9 - morphValue } : { opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="mt-2 text-xs font-bold tracking-[0.15em] text-slate-700 uppercase"
          >
            SCROLL TO EXPLORE MONUMENTS & BEACHES
          </motion.p>
        </div>

        {/* Expanded Arc Hero Heading */}
        <motion.div
          style={{ opacity: contentOpacity, y: contentY }}
          className="absolute top-[8%] z-10 flex flex-col items-center justify-center text-center pointer-events-none px-4 max-w-xl"
        >
          <h2 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight mb-2 text-balance">
            Explore Iconic Destinations
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium text-balance">
            From Sacred Himalayan Shrines to Golden Palaces and Tropical Beaches. <br className="hidden md:block" />
            Scroll through our curated travel destinations and book seamlessly with PayPal.
          </p>
        </motion.div>

        {/* Main Cards Arc Container */}
        <div className="relative flex items-center justify-center w-full h-full z-10">
          {DESTINATIONS_DATA.slice(0, TOTAL_IMAGES).map((item, i) => {
            let target = { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1 };

            if (introPhase === "scatter") {
              target = scatterPositions[i];
            } else if (introPhase === "line") {
              const lineSpacing = 68;
              const lineTotalWidth = TOTAL_IMAGES * lineSpacing;
              const lineX = i * lineSpacing - lineTotalWidth / 2;
              target = { x: lineX, y: 0, rotation: 0, scale: 1, opacity: 1 };
            } else {
              const isMobile = containerSize.width < 768;
              const minDimension = Math.min(containerSize.width, containerSize.height);

              // 1. Center Circle Position (Image 1 - at top scroll)
              const circleRadius = Math.min(minDimension * 0.38, 360);
              const circleAngle = (i / TOTAL_IMAGES) * 360 + autoRotate + rotateValue * 0.4;
              const circleRad = (circleAngle * Math.PI) / 180;
              const circlePos = {
                x: Math.cos(circleRad) * circleRadius,
                y: Math.sin(circleRad) * circleRadius,
                rotation: 0, // Stays upright
                scale: 1,
                opacity: 1,
              };

              // 2. Bottom Rotating Circle Wheel (Level of Image 2 - continuous 360° carousel)
              // Radius is sized so the top arc spans across the screen matching Image 2
              const wheelRadius = isMobile
                ? Math.max(containerSize.width * 0.85, 380)
                : Math.max(containerSize.width * 0.65, 620);

              // Arc apex: sits at the exact level of Image 2
              const arcApexY = containerSize.height * (isMobile ? 0.32 : 0.22);
              const wheelCenterY = arcApexY + wheelRadius;

              // Distribute all 20 images in a continuous 360° loop that rotates with scroll and time
              const wheelAngle = -90 + (i * (360 / TOTAL_IMAGES)) + autoRotate + rotateValue;
              const wheelRad = (wheelAngle * Math.PI) / 180;

              const wheelX = Math.cos(wheelRad) * wheelRadius + parallaxValue;
              const wheelY = Math.sin(wheelRad) * wheelRadius + wheelCenterY;

              // Gentle fanning rotation along the arch
              const wheelRotation = Math.max(-25, Math.min(25, (wheelX / (containerSize.width * 0.45)) * 18));
              const wheelScale = isMobile ? 1.3 : 1.65;

              // Smooth fade for cards that dip deep below the viewport
              const maxVisibleBottom = containerSize.height * 0.5 + 140;
              const wheelOpacity = wheelY > maxVisibleBottom
                ? Math.max(0, 1 - (wheelY - maxVisibleBottom) / 180)
                : 1;

              const bottomCirclePos = {
                x: wheelX,
                y: wheelY,
                rotation: wheelRotation,
                scale: wheelScale,
                opacity: wheelOpacity,
              };

              target = {
                x: lerp(circlePos.x, bottomCirclePos.x, morphValue),
                y: lerp(circlePos.y, bottomCirclePos.y, morphValue),
                rotation: lerp(circlePos.rotation, bottomCirclePos.rotation, morphValue),
                scale: lerp(circlePos.scale, bottomCirclePos.scale, morphValue),
                opacity: lerp(circlePos.opacity, bottomCirclePos.opacity, morphValue),
              };
            }

            return (
              <FlipCard
                key={item.id}
                item={item}
                index={i}
                total={TOTAL_IMAGES}
                phase={introPhase}
                target={target}
                onSelect={(selected) => setSelectedItem(selected)}
              />
            );
          })}
        </div>

      </div>

      {/* Floating Interactive Discovery Hint Pill */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full border border-slate-200 shadow-lg text-xs font-semibold text-slate-700 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
        <span>Scroll to rotate & explore</span>
        <span className="text-slate-300">•</span>
        <span>Click any monument to explore & book with PayPal</span>
      </div>

      {/* Destination Interactive Detail Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 relative animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image Header with Gradient Overlay */}
            <div className="relative h-56 sm:h-64 w-full overflow-hidden bg-slate-900">
              <img
                src={selectedItem.src}
                alt={selectedItem.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

              {/* Close Button */}
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md flex items-center justify-center transition-colors shadow-sm"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Category Pill */}
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-white/95 backdrop-blur-md text-slate-900 shadow-sm">
                  {selectedItem.category}
                </span>
              </div>

              {/* Title & Location Overlay */}
              <div className="absolute bottom-4 left-5 right-5 text-white">
                <h3 className="text-xl sm:text-2xl font-black tracking-tight">{selectedItem.title}</h3>
                <p className="text-xs text-amber-300 font-bold flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>{selectedItem.location}</span>
                </p>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-4">
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                {selectedItem.description}
              </p>

              {/* Highlights specs */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Heritage State</span>
                  <p className="text-sm font-bold text-slate-900">{selectedItem.state}</p>
                </div>
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PayPal Checkout</span>
                  <p className="text-sm font-bold text-emerald-600 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Instant Lock</span>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <Link
                  href={`/planner?dest=${encodeURIComponent(selectedItem.title + ', ' + selectedItem.state)}`}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center space-x-1.5"
                >
                  <Compass className="w-4 h-4" />
                  <span>Plan AI Itinerary</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <Link
                  href={`/route?dest=${encodeURIComponent(selectedItem.location || selectedItem.title)}`}
                  className="flex-1 bg-slate-900 hover:bg-black text-white font-bold text-xs py-3 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center space-x-1.5"
                >
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  <span>Compare Rides & Book</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
