create table if not exists public.orders (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  stripe_checkout_session_id text not null unique,
  amount_total integer not null check (amount_total >= 0),
  currency text not null,
  items jsonb not null,
  status text not null check (status in ('paid', 'refunded')),
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;

create policy "Customers can read their own orders"
  on public.orders for select
  to authenticated
  using ((select auth.uid()) = user_id);

grant select on public.orders to authenticated;
grant select, insert, update on public.orders to service_role;
grant usage, select on sequence public.orders_id_seq to service_role;
