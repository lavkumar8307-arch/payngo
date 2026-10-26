'use client';

import React, { useState, useEffect, useRef } from 'react';
import PolaroidLineCarousel, { Slide } from '@/components/ui/polaroid-line-carousel';
import {
  Camera,
  Plus,
  Sparkles,
  MapPin,
  X,
  Image as ImageIcon,
  Send,
  UploadCloud,
  FileCheck,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { PhotoDropBox } from '@/components/PhotoDropBox';

const INITIAL_TRAVEL_SLIDES: Slide[] = [
  {
    image: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=1600&auto=format&fit=crop&q=80',
    title: 'Charminar Glow',
    caption: 'Hyderabad — Evening twilight with authentic Irani chai.',
    alt: 'Charminar Hyderabad'
  },
  {
    image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1600&auto=format&fit=crop&q=80',
    title: 'Marine Drive Lights',
    caption: 'Mumbai — The Queen’s Necklace breeze after sundown.',
    alt: 'Marine Drive Mumbai'
  },
  {
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1600&auto=format&fit=crop&q=80',
    title: 'Hawa Mahal Palace',
    caption: 'Jaipur — 953 honeycombed windows bathed in morning sun.',
    alt: 'Hawa Mahal Jaipur'
  },
  {
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1600&auto=format&fit=crop&q=80',
    title: 'India Gate Sunset',
    caption: 'New Delhi — Evening picnic along the Rajpath lawns.',
    alt: 'India Gate Delhi'
  },
  {
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1600&auto=format&fit=crop&q=80',
    title: 'Himalayan High Pass',
    caption: 'Manali — Crisp alpine winds on the valley road.',
    alt: 'Himalayas'
  },
  {
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1600&auto=format&fit=crop&q=80',
    title: 'Alleppey Backwaters',
    caption: 'Kerala — Cruising tranquil waters on a house-boat.',
    alt: 'Alleppey Kerala'
  }
];

const SAMPLE_PHOTO_PRESETS = [
  {
    name: 'Taj Mahal at Dawn',
    url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1600&auto=format&fit=crop&q=80',
    caption: 'Agra — Timeless ivory marble reflection.'
  },
  {
    name: 'Varanasi Ghats',
    url: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=1600&auto=format&fit=crop&q=80',
    caption: 'Varanasi — Evening Ganga Aarti lamps flickering.'
  },
  {
    name: 'Bengaluru Cubbon Park',
    url: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=1600&auto=format&fit=crop&q=80',
    caption: 'Bengaluru — Sunday morning cycle beneath bamboo groves.'
  }
];

export function CommunityTravelMoments() {
  const [slides, setSlides] = useState<Slide[]>(INITIAL_TRAVEL_SLIDES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isDropActive, setIsDropActive] = useState(false);
  const [isContainerDragOver, setIsContainerDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load community photos from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('wanderpay_community_photos');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSlides(parsed);
          }
        } catch (e) {
          console.error('Failed to parse community photos:', e);
        }
      }
    }
  }, []);

  // Process dropped/selected image file
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please upload a valid image file (PNG, JPG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImageUrl(event.target.result as string);
        setFileName(file.name);
        if (!title) {
          // Auto-generate title from filename
          const cleanName = file.name
            .replace(/\.[^/.]+$/, '')
            .replace(/[-_]/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase());
          setTitle(cleanName);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Drag & drop handlers for modal box
  const handleModalDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDropActive(true);
  };

  const handleModalDragLeave = () => {
    setIsDropActive(false);
  };

  const handleModalDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDropActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  // Direct drag & drop onto the entire clothesline section
  const handleContainerDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsContainerDragOver(true);
  };

  const handleContainerDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsContainerDragOver(false);
    }
  };

  const handleContainerDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsContainerDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processImageFile(e.dataTransfer.files[0]);
      setIsModalOpen(true);
    }
  };

  const handleSharePhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Please enter a place or memory title.');
      return;
    }

    const finalImage = imageUrl.trim() || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1800&auto=format&fit=crop';
    const newSlide: Slide = {
      image: finalImage,
      title: title.trim(),
      caption: caption.trim() || 'Shared by a PayNGo traveler.',
      alt: title.trim()
    };

    const updated = [newSlide, ...slides];
    setSlides(updated);

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('wanderpay_community_photos', JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }
    }

    // Reset and close
    setTitle('');
    setCaption('');
    setImageUrl('');
    setFileName(null);
    setErrorMsg('');
    setIsModalOpen(false);
  };

  const handleBoxPhotoAdded = (newSlide: Slide) => {
    const updated = [newSlide, ...slides];
    setSlides(updated);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('wanderpay_community_photos', JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleBoxPhotoDeleted = (indexToDelete: number) => {
    const updated = slides.filter((_, idx) => idx !== indexToDelete);
    setSlides(updated);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('wanderpay_community_photos', JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <section
      onDragOver={handleContainerDragOver}
      onDragLeave={handleContainerDragLeave}
      onDrop={handleContainerDrop}
      className="w-full bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-2xl overflow-hidden relative"
    >
      {/* Full-container Drag-and-Drop Glow Overlay */}
      {isContainerDragOver && (
        <div className="absolute inset-0 z-50 bg-blue-600/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in border-4 border-dashed border-white/80 rounded-3xl">
          <UploadCloud className="w-16 h-16 text-white animate-bounce mb-3" />
          <h3 className="text-2xl font-black text-white">Drop to Peg on the Clothesline!</h3>
          <p className="text-sm text-blue-100 mt-1 max-w-md">
            Release your travel photo here to peg it onto the swinging string.
          </p>
        </div>
      )}

      {/* Header bar */}
      <div className="p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md relative z-10">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-amber-400 uppercase tracking-widest bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Community Travel Clothesline</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center space-x-2">
            <Camera className="w-5 h-5 text-sky-400" />
            <span>Travel Memories & Shared Moments</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-300">
            Real instant prints pegged on the line by travelers. Drag the line, drop photos into the open box, or click any print!
          </p>
        </div>

        {/* Action Buttons: Drop/Upload Photo + Trigger Button */}
        <div className="flex items-center space-x-2.5 shrink-0">
          <button
            onClick={() => {
              setIsModalOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-lg transition-all flex items-center space-x-2 group transform hover:scale-[1.02]"
          >
            <UploadCloud className="w-4 h-4 text-white group-hover:-translate-y-0.5 transition-transform" />
            <span>Add with Caption</span>
          </button>
        </div>
      </div>

      {/* Main Area: Clothesline Carousel + Photo Drop Box Companion */}
      <div className="relative w-full flex flex-col xl:flex-row items-stretch bg-slate-950/40">
        
        {/* The Polaroid Sagging Line Carousel Component */}
        <div className="flex-1 relative h-[520px] sm:h-[560px]">
          <PolaroidLineCarousel
            slides={slides}
            height="100%"
            cardWidth={280}
            sag={42}
            swing={1}
            autoplay={4000}
            string="#64748b"
            background="transparent"
            ink="#ffffff"
            className="w-full h-full"
          />
        </div>

        {/* Interactive 3D Photo Drop Box Dock */}
        <div className="p-5 sm:p-6 border-t xl:border-t-0 xl:border-l border-slate-800/80 flex flex-col justify-center items-center shrink-0 bg-slate-950/70 backdrop-blur-sm z-20">
          <PhotoDropBox
            slides={slides}
            onPhotoAdded={handleBoxPhotoAdded}
            onPhotoDeleted={handleBoxPhotoDeleted}
          />
        </div>

      </div>

      {/* Share / Drop Photo Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 sm:p-8 text-white shadow-2xl relative space-y-5">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
                  <UploadCloud className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">Drop & Peg Your Travel Photo</h4>
                  <p className="text-xs text-slate-400">Share your instant photo with the PayNGo community</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs p-3 rounded-xl">
                {errorMsg}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSharePhoto} className="space-y-4">

              {/* Drag-and-Drop Photo Upload Area */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Drop Photo File or Select
                </label>
                <div
                  onDragOver={handleModalDragOver}
                  onDragLeave={handleModalDragLeave}
                  onDrop={handleModalDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                    isDropActive
                      ? 'border-blue-400 bg-blue-500/10 scale-[1.01]'
                      : imageUrl
                      ? 'border-emerald-500/50 bg-slate-800/80'
                      : 'border-slate-700 hover:border-slate-500 bg-slate-800/40 hover:bg-slate-800/80'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        processImageFile(e.target.files[0]);
                      }
                    }}
                  />

                  {imageUrl ? (
                    <div className="flex items-center space-x-3 w-full">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-slate-700">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <span className="text-xs font-bold text-emerald-400 flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Photo Ready!</span>
                        </span>
                        <p className="text-[11px] text-slate-300 truncate mt-0.5">
                          {fileName || 'Custom image URL'}
                        </p>
                        <p className="text-[10px] text-slate-400">Click to change or replace</p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setImageUrl('');
                          setFileName(null);
                        }}
                        className="p-1.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <UploadCloud className="w-8 h-8 text-blue-400 mb-1 animate-pulse" />
                      <p className="text-xs font-bold text-slate-200">
                        Drag & Drop your photo here, or <span className="text-blue-400 underline">browse</span>
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Supports PNG, JPG, WEBP from your phone or desktop
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Place Name / Memory Title */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Place Name or Memory Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Sunrise at Charminar"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Travel Note */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Travel Note / Caption
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g., Incredible pearl shopping and Irani chai after an auto ride."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              {/* Optional Preset Selector */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Or pick a popular destination preset:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {SAMPLE_PHOTO_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setTitle(preset.name);
                        setCaption(preset.caption);
                        setImageUrl(preset.url);
                        setFileName(preset.name);
                      }}
                      className="text-left p-2 rounded-xl border border-slate-700 hover:border-blue-500 bg-slate-800/60 hover:bg-slate-800 transition-all text-xs space-y-1"
                    >
                      <span className="font-bold text-[11px] text-slate-200 line-clamp-1">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg transition-all flex items-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Peg to Clothesline</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </section>
  );
}
export default CommunityTravelMoments;
