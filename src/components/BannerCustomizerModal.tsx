import React, { useState } from 'react';
import { BANNER_PRESETS, BannerPreset } from '../data/summitData';
import { BannerGraphic } from './BannerGraphic';
import { Upload, Link2, Check, RefreshCw, X, Image as ImageIcon } from 'lucide-react';

interface BannerCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBanner: string;
  onApplyBanner: (bannerUrl: string) => void;
}

export const BannerCustomizerModal: React.FC<BannerCustomizerModalProps> = ({
  isOpen,
  onClose,
  currentBanner,
  onApplyBanner,
}) => {
  const [selectedBanner, setSelectedBanner] = useState<string>(currentBanner);
  const [urlInput, setUrlInput] = useState<string>('');
  const [urlError, setUrlError] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'presets' | 'upload' | 'url'>('presets');

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUrlError('Por favor, selecione um arquivo de imagem válido (PNG, JPG, WEBP, SVG).');
      return;
    }

    setFileName(file.name);
    setUrlError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setSelectedBanner(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) {
      setUrlError('Digite uma URL de imagem válida.');
      return;
    }
    if (!urlInput.startsWith('http://') && !urlInput.startsWith('https://')) {
      setUrlError('A URL deve começar com https:// ou http://');
      return;
    }
    setUrlError('');
    setSelectedBanner(urlInput.trim());
  };

  const handleConfirm = () => {
    onApplyBanner(selectedBanner);
    onClose();
  };

  const handleResetDefault = () => {
    const defaultPreset = BANNER_PRESETS[0].url;
    setSelectedBanner(defaultPreset);
    setUrlInput('');
    setFileName('');
    setUrlError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div
        className="relative w-full max-w-3xl bg-[#111111] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="banner-customizer-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-[#141414]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E50914]/10 border border-[#E50914]/30 flex items-center justify-center text-[#E50914]">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 id="banner-customizer-title" className="text-base font-bold text-white font-display">
                Personalizador de Banner Oficial
              </h2>
              <p className="text-xs text-neutral-400">
                Teste e customize o banner do Hero e do Voucher oficial do evento
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar modal"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Preview Bar */}
        <div className="p-6 border-b border-neutral-800/80 bg-neutral-950/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider font-mono text-neutral-400">
              Pré-visualização Instantânea
            </span>
            <span className="text-xs text-[#E50914] font-medium">
              Reflete no Hero e no Voucher
            </span>
          </div>
          <div className="h-44 sm:h-52 w-full rounded-xl overflow-hidden border border-neutral-800 shadow-inner">
            <BannerGraphic
              bannerUrl={selectedBanner}
              className="w-full h-full"
              showTitleOverlay={true}
            />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-neutral-800 px-6 bg-[#121212]">
          <button
            onClick={() => setActiveTab('presets')}
            className={`py-3 px-4 text-xs font-semibold tracking-wide border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'presets'
                ? 'border-[#E50914] text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Coleções Oficiais
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`py-3 px-4 text-xs font-semibold tracking-wide border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'upload'
                ? 'border-[#E50914] text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Upload de Imagem
          </button>
          <button
            onClick={() => setActiveTab('url')}
            className={`py-3 px-4 text-xs font-semibold tracking-wide border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'url'
                ? 'border-[#E50914] text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            URL Direta
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 flex-1 overflow-y-auto max-h-[340px]">
          {activeTab === 'presets' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {BANNER_PRESETS.map((preset: BannerPreset) => {
                const isSelected = selectedBanner === preset.url;
                return (
                  <button
                    key={preset.id}
                    onClick={() => setSelectedBanner(preset.url)}
                    className={`text-left p-3.5 rounded-xl border transition-all flex flex-col gap-2 ${
                      isSelected
                        ? 'border-[#E50914] bg-[#E50914]/10 shadow-lg shadow-[#E50914]/10'
                        : 'border-neutral-800 bg-neutral-900/60 hover:border-neutral-700 hover:bg-neutral-900'
                    }`}
                  >
                    <div className="h-20 w-full rounded-lg overflow-hidden border border-neutral-800">
                      <BannerGraphic bannerUrl={preset.url} className="w-full h-full" />
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm font-semibold text-white">
                        {preset.name}
                      </span>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-[#E50914] flex items-center justify-center text-white shrink-0">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 line-clamp-2">
                      {preset.description}
                    </p>
                  </button>
                );
              })}
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-neutral-700 hover:border-[#E50914] rounded-2xl p-8 bg-neutral-900/40 transition-colors text-center">
              <div className="w-12 h-12 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-[#E50914] mb-3">
                <Upload className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-white">
                Fazer upload do seu arquivo de imagem
              </h3>
              <p className="text-xs text-neutral-400 mt-1 max-w-sm">
                Formatos recomendados: JPG, PNG, WEBP ou SVG (resolução 1920x1080 ideal)
              </p>

              <label className="mt-4 px-5 py-2.5 rounded-lg bg-[#E50914] hover:bg-[#b80710] text-white font-medium text-xs cursor-pointer transition-colors inline-flex items-center gap-2">
                <Upload className="w-4 h-4" />
                <span>Escolher arquivo local</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {fileName && (
                <div className="mt-3 text-xs text-emerald-400 font-medium">
                  Arquivo selecionado: {fileName}
                </div>
              )}

              {urlError && (
                <div className="mt-3 text-xs text-[#E50914]">
                  {urlError}
                </div>
              )}
            </div>
          )}

          {activeTab === 'url' && (
            <div className="space-y-4">
              <label htmlFor="banner-url-input" className="block text-xs font-medium text-neutral-300">
                Endereço Web da Imagem (URL Direta HTTPS)
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                    <Link2 className="w-4 h-4" />
                  </div>
                  <input
                    id="banner-url-input"
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://exemplo.com/banner-evento.jpg"
                    className="w-full pl-9 pr-4 py-2.5 bg-neutral-900 border border-neutral-700 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#E50914]"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-semibold whitespace-nowrap transition-colors"
                >
                  Testar Imagem
                </button>
              </div>

              {urlError && (
                <p className="text-xs text-[#E50914]">
                  {urlError}
                </p>
              )}

              <div className="p-3 bg-neutral-900/60 rounded-lg border border-neutral-800 text-xs text-neutral-400">
                💡 Dica: Você pode testar links de imagens públicas do Imgur, Unsplash ou do seu próprio servidor de mídia.
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-800 bg-[#141414]">
          <button
            type="button"
            onClick={handleResetDefault}
            className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Restaurar Padrão</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-300 hover:text-white rounded-lg border border-neutral-800 hover:bg-neutral-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-5 py-2 text-xs font-semibold text-white bg-[#E50914] hover:bg-[#b80710] rounded-lg transition-colors shadow-lg shadow-[#E50914]/20"
            >
              Aplicar Banner Oficial
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
