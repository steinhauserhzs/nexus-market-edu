# NEXUS MARKET - DETALHAMENTO COMPLETO DO SISTEMA

## 📋 VISÃO GERAL EXECUTIVA

**Nexus Market** é uma plataforma completa de e-commerce educacional com foco em streaming de conteúdo, inspirada na experiência Netflix. O sistema combina marketplace digital, área de membros, gamificação, comunidade e ferramentas avançadas de IA para criação e análise de lojas.

### 🎯 PROPÓSITO PRINCIPAL
- **Marketplace Educacional**: Venda de cursos, templates, produtos digitais e físicos
- **Streaming de Educação**: Interface Netflix-like para consumo de conteúdo educacional
- **Comunidade**: Hub social com posts, comentários, likes e chat em tempo real
- **Gamificação**: Sistema de pontos, conquistas e rankings
- **Área de Membros**: Conteúdo exclusivo e personalizado
- **AI-Powered**: Análise inteligente de código e otimização de lojas

---

## 🏗️ ARQUITETURA TÉCNICA

### **Stack Tecnológico**
- **Frontend**: React 18.3.1 + TypeScript 5.8.3
- **Build Tool**: Vite 5.4.19
- **Styling**: Tailwind CSS 3.4.17 + Radix UI
- **Roteamento**: React Router DOM 6.30.1
- **Estado Global**: React Context API + TanStack Query 5.83.0
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Autenticação**: Supabase Auth + Google OAuth
- **Storage**: Supabase Storage (Buckets públicos)
- **Pagamentos**: Stripe Integration
- **AI**: OpenAI API (GPT-5, GPT-4.1)

### **Design System**
```css
/* Netflix Dark Theme System - Sempre escuro */
--background: 0 0% 8%;           /* Fundo principal escuro */
--foreground: 0 0% 95%;          /* Texto principal claro */
--primary: 0 75% 60%;            /* Netflix Red */
--accent: 0 75% 60%;             /* Vermelho de destaque */
--card: 0 0% 12%;                /* Cards escuros */
--border: 0 0% 20%;              /* Bordas sutis */
```

### **Responsividade**
- **Mobile First**: Design otimizado para dispositivos móveis
- **Breakpoints**: xs(375px), sm(640px), md(768px), lg(1024px), xl(1280px), 2xl(1536px)
- **PWA Ready**: Instalação como app nativo com service workers
- **Touch Friendly**: Targets de toque de 48px mínimo
- **Safe Areas**: Suporte a notch e áreas seguras de dispositivos

---

## 🗄️ ESTRUTURA DO BANCO DE DADOS

### **Tabelas Principais**

#### **profiles** - Perfis de Usuário
```sql
- id (UUID, PK, ref: auth.users)
- email (STRING, UNIQUE)
- full_name (STRING)
- role (ENUM: user, seller, admin)
- phone, cpf, birth_date, gender, profession
- address_line1, city, state, postal_code, country
- preferred_language, timezone
- email_notifications, sms_notifications, marketing_emails
- phone_verified, cpf_verified, email_verified
- avatar_url, bio, linkedin_url, website_url
- is_verified, last_login_at, login_method
```

#### **stores** - Lojas dos Vendedores
```sql
- id (UUID, PK)
- name (STRING)
- slug (STRING, UNIQUE)
- description (TEXT)
- owner_id (UUID, FK: profiles.id)
- logo_url, banner_url
- custom_domain, theme_config (JSONB)
- is_active, created_at, updated_at
```

#### **products** - Produtos/Cursos
```sql
- id (UUID, PK)
- title (STRING)
- slug (STRING, UNIQUE)
- description (TEXT)
- thumbnail_url (STRING)
- price_cents (INTEGER)
- compare_price_cents (INTEGER)
- type (ENUM: digital, curso, fisico, servico, bundle, assinatura)
- status (ENUM: draft, published, archived)
- store_id (UUID, FK: stores.id)
- category_id (UUID, FK: categories.id)
- featured (BOOLEAN)
- total_lessons, total_duration_minutes
- created_at, updated_at
```

#### **orders** - Pedidos
```sql
- id (UUID, PK)
- user_id (UUID, FK: profiles.id)
- total_cents (INTEGER)
- status (ENUM: pending, completed, cancelled, refunded)
- payment_status (ENUM: pending, paid, failed, refunded)
- payment_provider (STRING)
- gateway_session_id (STRING)
- stripe_payment_intent_id (STRING)
- metadata (JSONB)
- created_at, updated_at
```

#### **licenses** - Licenças/Acessos
```sql
- id (UUID, PK)
- user_id (UUID, FK: profiles.id)
- product_id (UUID, FK: products.id)
- is_active (BOOLEAN)
- expires_at (TIMESTAMP)
- created_at, updated_at
```

### **Gamificação & Comunidade**

#### **user_points** - Pontuação dos Usuários
```sql
- id (UUID, PK)
- user_id (UUID, FK: profiles.id)
- points (INTEGER)
- source (STRING) - origem dos pontos
- description (TEXT)
- created_at
```

#### **community_posts** - Posts da Comunidade
```sql
- id (UUID, PK)
- user_id (UUID, FK: profiles.id)
- title (STRING)
- content (TEXT)
- image_url (STRING)
- likes_count, comments_count (INTEGER)
- created_at, updated_at
```

#### **chat_rooms** - Salas de Chat
```sql
- id (UUID, PK)
- name (STRING)
- description (TEXT)
- is_public (BOOLEAN)
- created_by (UUID, FK: profiles.id)
- created_at, updated_at
```

### **Área de Membros**

#### **member_area_configs** - Configurações da Área de Membros
```sql
- id (UUID, PK)
- store_id (UUID, FK: stores.id)
- welcome_message (TEXT)
- theme_config (JSONB)
- features_enabled (JSONB)
- created_at, updated_at
```

#### **member_exclusive_content** - Conteúdo Exclusivo
```sql
- id (UUID, PK)
- store_id (UUID, FK: stores.id)
- title (STRING)
- description (TEXT)
- content_url (STRING)
- content_type (ENUM: video, audio, document, live)
- access_level (STRING)
- is_featured (BOOLEAN)
- created_at, updated_at
```

### **Segurança & Auditoria**

#### **security_audit** - Auditoria de Segurança
```sql
- id (UUID, PK)
- user_id (UUID, FK: profiles.id)
- action (STRING)
- table_name (STRING)
- record_id (STRING)
- risk_level (ENUM: low, medium, high, critical)
- details (JSONB)
- created_at
```

#### **payment_info_audit** - Auditoria Financeira
```sql
- id (UUID, PK)
- user_id (UUID, FK: profiles.id)
- accessed_user_id (UUID, FK: profiles.id)
- action (STRING)
- success (BOOLEAN)
- error_message (TEXT)
- audit_timestamp
```

---

## 🔐 AUTENTICAÇÃO & AUTORIZAÇÃO

### **Sistema de Roles**
```typescript
type UserRole = 'user' | 'seller' | 'admin';

// user: Comprador básico
// seller: Vendedor com loja
// admin: Administrador do sistema
```

### **Autenticação Suportada**
- **Email/Senha**: Login tradicional
- **Google OAuth**: Login social
- **CPF/Telefone**: Login alternativo (via RPC functions)
- **Multi-factor**: Verificação por SMS/Email

### **Row Level Security (RLS)**
- **Políticas Granulares**: Acesso baseado em user_id
- **Funções Seguras**: RPCs com validação de acesso
- **Auditoria**: Log de todas as operações sensíveis

---

## 🎨 INTERFACE & EXPERIÊNCIA

### **Tema Netflix Dark**
- **Always Dark**: Tema escuro permanente
- **Netflix Red**: Cor primária inspirada no Netflix
- **Cards Elegantes**: Gradientes e sombras sutis
- **Animações Suaves**: Transições de 300ms
- **Glassmorphism**: Backdrop blur em modais

### **Componentes Principais**

#### **NetflixHeader**
```typescript
interface NetflixHeaderProps {
  transparent?: boolean;
  className?: string;
}
// Logo, navegação, busca, carrinho, menu mobile
```

#### **NetflixCard**
```typescript
interface NetflixCardProps {
  id: string;
  title: string;
  thumbnail: string;
  type: "course" | "pack" | "template";
  owned?: boolean;
  price?: number;
  badges?: { functional: string[]; promotional: string[] };
  onClick?: () => void;
  onPlayClick?: () => void;
  onAddClick?: () => void;
}
```

#### **NetflixCarousel**
- **Horizontal Scroll**: Carrossel de produtos
- **Touch Gestures**: Suporte a gestos móveis
- **Lazy Loading**: Carregamento progressivo
- **Seções**: Featured, Popular, Recent, Owned

### **Navegação Mobile**
```typescript
const navItems = [
  { icon: Home, label: "Início", path: "/" },
  { icon: Search, label: "Explorar", path: "/?search=true" },
  { icon: BookOpen, label: "Biblioteca", path: "/biblioteca", requireAuth: true },
  { icon: Store, label: "Dashboard", path: "/dashboard", requireAuth: true },
  { icon: User, label: "Perfil", path: "/perfil" }
];
```

---

## 🛣️ ROTEAMENTO & PÁGINAS

### **Estrutura de Rotas**
```typescript
<Routes>
  <Route path="/" element={<NetflixDashboard />} />
  <Route path="/auth" element={<Auth />} />
  <Route path="/biblioteca" element={<Library />} />
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/perfil" element={<Profile />} />
  <Route path="/carrinho" element={<Checkout />} />
  <Route path="/loja/:slug" element={<Store />} />
  <Route path="/loja/:slug/membros" element={<MemberArea />} />
  <Route path="/loja/:slug/customizar" element={<StoreCustomizer />} />
  <Route path="/produto/:slug" element={<ProductDetails />} />
  <Route path="/admin" element={<AdminDashboard />} />
  <Route path="/netflix" element={<NetflixDashboard />} />
</Routes>
```

### **Lazy Loading**
- **Code Splitting**: Componentes carregados sob demanda
- **Error Boundaries**: Fallbacks para erros de carregamento
- **Loading States**: Esqueletos e spinners

---

## 🚀 EDGE FUNCTIONS (SERVERLESS)

### **create-stripe-checkout**
```typescript
// Criação de sessões de pagamento Stripe
// JWT Required: true
// Integração com webhooks para confirmação
```

### **ai-store-analyzer**
```typescript
// Análise de código usando GPT-5
// Avaliação de: problemas, melhorias, funcionalidades
// Sistema de review inteligente para lojas
```

### **ai-code-reviewer**
```typescript
// Review automatizado de código
// Scores de qualidade, segurança e performance
// Log de reviews no banco de dados
```

### **text-to-speech**
```typescript
// Conversão de texto para áudio
// Integração com ElevenLabs API
// Suporte a múltiplas vozes
```

### **upload-file**
```typescript
// Upload seguro de arquivos
// Validação de tipo e tamanho
// Storage no Supabase buckets
```

### **security-utils**
```typescript
// Utilitários de segurança
// JWT não necessário (público)
// Validações e verificações
```

---

## 📊 SISTEMA DE ANALYTICS

### **Tracking de Eventos**
```typescript
interface AnalyticsEvent {
  event_name: string;
  user_id?: string;
  product_id?: string;
  session_id: string;
  metadata: Record<string, any>;
  timestamp: Date;
}

// Eventos trackados:
// - product_view
// - cart_add
// - cart_remove
// - purchase_complete
// - course_start
// - lesson_complete
```

### **Dashboards**
- **Sales Dashboard**: Vendas, receita, conversão
- **Member Analytics**: Engajamento, retenção, atividade
- **Security Analytics**: Tentativas de acesso, logs de auditoria

---

## 🎮 GAMIFICAÇÃO

### **Sistema de Pontos**
```typescript
interface PointsConfig {
  course_completion: 100;
  lesson_completion: 10;
  community_post: 5;
  community_like: 1;
  daily_login: 2;
  referral: 50;
}
```

### **Conquistas (Achievements)**
```typescript
interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: {
    type: 'points' | 'lessons' | 'courses' | 'days';
    threshold: number;
  };
  reward_points: number;
}
```

### **Leaderboards**
- **Global**: Ranking geral de pontos
- **Monthly**: Ranking mensal
- **Category**: Ranking por categoria de curso

---

## 💡 INTELIGÊNCIA ARTIFICIAL

### **AI Store Analyzer**
```typescript
interface AnalysisResult {
  problems: string[];
  improvements: string[];
  missing_features: string[];
  code_quality_score: number;
  security_score: number;
  performance_score: number;
  suggestions: string[];
}

// Modelos suportados:
// - gpt-5-2025-08-07 (principal)
// - gpt-4.1-2025-04-14 (alternativo)
// - o3-2025-04-16 (reasoning)
```

### **AI Code Reviewer**
```typescript
interface CodeReview {
  overall_score: number;
  issues: {
    type: 'bug' | 'security' | 'performance' | 'style';
    severity: 'low' | 'medium' | 'high' | 'critical';
    line: number;
    description: string;
    suggestion: string;
  }[];
  summary: string;
}
```

---

## 🏪 SISTEMA DE LOJAS

### **Store Customizer**
- **Page Builder**: Construtor visual de páginas
- **Theme Builder**: Personalização de temas
- **Asset Manager**: Gerenciamento de mídia
- **Component System**: Componentes reutilizáveis

### **Member Areas**
```typescript
interface MemberAreaConfig {
  welcome_message: string;
  theme: {
    primary_color: string;
    secondary_color: string;
    logo_url: string;
    background_image: string;
  };
  features: {
    community_enabled: boolean;
    chat_enabled: boolean;
    downloads_enabled: boolean;
    certificates_enabled: boolean;
  };
  content_organization: {
    categories: string[];
    access_levels: string[];
  };
}
```

---

## 💳 SISTEMA DE PAGAMENTOS

### **Stripe Integration**
```typescript
interface PaymentSession {
  session_id: string;
  user_id: string;
  products: ProductItem[];
  total_amount_cents: number;
  status: 'pending' | 'completed' | 'expired';
  success_url: string;
  cancel_url: string;
  metadata: Record<string, any>;
}
```

### **Seller Payment Info**
```sql
create table public.seller_payment_info (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id),
  pix_key text,
  stripe_account_id text,
  bank_account jsonb,
  verified boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
```

### **Transaction Processing**
```typescript
interface Transaction {
  amount_cents: number;
  platform_fee_cents: number; // 5% + R$ 0,39
  seller_amount_cents: number;
  status: 'pending' | 'completed' | 'failed';
}
```

---

## 🔒 SEGURANÇA

### **Data Protection**
- **Encryption**: Dados sensíveis criptografados
- **PII Handling**: Tratamento especial de dados pessoais
- **LGPD Compliance**: Conformidade com LGPD
- **Audit Trails**: Rastros de auditoria completos

### **Rate Limiting**
```typescript
interface RateLimit {
  ip_address: string;
  endpoint: string;
  requests_count: number;
  window_start: Date;
  blocked_until?: Date;
}
```

### **Security Scanning**
```typescript
interface SecurityScanResult {
  vulnerabilities: {
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    recommendation: string;
  }[];
  compliance_score: number;
  last_scan: Date;
}
```

---

## 📱 PWA & MOBILE

### **Service Worker**
- **Offline Support**: Funcionalidade básica offline
- **Push Notifications**: Notificações push
- **App Shell**: Shell de aplicativo para loading rápido
- **Background Sync**: Sincronização em background

### **Mobile Optimization**
```css
/* Otimizações mobile específicas */
.mobile-friendly-button {
  min-height: 44px;
  min-width: 44px;
  padding: 0.75rem 1rem;
}

/* Safe areas para notch */
.safe-area-top { padding-top: env(safe-area-inset-top); }
.safe-area-bottom { padding-bottom: env(safe-area-inset-bottom); }
```

---

## 🔧 HOOKS PERSONALIZADOS

### **useAuth**
```typescript
interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{error: any}>;
  signIn: (identifier: string, password: string) => Promise<{error: any}>;
  signInWithGoogle: () => Promise<{error: any}>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  findUserByIdentifier: (identifier: string) => Promise<{user: any; error: any}>;
}
```

### **useCart**
```typescript
interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  addToCart: (product: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (productId: string) => boolean;
}
```

### **useProducts**
```typescript
interface ProductsHook {
  products: Product[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}
```

### **useAIStoreAnalyzer**
```typescript
interface AIAnalyzerHook {
  loading: boolean;
  analyzeCode: (code: string, fileName: string, type: string) => Promise<AnalysisResult>;
  analyzeMultipleFiles: (files: FileAnalysis[]) => Promise<AnalysisResult[]>;
}
```

---

## 🎯 FUNCIONALIDADES PRINCIPAIS

### **🎬 Netflix-Style Dashboard**
- Interface inspirada no Netflix
- Carrosséis horizontais de conteúdo
- Hero section com produto em destaque
- Categorização automática (Featured, Popular, Recent, Owned)
- Badges dinâmicos com rotação inteligente

### **🛒 E-commerce Completo**
- Catálogo de produtos com filtros
- Carrinho de compras persistente
- Checkout integrado com Stripe
- Sistema de licenças automático
- Gestão de inventário

### **👥 Comunidade & Social**
- Posts da comunidade com likes e comentários
- Chat em tempo real
- Sistema de seguidores
- Compartilhamento de conteúdo
- Notificações em tempo real

### **🏆 Gamificação Avançada**
- Sistema de pontos por ações
- Conquistas desbloqueáveis
- Leaderboards competitivos
- Badges e certificados
- Recompensas por engajamento

### **🤖 AI-Powered Features**
- Análise automática de código de lojas
- Sugestões de melhorias inteligentes
- Review automatizado de qualidade
- Otimização de performance
- Detecção de problemas de segurança

### **📚 Área de Membros**
- Conteúdo exclusivo por nível de acesso
- Progressão de cursos
- Certificados de conclusão
- Downloads de materiais
- Comunidade privada

### **🏪 Store Builder**
- Constructor visual de páginas
- Temas personalizáveis
- Gerenciador de assets
- SEO otimizado
- Domínio personalizado

---

## 📈 PERFORMANCE & OTIMIZAÇÃO

### **Bundle Optimization**
```javascript
// Code splitting por rota
const LazyDashboard = lazy(() => import("@/pages/Dashboard"));
const LazyLibrary = lazy(() => import("@/pages/Library"));

// Tree shaking automático
// Carregamento de imagens otimizado
// Service worker para cache
```

### **Database Optimization**
- **Indexes**: Índices otimizados para queries frequentes
- **Connection Pooling**: Pool de conexões do Supabase
- **Query Optimization**: Queries otimizadas com joins eficientes
- **Caching**: Cache de dados em memória com TanStack Query

### **Image Optimization**
```typescript
// Componente OptimizedImage
interface OptimizedImageProps {
  src: string;
  alt: string;
  aspectRatio?: "square" | "video" | "wide";
  className?: string;
  loading?: "lazy" | "eager";
}
```

---

## 🔮 RECURSOS AVANÇADOS

### **Real-time Features**
- Chat em tempo real via Supabase Realtime
- Notificações push instantâneas
- Atualizações de status em tempo real
- Colaboração simultânea

### **AI Integration**
- OpenAI GPT-5 para análise de código
- Text-to-speech com ElevenLabs
- Chatbot inteligente para suporte
- Recomendações personalizadas

### **Multi-tenancy**
- Lojas isoladas por tenant
- Dados segregados por usuário
- Temas personalizados por loja
- Domínios customizados

### **Internationalization**
```typescript
// Suporte multi-idioma preparado
interface I18nConfig {
  defaultLanguage: 'pt-BR';
  supportedLanguages: ['pt-BR', 'en-US', 'es-ES'];
  translations: Record<string, Record<string, string>>;
}
```

---

## 📋 CONFIGURAÇÕES & DEPLOYMENT

### **Environment Variables**
```env
# Supabase
SUPABASE_URL=https://phprhrwiuhalxdifdzgn.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# OpenAI
OPENAI_API_KEY=sk-...

# Stripe
STRIPE_SECRET_KEY=sk_test_...

# ElevenLabs
ELEVENLABS_API_KEY=...

# Resend
RESEND_API_KEY=re_...
```

### **Build Configuration**
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          utils: ['date-fns', 'zod', 'clsx']
        }
      }
    }
  }
});
```

### **Deployment Pipeline**
1. **Development**: Local com Supabase local
2. **Staging**: Preview deployments automáticos
3. **Production**: Deploy automático via Lovable
4. **Monitoring**: Logs e métricas via Supabase Dashboard

---

## 🚨 PONTOS DE ATENÇÃO & LIMITAÇÕES

### **Known Issues**
1. **PanelModeFab**: Botão circular removido por problemas de UX
2. **RLS Policies**: Algumas queries podem precisar de otimização
3. **File Uploads**: Limitado a 50MB por arquivo
4. **Real-time**: Conectividade pode variar por região

### **Performance Considerations**
- **Large Datasets**: Implementar paginação para grandes volumes
- **Image Loading**: Otimizar compressão e formatos
- **Mobile Performance**: Monitorar performance em dispositivos baixo-end
- **Database Queries**: Otimizar queries complexas com JOIN

### **Security Considerations**
- **CORS Configuration**: Configurar adequadamente para produção
- **Rate Limiting**: Implementar para prevenir abuso
- **Data Validation**: Validar todos os inputs do usuário
- **File Uploads**: Validar tipos e tamanhos de arquivo

---

## 📊 MÉTRICAS & KPIs

### **Business Metrics**
- **Revenue**: Receita total e por período
- **Conversion Rate**: Taxa de conversão de visitante para comprador
- **User Retention**: Retenção de usuários em 7, 30, 90 dias
- **Course Completion**: Taxa de conclusão de cursos
- **Community Engagement**: Engajamento na comunidade

### **Technical Metrics**
- **Page Load Time**: Tempo de carregamento < 3s
- **Error Rate**: Taxa de erro < 1%
- **Uptime**: Disponibilidade > 99.9%
- **Database Performance**: Query time < 100ms
- **Bundle Size**: Tamanho do bundle principal < 500KB

---

## 🎉 CONCLUSÃO

O **Nexus Market** é uma plataforma robusta e escalável que combina as melhores práticas de desenvolvimento moderno com funcionalidades inovadoras. O sistema oferece uma experiência única inspirada no Netflix para educação digital, com recursos avançados de IA, gamificação e comunidade.

### **Pontos Fortes**
✅ **Arquitetura Moderna**: React + TypeScript + Supabase
✅ **UX Excepcional**: Interface Netflix-like otimizada
✅ **IA Integrada**: Análise inteligente e automação
✅ **Escalabilidade**: Arquitetura preparada para crescimento
✅ **Segurança**: Implementação robusta de segurança e auditoria
✅ **Mobile-First**: Experiência mobile otimizada
✅ **Real-time**: Funcionalidades em tempo real

### **Próximos Passos Recomendados**
1. **Performance Optimization**: Otimizar queries e carregamento
2. **Mobile App**: Desenvolvimento de app nativo
3. **AI Enhancement**: Expandir funcionalidades de IA
4. **Internationalization**: Suporte multi-idioma completo
5. **Advanced Analytics**: Dashboard analítico mais robusto
6. **Integration Hub**: Integrações com terceiros (Zoom, YouTube, etc.)

---

**Documento gerado em**: 2025-01-07
**Versão do Sistema**: 1.0.0
**Última Atualização**: Janeiro 2025