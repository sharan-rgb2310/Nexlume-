create table if not exists public.display_settings (
  id text primary key check (id = 'global'),
  settings jsonb not null default '{"tvPaddingTop":16,"tvPaddingRight":4,"tvPaddingBottom":0,"tvPaddingLeft":4}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint display_settings_tv_padding_valid check (
    jsonb_typeof(settings) = 'object'
    and coalesce((settings->>'tvPaddingTop')::integer between 0 and 100, false)
    and coalesce((settings->>'tvPaddingRight')::integer between 0 and 100, false)
    and coalesce((settings->>'tvPaddingBottom')::integer between 0 and 100, false)
    and coalesce((settings->>'tvPaddingLeft')::integer between 0 and 100, false)
  )
);

drop trigger if exists set_display_settings_updated_at on public.display_settings;
create trigger set_display_settings_updated_at
before update on public.display_settings
for each row execute function public.handle_updated_at();

insert into public.display_settings (id)
values ('global')
on conflict (id) do nothing;

alter table public.display_settings enable row level security;

grant select on public.display_settings to anon, authenticated;
grant update on public.display_settings to authenticated;

drop policy if exists "Public can view display settings" on public.display_settings;
create policy "Public can view display settings"
  on public.display_settings for select
  using (true);

drop policy if exists "Admins can update display settings" on public.display_settings;
create policy "Admins can update display settings"
  on public.display_settings for update
  using (public.is_admin())
  with check (public.is_admin());
