/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import GalleryView from './components/GalleryView';
import UploadView from './components/UploadView';
import { SalesDashboard } from './components/SalesDashboard/SalesDashboard';
import { PaymentReturnView } from './components/PaymentReturnView';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { SpeakersSection } from './components/SpeakersSection';
import { LogisticsSection } from './components/LogisticsSection';
import { TicketsSection } from './components/TicketsSection';
import { Footer } from './components/Footer';
import { GallerySection } from './components/GallerySection';
import { CheckoutModal, VoucherData } from './components/CheckoutModal';
import { VoucherModal } from './components/VoucherModal';

const OFFICIAL_BANNER_URL = 'https://i.postimg.cc/LsN91H0k/BANNER-SITE-WOHRSHOP-DRAGON.png';

function detectCurrentMode(): string | null {
  if (typeof window === 'undefined') return null;

  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  const params = new URLSearchParams(window.location.search);

  // Return mode from Mercado Pago (path, hash, query, or MP callback params)
  if (
    path.includes('/retorno') ||
    path.includes('/sucesso') ||
    path.includes('/obrigado') ||
    path.includes('/confirmacao') ||
    hash.includes('retorno') ||
    hash.includes('sucesso') ||
    params.get('mode') === 'retorno-pagamento' ||
    params.get('mode') === 'retorno' ||
    params.get('mode') === 'sucesso' ||
    params.has('payment_id') ||
    params.has('collection_id') ||
    params.has('preference_id') ||
    (params.has('status') && (params.get('status') === 'approved' || params.get('status') === 'pending'))
  ) {
    return 'retorno-pagamento';
  }

  // Sales Dashboard
  if (
    path.includes('/dashboard') ||
    path.includes('/painel') ||
    hash.includes('dashboard') ||
    hash.includes('painel') ||
    params.get('mode') === 'dashboard'
  ) {
    return 'dashboard';
  }

  // Upload photo
  if (
    path.includes('/upload') ||
    hash.includes('upload') ||
    params.get('mode') === 'upload'
  ) {
    return 'upload';
  }

  // Gallery Mural
  if (
    path.includes('/mural') ||
    path.includes('/galeria') ||
    hash.includes('mural') ||
    hash.includes('galeria') ||
    params.get('mode') === 'mural'
  ) {
    return 'mural';
  }

  return params.get('mode');
}

export default function App() {
  const [mode, setMode] = useState<string | null>(detectCurrentMode);

  // Keep state in sync with URL navigation & hash changes
  useEffect(() => {
    const syncMode = () => {
      setMode(detectCurrentMode());
    };
    window.addEventListener('popstate', syncMode);
    window.addEventListener('hashchange', syncMode);
    return () => {
      window.removeEventListener('popstate', syncMode);
      window.removeEventListener('hashchange', syncMode);
    };
  }, []);

  const navigateTo = (newMode: string | null) => {
    setMode(newMode);
    const url = new URL(window.location.href);
    if (newMode) {
      url.searchParams.set('mode', newMode);
      url.pathname = '/';
      url.hash = '';
    } else {
      url.searchParams.delete('mode');
      url.pathname = '/';
      url.hash = '';
    }
    window.history.pushState({}, '', url.toString());
  };

  const isUploadMode = mode === 'upload';
  const isMuralMode = mode === 'mural';
  const isDashboardMode = mode === 'dashboard';
  const isReturnMode = mode === 'retorno-pagamento';

  // Landing page state
  const [currentBanner] = useState<string>(OFFICIAL_BANNER_URL);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isVoucherOpen, setIsVoucherOpen] = useState(false);
  const [currentVoucher, setCurrentVoucher] = useState<VoucherData | null>(null);

  const handlePaymentSuccess = (voucher: VoucherData) => {
    setCurrentVoucher(voucher);
    setIsCheckoutOpen(false);
    setIsVoucherOpen(true);
  };

  // If in Mercado Pago return page mode
  if (isReturnMode) {
    return <PaymentReturnView onBackToSite={() => navigateTo(null)} />;
  }

  // If in sales dashboard mode
  if (isDashboardMode) {
    return <SalesDashboard onBackToSite={() => navigateTo(null)} />;
  }

  // If in upload mode (guest scanned QR code on mobile)
  if (isUploadMode) {
    return <UploadView onBackToMural={() => navigateTo(null)} />;
  }

  // If in mural mode
  if (isMuralMode) {
    return <GalleryView onGoToSite={() => navigateTo(null)} />;
  }

  // Default: Event Landing Page with integrated Gallery
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-neutral-100 selection:bg-[#E50914] selection:text-white flex flex-col font-sans overflow-x-hidden w-full max-w-[100vw]">
      {/* Top Header with live Gallery button and Dashboard button */}
      <Header
        onOpenCheckout={() => setIsCheckoutOpen(true)}
        onOpenDashboard={() => navigateTo('dashboard')}
      />

      <main className="flex-1">
        <Hero
          bannerUrl={currentBanner}
          onOpenCheckout={() => setIsCheckoutOpen(true)}
        />
        <SpeakersSection onOpenCheckout={() => setIsCheckoutOpen(true)} />
        <LogisticsSection />
        <TicketsSection onOpenCheckout={() => setIsCheckoutOpen(true)} />
        <GallerySection onOpenUpload={() => navigateTo('upload')} />
      </main>

      <Footer onOpenDashboard={() => navigateTo('dashboard')} />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        activeBannerUrl={currentBanner}
        onClose={() => setIsCheckoutOpen(false)}
        onSuccess={handlePaymentSuccess}
      />

      {currentVoucher && (
        <VoucherModal
          isOpen={isVoucherOpen}
          onClose={() => setIsVoucherOpen(false)}
          voucher={currentVoucher}
        />
      )}
    </div>
  );
}
