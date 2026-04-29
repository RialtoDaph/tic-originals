import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';

const STORAGE_KEY = 'tic_recently_viewed';
const MAX = 4;

export function trackProductView(product) {
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  const filtered = stored.filter(p => p.id !== product.id);
  const updated = [{ id: product.id, name: product.name, price: product.price, image: product.images?.[0] }, ...filtered].slice(0, MAX + 1);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export default function RecentlyViewed({ currentProductId }) {
  const { lang } = useLanguage();
  const [items, setItems] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    setItems(stored.filter(p => p.id !== currentProductId).slice(0, MAX));
  }, [currentProductId]);

  if (items.length === 0) return null;

  return (
    <section className="mt-16 pt-12 border-t">
      <p className="text-xs tracking-[0.3em] uppercase text-gray-text mb-2">
        {lang === 'de' ? 'Zuletzt angesehen' : 'Recently Viewed'}
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
        {items.map(item => (
          <Link key={item.id} to={`/products/${item.id}`} className="group">
            <div className="aspect-square bg-muted overflow-hidden mb-3">
              {item.image ? (
                <img src={item.image} alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-dark to-dark-deep">
                  <span className="font-heading text-2xl text-cyan/20">TIC</span>
                </div>
              )}
            </div>
            <h4 className="font-heading text-sm tracking-wider uppercase">{item.name}</h4>
            <p className="text-sm text-gray-text mt-0.5">€{item.price?.toFixed(2)}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}