import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { code, subtotal, customer_email, items } = await req.json();

    if (!code || typeof subtotal !== 'number') {
      return Response.json({ valid: false, error: 'Missing parameters' }, { status: 400 });
    }

    const allCodes = await base44.asServiceRole.entities.DiscountCode.filter({
      code: code.toUpperCase().trim(),
    });
    const record = allCodes[0];

    if (!record) return Response.json({ valid: false, error: 'Code not found / Code nicht gefunden' });
    if (!record.is_active) return Response.json({ valid: false, error: 'Code is not active / Code ist nicht aktiv' });

    const today = new Date().toISOString().split('T')[0];
    if (record.valid_from && today < record.valid_from) {
      return Response.json({ valid: false, error: 'Code not valid yet / Code ist noch nicht gültig' });
    }
    if (record.valid_until && today > record.valid_until) {
      return Response.json({ valid: false, error: 'Code has expired / Code ist abgelaufen' });
    }
    if (record.usage_limit != null && (record.used_count || 0) >= record.usage_limit) {
      return Response.json({ valid: false, error: 'Code usage limit reached / Code wurde zu oft verwendet' });
    }

    // Discount codes apply only to full-price, non-bundle items: bundles and
    // flash-sale items are already discounted, so we don't stack on top.
    const scoped = Array.isArray(record.applicable_product_ids) && record.applicable_product_ids.length > 0;
    if (!Array.isArray(items) || items.length === 0) {
      // No cart context — fall back to whole subtotal (edge case).
      const applicableSubtotal = subtotal;
      const amount = computeDiscount(record, applicableSubtotal);
      return finalize(record, amount, scoped);
    }

    // Fetch active flash sales so we can flag on-sale items on the server.
    const today2 = new Date().toISOString().split('T')[0];
    const activeCodes = await base44.asServiceRole.entities.DiscountCode.filter(
      { is_active: true }, '-created_date', 100
    );
    const flashSales = activeCodes
      .filter((c: any) => Array.isArray(c.applicable_product_ids) && c.applicable_product_ids.length > 0)
      .filter((c: any) => !c.valid_from || c.valid_from <= today2)
      .filter((c: any) => !c.valid_until || c.valid_until >= today2);
    const isOnSale = (productId: string) =>
      flashSales.some((fs: any) => fs.applicable_product_ids.includes(productId));

    const applicableSubtotal = items
      .filter((i: any) => !i.bundleId && !isOnSale(i.productId))
      .filter((i: any) => !scoped || record.applicable_product_ids.includes(i.productId))
      .reduce((sum: number, i: any) => sum + (i.price || 0) * (i.quantity || 0), 0);

    if (applicableSubtotal <= 0) {
      return Response.json({
        valid: false,
        error: scoped
          ? 'No eligible products in cart / Keine passenden Produkte im Warenkorb'
          : 'Code cannot combine with items on sale / Code kann nicht mit Sale-Artikeln kombiniert werden',
      });
    }

    if (record.minimum_order_amount > 0 && subtotal < record.minimum_order_amount) {
      return Response.json({
        valid: false,
        error: `Min. order €${record.minimum_order_amount} not met / Mindestbestellwert €${record.minimum_order_amount} nicht erreicht`,
      });
    }
    if (record.is_first_order_only && customer_email) {
      // Count both paid AND pending orders (pending = checkout in progress)
      // This prevents using a first-order code twice via concurrent checkouts
      const allOrders = await base44.asServiceRole.entities.Order.filter({
        customer_email,
      });
      const blockingOrders = allOrders.filter(
        o => o.payment_status === 'paid' || o.payment_status === 'pending'
      );
      if (blockingOrders.length > 0) {
        return Response.json({ valid: false, error: 'First order only / Code nur für Erstbestellungen' });
      }
    }

    // Block re-use of any code that's already pending checkout for this customer
    if (customer_email) {
      const pendingWithCode = await base44.asServiceRole.entities.Order.filter({
        customer_email,
        applied_discount_code: record.code,
        payment_status: 'pending',
      });
      if (pendingWithCode.length > 0) {
        return Response.json({
          valid: false,
          error: 'Code already in use in another checkout / Code wird bereits in einer anderen Bestellung verwendet',
        });
      }
    }

    const discountAmount = computeDiscount(record, applicableSubtotal);
    return finalize(record, discountAmount, scoped);
  } catch (error) {
    console.error('validateDiscount error:', error.message);
    return Response.json({ valid: false, error: error.message }, { status: 500 });
  }
});

function computeDiscount(record: any, applicableSubtotal: number) {
  let amount = 0;
  if (record.discount_type === 'percentage') {
    amount = (applicableSubtotal * record.discount_value) / 100;
    if (record.maximum_discount_amount) amount = Math.min(amount, record.maximum_discount_amount);
  } else {
    amount = Math.min(record.discount_value, applicableSubtotal);
  }
  return amount;
}

function finalize(record: any, discountAmount: number, scoped: boolean) {
  return Response.json({
    valid: true,
    discount_amount: Math.round(discountAmount * 100) / 100,
    code: record.code,
    scoped,
  });
}