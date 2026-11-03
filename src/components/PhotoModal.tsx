import React, { useEffect, useState, useCallback } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Share2,
  Heart,
  Dumbbell,
  Sparkles,
  Maximize2,
  Minimize2,
  Clock,
  Check,
  Camera,
  Flame
} from 'lucide-react';
import { GalleryPhoto } from './GallerySection';

interface PhotoModalProps {
  photo: GalleryPhoto;
  photos: GalleryPhoto[];
  onClose: () => void;
  onSelectPhoto: (photo: GalleryPhoto) => void;
  onOpenUpload: () => void;
}

export const PhotoModal: React.FC<PhotoModalProps> = ({
  photo,
  photos,
  onClose,
  onSelectPhoto,
  onOpenUpload,
}) => {
  const [likes, setLikes] = useState<number>(() => {
    // Deterministic initial like counter based on photo ID
    const seed = photo.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return (seed % 19) + 5;
  });
  const [hasLiked, setHasLiked] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const currentIndex = photos.findIndex((p) => p.id === photo.id);
  const totalPhotos = photos.length;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < totalPhotos - 1;

  const handlePrev = useCallback(() => {
    if (hasPrev) {
      onSelectPhoto(photos[currentIndex - 1]);
      setHasLiked(false);
    }
  }, [hasPrev, currentIndex, photos, onSelectPhoto]);

  const handleNext = useCallback(() => {
    if (hasNext) {
      onSelectPhoto(photos[currentIndex + 1]);
      setHasLiked(false);
    }
  }, [hasNext, currentIndex, photos, onSelectPhoto]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, handlePrev, handleNext]);

  // Lock body scroll
  useEffect(() => {
    const originalStyle = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  const handleLike = () => {
    if (!hasLiked) {
      setLikes((prev) => prev + 1);
      setHasLiked(true);
    } else {
      setLikes((prev) => prev - 1);
      setHasLiked(false);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = photo.imageUrl;
    link.download = `performance_360_dragon_${photo.id}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    const url = window.location.href.split('?')[0] + '#galeria';
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Performance 360º',
          text: `Confira a foto de ${photo.author || 'um participante'} na galeria oficial do evento!`,
          url: url,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const formatPhotoTime = (createdAt?: GalleryPhoto['createdAt']) => {
    if (!createdAt) return 'Hoje';
    try {
      if (typeof createdAt.toDate === 'function') {
        const d = createdAt.toDate();
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      if (createdAt.seconds) {
        const d = new Date(createdAt.seconds * 1000);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
    } catch {
      return 'Agora';
    }
    return 'Hoje';
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in zoom-in-95 duration-200 select-none overflow-hidden"
      onClick={onClose}
    >
      {/* Background dynamic ambient glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#E50914]/20 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-600/15 rounded-full blur-[160px] pointer-events-none" />

      {/* Main Sporty Card Container */}
      <div
        className="relative w-full max-w-5xl max-h-[96vh] bg-[#0c0c0c] border border-neutral-800 rounded-3xl overflow-hidden flex flex-col shadow-[0_25px_70px_rgba(229,9,20,0.25)] ring-1 ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dynamic Sporty Corner Brackets */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#E50914] z-20 pointer-events-none rounded-tl-2xl" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#E50914] z-20 pointer-events-none rounded-tr-2xl" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#E50914] z-20 pointer-events-none rounded-bl-2xl" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#E50914] z-20 pointer-events-none rounded-br-2xl" />

        {/* Top Athletic Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-gradient-to-r from-[#121212] via-[#161616] to-[#121212] border-b border-neutral-800/90 z-10">
          {/* Athlete / Participant Info */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#E50914] to-red-800 p-0.5 shadow-lg shadow-[#E50914]/30 shrink-0">
              <div className="w-full h-full bg-[#0E0E0E] rounded-[14px] flex items-center justify-center text-[#E50914]">
                <Dumbbell className="w-5 h-5" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-extrabold text-white truncate tracking-tight uppercase">
                  {photo.author || 'Atleta / Participante'}
                </h3>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E50914]/15 border border-[#E50914]/30 text-[#E50914] text-[10px] font-mono font-bold uppercase tracking-wider">
                  <Flame className="w-3 h-3 text-[#E50914]" />
                  <span>Presença VIP</span>
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono mt-0.5">
                <span className="flex items-center gap-1 text-neutral-300">
                  <Clock className="w-3 h-3 text-[#E50914]" />
                  {formatPhotoTime(photo.createdAt)}
                </span>
                <span>•</span>
                <span className="truncate text-neutral-400">Performance 360º · Dragon</span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Photo Index Badge */}
            <span className="hidden sm:inline-flex px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-[11px] font-mono font-bold text-neutral-300">
              {currentIndex + 1} / {totalPhotos}
            </span>

            {/* Download button */}
            <button
              type="button"
              onClick={handleDownload}
              title="Baixar foto"
              className="p-2 sm:p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Share button */}
            <button
              type="button"
              onClick={handleShare}
              title="Compartilhar"
              className="p-2 sm:p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 transition-colors cursor-pointer relative"
            >
              {copiedLink ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
            </button>

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              title="Fechar (Esc)"
              className="p-2 sm:p-2.5 rounded-xl bg-neutral-900 hover:bg-[#E50914] text-neutral-300 hover:text-white border border-neutral-800 hover:border-[#E50914] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dynamic Image Display Viewport with Lateral Arrows */}
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[320px] max-h-[66vh] sm:max-h-[70vh]">
          {/* Previous Arrow Button */}
          {hasPrev && (
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Foto anterior"
              className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-black/70 hover:bg-[#E50914] text-white border border-white/10 hover:border-[#E50914] flex items-center justify-center transition-all duration-200 backdrop-blur-md shadow-2xl hover:scale-105 cursor-pointer group"
            >
              <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
            </button>
          )}

          {/* Next Arrow Button */}
          {hasNext && (
            <button
              type="button"
              onClick={handleNext}
              aria-label="Próxima foto"
              className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-black/70 hover:bg-[#E50914] text-white border border-white/10 hover:border-[#E50914] flex items-center justify-center transition-all duration-200 backdrop-blur-md shadow-2xl hover:scale-105 cursor-pointer group"
            >
              <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}

          {/* Center Image */}
          <div className="w-full h-full flex items-center justify-center p-2 sm:p-4">
            <img
              src={photo.imageUrl}
              alt={photo.caption || 'Foto do participante'}
              className="max-h-full max-w-full object-contain rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.9)] animate-in fade-in duration-150"
            />
          </div>
        </div>

        {/* Dynamic Sporty Footer */}
        <div className="p-4 sm:p-5 bg-gradient-to-b from-[#111111] to-[#0a0a0a] border-t border-neutral-800/90 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 z-10">
          {/* Caption & Quote */}
          <div className="flex-1 min-w-0 pr-2">
            {photo.caption ? (
              <div className="relative pl-3 border-l-2 border-[#E50914]">
                <p className="text-xs sm:text-sm text-neutral-100 font-medium leading-relaxed italic">
                  "{photo.caption}"
                </p>
                <span className="text-[10px] text-neutral-500 font-mono block mt-0.5 uppercase tracking-wider">
                  Foto tirada na Academia Dragon · Quirinópolis / GO
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono">
                <Sparkles className="w-3.5 h-3.5 text-[#E50914]" />
                <span>Momento oficial registrado no Performance 360º</span>
              </div>
            )}
          </div>

          {/* Interactive Action Bar (Like + Upload CTA) */}
          <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
            {/* Like Heart Button */}
            <button
              type="button"
              onClick={handleLike}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                hasLiked
                  ? 'bg-rose-950/80 border-rose-600/80 text-rose-300 shadow-lg shadow-rose-900/30'
                  : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700/80 text-neutral-300 hover:text-white'
              }`}
            >
              <Heart
                className={`w-4 h-4 transition-transform ${
                  hasLiked ? 'fill-rose-500 text-rose-500 scale-125' : 'text-neutral-400'
                }`}
              />
              <span>{likes}</span>
            </button>

            {/* Quick Upload CTA */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenUpload();
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#E50914] hover:bg-[#b80710] text-white text-xs sm:text-sm font-bold shadow-lg shadow-[#E50914]/25 transition-transform hover:scale-102 cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Enviar Minha Foto</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
