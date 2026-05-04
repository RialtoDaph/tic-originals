// Public function: looks up an order by order number for the tracking page.
// Returns ONLY safe-to-display fields (no email, no full address).
// This is needed because Order RLS restricts reads to admin or owner only.

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { order_number } = await req.json();

    if (!order_number || typeof order_number !== 'string') {
      return Response.json({ error: 'order_number required' }, { status: 400 });
    }

    const orders = await base44.asServiceRole.entities.Order.filter({
      order_number: order_number.trim(),
    });

    if (orders.length === 0) {
      return Response.json({ found: false });
    }

    const o = orders[0];
    // Return only public-safe fields
    return Response.json({
      found: true,
      order: {
        order_number: o.order_number,
        status: o.status,
        payment_status: o.payment_status,
        shipping_carrier: o.shipping_carrier,
        tracking_number: o.tracking_number,
        items: (o.items || []).map(i => ({
          product_name: i.product_name,
          color: i.color,
          size: i.size,
          quantity: i.quantity,
          unit_price: i.unit_price,
        })),
        total: o.total,
        created_date: o.created_date,
      },
    });
  } catch (error) {
    console.error('getOrderByNumber error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});