-- Fix all remaining functions to have proper search_path settings for security
-- This addresses the 0011_function_search_path_mutable linter warning

-- Update all functions that don't have SET search_path = public
CREATE OR REPLACE FUNCTION public.update_member_area_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_first_user_as_admin()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  first_user_id uuid;
BEGIN
  -- Pega o primeiro usuário cadastrado que não tem role definida
  SELECT id INTO first_user_id 
  FROM profiles 
  WHERE role IS NULL 
  ORDER BY created_at ASC 
  LIMIT 1;
  
  -- Se encontrou um usuário, define como admin
  IF first_user_id IS NOT NULL THEN
    UPDATE profiles 
    SET role = 'admin' 
    WHERE id = first_user_id;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_comments_count(post_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.community_posts 
  SET comments_count = comments_count + 1, updated_at = now()
  WHERE id = post_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_likes_count_post(post_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.community_posts 
  SET likes_count = likes_count + 1, updated_at = now()
  WHERE id = post_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.decrement_likes_count_post(post_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.community_posts 
  SET likes_count = GREATEST(0, likes_count - 1), updated_at = now()
  WHERE id = post_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_likes_count_comment(comment_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.community_comments 
  SET likes_count = likes_count + 1, updated_at = now()
  WHERE id = comment_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.decrement_likes_count_comment(comment_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.community_comments 
  SET likes_count = GREATEST(0, likes_count - 1), updated_at = now()
  WHERE id = comment_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_code_reviews_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  new.updated_at = now();
  return new;
END;
$$;

CREATE OR REPLACE FUNCTION public.cleanup_old_upload_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.upload_sessions 
  WHERE created_at < (now() - INTERVAL '24 hours') 
  AND status != 'completed';
END;
$$;

CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.rate_limits 
  WHERE created_at < (now() - INTERVAL '24 hours');
END;
$$;