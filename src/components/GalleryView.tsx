import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, X, Image as ImageIcon, Maximize2, Minimize2, ExternalLink, Globe, Sparkles, Copy, Check } from 'lucide-react';

export interface PhotoItem {
  id: string;
  imageUrl: string;
  author?: string;
  caption?: string;
  createdAt?: unknown;
}

interface GalleryViewProps {
  onGoToSite?: () => void;
}

export const GalleryView: React.FC<GalleryViewProps> = ({ onGoToSite }) => {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [showQrModal, setShowQrModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);

  // URL that QR Code directs attendees to:
  const uploadUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?mode=upload`
    : '?mode=upload';

  useEffect(() => {
    const q = query(collection(db, 'photos'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<PhotoItem, 'id'>),
        }));
        setPhotos(items);
      },
      (error) => {
        console.error('Error listening to photo wall:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(uploadUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#070707] text-neutral-100 flex flex-col selection:bg-[#E50914] selection:text-white">
      {/* Top Header / Action Bar */}
      <header className="px-4 sm:px-8 py-4 bg-[#0E0E0E]/80 backdrop-blur-md border-b border-neutral-800/80 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h1 className="text-base sm:text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
                <span>Mural de Fotos ao Vivo</span>
                <span className="hidden sm:inline-flex text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#E50914]/20 text-[#E50914] border border-[#E50914]/30">
                  Telão Dragon
                </span>
              </h1>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5 font-mono">
              {photos.length} {photos.length === 1 ? 'foto transmitida' : 'fotos transmitidas'} em tempo real
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {onGoToSite && (
            <button
              type="button"
              onClick={onGoToSite}
              className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white transition-colors cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-neutral-400" />
              <span>Site do Congresso</span>
            </button>
          )}

          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label="Alternar tela cheia"
            className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => setShowQrModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#E50914] hover:bg-[#b80710] rounded-xl text-xs sm:text-sm font-bold text-white transition-all shadow-lg shadow-[#E50914]/25 hover:shadow-[#E50914]/40 cursor-pointer"
          >
            <QrCode className="w-4 h-4" />
            <span>Escanear QR Code</span>
          </button>
        </div>
      </header>

      {/* Grid of Photos */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        {photos.length === 0 ? (
          <div className="h-[65vh] flex flex-col items-center justify-center text-center max-w-md mx-auto p-6">
            <div className="w-20 h-20 rounded-3xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-500 mb-4 shadow-xl">
              <ImageIcon className="w-10 h-10 stroke-[1.5]" />
            </div>
            <h2 className="text-xl font-bold text-white mb-1.5">
              Nenhuma foto enviada ainda
            </h2>
            <p className="text-sm text-neutral-400 mb-6">
              Escaneie o QR Code com a câmera do celular para enviar fotos do evento e aparecer na galeria oficial do site!
            </p>
            <button
              type="button"
              onClick={() => setShowQrModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#E50914] hover:bg-[#b80710] rounded-xl text-sm font-bold text-white shadow-xl shadow-[#E50914]/25 transition-transform hover:scale-105 cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>Abrir QR Code para os Convidados</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4.5">
            {photos.map((item) => (
              <div
                key={item.id}
                className="group relative bg-[#121212] border border-neutral-800/80 hover:border-[#E50914]/50 rounded-2xl overflow-hidden shadow-lg transition duration-300 hover:scale-[1.02] flex flex-col"
              >
                <div className="aspect-square w-full bg-black overflow-hidden relative">
                  <img
                    src={item.imageUrl}
                    alt={item.caption || 'Foto do mural ao vivo'}
                    className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <div className="p-3 bg-[#121212] flex flex-col justify-between flex-1 border-t border-neutral-800/50">
                  {item.caption && (
                    <p className="text-xs text-neutral-200 line-clamp-2 mb-1.5 font-medium leading-snug">
                      "{item.caption}"
                    </p>
                  )}
                  <div className="flex items-center justify-between gap-1 text-[11px] font-semibold text-[#E50914] truncate mt-auto">
                    <span className="truncate">{item.author || 'Convidado'}</span>
                    <Sparkles className="w-3 h-3 shrink-0 opacity-70" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* QR Code Modal for Projection */}
      {showQrModal && (
        <div
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowQrModal(false)}
        >
          <div
            className="bg-[#141414] border border-neutral-800 rounded-3xl p-6 sm:p-8 max-w-sm w-full flex flex-col items-center text-center relative shadow-2xl animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              aria-label="Fechar"
              className="absolute top-4 right-4 text-neutral-400 hover:text-white p-2 rounded-xl hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E50914]/15 border border-[#E50914]/30 text-[#E50914] text-[11px] font-mono font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3 h-3" />
              <span>Transmissão em Tempo Real</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-1">
              Envie sua foto
            </h2>
            <p className="text-xs text-neutral-400 mb-5 leading-relaxed">
              Aponte a câmera do celular para o QR Code abaixo para carregar sua foto diretamente na galeria do site:
            </p>

            {/* QR Code Container */}
            <div className="p-4 bg-white rounded-2xl shadow-2xl mb-4 border-4 border-neutral-900">
              <QRCodeSVG
                value={uploadUrl}
                size={220}
                level="M"
                includeMargin={false}
              />
            </div>

            <div className="w-full flex items-center justify-between gap-2 p-2 rounded-xl bg-neutral-900/80 border border-neutral-800 text-[11px] font-mono text-neutral-400 mb-3">
              <span className="truncate flex-1 text-left">{uploadUrl}</span>
              <button
                type="button"
                onClick={handleCopyLink}
                className="p-1.5 hover:text-white rounded-lg bg-neutral-800 transition-colors"
                title="Copiar link"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <a
              href={uploadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#E50914] hover:underline inline-flex items-center gap-1 font-semibold"
            >
              <span>Abrir página de upload</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryView;
