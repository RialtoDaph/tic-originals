import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { code, subtotal, customer_email } = await req.json();

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
    if (record.minimum_order_amount > 0 && subtotal < record.minimum_order_amount) {
      return Response.json({
        valid: false,
        error: `Min. order €${record.minimum_order_amount} not met / Mindestbestellwert €${record.minimum_order_amount} nicht erreicht`,
      });
    }
    if (record.is_first_order_only && customer_email) {
      const prevOrders = await base44.asServiceRole.entities.Order.filter({
        customer_email,
        payment_status: 'paid',
      });
      if (prevOrders.length > 0) {
        return Response.json({ valid: false, error: 'First order only / Code nur für Erstbestellungen' });
      }
    }

    let discountAmount = 0;
    if (record.discount_type === 'percentage') {
      discountAmount = (subtotal * record.discount_value) / 100;
      if (record.maximum_discount_amount) discountAmount = Math.min(discountAmount, record.maximum_discount_amount);
    } else {
      discountAmount = Math.min(record.discount_value, subtotal);
    }

    return Response.json({
      valid: true,
      discount_amount: Math.round(discountAmount * 100) / 100,
      code: record.code,
    });
  } catch (error) {
    console.error('validateDiscount error:', error.message);
    return Response.json({ valid: false, error: error.message }, { status: 500 });
  }
});