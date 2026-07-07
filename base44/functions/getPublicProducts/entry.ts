import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    // Public storefront only sees active products
    const products = await base44.asServiceRole.entities.Product.filter({ is_active: true }, '-created_date', 200);
    return Response.json({ products });
  } catch (error) {
    console.error('Error fetching products:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});