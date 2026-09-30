-- 直観メシ: favorites テーブルとRLSポリシー
-- Supabase の SQL Editor で実行してください（このリポジトリからは実行しません）。

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  shop_id text not null,
  created_at timestamptz not null default now(),
  unique (user_id, shop_id)
);

create index if not exists favorites_user_id_idx on public.favorites (user_id);

alter table public.favorites enable row level security;

create policy "Users can view their own favorites"
  on public.favorites
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own favorites"
  on public.favorites
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can delete their own favorites"
  on public.favorites
  for delete
  to authenticated
  using (auth.uid() = user_id);
