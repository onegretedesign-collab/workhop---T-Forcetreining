import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { QRCodeSVG } from 'qrcode.react';
import {
  Camera,
  QrCode,
  X,
  Copy,
  Check,
  Sparkles,
  Image as ImageIcon,
  ZoomIn,
  ExternalLink,
  Users
} from 'lucide-react';

export interface GalleryPhoto {
  id: string;
  imageUrl: string;
  author?: string;
  caption?: string;
  createdAt?: {
    toDate?: () => Date;
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

  // Determine the live upload URL
  const uploadUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?mode=upload`
    : 'https://ais-pre-zk3mewypumi3oysvl2lgb5-215875140479.us-east1.run.app/?mode=upload';

  useEffect(() => {
    const q = query(collection(db, 'photos'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<GalleryPhoto, 'id'>),
        }));
        setPhotos(items);
        setLoading(false);
      },
      (error) => {
        console.error('Erro ao escutar fotos da galeria:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
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
    <section id="galeria" className="py-20 bg-[#0E0E0E] relative border-t border-b border-neutral-800/80 scroll-mt-20">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#E50914]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E50914]/15 border border-[#E50914]/30 text-[#E50914] text-xs font-mono font-semibold uppercase tracking-wider mb-3">
              <Camera className="w-3.5 h-3.5" />
              <span>Fotos dos Participantes</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Galeria Oficial do Evento
            </h2>
            <p className="mt-2 text-sm sm:text-base text-neutral-400 max-w-2xl">
              Confira os momentos registrados em tempo real pelos participantes durante o 1º Congresso O Mundo da Musculação na Academia Dragon.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Button to open QR Code modal for event organizers / print */}
            <button
              type="button"
              onClick={() => setShowQrModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 hover:text-white border border-neutral-700/80 text-xs sm:text-sm font-semibold transition-all shadow-sm cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-[#E50914]" />
              <span>Link & QR Code</span>
            </button>

            {/* Button to upload photos */}
            <button
              type="button"
              onClick={onOpenUpload}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E50914] hover:bg-[#b80710] text-white text-xs sm:text-sm font-bold shadow-lg shadow-[#E50914]/25 transition-all cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>Tirar ou Enviar Foto</span>
            </button>
          </div>
        </div>

        {/* Gallery Content */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-neutral-500">
            <div className="w-8 h-8 border-2 border-[#E50914] border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm">Carregando fotos da galeria...</p>
          </div>
        ) : photos.length === 0 ? (
          <div className="bg-neutral-950/70 border border-neutral-800/80 rounded-3xl p-10 sm:p-14 text-center max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto text-[#E50914] mb-4">
              <Camera className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Seja o primeiro a publicar na Galeria!
            </h3>
            <p className="text-neutral-400 text-sm mb-6 leading-relaxed">
              Tire uma foto no congresso ou na Academia Dragon e compartilhe com todos os participantes. Sua foto aparecerá aqui instantaneamente.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={onOpenUpload}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#E50914] hover:bg-[#b80710] text-white text-sm font-bold shadow-lg shadow-[#E50914]/25 transition-all cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>Enviar Foto Agora</span>
              </button>
              <button
                type="button"
                onClick={() => setShowQrModal(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 text-sm font-medium transition-all cursor-pointer"
              >
                <QrCode className="w-4 h-4 text-neutral-400" />
                <span>Ver QR Code</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {photos.map((photo) => (
              <div
                key={photo.id}
                onClick={() => setSelectedPhoto(photo)}
                className="group relative bg-neutral-900 border border-neutral-800/90 hover:border-[#E50914]/50 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#E50914]/10 flex flex-col"
              >
                {/* Photo frame */}
                <div className="relative aspect-square w-full bg-neutral-950 overflow-hidden">
                  <img
                    src={photo.imageUrl}
                    alt={photo.caption || 'Foto do evento'}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="p-2.5 rounded-full bg-black/70 text-white backdrop-blur-sm transform scale-90 group-hover:scale-100 transition-transform">
                      <ZoomIn className="w-5 h-5 text-white" />
                    </span>
                  </div>
                </div>

                {/* Info Footer */}
                <div className="p-3 sm:p-4 flex flex-col justify-between flex-1 bg-[#121212]">
                  {photo.caption && (
                    <p className="text-xs sm:text-sm text-neutral-200 line-clamp-2 font-medium mb-2 leading-snug">
                      {photo.caption}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-[11px] sm:text-xs text-neutral-400 mt-auto pt-1 border-t border-neutral-800/60">
                    <span className="font-semibold text-neutral-300 truncate max-w-[130px]">
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

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[92vh] bg-neutral-950 border border-neutral-800 rounded-3xl overflow-hidden flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-neutral-800 bg-neutral-900/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#E50914]/20 border border-[#E50914]/40 flex items-center justify-center text-[#E50914]">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-white">
                    {selectedPhoto.author || 'Participante'}
                  </h4>
                  <p className="text-[11px] text-neutral-400 font-mono">
                    1º Congresso O Mundo da Musculação
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal image container */}
            <div className="flex-1 overflow-auto flex items-center justify-center bg-black p-2 sm:p-4">
              <img
                src={selectedPhoto.imageUrl}
                alt={selectedPhoto.caption || 'Foto em alta resolução'}
                className="max-h-[68vh] w-auto max-w-full object-contain rounded-xl"
              />
            </div>

            {/* Modal footer caption */}
            {selectedPhoto.caption && (
              <div className="p-4 sm:p-5 bg-neutral-900/90 border-t border-neutral-800">
                <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed">
                  {selectedPhoto.caption}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* QR Code & Link Modal */}
      {showQrModal && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowQrModal(false)}
        >
          <div
            className="relative max-w-md w-full bg-[#121212] border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E50914]/15 border border-[#E50914]/30 text-[#E50914] text-xs font-mono font-semibold uppercase tracking-wider mb-2">
                <QrCode className="w-3.5 h-3.5" />
                <span>QR Code de Envio</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                Envio de Fotos do Evento
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                Aponte a câmera do celular para este QR Code para enviar fotos direto para a galeria do site.
              </p>
            </div>

            {/* QR Code Container */}
            <div className="bg-white p-5 rounded-2xl flex items-center justify-center mx-auto shadow-inner w-56 h-56 sm:w-60 sm:h-60 mb-6">
              <QRCodeSVG
                value={uploadUrl}
                size={220}
                level="M"
                includeMargin={false}
              />
            </div>

            {/* URL input and copy button */}
            <div className="space-y-3">
              <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block">
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
                  className="px-3 py-1.5 rounded-lg bg-[#E50914] hover:bg-[#b80710] text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0"
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
              <p className="text-[11px] text-neutral-500 text-center leading-relaxed pt-1">
                Você pode copiar esse link para gerar materiais impressos, crachás ou displays para os convidados.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
