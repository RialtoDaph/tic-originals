// Helpers for computing flash sale prices on the client.
// A "flash sale" is a DiscountCode that is is_active, within valid_from/valid_until,
// and has a non-empty applicable_product_ids — meaning we automatically show a
// strikethrough price on those product cards / detail pages.

/**
 * For a given product id and array of flash sale entries (see getActiveFlashSales),
 * return the best (largest) applicable discount, or null if none applies.
 * Returns { originalPrice, salePrice, code, discount_type, discount_value, valid_until }.
 */
export function getFlashSaleForProduct(product, flashSales = []) {
  if (!product || !flashSales.length) return null;
  const matches = flashSales.filter((fs) =>
    Array.isArray(fs.applicable_product_ids) && fs.applicable_product_ids.includes(product.id)
  );
  if (!matches.length) return null;

  // Pick the flash sale that yields the lowest final price.
  let best = null;
  for (const fs of matches) {
    const salePrice = computeSalePrice(product.price, fs);
    if (salePrice != null && (best === null || salePrice < best.salePrice)) {
      best = {
        originalPrice: product.price,
        salePrice,
        code: fs.code,
        discount_type: fs.discount_type,
        discount_value: fs.discount_value,
        valid_until: fs.valid_until,
      };
    }
  }
  return best;
}

export function computeSalePrice(price, fs) {
  if (!price || !fs) return null;
  if (fs.discount_type === 'percentage') {
    return Math.max(0, +(price * (1 - fs.discount_value / 100)).toFixed(2));
  }
  if (fs.discount_type === 'fixed') {
    return Math.max(0, +(price - fs.discount_value).toFixed(2));
  }
  return null;
}

/**
 * Returns the flash sale whose valid_until is the earliest in the future — the
 * one that should drive the homepage countdown. null if none is active.
 */
export function getNearestExpiringFlashSale(flashSales = []) {
  const now = Date.now();
  const withExpiry = flashSales
    .filter((fs) => fs.valid_until)
    .map((fs) => ({ ...fs, expiryMs: endOfDayMs(fs.valid_until) }))
    .filter((fs) => fs.expiryMs > now)
    .sort((a, b) => a.expiryMs - b.expiryMs);
  return withExpiry[0] || null;
}

// Interpret a YYYY-MM-DD valid_until as end-of-day so a same-day sale stays
// active for the full day.
export function endOfDayMs(dateStr) {
  const d = new Date(dateStr + 'T23:59:59');
  return d.getTime();
}

/**
 * Bundle helpers. Returns { activePrice, isOnSale, salePrice, normalBundle } — the
 * effective price to display today.
 */
export function getBundleActivePrice(bundle) {
  if (!bundle) return null;
  const now = Date.now();
  const hasSale = bundle.bundle_sale_price != null
    && bundle.sale_valid_until
    && endOfDayMs(bundle.sale_valid_until) > now;
  return {
    activePrice: hasSale ? bundle.bundle_sale_price : bundle.bundle_price,
    isOnSale: hasSale,
    salePrice: bundle.bundle_sale_price,
    normalBundle: bundle.bundle_price,
  };
}