import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// Returns the authenticated user's orders. Orders are created by the service role
// (via createCheckoutSession), so the User's own RLS-scoped Order.filter() won't
// see them. This function bridges that: auth the user, then service-role fetch
// filtered strictly by customer_email = auth.email.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orders = await base44.asServiceRole.entities.Order.filter(
      { customer_email: user.email },
      '-created_date',
      100
    );

    // Hide pending/unpaid orders (abandoned checkouts).
    const visible = (orders || []).filter(
      (o: any) => o.payment_status === 'paid' || o.status !== 'pending'
    );

    return Response.json({ orders: visible });
  } catch (error) {
    console.error('getMyOrders error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});