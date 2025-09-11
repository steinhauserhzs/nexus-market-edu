-- Nexus Market EDU - Políticas RLS Multi-tenant

-- 1. Políticas para profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- 2. Políticas para stores (multi-tenant core)
DROP POLICY IF EXISTS "Store owners can manage their stores" ON public.stores;
DROP POLICY IF EXISTS "Anyone can view active stores" ON public.stores;

CREATE POLICY "Store owners can manage their stores" 
ON public.stores FOR ALL 
USING (owner_id = auth.uid());

CREATE POLICY "Anyone can view active stores" 
ON public.stores FOR SELECT 
USING (is_active = true AND deleted_at IS NULL);

-- 3. Políticas para produtos 
DROP POLICY IF EXISTS "Store owners can manage their products" ON public.products;
DROP POLICY IF EXISTS "Anyone can view published products" ON public.products;

CREATE POLICY "Store owners can manage their products" 
ON public.products FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.stores s 
  WHERE s.id = products.store_id AND s.owner_id = auth.uid()
));

CREATE POLICY "Anyone can view published products" 
ON public.products FOR SELECT 
USING (status = 'published' AND deleted_at IS NULL);

-- 4. Políticas para módulos
DROP POLICY IF EXISTS "Store owners can manage their modules" ON public.modules;
DROP POLICY IF EXISTS "Anyone can view published product modules" ON public.modules;

CREATE POLICY "Store owners can manage their modules" 
ON public.modules FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.products p 
  JOIN public.stores s ON s.id = p.store_id 
  WHERE p.id = modules.product_id AND s.owner_id = auth.uid()
));

CREATE POLICY "Anyone can view published product modules" 
ON public.modules FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.products p 
  WHERE p.id = modules.product_id AND p.status = 'published'
));

-- 5. Políticas para lessons
DROP POLICY IF EXISTS "Store owners can manage their lessons" ON public.lessons;
DROP POLICY IF EXISTS "Licensed users can view all lessons" ON public.lessons;
DROP POLICY IF EXISTS "Anyone can view preview lessons" ON public.lessons;

CREATE POLICY "Store owners can manage their lessons" 
ON public.lessons FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.modules m 
  JOIN public.products p ON p.id = m.product_id 
  JOIN public.stores s ON s.id = p.store_id 
  WHERE m.id = lessons.module_id AND s.owner_id = auth.uid()
));

CREATE POLICY "Licensed users can view all lessons" 
ON public.lessons FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.modules m 
  JOIN public.products p ON p.id = m.product_id 
  JOIN public.licenses l ON l.product_id = p.id 
  WHERE m.id = lessons.module_id AND l.user_id = auth.uid() AND l.is_active = true
));

CREATE POLICY "Anyone can view preview lessons" 
ON public.lessons FOR SELECT 
USING (is_preview = true AND EXISTS (
  SELECT 1 FROM public.modules m 
  JOIN public.products p ON p.id = m.product_id 
  WHERE m.id = lessons.module_id AND p.status = 'published'
));

-- 6. Políticas para lesson_progress
DROP POLICY IF EXISTS "Users can manage own lesson progress" ON public.lesson_progress;

CREATE POLICY "Users can manage own lesson progress" 
ON public.lesson_progress FOR ALL 
USING (auth.uid() = user_id);

-- 7. Políticas para orders
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create own orders" ON public.orders;
DROP POLICY IF EXISTS "Store owners can view orders for their products" ON public.orders;

CREATE POLICY "Users can view own orders" 
ON public.orders FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders" 
ON public.orders FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Store owners can view orders for their products" 
ON public.orders FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.order_items oi 
  JOIN public.products p ON p.id = oi.product_id 
  JOIN public.stores s ON s.id = p.store_id 
  WHERE oi.order_id = orders.id AND s.owner_id = auth.uid()
));

-- 8. Políticas para licenses
DROP POLICY IF EXISTS "Users can view own licenses" ON public.licenses;

CREATE POLICY "Users can view own licenses" 
ON public.licenses FOR SELECT 
USING (auth.uid() = user_id);

-- 9. Políticas para affiliates
DROP POLICY IF EXISTS "Users can view own affiliates" ON public.affiliates;
DROP POLICY IF EXISTS "Users can request affiliate status" ON public.affiliates;

CREATE POLICY "Users can view own affiliates" 
ON public.affiliates FOR SELECT 
USING (auth.uid() = user_id OR EXISTS (
  SELECT 1 FROM public.stores s 
  WHERE s.id = affiliates.store_id AND s.owner_id = auth.uid()
));

CREATE POLICY "Users can request affiliate status" 
ON public.affiliates FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 10. Políticas para coupons
DROP POLICY IF EXISTS "Store owners can manage their coupons" ON public.coupons;
DROP POLICY IF EXISTS "Anyone can view active coupons for validation" ON public.coupons;

CREATE POLICY "Store owners can manage their coupons" 
ON public.coupons FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.stores s 
  WHERE s.id = coupons.store_id AND s.owner_id = auth.uid()
));

CREATE POLICY "Anyone can view active coupons for validation" 
ON public.coupons FOR SELECT 
USING (is_active = true AND now() >= valid_from AND now() <= COALESCE(valid_until, now() + interval '100 years'));

-- 11. Políticas para member_area_configs
DROP POLICY IF EXISTS "Store owners can manage their member area configs" ON public.member_area_configs;
DROP POLICY IF EXISTS "Members can view member area configs" ON public.member_area_configs;

CREATE POLICY "Store owners can manage their member area configs" 
ON public.member_area_configs FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.stores s 
  WHERE s.id = member_area_configs.store_id AND s.owner_id = auth.uid()
));

CREATE POLICY "Members can view member area configs" 
ON public.member_area_configs FOR SELECT 
USING (is_active = true AND EXISTS (
  SELECT 1 FROM public.licenses l 
  JOIN public.products p ON p.id = l.product_id 
  WHERE p.store_id = member_area_configs.store_id AND l.user_id = auth.uid() AND l.is_active = true
));

-- 12. Políticas para checkout_sessions
DROP POLICY IF EXISTS "Users can create own checkout sessions" ON public.checkout_sessions;
DROP POLICY IF EXISTS "Users can view own checkout sessions" ON public.checkout_sessions;
DROP POLICY IF EXISTS "System can update checkout sessions" ON public.checkout_sessions;

CREATE POLICY "Users can create own checkout sessions" 
ON public.checkout_sessions FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view own checkout sessions" 
ON public.checkout_sessions FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "System can update checkout sessions" 
ON public.checkout_sessions FOR UPDATE 
USING (true);

-- Inserir categorias básicas
INSERT INTO public.categories (name, slug, description, icon) VALUES
('Tecnologia', 'tecnologia', 'Cursos de programação, desenvolvimento e tecnologia', '💻'),
('Marketing', 'marketing', 'Marketing digital, vendas e publicidade', '📈'),
('Design', 'design', 'Design gráfico, UX/UI e criatividade', '🎨'),
('Negócios', 'negocios', 'Empreendedorismo, gestão e finanças', '💼'),
('Educação', 'educacao', 'Cursos educacionais e acadêmicos', '📚'),
('Saúde', 'saude', 'Bem-estar, fitness e saúde', '🏥'),
('Música', 'musica', 'Instrumentos, produção musical e teoria', '🎵'),
('Idiomas', 'idiomas', 'Aprendizado de idiomas', '🌍')
ON CONFLICT (slug) DO NOTHING;