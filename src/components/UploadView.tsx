import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import {
  Camera,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Sparkles,
  Image as ImageIcon,
  Check
} from 'lucide-react';

interface UploadViewProps {
  onBackToMural?: () => void;
}

// Client-side image compressor: scales to max 960px and encodes to high-quality JPEG Data URL (< 150KB)
async function compressImageToDataUrl(file: File, maxDim = 960, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Falha ao processar imagem no navegador.'));
          return;
        }

        // Fill white background for transparent PNGs
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Falha ao ler os dados da foto selecionada.'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Erro ao carregar o arquivo selecionado.'));
    reader.readAsDataURL(file);
  });
}

export const UploadView: React.FC<UploadViewProps> = ({ onBackToMural }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [author, setAuthor] = useState('');
  const [caption, setCaption] = useState('');
  const [progress, setProgress] = useState(0);
  const [progressStage, setProgressStage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && selected.type.startsWith('image/')) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setError(null);
      setIsSuccess(false);
    } else if (selected) {
      setError('Por favor, selecione uma imagem válida (JPG, PNG, WebP).');
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Selecione ou tire uma foto primeiro.');
      return;
    }

    setIsUploading(true);
    setProgress(20);
    setProgressStage('Otimizando imagem...');
    setError(null);

    try {
      // 1. Client-side compression to lightweight Data URL (30KB - 90KB)
      const dataUrl = await compressImageToDataUrl(file, 960, 0.75);

      setProgress(60);
      setProgressStage('Publicando na galeria do site...');

      // 2. Direct Firestore storage with serverTimestamp
      await addDoc(collection(db, 'photos'), {
        imageUrl: dataUrl,
        author: author.trim() || 'Participante',
        caption: caption.trim() || '',
        createdAt: serverTimestamp(),
      });

      setProgress(100);
      setProgressStage('Foto publicada com sucesso!');
      setIsSuccess(true);
      setFile(null);
      setPreview(null);
      setCaption('');
      setAuthor('');
    } catch (err: unknown) {
      console.error('Error uploading photo:', err);
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Erro ao publicar foto na galeria: ${msg}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070707] text-neutral-100 flex flex-col items-center justify-center p-4 py-8 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#E50914]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-[#E50914]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-[#111111] border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10">
        {onBackToMural && (
          <button
            type="button"
            onClick={onBackToMural}
            className="mb-4 inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar ao Site do Congresso</span>
          </button>
        )}

        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E50914]/15 border border-[#E50914]/30 text-[#E50914] text-xs font-mono font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>1º Congresso Dragon</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Compartilhe sua Foto
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Sua foto aparecerá instantaneamente na galeria oficial do site!
          </p>
        </div>

        {isSuccess && (
          <div className="mb-6 p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl flex items-start gap-3 text-emerald-300 animate-in fade-in zoom-in-95 duration-200">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-400" />
            <div className="flex-1">
              <p className="font-bold text-sm">Foto enviada com sucesso!</p>
              <p className="text-xs text-emerald-300/90 mt-0.5">
                Sua foto já está visível na galeria do site para todos os participantes.
              </p>
              <div className="mt-3 flex items-center gap-3">
                {onBackToMural && (
                  <button
                    type="button"
                    onClick={onBackToMural}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow cursor-pointer inline-flex items-center gap-1"
                  >
                    <span>Ver na Galeria do Site</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsSuccess(false)}
                  className="text-xs font-semibold text-emerald-400 hover:underline cursor-pointer"
                >
                  Enviar outra foto
                </button>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-rose-950/60 border border-rose-600/50 rounded-2xl flex items-start gap-3 text-rose-300 animate-in fade-in duration-150">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
            <p className="text-xs leading-relaxed flex-1">{error}</p>
          </div>
        )}

        <form onSubmit={handleUpload} className="space-y-4">
          <label className="relative flex flex-col items-center justify-center border-2 border-dashed border-neutral-700 hover:border-[#E50914] rounded-2xl h-52 bg-neutral-900/60 cursor-pointer overflow-hidden transition group">
            {preview ? (
              <img
                src={preview}
                alt="Prévia"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-2.5 text-neutral-400 group-hover:text-[#E50914] px-4 text-center transition-colors">
                <div className="w-14 h-14 rounded-2xl bg-neutral-800 flex items-center justify-center text-neutral-300 group-hover:bg-[#E50914]/15 group-hover:text-[#E50914] transition-colors shadow-lg">
                  <Camera className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-white block">
                    Toque para tirar foto ou carregar
                  </span>
                  <span className="text-[11px] text-neutral-500 mt-0.5 block">
                    Formatos JPG, PNG ou WebP
                  </span>
                </div>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              disabled={isUploading}
              className="sr-only"
            />
          </label>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Seu Nome (opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Carlos Silva ou @carlostreino"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              maxLength={50}
              disabled={isUploading}
              className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-700/80 focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] rounded-xl text-white placeholder-neutral-500 text-sm outline-none transition disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Legenda (opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Presença confirmada no 1º Congresso!"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              maxLength={150}
              disabled={isUploading}
              className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-700/80 focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] rounded-xl text-white placeholder-neutral-500 text-sm outline-none transition disabled:opacity-50"
            />
          </div>

          {isUploading && (
            <div className="space-y-1.5 py-1">
              <div className="flex justify-between text-xs text-neutral-400 font-mono">
                <span>{progressStage}</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#E50914] transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!file || isUploading}
            className="w-full py-3.5 px-4 bg-[#E50914] hover:bg-[#b80710] disabled:bg-neutral-800 disabled:text-neutral-500 text-white font-bold text-sm sm:text-base rounded-xl flex items-center justify-center gap-2.5 transition shadow-xl shadow-[#E50914]/20 hover:shadow-[#E50914]/30 cursor-pointer disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Publicando na galeria...</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                <span>Enviar para a Galeria</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadView;
