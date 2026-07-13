import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// Auto-cancels orders that stayed pending longer than PENDING_TTL_HOURS.
// Frees up their soft-reserved stock so new customers aren't blocked by
// abandoned checkouts. Safe to run repeatedly — only touches pending/unpaid orders.
const PENDING_TTL_HOURS = 24;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const cutoff = new Date(Date.now() - PENDING_TTL_HOURS * 60 * 60 * 1000).toISOString();

    // Load pending orders older than cutoff.
    const stalePending = await base44.asServiceRole.entities.Order.filter(
      { payment_status: 'pending' },
      '-created_date',
      500
    );

    const toCancel = stalePending.filter((o: any) => o.created_date && o.created_date < cutoff);

    for (const order of toCancel) {
      try {
        await base44.asServiceRole.entities.Order.update(order.id, {
          payment_status: 'failed',
          status: 'cancelled',
        });
      } catch (err) {
        console.error(`Failed to cancel stale order ${order.order_number}:`, err.message);
      }
    }

    console.log(`Cleaned up ${toCancel.length} stale pending order(s) (older than ${PENDING_TTL_HOURS}h).`);
    return Response.json({ success: true, cancelled: toCancel.length });
  } catch (error) {
    console.error('cleanupPendingOrders error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});