-- TestiFi 초기 스키마
-- 테스트 데이터 테이블
create table if not exists tests (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text not null,
  og_image text not null default '',
  questions jsonb not null default '[]'::jsonb,
  results jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  published_at timestamptz,
  view_count int not null default 0,
  share_count int not null default 0,
  completion_count int not null default 0
);

-- 분석 이벤트 테이블
create table if not exists analytics (
  id uuid primary key default gen_random_uuid(),
  test_slug text not null,
  event_type text not null,
  result_type text,
  referrer text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- 프리미엄 결제 테이블
create table if not exists premium_purchases (
  id uuid primary key default gen_random_uuid(),
  test_slug text not null,
  result_type text not null,
  payment_id text not null,
  amount int not null,
  created_at timestamptz not null default now()
);

-- 인덱스
create index if not exists idx_tests_slug on tests(slug);
create index if not exists idx_tests_published on tests(published_at) where published_at is not null;
create index if not exists idx_analytics_test_slug on analytics(test_slug);
create index if not exists idx_analytics_created_at on analytics(created_at);
create index if not exists idx_premium_test_slug on premium_purchases(test_slug);
