import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeCameraScanConfig } from 'html5-qrcode';
import confetti from 'canvas-confetti';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { SaleRecord } from '../types/sale';
import { playSuccessChime, playWarningChime } from '../utils/audioChimes';
import { formatCPF, cleanDigits } from '../utils/formatters';
import {
  QrCode,
  Camera,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  Users,
  ShieldCheck,
  RefreshCw,
  ArrowLeft,
  Volume2,
  Calendar,
  Clock,
  Sparkles,
  UserCheck,
  UserX,
  FlipHorizontal,
  SlidersHorizontal,
} from 'lucide-react';

interface CheckInScannerViewProps {
  onBackToSite: () => void;
  onOpenDashboard?: () => void;
}

export const CheckInScannerView: React.FC<CheckInScannerViewProps> = ({
  onBackToSite,
  onOpenDashboard,
}) => {
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'camera' | 'search' | 'list'>('camera');

  // Scanner state
  const [scannerActive, setScannerActive] = useState(false);
  const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [scannerError, setScannerError] = useState<string | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  // Manual search / USB barcode gun input
  const [manualCode, setManualCode] = useState('');

  // Current scanned result
  const [scanResult, setScanResult] = useState<{
    status: 'success' | 'already_checked' | 'not_found' | 'pending';
    sale?: SaleRecord;
    rawPayload: string;
    message: string;
    timestamp: string;
  } | null>(null);

  // List filter
  const [listSearch, setListSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'checked_in' | 'pending_checkin'>('all');

  // 1. Sync real-time sales from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'sales'),
      (snapshot) => {
        const loaded: SaleRecord[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          loaded.push({
            id: docSnap.id,
            customerName: d.customerName || 'Participante',
            email: d.email || '',
            phone: d.phone || '',
            cpf: d.cpf || '',
            companyRole: d.companyRole || '',
            voucherCode: d.voucherCode || '',
            purchaseTime: d.purchaseTime || '',
            ticketType: d.ticketType || 'Passaporte Oficial Performance 360º',
            attendeesCount: Number(d.attendeesCount) || 1,
            amount: Number(d.amount) || 0,
            paymentMethod: d.paymentMethod || 'pix',
            status: d.status || 'confirmed',
            notes: d.notes || '',
            origin: d.origin === 'online' ? 'online' : 'manual',
            checkedIn: Boolean(d.checkedIn),
            checkInTime: d.checkInTime || '',
            checkInStaff: d.checkInStaff || '',
            createdAt:
              d.createdAt?.toDate?.()?.toISOString() ||
              (typeof d.createdAt === 'string' ? d.createdAt : new Date().toISOString()),
          });
        });
        setSales(loaded);
        setIsLoading(false);
      },
      (err) => {
        console.error('Erro ao escutar vendas na portaria:', err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // 2. Discover cameras when component mounts
  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length > 0) {
          setCameras(devices);
          // Prefer back/environment camera on mobile
          const backCam = devices.find((d) =>
            d.label.toLowerCase().includes('back') ||
            d.label.toLowerCase().includes('traseira') ||
            d.label.toLowerCase().includes('environment')
          );
          setSelectedCameraId(backCam ? backCam.id : devices[0].id);
        } else {
          setScannerError('Nenhuma câmera encontrada no dispositivo.');
        }
      })
      .catch((err) => {
        console.warn('Erro ao listar câmeras:', err);
        setScannerError('Permissão de câmera não concedida ou dispositivo sem câmera.');
      });

    return () => {
      stopScanner();
    };
  }, []);

  // 3. Start camera scanner
  const startScanner = async (cameraId: string) => {
    stopScanner();
    setScannerError(null);

    try {
      const html5QrCode = new Html5Qrcode('qr-reader-container');
      html5QrCodeRef.current = html5QrCode;

      const config: Html5QrcodeCameraScanConfig = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      await html5QrCode.start(
        cameraId,
        config,
        (decodedText) => {
          handleQrCodeScanned(decodedText);
        },
        () => {
          // Frame read without QR - normal
        }
      );

      setScannerActive(true);
    } catch (err: any) {
      console.error('Falha ao iniciar leitor de câmera:', err);
      setScannerError('Não foi possível acessar a câmera. Verifique as permissões.');
      setScannerActive(false);
    }
  };

  const stopScanner = () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      html5QrCodeRef.current
        .stop()
        .then(() => {
          html5QrCodeRef.current?.clear();
          html5QrCodeRef.current = null;
          setScannerActive(false);
        })
        .catch(() => {
          // ignore stop error
        });
    }
  };

  // Manage scanner lifecycle with activeTab
  useEffect(() => {
    if (activeTab === 'camera' && selectedCameraId) {
      startScanner(selectedCameraId);
    } else {
      stopScanner();
    }
    return () => {
      stopScanner();
    };
  }, [activeTab, selectedCameraId]);

  // 4. Core validation engine
  const handleQrCodeScanned = async (rawCode: string) => {
    const trimmed = rawCode.trim();
    if (!trimmed) return;

    // Parse potential formats:
    // P360-CHECKIN:020.401.631-23:P360-ZESJ-UKS8
    // P360-ZESJ-UKS8
    // 02040163123
    let searchVoucher = '';
    let searchCpf = '';

    if (trimmed.startsWith('P360-CHECKIN:')) {
      const parts = trimmed.split(':');
      if (parts.length >= 3) {
        searchCpf = cleanDigits(parts[1]);
        searchVoucher = parts[2].trim().toUpperCase();
      } else if (parts.length === 2) {
        searchVoucher = parts[1].trim().toUpperCase();
      }
    } else if (trimmed.toUpperCase().startsWith('P360-')) {
      searchVoucher = trimmed.toUpperCase();
    } else if (cleanDigits(trimmed).length === 11) {
      searchCpf = cleanDigits(trimmed);
    } else {
      searchVoucher = trimmed.toUpperCase();
    }

    // Lookup in memory sales collection
    const found = sales.find((s) => {
      if (searchVoucher && s.voucherCode && s.voucherCode.toUpperCase() === searchVoucher) {
        return true;
      }
      if (searchCpf && s.cpf && cleanDigits(s.cpf) === searchCpf) {
        return true;
      }
      if (searchVoucher && s.notes && s.notes.toUpperCase().includes(searchVoucher)) {
        return true;
      }
      if (s.id === trimmed) {
        return true;
      }
      return false;
    });

    const now = new Date();
    const formattedNow = `${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR')}`;

    if (!found) {
      playWarningChime();
      setScanResult({
        status: 'not_found',
        rawPayload: trimmed,
        message: 'Ingresso NÃO encontrado no sistema! Verifique se a compra foi concluída no Mercado Pago.',
        timestamp: formattedNow,
      });
      return;
    }

    if (found.status === 'pending' || found.status === 'cancelled') {
      playWarningChime();
      setScanResult({
        status: 'pending',
        sale: found,
        rawPayload: trimmed,
        message: `Pagamento PENDENTE ou NÃO APROVADO (Status: ${found.status.toUpperCase()}). Crachá não liberado.`,
        timestamp: formattedNow,
      });
      return;
    }

    // Check if already checked in earlier
    if (found.checkedIn) {
      playWarningChime();
      setScanResult({
        status: 'already_checked',
        sale: found,
        rawPayload: trimmed,
        message: `ATENÇÃO: Este crachá JÁ FOI RETIRADO anteriormente! Check-in registrado em ${found.checkInTime || 'Data anterior'}.`,
        timestamp: formattedNow,
      });
      return;
    }

    // SUCCESS: Legitimate participant, first check-in!
    playSuccessChime();
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#E50914', '#10B981', '#FFFFFF'],
    });

    // Mark as checked in in Firestore
    try {
      await updateDoc(doc(db, 'sales', found.id), {
        checkedIn: true,
        checkInTime: formattedNow,
        checkInStaff: 'Portaria Principal (Totem QR Code)',
      });
    } catch (err) {
      console.warn('Erro ao gravar check-in no Firestore:', err);
    }

    setScanResult({
      status: 'success',
      sale: { ...found, checkedIn: true, checkInTime: formattedNow },
      rawPayload: trimmed,
      message: 'ENTRADA LIBERADA! Crachá nominal e credencial autorizados para entrega.',
      timestamp: formattedNow,
    });
  };

  const handleManualSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleQrCodeScanned(manualCode);
  };

  const handleToggleCheckinManual = async (sale: SaleRecord) => {
    const nextState = !sale.checkedIn;
    const now = new Date();
    const formattedNow = `${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR')}`;

    try {
      await updateDoc(doc(db, 'sales', sale.id), {
        checkedIn: nextState,
        checkInTime: nextState ? formattedNow : null,
        checkInStaff: nextState ? 'Portaria (Manual)' : null,
      });
      if (nextState) {
        playSuccessChime();
      }
    } catch (err) {
      console.error('Erro ao alternar check-in:', err);
    }
  };

  // Stats
  const confirmedSales = sales.filter((s) => s.status === 'confirmed');
  const checkedInCount = confirmedSales.filter((s) => s.checkedIn).length;
  const pendingCheckInCount = confirmedSales.length - checkedInCount;
  const attendanceRate = confirmedSales.length > 0
    ? Math.round((checkedInCount / confirmedSales.length) * 100)
    : 0;

  // Filtered List
  const filteredList = sales.filter((sale) => {
    if (statusFilter === 'checked_in' && !sale.checkedIn) return false;
    if (statusFilter === 'pending_checkin' && sale.checkedIn) return false;

    if (!listSearch.trim()) return true;
    const term = listSearch.toLowerCase();
    return (
      sale.customerName.toLowerCase().includes(term) ||
      (sale.cpf && cleanDigits(sale.cpf).includes(cleanDigits(term))) ||
      (sale.voucherCode && sale.voucherCode.toLowerCase().includes(term)) ||
      (sale.phone && sale.phone.includes(term)) ||
      (sale.companyRole && sale.companyRole.toLowerCase().includes(term))
    );
  });

  return (
    <div className="min-h-screen bg-[#070707] text-neutral-100 flex flex-col font-sans selection:bg-[#E50914] selection:text-white">
      {/* Header */}
      <header className="border-b border-neutral-800 bg-[#0C0C0C]/90 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 py-3.5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <button
              type="button"
              onClick={onBackToSite}
              className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800 hover:border-neutral-700 px-3 py-1.5 rounded-xl transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-[#E50914]" />
              <span>Voltar ao Site</span>
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
                  Sistema de Portaria & Totem
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-extrabold text-white font-display leading-tight">
                Credenciamento & Leitor de QR Code
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {onOpenDashboard && (
              <button
                type="button"
                onClick={onOpenDashboard}
                className="inline-flex items-center gap-1.5 text-xs text-neutral-300 hover:text-white bg-neutral-900 border border-neutral-800 hover:border-neutral-700 px-3 py-1.5 rounded-xl transition cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#E50914]" />
                <span>Painel de Vendas</span>
              </button>
            )}

            <div className="flex items-center gap-2 bg-neutral-900/80 border border-neutral-800 px-3 py-1.5 rounded-xl text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5 text-[#E50914]" />
              <span className="text-neutral-300">Dragon Gym · 14h20</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Real-time Presence Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-[#111111] border border-neutral-800/80 flex flex-col justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
              Total Confirmados
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-display">
                {confirmedSales.length}
              </span>
              <span className="text-xs text-neutral-500 font-mono">pagos</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex flex-col justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Crachás Entregues</span>
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-display">
                {checkedInCount}
              </span>
              <span className="text-xs text-emerald-400/80 font-mono">({attendanceRate}%)</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#111111] border border-neutral-800/80 flex flex-col justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#E50914]" />
              <span>Aguardando Chegada</span>
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-neutral-200 font-display">
                {pendingCheckInCount}
              </span>
              <span className="text-xs text-neutral-500 font-mono">na fila</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#111111] border border-neutral-800/80 flex flex-col justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
              Lotação Dragon Gym
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#E50914] font-display">
                500
              </span>
              <span className="text-xs text-neutral-500 font-mono">capacidade</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('camera')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              activeTab === 'camera'
                ? 'bg-[#E50914] text-white shadow-lg shadow-[#E50914]/25'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Câmera (Escanear QR Code)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('search')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              activeTab === 'search'
                ? 'bg-[#E50914] text-white shadow-lg shadow-[#E50914]/25'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Digitação / Leitor USB</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              activeTab === 'list'
                ? 'bg-[#E50914] text-white shadow-lg shadow-[#E50914]/25'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Lista de Participantes ({confirmedSales.length})</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: Live Camera Scanner                                                */}
        {/* ========================================================================= */}
        {activeTab === 'camera' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Video Viewfinder Container */}
            <div className="lg:col-span-7 bg-[#111111] border border-neutral-800 rounded-3xl p-4 sm:p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <span className="text-xs font-mono uppercase tracking-wider text-neutral-300 font-bold flex items-center gap-2">
                  <Camera className="w-4 h-4 text-[#E50914]" />
                  <span>Área de Leitura ao Vivo</span>
                </span>

                {/* Camera selector */}
                {cameras.length > 1 && (
                  <select
                    value={selectedCameraId}
                    onChange={(e) => setSelectedCameraId(e.target.value)}
                    className="bg-neutral-900 border border-neutral-700 text-neutral-200 text-xs px-2.5 py-1 rounded-lg outline-none cursor-pointer"
                  >
                    {cameras.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label || `Câmera ${c.id.slice(0, 5)}`}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Viewfinder element */}
              <div className="relative my-4 rounded-2xl overflow-hidden bg-black flex items-center justify-center min-h-[300px] border border-neutral-800">
                <div id="qr-reader-container" className="w-full max-w-[400px]" />

                {/* Animated laser scan line overlay */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-64 h-64 border-2 border-[#E50914]/60 rounded-3xl relative shadow-[0_0_20px_rgba(229,9,20,0.3)]">
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#E50914] to-transparent animate-pulse" />
                    <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#E50914]" />
                    <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#E50914]" />
                    <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#E50914]" />
                    <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#E50914]" />
                  </div>
                </div>
              </div>

              {scannerError && (
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{scannerError}</span>
                </div>
              )}

              <p className="text-[11px] text-neutral-500 font-mono text-center pt-2">
                Aponte a câmera para o QR Code impresso no voucher do participante ou na tela do celular dele.
              </p>
            </div>

            {/* Right: Validation Feedback Card */}
            <div className="lg:col-span-5 flex flex-col justify-start">
              {scanResult ? (
                <div
                  className={`p-6 rounded-3xl border shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200 ${
                    scanResult.status === 'success'
                      ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-emerald-500/10'
                      : scanResult.status === 'already_checked'
                      ? 'bg-amber-950/40 border-amber-500 text-white shadow-amber-500/10'
                      : 'bg-red-950/40 border-red-500 text-white shadow-red-500/10'
                  }`}
                >
                  {/* Status Banner */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                        scanResult.status === 'success'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : scanResult.status === 'already_checked'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {scanResult.status === 'success' ? (
                        <CheckCircle2 className="w-7 h-7" />
                      ) : scanResult.status === 'already_checked' ? (
                        <AlertTriangle className="w-7 h-7" />
                      ) : (
                        <XCircle className="w-7 h-7" />
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest font-bold block opacity-80">
                        {scanResult.status === 'success'
                          ? '✅ VALIDAÇÃO CONCLUÍDA'
                          : scanResult.status === 'already_checked'
                          ? '⚠️ ALERTA DE DUPLICIDADE'
                          : '❌ ACESSO NÃO AUTORIZADO'}
                      </span>
                      <h3 className="text-lg font-extrabold leading-tight">
                        {scanResult.status === 'success'
                          ? 'CRACHÁ AUTORIZADO'
                          : scanResult.status === 'already_checked'
                          ? 'CRACHÁ JÁ RETIRADO!'
                          : 'INGRESSO NÃO LOCALIZADO'}
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs leading-relaxed opacity-90 border-t border-white/10 pt-3">
                    {scanResult.message}
                  </p>

                  {/* Participant Details if Found */}
                  {scanResult.sale && (
                    <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-2 text-xs">
                      <div>
                        <span className="text-neutral-400 text-[10px] block uppercase font-mono">
                          Nome impresso no crachá:
                        </span>
                        <span className="text-lg font-extrabold text-white uppercase tracking-tight block">
                          {scanResult.sale.customerName}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-[11px]">
                        <div>
                          <span className="text-neutral-500 block">CPF</span>
                          <span className="font-mono text-neutral-200 font-bold">{scanResult.sale.cpf || 'Não informado'}</span>
                        </div>
                        <div>
                          <span className="text-neutral-500 block">Cargo / Especialidade</span>
                          <span className="text-neutral-200 font-semibold">{scanResult.sale.companyRole || 'Participante VIP'}</span>
                        </div>
                        <div>
                          <span className="text-neutral-500 block">Voucher ID</span>
                          <span className="font-mono text-[#E50914] font-bold">{scanResult.sale.voucherCode || scanResult.sale.id.slice(0, 8)}</span>
                        </div>
                        <div>
                          <span className="text-neutral-500 block">Pagamento</span>
                          <span className="text-emerald-400 font-bold">R$ 200,00 (Confirmado)</span>
                        </div>
                      </div>

                      {scanResult.sale.checkInTime && (
                        <div className="pt-2 border-t border-white/10 text-[11px] text-neutral-400 flex items-center justify-between font-mono">
                          <span>Horário do Check-in:</span>
                          <span className="text-white font-bold">{scanResult.sale.checkInTime}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Reset Button */}
                  <button
                    type="button"
                    onClick={() => setScanResult(null)}
                    className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer"
                  >
                    Próximo Check-in (Escanear Novamente)
                  </button>
                </div>
              ) : (
                <div className="bg-[#111111] border border-neutral-800 rounded-3xl p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
                  <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-500 flex items-center justify-center mb-4">
                    <QrCode className="w-8 h-8 text-[#E50914]" />
                  </div>
                  <h3 className="text-base font-bold text-white">
                    Aguardando Leitura do QR Code
                  </h3>
                  <p className="text-xs text-neutral-400 max-w-xs mt-1.5 leading-relaxed">
                    Assim que o leitor capturar o QR Code do participante, os dados do crachá aparecerão aqui automaticamente com som de confirmação.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: Manual Search & USB Barcode Gun                                    */}
        {/* ========================================================================= */}
        {activeTab === 'search' && (
          <div className="bg-[#111111] border border-neutral-800 rounded-3xl p-6 sm:p-8 max-w-2xl mx-auto space-y-6 shadow-2xl">
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#E50914]/15 border border-[#E50914]/30 text-[#E50914] flex items-center justify-center mx-auto mb-3">
                <Search className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-extrabold text-white font-display">
                Validação Manual / Leitor Óptico USB
              </h2>
              <p className="text-xs text-neutral-400 mt-1 max-w-md mx-auto">
                Digite o Código do Voucher (ex: P360-ZESJ-UKS8), CPF ou Nome do comprador, ou use um leitor de código de barras USB.
              </p>
            </div>

            <form onSubmit={handleManualSearchSubmit} className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  autoFocus
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="Ex: P360-ZESJ-UKS8 ou 02040163123 ou Nome"
                  className="w-full pl-11 pr-4 py-3.5 bg-neutral-950 border border-neutral-700 rounded-2xl text-base text-white placeholder-neutral-500 focus:outline-none focus:border-[#E50914] font-mono uppercase"
                />
                <QrCode className="w-5 h-5 text-neutral-500 absolute left-3.5 top-4" />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-[#E50914] hover:bg-[#b80710] transition shadow-lg shadow-[#E50914]/25 cursor-pointer flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Validar & Entregar Crachá</span>
                </button>

                {manualCode && (
                  <button
                    type="button"
                    onClick={() => {
                      setManualCode('');
                      setScanResult(null);
                    }}
                    className="py-3.5 px-4 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white text-xs font-bold transition cursor-pointer"
                  >
                    Limpar
                  </button>
                )}
              </div>
            </form>

            {/* Scan result display in manual tab */}
            {scanResult && (
              <div
                className={`p-5 rounded-2xl border ${
                  scanResult.status === 'success'
                    ? 'bg-emerald-950/30 border-emerald-500 text-emerald-200'
                    : scanResult.status === 'already_checked'
                    ? 'bg-amber-950/30 border-amber-500 text-amber-200'
                    : 'bg-red-950/30 border-red-500 text-red-200'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm mb-1">
                  <span>{scanResult.status === 'success' ? '✅' : scanResult.status === 'already_checked' ? '⚠️' : '❌'}</span>
                  <span>{scanResult.message}</span>
                </div>
                {scanResult.sale && (
                  <div className="mt-2 text-xs space-y-1 text-white">
                    <p><strong>Participante:</strong> {scanResult.sale.customerName}</p>
                    <p><strong>CPF:</strong> {scanResult.sale.cpf || 'Não cadastrado'}</p>
                    <p><strong>Cargo:</strong> {scanResult.sale.companyRole || 'VIP'}</p>
                    <p><strong>Horário de Registro:</strong> {scanResult.sale.checkInTime || 'Agora'}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: Full Attendance List & Quick Toggle                                */}
        {/* ========================================================================= */}
        {activeTab === 'list' && (
          <div className="bg-[#111111] border border-neutral-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl">
            {/* Search & Filter Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  value={listSearch}
                  onChange={(e) => setListSearch(e.target.value)}
                  placeholder="Buscar participante, CPF, voucher..."
                  className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#E50914]"
                />
                <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-2.5" />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    statusFilter === 'all'
                      ? 'bg-neutral-800 text-white'
                      : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
                  }`}
                >
                  Todos ({sales.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('checked_in')}
                  className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    statusFilter === 'checked_in'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
                  }`}
                >
                  Credenciados ({checkedInCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('pending_checkin')}
                  className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    statusFilter === 'pending_checkin'
                      ? 'bg-[#E50914] text-white'
                      : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
                  }`}
                >
                  Fila ({pendingCheckInCount})
                </button>
              </div>
            </div>

            {/* Attendees Table */}
            <div className="overflow-x-auto rounded-2xl border border-neutral-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-950 border-b border-neutral-800 font-mono uppercase text-[10px] text-neutral-400">
                  <tr>
                    <th className="py-3 px-4">Participante (Crachá)</th>
                    <th className="py-3 px-4">CPF / Contato</th>
                    <th className="py-3 px-4">Cargo / Credencial</th>
                    <th className="py-3 px-4">Código Voucher</th>
                    <th className="py-3 px-4">Status Portaria</th>
                    <th className="py-3 px-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/80">
                  {filteredList.map((sale) => (
                    <tr
                      key={sale.id}
                      className={`hover:bg-neutral-900/60 transition ${
                        sale.checkedIn ? 'bg-emerald-950/10' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <span className="font-bold text-white uppercase block">
                          {sale.customerName}
                        </span>
                        <span className="text-[10px] text-neutral-500 font-mono">
                          {sale.ticketType}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-neutral-300">
                        <div>{sale.cpf || '—'}</div>
                        <div className="text-[10px] text-neutral-500">{sale.phone}</div>
                      </td>

                      <td className="py-3 px-4 text-neutral-300">
                        {sale.companyRole || 'Participante VIP'}
                      </td>

                      <td className="py-3 px-4 font-mono text-[#E50914] font-bold">
                        {sale.voucherCode || sale.id.slice(0, 8).toUpperCase()}
                      </td>

                      <td className="py-3 px-4">
                        {sale.checkedIn ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold font-mono">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>Entregue às {sale.checkInTime ? sale.checkInTime.split('às')[1] || sale.checkInTime : '14h20'}</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-700 text-neutral-400 text-[10px] font-mono">
                            <Clock className="w-3 h-3 text-[#E50914]" />
                            <span>Aguardando Retirada</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleToggleCheckinManual(sale)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                            sale.checkedIn
                              ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
                          }`}
                        >
                          {sale.checkedIn ? 'Desfazer' : 'Confirmar Check-in'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredList.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-neutral-500">
                        Nenhum participante encontrado com os filtros aplicados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
