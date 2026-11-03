/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import GalleryView from './components/GalleryView';
import UploadView from './components/UploadView';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { SpeakersSection } from './components/SpeakersSection';
import { LogisticsSection } from './components/LogisticsSection';
import { TicketsSection } from './components/TicketsSection';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { GallerySection } from './components/GallerySection';
import { CheckoutModal, VoucherData } from './components/CheckoutModal';
import { VoucherModal } from './components/VoucherModal';

const OFFICIAL_BANNER_URL = 'https://i.postimg.cc/nzjjTH3B/BANNER-SITE-WOHRSHOP-DRAGON.png';

export default function App() {
  const [mode, setMode] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('mode');
    }
    return null;
  });

  // Keep state in sync with URL navigation
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setMode(params.get('mode'));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (newMode: string | null) => {
    setMode(newMode);
    const url = new URL(window.location.href);
    if (newMode) {
      url.searchParams.set('mode', newMode);
    } else {
      url.searchParams.delete('mode');
    }
    window.history.pushState({}, '', url.toString());
  };

  const isUploadMode = mode === 'upload';
  const isMuralMode = mode === 'mural';

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
      {/* Top Header with live Gallery button */}
      <Header
        onOpenCheckout={() => setIsCheckoutOpen(true)}
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
        <FaqSection />
      </main>

      <Footer />

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
