import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { email, language } = body || {};

    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);

    // Idempotent: skip if already subscribed
    const existing = await base44.asServiceRole.entities.NewsletterSubscriber.filter({ email });
    if (existing.length > 0) {
      return Response.json({ success: true, alreadySubscribed: true });
    }

    await base44.asServiceRole.entities.NewsletterSubscriber.create({
      email,
      language: language || 'de',
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('subscribeNewsletter error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});