"use client";

import {
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

interface ScrollExpandMediaProps {
  mediaType?: "video" | "image";
  mediaSrc: string;
  posterSrc?: string;
  bgImageSrc: string;
  title?: string;
  date?: string;
  scrollToExpand?: string;
  textBlend?: boolean;
  children?: ReactNode;
}

const ScrollExpandMedia = ({
  mediaType = "video",
  mediaSrc,
  posterSrc,
  bgImageSrc,
  title,
  date,
  scrollToExpand,
  textBlend,
  children,
}: ScrollExpandMediaProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Native hardware-accelerated scroll tracking using Framer Motion useScroll
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Smooth transforms based on scroll
  const mediaWidth = useTransform(smoothProgress, [0, 0.6], ["300px", "95vw"]);
  const mediaHeight = useTransform(smoothProgress, [0, 0.6], ["400px", "85vh"]);
  const bgOpacity = useTransform(smoothProgress, [0, 0.5], [1, 0]);
  const textTranslateLeft = useTransform(smoothProgress, [0, 0.5], ["0vw", "-120vw"]);
  const textTranslateRight = useTransform(smoothProgress, [0, 0.5], ["0vw", "120vw"]);
  const contentOpacity = useTransform(smoothProgress, [0.4, 0.8], [0, 1]);

  const firstWord = title ? title.split(" ")[0] : "";
  const restOfTitle = title ? title.split(" ").slice(1).join(" ") : "";

  return (
    <div ref={containerRef} className="relative w-full min-h-[220vh] bg-slate-950">
      {/* Sticky Hero Section */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col items-center justify-center">
        
        {/* Background Image */}
        <motion.div
          className="absolute inset-0 z-0 h-full w-full pointer-events-none"
          style={{ opacity: bgOpacity }}
        >
          <Image
            src={bgImageSrc}
            alt="Background"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
        </motion.div>

        {/* Central Expanding Media Card */}
        <motion.div
          className="relative z-10 overflow-hidden rounded-3xl shadow-2xl flex items-center justify-center"
          style={{
            width: mediaWidth,
            height: mediaHeight,
            willChange: "width, height",
          }}
        >
          {mediaType === "video" ? (
            <video
              src={mediaSrc}
              poster={posterSrc}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover rounded-3xl"
            />
          ) : (
            <Image
              src={mediaSrc}
              alt={title || "Media content"}
              fill
              className="w-full h-full object-cover rounded-3xl"
              priority
            />
          )}

          <div className="absolute inset-0 bg-black/20 rounded-3xl pointer-events-none" />

          {/* Subtitle / Scroll Prompt overlay */}
          <div className="absolute bottom-6 inset-x-0 flex flex-col items-center text-center z-20 pointer-events-none">
            {date && <p className="text-xl font-bold text-sky-200 drop-shadow-md">{date}</p>}
            {scrollToExpand && (
              <p className="text-xs font-semibold text-slate-300 tracking-wider uppercase mt-1 bg-black/40 px-3 py-1 rounded-full backdrop-blur-md">
                {scrollToExpand}
              </p>
            )}
          </div>
        </motion.div>

        {/* Morphing Split Title Text */}
        <div
          className={`absolute z-20 flex flex-col items-center justify-center text-center gap-2 pointer-events-none ${
            textBlend ? "mix-blend-difference" : "mix-blend-normal"
          }`}
        >
          <motion.h2
            className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight drop-shadow-lg"
            style={{ x: textTranslateLeft }}
          >
            {firstWord}
          </motion.h2>
          <motion.h2
            className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight drop-shadow-lg"
            style={{ x: textTranslateRight }}
          >
            {restOfTitle}
          </motion.h2>
        </div>

      </div>

      {/* Expanded Content Section Below */}
      <motion.div
        style={{ opacity: contentOpacity }}
        className="relative z-30 max-w-5xl mx-auto px-6 py-16"
      >
        {children}
      </motion.div>
    </div>
  );
};

export default ScrollExpandMedia;
