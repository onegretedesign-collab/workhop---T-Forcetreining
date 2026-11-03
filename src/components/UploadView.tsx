import React, { useState } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { storage, db } from '../firebase';
import { Camera, Upload, CheckCircle2, AlertCircle, Loader2, ArrowLeft, Sparkles, Image as ImageIcon } from 'lucide-react';

interface UploadViewProps {
  onBackToMural?: () => void;
}

// Helper to compress image client-side to ensure quick uploads
async function compressImage(file: File, maxDim = 1600, quality = 0.85): Promise<Blob> {
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
          resolve(file);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else resolve(file);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Convert blob to DataURL fallback if Storage bucket rejects unauthenticated uploads
function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export const UploadView: React.FC<UploadViewProps> = ({ onBackToMural }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [author, setAuthor] = useState('');
  const [caption, setCaption] = useState('');
  const [progress, setProgress] = useState(0);
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
    setProgress(10);
    setError(null);

    try {
      // 1. Compress image for mobile efficiency
      const compressedBlob = await compressImage(file, 1600, 0.85);
      setProgress(25);

      let downloadURL = '';

      // 2. Try Firebase Storage upload
      try {
        const sanitizedFileName = `${Date.now()}_${file.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_.-]/g, '')}`;
        const storageRef = ref(storage, `event_photos/${sanitizedFileName}`);
        const uploadTask = uploadBytesResumable(storageRef, compressedBlob);

        downloadURL = await new Promise<string>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 60) + 25;
              setProgress(pct);
            },
            (err) => reject(err),
            async () => {
              try {
                const url = await getDownloadURL(uploadTask.snapshot.ref);
                resolve(url);
              } catch (urlErr) {
                reject(urlErr);
              }
            }
          );
        });
      } catch (storageErr) {
        console.warn('Storage upload fallback:', storageErr);
        // Fallback to high-efficiency data URL if Storage bucket is in default rules
        downloadURL = await blobToDataURL(compressedBlob);
      }

      setProgress(90);

      // 3. Record in Firestore 'photos' collection
      await addDoc(collection(db, 'photos'), {
        imageUrl: downloadURL,
        author: author.trim() || 'Convidado',
        caption: caption.trim() || '',
        createdAt: serverTimestamp(),
      });

      setProgress(100);
      setIsSuccess(true);
      setFile(null);
      setPreview(null);
      setCaption('');
      setAuthor('');
    } catch (err: unknown) {
      console.error('Error uploading photo:', err);
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Erro ao registrar foto no mural: ${msg}`);
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
            className="mb-4 inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar ao Telão</span>
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
            Sua foto aparecerá instantaneamente no telão principal do evento!
          </p>
        </div>

        {isSuccess && (
          <div className="mb-6 p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl flex items-start gap-3 text-emerald-300 animate-in fade-in zoom-in-95 duration-200">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-400" />
            <div className="flex-1">
              <p className="font-bold text-sm">Foto enviada com sucesso!</p>
              <p className="text-xs text-emerald-300/90 mt-0.5">
                Olhe para o telão da plenária para vê-la aparecer ao vivo.
              </p>
              <button
                type="button"
                onClick={() => setIsSuccess(false)}
                className="mt-3 text-xs font-semibold text-emerald-400 hover:underline inline-flex items-center gap-1"
              >
                <span>Enviar outra foto</span>
              </button>
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
              className="hidden"
              disabled={isUploading}
            />
          </label>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5 font-mono">
              Seu Nome (opcional)
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Ex: Carlos Silva ou @carlostreino"
              disabled={isUploading}
              maxLength={80}
              className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm focus:outline-none focus:border-[#E50914] text-neutral-100 placeholder:text-neutral-600 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5 font-mono">
              Legenda (opcional)
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Ex: Presença confirmada no 1º Congresso!"
              disabled={isUploading}
              maxLength={200}
              className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm focus:outline-none focus:border-[#E50914] text-neutral-100 placeholder:text-neutral-600 transition-colors"
            />
          </div>

          {isUploading && (
            <div className="space-y-1.5 pt-1">
              <div className="w-full bg-neutral-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-[#E50914] h-full transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[11px] font-mono text-right text-neutral-400">
                {progress}% enviado
              </p>
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
                <span>Enviando para o telão...</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                <span>Enviar para o Telão</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadView;
