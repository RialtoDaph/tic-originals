import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    const order = payload.data;
    if (!order || !order.customer_email) {
      return Response.json({ error: 'Missing order data' }, { status: 400 });
    }

    // Only send confirmation when payment is actually paid (not on initial pending creation)
    if (order.payment_status !== 'paid') {
      return Response.json({ skipped: true, reason: 'payment not yet paid' });
    }

    const lang = order.language || (order.shipping_address?.country?.toLowerCase().includes('deutsch') ? 'de' : 'en');
    const isDE = lang === 'de';

    const itemsHtml = (order.items || []).map(item =>
      `<tr>
        <td style="padding:8px 0;border-bottom:1px solid #eee;">${item.product_name} (${item.color}/${item.size})</td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:center;">x${item.quantity}</td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;">€${(item.unit_price * item.quantity).toFixed(2)}</td>
      </tr>`
    ).join('');

    const subject = isDE
      ? `Bestellbestätigung – ${order.order_number}`
      : `Order Confirmation – ${order.order_number}`;

    const body = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family:sans-serif;color:#323232;max-width:600px;margin:0 auto;padding:24px;">
  <div style="text-align:center;margin-bottom:32px;">
    <h1 style="font-family:Georgia,serif;font-size:32px;letter-spacing:6px;margin:0;">TIC</h1>
    <p style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#767676;margin:4px 0 0;">ORIGINALS</p>
  </div>

  <h2 style="font-family:Georgia,serif;font-size:22px;font-weight:300;margin-bottom:8px;">
    ${isDE ? '🎉 Danke für deine Bestellung!' : '🎉 Thank you for your order!'}
  </h2>
  <p style="color:#767676;font-size:14px;">
    ${isDE
      ? `Hallo ${order.customer_name}, wir haben deine Bestellung erhalten und bestätigen sie hiermit.`
      : `Hi ${order.customer_name}, we've received your order and are confirming it now.`}
  </p>

  <div style="background:#f5f5f5;padding:16px;margin:24px 0;">
    <p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#767676;margin:0 0 4px;">
      ${isDE ? 'Bestellnummer' : 'Order Number'}
    </p>
    <p style="font-family:Georgia,serif;font-size:20px;margin:0;">${order.order_number}</p>
  </div>

  <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
    <thead>
      <tr>
        <th style="text-align:left;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#767676;padding-bottom:8px;border-bottom:2px solid #eee;">
          ${isDE ? 'Artikel' : 'Item'}
        </th>
        <th style="text-align:center;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#767676;padding-bottom:8px;border-bottom:2px solid #eee;">
          ${isDE ? 'Menge' : 'Qty'}
        </th>
        <th style="text-align:right;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#767676;padding-bottom:8px;border-bottom:2px solid #eee;">
          ${isDE ? 'Preis' : 'Price'}
        </th>
      </tr>
    </thead>
    <tbody>${itemsHtml}</tbody>
  </table>

  <div style="text-align:right;margin-bottom:24px;">
    <p style="font-size:13px;color:#767676;margin:4px 0;">
      ${isDE ? 'Versand' : 'Shipping'}: ${order.shipping_cost === 0 ? (isDE ? 'Kostenlos' : 'Free') : `€${(order.shipping_cost || 0).toFixed(2)}`}
    </p>
    <p style="font-size:16px;font-weight:600;margin:4px 0;">
      ${isDE ? 'Gesamt' : 'Total'}: €${(order.total || 0).toFixed(2)}
    </p>
    <p style="font-size:11px;color:#767676;margin:2px 0;">
      ${isDE
        ? 'Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.'
        : 'No VAT charged (§ 19 UStG — small business).'}
    </p>
  </div>

  <div style="border:1px solid #eee;padding:16px;margin-bottom:24px;">
    <p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#767676;margin:0 0 8px;">
      ${isDE ? 'Lieferadresse' : 'Shipping Address'}
    </p>
    <p style="font-size:14px;margin:0;line-height:1.6;">
      ${order.shipping_address?.first_name} ${order.shipping_address?.last_name}<br>
      ${order.shipping_address?.street} ${order.shipping_address?.house_number}<br>
      ${order.shipping_address?.postal_code} ${order.shipping_address?.city}<br>
      ${order.shipping_address?.country}
    </p>
  </div>

  <p style="font-size:13px;color:#767676;">
    ${isDE
      ? 'Du kannst deine Bestellung jederzeit unter <strong>/tracking</strong> verfolgen.'
      : 'You can track your order anytime at <strong>/tracking</strong>.'}
  </p>

  <div style="border-top:1px solid #eee;margin-top:32px;padding-top:16px;text-align:center;">
    <p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#767676;">TIC ORIGINALS</p>
    <p style="font-size:11px;color:#767676;">Till I Collapse</p>
  </div>
</body>
</html>`;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: order.customer_email,
      subject,
      body,
    });

    return Response.json({ success: true, sent_to: order.customer_email });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});