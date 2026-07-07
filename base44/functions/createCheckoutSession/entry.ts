import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

// Server-side order number generator — no client collision risk
function generateOrderNumber() {
  const year = new Date().getFullYear();
  const ts = Date.now().toString().slice(-6);
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `TIC-${year}-${ts}${rand}`;
}

Deno.serve(async (req) => {
  try {
    // NOTE: This is a public app — guest checkout allowed, no auth required.
    const base44 = createClientFromRequest(req);

    const {
      items,
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
      // Stock check
      const stockEntry = (product.stock || []).find(s => s.color === item.color && s.size === item.size);
      const available = stockEntry?.quantity ?? 0;
      if (available < item.quantity) {
        return Response.json({
          error: `Not enough stock for ${product.name} (${item.color}/${item.size}). Available: ${available}`
        }, { status: 400 });
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
    const safeDiscount = Math.min(Math.max(0, discount_amount || 0), verifiedSubtotal);
    const finalTotal = Math.max(0, verifiedSubtotal + verifiedShippingCost - safeDiscount);

    // Server generates order number — no client-side collision risk
    const orderNumber = generateOrderNumber();

    // Create order in DB BEFORE Stripe session — webhook needs it to exist
    const createdOrder = await base44.asServiceRole.entities.Order.create({
      order_number: orderNumber,
      status: 'pending',
      items: verifiedItems.map(i => ({
        product_id: i.productId,
        product_name: i.productName,
        color: i.color,
        size: i.size,
        quantity: i.quantity,
        unit_price: i.price,
      })),
      subtotal: verifiedSubtotal,
      shipping_cost: verifiedShippingCost,
      discount_amount: safeDiscount,
      applied_discount_code: applied_discount_code || undefined,
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
      // Rollback the order if Stripe fails
      console.error('Stripe session creation failed:', stripeErr.message);
      try { await base44.asServiceRole.entities.Order.delete(createdOrder.id); } catch (_e) {}
      return Response.json({ error: stripeErr.message }, { status: 500 });
    }

    console.log(`Checkout session created: ${session.id} for order ${orderNumber}`);
    return Response.json({ url: session.url, session_id: session.id, order_number: orderNumber });

  } catch (error) {
    console.error('Error creating checkout session:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});