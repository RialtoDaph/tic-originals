import React from 'react';

/**
 * Renders a product price. When a flashSale is passed (from getFlashSaleForProduct)
 * shows the original crossed out and the sale price beside it, plus a small badge.
 * Sizing is controlled via the `size` prop so the same component works on cards
 * ('sm', 'md') and the product detail page ('lg').
 */
export default function PriceDisplay({ price, flashSale, size = 'md', className = '', showBadge = true }) {
  const sizeClasses = {
    sm: { current: 'text-sm', original: 'text-xs' },
    md: { current: 'text-lg font-semibold', original: 'text-sm' },
    lg: { current: 'font-display text-3xl md:text-4xl', original: 'text-base md:text-lg' },
  }[size] || {};

  if (!flashSale) {
    return (
      <span className={`${sizeClasses.current} tabular-nums ${className}`}>€{Number(price).toFixed(2)}</span>
    );
  }

  const badge = flashSale.discount_type === 'percentage'
    ? `-${flashSale.discount_value}%`
    : `-€${flashSale.discount_value}`;

  return (
    <span className={`inline-flex items-baseline gap-2 ${className}`}>
      <span className={`${sizeClasses.current} text-red-600 tabular-nums`}>
        €{Number(flashSale.salePrice).toFixed(2)}
      </span>
      <span className={`${sizeClasses.original} text-gray-text line-through tabular-nums`}>
        €{Number(flashSale.originalPrice).toFixed(2)}
      </span>
      {showBadge && (
        <span className="text-[9px] tracking-[0.15em] uppercase bg-red-600 text-white px-1.5 py-0.5 font-medium">
          {badge}
        </span>
      )}
    </span>
  );
}