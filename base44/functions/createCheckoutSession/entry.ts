import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

function generateOrderNumber() {
  const year = new Date().getFullYear();
  const ts = Date.now().toString().slice(-6);
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `TIC-${year}-${ts}${rand}`;
}

// Server-side flash sale price computation — mirrors src/lib/flashSale.js
function endOfDayMs(dateStr: string) {
  return new Date(dateStr + 'T23:59:59').getTime();
}
function computeSalePrice(price: number, fs: any) {
  if (!price || !fs) return null;
  if (fs.discount_type === 'percentage') {
    return Math.max(0, +(price * (1 - fs.discount_value / 100)).toFixed(2));
  }
  if (fs.discount_type === 'fixed') {
    return Math.max(0, +(price - fs.discount_value).toFixed(2));
  }
  return null;
}
function bestFlashSalePrice(productId: number | string, productPrice: number, flashSales: any[]) {
  let best: number | null = null;
  for (const fs of flashSales) {
    if (!Array.isArray(fs.applicable_product_ids) || !fs.applicable_product_ids.includes(productId)) continue;
    const p = computeSalePrice(productPrice, fs);
    if (p != null && (best === null || p < best)) best = p;
  }
  return best;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const {
      items, // [{ productId, color, size, quantity, bundleId? }]
      discount_amount,
      applied_discount_code,
      customer_email,
      customer_name,
      customer_phone,
      language,
      shipping_address,
      shipping_method,
      payment_method,
      success_url,
      cancel_url,
    } = await req.json();

    if (!items || !items.length) {
      return Response.json({ error: 'No items provided' }, { status: 400 });
    }
    if (!customer_email) {
      return Response.json({ error: 'Customer email required' }, { status: 400 });
    }

    // ---- Fetch products, active flash sales, referenced bundles, and pending reservations ----
    const productIds = [...new Set(items.map((i: any) => i.productId).filter(Boolean))];
    const bundleIds = [...new Set(items.map((i: any) => i.bundleId).filter(Boolean))];

    const [products, activeCodes, bundlesRaw, pendingOrders] = await Promise.all([
      Promise.all(productIds.map((id) => base44.asServiceRole.entities.Product.get(id).catch(() => null))),
      base44.asServiceRole.entities.DiscountCode.filter({ is_active: true }, '-created_date', 100),
      bundleIds.length
        ? Promise.all(bundleIds.map((id) => base44.asServiceRole.entities.Bundle.get(id).catch(() => null)))
        : Promise.resolve([]),
      // Soft stock reservation: any pending order still holds its items until
      // Stripe pays (webhook decrements real stock) or expires (webhook cancels).
      base44.asServiceRole.entities.Order.filter({ payment_status: 'pending' }, '-created_date', 500),
    ]);

    // Reserved quantities per product|color|size across all pending orders.
    const reservedMap: Record<string, number> = {};
    for (const o of (pendingOrders as any[])) {
      for (const it of (o.items || [])) {
        if (!it.product_id) continue;
        const key = `${it.product_id}|${it.color}|${it.size}`;
        reservedMap[key] = (reservedMap[key] || 0) + (it.quantity || 0);
      }
    }

    const productMap: Record<string, any> = Object.fromEntries(
      products.filter(Boolean).map((p: any) => [p.id, p])
    );

    const today = new Date().toISOString().split('T')[0];
    const flashSales = (activeCodes as any[])
      .filter((c) => Array.isArray(c.applicable_product_ids) && c.applicable_product_ids.length > 0)
      .filter((c) => !c.valid_from || c.valid_from <= today)
      .filter((c) => !c.valid_until || c.valid_until >= today);

    // Compute the authoritative price for each bundle server-side (using
    // bundle_sale_price if the sale window is still open).
    const now = Date.now();
    const bundleMap: Record<string, any> = {};
    for (const b of bundlesRaw as any[]) {
      if (!b || !b.is_active) continue;
      const hasSale = b.bundle_sale_price != null
        && b.sale_valid_until
        && endOfDayMs(b.sale_valid_until) > now;
      bundleMap[b.id] = {
        ...b,
        effectivePrice: hasSale ? b.bundle_sale_price : b.bundle_price,
      };
    }

    // ---- Validate items and compute per-line authoritative price ----
    // Group bundle items so we can prorate the bundle's effective price across them.
    const bundleGroups: Record<string, any[]> = {};
    const standaloneItems: any[] = [];

    for (const item of items as any[]) {
      const product = productMap[item.productId];
      if (!product || !product.is_active) {
        return Response.json({ error: `Product unavailable: ${item.productId}` }, { status: 400 });
      }
      const stockEntry = (product.stock || []).find(
        (s: any) => s.color === item.color && s.size === item.size
      );
      const onHand = stockEntry?.quantity ?? 0;
      const reserved = reservedMap[`${item.productId}|${item.color}|${item.size}`] || 0;
      const available = Math.max(0, onHand - reserved);
      if (available < item.quantity) {
        return Response.json({
          error: `Not enough stock for ${product.name} (${item.color}/${item.size}). Available: ${available}`,
        }, { status: 400 });
      }
      // Reserve within this request too, so duplicate lines in one cart are
      // accounted for against the same on-hand stock.
      reservedMap[`${item.productId}|${item.color}|${item.size}`] = reserved + item.quantity;

      const enriched = { ...item, product };

      if (item.bundleId && bundleMap[item.bundleId]) {
        if (!bundleGroups[item.bundleId]) bundleGroups[item.bundleId] = [];
        bundleGroups[item.bundleId].push(enriched);
      } else {
        standaloneItems.push(enriched);
      }
    }

    // ---- Verified items with server-computed prices ----
    const verifiedItems: any[] = [];

    // Standalone: use flash sale price if applicable, else product price.
    for (const it of standaloneItems) {
      const flashPrice = bestFlashSalePrice(it.product.id, it.product.price, flashSales);
      const unitPrice = flashPrice != null ? flashPrice : it.product.price;
      verifiedItems.push({
        productId: it.productId,
        productName: it.product.name,
        color: it.color,
        size: it.size,
        quantity: it.quantity,
        price: unitPrice,
        bundleId: undefined,
        bundleName: undefined,
      });
    }

    // Bundles: prorate effectivePrice across items by their share of the
    // normal-price total (same algorithm as CartContext.addBundle).
    for (const [bundleId, group] of Object.entries(bundleGroups)) {
      const bundle = bundleMap[bundleId];
      // Validate that the exact set of products in the cart matches the bundle definition.
      const expected = [...(bundle.product_ids || [])].sort();
      const actual = group.flatMap((g) => Array(g.quantity).fill(g.productId)).sort();
      if (expected.length !== actual.length || expected.some((v, i) => v !== actual[i])) {
        return Response.json({
          error: `Bundle contents mismatch for ${bundle.name}`,
        }, { status: 400 });
      }

      const normalTotal = group.reduce(
        (sum, g) => sum + (g.product.price || 0) * g.quantity,
        0
      );
      if (!normalTotal) {
        return Response.json({ error: `Bundle price calc failed for ${bundle.name}` }, { status: 400 });
      }

      // Expand each grouped line into `quantity` individual verified items so
      // prorated pricing works line-by-line (and matches the cart display).
      for (const g of group) {
        for (let i = 0; i < g.quantity; i++) {
          const share = (g.product.price / normalTotal) * bundle.effectivePrice;
          verifiedItems.push({
            productId: g.productId,
            productName: g.product.name,
            color: g.color,
            size: g.size,
            quantity: 1,
            price: +share.toFixed(2),
            bundleId: bundle.id,
            bundleName: bundle.name,
          });
        }
      }
    }

    // ---- Shipping, discount, totals ----
    const SHIPPING_COST = 4.95;
    const FREE_SHIPPING_THRESHOLD = 80;
    const verifiedSubtotal = verifiedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const verifiedShippingCost = verifiedSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;

    // Re-validate discount server-side against the verified cart. Never trust
    // the discount_amount the client sends — recompute it from the code.
    let safeDiscount = 0;
    let verifiedCode: string | undefined = undefined;
    if (applied_discount_code) {
      const codes = await base44.asServiceRole.entities.DiscountCode.filter({
        code: applied_discount_code.toUpperCase().trim(),
      });
      const dc = codes[0];
      const validCode = dc && dc.is_active
        && (!dc.valid_from || dc.valid_from <= today)
        && (!dc.valid_until || dc.valid_until >= today)
        && (dc.usage_limit == null || (dc.used_count || 0) < dc.usage_limit)
        && (!(dc.minimum_order_amount > 0) || verifiedSubtotal >= dc.minimum_order_amount);

      if (!validCode) {
        return Response.json({ error: 'Discount code is no longer valid' }, { status: 400 });
      }

      const scoped = Array.isArray(dc.applicable_product_ids) && dc.applicable_product_ids.length > 0;
      const applicableSubtotal = scoped
        ? verifiedItems
            .filter((i) => dc.applicable_product_ids.includes(i.productId))
            .reduce((sum, i) => sum + i.price * i.quantity, 0)
        : verifiedSubtotal;

      if (scoped && applicableSubtotal <= 0) {
        return Response.json({ error: 'Discount code does not apply to any item in cart' }, { status: 400 });
      }

      let amount = 0;
      if (dc.discount_type === 'percentage') {
        amount = (applicableSubtotal * dc.discount_value) / 100;
        if (dc.maximum_discount_amount) amount = Math.min(amount, dc.maximum_discount_amount);
      } else {
        amount = Math.min(dc.discount_value, applicableSubtotal);
      }
      safeDiscount = Math.round(amount * 100) / 100;
      verifiedCode = dc.code;
    }

    const finalTotal = Math.max(0, verifiedSubtotal + verifiedShippingCost - safeDiscount);

    const orderNumber = generateOrderNumber();

    const createdOrder = await base44.asServiceRole.entities.Order.create({
      order_number: orderNumber,
      status: 'pending',
      items: verifiedItems.map((i) => ({
        product_id: i.productId,
        product_name: i.bundleName ? `${i.productName} (${i.bundleName})` : i.productName,
        color: i.color,
        size: i.size,
        quantity: i.quantity,
        unit_price: i.price,
      })),
      subtotal: verifiedSubtotal,
      shipping_cost: verifiedShippingCost,
      discount_amount: safeDiscount,
      applied_discount_code: verifiedCode,
      total: finalTotal,
      vat_amount: finalTotal - (finalTotal / 1.19),
      customer_email,
      customer_name,
      customer_phone,
      language: language || 'de',
      shipping_address,
      shipping_method: shipping_method || 'standard',
      payment_method: payment_method || 'stripe',
      payment_status: 'pending',
    });

    // Apply discount proportionally across product line items
    const discountFactor = (safeDiscount > 0 && verifiedSubtotal > 0)
      ? Math.max(0, 1 - safeDiscount / verifiedSubtotal)
      : 1;

    const lineItems = verifiedItems.map((item) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.bundleName
            ? `${item.productName} (${item.color} / ${item.size}) — ${item.bundleName}`
            : `${item.productName} (${item.color} / ${item.size})`,
        },
        unit_amount: Math.max(0, Math.round(item.price * discountFactor * 100)),
      },
      quantity: item.quantity,
    }));

    if (verifiedShippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: { name: 'Versandkosten / Shipping' },
          unit_amount: Math.round(verifiedShippingCost * 100),
        },
        quantity: 1,
      });
    }

    let session;
    try {
      session = await stripe.checkout.sessions.create({
        line_items: lineItems,
        mode: 'payment',
        payment_method_types: ['card', 'paypal'],
        customer_email: customer_email,
        success_url: `${success_url}?order=${orderNumber}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancel_url,
        client_reference_id: orderNumber,
        metadata: {
          base44_app_id: Deno.env.get('BASE44_APP_ID'),
          order_number: orderNumber,
          customer_name: customer_name,
          discount_amount: String(safeDiscount),
        },
      });
    } catch (stripeErr) {
      console.error('Stripe session creation failed:', stripeErr.message);
      try { await base44.asServiceRole.entities.Order.delete(createdOrder.id); } catch (_e) {}
      return Response.json({ error: stripeErr.message }, { status: 500 });
    }

    console.log(`Checkout session created: ${session.id} for order ${orderNumber}, total €${finalTotal.toFixed(2)}`);
    return Response.json({ url: session.url, session_id: session.id, order_number: orderNumber });

  } catch (error) {
    console.error('Error creating checkout session:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});