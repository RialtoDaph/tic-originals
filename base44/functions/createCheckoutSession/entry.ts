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

    const { items, discount_amount, customer_email, customer_name, order_number, success_url, cancel_url } = await req.json();

    if (!items || !items.length) {
      return Response.json({ error: 'No items provided' }, { status: 400 });
    }

    // SECURITY: Re-fetch product prices from DB — never trust prices sent from frontend
    const productIds = [...new Set(items.map(i => i.productId).filter(Boolean))];
    const products = await Promise.all(
      productIds.map(id => base44.asServiceRole.entities.Product.get(id).catch(() => null))
    );
    const productMap = Object.fromEntries(products.filter(Boolean).map(p => [p.id, p]));

    const verifiedItems = [];
    for (const item of items) {
      const product = productMap[item.productId];
      if (!product || !product.is_active) {
        return Response.json({ error: `Product unavailable: ${item.productId}` }, { status: 400 });
      }
      verifiedItems.push({
        ...item,
        price: product.price, // Override with DB price
        productName: product.name,
      });
    }

    // SECURITY: Calculate shipping server-side based on verified subtotal
    const SHIPPING_COST = 4.95;
    const FREE_SHIPPING_THRESHOLD = 80;
    const verifiedSubtotal = verifiedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const verifiedShippingCost = verifiedSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;

    // Apply discount proportionally across product line items
    // (Stripe rejects negative unit_amount, so we reduce the items' prices)
    const discountFactor = (discount_amount > 0 && verifiedSubtotal > 0)
      ? Math.max(0, 1 - discount_amount / verifiedSubtotal)
      : 1;

    const lineItems = verifiedItems.map(item => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: `${item.productName} (${item.color} / ${item.size})`,
        },
        unit_amount: Math.max(0, Math.round(item.price * discountFactor * 100)),
      },
      quantity: item.quantity,
    }));

    // Add shipping as a line item if > 0 (server-calculated, not from FE)
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
        discount_amount: String(discount_amount || 0),
      },
    });

    console.log(`Checkout session created: ${session.id} for order ${order_number}`);
    return Response.json({ url: session.url, session_id: session.id });

  } catch (error) {
    console.error('Error creating checkout session:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});