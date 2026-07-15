import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';
import { jsPDF } from 'npm:jspdf@2.5.1';

// Testing override — while true, ALL invoice emails go to TEST_EMAIL (not the customer).
const TEST_MODE = false;
const TEST_EMAIL = 'altodaphino@gmail.com';

const LOGO_URL = 'https://media.base44.com/images/public/69e5695817245a39fd1a3317/cce36e628_TIC.png';

// Extract structured company info from Impressum LegalPage (JSON blocks with heading + body).
// Returns { addressLines, contactLines, ustId, steuerNr } for structured rendering.
function parseImpressum(page: any): { addressLines: string[]; contactLines: string[]; ustId: string; steuerNr: string } {
  const empty = { addressLines: [], contactLines: [], ustId: '', steuerNr: '' };
  if (!page) return empty;
  const raw = page.content_de || page.content_en || '';
  let blocks: any[] = [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) blocks = parsed;
  } catch { return empty; }

  const findBlock = (kw: string[]) =>
    blocks.find(b => kw.some(k => String(b?.heading || '').toLowerCase().includes(k.toLowerCase())));

  const splitBody = (b: any): string[] =>
    String(b?.body || '').split('\n').map(s => s.trim()).filter(Boolean);

  const addressBlock = findBlock(['§ 5', 'Angaben', 'Information']);
  const contactBlock = findBlock(['Kontakt', 'Contact']);
  const ustBlock = findBlock(['Umsatzsteuer', 'VAT']);
  const steuerBlock = findBlock(['Steuernummer']);

  // Extract just the ID (e.g. "DE462943223") from the USt body — strip long explanatory prefix.
  const ustBody = String(ustBlock?.body || '');
  const ustMatch = ustBody.match(/DE\s?\d{7,12}/i);
  const ustId = ustMatch ? ustMatch[0].replace(/\s/g, '') : '';

  const steuerBody = String(steuerBlock?.body || '');
  const steuerMatch = steuerBody.match(/[\d/]{6,}/);
  const steuerNr = steuerMatch ? steuerMatch[0] : '';

  return {
    addressLines: addressBlock ? splitBody(addressBlock) : [],
    contactLines: contactBlock ? splitBody(contactBlock) : [],
    ustId,
    steuerNr,
  };
}

// Fetch logo as base64 data URL for jsPDF embedding.
async function fetchLogoDataUrl(): Promise<string | null> {
  try {
    const res = await fetch(LOGO_URL);
    if (!res.ok) return null;
    const buf = new Uint8Array(await res.arrayBuffer());
    let binary = '';
    const chunk = 0x8000;
    for (let i = 0; i < buf.length; i += chunk) {
      binary += String.fromCharCode(...buf.subarray(i, i + chunk));
    }
    return 'data:image/png;base64,' + btoa(binary);
  } catch (err) {
    console.error('Logo fetch failed:', err.message);
    return null;
  }
}

function buildInvoicePDF(order: any, imp: { addressLines: string[]; contactLines: string[]; ustId: string; steuerNr: string }, logoDataUrl: string | null): Uint8Array {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = 210;
  const marginL = 20;
  const marginR = 20;
  let y = 20;

  // ── Header: TIC logo + wordmark ──────────────────────────────────────
  if (logoDataUrl) {
    doc.addImage(logoDataUrl, 'PNG', marginL, y - 4, 18, 18);
  }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('TIC', marginL + 22, y + 4);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(120);
  doc.text('ORIGINALS', marginL + 22, y + 8);
  doc.setTextColor(0);

  // Absender (small print, right-aligned block) — address + contact from Impressum
  doc.setFontSize(8);
  doc.setTextColor(100);
  const absenderTop = y - 2;
  const absender = [...imp.addressLines, ...imp.contactLines].slice(0, 8);
  absender.forEach((line, i) => {
    doc.text(line, pageW - marginR, absenderTop + i * 3.5, { align: 'right' });
  });
  doc.setTextColor(0);

  y += 25;

  // ── Invoice title + meta ─────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('RECHNUNG', marginL, y);
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const invoiceDate = order.created_date
    ? new Date(order.created_date).toLocaleDateString('de-DE')
    : new Date().toLocaleDateString('de-DE');
  // Liefer-/Leistungsdatum: Versanddatum falls vorhanden, sonst = Rechnungsdatum (typisch im Onlineshop).
  const deliveryDate = order.updated_date && order.status === 'shipped'
    ? new Date(order.updated_date).toLocaleDateString('de-DE')
    : invoiceDate;
  doc.text(`Rechnungsnummer: ${order.order_number}`, marginL, y);
  doc.text(`Rechnungsdatum: ${invoiceDate}`, pageW - marginR, y, { align: 'right' });
  y += 4.5;
  doc.text(`Leistungsdatum: ${deliveryDate}`, pageW - marginR, y, { align: 'right' });
  y += 10;

  // ── Bill-to address ──────────────────────────────────────────────────
  const addr = order.shipping_address || {};
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Rechnungsadresse', marginL, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const nameLine = `${addr.first_name || ''} ${addr.last_name || ''}`.trim() || order.customer_name || '';
  if (nameLine) { doc.text(nameLine, marginL, y); y += 5; }
  const streetLine = `${addr.street || ''} ${addr.house_number || ''}`.trim();
  if (streetLine) { doc.text(streetLine, marginL, y); y += 5; }
  if (addr.address_line_2) { doc.text(addr.address_line_2, marginL, y); y += 5; }
  const cityLine = `${addr.postal_code || ''} ${addr.city || ''}`.trim();
  if (cityLine) { doc.text(cityLine, marginL, y); y += 5; }
  if (addr.country) { doc.text(addr.country, marginL, y); y += 5; }
  if (order.customer_email) {
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(order.customer_email, marginL, y);
    doc.setTextColor(0);
    y += 5;
  }
  y += 6;

  // ── Items table ──────────────────────────────────────────────────────
  const colX = { desc: marginL, qty: 120, price: 145, total: pageW - marginR };
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setFillColor(240);
  doc.rect(marginL - 2, y - 4, pageW - marginL - marginR + 4, 7, 'F');
  doc.text('Artikel', colX.desc, y);
  doc.text('Menge', colX.qty, y, { align: 'right' });
  doc.text('Einzelpreis', colX.price, y, { align: 'right' });
  doc.text('Gesamt', colX.total, y, { align: 'right' });
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  for (const item of (order.items || [])) {
    const desc = `${item.product_name || ''}${item.color || item.size ? ` (${[item.color, item.size].filter(Boolean).join(' / ')})` : ''}`;
    const lines = doc.splitTextToSize(desc, colX.qty - colX.desc - 4);
    doc.text(lines, colX.desc, y);
    doc.text(String(item.quantity || 0), colX.qty, y, { align: 'right' });
    doc.text(`€${(item.unit_price || 0).toFixed(2)}`, colX.price, y, { align: 'right' });
    doc.text(`€${((item.unit_price || 0) * (item.quantity || 0)).toFixed(2)}`, colX.total, y, { align: 'right' });
    y += Math.max(5, lines.length * 4.5) + 2;
    if (y > 240) { doc.addPage(); y = 20; }
  }

  y += 2;
  doc.setDrawColor(200);
  doc.line(marginL, y, pageW - marginR, y);
  y += 6;

  // ── Totals ───────────────────────────────────────────────────────────
  const labelX = 140;
  doc.setFontSize(9);
  const row = (label: string, value: string, bold = false) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.text(label, labelX, y, { align: 'right' });
    doc.text(value, pageW - marginR, y, { align: 'right' });
    y += 5;
  };
  row('Nettosumme:', `€${(order.subtotal || 0).toFixed(2)}`);
  if (order.discount_amount > 0) {
    row(`Rabatt${order.applied_discount_code ? ` (${order.applied_discount_code})` : ''}:`, `−€${order.discount_amount.toFixed(2)}`);
  }
  row('Versand (netto):', order.shipping_cost > 0 ? `€${order.shipping_cost.toFixed(2)}` : 'Kostenlos');
  row('MwSt 19%:', `€${(order.vat_amount || 0).toFixed(2)}`);
  y += 1;
  doc.setDrawColor(0);
  doc.line(labelX - 20, y, pageW - marginR, y);
  y += 4;
  doc.setFontSize(11);
  row('GESAMT (brutto):', `€${(order.total || 0).toFixed(2)}`, true);

  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(60);
  // Ausweis der Umsatzsteuer nach § 14 UStG (Pflichtangabe bei Regelbesteuerung).
  const vatTxt = 'Alle Beträge inkl. 19% Umsatzsteuer gemäß § 14 UStG.';
  doc.text(vatTxt, marginL, y);
  y += 6;
  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text('Zahlung: bereits per Kreditkarte / PayPal beglichen.', marginL, y);
  y += 8;
  doc.text('Vielen Dank für deine Bestellung!', marginL, y);

  // ── Footer with Impressum ────────────────────────────────────────────
  const footerY = 280;
  doc.setDrawColor(220);
  doc.line(marginL, footerY - 4, pageW - marginR, footerY - 4);
  doc.setFontSize(7);
  doc.setTextColor(120);

  // Line 1: company + address
  const line1 = [...imp.addressLines, ...imp.contactLines].join(' · ');
  doc.text(line1.substring(0, 180), pageW / 2, footerY, { align: 'center' });

  // Line 2: tax IDs
  const taxParts: string[] = [];
  if (imp.steuerNr) taxParts.push(`Steuernummer: ${imp.steuerNr}`);
  if (imp.ustId) taxParts.push(`USt-IdNr: ${imp.ustId}`);
  if (taxParts.length) {
    doc.text(taxParts.join(' · '), pageW / 2, footerY + 4, { align: 'center' });
  }
  doc.setTextColor(0);

  const arrayBuffer = doc.output('arraybuffer');
  return new Uint8Array(arrayBuffer);
}

function base64Encode(bytes: Uint8Array): string {
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { order_id, action } = body; // action: 'download' | 'send'

    if (!order_id) return Response.json({ error: 'order_id is required' }, { status: 400 });

    const order = await base44.asServiceRole.entities.Order.get(order_id);
    if (!order) return Response.json({ error: 'Order not found' }, { status: 404 });

    // Load Impressum for absender data + fetch logo (parallel)
    const [impressumResults, logoDataUrl] = await Promise.all([
      base44.asServiceRole.entities.LegalPage.filter({ slug: 'impressum' }),
      fetchLogoDataUrl(),
    ]);
    const imp = parseImpressum(impressumResults[0]);

    const pdfBytes = buildInvoicePDF(order, imp, logoDataUrl);

    if (action === 'send') {
      const recipient = TEST_MODE ? TEST_EMAIL : order.customer_email;
      if (!recipient) return Response.json({ error: 'No recipient email' }, { status: 400 });

      const isDE = (order.language || 'de') === 'de';
      const subject = isDE
        ? `Rechnung ${order.order_number}${TEST_MODE ? ' [TEST]' : ''}`
        : `Invoice ${order.order_number}${TEST_MODE ? ' [TEST]' : ''}`;

      // SendEmail doesn't support attachments — upload the PDF and link to it instead.
      const pdfFile = new File([pdfBytes], `Rechnung-${order.order_number}.pdf`, { type: 'application/pdf' });
      const uploadRes = await base44.asServiceRole.integrations.Core.UploadFile({ file: pdfFile });
      const pdfUrl = uploadRes.file_url;

      const html = `
<!DOCTYPE html><html><body style="font-family:sans-serif;color:#323232;max-width:600px;margin:0 auto;padding:24px;">
  <h2 style="font-family:Georgia,serif;font-weight:300;">${isDE ? 'Deine Rechnung' : 'Your invoice'}</h2>
  <p>${isDE ? `Hallo ${order.customer_name || ''},` : `Hi ${order.customer_name || ''},`}</p>
  <p>${isDE
    ? `deine Rechnung zu Bestellung <strong>${order.order_number}</strong> steht bereit.`
    : `Your invoice for order <strong>${order.order_number}</strong> is ready.`}</p>
  <p style="margin:24px 0;">
    <a href="${pdfUrl}" style="display:inline-block;background:#323232;color:#9EF2FF;text-decoration:none;padding:12px 28px;border-radius:999px;font-size:13px;letter-spacing:2px;text-transform:uppercase;">
      ${isDE ? 'Rechnung herunterladen' : 'Download invoice'}
    </a>
  </p>
  <p style="color:#767676;font-size:12px;">${isDE ? 'Oder öffne diesen Link:' : 'Or open this link:'}<br/>
    <a href="${pdfUrl}" style="color:#767676;word-break:break-all;">${pdfUrl}</a></p>
  <p style="color:#767676;font-size:13px;margin-top:24px;">${isDE ? 'Vielen Dank für deinen Einkauf!' : 'Thanks for your purchase!'}</p>
  <p style="color:#767676;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin-top:32px;">TIC ORIGINALS</p>
</body></html>`;

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: recipient,
        subject,
        body: html,
      });

      return Response.json({
        success: true,
        sent_to: recipient,
        pdf_url: pdfUrl,
        test_mode: TEST_MODE,
        note: TEST_MODE ? `TEST MODE — sent to ${TEST_EMAIL} instead of customer.` : undefined,
      });
    }

    // Default: return the PDF as a download
    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Rechnung-${order.order_number}.pdf"`,
      },
    });
  } catch (error) {
    console.error('generateInvoicePDF error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});