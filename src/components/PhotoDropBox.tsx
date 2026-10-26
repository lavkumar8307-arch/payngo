'use client';

import React, { useState, useRef } from 'react';
import {
  Camera,
  UploadCloud,
  Sparkles,
  CheckCircle2,
  Image as ImageIcon,
  Eye,
  X,
  Trash2,
  ExternalLink,
  Plus
} from 'lucide-react';
import { Slide } from '@/components/ui/polaroid-line-carousel';

interface PhotoDropBoxProps {
  slides: Slide[];
  onPhotoAdded: (newSlide: Slide) => void;
  onPhotoDeleted?: (index: number) => void;
}

export function PhotoDropBox({ slides = [], onPhotoAdded, onPhotoDeleted }: PhotoDropBoxProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [justDropped, setJustDropped] = useState(false);
  const [lastAddedName, setLastAddedName] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Slide | null>(null);
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
          caption: 'Preserved inside the community memory box.',
          alt: cleanName
        };

        onPhotoAdded(newSlide);
        setLastAddedName(cleanName);
        setJustDropped(true);
        setTimeout(() => setJustDropped(false), 2600);
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

  // Up to 3 latest photos to display inside the open box
  const peekPhotos = slides.slice(0, 3);

  return (
    <>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative select-none flex flex-col items-center justify-center p-3 sm:p-5 w-full max-w-[320px] transition-all duration-300"
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

        {/* Floating Pill Card Above Box (matching user image) */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`mb-3 px-4 py-2 rounded-full border transition-all duration-300 backdrop-blur-md flex items-center space-x-3 shadow-lg z-30 cursor-pointer ${
            justDropped
              ? 'bg-emerald-950/90 border-emerald-500/60 shadow-emerald-500/30 scale-105'
              : isDragOver
              ? 'bg-blue-900/90 border-blue-400 shadow-blue-500/40 translate-y-2 scale-105'
              : 'bg-black/80 border-white/15 hover:border-white/30 hover:bg-black/95 hover:-translate-y-0.5'
          }`}
          title="Click to browse and upload photos"
        >
          <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center shrink-0 bg-white/5">
            {justDropped ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-bounce" />
            ) : isDragOver ? (
              <UploadCloud className="w-4 h-4 text-blue-300 animate-pulse" />
            ) : (
              <Camera className="w-4 h-4 text-slate-200" />
            )}
          </div>
          <div className="text-left">
            <div className="text-xs font-semibold text-white tracking-wide flex items-center space-x-1">
              <span>{justDropped ? 'Photo Dropped!' : isDragOver ? 'Release to Drop' : 'Drop Photos Here'}</span>
              <Plus className="w-3 h-3 text-sky-400 opacity-70" />
            </div>
            <div className="text-[10px] text-slate-400 font-medium leading-tight">
              {justDropped
                ? `Pinned "${lastAddedName}" to line`
                : isDragOver
                ? 'Pins automatically to line'
                : 'Drag & drop or click to upload'}
            </div>
          </div>
        </button>

        {/* 3D Open Box Container matching user reference image */}
        <div
          onClick={() => setIsGalleryOpen(true)}
          className="relative w-full max-w-[270px] aspect-[4/3] flex items-center justify-center cursor-pointer group"
          title="Click to open memory box and see your uploaded photos"
        >
          {/* Subtle Ambient Glow Behind Box */}
          <div
            className={`absolute inset-x-8 bottom-4 h-24 rounded-full blur-2xl transition-all duration-500 pointer-events-none ${
              isDragOver
                ? 'bg-blue-500/35'
                : justDropped
                ? 'bg-emerald-500/35'
                : 'bg-slate-700/15 group-hover:bg-slate-500/25'
            }`}
          />

          {/* REAL Photos peeking out from inside the box */}
          <div
            className={`absolute top-8 inset-x-8 flex justify-center -space-x-3 pointer-events-none z-10 transition-all duration-300 ${
              isDragOver ? 'scale-105 -translate-y-2' : isHovered ? '-translate-y-1' : ''
            }`}
          >
            {peekPhotos.length > 0 ? (
              peekPhotos.map((photo, idx) => {
                const rotations = ['-rotate-12', 'rotate-2 z-10', 'rotate-14'];
                const offsets = ['-translate-y-1', 'translate-y-0', '-translate-y-0.5'];
                return (
                  <div
                    key={idx}
                    className={`w-14 h-16 bg-white rounded shadow-xl transform ${rotations[idx] || ''} ${
                      offsets[idx] || ''
                    } border border-slate-300/90 overflow-hidden flex flex-col p-1 transition-transform group-hover:scale-105`}
                  >
                    <div className="w-full h-11 bg-slate-900 rounded-sm overflow-hidden relative">
                      {photo.image ? (
                        <img
                          src={photo.image}
                          alt={photo.title || 'Memory photo'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-tr from-sky-400 to-blue-500 flex items-center justify-center">
                          <ImageIcon className="w-4 h-4 text-white/80" />
                        </div>
                      )}
                    </div>
                    <div className="w-8 h-1 bg-slate-300 mt-1 mx-auto rounded-full" />
                  </div>
                );
              })
            ) : (
              <div className="text-[11px] text-slate-400/80 bg-slate-900/80 px-2.5 py-1 rounded-full border border-slate-700/80">
                Box is empty. Drop photos!
              </div>
            )}
          </div>

          {/* SVG 3D Box Container matching user reference image */}
          <svg
            viewBox="0 0 360 260"
            className="w-full h-full overflow-visible relative z-20 transition-transform duration-300 group-hover:scale-[1.02]"
            fill="none"
          >
            <defs>
              {/* Dark Box Main Body Gradient */}
              <linearGradient id="boxBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1a1c22" />
                <stop offset="40%" stopColor="#131418" />
                <stop offset="100%" stopColor="#0c0d10" />
              </linearGradient>

              {/* Box Interior Shadow */}
              <linearGradient id="boxInterior" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#050608" />
                <stop offset="100%" stopColor="#121318" />
              </linearGradient>

              {/* Frosted Glass Flap Gradients */}
              <linearGradient id="glassFlapFront" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(255, 255, 255, 0.40)" />
                <stop offset="25%" stopColor="rgba(255, 255, 255, 0.22)" />
                <stop offset="85%" stopColor="rgba(255, 255, 255, 0.12)" />
                <stop offset="100%" stopColor="rgba(255, 255, 255, 0.18)" />
              </linearGradient>

              <linearGradient id="glassFlapLeft" x1="100%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="rgba(255, 255, 255, 0.35)" />
                <stop offset="50%" stopColor="rgba(255, 255, 255, 0.18)" />
                <stop offset="100%" stopColor="rgba(255, 255, 255, 0.08)" />
              </linearGradient>

              <linearGradient id="glassFlapRight" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(255, 255, 255, 0.35)" />
                <stop offset="50%" stopColor="rgba(255, 255, 255, 0.18)" />
                <stop offset="100%" stopColor="rgba(255, 255, 255, 0.08)" />
              </linearGradient>

              <linearGradient id="rimSpecular" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(255, 255, 255, 0.6)" />
                <stop offset="50%" stopColor="rgba(255, 255, 255, 0.85)" />
                <stop offset="100%" stopColor="rgba(255, 255, 255, 0.6)" />
              </linearGradient>
            </defs>

            {/* 1. Left Back Flap (angled up-left) */}
            <path
              d="M 68 62 L 92 38 Q 96 35, 102 38 L 134 58 L 118 78 Z"
              fill="url(#glassFlapLeft)"
              stroke="rgba(255, 255, 255, 0.45)"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />

            {/* 2. Right Back Flap (angled up-right) */}
            <path
              d="M 292 62 L 268 38 Q 264 35, 258 38 L 226 58 L 242 78 Z"
              fill="url(#glassFlapRight)"
              stroke="rgba(255, 255, 255, 0.45)"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />

            {/* 3. Deep Box Interior Opening */}
            <polygon
              points="118,78 242,78 266,104 94,104"
              fill="url(#boxInterior)"
              stroke="#272930"
              strokeWidth="1.5"
            />

            {/* Drag over glow inside the box opening */}
            {isDragOver && (
              <polygon
                points="118,78 242,78 266,104 94,104"
                fill="rgba(59, 130, 246, 0.4)"
                className="animate-pulse"
              />
            )}

            {/* 4. Left Flap (angled out to the left) */}
            <path
              d="M 94 104 L 66 60 Q 64 56, 70 55 L 110 70 L 118 78 Z"
              fill="url(#glassFlapLeft)"
              stroke="rgba(255, 255, 255, 0.4)"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />

            {/* 5. Right Flap (angled out to the right) */}
            <path
              d="M 266 104 L 294 60 Q 296 56, 290 55 L 250 70 L 242 78 Z"
              fill="url(#glassFlapRight)"
              stroke="rgba(255, 255, 255, 0.4)"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />

            {/* 6. Dark Box Main Body (Smooth rounded bottom corners) */}
            <path
              d="M 98 104 L 262 104 L 262 216 Q 262 232, 244 232 L 116 232 Q 98 232, 98 216 Z"
              fill="url(#boxBodyGrad)"
              stroke="#282a32"
              strokeWidth="1.5"
            />

            {/* 7. Front Glass Flap (Folds down-forward, translucent over the dark box body) */}
            <path
              d="M 94 104 L 266 104 L 286 160 Q 288 166, 280 166 L 80 166 Q 72 166, 74 160 Z"
              fill="url(#glassFlapFront)"
              stroke="url(#rimSpecular)"
              strokeWidth="2"
              strokeLinejoin="round"
              className="filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
            />

            {/* Highlight ridge on front flap edge */}
            <line
              x1="82"
              y1="164"
              x2="278"
              y2="164"
              stroke="rgba(255, 255, 255, 0.6)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />

            {/* Subtle Corner Bevel Highlights */}
            <line x1="75" y1="160" x2="94" y2="106" stroke="rgba(255, 255, 255, 0.35)" strokeWidth="1.5" />
            <line x1="285" y1="160" x2="266" y2="106" stroke="rgba(255, 255, 255, 0.35)" strokeWidth="1.5" />
          </svg>
        </div>

        {/* Clickable Badge to Open & See Images in Memory Box */}
        <button
          type="button"
          onClick={() => setIsGalleryOpen(true)}
          className="mt-3 flex items-center space-x-2 text-xs font-semibold text-slate-200 bg-slate-900/90 hover:bg-blue-600/20 hover:text-white hover:border-blue-500/50 px-4 py-1.5 rounded-full border border-slate-700/80 transition-all shadow-md group cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5 text-sky-400 group-hover:scale-110 transition-transform" />
          <span>{slides.length} Photos in Memory Box</span>
          <span className="text-[10px] text-sky-400 font-mono bg-sky-500/10 px-1.5 py-0.5 rounded-full ml-1">
            Click to View
          </span>
        </button>
      </div>

      {/* Memory Box Photo Gallery Modal */}
      {isGalleryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-4xl w-full p-5 sm:p-7 text-white shadow-2xl relative flex flex-col max-h-[88vh]">
            
            {/* Gallery Header - Clean, un-clustered, and perfectly aligned */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 shrink-0">
              <div className="flex items-start sm:items-center space-x-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold shrink-0">
                  <ImageIcon className="w-5 h-5 text-sky-400" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg sm:text-xl font-black text-white tracking-tight whitespace-nowrap">
                      Memory Box Archives
                    </h3>
                    <span className="text-xs font-mono font-semibold bg-blue-500/20 text-blue-300 px-2.5 py-0.5 rounded-full border border-blue-500/30 whitespace-nowrap shrink-0">
                      {slides.length} {slides.length === 1 ? 'photo' : 'photos'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 truncate sm:whitespace-normal">
                    Instant photos preserved inside the memory box & pegged on the clothesline.
                  </p>
                </div>
              </div>

              {/* Action Buttons: Upload More + Close */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center space-x-1.5 transition-all shadow-md whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Upload More</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsGalleryOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white flex items-center justify-center transition-all border border-slate-700/80 shrink-0 cursor-pointer"
                  title="Close gallery"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Photo Grid */}
            <div className="overflow-y-auto py-5 pr-1 space-y-4 flex-1">
              {slides.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400 space-y-3">
                  <Camera className="w-12 h-12 text-slate-600 animate-pulse" />
                  <p className="text-sm font-semibold">The memory box is empty.</p>
                  <p className="text-xs text-slate-500 max-w-sm">
                    Drag and drop photos directly into the open box or click upload to store memories.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {slides.map((photo, index) => (
                    <div
                      key={index}
                      className="group relative bg-white rounded-xl shadow-lg border border-slate-200 p-2 flex flex-col transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl"
                    >
                      {/* Photo Image Aspect */}
                      <div
                        onClick={() => setSelectedPhoto(photo)}
                        className="relative w-full aspect-square bg-slate-900 rounded-lg overflow-hidden cursor-pointer"
                      >
                        <img
                          src={photo.image}
                          alt={photo.title || 'Memory photo'}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Eye className="w-6 h-6 text-white drop-shadow-md" />
                        </div>
                      </div>

                      {/* Polaroid Caption Footer */}
                      <div className="pt-2 text-slate-800">
                        <div className="text-xs font-bold truncate text-slate-900" title={photo.title}>
                          {photo.title || 'Travel Memory'}
                        </div>
                        {photo.caption && (
                          <div className="text-[10px] text-slate-500 line-clamp-2 mt-0.5 leading-snug">
                            {photo.caption}
                          </div>
                        )}
                      </div>

                      {/* Delete button (if handler provided) */}
                      {onPhotoDeleted && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Remove "${photo.title || 'this photo'}" from the memory box?`)) {
                              onPhotoDeleted(index);
                            }
                          }}
                          className="absolute top-3 right-3 w-7 h-7 bg-red-600/90 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                          title="Remove photo from memory box"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
              <span className="flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Photos are automatically saved to your browser session</span>
              </span>
              <button
                onClick={() => setIsGalleryOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              >
                Close Box
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox / Zoom Dialog */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in cursor-zoom-out"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-3xl w-full bg-white rounded-2xl p-4 sm:p-6 text-slate-900 shadow-2xl space-y-3 cursor-default"
          >
            <div className="flex justify-between items-center border-b pb-2">
              <h4 className="font-bold text-base">{selectedPhoto.title || 'Travel Memory'}</h4>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="w-full max-h-[65vh] bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center">
              <img
                src={selectedPhoto.image}
                alt={selectedPhoto.title || 'Memory photo'}
                className="max-w-full max-h-[65vh] object-contain"
              />
            </div>
            {selectedPhoto.caption && (
              <p className="text-xs sm:text-sm text-slate-600">{selectedPhoto.caption}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default PhotoDropBox;
