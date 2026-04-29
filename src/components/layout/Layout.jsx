import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import NewsletterPopup from '@/components/common/NewsletterPopup';
import CookieBanner from '@/components/common/CookieBanner';
import MobileBottomNav from './MobileBottomNav';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pb-16 lg:pb-0">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <NewsletterPopup />
      <CookieBanner />
      <MobileBottomNav />
    </div>
  );
}