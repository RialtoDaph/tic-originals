import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    const order = payload.data;
    if (!order || !order.customer_email) {
      return Response.json({ error: 'Missing order data' }, { status: 400 });
    }

    const status = order.status;
    const lang = order.language || (order.shipping_address?.country?.toLowerCase().includes('deutsch') ? 'de' : 'en');
    const isDE = lang === 'de';

    const statusInfo = {
      shipped: {
        emoji: '📦',
        subject_en: `Your order is on its way! – ${order.order_number}`,
        subject_de: `Deine Bestellung ist unterwegs! – ${order.order_number}`,
        headline_en: 'Your order has been shipped!',
        headline_de: 'Deine Bestellung wurde versandt!',
        body_en: `Great news! Your order <strong>${order.order_number}</strong> has been shipped and is on its way to you.`,
        body_de: `Gute Neuigkeiten! Deine Bestellung <strong>${order.order_number}</strong> wurde versandt und ist auf dem Weg zu dir.`,
      },
      delivered: {
        emoji: '✅',
        subject_en: `Order delivered – ${order.order_number}`,
        subject_de: `Bestellung zugestellt – ${order.order_number}`,
        headline_en: 'Your order has been delivered!',
        headline_de: 'Deine Bestellung wurde zugestellt!',
        body_en: `Your order <strong>${order.order_number}</strong> has been delivered. We hope you love it!`,
        body_de: `Deine Bestellung <strong>${order.order_number}</strong> wurde zugestellt. Wir hoffen, du liebst sie!`,
      },
      cancelled: {
        emoji: '❌',
        subject_en: `Order cancelled – ${order.order_number}`,
        subject_de: `Bestellung storniert – ${order.order_number}`,
        headline_en: 'Your order has been cancelled',
        headline_de: 'Deine Bestellung wurde storniert',
        body_en: `Your order <strong>${order.order_number}</strong> has been cancelled. If you have questions, please contact us.`,
        body_de: `Deine Bestellung <strong>${order.order_number}</strong> wurde storniert. Bei Fragen kontaktiere uns bitte.`,
      },
    };

    const info = statusInfo[status];
    if (!info) {
      return Response.json({ skipped: true, reason: `No email template for status: ${status}` });
    }

    const subject = isDE ? info.subject_de : info.subject_en;
    const headline = isDE ? info.headline_de : info.headline_en;
    const bodyText = isDE ? info.body_de : info.body_en;

    const trackingHtml = order.tracking_number
      ? `<div style="background:#f5f5f5;padding:16px;margin:24px 0;">
          <p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#767676;margin:0 0 4px;">
            ${isDE ? 'Tracking-Nummer' : 'Tracking Number'}
          </p>
          <p style="font-family:Georgia,serif;font-size:18px;margin:0;">${order.tracking_number}</p>
          ${order.shipping_carrier ? `<p style="font-size:12px;color:#767676;margin:4px 0 0;">${order.shipping_carrier}</p>` : ''}
        </div>`
      : '';

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
    ${info.emoji} ${headline}
  </h2>
  <p style="color:#767676;font-size:14px;">
    ${isDE ? `Hallo ${order.customer_name},` : `Hi ${order.customer_name},`}
  </p>
  <p style="font-size:14px;">${bodyText}</p>

  ${trackingHtml}

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

    return Response.json({ success: true, status, sent_to: order.customer_email });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});