-- Fase 1: RLS policies mirroring the `rls` block of each base44/entities/*.jsonc.
-- Base44's `user_condition: { role: "admin" }` -> public.is_admin().
-- Base44's `data.<field> = "{{user.email}}"` -> <field> = auth.jwt() ->> 'email'.
-- A Base44 `"create": null` (nobody via RLS, service-role only) becomes
-- "no insert policy for anon/authenticated" below — the row can still be
-- written by a backend using the service_role key, which bypasses RLS.

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.bundles enable row level security;
alter table public.orders enable row level security;
alter table public.discount_codes enable row level security;
alter table public.legal_pages enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.contact_messages enable row level security;
alter table public.reviews enable row level security;
alter table public.site_settings enable row level security;

-- === profiles ===================================================================
create policy "profiles_select_own_or_admin" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_admin());

create policy "profiles_update_own_or_admin" on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());
-- Note: this lets a user update their own row, but not change their own
-- `role` — enforce that with a BEFORE UPDATE trigger once auth is wired up
-- in Fase 4, the same way Base44 treats `role` as admin-managed.

create policy "profiles_delete_admin" on public.profiles
  for delete to authenticated
  using (public.is_admin());

-- === products (entity: read = is_active OR admin; write = admin) ===============
create policy "products_select_active_or_admin" on public.products
  for select to public
  using (is_active = true or public.is_admin());

create policy "products_write_admin" on public.products
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- === bundles (same pattern as products) =========================================
create policy "bundles_select_active_or_admin" on public.bundles
  for select to public
  using (is_active = true or public.is_admin());

create policy "bundles_write_admin" on public.bundles
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- === orders (entity: create = any logged-in user; read = admin or owner;
-- update/delete = admin) ==========================================================
create policy "orders_insert_authenticated" on public.orders
  for insert to authenticated
  with check (true);

create policy "orders_select_admin_or_owner" on public.orders
  for select to authenticated
  using (public.is_admin() or customer_email = auth.jwt() ->> 'email');

create policy "orders_update_admin" on public.orders
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "orders_delete_admin" on public.orders
  for delete to authenticated
  using (public.is_admin());

-- === discount_codes (entity: everything admin-only) ==============================
create policy "discount_codes_admin_all" on public.discount_codes
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- === legal_pages (entity: read = is_active; write = admin) ======================
-- Deviation from the entity spec: adds "or admin" to select so the admin
-- panel can also see/edit pages that are currently inactive/drafted.
create policy "legal_pages_select_active_or_admin" on public.legal_pages
  for select to public
  using (is_active = true or public.is_admin());

create policy "legal_pages_write_admin" on public.legal_pages
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- === newsletter_subscribers (entity: create = nobody via RLS/service-role
-- only; read = admin; update = admin or self; delete = admin) ===================
create policy "newsletter_select_admin" on public.newsletter_subscribers
  for select to authenticated
  using (public.is_admin());

create policy "newsletter_update_admin_or_self" on public.newsletter_subscribers
  for update to authenticated
  using (public.is_admin() or email = auth.jwt() ->> 'email')
  with check (public.is_admin() or email = auth.jwt() ->> 'email');

create policy "newsletter_delete_admin" on public.newsletter_subscribers
  for delete to authenticated
  using (public.is_admin());
-- Intentionally no insert policy: subscribeNewsletter must run through a
-- backend function using the service_role key, exactly like the Base44
-- function of the same name does today.

-- === contact_messages (entity: create = any logged-in user; rest = admin) ======
create policy "contact_messages_insert_authenticated" on public.contact_messages
  for insert to authenticated
  with check (true);

create policy "contact_messages_admin_read_write" on public.contact_messages
  for select to authenticated
  using (public.is_admin());

create policy "contact_messages_admin_update" on public.contact_messages
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "contact_messages_admin_delete" on public.contact_messages
  for delete to authenticated
  using (public.is_admin());
-- The public storefront's contact form (anonymous visitors included) submits
-- through a backend function using the service_role key, same as Base44's
-- submitContactMessage function does today — it does not rely on this policy.

-- === reviews (entity: create = anyone; read = admin, approved, or own;
-- update/delete = admin) ==========================================================
create policy "reviews_insert_public" on public.reviews
  for insert to public
  with check (true);

create policy "reviews_select_admin_approved_or_own" on public.reviews
  for select to public
  using (
    is_approved = true
    or public.is_admin()
    or created_by = auth.jwt() ->> 'email'
  );

create policy "reviews_write_admin" on public.reviews
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "reviews_delete_admin" on public.reviews
  for delete to authenticated
  using (public.is_admin());

-- === site_settings (entity: read = public; write = admin) ======================
create policy "site_settings_select_public" on public.site_settings
  for select to public
  using (true);

create policy "site_settings_write_admin" on public.site_settings
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());
