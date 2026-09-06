// Fase 1 sync: Base44 (read-only, asServiceRole) -> Supabase (upsert).
//
// This function NEVER writes back to Base44 — it only reads. It writes into
// Supabase via the REST API using the service_role key, upserting on
// `legacy_id` so it is safe to re-run as many times as needed (e.g. to pick
// up new orders/reviews since the last run) without duplicating rows or
// disturbing the live Base44 store.
//
// Prerequisites before calling this function:
//   1. The Fase 1 migrations (supabase/migrations/*.sql) must already be
//      applied to the target Supabase project.
//   2. Configure these two secrets in Base44 (Settings > Secrets):
//        SUPABASE_URL
//        SUPABASE_SERVICE_ROLE_KEY   (service_role key, NOT the anon key)
//   3. Caller must be logged in as a Base44 admin.
//
// Sync order matters: Product goes first because Bundle.product_ids,
// DiscountCode.applicable_product_ids and Review.product_id all get
// remapped from Base44's string ids to the new Supabase uuids using the
// id map built from the Product step.

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.46';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

async function upsert(table: string, rows: any[]) {
  if (rows.length === 0) return [];
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?on_conflict=legacy_id`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY!,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify(rows),
  });
  if (!res.ok) {
    throw new Error(`upsert into ${table} failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

function mapIds(ids: string[] | undefined, idMap: Record<string, string>) {
  return (ids || []).map((id) => idMap[id]).filter(Boolean);
}

Deno.serve(async (req) => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return Response.json(
      { error: 'Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY secrets in Base44' },
      { status: 500 }
    );
  }

  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me().catch(() => null);
  if (!user || user.role !== 'admin') {
    return Response.json({ error: 'Admin only' }, { status: 401 });
  }

  const summary: Record<string, number> = {};
  const errors: Record<string, string> = {};

  async function runStep(name: string, fn: () => Promise<any[]>) {
    try {
      const saved = await fn();
      summary[name] = saved.length;
      return saved;
    } catch (error) {
      errors[name] = error.message || String(error);
      return [];
    }
  }

  // Products first — everything else below remaps ids against this map.
  const savedProducts = await runStep('products', async () => {
    const products = await base44.asServiceRole.entities.Product.filter({}, '-created_date', 5000);
    return upsert(
      'products',
      products.map((p: any) => ({
        legacy_id: p.id,
        name: p.name,
        slug: p.slug,
        category: p.category,
        description: p.description,
        description_de: p.description_de,
        description_en: p.description_en,
        care_instructions_de: p.care_instructions_de,
        care_instructions_en: p.care_instructions_en,
        material: p.material,
        price: p.price,
        stripe_price_id: p.stripe_price_id,
        images: p.images || [],
        colors: p.colors || [],
        sizes: p.sizes || [],
        stock: p.stock || [],
        tags: p.tags || [],
        weight_grams: p.weight_grams,
        low_stock_threshold: p.low_stock_threshold,
        is_active: p.is_active,
        created_by: p.created_by,
        created_at: p.created_date,
        updated_at: p.updated_date,
      }))
    );
  });
  const productIdMap: Record<string, string> = {};
  for (const row of savedProducts) productIdMap[row.legacy_id] = row.id;

  await runStep('bundles', async () => {
    const bundles = await base44.asServiceRole.entities.Bundle.filter({}, '-created_date', 5000);
    return upsert(
      'bundles',
      bundles.map((b: any) => ({
        legacy_id: b.id,
        name: b.name,
        product_ids: mapIds(b.product_ids, productIdMap),
        normal_price: b.normal_price,
        bundle_price: b.bundle_price,
        bundle_sale_price: b.bundle_sale_price,
        sale_valid_until: b.sale_valid_until,
        items_summary: b.items_summary,
        is_active: b.is_active,
        created_by: b.created_by,
        created_at: b.created_date,
        updated_at: b.updated_date,
      }))
    );
  });

  await runStep('discount_codes', async () => {
    const codes = await base44.asServiceRole.entities.DiscountCode.filter({}, '-created_date', 5000);
    return upsert(
      'discount_codes',
      codes.map((d: any) => ({
        legacy_id: d.id,
        code: d.code,
        description: d.description,
        discount_type: d.discount_type,
        discount_value: d.discount_value,
        is_active: d.is_active,
        is_first_order_only: d.is_first_order_only,
        maximum_discount_amount: d.maximum_discount_amount,
        minimum_order_amount: d.minimum_order_amount,
        usage_limit: d.usage_limit,
        usage_limit_per_customer: d.usage_limit_per_customer,
        used_count: d.used_count,
        valid_from: d.valid_from,
        valid_until: d.valid_until,
        applicable_product_ids: mapIds(d.applicable_product_ids, productIdMap),
        created_by: d.created_by,
        created_at: d.created_date,
        updated_at: d.updated_date,
      }))
    );
  });

  await runStep('reviews', async () => {
    const reviews = await base44.asServiceRole.entities.Review.filter({}, '-created_date', 20000);
    const withProduct = reviews.filter((r: any) => productIdMap[r.product_id]);
    if (withProduct.length < reviews.length) {
      errors.reviews_skipped = `${reviews.length - withProduct.length} review(s) skipped: product not migrated`;
    }
    return upsert(
      'reviews',
      withProduct.map((r: any) => ({
        legacy_id: r.id,
        product_id: productIdMap[r.product_id],
        author_name: r.author_name,
        rating: r.rating,
        comment: r.comment,
        description: r.description,
        is_approved: r.is_approved,
        created_by: r.created_by,
        created_at: r.created_date,
        updated_at: r.updated_date,
      }))
    );
  });

  await runStep('orders', async () => {
    const orders = await base44.asServiceRole.entities.Order.filter({}, '-created_date', 20000);
    return upsert(
      'orders',
      orders.map((o: any) => ({
        legacy_id: o.id,
        order_number: o.order_number,
        status: o.status,
        items: o.items || [],
        subtotal: o.subtotal,
        shipping_cost: o.shipping_cost,
        discount_amount: o.discount_amount,
        applied_discount_code: o.applied_discount_code,
        total: o.total,
        vat_amount: o.vat_amount,
        customer_email: o.customer_email,
        customer_name: o.customer_name,
        customer_phone: o.customer_phone,
        language: o.language,
        shipping_address: o.shipping_address,
        shipping_method: o.shipping_method,
        shipping_carrier: o.shipping_carrier,
        tracking_number: o.tracking_number,
        payment_method: o.payment_method,
        payment_status: o.payment_status,
        stripe_session_id: o.stripe_session_id,
        stripe_payment_intent: o.stripe_payment_intent,
        stock_decremented: o.stock_decremented,
        notes: o.notes,
        created_by: o.created_by,
        created_at: o.created_date,
        updated_at: o.updated_date,
      }))
    );
  });

  await runStep('legal_pages', async () => {
    const pages = await base44.asServiceRole.entities.LegalPage.filter({}, '-created_date', 100);
    return upsert(
      'legal_pages',
      pages.map((l: any) => ({
        legacy_id: l.id,
        slug: l.slug,
        title_de: l.title_de,
        title_en: l.title_en,
        subtitle_de: l.subtitle_de,
        subtitle_en: l.subtitle_en,
        content_de: l.content_de,
        content_en: l.content_en,
        is_active: l.is_active,
        last_updated: l.last_updated,
        created_by: l.created_by,
        created_at: l.created_date,
        updated_at: l.updated_date,
      }))
    );
  });

  await runStep('newsletter_subscribers', async () => {
    const subs = await base44.asServiceRole.entities.NewsletterSubscriber.filter({}, '-created_date', 20000);
    return upsert(
      'newsletter_subscribers',
      subs.map((s: any) => ({
        legacy_id: s.id,
        email: s.email,
        description: s.description,
        is_active: s.is_active,
        language: s.language,
        unsubscribe_token: s.unsubscribe_token,
        created_by: s.created_by,
        created_at: s.created_date,
        updated_at: s.updated_date,
      }))
    );
  });

  await runStep('contact_messages', async () => {
    const messages = await base44.asServiceRole.entities.ContactMessage.filter({}, '-created_date', 20000);
    return upsert(
      'contact_messages',
      messages.map((c: any) => ({
        legacy_id: c.id,
        name: c.name,
        email: c.email,
        subject: c.subject,
        message: c.message,
        description: c.description,
        is_read: c.is_read,
        created_by: c.created_by,
        created_at: c.created_date,
        updated_at: c.updated_date,
      }))
    );
  });

  await runStep('site_settings', async () => {
    const settings = await base44.asServiceRole.entities.SiteSetting.filter({}, '-created_date', 500);
    return upsert(
      'site_settings',
      settings.map((s: any) => ({
        legacy_id: s.id,
        key: s.key,
        value: s.value,
        description: s.description,
        created_by: s.created_by,
        created_at: s.created_date,
        updated_at: s.updated_date,
      }))
    );
  });

  return Response.json({ summary, errors });
});
