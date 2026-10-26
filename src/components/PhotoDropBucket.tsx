'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, Sparkles, CheckCircle2, Image as ImageIcon, Camera } from 'lucide-react';
import { Slide } from '@/components/ui/polaroid-line-carousel';

interface PhotoDropBucketProps {
  onPhotoAdded: (newSlide: Slide) => void;
  photoCount: number;
}

export function PhotoDropBucket({ onPhotoAdded, photoCount }: PhotoDropBucketProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [justDropped, setJustDropped] = useState(false);
  const [lastAddedName, setLastAddedName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please drop an image file (PNG, JPG, or WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        const dataUrl = e.target.result as string;
        const cleanName = file.name
          .replace(/\.[^/.]+$/, '')
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());

        const newSlide: Slide = {
          image: dataUrl,
          title: cleanName || 'Traveler Memory',
          caption: 'Dropped into the community memory bucket.',
          alt: cleanName
        };

        onPhotoAdded(newSlide);
        setLastAddedName(cleanName);
        setJustDropped(true);
        setTimeout(() => setJustDropped(false), 2400);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        processFile(e.dataTransfer.files[i]);
      }
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`relative group cursor-pointer transition-all duration-300 select-none p-5 rounded-3xl border ${
        isDragOver
          ? 'bg-blue-600/20 border-blue-400 shadow-2xl shadow-blue-500/40 scale-105'
          : justDropped
          ? 'bg-emerald-600/20 border-emerald-400 shadow-2xl shadow-emerald-500/30'
          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90 shadow-xl'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) {
            for (let i = 0; i < e.target.files.length; i++) {
              processFile(e.target.files[i]);
            }
          }
        }}
      />

      <div className="flex flex-col items-center text-center space-y-3">
        
        {/* Bucket Container Graphics */}
        <div className="relative w-40 h-36 flex items-center justify-center">
          
          {/* Metallic Bucket Handle */}
          <div
            className={`absolute -top-3 w-28 h-20 rounded-t-full border-4 transition-transform duration-300 pointer-events-none ${
              isDragOver
                ? 'border-blue-400 -translate-y-2'
                : 'border-slate-400 group-hover:-translate-y-1'
            }`}
          />

          {/* Photos Sticking Out of Bucket Rim */}
          <div className="absolute top-2 w-28 h-12 flex justify-center -space-x-3 pointer-events-none">
            <div className="w-10 h-12 bg-white rounded shadow-md transform -rotate-12 border border-slate-300 overflow-hidden flex flex-col p-0.5">
              <div className="w-full h-8 bg-sky-200 rounded-sm" />
              <div className="w-6 h-1 bg-slate-300 mt-1 mx-auto rounded" />
            </div>
            <div className="w-10 h-12 bg-white rounded shadow-md transform rotate-6 border border-slate-300 overflow-hidden flex flex-col p-0.5 z-10">
              <div className="w-full h-8 bg-amber-200 rounded-sm" />
              <div className="w-6 h-1 bg-slate-300 mt-1 mx-auto rounded" />
            </div>
            <div className="w-10 h-12 bg-white rounded shadow-md transform rotate-18 border border-slate-300 overflow-hidden flex flex-col p-0.5">
              <div className="w-full h-8 bg-rose-200 rounded-sm" />
              <div className="w-6 h-1 bg-slate-300 mt-1 mx-auto rounded" />
            </div>
          </div>

          {/* Realistic 3D SVG Bucket Body */}
          <svg
            className={`w-36 h-32 relative z-20 filter drop-shadow-xl transition-all duration-300 ${
              isDragOver ? 'scale-110 filter drop-shadow-[0_0_15px_rgba(59,130,246,0.8)]' : ''
            }`}
            viewBox="0 0 140 120"
            fill="none"
          >
            <defs>
              <linearGradient id="bucketBody" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="30%" stopColor="#334155" />
                <stop offset="50%" stopColor="#475569" />
                <stop offset="70%" stopColor="#334155" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
              <linearGradient id="metalRim" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#94a3b8" />
                <stop offset="50%" stopColor="#f8fafc" />
                <stop offset="100%" stopColor="#64748b" />
              </linearGradient>
            </defs>

            {/* Bucket Tapered Hull */}
            <path
              d="M15 22 L28 110 C29 116, 111 116, 112 110 L125 22 Z"
              fill="url(#bucketBody)"
              stroke="#475569"
              strokeWidth="2"
            />

            {/* Horizontal Strengthening Ribs */}
            <path d="M20 55 C45 60, 95 60, 120 55" stroke="#64748b" strokeWidth="2.5" opacity="0.6" />
            <path d="M24 85 C45 90, 95 90, 116 85" stroke="#64748b" strokeWidth="2.5" opacity="0.6" />

            {/* Top Rim Oval */}
            <ellipse cx="70" cy="22" rx="55" ry="12" fill="#0f172a" stroke="url(#metalRim)" strokeWidth="3" />
            
            {/* Inner Bucket Glow on drag */}
            {isDragOver && (
              <ellipse cx="70" cy="22" rx="48" ry="9" fill="#3b82f6" opacity="0.7" className="animate-pulse" />
            )}
          </svg>

          {/* Animated Drop Indicator Icon */}
          <div className="absolute z-30 pointer-events-none flex flex-col items-center">
            {justDropped ? (
              <CheckCircle2 className="w-9 h-9 text-emerald-400 animate-bounce" />
            ) : isDragOver ? (
              <UploadCloud className="w-10 h-10 text-white animate-bounce" />
            ) : (
              <Camera className="w-6 h-6 text-slate-300 opacity-80 group-hover:scale-110 transition-transform" />
            )}
          </div>
        </div>

        {/* Bucket Status & Text */}
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[11px] font-extrabold uppercase tracking-wider">
            <Sparkles className="w-3 h-3" />
            <span>Memory Bucket</span>
          </div>

          <h4 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
            {isDragOver
              ? 'Release to Drop Photos in Bucket!'
              : justDropped
              ? `Dropped: ${lastAddedName}!`
              : 'Drop Photos into Bucket'}
          </h4>

          <p className="text-[11px] text-slate-400 max-w-[200px] leading-relaxed">
            Drag & drop images into the bucket, or click to browse. Automatically pegs to the clothesline!
          </p>

          <div className="pt-1 text-[11px] font-mono text-slate-500 font-semibold">
            {photoCount} Photos in Bucket
          </div>
        </div>

      </div>
    </div>
  );
}

export default PhotoDropBucket;
