import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, Check, ExternalLink, Download } from 'lucide-react';
import { SUMMIT_EVENT } from '../data/summitData';

export const AddToCalendarButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Event details
  const eventTitle = '1º Congresso O Mundo da Musculação - 15hs - Academia Dragon';
  const eventLocation = 'Academia Dragon - Quirinópolis / Goiás';
  const eventDescription =
    '1º Congresso O Mundo da Musculação: Hipertrofia, Hormonal, Nutrição, Tratamento de lesões de uma forma simples.\n\nPalestrantes confirmados: Personal Tiago Alves, Marcelo, Dr Guilherme Silverio, Jeriton, Nathálya Souza e Dra Leiliara Borges.\n\nLocal: Academia Dragon - Palco Principal\nInício pontual às 15:00.';

  // Google Calendar URL (20 de Fevereiro, 15h00 às 21h00 BRT -> 18h00 às 00h00 UTC)
  const handleOpenGoogleCalendar = () => {
    const startDate = '20260220T180000Z';
    const endDate = '20260220T233000Z';
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      eventTitle
    )}&dates=${startDate}/${endDate}&details=${encodeURIComponent(
      eventDescription
    )}&location=${encodeURIComponent(eventLocation)}&sf=true&output=xml`;

    window.open(url, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  // iCal (.ics) download for Apple Calendar, Outlook, and native devices
  const handleDownloadICal = () => {
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//WORKSHOP - T-FORCETREINING 2026//PT-BR',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'UID:workshop-t-forcetreining-20260220@dragon',
      'DTSTAMP:20260101T000000Z',
      'DTSTART:20260220T180000Z',
      'DTEND:20260220T233000Z',
      `SUMMARY:${eventTitle}`,
      `DESCRIPTION:${eventDescription.replace(/\n/g, '\\n')}`,
      `LOCATION:${eventLocation}`,
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'TRIGGER:-P1D',
      'DESCRIPTION:Lembrete: Congresso O Mundo da Musculação amanhã às 15:00 na Academia Dragon',
      'ACTION:DISPLAY',
      'END:VALARM',
      'BEGIN:VALARM',
      'TRIGGER:-PT2H',
      'DESCRIPTION:Lembrete: O congresso inicia em 2 horas na Academia Dragon',
      'ACTION:DISPLAY',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Congresso_O_Mundo_da_Musculacao_Dragon.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        className="inline-flex items-center justify-center gap-2 px-5 py-4 text-sm sm:text-base font-semibold text-neutral-200 hover:text-white bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-700/80 hover:border-neutral-600 rounded-xl transition-all shadow-lg backdrop-blur-sm group"
      >
        <Calendar className="w-4 h-4 text-[#E50914] group-hover:scale-110 transition-transform" />
        <span>Salvar na Agenda</span>
        <ChevronDown
          className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-2.5 w-72 sm:w-80 rounded-2xl bg-[#141414] border border-neutral-700 shadow-[0_20px_50px_rgba(0,0,0,0.85)] p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 border-b border-neutral-800/80 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-semibold">
              Adicionar data e hora ({SUMMIT_EVENT.date})
            </span>
            <span className="text-xs text-white font-medium block truncate">
              {SUMMIT_EVENT.time} · Academia Dragon
            </span>
          </div>

          <div className="space-y-1">
            {/* Google Calendar Option */}
            <button
              type="button"
              onClick={handleOpenGoogleCalendar}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-neutral-800/80 text-left transition-colors group/item"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400 shrink-0">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.5 3h-3V1.5H15V3H9V1.5H7.5V3h-3C3.67 3 3 3.67 3 4.5v15c0 .83.67 1.5 1.5 1.5h15c.83 0 1.5-.67 1.5-1.5v-15c0-.83-.67-1.5-1.5-1.5zm0 16.5h-15V8h15v11.5z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-white group-hover/item:text-blue-400 transition-colors">
                    Google Calendar
                  </span>
                  <ExternalLink className="w-3 h-3 text-neutral-500" />
                </div>
                <span className="text-[11px] text-neutral-400 block truncate">
                  Adicionar ao Google Agenda
                </span>
              </div>
            </button>

            {/* Apple Calendar / iCal Option */}
            <button
              type="button"
              onClick={handleDownloadICal}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-neutral-800/80 text-left transition-colors group/item"
            >
              <div className="w-8 h-8 rounded-lg bg-[#E50914]/10 border border-[#E50914]/25 flex items-center justify-center text-[#E50914] shrink-0">
                <Download className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-white group-hover/item:text-[#E50914] transition-colors">
                    Apple Calendar / iCal
                  </span>
                  {copied && <Check className="w-3 h-3 text-emerald-400" />}
                </div>
                <span className="text-[11px] text-neutral-400 block truncate">
                  Baixar arquivo .ics (iOS, Mac, Outlook)
                </span>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
