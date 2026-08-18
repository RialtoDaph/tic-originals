import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';
import { jsPDF } from 'npm:jspdf@2.5.1';

// Testing override — while true, ALL invoice emails go to TEST_EMAIL (not the customer).
const TEST_MODE = false;
const TEST_EMAIL = 'altodaphino@gmail.com';

const LOGO_URL = 'https://media.base44.com/images/public/69e5695817245a39fd1a3317/cce36e628_TIC.png';

// jsPDF's built-in helvetica only supports WinAnsi/Latin-1 and mis-renders
// most non-ASCII characters as "ï¿½". Normalize every string we draw to a
// safe ASCII form so the PDF is readable regardless of platform quirks.
function ascii(input: unknown): string {
  if (input == null) return '';
  let s = String(input);
  // Common punctuation & symbols
  s = s
    .replace(/€/g, 'EUR ')
    .replace(/§/g, 'Paragraph ')
    .replace(/[–—−]/g, '-')
    .replace(/[“”„«»]/g, '"')
    .replace(/[‘’‚]/g, "'")
    .replace(/…/g, '...')
    .replace(/•/g, '-')
    .replace(/·/g, '-')
    .replace(/×/g, 'x');
  // German umlauts & sharp s
  s = s
    .replace(/ä/g, 'ae').replace(/Ä/g, 'Ae')
    .replace(/ö/g, 'oe').replace(/Ö/g, 'Oe')
    .replace(/ü/g, 'ue').replace(/Ü/g, 'Ue')
    .replace(/ß/g, 'ss');
  // Strip anything else outside printable ASCII
  s = s.replace(/[^\x20-\x7E\n\r\t]/g, '');
  return s;
}

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
// The source PNG is RGBA (color type 6), which jsPDF's PNG decoder cannot
// render correctly (it produces garbled pink/purple output). We flatten it
// onto a white background and re-encode as an 8-bit RGB PNG (color type 2),
// which jsPDF handles reliably. Uses only Deno built-ins (no native deps).
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c;
  }
  return t;
})();
function crc32(data: Uint8Array): number {
  let c = 0xffffffff;
  for (const b of data) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function paeth(a: number, b: number, c: number): number {
  const p = a + b - c;
  const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}
function pngChunk(type: string, data: Uint8Array): Uint8Array {
  const out = new Uint8Array(12 + data.length);
  const view = new DataView(out.buffer);
  view.setUint32(0, data.length);
  for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
  out.set(data, 8);
  view.setUint32(8 + data.length, crc32(out.subarray(4, 8 + data.length)));
  return out;
}
// Flatten an 8-bit RGBA PNG to an 8-bit RGB PNG composited on white.
async function flattenRgbaPng(bytes: Uint8Array): Promise<Uint8Array | null> {
  try {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    if (bytes.length < 8 || bytes[0] !== 137 || bytes[1] !== 80 || bytes[2] !== 78 || bytes[3] !== 71) return null;
    let pos = 8;
    let width = 0, height = 0, bitDepth = 0, colorType = 0;
    const idatChunks: Uint8Array[] = [];
    while (pos + 8 <= bytes.length) {
      const len = view.getUint32(pos);
      const type = String.fromCharCode(bytes[pos + 4], bytes[pos + 5], bytes[pos + 6], bytes[pos + 7]);
      const dataStart = pos + 8;
      if (type === 'IHDR') {
        width = view.getUint32(dataStart);
        height = view.getUint32(dataStart + 4);
        bitDepth = bytes[dataStart + 8];
        colorType = bytes[dataStart + 9];
      } else if (type === 'IDAT') {
        idatChunks.push(bytes.slice(dataStart, dataStart + len));
      } else if (type === 'IEND') {
        break;
      }
      pos = dataStart + len + 4; // data + CRC
    }
    // Only the RGBA case is broken in jsPDF; pass through anything else unchanged.
    if (colorType !== 6 || bitDepth !== 8) return bytes;
    if (width === 0 || height === 0) return null;

    // Inflate concatenated IDAT (zlib/deflate).
    const total = idatChunks.reduce((s, c) => s + c.length, 0);
    const compressed = new Uint8Array(total);
    let off = 0;
    for (const c of idatChunks) { compressed.set(c, off); off += c.length; }
    const inflated = new Uint8Array(await new Response(
      new Blob([compressed]).stream().pipeThrough(new DecompressionStream('deflate'))
    ).arrayBuffer());

    // Unfilter scanlines (1 filter byte + width*4 bytes per row).
    const bpp = 4;
    const stride = width * bpp;
    const raw = new Uint8Array(height * stride);
    let inPos = 0;
    for (let y = 0; y < height; y++) {
      const filter = inflated[inPos++];
      for (let x = 0; x < stride; x++) {
        const byte = inflated[inPos + x];
        const left = x >= bpp ? raw[y * stride + x - bpp] : 0;
        const up = y > 0 ? raw[(y - 1) * stride + x] : 0;
        const upLeft = (y > 0 && x >= bpp) ? raw[(y - 1) * stride + x - bpp] : 0;
        let val: number;
        switch (filter) {
          case 1: val = (byte + left) & 0xff; break;
          case 2: val = (byte + up) & 0xff; break;
          case 3: val = (byte + ((left + up) >> 1)) & 0xff; break;
          case 4: val = (byte + paeth(left, up, upLeft)) & 0xff; break;
          default: val = byte;
        }
        raw[y * stride + x] = val;
      }
      inPos += stride;
    }

    // Composite onto white → RGB.
    const strideRgb = width * 3;
    const rawRgb = new Uint8Array(height * (strideRgb + 1));
    for (let y = 0; y < height; y++) {
      rawRgb[y * (strideRgb + 1)] = 0; // filter None
      const rowStart = y * (strideRgb + 1) + 1;
      for (let x = 0; x < width; x++) {
        const r = raw[y * stride + x * 4];
        const g = raw[y * stride + x * 4 + 1];
        const b = raw[y * stride + x * 4 + 2];
        const a = raw[y * stride + x * 4 + 3];
        rawRgb[rowStart + x * 3] = Math.round((r * a + 255 * (255 - a)) / 255);
        rawRgb[rowStart + x * 3 + 1] = Math.round((g * a + 255 * (255 - a)) / 255);
        rawRgb[rowStart + x * 3 + 2] = Math.round((b * a + 255 * (255 - a)) / 255);
      }
    }

    // Deflate raw RGB → zlib.
    const deflated = new Uint8Array(await new Response(
      new Blob([rawRgb]).stream().pipeThrough(new CompressionStream('deflate'))
    ).arrayBuffer());

    // Assemble PNG: signature + IHDR(RGB) + IDAT + IEND.
    const sig = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
    const ihdr = new Uint8Array(13);
    const ihdrView = new DataView(ihdr.buffer);
    ihdrView.setUint32(0, width);
    ihdrView.setUint32(4, height);
    ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
    const parts = [sig, pngChunk('IHDR', ihdr), pngChunk('IDAT', deflated), pngChunk('IEND', new Uint8Array(0))];
    const outLen = parts.reduce((s, p) => s + p.length, 0);
    const out = new Uint8Array(outLen);
    let p = 0;
    for (const part of parts) { out.set(part, p); p += part.length; }
    return out;
  } catch (err) {
    console.error('flattenRgbaPng failed:', err.message);
    return null;
  }
}
async function fetchLogoDataUrl(): Promise<string | null> {
  try {
    const res = await fetch(LOGO_URL);
    if (!res.ok) return null;
    const buf = new Uint8Array(await res.arrayBuffer());
    const flat = await flattenRgbaPng(buf);
    if (!flat) return null;
    let binary = '';
    const chunk = 0x8000;
    for (let i = 0; i < flat.length; i += chunk) {
      binary += String.fromCharCode(...flat.subarray(i, i + chunk));
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

  // Local helper to draw ASCII-normalized text.
  const T = (text: string, x: number, yy: number, opts?: any) => doc.text(ascii(text), x, yy, opts);

  // ── Header: TIC logo + wordmark ──────────────────────────────────────
  if (logoDataUrl) {
    doc.addImage(logoDataUrl, 'PNG', marginL, y - 4, 18, 18);
  }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  T('TIC', marginL + 22, y + 4);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(120);
  T('ORIGINALS', marginL + 22, y + 8);
  doc.setTextColor(0);

  // Absender (small print, right-aligned block) — address + contact from Impressum
  doc.setFontSize(8);
  doc.setTextColor(100);
  const absenderTop = y - 2;
  const absender = [...imp.addressLines, ...imp.contactLines].slice(0, 8);
  absender.forEach((line, i) => {
    T(line, pageW - marginR, absenderTop + i * 3.5, { align: 'right' });
  });
  doc.setTextColor(0);

  y += 25;

  // ── Invoice title + meta ─────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  T('RECHNUNG', marginL, y);
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
  T(`Rechnungsnummer: ${order.order_number}`, marginL, y);
  T(`Rechnungsdatum: ${invoiceDate}`, pageW - marginR, y, { align: 'right' });
  y += 4.5;
  T(`Leistungsdatum: ${deliveryDate}`, pageW - marginR, y, { align: 'right' });
  y += 10;

  // ── Bill-to address ──────────────────────────────────────────────────
  const addr = order.shipping_address || {};
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  T('Rechnungsadresse', marginL, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const nameLine = `${addr.first_name || ''} ${addr.last_name || ''}`.trim() || order.customer_name || '';
  if (nameLine) { T(nameLine, marginL, y); y += 5; }
  const streetLine = `${addr.street || ''} ${addr.house_number || ''}`.trim();
  if (streetLine) { T(streetLine, marginL, y); y += 5; }
  if (addr.address_line_2) { T(addr.address_line_2, marginL, y); y += 5; }
  const cityLine = `${addr.postal_code || ''} ${addr.city || ''}`.trim();
  if (cityLine) { T(cityLine, marginL, y); y += 5; }
  if (addr.country) { T(addr.country, marginL, y); y += 5; }
  if (order.customer_email) {
    doc.setFontSize(9);
    doc.setTextColor(120);
    T(order.customer_email, marginL, y);
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
  T('Artikel', colX.desc, y);
  T('Menge', colX.qty, y, { align: 'right' });
  T('Einzelpreis', colX.price, y, { align: 'right' });
  T('Gesamt', colX.total, y, { align: 'right' });
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  for (const item of (order.items || [])) {
    const desc = `${item.product_name || ''}${item.color || item.size ? ` (${[item.color, item.size].filter(Boolean).join(' / ')})` : ''}`;
    const lines = doc.splitTextToSize(ascii(desc), colX.qty - colX.desc - 4);
    doc.text(lines, colX.desc, y);
    T(String(item.quantity || 0), colX.qty, y, { align: 'right' });
    T(`EUR ${(item.unit_price || 0).toFixed(2)}`, colX.price, y, { align: 'right' });
    T(`EUR ${((item.unit_price || 0) * (item.quantity || 0)).toFixed(2)}`, colX.total, y, { align: 'right' });
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
    T(label, labelX, y, { align: 'right' });
    T(value, pageW - marginR, y, { align: 'right' });
    y += 5;
  };
  row('Zwischensumme:', `EUR ${(order.subtotal || 0).toFixed(2)}`);
  if (order.discount_amount > 0) {
    row(`Rabatt${order.applied_discount_code ? ` (${order.applied_discount_code})` : ''}:`, `- EUR ${order.discount_amount.toFixed(2)}`);
  }
  row('Versand:', order.shipping_cost > 0 ? `EUR ${order.shipping_cost.toFixed(2)}` : 'Kostenlos');
  y += 1;
  doc.setDrawColor(0);
  doc.line(labelX - 20, y, pageW - marginR, y);
  y += 4;
  doc.setFontSize(11);
  row('GESAMT:', `EUR ${(order.total || 0).toFixed(2)}`, true);

  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(60);
  // Kleinunternehmer-Hinweis nach § 19 UStG.
  T('Gemaess Paragraph 19 UStG wird keine Umsatzsteuer berechnet.', marginL, y);
  y += 6;
  doc.setFontSize(8);
  doc.setTextColor(100);
  T('Zahlung: bereits per Kreditkarte / PayPal beglichen.', marginL, y);
  y += 8;
  T('Vielen Dank fuer deine Bestellung!', marginL, y);

  // ── Footer with Impressum ────────────────────────────────────────────
  const footerY = 280;
  doc.setDrawColor(220);
  doc.line(marginL, footerY - 4, pageW - marginR, footerY - 4);
  doc.setFontSize(7);
  doc.setTextColor(120);

  // Line 1: company + address
  const line1 = [...imp.addressLines, ...imp.contactLines].join(' - ');
  T(line1.substring(0, 220), pageW / 2, footerY, { align: 'center' });

  // Line 2: tax IDs
  const taxParts: string[] = [];
  if (imp.steuerNr) taxParts.push(`Steuernummer: ${imp.steuerNr}`);
  if (imp.ustId) taxParts.push(`USt-IdNr: ${imp.ustId}`);
  if (taxParts.length) {
    T(taxParts.join(' - '), pageW / 2, footerY + 4, { align: 'center' });
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