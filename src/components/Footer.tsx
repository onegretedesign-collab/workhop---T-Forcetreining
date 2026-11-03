import { MapPin, Mail, ArrowUp, ExternalLink, BarChart3 } from 'lucide-react';

interface FooterProps {
  onOpenDashboard?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenDashboard }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#070707] border-t border-neutral-900 py-12 sm:py-16 text-neutral-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-10 border-b border-neutral-900">
          <div>
            <div className="flex flex-col justify-center tracking-tight">
              <span className="text-white font-extrabold text-xl sm:text-2xl font-display leading-tight">
                Performance <span className="text-[#E50914]">360º</span>
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 font-mono text-xs">
            <a
              href="https://maps.app.goo.gl/9EZESQqbT9r3VxcX7"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-neutral-300 hover:text-white transition-colors group cursor-pointer"
            >
              <MapPin className="w-4 h-4 text-[#E50914] group-hover:scale-110 transition-transform shrink-0" />
              <span className="group-hover:text-white group-hover:underline">
                Academia Dragon - Quirinópolis / Goiás
              </span>
              <ExternalLink className="w-3 h-3 text-neutral-500 group-hover:text-neutral-300" />
            </a>

            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#E50914]" />
              <span>contato@tforcetreining.com.br</span>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <a
              href="https://www.instagram.com/agenciadgpixel?vrfl=MWRzdnVpb2U5ZGI2Zg=="
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-400 hover:text-white text-xs font-mono transition-colors inline-flex items-center gap-1.5 group cursor-pointer"
            >
              <span>Criado por</span>
              <span className="font-semibold text-neutral-300 group-hover:text-[#ff4d4d] group-hover:underline transition-colors">
                AGENCIA DGPIXEL
              </span>
            </a>

            {onOpenDashboard && (
              <button
                type="button"
                onClick={onOpenDashboard}
                className="text-neutral-500 hover:text-[#E50914] text-xs font-mono transition-colors inline-flex items-center gap-1 cursor-pointer"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Painel de Vendas</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <span>Voltar ao topo</span>
            <ArrowUp className="w-3.5 h-3.5 text-[#E50914]" />
          </button>
        </div>
      </div>
    </footer>
  );
};
