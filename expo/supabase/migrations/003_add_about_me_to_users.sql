ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS about_me TEXT DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_users_about_me ON public.users (id);
