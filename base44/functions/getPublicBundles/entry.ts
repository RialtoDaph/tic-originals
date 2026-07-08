import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Returns active bundles for the storefront. Includes resolved product summaries
// so the homepage can render bundle cards without a second round-trip.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const bundles = await base44.asServiceRole.entities.Bundle.filter(
      { is_active: true },
      '-created_date',
      50
    );

    // Collect unique product ids across all bundles and fetch them in one shot.
    const allIds = [...new Set(bundles.flatMap((b: any) => b.product_ids || []))];
    const products = allIds.length > 0
      ? await base44.asServiceRole.entities.Product.filter({ id: { $in: allIds } })
      : [];

    const productMap: Record<string, any> = {};
    for (const p of products) {
      productMap[p.id] = {
        id: p.id,
        name: p.name,
        price: p.price,
        images: p.images,
        colors: p.colors,
        sizes: p.sizes,
        stock: p.stock,
      };
    }

    const enriched = bundles.map((b: any) => ({
      ...b,
      products: (b.product_ids || []).map((id: string) => productMap[id]).filter(Boolean),
    }));

    return Response.json({ bundles: enriched });
  } catch (error) {
    console.error('getPublicBundles error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});