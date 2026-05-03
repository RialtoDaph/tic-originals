import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const products = await base44.asServiceRole.entities.Product.filter({ is_active: true });
    return Response.json({ products });
  } catch (error) {
    console.error('Error fetching products:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});