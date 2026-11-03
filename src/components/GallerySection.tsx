import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { QRCodeSVG } from 'qrcode.react';
import { PhotoModal } from './PhotoModal';
import {
  Camera,
  QrCode,
  X,
  Copy,
  Check,
  Sparkles,
  Flame,
  ZoomIn,
  RefreshCw,
  Users,
  Dumbbell
} from 'lucide-react';

export interface GalleryPhoto {
  id: string;
  imageUrl: string;
  author?: string;
  caption?: string;
  createdAt?: {
    toDate?: () => Date;
    toMillis?: () => number;
    seconds?: number;
  } | null;
}

interface GallerySectionProps {
  onOpenUpload: () => void;
}

export const GallerySection: React.FC<GallerySectionProps> = ({ onOpenUpload }) => {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);
  const [copied, setCopied] = useState(false);

  // Live upload URL for QR Code
  const uploadUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?mode=upload`
    : 'https://ais-pre-zk3mewypumi3oysvl2lgb5-215875140479.us-east1.run.app/?mode=upload';

  // Real-time Firestore listener with resilient client-side ordering
  useEffect(() => {
    let unsubscribe: () => void;

    try {
      // Primary real-time subscription
      const photosCollection = collection(db, 'photos');
      unsubscribe = onSnapshot(
        photosCollection,
        (snapshot) => {
          const items: GalleryPhoto[] = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              imageUrl: data.imageUrl || '',
              author: data.author || 'Participante',
              caption: data.caption || '',
              createdAt: data.createdAt || null,
            };
          });

          // Sort descending (newest photos first), handling both committed timestamps and local pending writes
          items.sort((a, b) => {
            const getTime = (c: GalleryPhoto['createdAt']) => {
              if (!c) return Date.now(); // pending local write
              if (typeof c.toMillis === 'function') return c.toMillis();
              if (typeof c.toDate === 'function') return c.toDate().getTime();
              if (c.seconds) return c.seconds * 1000;
              return 0;
            };
            return getTime(b.createdAt) - getTime(a.createdAt);
          });

          setPhotos(items);
          setLoading(false);
        },
        (error) => {
          console.error('Erro ao escutar fotos da galeria em tempo real:', error);
          setLoading(false);
        }
      );
    } catch (err) {
      console.error('Falha ao inicializar ouvinte da galeria:', err);
      setLoading(false);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(uploadUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const formatPhotoDate = (createdAt?: GalleryPhoto['createdAt']) => {
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
    <section id="galeria" className="py-20 bg-[#0A0A0A] relative border-t border-b border-neutral-900 scroll-mt-20 overflow-hidden">
      {/* Dynamic ambient background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[450px] bg-[#E50914]/10 rounded-full blur-[170px] pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-[400px] h-[300px] bg-red-600/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E50914]/15 border border-[#E50914]/30 text-[#E50914] text-xs font-mono font-semibold uppercase tracking-wider mb-3">
              <Camera className="w-3.5 h-3.5" />
              <span>Galeria dos Participantes</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-1" />
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                Ao Vivo
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight uppercase font-display">
              Mural de Fotos Oficial
            </h2>

            <p className="mt-2 text-sm sm:text-base text-neutral-400 max-w-2xl leading-relaxed">
              Registros e bastidores em tempo real tirados por quem está vivendo o{' '}
              <strong className="text-neutral-200">Performance 360º</strong> na Academia Dragon.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Live photo counter */}
            {photos.length > 0 && (
              <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900/90 border border-neutral-800 text-xs font-mono font-bold text-neutral-300">
                <Flame className="w-3.5 h-3.5 text-[#E50914]" />
                <span>{photos.length} {photos.length === 1 ? 'registro' : 'registros'}</span>
              </div>
            )}

            {/* QR Code button */}
            <button
              type="button"
              onClick={() => setShowQrModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 hover:text-white border border-neutral-700/80 text-xs sm:text-sm font-semibold transition-all shadow-sm cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-[#E50914]" />
              <span>Link & QR Code</span>
            </button>

            {/* Upload CTA */}
            <button
              type="button"
              onClick={onOpenUpload}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E50914] hover:bg-[#b80710] text-white text-xs sm:text-sm font-bold shadow-xl shadow-[#E50914]/25 hover:shadow-[#E50914]/40 transition-all hover:scale-102 cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>Enviar Minha Foto</span>
            </button>
          </div>
        </div>

        {/* Gallery Dynamic Content */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-neutral-500">
            <div className="w-10 h-10 border-2 border-[#E50914] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm font-medium text-neutral-400">
              Conectando à galeria em tempo real...
            </p>
          </div>
        ) : photos.length === 0 ? (
          <div className="bg-gradient-to-b from-neutral-900/60 to-neutral-950/80 border border-neutral-800 rounded-3xl p-10 sm:p-14 text-center max-w-xl mx-auto shadow-2xl relative overflow-hidden group">
            <div className="w-20 h-20 rounded-3xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto text-[#E50914] mb-5 shadow-inner">
              <Camera className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">
              Inaugure a Galeria Oficial!
            </h3>
            <p className="text-neutral-400 text-sm mb-7 leading-relaxed">
              Seja o primeiro participante a postar uma foto do Performance 360º ou da Academia Dragon. Sua foto aparecerá aqui instantaneamente com seu nome!
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <button
                type="button"
                onClick={onOpenUpload}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#E50914] hover:bg-[#b80710] text-white text-sm font-bold shadow-xl shadow-[#E50914]/30 transition-all cursor-pointer hover:scale-105"
              >
                <Camera className="w-4 h-4" />
                <span>Enviar Foto Agora</span>
              </button>
              <button
                type="button"
                onClick={() => setShowQrModal(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 text-sm font-medium transition-all cursor-pointer"
              >
                <QrCode className="w-4 h-4 text-neutral-400" />
                <span>Exibir QR Code</span>
              </button>
            </div>
          </div>
        ) : (
          /* Fluid, responsive grid with sports styling */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4.5">
            {photos.map((photo) => (
              <div
                key={photo.id}
                onClick={() => setSelectedPhoto(photo)}
                className="group relative bg-[#121212] border border-neutral-800/90 hover:border-[#E50914] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_15px_35px_rgba(229,9,20,0.2)] flex flex-col"
              >
                {/* Photo Viewport */}
                <div className="relative aspect-square w-full bg-black overflow-hidden">
                  <img
                    src={photo.imageUrl}
                    alt={photo.caption || 'Foto do evento'}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
                  />

                  {/* Sporty Corner Glow on Hover */}
                  <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/80 border border-[#E50914]/60 text-[10px] font-mono text-white font-bold backdrop-blur-sm">
                      <Flame className="w-2.5 h-2.5 text-[#E50914]" />
                      <span>VIP</span>
                    </span>
                  </div>

                  {/* Hover Overlay with Zoom Icon */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <span className="p-3 rounded-2xl bg-[#E50914] text-white shadow-2xl transform scale-75 group-hover:scale-100 transition-transform duration-300">
                      <ZoomIn className="w-5 h-5 text-white" />
                    </span>
                  </div>
                </div>

                {/* Card Info Footer */}
                <div className="p-3 flex flex-col justify-between flex-1 bg-gradient-to-b from-[#141414] to-[#0e0e0e] border-t border-neutral-800/80">
                  {photo.caption && (
                    <p className="text-xs text-neutral-200 line-clamp-1 font-medium mb-1.5 leading-tight">
                      "{photo.caption}"
                    </p>
                  )}
                  <div className="flex items-center justify-between text-[11px] text-neutral-400 mt-auto pt-1">
                    <span className="font-bold text-neutral-300 truncate max-w-[110px] uppercase tracking-tight">
                      {photo.author || 'Participante'}
                    </span>
                    <span className="text-neutral-500 font-mono text-[10px]">
                      {formatPhotoDate(photo.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dynamic, Sporty Full-Featured Photo Modal */}
      {selectedPhoto && (
        <PhotoModal
          photo={selectedPhoto}
          photos={photos}
          onClose={() => setSelectedPhoto(null)}
          onSelectPhoto={(next) => setSelectedPhoto(next)}
          onOpenUpload={onOpenUpload}
        />
      )}

      {/* QR Code & Link Modal */}
      {showQrModal && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowQrModal(false)}
        >
          <div
            className="relative max-w-md w-full bg-[#121212] border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E50914]/15 border border-[#E50914]/30 text-[#E50914] text-xs font-mono font-semibold uppercase tracking-wider mb-2">
                <QrCode className="w-3.5 h-3.5" />
                <span>QR Code dos Participantes</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight font-display">
                Envie sua Foto · Performance 360º
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                Aponte a câmera do celular para este QR Code para enviar fotos direto para a galeria do site.
              </p>
            </div>

            {/* QR Code */}
            <div className="bg-white p-5 rounded-2xl flex items-center justify-center mx-auto shadow-2xl w-56 h-56 sm:w-60 sm:h-60 mb-6">
              <QRCodeSVG
                value={uploadUrl}
                size={220}
                level="M"
                includeMargin={false}
              />
            </div>

            {/* Direct Link Box */}
            <div className="space-y-3">
              <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-semibold">
                Link direto para envio:
              </label>
              <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-700 rounded-xl p-2">
                <input
                  type="text"
                  readOnly
                  value={uploadUrl}
                  className="bg-transparent text-xs text-neutral-200 flex-1 outline-none px-2 font-mono truncate"
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-lg bg-[#E50914] hover:bg-[#b80710] text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-neutral-500 text-center leading-relaxed pt-1 font-sans">
                Copie e use em materiais impressos, totens ou crachás na Academia Dragon.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default GallerySection;
