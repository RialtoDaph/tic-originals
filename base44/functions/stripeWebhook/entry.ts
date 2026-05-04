import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    // Security: ALWAYS verify signature. No fallback.
    if (!webhookSecret || !signature) {
      console.error('Missing webhook secret or signature header');
      return Response.json({ error: 'Webhook signature verification failed' }, { status: 400 });
    }

    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
      console.error('Signature verification failed:', err.message);
      return Response.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log(`Stripe event received: ${event.type}`);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const orderNumber = session.metadata?.order_number;
      if (!orderNumber) return Response.json({ received: true, skipped: 'no order_number' });

      const orders = await base44.asServiceRole.entities.Order.filter({ order_number: orderNumber });
      if (orders.length === 0) return Response.json({ received: true, skipped: 'order not found' });
      const order = orders[0];

      // Idempotency: if already processed, skip
      if (order.payment_status === 'paid' && order.stock_decremented) {
        console.log(`Order ${orderNumber} already processed`);
        return Response.json({ received: true, already_processed: true });
      }

      // 1. Mark order as paid
      await base44.asServiceRole.entities.Order.update(order.id, {
        payment_status: 'paid',
        status: 'confirmed',
        stripe_session_id: session.id,
        stripe_payment_intent: session.payment_intent,
      });
      console.log(`Order ${orderNumber} marked as paid`);

      // 2. Decrement stock (idempotent via stock_decremented flag)
      if (!order.stock_decremented) {
        await decrementStock(base44, order);
        await base44.asServiceRole.entities.Order.update(order.id, { stock_decremented: true });
        console.log(`Stock decremented for order ${orderNumber}`);
      }

      // 3. Increment discount code usage if applicable
      if (order.applied_discount_code) {
        const codes = await base44.asServiceRole.entities.DiscountCode.filter({ code: order.applied_discount_code });
        if (codes.length > 0) {
          await base44.asServiceRole.entities.DiscountCode.update(codes[0].id, {
            used_count: (codes[0].used_count || 0) + 1,
          });
          console.log(`Discount code ${order.applied_discount_code} usage incremented`);
        }
      }
    }

    if (event.type === 'checkout.session.expired') {
      const session = event.data.object;
      const orderNumber = session.metadata?.order_number;
      if (orderNumber) {
        const orders = await base44.asServiceRole.entities.Order.filter({ order_number: orderNumber });
        if (orders.length > 0) {
          await base44.asServiceRole.entities.Order.update(orders[0].id, {
            payment_status: 'failed',
            status: 'cancelled',
          });
          console.log(`Order ${orderNumber} marked as failed/cancelled`);
        }
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error.message);
    return Response.json({ error: error.message }, { status: 400 });
  }
});

async function decrementStock(base44, order) {
  // Group order items by product_id
  const byProduct = {};
  for (const item of (order.items || [])) {
    if (!item.product_id) continue;
    if (!byProduct[item.product_id]) byProduct[item.product_id] = [];
    byProduct[item.product_id].push(item);
  }

  for (const [productId, items] of Object.entries(byProduct)) {
    try {
      const product = await base44.asServiceRole.entities.Product.get(productId);
      if (!product) continue;
      const newStock = (product.stock || []).map(s => {
        const matching = items.find(i => i.color === s.color && i.size === s.size);
        if (matching) {
          return { ...s, quantity: Math.max(0, (s.quantity || 0) - matching.quantity) };
        }
        return s;
      });
      await base44.asServiceRole.entities.Product.update(productId, { stock: newStock });
    } catch (err) {
      console.error(`Failed to decrement stock for product ${productId}:`, err.message);
    }
  }
}