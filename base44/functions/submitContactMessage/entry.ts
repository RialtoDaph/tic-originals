import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body || {};

    if (!name || !email || !message) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);
    await base44.asServiceRole.entities.ContactMessage.create({
      name,
      email,
      subject: subject || '',
      message,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('submitContactMessage error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});