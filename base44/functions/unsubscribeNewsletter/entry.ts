import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { email, token } = await req.json();

    if (!email) return Response.json({ error: 'Email required' }, { status: 400 });

    const subs = await base44.asServiceRole.entities.NewsletterSubscriber.filter({ email });
    if (subs.length === 0) {
      return Response.json({ success: true, message: 'Already unsubscribed' });
    }

    const sub = subs[0];
    // If a token was set, validate it; otherwise allow (legacy subscribers)
    if (sub.unsubscribe_token && sub.unsubscribe_token !== token) {
      return Response.json({ error: 'Invalid token' }, { status: 403 });
    }

    await base44.asServiceRole.entities.NewsletterSubscriber.update(sub.id, { is_active: false });
    console.log(`Unsubscribed: ${email}`);

    return Response.json({ success: true });
  } catch (error) {
    console.error('unsubscribeNewsletter error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});