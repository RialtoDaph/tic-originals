import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import NewsletterPopup from '@/components/common/NewsletterPopup';
import CookieBanner from '@/components/common/CookieBanner';
import MobileBottomNav from './MobileBottomNav';
import ScrollToTop from './ScrollToTop';
import PageTransition from './PageTransition';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <Footer />
      <CartDrawer />
      <NewsletterPopup />
      <CookieBanner />
      <MobileBottomNav />
    </div>
  );
}