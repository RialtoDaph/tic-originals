import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const body = await req.json().catch(() => ({}));
    const slug = body?.slug;

    if (!slug) {
      return Response.json({ error: 'slug is required' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);
    const results = await base44.asServiceRole.entities.LegalPage.filter({ slug, is_active: true });

    return Response.json({ page: results[0] || null });
  } catch (error) {
    console.error('getLegalPage error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});