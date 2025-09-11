-- Nexus Market EDU - Sistema Multi-tenant Completo
-- Criação das tabelas principais com RLS

-- 1. Enum para status de eventos
CREATE TYPE public.event_status AS ENUM ('draft', 'published', 'cancelled');

-- 2. Enum para tipos de notificações
CREATE TYPE public.notification_type AS ENUM ('sale', 'course_complete', 'affiliate_signup', 'payment_failed', 'system');

-- 3. Tabela de perfis de usuários (já existe, mas vamos garantir que está completa)
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email text NOT NULL,
    full_name text,
    role text DEFAULT 'seller',
    phone text,
    cpf text,
    address jsonb DEFAULT '{}',
    avatar_url text,
    is_verified boolean DEFAULT false,
    phone_verified boolean DEFAULT false,
    email_verified boolean DEFAULT false,
    cpf_verified boolean DEFAULT false,
    data_consent_given boolean DEFAULT false,
    data_consent_date timestamp with time zone,
    marketing_consent boolean DEFAULT false,
    data_processing_consent boolean DEFAULT false,
    last_login_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    whatsapp_number text,
    birth_date date,
    gender text,
    
    PRIMARY KEY (id)
);

-- 4. Tabela de lojas (multi-tenant core)
CREATE TABLE IF NOT EXISTS public.stores (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name text NOT NULL,
    slug text NOT NULL UNIQUE,
    description text,
    logo_url text,
    banner_url text,
    theme jsonb DEFAULT '{}',
    custom_domain text,
    is_active boolean DEFAULT true,
    settings jsonb DEFAULT '{}',
    social_links jsonb DEFAULT '{}',
    contact_info jsonb DEFAULT '{}',
    seo_config jsonb DEFAULT '{}',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    deleted_at timestamp with time zone,
    deleted_by uuid REFERENCES public.profiles(id)
);

-- 5. Tabela de categorias de produtos
CREATE TABLE IF NOT EXISTS public.categories (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    slug text NOT NULL UNIQUE,
    description text,
    icon text,
    parent_id uuid REFERENCES public.categories(id),
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);

-- 6. Tabela de produtos (digital, cursos, e-books, etc)
CREATE TABLE IF NOT EXISTS public.products (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    category_id uuid REFERENCES public.categories(id),
    title text NOT NULL,
    slug text NOT NULL,
    description text,
    thumbnail_url text,
    price_cents integer NOT NULL DEFAULT 0,
    compare_price_cents integer,
    type text NOT NULL DEFAULT 'digital', -- digital, curso, ebook, servico, assinatura
    status text DEFAULT 'draft', -- draft, published, archived
    featured boolean DEFAULT false,
    total_lessons integer DEFAULT 0,
    total_duration_minutes integer DEFAULT 0,
    level text DEFAULT 'iniciante', -- iniciante, intermediario, avancado
    certificate_enabled boolean DEFAULT false,
    tags text[] DEFAULT '{}',
    requirements text[] DEFAULT '{}',
    what_you_learn text[] DEFAULT '{}',
    seo_config jsonb DEFAULT '{}',
    settings jsonb DEFAULT '{}',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    deleted_at timestamp with time zone,
    deleted_by uuid REFERENCES public.profiles(id),
    
    UNIQUE(store_id, slug)
);

-- 7. Módulos de cursos
CREATE TABLE IF NOT EXISTS public.modules (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    sort_order integer NOT NULL DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);

-- 8. Aulas/Lições
CREATE TABLE IF NOT EXISTS public.lessons (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    module_id uuid REFERENCES public.modules(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    content text,
    video_url text,
    video_duration_seconds integer,
    resources jsonb DEFAULT '{}',
    is_preview boolean DEFAULT false,
    sort_order integer NOT NULL DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);

-- 9. Progresso das lições
CREATE TABLE IF NOT EXISTS public.lesson_progress (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    lesson_id uuid REFERENCES public.lessons(id) ON DELETE CASCADE,
    completed boolean DEFAULT false,
    progress_seconds integer DEFAULT 0,
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    
    UNIQUE(user_id, lesson_id)
);

-- 10. Pedidos
CREATE TABLE IF NOT EXISTS public.orders (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id),
    status text DEFAULT 'pending',
    payment_status text DEFAULT 'pending',
    total_cents integer NOT NULL,
    currency text DEFAULT 'BRL',
    payment_method text,
    payment_provider text DEFAULT 'stripe',
    stripe_payment_intent_id text,
    gateway_payment_id text,
    gateway_session_id text,
    external_order_id text,
    customer_name text,
    customer_email text,
    customer_phone text,
    shipping_address jsonb,
    metadata jsonb DEFAULT '{}',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 11. Itens do pedido
CREATE TABLE IF NOT EXISTS public.order_items (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id uuid REFERENCES public.products(id),
    quantity integer NOT NULL DEFAULT 1,
    unit_price_cents integer NOT NULL,
    seller_share_cents integer DEFAULT 0,
    platform_share_cents integer DEFAULT 0,
    affiliate_share_cents integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);

-- 12. Licenças de produtos (acesso)
CREATE TABLE IF NOT EXISTS public.licenses (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id),
    product_id uuid REFERENCES public.products(id),
    order_id uuid REFERENCES public.orders(id),
    is_active boolean DEFAULT true,
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    
    UNIQUE(user_id, product_id)
);

-- 13. Sistema de afiliados
CREATE TABLE IF NOT EXISTS public.affiliates (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id),
    store_id uuid REFERENCES public.stores(id),
    affiliate_code text NOT NULL UNIQUE,
    status text DEFAULT 'pending', -- pending, approved, rejected, suspended
    default_commission_pct numeric DEFAULT 20.00,
    created_at timestamp with time zone DEFAULT now()
);

-- 14. Comissões por produto
CREATE TABLE IF NOT EXISTS public.product_commissions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id uuid REFERENCES public.products(id),
    affiliate_id uuid REFERENCES public.affiliates(id),
    commission_pct numeric NOT NULL
);

-- 15. Cupons de desconto
CREATE TABLE IF NOT EXISTS public.coupons (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id uuid REFERENCES public.stores(id),
    code text NOT NULL UNIQUE,
    name text NOT NULL,
    description text,
    discount_type text NOT NULL, -- percentage, fixed
    discount_value integer NOT NULL,
    minimum_order_cents integer DEFAULT 0,
    maximum_discount_cents integer,
    usage_limit integer,
    used_count integer DEFAULT 0,
    valid_from timestamp with time zone DEFAULT now(),
    valid_until timestamp with time zone,
    is_active boolean DEFAULT true,
    product_ids uuid[] DEFAULT '{}',
    created_by uuid REFERENCES public.profiles(id),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 16. Uso de cupons
CREATE TABLE IF NOT EXISTS public.coupon_usage (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    coupon_id uuid NOT NULL REFERENCES public.coupons(id),
    user_id uuid REFERENCES public.profiles(id),
    order_id uuid REFERENCES public.orders(id),
    discount_applied_cents integer NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- 17. Configuração da área de membros
CREATE TABLE IF NOT EXISTS public.member_area_configs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id uuid NOT NULL REFERENCES public.stores(id),
    primary_color text DEFAULT '#dc2626',
    secondary_color text DEFAULT '#1f2937',
    custom_logo_url text,
    welcome_message text,
    welcome_video_url text,
    show_progress_tracking boolean DEFAULT true,
    show_other_products boolean DEFAULT true,
    member_resources jsonb DEFAULT '[]',
    exclusive_content jsonb DEFAULT '[]',
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    
    UNIQUE(store_id)
);

-- 18. Conteúdo exclusivo para membros
CREATE TABLE IF NOT EXISTS public.member_exclusive_content (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id uuid NOT NULL REFERENCES public.stores(id),
    title text NOT NULL,
    description text,
    content_type text NOT NULL, -- text, video, download, link
    content text NOT NULL,
    requires_product_ids uuid[] DEFAULT '{}',
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 19. Sistema de gamificação - Leaderboards
CREATE TABLE IF NOT EXISTS public.leaderboards (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id uuid NOT NULL REFERENCES public.stores(id),
    user_id uuid NOT NULL REFERENCES public.profiles(id),
    points integer NOT NULL DEFAULT 0,
    rank integer NOT NULL DEFAULT 1,
    period text NOT NULL DEFAULT 'monthly', -- daily, weekly, monthly, yearly
    created_at timestamp with time zone DEFAULT now()
);

-- 20. Sessões de checkout (para Stripe)
CREATE TABLE IF NOT EXISTS public.checkout_sessions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id),
    stripe_session_id text UNIQUE,
    status text DEFAULT 'pending',
    total_amount_cents integer NOT NULL,
    products jsonb NOT NULL,
    success_url text,
    cancel_url text,
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_area_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_exclusive_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkout_sessions ENABLE ROW LEVEL SECURITY;