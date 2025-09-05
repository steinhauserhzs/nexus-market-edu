-- Gamificação: Sistema de Pontos e Badges
CREATE TYPE public.achievement_type AS ENUM ('video_completion', 'course_completion', 'login_streak', 'community_participation', 'content_creation');

CREATE TABLE public.user_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  store_id UUID NOT NULL,
  total_points INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  experience INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  store_id UUID NOT NULL,
  achievement_type achievement_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  points_awarded INTEGER NOT NULL DEFAULT 0,
  badge_icon TEXT,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.leaderboards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL,
  period TEXT NOT NULL DEFAULT 'monthly', -- weekly, monthly, yearly, all_time
  user_id UUID NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  rank INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Sistema de Notificações
CREATE TYPE public.notification_type AS ENUM ('new_content', 'achievement', 'course_update', 'community_message', 'system_announcement');

CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  store_id UUID,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type notification_type NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Sistema de Comunidade
CREATE TABLE public.community_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL,
  user_id UUID NOT NULL,
  content_id UUID, -- Link to product/exclusive content
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  likes_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.community_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL,
  user_id UUID NOT NULL,
  parent_id UUID, -- For nested comments
  content TEXT NOT NULL,
  likes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.community_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  post_id UUID,
  comment_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, post_id),
  UNIQUE(user_id, comment_id)
);

-- Chat em Tempo Real
CREATE TABLE public.chat_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_private BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text', -- text, image, file, system
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.chat_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL,
  user_id UUID NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_seen TIMESTAMP WITH TIME ZONE,
  UNIQUE(room_id, user_id)
);

-- Editor Visual: Templates e Componentes
CREATE TABLE public.member_area_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  preview_image TEXT,
  layout_config JSONB NOT NULL DEFAULT '{}',
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_area_templates ENABLE ROW LEVEL SECURITY;

-- User Points Policies
CREATE POLICY "Users can view own points" ON public.user_points FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view store leaderboard" ON public.user_points FOR SELECT USING (
  EXISTS (SELECT 1 FROM licenses l JOIN products p ON p.id = l.product_id WHERE l.user_id = auth.uid() AND p.store_id = user_points.store_id AND l.is_active = true)
);

-- Achievements Policies
CREATE POLICY "Users can view own achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view store achievements" ON public.user_achievements FOR SELECT USING (
  EXISTS (SELECT 1 FROM licenses l JOIN products p ON p.id = l.product_id WHERE l.user_id = auth.uid() AND p.store_id = user_achievements.store_id AND l.is_active = true)
);

-- Leaderboard Policies
CREATE POLICY "Members can view store leaderboard" ON public.leaderboards FOR SELECT USING (
  EXISTS (SELECT 1 FROM licenses l JOIN products p ON p.id = l.product_id WHERE l.user_id = auth.uid() AND p.store_id = leaderboards.store_id AND l.is_active = true)
);

-- Notifications Policies
CREATE POLICY "Users can manage own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id);

-- Community Posts Policies
CREATE POLICY "Members can view store posts" ON public.community_posts FOR SELECT USING (
  EXISTS (SELECT 1 FROM licenses l JOIN products p ON p.id = l.product_id WHERE l.user_id = auth.uid() AND p.store_id = community_posts.store_id AND l.is_active = true)
);
CREATE POLICY "Members can create posts" ON public.community_posts FOR INSERT WITH CHECK (
  auth.uid() = user_id AND EXISTS (SELECT 1 FROM licenses l JOIN products p ON p.id = l.product_id WHERE l.user_id = auth.uid() AND p.store_id = community_posts.store_id AND l.is_active = true)
);
CREATE POLICY "Users can update own posts" ON public.community_posts FOR UPDATE USING (auth.uid() = user_id);

-- Community Comments Policies
CREATE POLICY "Members can view comments" ON public.community_comments FOR SELECT USING (
  EXISTS (SELECT 1 FROM community_posts cp JOIN licenses l ON EXISTS(SELECT 1 FROM products p WHERE p.store_id = cp.store_id AND p.id = l.product_id) WHERE cp.id = community_comments.post_id AND l.user_id = auth.uid() AND l.is_active = true)
);
CREATE POLICY "Members can create comments" ON public.community_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON public.community_comments FOR UPDATE USING (auth.uid() = user_id);

-- Community Likes Policies
CREATE POLICY "Members can manage likes" ON public.community_likes FOR ALL USING (auth.uid() = user_id);

-- Chat Policies
CREATE POLICY "Members can view store chat rooms" ON public.chat_rooms FOR SELECT USING (
  EXISTS (SELECT 1 FROM licenses l JOIN products p ON p.id = l.product_id WHERE l.user_id = auth.uid() AND p.store_id = chat_rooms.store_id AND l.is_active = true)
);
CREATE POLICY "Members can view messages in joined rooms" ON public.chat_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM chat_participants cp WHERE cp.room_id = chat_messages.room_id AND cp.user_id = auth.uid())
);
CREATE POLICY "Members can send messages" ON public.chat_messages FOR INSERT WITH CHECK (
  auth.uid() = user_id AND EXISTS (SELECT 1 FROM chat_participants cp WHERE cp.room_id = chat_messages.room_id AND cp.user_id = auth.uid())
);
CREATE POLICY "Members can manage own participation" ON public.chat_participants FOR ALL USING (auth.uid() = user_id);

-- Templates Policies
CREATE POLICY "Anyone can view templates" ON public.member_area_templates FOR SELECT USING (true);

-- Triggers for timestamps
CREATE TRIGGER update_user_points_updated_at BEFORE UPDATE ON public.user_points FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_community_posts_updated_at BEFORE UPDATE ON public.community_posts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_community_comments_updated_at BEFORE UPDATE ON public.community_comments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();