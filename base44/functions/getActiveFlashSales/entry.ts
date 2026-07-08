import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Returns discount codes that are currently active flash sales
// (is_active, within valid_from/valid_until, and target specific products via
// applicable_product_ids). Public endpoint — no auth required so the shop can
// show strikethrough prices automatically.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const codes = await base44.asServiceRole.entities.DiscountCode.filter(
      { is_active: true },
      '-created_date',
      100
    );

    const flashSales = codes
      .filter((c: any) => Array.isArray(c.applicable_product_ids) && c.applicable_product_ids.length > 0)
      .filter((c: any) => !c.valid_from || c.valid_from <= today)
      .filter((c: any) => !c.valid_until || c.valid_until >= today)
      // Only expose fields needed by the storefront — never leak usage counts, limits etc.
      .map((c: any) => ({
        code: c.code,
        discount_type: c.discount_type,
        discount_value: c.discount_value,
        valid_from: c.valid_from,
        valid_until: c.valid_until,
        applicable_product_ids: c.applicable_product_ids,
      }));

    return Response.json({ flashSales });
  } catch (error) {
    console.error('getActiveFlashSales error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});