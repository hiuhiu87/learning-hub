-- =====================================================================
-- EDU SCHEMA (RESET & RECREATE) — Clean, Idempotent, RLS-safe
-- Author: Tim
-- =====================================================================

begin;

-- -------------------------------------------------
-- A) RESET: DROP TOÀN BỘ ĐỐI TƯỢNG DO SCRIPT NÀY TẠO
-- -------------------------------------------------

-- 0) Drop triggers trước (tránh phụ thuộc)
do $$
begin
  -- Trigger đồng bộ profiles khi tạo user mới (nằm trên auth.users)
  if exists (
    select 1 from pg_trigger t
    join pg_class c on c.oid = t.tgrelid
    join pg_namespace n on n.oid = c.relnamespace
    where t.tgname = 'on_auth_user_created'
      and n.nspname = 'auth'
      and c.relname = 'users'
  ) then
    execute 'drop trigger if exists on_auth_user_created on auth.users';
  end if;

  -- Trigger updated_at trên lessons (nếu có)
  if exists (
    select 1 from pg_trigger t
    join pg_class c on c.oid = t.tgrelid
    join pg_namespace n on n.oid = c.relnamespace
    where t.tgname = 'trg_lessons_set_updated_at'
      and n.nspname = 'public'
      and c.relname = 'lessons'
  ) then
    execute 'drop trigger if exists trg_lessons_set_updated_at on public.lessons';
  end if;
end$$;

-- 1) Drop functions (nếu còn)
drop function if exists public.handle_new_user_profile() cascade;
drop function if exists public.tg_set_updated_at() cascade;
drop function if exists public.is_enrolled(uuid, uuid) cascade;
drop function if exists public.is_lesson_teacher(uuid, uuid) cascade;

-- 2) Drop tables (theo thứ tự phụ thuộc, dùng CASCADE để gỡ policy/index)
drop table if exists public.student_responses cascade;
drop table if exists public.questions cascade;
drop table if exists public.flashcards cascade;
drop table if exists public.lesson_enrollments cascade;
drop table if exists public.lessons cascade;
drop table if exists public.profiles cascade;

-- 3) Drop types (enum)
drop type if exists public.user_role;

-- (Không drop extension hệ thống)
-- drop extension if exists pgcrypto; -- KHÔNG KHUYÊN DÙNG

commit;

-- -------------------------------------------------
-- B) RECREATE: TẠO LẠI TOÀN BỘ
-- -------------------------------------------------

-- 0) EXTENSIONS
create extension if not exists pgcrypto;

-- 1) TYPES
do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('teacher', 'student');
  end if;
end$$;

-- 2) TABLES

-- profiles
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text,
  role        public.user_role not null default 'student',
  created_at  timestamptz not null default now()
);

-- lessons
create table if not exists public.lessons (
  id          uuid primary key default gen_random_uuid(),
  teacher_id  uuid not null references public.profiles(id) on delete cascade,
  title       text not null,
  description text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- lesson_enrollments
create table if not exists public.lesson_enrollments (
  id          uuid primary key default gen_random_uuid(),
  lesson_id   uuid not null references public.lessons(id) on delete cascade,
  student_id  uuid not null references public.profiles(id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  unique (lesson_id, student_id)
);

-- flashcards
create table if not exists public.flashcards (
  id          uuid primary key default gen_random_uuid(),
  lesson_id   uuid not null references public.lessons(id) on delete cascade,
  front       text not null,
  back        text not null,
  order_index integer,
  created_at  timestamptz not null default now()
);

-- questions
create table if not exists public.questions (
  id             uuid primary key default gen_random_uuid(),
  lesson_id      uuid not null references public.lessons(id) on delete cascade,
  question_text  text not null,
  question_type  text not null default 'multiple-choice',
  correct_answer text not null,
  option_a       text not null,
  option_b       text not null,
  option_c       text not null,
  option_d       text not null,
  explanation    text,
  order_index    integer,
  created_at     timestamptz not null default now(),
  constraint questions_type_check check (question_type in ('multiple-choice', 'yes-no-not-given'))
);

-- student_responses
create table if not exists public.student_responses (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references public.profiles(id) on delete cascade,
  lesson_id   uuid not null references public.lessons(id) on delete cascade,
  question_id uuid references public.questions(id) on delete set null,
  answer      text,
  is_correct  boolean,
  created_at  timestamptz not null default now()
);

-- lesson_attempts
create table if not exists public.lesson_attempts (
  id                  uuid primary key default gen_random_uuid(),
  student_id          uuid not null references public.profiles(id) on delete cascade,
  lesson_id           uuid not null references public.lessons(id) on delete cascade,
  correct_answers     integer not null default 0,
  total_questions     integer not null default 0,
  flashcards_reviewed integer not null default 0,
  created_at          timestamptz not null default now(),
  completed_at        timestamptz
);

-- 3) TRIGGERS / UTILS

-- updated_at on lessons
create or replace function public.tg_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger trg_lessons_set_updated_at
  before update on public.lessons
  for each row
  execute function public.tg_set_updated_at();

-- Sync profiles from auth.users
create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    coalesce(nullif(new.email, ''), nullif(new.raw_user_meta_data->>'email', ''), new.raw_user_meta_data->>'sub'),
    coalesce(nullif(new.raw_user_meta_data->>'full_name', ''),
             nullif(new.raw_user_meta_data->>'name', ''),
             new.email),
    coalesce(nullif(new.raw_user_meta_data->>'role', ''), 'student')::public.user_role
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = excluded.full_name,
    role = excluded.role;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user_profile();

-- 4) INDEXES
create index if not exists idx_lesson_enrollments_lesson  on public.lesson_enrollments (lesson_id);
create index if not exists idx_lesson_enrollments_student on public.lesson_enrollments (student_id);
create index if not exists idx_flashcards_lesson         on public.flashcards (lesson_id);
create index if not exists idx_questions_lesson          on public.questions (lesson_id);
create index if not exists idx_responses_student_lesson  on public.student_responses (student_id, lesson_id);
create index if not exists idx_attempts_student_lesson   on public.lesson_attempts (student_id, lesson_id);

-- 5) RLS ENABLE
alter table if exists public.profiles            enable row level security;
alter table if exists public.lessons             enable row level security;
alter table if exists public.lesson_enrollments  enable row level security;
alter table if exists public.flashcards          enable row level security;
alter table if exists public.questions           enable row level security;
alter table if exists public.student_responses   enable row level security;
alter table if exists public.lesson_attempts     enable row level security;

-- 6) HELPER FUNCTIONS (SECURITY DEFINER; stable)
create or replace function public.is_enrolled(p_lesson_id uuid, p_uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.lesson_enrollments le
    where le.lesson_id = p_lesson_id
      and le.student_id = p_uid
  );
$$;
revoke all on function public.is_enrolled(uuid, uuid) from public;

create or replace function public.is_lesson_teacher(p_lesson_id uuid, p_uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.lessons l
    where l.id = p_lesson_id
      and l.teacher_id = p_uid
  );
$$;
revoke all on function public.is_lesson_teacher(uuid, uuid) from public;

-- 7) POLICIES

-- PROFILES
drop policy if exists profiles_select_own on public.profiles;
drop policy if exists profiles_select_teachers_students on public.profiles;
drop policy if exists profiles_insert_own on public.profiles;
drop policy if exists profiles_update_own on public.profiles;

create policy profiles_select_own
  on public.profiles for select
  using (auth.uid() = id);

create policy profiles_select_teachers_students
  on public.profiles for select
  using (
    auth.uid() = id
    or exists (
      select 1
      from public.lesson_enrollments le
      join public.lessons l on l.id = le.lesson_id
      where le.student_id = profiles.id
        and l.teacher_id = auth.uid()
    )
  );

create policy profiles_insert_own
  on public.profiles for insert
  with check (auth.uid() = id);

create policy profiles_update_own
  on public.profiles for update
  using (auth.uid() = id);

-- LESSONS
drop policy if exists lessons_select_all_authenticated on public.lessons;
drop policy if exists lessons_select_own_or_enrolled   on public.lessons;
drop policy if exists lessons_insert_own               on public.lessons;
drop policy if exists lessons_update_own               on public.lessons;
drop policy if exists lessons_delete_own               on public.lessons;

create policy lessons_select_own_or_enrolled
  on public.lessons for select
  using (
    auth.uid() = teacher_id
    or public.is_enrolled(id, auth.uid())
  );

create policy lessons_select_all_authenticated
  on public.lessons for select
  using (auth.uid() is not null);

create policy lessons_insert_own
  on public.lessons for insert
  with check (auth.uid() = teacher_id);

create policy lessons_update_own
  on public.lessons for update
  using (auth.uid() = teacher_id);

create policy lessons_delete_own
  on public.lessons for delete
  using (auth.uid() = teacher_id);

-- LESSON_ENROLLMENTS
drop policy if exists le_select_visible on public.lesson_enrollments;
drop policy if exists le_insert_allowed on public.lesson_enrollments;

create policy le_select_visible
  on public.lesson_enrollments for select
  using (
    auth.uid() = student_id
    or public.is_lesson_teacher(lesson_id, auth.uid())
  );

create policy le_insert_allowed
  on public.lesson_enrollments for insert
  with check (
    public.is_lesson_teacher(lesson_id, auth.uid())
    or auth.uid() = student_id
  );

-- FLASHCARDS
drop policy if exists flashcards_select_allowed on public.flashcards;
drop policy if exists flashcards_insert_teacher on public.flashcards;
drop policy if exists flashcards_update_teacher on public.flashcards;
drop policy if exists flashcards_delete_teacher on public.flashcards;

create policy flashcards_select_allowed
  on public.flashcards for select
  using (
    exists (
      select 1
      from public.lessons l
      where l.id = flashcards.lesson_id
        and (auth.uid() = l.teacher_id or public.is_enrolled(l.id, auth.uid()))
    )
  );

create policy flashcards_insert_teacher
  on public.flashcards for insert
  with check (
    exists (
      select 1 from public.lessons l
      where l.id = flashcards.lesson_id
        and auth.uid() = l.teacher_id
    )
  );

create policy flashcards_update_teacher
  on public.flashcards for update
  using (
    exists (
      select 1 from public.lessons l
      where l.id = flashcards.lesson_id
        and auth.uid() = l.teacher_id
    )
  );

create policy flashcards_delete_teacher
  on public.flashcards for delete
  using (
    exists (
      select 1 from public.lessons l
      where l.id = flashcards.lesson_id
        and auth.uid() = l.teacher_id
    )
  );

-- QUESTIONS
drop policy if exists questions_select_allowed on public.questions;
drop policy if exists questions_insert_teacher on public.questions;
drop policy if exists questions_update_teacher on public.questions;
drop policy if exists questions_delete_teacher on public.questions;

create policy questions_select_allowed
  on public.questions for select
  using (
    exists (
      select 1
      from public.lessons l
      where l.id = questions.lesson_id
        and (auth.uid() = l.teacher_id or public.is_enrolled(l.id, auth.uid()))
    )
  );

create policy questions_insert_teacher
  on public.questions for insert
  with check (
    exists (
      select 1 from public.lessons l
      where l.id = questions.lesson_id
        and auth.uid() = l.teacher_id
    )
  );

create policy questions_update_teacher
  on public.questions for update
  using (
    exists (
      select 1 from public.lessons l
      where l.id = questions.lesson_id
        and auth.uid() = l.teacher_id
    )
  );

create policy questions_delete_teacher
  on public.questions for delete
  using (
    exists (
      select 1 from public.lessons l
      where l.id = questions.lesson_id
        and auth.uid() = l.teacher_id
    )
  );

-- STUDENT_RESPONSES
drop policy if exists sr_insert_own on public.student_responses;
drop policy if exists sr_select_own_or_teacher on public.student_responses;

create policy sr_insert_own
  on public.student_responses for insert
  with check (auth.uid() = student_id);

create policy sr_select_own_or_teacher
  on public.student_responses for select
  using (
    auth.uid() = student_id
    or exists (
      select 1 from public.lessons l
      where l.id = student_responses.lesson_id
        and auth.uid() = l.teacher_id
    )
  );

-- LESSON_ATTEMPTS
drop policy if exists la_insert_own on public.lesson_attempts;
drop policy if exists la_update_own on public.lesson_attempts;
drop policy if exists la_select_visible on public.lesson_attempts;

create policy la_insert_own
  on public.lesson_attempts for insert
  with check (auth.uid() = student_id);

create policy la_update_own
  on public.lesson_attempts for update
  using (auth.uid() = student_id);

create policy la_select_visible
  on public.lesson_attempts for select
  using (
    auth.uid() = student_id
    or exists (
      select 1 from public.lessons l
      where l.id = lesson_attempts.lesson_id
        and auth.uid() = l.teacher_id
    )
  );

-- -------------------------------------------------
-- C) (OPTIONAL) QUICK VERIFY — comment-out in prod
-- -------------------------------------------------
-- -- Kiểm tra trigger
-- select t.tgname, n.nspname as table_schema, c.relname as table_name
-- from pg_trigger t
-- join pg_class c on t.tgrelid = c.oid
-- join pg_namespace n on c.relnamespace = n.oid
-- where t.tgname in ('on_auth_user_created','trg_lessons_set_updated_at');
--
-- -- Kiểm tra function
-- select proname, pg_get_functiondef(p.oid)
-- from pg_proc p
-- join pg_namespace n on p.pronamespace = n.oid
-- where n.nspname = 'public'
--   and proname in ('handle_new_user_profile','is_enrolled','is_lesson_teacher');
