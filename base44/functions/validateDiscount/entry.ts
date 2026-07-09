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

    // Scope: if applicable_product_ids is set, the code only discounts those
    // products. Compute the applicable subtotal from the cart items provided.
    const scoped = Array.isArray(record.applicable_product_ids) && record.applicable_product_ids.length > 0;
    let applicableSubtotal = subtotal;
    if (scoped) {
      if (!Array.isArray(items) || items.length === 0) {
        return Response.json({
          valid: false,
          error: 'Code applies to specific products only / Code gilt nur für bestimmte Produkte',
        });
      }
      applicableSubtotal = items
        .filter((i: any) => record.applicable_product_ids.includes(i.productId))
        .reduce((sum: number, i: any) => sum + (i.price || 0) * (i.quantity || 0), 0);
      if (applicableSubtotal <= 0) {
        return Response.json({
          valid: false,
          error: 'No eligible products in cart / Keine passenden Produkte im Warenkorb',
        });
      }
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

    let discountAmount = 0;
    if (record.discount_type === 'percentage') {
      discountAmount = (applicableSubtotal * record.discount_value) / 100;
      if (record.maximum_discount_amount) discountAmount = Math.min(discountAmount, record.maximum_discount_amount);
    } else {
      discountAmount = Math.min(record.discount_value, applicableSubtotal);
    }

    return Response.json({
      valid: true,
      discount_amount: Math.round(discountAmount * 100) / 100,
      code: record.code,
      scoped,
    });
  } catch (error) {
    console.error('validateDiscount error:', error.message);
    return Response.json({ valid: false, error: error.message }, { status: 500 });
  }
});