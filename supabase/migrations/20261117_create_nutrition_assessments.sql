-- FoodBridge AI - Nutrition Assessments Table & RLS Policies Migration

create table if not exists public.nutrition_assessments (
  user_id uuid references auth.users(id) on delete cascade primary key,
  
  -- Step 1: Personal Details
  gender text not null,
  age integer not null check (age >= 12 and age <= 120),
  height_unit text not null default 'cm',
  height_cm numeric(5, 2),
  height_feet integer,
  height_inches integer,
  weight_kg numeric(5, 2) not null,
  target_weight_kg numeric(5, 2),

  -- Step 2: Fitness Goals & Activity
  primary_goal text not null,
  activity_level text not null,
  weekly_workout_days integer default 3,

  -- Step 3: Food Preferences & Allergies
  dietary_preferences text[] default '{}'::text[],
  allergies text[] default '{}'::text[],
  disliked_foods text,

  -- Step 4: Health Requirements
  health_conditions text[] default '{}'::text[],
  medications_notes text,
  water_intake_goal_liters numeric(3, 1) default 2.5,

  -- Step 5: Meal Preferences & Budget
  meals_per_day text not null,
  cooking_time_available text not null,
  weekly_grocery_budget text not null,
  preferred_cuisines text[] default '{}'::text[],

  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS) on nutrition_assessments
alter table public.nutrition_assessments enable row level security;

-- Drop existing policies on nutrition_assessments if they exist (idempotent & safe)
drop policy if exists "Users can view own nutrition assessment" on public.nutrition_assessments;
drop policy if exists "Users can insert own nutrition assessment" on public.nutrition_assessments;
drop policy if exists "Users can update own nutrition assessment" on public.nutrition_assessments;

-- 1. SELECT Policy: User can view only their own assessment
create policy "Users can view own nutrition assessment"
  on public.nutrition_assessments
  for select
  using (auth.uid() = user_id);

-- 2. INSERT Policy: User can insert only their own assessment
create policy "Users can insert own nutrition assessment"
  on public.nutrition_assessments
  for insert
  with check (auth.uid() = user_id);

-- 3. UPDATE Policy: User can update only their own assessment
create policy "Users can update own nutrition assessment"
  on public.nutrition_assessments
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
