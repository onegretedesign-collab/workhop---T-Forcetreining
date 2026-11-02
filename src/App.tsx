/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { SpeakersSection } from './components/SpeakersSection';
import { LogisticsSection } from './components/LogisticsSection';
import { TicketsSection } from './components/TicketsSection';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { BannerCustomizerModal } from './components/BannerCustomizerModal';
import { CheckoutModal, VoucherData } from './components/CheckoutModal';
import { VoucherModal } from './components/VoucherModal';
import { BANNER_PRESETS } from './data/summitData';

const OFFICIAL_BANNER_URL = 'https://i.postimg.cc/nzjjTH3B/BANNER-SITE-WOHRSHOP-DRAGON.png';

export default function App() {
  const [currentBanner, setCurrentBanner] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('kairos_active_banner');
      // If user had an older preset or no banner, default to the official dragon banner
      if (!saved || saved.startsWith('preset://')) {
        return OFFICIAL_BANNER_URL;
      }
      return saved;
    } catch {
      return OFFICIAL_BANNER_URL;
    }
  });

  const [isBannerCustomizerOpen, setIsBannerCustomizerOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isVoucherOpen, setIsVoucherOpen] = useState(false);
  const [currentVoucher, setCurrentVoucher] = useState<VoucherData | null>(null);

  const handleApplyBanner = (newBannerUrl: string) => {
    setCurrentBanner(newBannerUrl);
    try {
      localStorage.setItem('kairos_active_banner', newBannerUrl);
    } catch {
      // Ignore localStorage issues in sandboxes
    }
  };

  const handlePaymentSuccess = (voucher: VoucherData) => {
    setCurrentVoucher(voucher);
    setIsCheckoutOpen(false);
    setIsVoucherOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-neutral-100 selection:bg-[#E50914] selection:text-white flex flex-col font-sans overflow-x-hidden w-full max-w-[100vw]">
      {/* Top Header */}
      <Header
        onOpenCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* Hero Section */}
        <Hero
          bannerUrl={currentBanner}
          onOpenCheckout={() => setIsCheckoutOpen(true)}
        />

        {/* 6 Speakers Section styled as requested in video */}
        <SpeakersSection onOpenCheckout={() => setIsCheckoutOpen(true)} />

        {/* Accreditation Logistics & Badge Delivery Section */}
        <LogisticsSection />

        {/* Tickets Section with single price & nominal badge emphasis */}
        <TicketsSection onOpenCheckout={() => setIsCheckoutOpen(true)} />

        {/* FAQ Section */}
        <FaqSection />
      </main>

      {/* Footer */}
      <Footer />

      {/* Banner Customizer Modal (File upload or direct URL or presets) */}
      <BannerCustomizerModal
        isOpen={isBannerCustomizerOpen}
        onClose={() => setIsBannerCustomizerOpen(false)}
        currentBanner={currentBanner}
        onApplyBanner={handleApplyBanner}
      />

      {/* Mercado Pago Simulated Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        activeBannerUrl={currentBanner}
        onSuccess={handlePaymentSuccess}
      />

      {/* Official Digital Voucher Modal with Top Banner and Print feature */}
      <VoucherModal
        voucher={currentVoucher}
        isOpen={isVoucherOpen}
        onClose={() => setIsVoucherOpen(false)}
      />
    </div>
  );
}
