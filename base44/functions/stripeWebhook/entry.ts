import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    let event;
    if (webhookSecret && signature) {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } else {
      event = JSON.parse(body);
      console.warn('No webhook secret configured — skipping signature verification');
    }

    console.log(`Stripe event received: ${event.type}`);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const orderNumber = session.metadata?.order_number;

      if (orderNumber) {
        const orders = await base44.asServiceRole.entities.Order.filter({ order_number: orderNumber });
        if (orders.length > 0) {
          await base44.asServiceRole.entities.Order.update(orders[0].id, {
            payment_status: 'paid',
            status: 'confirmed',
          });
          console.log(`Order ${orderNumber} marked as paid`);
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