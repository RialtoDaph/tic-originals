import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { items, shipping_cost, discount_amount, customer_email, customer_name, order_number, success_url, cancel_url } = await req.json();

    if (!items || !items.length) {
      return Response.json({ error: 'No items provided' }, { status: 400 });
    }

    const lineItems = items.map(item => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: `${item.productName} (${item.color} / ${item.size})`,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    // Add shipping as a line item if > 0
    if (shipping_cost > 0) {
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: { name: 'Versandkosten / Shipping' },
          unit_amount: Math.round(shipping_cost * 100),
        },
        quantity: 1,
      });
    }

    // Add discount as a negative line item if applicable
    if (discount_amount > 0) {
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: { name: 'Rabattcode / Discount Code' },
          unit_amount: -Math.round(discount_amount * 100),
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      // Let Stripe auto-enable card, PayPal, Klarna, etc. based on Dashboard config
      line_items: lineItems,
      mode: 'payment',
      customer_email: customer_email,
      success_url: `${success_url}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancel_url,
      client_reference_id: order_number,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        order_number: order_number,
        customer_name: customer_name,
      },
    });

    console.log(`Checkout session created: ${session.id} for order ${order_number}`);
    return Response.json({ url: session.url, session_id: session.id });

  } catch (error) {
    console.error('Error creating checkout session:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});